(function initAfrickeKoprivySyncPhotoCore(global) {
  "use strict";

  const PHOTO_MODEL_VERSION = 2;
  const COLLECTIONS = ["customers", "orders", "varieties", "crosses", "offers", "exchangeRates"];

  function clean(value) {
    return String(value ?? "").trim();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  function unique(values) {
    return [...new Set((values || []).map(clean).filter(Boolean))];
  }

  function normalizedName(value) {
    return clean(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("cs-CZ")
      .replace(/\s+/g, " ");
  }

  function timestamp(value) {
    const parsed = Date.parse(clean(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function recordTimestamp(record = {}) {
    return Math.max(
      timestamp(record.updatedAt),
      timestamp(record.deletedAt),
      timestamp(record.createdAt),
      timestamp(record.date),
      timestamp(record.orderDate),
    );
  }

  function recordScore(record = {}) {
    try {
      return JSON.stringify(record).length;
    } catch {
      return 0;
    }
  }

  function newerRecord(localRecord, cloudRecord) {
    if (!localRecord) return cloudRecord;
    if (!cloudRecord) return localRecord;
    const localTime = recordTimestamp(localRecord);
    const cloudTime = recordTimestamp(cloudRecord);
    if (localTime !== cloudTime) return localTime > cloudTime ? localRecord : cloudRecord;
    return recordScore(localRecord) >= recordScore(cloudRecord) ? localRecord : cloudRecord;
  }

  function photoList(mainPhoto, gallery) {
    return unique([mainPhoto, ...(Array.isArray(gallery) ? gallery : [])]);
  }

  function setPhotoList(owner, mainKey, galleryKey, photos) {
    const next = unique(photos);
    owner[mainKey] = next[0] || "";
    owner[galleryKey] = next.slice(1);
  }

  function trashTarget(entry = {}) {
    const payload = entry && typeof entry.payload === "object" ? entry.payload : {};
    const type = clean(entry.type);
    if (type === "variety") return { collection: "varieties", id: clean(payload.variety?.id) };
    if (type === "cross") return { collection: "crosses", id: clean(payload.cross?.id) };
    if (type === "offer") return { collection: "offers", id: clean(payload.offer?.id) };
    if (type === "offer-item") {
      const offerId = clean(payload.offerId);
      const itemId = clean(payload.item?.id);
      return offerId && itemId ? { collection: "offerItems", id: `${offerId}:${itemId}` } : null;
    }
    if (type === "order") return { collection: "orders", id: clean(payload.order?.id) };
    if (type === "customer-bundle") return { collection: "customers", id: clean(payload.customer?.id) };
    return null;
  }

  function normalizeTombstone(entry = {}) {
    return {
      collection: clean(entry.collection),
      id: clean(entry.id),
      deletedAt: clean(entry.deletedAt),
    };
  }

  function collectTombstones(data = {}) {
    const result = [];
    for (const entry of Array.isArray(data.syncTombstones) ? data.syncTombstones : []) {
      const normalized = normalizeTombstone(entry);
      if (normalized.collection && normalized.id && normalized.deletedAt) result.push(normalized);
    }
    for (const entry of Array.isArray(data.trash) ? data.trash : []) {
      const target = trashTarget(entry);
      if (target?.collection && target.id && clean(entry.deletedAt)) {
        result.push({ ...target, deletedAt: clean(entry.deletedAt) });
      }
    }
    const byKey = new Map();
    for (const entry of result) {
      const key = `${entry.collection}:${entry.id}`;
      const existing = byKey.get(key);
      if (!existing || timestamp(entry.deletedAt) > timestamp(existing.deletedAt)) byKey.set(key, entry);
    }
    return [...byKey.values()];
  }

  function canonicalizePhotoLinks(input = {}) {
    const data = input;
    const varieties = Array.isArray(data.varieties) ? data.varieties : (data.varieties = []);
    const crosses = Array.isArray(data.crosses) ? data.crosses : (data.crosses = []);
    const offers = Array.isArray(data.offers) ? data.offers : (data.offers = []);
    const byId = new Map(varieties.map((item) => [clean(item.id), item]).filter(([id]) => id));
    const byName = new Map(varieties.map((item) => [normalizedName(item.name), item]).filter(([name]) => name));

    for (const cross of crosses) {
      const linked = byId.get(clean(cross.linkedVarietyId)) || byName.get(normalizedName(cross.seedlingName || cross.name));
      if (!linked) {
        cross.photoSource = "cross";
        continue;
      }
      cross.linkedVarietyId = clean(linked.id);
      const varietyPhotos = photoList(linked.photoUrl, linked.gallery);
      const crossPhotos = photoList(cross.seedlingPhotoUrl || cross.photoUrl, cross.seedlingGallery || cross.gallery);
      // Older app versions kept a second copy of the same photos on the cross.
      // Only let that copy replace the variety when it is genuinely newer.
      if (crossPhotos.length && (!varietyPhotos.length || recordTimestamp(cross) > recordTimestamp(linked))) {
        setPhotoList(linked, "photoUrl", "gallery", crossPhotos);
        linked.updatedAt = clean(cross.updatedAt) || clean(linked.updatedAt);
      }
      cross.seedlingPhotoUrl = "";
      cross.seedlingGallery = [];
      cross.photoSource = "variety";
    }

    for (const offer of offers) {
      for (const item of Array.isArray(offer.items) ? offer.items : []) {
        const linked = byId.get(clean(item.varietyId)) || byName.get(normalizedName(item.varietyName || item.name));
        if (!linked) {
          item.photoSource = "offer";
          continue;
        }
        item.varietyId = clean(linked.id);
        item.varietyName = clean(linked.name) || clean(item.varietyName || item.name);
        const ownPhoto = clean(item.photoUrl);
        const itemTime = Math.max(recordTimestamp(item), recordTimestamp(offer));
        if (ownPhoto && (!photoList(linked.photoUrl, linked.gallery).length || itemTime > recordTimestamp(linked))) {
          setPhotoList(linked, "photoUrl", "gallery", [ownPhoto]);
          linked.updatedAt = clean(item.updatedAt) || clean(offer.updatedAt) || clean(linked.updatedAt);
        }
        item.photoUrl = "";
        item.photoSource = "variety";
      }
    }

    data.photoModelVersion = PHOTO_MODEL_VERSION;
    return data;
  }

  function mergeCollection(localItems, cloudItems) {
    const merged = new Map();
    for (const item of Array.isArray(cloudItems) ? cloudItems : []) {
      const id = clean(item?.id);
      if (id) merged.set(id, item);
    }
    for (const item of Array.isArray(localItems) ? localItems : []) {
      const id = clean(item?.id);
      if (id) merged.set(id, newerRecord(item, merged.get(id)));
    }
    return [...merged.values()];
  }

  function mergeTrash(localTrash, cloudTrash) {
    return mergeCollection(localTrash, cloudTrash);
  }

  function offerWithItemTimes(offer = {}) {
    const parentUpdatedAt = clean(offer.updatedAt);
    return {
      ...offer,
      items: (Array.isArray(offer.items) ? offer.items : []).map((item) => ({
        ...item,
        updatedAt: clean(item.updatedAt) || parentUpdatedAt,
      })),
    };
  }

  function mergeOffers(localOffers, cloudOffers, tombstones) {
    const localById = new Map((Array.isArray(localOffers) ? localOffers : []).map((offer) => [clean(offer?.id), offerWithItemTimes(offer)]).filter(([id]) => id));
    const cloudById = new Map((Array.isArray(cloudOffers) ? cloudOffers : []).map((offer) => [clean(offer?.id), offerWithItemTimes(offer)]).filter(([id]) => id));
    const ids = new Set([...localById.keys(), ...cloudById.keys()]);
    const result = [];
    for (const id of ids) {
      const localOffer = localById.get(id);
      const cloudOffer = cloudById.get(id);
      const winner = clone(newerRecord(localOffer, cloudOffer) || {});
      winner.items = mergeCollection(localOffer?.items, cloudOffer?.items).filter((item) => {
        const tombstone = tombstones.get(`offerItems:${id}:${clean(item.id)}`);
        return !tombstone || recordTimestamp(item) > timestamp(tombstone.deletedAt);
      });
      result.push(winner);
    }
    return result;
  }

  function mergeData(localInput = {}, cloudInput = {}) {
    const local = clone(localInput);
    const cloud = clone(cloudInput);
    const result = { ...cloud, ...local };
    for (const collection of COLLECTIONS) {
      result[collection] = mergeCollection(local[collection], cloud[collection]);
    }
    result.trash = mergeTrash(local.trash, cloud.trash);
    result.syncTombstones = collectTombstones({
      syncTombstones: [
        ...(Array.isArray(cloud.syncTombstones) ? cloud.syncTombstones : []),
        ...(Array.isArray(local.syncTombstones) ? local.syncTombstones : []),
      ],
      trash: result.trash,
    });

    const tombstones = new Map(result.syncTombstones.map((entry) => [`${entry.collection}:${entry.id}`, entry]));
    result.offers = mergeOffers(local.offers, cloud.offers, tombstones);
    for (const collection of COLLECTIONS) {
      result[collection] = result[collection].filter((record) => {
        const tombstone = tombstones.get(`${collection}:${clean(record.id)}`);
        return !tombstone || recordTimestamp(record) > timestamp(tombstone.deletedAt);
      });
    }
    result.trash = result.trash.filter((entry) => {
      const target = trashTarget(entry);
      if (!target) return true;
      const active = (result[target.collection] || []).find((record) => clean(record.id) === target.id);
      return !active || recordTimestamp(active) <= timestamp(entry.deletedAt);
    });
    result.settings = newerRecord(local.settings, cloud.settings) === local.settings
      ? { ...(cloud.settings || {}), ...(local.settings || {}) }
      : { ...(local.settings || {}), ...(cloud.settings || {}) };
    return canonicalizePhotoLinks(result);
  }

  function offerItemPhoto(item = {}, data = {}) {
    const varieties = Array.isArray(data.varieties) ? data.varieties : [];
    const linked = varieties.find((variety) => clean(variety.id) === clean(item.varietyId))
      || varieties.find((variety) => normalizedName(variety.name) === normalizedName(item.varietyName || item.name));
    return clean(linked?.photoUrl) || clean(item.photoUrl);
  }

  function crossPhoto(cross = {}, data = {}) {
    const varieties = Array.isArray(data.varieties) ? data.varieties : [];
    const linked = varieties.find((variety) => clean(variety.id) === clean(cross.linkedVarietyId))
      || varieties.find((variety) => normalizedName(variety.name) === normalizedName(cross.seedlingName || cross.name));
    return clean(linked?.photoUrl) || clean(cross.seedlingPhotoUrl || cross.photoUrl);
  }

  function addPermanentTombstone(data = {}, collection, id, deletedAt = new Date().toISOString()) {
    if (!clean(collection) || !clean(id)) return;
    if (!Array.isArray(data.syncTombstones)) data.syncTombstones = [];
    data.syncTombstones = collectTombstones({
      syncTombstones: [...data.syncTombstones, { collection: clean(collection), id: clean(id), deletedAt: clean(deletedAt) }],
      trash: data.trash,
    });
  }

  function addTrashTombstones(data = {}, entries = []) {
    for (const entry of entries || []) {
      const target = trashTarget(entry);
      if (target?.collection && target.id) addPermanentTombstone(data, target.collection, target.id, clean(entry.deletedAt) || new Date().toISOString());
      if (clean(entry?.type) === "customer-bundle") {
        for (const order of entry?.payload?.orders || []) {
          if (clean(order?.id)) addPermanentTombstone(data, "orders", order.id, clean(entry.deletedAt) || new Date().toISOString());
        }
      }
    }
  }

  global.AKSyncPhotoCore = Object.freeze({
    PHOTO_MODEL_VERSION,
    addPermanentTombstone,
    addTrashTombstones,
    canonicalizePhotoLinks,
    clone,
    collectTombstones,
    crossPhoto,
    mergeData,
    offerItemPhoto,
    recordTimestamp,
  });
})(globalThis);
