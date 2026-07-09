const STORE_KEY = "africke-koprivy-data-v11";
const LEGACY_STORE_KEYS = ["africke-koprivy-data-v10", "africke-koprivy-data-v9", "africke-koprivy-data-v8", "africke-koprivy-data-v7"];
const SEED_SIGNATURE = window.AFRICKE_KOPRIVY_SEED_SIGNATURE || "";
const SEED_SIGNATURE_KEY = `${STORE_KEY}:seed-signature`;
const PHOTO_DB_NAME = "africke-koprivy-photos";
const PHOTO_BLOB_STORE = "photos";
const SUPABASE_SYNC_CONFIG_KEY = `${STORE_KEY}:supabase-sync-config`;
const SUPABASE_SYNC_SESSION_KEY = `${STORE_KEY}:supabase-sync-session`;
const SUPABASE_SYNC_PASSWORD_KEY = `${STORE_KEY}:supabase-sync-password`;
const SUPABASE_SYNC_DIRTY_KEY = `${STORE_KEY}:sync-dirty-at`;
const SUPABASE_SYNC_LAST_LOCAL_SNAPSHOT_KEY = `${STORE_KEY}:supabase-sync-last-local-snapshot`;
const SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY = `${STORE_KEY}:supabase-sync-last-cloud-snapshot`;
const SUPABASE_SYNC_BUCKET = "africke-koprivy-fotky";
const DEFAULT_SUPABASE_URL = "https://gqlpdvdrlcsibmyttmwt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_40A8Vvi-vd3IPimbEZlDiQ_Uo_5Cp0n";
const LEGACY_MANAGED_SUPABASE_URLS = ["https://nexthiehxcksrnydepnv.supabase.co"];
const SUPABASE_PHOTO_PREFIX = "supabase-photo:";
const SUPABASE_THUMB_DIR = "_nahledy_v2";
const SUPABASE_THUMB_MAX_SIZE = 520;
const SUPABASE_THUMB_QUALITY = 0.82;
const PHOTO_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PHOTO_MAX_UPLOAD_EDGE = 3200;
const PHOTO_UPLOAD_QUALITY_STEPS = [0.9, 0.86, 0.82, 0.78, 0.74];
const FACEBOOK_PHOTO_BATCH_SIZE = 12;
const SUPABASE_PHOTO_CACHE_PREFIX = "supabase-cache:";
const SUPABASE_PREPARED_PHOTO_CACHE_PREFIX = "supabase-prepared-cache:";
const SUPABASE_LOCAL_ORIGINAL_PREFIX = "supabase-local-original:";
const MOBILE_ORIGINALS_FOLDER_HANDLE_ID = "mobile-originals-folder-handle";
const MOBILE_ORIGINALS_FOLDER_COUNT_ID = "mobile-originals-folder-count";
const SUPABASE_PHOTO_CACHE_MAX_BYTES = 300 * 1024 * 1024;
const SUPABASE_PHOTO_CACHE_MAX_ITEMS = 1200;
const SUPABASE_PHOTO_CACHE_MAX_SINGLE_BYTES = 12 * 1024 * 1024;
const AUTO_PULL_INTERVAL_MS = 2 * 60 * 1000;
const AUTO_PULL_MIN_GAP_MS = 30 * 1000;
const SUPABASE_PHOTO_LAZY_MARGIN_PX = 600;
const SUPABASE_PHOTO_OBSERVER_ROOT_MARGIN = "600px 0px";
const FACEBOOK_ITEMS_TOKEN = "{{ODREZKY}}";
const FACEBOOK_DATE_TOKEN = "{{DATUM}}";
const INDEXED_PHOTO_PREFIX = "indexed-photo:";
const BRAND_LOGO_IMAGE_DATA_URI = clean(window.AFRICKE_KOPRIVY_BRAND_LOGO_DATA_URI || "");

const photoRuntime = {
  observer: null,
  deferredLoads: new WeakMap(),
  repairingRefs: new Set(),
};

const stageLabels = { opyleno: "Opyleno", vyseto: "Vyseto", roste: "Roste", hotovo: "Hotovo" };
const stageIcons = { opyleno: "âś¦", vyseto: "đźŚ±", roste: "đźŚż", hotovo: "âś“" };
const ratingLabels = { krasna: "KrĂˇsnĂˇ", hnusna: "HnusnĂˇ", nejista: "NejistĂˇ" };
const statusLabels = { "novĂˇ": "NovĂˇ", "pĹ™ipraveno": "PĹ™ipravenĂˇ", "odeslĂˇno": "OdeslanĂˇ", zaplaceno: "VyĹ™Ă­zenĂˇ" };

const state = {
  view: "offers",
  query: "",
  filter: "all",
  winteringSeason: "",
  syncPassword: localStorage.getItem(SUPABASE_SYNC_PASSWORD_KEY) || sessionStorage.getItem(`${STORE_KEY}:sync-password`) || "",
  syncTimer: null,
  syncDirty: false,
  syncRunning: false,
  syncRevision: 0,
  syncVerifiedPassword: "",
  syncProblem: "",
  lastAutoPullAt: 0,
  installPromptEvent: null,
  data: loadData(),
  photoUrls: new Map(),
  sheetStack: [],
  currentSheetRestore: null,
  activeOfferId: "",
  facebookDraftTextByOffer: new Map(),
  facebookPhotoOffsetByOffer: new Map(),
  mobileOriginalsStatusToken: 0,
};

const els = {
  todayLine: document.querySelector("#todayLine"),
  search: document.querySelector("#searchInput"),
  filterRow: document.querySelector("#filterRow"),
  summary: document.querySelector("#viewSummary"),
  list: document.querySelector("#cardList"),
  sheet: document.querySelector("#sheetHost"),
  syncIndicator: document.querySelector("#syncIndicator"),
  installAppBtn: document.querySelector("#installAppBtn"),
  scrollTopBtn: document.querySelector("#scrollTopBtn"),
  toast: document.querySelector("#toast"),
};

init();

function init() {
  migrateSyncConfig();
  window.__akPrepareFacebookOffer = (id) => prepareFacebookOffer(id || state.activeOfferId);
  if (els.todayLine) els.todayLine.textContent = new Intl.DateTimeFormat("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  if (syncFinishedCrossVarieties()) saveData({ skipAutoSync: true });
  if (reconcileOfferItemVarietyLinks(state.data)) saveData();
  if (hasLocalOnlyPhotoRefs(state.data)) markSyncDirty();
  document.addEventListener("click", handleGlobalClick, true);
  document.addEventListener("change", handleGlobalChange, true);
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => openView(button.dataset.view)));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => runAction(button.dataset.action)));
  els.search.addEventListener("input", () => {
    state.query = els.search.value;
    render();
  });
  window.addEventListener("focus", () => maybeAutoPull({ force: true }));
  window.addEventListener("pageshow", () => maybeAutoPull({ force: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") maybeAutoPull({ force: true });
  });
  window.addEventListener("scroll", syncScrollTopButton, { passive: true });
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
  els.installAppBtn?.addEventListener("click", installPwaApp);
  els.scrollTopBtn?.addEventListener("click", scrollToTop);
  window.setInterval(() => maybeAutoPull(), AUTO_PULL_INTERVAL_MS);
  if (!isSyncLoggedIn() || needsSyncRecovery()) state.view = "sync";
  render();
  if (hasPendingSync()) {
    state.syncDirty = true;
    scheduleAutoSync();
  } else {
    maybeAutoPull({ force: true });
  }
}

function syncMobileListChrome() {
  if (els.list) els.list.dataset.view = state.view;
  document.body.dataset.mobileView = state.view;
  syncScrollTopButton();
}

function syncScrollTopButton() {
  if (!els.scrollTopBtn) return;
  els.scrollTopBtn.hidden = !(window.scrollY > 520 && state.view !== "sync");
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleGlobalChange(event) {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (target?.matches?.("[data-mobile-wintering-season-select]")) {
    setSelectedWinteringSeason(target.value, { persistCurrent: false });
  }
}

function handleGlobalClick(event) {
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  const nextWinteringButton = target?.closest("[data-mobile-next-wintering-season]");
  if (nextWinteringButton) {
    event.preventDefault();
    event.stopPropagation();
    createNextWinteringSeason();
    return;
  }
  const facebookButton = target?.closest("[data-prepare-facebook-offer]");
  if (facebookButton) {
    event.preventDefault();
    event.stopPropagation();
    prepareFacebookOffer(facebookButton.dataset.prepareFacebookOffer || state.activeOfferId);
    return;
  }
  const copyFacebookButton = target?.closest("[data-copy-facebook-offer]");
  if (copyFacebookButton) {
    event.preventDefault();
    event.stopPropagation();
    copyPreparedFacebookText();
    return;
  }
  const saveFacebookButton = target?.closest("[data-save-facebook-template]");
  if (saveFacebookButton) {
    event.preventDefault();
    event.stopPropagation();
    savePreparedFacebookText();
    return;
  }
  const shareFacebookButton = target?.closest("[data-share-facebook-offer]");
  if (shareFacebookButton) {
    event.preventDefault();
    event.stopPropagation();
    shareFacebookOffer(shareFacebookButton.dataset.shareFacebookOffer, shareFacebookButton);
    return;
  }
  const facebookZipButton = target?.closest("[data-download-facebook-zip]");
  if (facebookZipButton) {
    event.preventDefault();
    event.stopPropagation();
    downloadFacebookOfferZip(facebookZipButton.dataset.downloadFacebookZip, facebookZipButton);
    return;
  }
  const addOfferItemButton = target?.closest("[data-add-offer-item]");
  if (addOfferItemButton) {
    event.preventDefault();
    event.stopPropagation();
    openOfferItemSheet(addOfferItemButton.dataset.addOfferItem || state.activeOfferId);
  }
}

function openView(view) {
  if ((!isSyncLoggedIn() || needsSyncRecovery()) && view !== "sync") {
    state.view = "sync";
    render();
    toast(isSyncLoggedIn() ? "Nejdřív stáhni data z cloudu." : "Nejdřív se přihlas.");
    return;
  }
  state.view = view;
  state.filter = "all";
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  els.search.value = "";
  state.query = "";
  closeSheet({ all: true });
  render();
}

function runAction(action) {
  const stableOpenOrderSheet = globalThis.__akOpenOrderSheetFinal || openOrderSheet;
  if (action === "new-customer") return openCustomerSheet();
  if (action === "new-order") return stableOpenOrderSheet();
  if (action === "new-variety") return openVarietySheet();
  if (action === "new-cross") return openCrossSheet();
  if (action === "new-offer") return openOfferSheet();
  if (action === "new-rest-offer") return openOfferSheet("", { type: "rests" });
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  state.installPromptEvent = event;
  if (els.installAppBtn) els.installAppBtn.hidden = false;
}

function handleAppInstalled() {
  state.installPromptEvent = null;
  if (els.installAppBtn) els.installAppBtn.hidden = true;
  toast("Appka je nainstalovanĂˇ.");
}

async function installPwaApp() {
  if (!state.installPromptEvent) {
    toast("Instalace se objevĂ­ aĹľ po otevĹ™enĂ­ z HTTPS odkazu v Chrome.");
    return;
  }
  const promptEvent = state.installPromptEvent;
  state.installPromptEvent = null;
  promptEvent.prompt();
  const result = await promptEvent.userChoice.catch(() => null);
  if (result?.outcome === "accepted" && els.installAppBtn) els.installAppBtn.hidden = true;
}

function render() {
  const loggedIn = isSyncLoggedIn();
  const recoveryMode = needsSyncRecovery();
  if (!loggedIn || recoveryMode) state.view = "sync";
  document.body.classList.toggle("private-locked", !loggedIn || recoveryMode);
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  renderFilters();
  renderSummary();
  const viewRenderers = {
    offers: renderOffers,
    orders: renderOrders,
    customers: renderCustomers,
    varieties: renderVarieties,
    crosses: renderCrosses,
    sync: renderSync,
  };
  els.list.innerHTML = viewRenderers[state.view]?.() || "";
  syncMobileListChrome();
  bindListActions();
  resolvePhotos(els.list);
  updateSyncIndicator();
}

function renderCardPill(pill) {
  if (!pill) return "";
  if (typeof pill === "object") {
    return `<span class="pill ${escapeHtml(clean(pill.className))}">${escapeHtml(clean(pill.label))}</span>`;
  }
  return `<span class="pill">${escapeHtml(String(pill))}</span>`;
}

function renderSummary() {
  const summary = {
    offers: ["NabĂ­dky", `${state.data.offers.length} nabĂ­dek`, "Rychle vytvoĹ™Ă­Ĺˇ nabĂ­dku a rezervace."],
    orders: ["ObjednĂˇvky", `${state.data.orders.length} objednĂˇvek`, "Platby, doprava a text zĂˇkaznĂ­kovi po ruce."],
    customers: ["ZĂˇkaznĂ­ci", `${state.data.customers.length} kontaktĹŻ`, ""],
    varieties: ["OdrĹŻdy", `${state.data.varieties.length} odrĹŻd`, "Fotky a ceny v KÄŤ."],
    crosses: ["KĹ™Ă­ĹľenĂ­", `${state.data.crosses.length} zĂˇznamĹŻ`, ""],
    sync: ["NastavenĂ­", loadSyncConfig().autoSync ? "Sync zapnutĂ˝" : "Sync vypnutĂ˝", "SoukromĂ˝ cloud, fotky a zĂˇkladnĂ­ nastavenĂ­ aplikace."],
  }[state.view] || ["PĹ™ehled", "", ""];
  els.summary.innerHTML = `<div><span>${escapeHtml(summary[0])}</span><strong>${escapeHtml(summary[1])}</strong></div>${summary[2] ? `<p>${escapeHtml(summary[2])}</p>` : ""}`;
}

function renderFilters() {
  const filters = {
    offers: [],
    orders: [["all", "VĹˇe"], ["todo", "K Ĺ™eĹˇenĂ­"], ["done", "Hotovo"]],
    customers: [["all", "VĹˇe"], ["cz", "ÄŚesko"], ["foreign", "ZahraniÄŤĂ­"]],
    varieties: [["all", "VĹˇe"], ["active", "AktivnĂ­"], ["photo", "S fotkou"]],
    crosses: [],
    sync: [],
  }[state.view] || [];
  if (!filters.some(([value]) => value === state.filter)) state.filter = "all";
  els.filterRow.innerHTML = filters.map(([value, label]) => `<button class="chip-button ${state.filter === value ? "active" : ""}" type="button" data-filter="${value}">${label}</button>`).join("");
  els.filterRow.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      render();
    });
  });
}

function renderOffers() {
  const offers = state.data.offers.filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
  const groups = splitOffersByType(offers);
  const renderOfferGroup = (label, items) => {
    if (!items.length) return "";
    return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
      const items = sortedOfferItems(offer);
      const reserved = offerReservedCount(offer);
      const total = offerTotalCount(offer);
      const available = offerAvailableCount(offer);
      const alternates = offerAlternateCount(offer);
      const coverImage = items.map((item) => offerItemImage(item)).find(Boolean) || "";
      const itemPills = items.slice(0, 4).map((item) => `đźŚż ${offerItemName(item)}`);
      if (items.length > 4) itemPills.push(`+${items.length - 4} dalĹˇĂ­`);
      return card({
        id: offer.id,
        type: "offer",
        title: offer.title,
      sub: `${formatDate(offer.date)} Â· ${offerTypeLabel(offer)} Â· ${offer.status}`,
      pills: [...itemPills, `VolnĂ© ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `NĂˇhradnĂ­ci ${alternates}` : ""],
      badges: isRestOffer(offer) ? [{ label: "Resty/poznĂˇmky", className: "warn" }] : [],
      thumb: coverImage,
      thumbText: initials(offer.title),
      actions: [["facebook-offer", "FB"], ["edit-offer", "âśŽ"], ["delete-offer", "Ă—"]],
    });
    }).join("")}`;
  };
  return [
    renderOfferGroup("NabĂ­dky", groups.offers),
    renderOfferGroup("Resty/poznĂˇmky", groups.rests),
  ].filter(Boolean).join("");
}

function renderOrders() {
  const orders = state.data.orders.filter(matchOrder).sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)));
  if (!orders.length) return empty("Ĺ˝ĂˇdnĂ© objednĂˇvky.");
  return orders.map((order) => {
    const customer = findCustomer(order.customerId);
    const tone = order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus)
      ? "done"
      : order.paymentStatus === "zaplaceno"
        ? "progress"
        : "attention";
    return card({
      id: order.id,
      type: "order",
      tone,
      title: compactName(customerName(customer) || "Bez zĂˇkaznĂ­ka"),
      sub: [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" Â· "),
      price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
      pills: [
        ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => `đźŚż ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`),
        ...orderOfferAlternateEntries(order).map((item) => ({ label: `âš  NĂˇhradnĂ­k: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
      ],
      badges: [paymentPill(order), statusPill(order), orderPaymentTextPill(order)],
      actions: [["copy-order", "đź“‹"], ["toggle-order-text-sent", clean(order.paymentTextSentAt) ? "âś“Txt" : "Txt"], ["edit-order", "âśŽ"], ["delete-order", "Ă—"]],
    });
  }).join("");
}

function renderCustomers() {
  const customers = state.data.customers.filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
  if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
  return customers.map((customer) => card({
    id: customer.id,
    type: "customer",
    title: customerName(customer),
    sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>"),
    pills: customer.tags || [],
    actions: [["order-customer", "+"], ["edit-customer", "âśŽ"], ["delete-customer", "Ă—"]],
  })).join("");
}

function renderVarieties() {
  const varieties = state.data.varieties
    .filter(matchVariety)
    .sort((a, b) => {
      if (state.filter === "newest") return String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || "")) || naturalCompare(a.name, b.name);
      return naturalCompare(a.name, b.name);
    });
  if (!varieties.length) return empty("Ĺ˝ĂˇdnĂ© odrĹŻdy.");
  return varieties.map((variety) => card({
    id: variety.id,
    type: "variety",
    title: `đźŚż ${variety.name}`,
    sub: `${varietyImages(variety).length ? `${varietyImages(variety).length} fotek` : "Bez fotky"} Â· ${varietyUsageCount(variety.name)} zĂˇznamĹŻ`,
    price: variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny",
    thumb: varietyImages(variety)[0],
    thumbText: initials(variety.name),
    pills: [variety.active === false ? "NeaktivnĂ­" : "âś… AktivnĂ­"],
    actions: [["edit-variety", "âśŽ"], ["delete-variety", "Ă—"]],
  })).join("");
}

function renderCrosses() {
  const crosses = state.data.crosses.filter(matchCross).sort((a, b) => String(b.pollinatedAt).localeCompare(String(a.pollinatedAt)));
  if (!crosses.length) return empty("Ĺ˝ĂˇdnĂˇ kĹ™Ă­ĹľenĂ­.");
  return crosses.map((cross) => {
    const tone = cross.resultRating === "hnusna" ? "reject" : cross.stage === "hotovo" ? "done" : "attention";
    return card({
      id: cross.id,
      type: "cross",
      tone,
      title: crossLineage(cross),
      sub: cross.seedlingName || "",
      thumb: crossSeedlingImages(cross)[0],
      thumbText: initials(crossLineage(cross)),
      pills: [crossStageText(cross.stage), ratingLabels[cross.resultRating] ? `âś… ${ratingLabels[cross.resultRating]}` : "Bez hodnocenĂ­", cross.seedlingName || "â€”"],
      actions: [["download-cross", "â–Ł"], ["edit-cross", "âśŽ"], ["delete-cross", "Ă—"]],
    });
  }).join("");
}

function renderSync() {
  const config = loadSyncConfig();
  const session = loadSyncSession();
  const loggedIn = Boolean(session.accessToken || session.refreshToken);
  const settings = appSettings();
  const loginFields = loggedIn
    ? ""
    : `<label class="field"><span>Email</span><input id="syncEmail" type="email" value="${escapeHtml(config.email)}" autocomplete="email"></label>
    <label class="field"><span>Heslo k ĂşÄŤtu</span><input id="syncLoginPassword" type="password" autocomplete="current-password"></label>
    <label class="field"><span>Ĺ ifrovacĂ­ heslo</span><input id="syncPassword" type="password" value="${escapeHtml(state.syncPassword)}" placeholder="nesmĂ­ se ztratit"></label>`;
  return `<section class="sync-card">
    <strong class="title">SoukromĂˇ appka</strong>
    <p class="sub">${loggedIn ? "PĹ™ihlĂˇĹˇeno. Sync bÄ›ĹľĂ­ automaticky na pozadĂ­." : "Po pĹ™ihlĂˇĹˇenĂ­ se ukĂˇĹľe obsah appky. Sync bÄ›ĹľĂ­ ĂşspornÄ›."}</p>
    <input id="syncUrl" type="hidden" value="${escapeHtml(config.url)}">
    <input id="syncAnon" type="hidden" value="${escapeHtml(config.anonKey)}">
    ${loginFields}
    <div class="two">
      ${loggedIn ? `<button class="button" type="button" id="syncLogout">OdhlĂˇsit</button>` : `<button class="button primary" type="button" id="syncLogin">PĹ™ihlĂˇsit</button>`}
    </div>
    <small class="sub">${loggedIn ? "Obsah je odemÄŤenĂ˝." : "Obsah se zobrazĂ­ aĹľ po pĹ™ihlĂˇĹˇenĂ­."}</small>
  </section>
  <section class="sync-card">
    <strong class="title">Poplatky</strong>
    <div class="two">
      <label class="field"><span>ZĂˇsilkovna ÄŚR</span><input id="settingShippingCz" inputmode="decimal" value="${escapeHtml(settings.shippingFeeCz)}"></label>
      <label class="field"><span>ZĂˇsilkovna SK</span><input id="settingShippingSk" inputmode="decimal" value="${escapeHtml(settings.shippingFeeSk)}"></label>
    </div>
    <div class="two">
      <label class="field"><span>BalĂ­kovna</span><input id="settingPostal" inputmode="decimal" value="${escapeHtml(settings.postalFee)}"></label>
      <label class="field"><span>BalnĂ©</span><input id="settingPacking" inputmode="decimal" value="${escapeHtml(settings.packingFee)}"></label>
    </div>
    <div class="two">
      <label class="field"><span>ZĂˇsilkovna na adresu ÄŚR</span><input id="settingShippingAddressCz" inputmode="decimal" value="${escapeHtml(settings.shippingFeeAddressCz)}"></label>
      <label class="field"><span>ZĂˇsilkovna na adresu Slovensko</span><input id="settingShippingAddressSk" inputmode="decimal" value="${escapeHtml(settings.shippingFeeAddressSk)}"></label>
    </div>
    <div class="two">
      <label class="field"><span>DobĂ­rka ÄŚR</span><input id="settingCodCz" inputmode="decimal" value="${escapeHtml(settings.codFeeCz)}"></label>
      <label class="field"><span>DobĂ­rka Slovensko</span><input id="settingCodSk" inputmode="decimal" value="${escapeHtml(settings.codFeeSk)}"></label>
    </div>
    <strong class="title small-title">Platba pro zĂˇkaznĂ­ka</strong>
    <label class="field"><span>JmĂ©no a pĹ™Ă­jmenĂ­</span><input id="settingPaymentName" value="${escapeHtml(settings.paymentAccountName)}"></label>
    <label class="field"><span>ÄŚĂ­slo ĂşÄŤtu</span><input id="settingPaymentAccount" value="${escapeHtml(settings.paymentAccountNumber)}"></label>
    <label class="field"><span>IBAN</span><input id="settingPaymentIban" value="${escapeHtml(settings.paymentIban)}"></label>
    <label class="field"><span>SWIFT / BIC</span><input id="settingPaymentSwift" value="${escapeHtml(settings.paymentSwift)}"></label>
    <button class="button primary" type="button" id="saveAppSettings">UloĹľit nastavenĂ­</button>
  </section>`;
}

function card({ id, type, tone = "", title, sub = "", price = "", pills = [], badges = [], actions = [], thumb = "", thumbText = "" }) {
  const thumbRef = thumbPreviewRef(thumb);
  const thumbHtml = thumb || thumbText ? `<span class="thumb">${thumb ? `<img data-photo-ref="${escapeHtml(thumbRef)}" alt="">` : escapeHtml(thumbText)}</span>` : "";
  return `<article class="card card-${escapeHtml(type)} ${tone} ${badges.length ? "has-status" : ""}" data-card="${type}" data-id="${escapeHtml(id)}">
    ${badges.length ? `<div class="status-badges">${badges.filter(Boolean).map(renderCardPill).join("")}</div>` : ""}
    <div class="card-row">
      ${thumbHtml}
      <div class="card-main">
        <strong class="title">${title}</strong>
        ${sub ? `<span class="sub">${sub}</span>` : ""}
      </div>
    </div>
    ${price ? `<strong class="price">${escapeHtml(price)}</strong>` : ""}
    ${pills.length ? `<div class="pill-row">${pills.filter(Boolean).map(renderCardPill).join("")}</div>` : ""}
    ${actions.length ? `<div class="card-actions">${actions.map(([action, label]) => `<button class="round" type="button" data-action-row="${action}" data-id="${escapeHtml(id)}">${label}</button>`).join("")}</div>` : ""}
  </article>`;
}

function bindListActions() {
  els.list.querySelectorAll("[data-card]").forEach((cardEl) => {
    cardEl.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      const type = cardEl.dataset.card;
      const id = cardEl.dataset.id;
      const stableOpenOrderSheet = globalThis.__akOpenOrderSheetFinal || openOrderSheet;
      if (type === "customer") openCustomerSheet(id);
      if (type === "order") stableOpenOrderSheet(id);
      if (type === "variety") openVarietyDetailSheet(id);
      if (type === "cross") openCrossDetailSheet(id);
      if (type === "offer") openOfferDetailSheet(id);
    });
  });
  els.list.querySelectorAll("[data-action-row]").forEach((button) => button.addEventListener("click", () => handleRowAction(button.dataset.actionRow, button.dataset.id)));
  document.querySelector("#syncLogin")?.addEventListener("click", loginSync);
  document.querySelector("#syncLogout")?.addEventListener("click", logoutSync);
  document.querySelector("#syncPush")?.addEventListener("click", () => pushSync());
  document.querySelector("#syncPull")?.addEventListener("click", () => pullSync());
  document.querySelector("#syncAuto")?.addEventListener("click", toggleAutoSync);
  ["syncUrl", "syncAnon", "syncEmail", "syncPassword"].forEach((id) => document.querySelector(`#${id}`)?.addEventListener("input", saveSyncConfigFromInputs));
  document.querySelector("#saveAppSettings")?.addEventListener("click", saveAppSettingsFromInputs);
}

function handleRowAction(action, id) {
  const stableOpenOrderSheet = globalThis.__akOpenOrderSheetFinal || openOrderSheet;
  if (action === "edit-customer") return openCustomerSheet(id);
  if (action === "order-customer") return stableOpenOrderSheet(null, id);
  if (action === "delete-customer") return deleteItem("customers", id, "ZĂˇkaznĂ­ka");
  if (action === "edit-order") return stableOpenOrderSheet(id);
  if (action === "delete-order") return deleteItem("orders", id, "ObjednĂˇvku");
  if (action === "copy-order") return copyOrderText(id);
  if (action === "toggle-order-text-sent") return toggleOrderPaymentTextSent(id);
  if (action === "edit-variety") return openVarietySheet(id);
  if (action === "delete-variety") return deleteItem("varieties", id, "OdrĹŻdu");
  if (action === "edit-cross") return openCrossSheet(id);
  if (action === "download-cross") return downloadCrossCard(id);
  if (action === "delete-cross") return deleteItem("crosses", id, "KĹ™Ă­ĹľenĂ­");
  if (action === "facebook-offer") return prepareFacebookOffer(id);
  if (action === "edit-offer") return openOfferSheet(id);
  if (action === "delete-offer") return deleteItem("offers", id, "NabĂ­dku");
}

function crossStageText(stage) {
  return `${stageIcons[stage] || stageIcons.opyleno} ${stageLabels[stage] || "Opyleno"}`;
}

function customerOverviewMarkup(customerId) {
  const orders = state.data.orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => String(b.orderDate || "").localeCompare(String(a.orderDate || "")));
  const waitingOrders = orders.filter((order) => order.paymentStatus !== "zaplaceno");
  const waitingText = waitingOrders.length ? `${waitingOrders.length} Â· ${orderTotalsText(waitingOrders)}` : "Ne";
  return `<section class="customer-overview">
    <div class="offer-stats customer-overview-stats">
      <span><small>ObjednĂˇvky</small><strong>${orders.length}</strong></span>
      <span><small>Celkem koupil</small><strong>${escapeHtml(orderTotalsText(orders))}</strong></span>
      <span><small>ÄŚekĂˇ platba</small><strong>${escapeHtml(waitingText)}</strong></span>
    </div>
  </section>`;
}

function orderTotalsText(orders = []) {
  const total = orders.reduce((sum, order) => sum + orderFinalTotal(order), 0);
  return total > 0 ? formatMoney(total, "CZK") : "0 KÄŤ";
}

function syncOrderSheetCustomerValidity(form = els.sheet.querySelector("#sheetForm")) {
  const customerSelect = form?.elements?.customerId;
  if (!customerSelect) return;
  customerSelect.setCustomValidity(clean(customerSelect.value) ? "" : "Zvol zĂˇkaznĂ­ka.");
}

function mobileCustomerCountryMode(customer = null) {
  const country = normalize(clean(customer?.country || ""));
  if (!country) return "";
  if (["sk", "sr"].includes(country) || country.includes("slovensko") || country.includes("slovenska republika") || country.includes("slovak")) return "sk";
  if (["cz", "cr"].includes(country) || country.includes("cesko") || country.includes("ceska republika") || country.includes("czech")) return "cz";
  return "";
}

function defaultPackingFeeValue(settings = appSettings()) {
  return clean(settings?.packingFee) || "20";
}

function shippingAddressLabel(customer) {
  const countryMode = mobileCustomerCountryMode(customer);
  if (countryMode === "sk") return "Zásilkovna na adresu Slovensko";
  if (countryMode === "cz") return "Zásilkovna na adresu ČR";
  return "Zásilkovna na adresu";
}

function shippingLabel(customer) {
  const countryMode = mobileCustomerCountryMode(customer);
  if (countryMode === "sk") return "Zásilkovna Slovensko";
  if (countryMode === "cz") return "Zásilkovna ČR";
  return "Zásilkovna";
}

function defaultShippingPresetForCustomer(customer = null) {
  const countryMode = mobileCustomerCountryMode(customer);
  if (countryMode === "sk") return "shipping-sk";
  if (countryMode === "cz") return "shipping-cz";
  return "";
}

function isCountryDefaultShippingPreset(preset) {
  return preset === "shipping-cz" || preset === "shipping-sk";
}

function isShippingAddressLabel(label) {
  const normalized = normalize(clean(label));
  return [
    normalize("Zásilkovna na adresu"),
    normalize("Zásilkovna na adresu ČR"),
    normalize("Zásilkovna na adresu Slovensko"),
  ].includes(normalized);
}

function orderShippingLabel(order, customer = findCustomer(order?.customerId)) {
  return clean(order?.shippingFeeLabel) || shippingLabel(customer);
}

function defaultShippingAddressFeeForCustomer(settings = appSettings(), customer = null) {
  const countryMode = mobileCustomerCountryMode(customer);
  if (countryMode === "sk") return settings.shippingFeeAddressSk || settings.shippingFeeAddressCz || "";
  if (countryMode === "cz") return settings.shippingFeeAddressCz || settings.shippingFeeAddressSk || "";
  return settings.shippingFeeAddressCz || settings.shippingFeeAddressSk || "";
}

function defaultCodFeeForCustomer(settings = appSettings(), customer = null) {
  const countryMode = mobileCustomerCountryMode(customer);
  if (countryMode === "sk") return settings.codFeeSk;
  if (countryMode === "cz") return settings.codFeeCz;
  return settings.codFeeCz || "";
}

function recalculateOrderSheetPrice(form = document.querySelector("#sheetForm")) {
  if (!form?.elements) return;
  const shippingFee = number(form.elements.shippingFee?.value);
  const packingFee = number(form.elements.packingFee?.value);
  const codFee = number(form.elements.codFee?.value);
  const feeTotal =
    (Number.isFinite(shippingFee) ? shippingFee : 0)
    + (Number.isFinite(packingFee) ? packingFee : 0)
    + (Number.isFinite(codFee) ? codFee : 0);
  form.elements.price.value = normalizeAmount(orderTotalFromText(form.elements.varietiesText?.value) + feeTotal);
}

function clearOrderSheetFeeRestoreSnapshot(form = document.querySelector("#sheetForm")) {
  if (form) delete form.dataset.deliveryRestoreFees;
}

function rememberOrderSheetFeeRestoreSnapshot(form = document.querySelector("#sheetForm")) {
  if (!form?.elements) return;
  const snapshot = {
    activeFees: [...els.sheet.querySelectorAll("[data-fee].active")]
      .map((button) => button.dataset.fee || "")
      .filter(Boolean),
    shippingFee: clean(form.elements.shippingFee?.value),
    shippingFeeLabel: clean(form.elements.shippingFeeLabel?.value),
    packingFee: clean(form.elements.packingFee?.value),
    codFee: clean(form.elements.codFee?.value),
  };
  const hasValues = snapshot.activeFees.length || snapshot.shippingFee || snapshot.shippingFeeLabel || snapshot.packingFee || snapshot.codFee;
  if (!hasValues) {
    clearOrderSheetFeeRestoreSnapshot(form);
    return;
  }
  form.dataset.deliveryRestoreFees = JSON.stringify(snapshot);
}

function restoreOrderSheetFeeRestoreSnapshot(form = document.querySelector("#sheetForm")) {
  const raw = clean(form?.dataset?.deliveryRestoreFees);
  if (!form?.elements || !raw) return false;
  try {
    const snapshot = JSON.parse(raw);
    els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
    (Array.isArray(snapshot.activeFees) ? snapshot.activeFees : []).forEach((fee) => {
      els.sheet.querySelector(`[data-fee="${CSS.escape(fee)}"]`)?.classList.add("active");
    });
    form.elements.shippingFee.value = clean(snapshot.shippingFee);
    form.elements.shippingFeeLabel.value = clean(snapshot.shippingFeeLabel);
    form.elements.packingFee.value = clean(snapshot.packingFee);
    form.elements.codFee.value = clean(snapshot.codFee);
    return true;
  } catch {
    clearOrderSheetFeeRestoreSnapshot(form);
    return false;
  }
}

function syncOrderSheetCountryShippingPreset(form = document.querySelector("#sheetForm")) {
  if (!form?.elements) return;
  if (form.elements.deliveryMethod?.value === "personal_pickup") return;
  const packingButton = els.sheet.querySelector('[data-fee="packing"]');
  const shouldDefaultPacking = !clean(form.dataset.orderId) && clean(defaultPackingFeeValue(appSettings())) && !clean(form.elements.packingFee?.value);
  if (packingButton && shouldDefaultPacking && !packingButton.classList.contains("active")) {
    packingButton.classList.add("active");
  }
  const nextPreset = defaultShippingPresetForCustomer(findCustomer(form.elements.customerId?.value));
  if (!nextPreset) return;
  const shippingButtons = [...els.sheet.querySelectorAll("[data-fee]")].filter((button) => {
    const preset = button.dataset.fee || "";
    return preset.startsWith("shipping");
  });
  const activeButton = shippingButtons.find((button) => button.classList.contains("active"));
  const activePreset = activeButton?.dataset.fee || "";
  if (activePreset && !isCountryDefaultShippingPreset(activePreset)) return;
  if (activePreset === nextPreset) return;
  shippingButtons.forEach((button) => {
    if (isCountryDefaultShippingPreset(button.dataset.fee || "")) button.classList.remove("active");
  });
  shippingButtons.find((button) => button.dataset.fee === nextPreset)?.classList.add("active");
}

function openCustomerSheet(id = "") {
  const customer = findById("customers", id) || {};
  openSheet(customer.id ? "Upravit zĂˇkaznĂ­ka" : "NovĂ˝ zĂˇkaznĂ­k", `${customer.id ? customerOverviewMarkup(customer.id) : ""}<form class="form-grid" id="sheetForm">
    <label class="field"><span>JmĂ©no a pĹ™Ă­jmenĂ­</span><input name="fullName" required value="${escapeHtml(customerName(customer))}"></label>
    <label class="field"><span>Telefon</span><input name="phone" value="${escapeHtml(customer.phone)}"></label>
    <label class="field"><span>Email</span><input name="email" type="email" value="${escapeHtml(customer.email)}"></label>
    <label class="field"><span>FB jmĂ©no</span><input name="fbName" value="${escapeHtml(customer.fbName)}"></label>
    <label class="field"><span>Ulice</span><input name="street" value="${escapeHtml(customer.street)}"></label>
    <div class="two">
      <label class="field"><span>PSÄŚ</span><input name="postalCode" value="${escapeHtml(customer.postalCode)}"></label>
      <label class="field"><span>MÄ›sto</span><input name="city" value="${escapeHtml(customer.city)}"></label>
    </div>
    <label class="field"><span>ZemÄ›</span><input name="country" value="${escapeHtml(customer.country)}"></label>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(customer.note)}</textarea></label>
  </form>`, () => {
    const form = new FormData(document.querySelector("#sheetForm"));
    const now = new Date().toISOString();
    const fullName = clean(form.get("fullName"));
    const item = {
      ...customer,
      id: customer.id || uid(),
      firstName: fullName,
      lastName: "",
      phone: clean(form.get("phone")),
      email: clean(form.get("email")),
      fbName: clean(form.get("fbName")),
      street: clean(form.get("street")),
      postalCode: clean(form.get("postalCode")),
      city: clean(form.get("city")),
      country: clean(form.get("country")),
      note: clean(form.get("note")),
      tags: customer.tags || [],
      createdAt: customer.createdAt || now,
      updatedAt: now,
    };
    upsert("customers", item);
  });
}

function openOrderSheet(id = "", customerId = "") {
  const order = findById("orders", id) || {};
  const customers = state.data.customers;
  const selectedCustomerId = clean(order.customerId || customerId);
  const selectedCustomer = findCustomer(selectedCustomerId);
  const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
  openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
    <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
    <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
      .slice()
      .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
      .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
      .join("")}</select></label>
    <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
    ${toggle("paymentStatus", [["ÄŤekĂˇ", "ÄŚekĂˇ"], ["zaplaceno", "Zaplaceno"]], order.paymentStatus || "ÄŤekĂˇ")}
    ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
    ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
    <div class="toggle-grid">
      <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
      <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
      <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
      <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
      <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
      <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
      ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn"}</button>` : ""}
    </div>
    <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
    <section class="order-alternate-sheet-block" data-sheet-order-alternates hidden></section>
    <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
    <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
    <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
    <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
    <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const item = normalizeOrder({
      ...order,
      id: order.id || uid(),
      offerId: clean(data.get("offerId")),
      customerId: clean(data.get("customerId")),
      orderDate: clean(data.get("orderDate")) || todayInput(),
      paymentStatus: form.querySelector('[name="paymentStatus"]').value,
      shippingStatus: form.querySelector('[name="shippingStatus"]').value,
      deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
      varietiesText: clean(data.get("varietiesText")),
      price: clean(data.get("price")),
      shippingFee: clean(data.get("shippingFee")),
      shippingFeeLabel: clean(data.get("shippingFeeLabel")),
      packingFee: clean(data.get("packingFee")),
      codFee: clean(data.get("codFee")),
      note: clean(data.get("note")),
      createdAt: order.createdAt || now,
      updatedAt: now,
    });
    upsert("orders", item);
  });
  bindToggles();
  bindFees();
  els.sheet.querySelector("#sheetForm")?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
  syncOrderSheetCustomerValidity();
  syncOrderSheetAlternates();
  els.sheet.querySelector('[name="varietiesText"]')?.addEventListener("input", () => recalculateOrderSheetPrice());
  els.sheet.querySelector('[name="customerId"]')?.addEventListener("change", () => {
    const form = els.sheet.querySelector("#sheetForm");
    syncOrderSheetCustomerValidity();
    if (form?.elements?.deliveryMethod?.value === "personal_pickup") {
      clearOrderSheetFeeRestoreSnapshot(form);
    } else {
      syncOrderSheetCountryShippingPreset(form);
    }
    form?.__syncFeeButtons?.();
    syncOrderSheetAlternates();
  });
  els.sheet.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
    const form = els.sheet.querySelector("#sheetForm");
    if (!form?.elements) return;
    const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
    if (form.elements.deliveryMethod.value === "personal_pickup") {
      if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
      els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
      form.elements.shippingFee.value = "";
      form.elements.shippingFeeLabel.value = "";
      form.elements.packingFee.value = "";
      form.elements.codFee.value = "";
      recalculateOrderSheetPrice(form);
    } else if (previousDelivery === "personal_pickup") {
      const restored = restoreOrderSheetFeeRestoreSnapshot(form);
      if (!restored) form.__syncFeeButtons?.();
      recalculateOrderSheetPrice(form);
    }
    form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
  });
  els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
    syncOrderSheetCustomerValidity();
    if (!clean(els.sheet.querySelector('[name="customerId"]')?.value)) toast("Zvol zĂˇkaznĂ­ka.");
  });
  els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
    button.classList.toggle("active", sent);
    button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
  });
}

function openVarietySheet(id = "") {
  const variety = findById("varieties", id) || {};
  const winteringSeason = selectedWinteringSeason();
  const winteringStatus = varietyWinteringStatus(variety, winteringSeason) || "unset";
  openSheet(variety.id ? "Upravit odrĹŻdu" : "NovĂˇ odrĹŻda", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>NĂˇzev</span><input name="name" required value="${escapeHtml(variety.name)}"></label>
    <label class="field"><span>ProdejnĂ­ cena KÄŤ</span><input name="salePrice" inputmode="decimal" value="${escapeHtml(variety.salePrice)}"></label>
    ${toggle("winteringStatus", [["wintering", "❄ Zimuje"], ["not-wintering", "❄ Nezimuje"], ["unset", "Bez stavu"]], winteringStatus)}
    ${photoPickerFields("Fotky")}
    <div class="photo-grid" id="photoGrid">${photoTiles(varietyImages(variety))}</div>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(variety.note)}</textarea></label>
  </form>`, async () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const name = clean(data.get("name"));
    const conflict = findVarietyNameConflict(name, variety.id || "");
    if (conflict) {
      toast(`Odruda "${conflict.name}" uz existuje. Zkontroluj nazev.`);
      return;
    }
    const files = selectedPhotoFiles(form);
    const uploaded = await saveIndexedPhotos(files);
    const existing = [...form.querySelectorAll("[data-photo-tile]")].map((node) => node.dataset.photoTile);
    const now = new Date().toISOString();
    const previousName = variety.name || "";
    const previousImages = varietyImages(variety);
    const nextWintering = updateVarietyWintering(variety, winteringSeason, data.get("winteringStatus") === "unset" ? "" : data.get("winteringStatus"));
    const item = {
      ...variety,
      id: variety.id || uid(),
      name,
      salePrice: normalizeAmount(data.get("salePrice")),
      saleCurrency: "CZK",
      photoUrl: [...existing, ...uploaded][0] || "",
      gallery: [...existing, ...uploaded].slice(1),
      wintering: nextWintering,
      active: variety.active !== false,
      note: clean(data.get("note")),
      createdAt: variety.createdAt || now,
      updatedAt: now,
    };
    upsert("varieties", item);
    syncOfferItemsForVariety(item, { previousName, previousImages });
  });
  bindPhotoGrid();
  bindToggles();
}

function syncOfferItemsForVariety(variety, options = {}) {
  const varietyId = clean(variety?.id);
  const varietyName = clean(variety?.name);
  if (!varietyId || !varietyName) return;
  const previousKeys = new Set([options.previousName, varietyName].map(varietyNameMatchKey).filter(Boolean));
  const previousImages = new Set((options.previousImages || []).map(clean).filter(Boolean));
  state.data.offers.forEach((offer) => {
    (offer.items || []).forEach((item) => {
      const linkedById = clean(item.varietyId) === varietyId;
      const linkedByOldName = previousKeys.has(varietyNameMatchKey(item.varietyName || item.name));
      if (!linkedById && !linkedByOldName) return;
      item.varietyId = varietyId;
      item.varietyName = varietyName;
      if (clean(item.photoUrl) && previousImages.has(clean(item.photoUrl))) item.photoUrl = "";
      item.updatedAt = new Date().toISOString();
    });
    sortOfferItemsInPlace(offer);
  });
}

function openVarietyDetailSheet(id, options = {}) {
  const variety = findById("varieties", id);
  if (!variety) return;
  const images = varietyImages(variety);
  const usage = varietyUsageCount(variety.name);
  const mainImage = images[0] || "";
  const winterSeason = selectedWinteringSeason();
  const winterStatus = varietyWinteringStatus(variety, winterSeason);
  const winterHistory = winteringHistoryEntries(variety);
  openSheet(variety.name, `<section class="variety-detail">
    <div class="variety-detail-photo ${mainImage ? "" : "empty"}">
      ${mainImage ? `<img data-photo-ref="${escapeHtml(thumbPreviewRef(mainImage))}" alt="${escapeHtml(variety.name)}">` : `<span>${escapeHtml(initials(variety.name))}</span>`}
    </div>
    <div class="offer-stats variety-detail-stats">
      <span><strong>${escapeHtml(variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "-")}</strong><small>cena</small></span>
      <span><strong>${images.length}</strong><small>fotek</small></span>
      <span><strong>${usage}</strong><small>v objednĂˇvkĂˇch</small></span>
      <span><strong>${escapeHtml(winteringStatusLabel(winterStatus))}</strong><small>${escapeHtml(winterSeason)}</small></span>
    </div>
    <div class="pill-row"><span class="pill ${winterStatus === "wintering" ? "ok" : winterStatus === "not-wintering" ? "warn" : ""}">${escapeHtml(winteringStatusChipLabel(winterStatus))}</span></div>
    ${winterHistory.length ? `<div class="offer-stats variety-detail-stats">${winterHistory.slice(0, 3).map(([season, status]) => `<span><strong>${escapeHtml(winteringStatusLabel(status))}</strong><small>${escapeHtml(season)}</small></span>`).join("")}</div>` : ""}
    ${variety.note ? `<p class="sub">${escapeHtml(variety.note)}</p>` : ""}
    ${images.length > 1 ? `<div class="photo-grid variety-detail-gallery">${images.map((image) => `<span class="photo-tile"><img data-photo-ref="${escapeHtml(thumbPreviewRef(image))}" alt="${escapeHtml(variety.name)}"></span>`).join("")}</div>` : ""}
  </section>`, null, `<button class="button" type="button" data-download-variety-photo="${escapeHtml(id)}" ${mainImage ? "" : "disabled"}>StĂˇhnout fotku</button><button class="button primary" type="button" data-edit-variety-detail="${escapeHtml(id)}">Upravit</button>`, {
    ...options,
    restore: () => openVarietyDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-edit-variety-detail]")?.addEventListener("click", () => openVarietySheet(id));
  els.sheet.querySelector("[data-download-variety-photo]")?.addEventListener("click", () => downloadVarietyPhoto(id));
  resolvePhotos(els.sheet);
}

function openCrossSheet(id = "") {
  const cross = findById("crosses", id) || {};
  const options = [...state.data.varieties]
    .sort((a, b) => naturalCompare(a.name, b.name))
    .map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`)
    .join("");
  openSheet(cross.id ? "Upravit kĹ™Ă­ĹľenĂ­" : "NovĂ© kĹ™Ă­ĹľenĂ­", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>Matka</span><select name="motherVarietyId" required><option value="">Vyber odrůdu</option>${options}</select></label>
    <label class="field"><span>Pyl</span><select name="pollenVarietyId" required><option value="">Vyber odrůdu</option>${options}</select></label>
    <label class="field"><span>Datum opylenĂ­</span><input name="pollinatedAt" type="date" required value="${escapeHtml(cross.pollinatedAt || todayInput())}"></label>
    ${toggle("stage", [["opyleno", "Opyleno"], ["vyseto", "Vyseto"], ["roste", "Roste"], ["hotovo", "Hotovo"]], cross.stage || "opyleno")}
    ${toggle("resultRating", [["krasna", "KrĂˇsnĂˇ"], ["hnusna", "HnusnĂˇ"], ["nejista", "NejistĂˇ"]], cross.resultRating || "nejista")}
    <label class="field"><span>NĂˇzev semenĂˇÄŤe</span><input name="seedlingName" value="${escapeHtml(cross.seedlingName)}"></label>
    ${photoPickerFields("Fotky semenĂˇÄŤe")}
    <div class="photo-grid" id="photoGrid">${photoTiles(crossSeedlingImages(cross))}</div>
    <div class="cross-flow" id="crossPreview"></div>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(cross.note)}</textarea></label>
  </form>`, async () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const uploaded = await saveIndexedPhotos(selectedPhotoFiles(form));
    const existing = [...form.querySelectorAll("[data-photo-tile]")].map((node) => node.dataset.photoTile);
    const now = new Date().toISOString();
    const item = normalizeCross({
      ...cross,
      id: cross.id || uid(),
      motherVarietyId: clean(data.get("motherVarietyId")),
      pollenVarietyId: clean(data.get("pollenVarietyId")),
      pollinatedAt: clean(data.get("pollinatedAt")) || todayInput(),
      stage: form.querySelector('[name="stage"]').value,
      resultRating: form.querySelector('[name="resultRating"]').value,
      seedlingName: clean(data.get("seedlingName")),
      seedlingPhotoUrl: [...existing, ...uploaded][0] || "",
      seedlingGallery: [...existing, ...uploaded].slice(1),
      note: clean(data.get("note")),
      createdAt: cross.createdAt || now,
      updatedAt: now,
    });
    if (item.seedlingName) item.linkedVarietyId = ensureVarietyFromCross(item);
    upsert("crosses", item);
  });
  document.querySelector('[name="motherVarietyId"]').value = cross.motherVarietyId || "";
  document.querySelector('[name="pollenVarietyId"]').value = cross.pollenVarietyId || "";
  bindToggles();
  bindPhotoGrid();
  renderCrossPreviewInSheet();
  document.querySelector("#sheetForm").addEventListener("input", renderCrossPreviewInSheet);
}

function openCrossDetailSheet(id, options = {}) {
  const cross = findById("crosses", id);
  if (!cross) return;
  openSheet(crossLineage(cross), `<div class="cross-flow">${crossPreviewMarkup(cross)}</div>
    <div class="pill-row">
      <span class="pill">${escapeHtml(crossStageText(cross.stage))}</span>
      <span class="pill">${ratingLabels[cross.resultRating] || "Bez hodnocenĂ­"}</span>
      ${cross.seedlingName ? `<span class="pill">${escapeHtml(cross.seedlingName)}</span>` : ""}
    </div>
    ${cross.note ? `<p class="sub">${escapeHtml(cross.note)}</p>` : ""}`, null, `<button class="button" type="button" data-download-cross="${escapeHtml(id)}">StĂˇhnout obrĂˇzek</button><button class="button primary" type="button" data-edit-cross="${escapeHtml(id)}">Upravit</button>`, {
    ...options,
    restore: () => openCrossDetailSheet(id, { replace: true }),
  });
  document.querySelector("[data-edit-cross]")?.addEventListener("click", () => openCrossSheet(id));
  document.querySelector("[data-download-cross]")?.addEventListener("click", () => downloadCrossCard(id));
  resolvePhotos(els.sheet);
}

function openOfferSheet(id = "", defaults = {}) {
  const offer = findById("offers", id) || {};
  const initialType = offer.id ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer.date || clean(defaults.date) || todayInput();
  openSheet(offer.id ? (initialType === "rests" ? "Upravit resty" : "Upravit nabĂ­dku") : (initialType === "rests" ? "NovĂ© resty" : "NovĂˇ nabĂ­dka"), `<form class="form-grid" id="sheetForm">
    <label class="field"><span>NĂˇzev</span><input name="title" required value="${escapeHtml(offer.title || defaultOfferTitle(initialType, initialDate))}"></label>
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
    <label class="field"><span>Datum na Facebooku</span><input name="facebookPublishDate" type="date" value="${escapeHtml(offer.facebookPublishDate || initialDate)}"></label>
    <label class="field"><span>ÄŚas na Facebooku</span><input name="facebookPublishTime" type="time" value="${escapeHtml(offer.facebookPublishTime || "20:00")}"></label>
    <label class="field"><span>Typ</span><select name="type"><option value="offer" ${initialType === "offer" ? "selected" : ""}>NabĂ­dka</option><option value="rests" ${initialType === "rests" ? "selected" : ""}>Resty</option></select></label>
    ${toggle("status", [["pĹ™ipravenĂˇ", "PĹ™ipravenĂˇ"], ["zveĹ™ejnÄ›nĂˇ", "ZveĹ™ejnÄ›nĂˇ"], ["uzavĹ™enĂˇ", "UzavĹ™enĂˇ"]], offer.status || "pĹ™ipravenĂˇ")}
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const nextDate = clean(data.get("date")) || todayInput();
    const nextType = normalizeOfferType(data.get("type"));
    const sourceType = offer.id ? normalizeOfferType(offer.type) : nextType;
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: adjustedOfferTitleForType(clean(data.get("title")), sourceType, nextType, nextDate),
      date: nextDate,
      facebookPublishDate: clean(data.get("facebookPublishDate")) || nextDate,
      facebookPublishTime: clean(data.get("facebookPublishTime")) || "20:00",
      type: nextType,
      status: form.querySelector('[name="status"]').value,
      note: clean(data.get("note")),
      items: offer.items || [],
      createdAt: offer.createdAt || now,
      updatedAt: now,
    }));
  });
  bindToggles();
}

function openOfferDetailSheet(id, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return;
  state.activeOfferId = id;
  const items = sortedOfferItems(offer);
  const reserved = offerReservedCount(offer);
  const total = offerTotalCount(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty" : "Upravit nabĂ­dku";
  const toggleTypeLabel = isRestOffer(offer) ? "PĹ™esunout do nabĂ­dek" : "PĹ™esunout do restĹŻ";
  openSheet(offer.title, `<section class="offer-detail">
    <div class="offer-stats">
      <span><strong>${items.length}</strong><small>odĹ™ezkĹŻ</small></span>
      <span><strong>${total}</strong><small>kusĹŻ</small></span>
      <span><strong>${reserved}</strong><small>rezervacĂ­</small></span>
      <span><strong>${Math.max(0, total - reserved)}</strong><small>volnĂ©</small></span>
    </div>
    <div class="pill-row"><span class="pill ${isRestOffer(offer) ? "warn" : ""}">${escapeHtml(offerTypeLabel(offer))}</span><span class="pill">${escapeHtml(offer.status)}</span></div>
    ${offer.note ? `<p class="sub">${escapeHtml(offer.note)}</p>` : ""}
    <button class="button" type="button" data-toggle-offer-type="${escapeHtml(id)}">${toggleTypeLabel}</button>
    <button class="button primary" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">PĹ™ipravit Facebook pĹ™Ă­spÄ›vek</button>
    <div class="offer-items">
      ${items.length ? items.map((item) => offerItemDetailMarkup(offer, item)).join("") : `<div class="empty light">ZatĂ­m bez odĹ™ezkĹŻ.</div>`}
    </div>
  </section>`, null, `<button class="button" type="button" data-close-sheet>ZavĹ™Ă­t</button><button class="button" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">Facebook</button><button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit nabĂ­dku</button><button class="button" type="button" data-create-offer-orders="${escapeHtml(id)}">VytvoĹ™it objednĂˇvky</button><button class="button primary" type="button" data-add-offer-item="${escapeHtml(id)}">PĹ™idat odĹ™ezek</button>`, {
    ...options,
    restore: () => openOfferDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
  els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  els.sheet.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemSheet(id));
  els.sheet.querySelectorAll("[data-reserve-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.reserveOfferItem, "", "confirmed"));
  });
  els.sheet.querySelectorAll("[data-alternate-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.alternateOfferItem, "", "alternate"));
  });
  els.sheet.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemSheet(button.dataset.offerId, button.dataset.editOfferItem));
  });
  els.sheet.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(button.dataset.offerId, button.dataset.deleteOfferItem));
  });
  els.sheet.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.itemId, button.dataset.editReservation));
  });
  els.sheet.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(button.dataset.offerId, button.dataset.itemId, button.dataset.deleteReservation));
  });
  resolvePhotos(els.sheet);
}

(function finalizeMobileRestMode() {
  function looksLikeLegacyRestOffer(offer = {}) {
    const title = clean(offer.title);
    if (!/^Resty(?:\/pozn.*)?/i.test(title)) return false;
    return Boolean(clean(offer.restCustomerId) || clean(offer.restVarietyId) || clean(offer.restVarietyName) || clean(offer.note));
  }

  function mobileRestNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function mobileRestCustomerText(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez z\u00e1kazn\u00edka";
  }

  function mobileRestNotePreview(offer = {}, max = 42) {
    return clean(offer.note) ? `\ud83d\udcdd ${mobileShortRestText(offer.note, max)}` : "";
  }

  const previousOpenOfferSheet = openOfferSheet;
  const previousOpenOfferDetailSheet = openOfferDetailSheet;

  isRestOffer = function isRestOfferFinal(offer) {
    return normalizeOfferType(offer?.type) === "rests" || looksLikeLegacyRestOffer(offer);
  };

  offerTypeLabel = function offerTypeLabelFinal(offerOrType) {
    if (typeof offerOrType === "string") return normalizeOfferType(offerOrType) === "rests" ? "Resty" : "Nab\u00eddka";
    return isRestOffer(offerOrType) ? "Resty" : "Nab\u00eddka";
  };

  mobileRestOfferVarietyLabel = function mobileRestOfferVarietyLabelFinal(offer = {}) {
    return mobileRestNames(offer).join(", ");
  };

  mobileRestOfferSummaryText = function mobileRestOfferSummaryTextFinal(offer = {}) {
    return [mobileRestCustomerText(offer), mobileRestOfferVarietyLabel(offer)].filter(Boolean).join(" \u00b7 ");
  };

  openOfferSheet = function openOfferSheetFinal(id = "", defaults = {}) {
    const offer = findById("offers", id) || {};
    const initialIsRest = offer.id ? isRestOffer(offer) : normalizeOfferType(defaults.type) === "rests";
    if (!initialIsRest) return previousOpenOfferSheet(id, defaults);
    const initialDate = offer.date || clean(defaults.date) || todayInput();
    const names = mobileRestNames(offer);
    const customers = [...state.data.customers].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
    openSheet(offer.id ? "Upravit resty" : "Nov\u00e9 resty", `<form class="form-grid" id="sheetForm">
      <input name="type" type="hidden" value="rests">
      <input name="title" type="hidden" value="${escapeHtml(defaultOfferTitle("rests", initialDate))}">
      <input name="facebookPublishDate" type="hidden" value="${escapeHtml(initialDate)}">
      <input name="facebookPublishTime" type="hidden" value="20:00">
      <input name="status" type="hidden" value="p\u0159ipraven\u00e1">
      <input name="restVarietyId" type="hidden" value="">
      <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
      <label class="field"><span>Z\u00e1kazn\u00edk</span><select name="restCustomerId"><option value="">Bez z\u00e1kazn\u00edka</option>${customers
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <label class="field"><span>Odr\u016fdy</span><input name="restVarietyPicker" list="varietyList" placeholder="Za\u010dni ps\u00e1t a p\u0159idej"></label>
      <textarea name="restVarietyName" hidden aria-hidden="true">${escapeHtml(names.join("\n"))}</textarea>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-rest-variety-add>P\u0159idat odr\u016fdu</button></div>
      <div class="rest-variety-selection" data-rest-variety-list></div>
      <label class="field"><span>Pozn\u00e1mka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const nextDate = clean(data.get("date")) || todayInput();
      const nextNames = restFormVarietyNames(data.get("restVarietyName"));
      const matchedVariety = nextNames.length === 1 ? findVarietyByName(nextNames[0]) : null;
      upsert("offers", normalizeOffer({
        ...offer,
        id: offer.id || uid(),
        title: defaultOfferTitle("rests", nextDate),
        date: nextDate,
        facebookPublishDate: nextDate,
        facebookPublishTime: "20:00",
        type: "rests",
        status: "p\u0159ipraven\u00e1",
        note: clean(data.get("note")),
        restCustomerId: clean(data.get("restCustomerId")),
        restVarietyId: clean(matchedVariety?.id),
        restVarietyName: nextNames.join("\n"),
        items: offer.items || [],
        createdAt: offer.createdAt || now,
        updatedAt: now,
      }));
    });
    setupRestVarietyPickerForSheet(els.sheet.querySelector("#sheetForm"), names.join("\n"));
  };

  openOfferDetailSheet = function openOfferDetailSheetFinal(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer || !isRestOffer(offer)) return previousOpenOfferDetailSheet(id, options);
    state.activeOfferId = id;
    const names = mobileRestNames(offer);
    const body = `<section class="offer-detail">
      <div class="pill-row"><span class="pill warn">Resty</span></div>
      <div class="rest-meta-stack">
        <div class="rest-meta-card"><small>Datum</small><strong>${escapeHtml(formatDate(offer.date))}</strong></div>
        <div class="rest-meta-card"><small>Z\u00e1kazn\u00edk</small><strong>${escapeHtml(mobileRestCustomerText(offer))}</strong></div>
        ${names.length ? `<div class="rest-meta-card"><small>${names.length > 1 ? "Odr\u016fdy" : "Odr\u016fda"}</small><strong>${escapeHtml(names.join(", "))}</strong></div>` : ""}
      </div>
      ${clean(offer.note) ? `<div class="rest-meta-stack"><div class="rest-meta-card"><small>Pozn\u00e1mka</small><strong>${escapeHtml(offer.note)}</strong></div></div>` : ""}
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>Zav\u0159\u00edt</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
      <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvo\u0159it objedn\u00e1vku</button>`;
    openSheet(offer.title, body, null, footer, {
      ...options,
      restore: () => openOfferDetailSheet(id, { replace: true }),
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  };

  renderOffers = function renderOffersFinal() {
    const offers = state.data.offers.filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!offers.length) return empty("\u017d\u00e1dn\u00e9 nab\u00eddky.");
    const groups = splitOffersByType(offers);
    const renderOfferGroup = (label, items) => {
      if (!items.length) return "";
      return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
        if (isRestOffer(offer)) {
          const names = mobileRestNames(offer);
          const pills = names.slice(0, 4).map((name) => `\ud83c\udf3f ${name}`);
          if (names.length > 4) pills.push(`+${names.length - 4} dal\u0161\u00ed`);
          const notePill = mobileRestNotePreview(offer);
          if (notePill) pills.push(notePill);
          return card({
            id: offer.id,
            type: "offer",
            title: offer.title,
            sub: [formatDate(offer.date), mobileRestCustomerText(offer)].filter(Boolean).join(" \u00b7 "),
            pills,
            badges: [{ label: "Resty", className: "warn" }],
            thumb: "",
            thumbText: "R",
            actions: [["edit-offer", "\u270e"], ["delete-offer", "\u00d7"]],
          });
        }

        const offerItems = sortedOfferItems(offer);
        const reserved = offerReservedCount(offer);
        const total = offerTotalCount(offer);
        const available = offerAvailableCount(offer);
        const alternates = offerAlternateCount(offer);
        const coverImage = offerItems.map((item) => offerItemImage(item)).find(Boolean) || "";
        const itemPills = offerItems.slice(0, 4).map((item) => `\ud83c\udf3f ${offerItemName(item)}`);
        if (offerItems.length > 4) itemPills.push(`+${offerItems.length - 4} dal\u0161\u00ed`);
        return card({
          id: offer.id,
          type: "offer",
          title: offer.title,
          sub: `${formatDate(offer.date)} \u00b7 ${offerTypeLabel(offer)} \u00b7 ${offer.status}`,
          pills: [...itemPills, `Voln\u00e9 ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `N\u00e1hradn\u00edci ${alternates}` : ""],
          badges: [],
          thumb: coverImage,
          thumbText: initials(offer.title),
          actions: [["facebook-offer", "FB"], ["edit-offer", "\u270e"], ["delete-offer", "\u00d7"]],
        });
      }).join("")}`;
    };
    return [
      renderOfferGroup("Nab\u00eddky", groups.offers),
      renderOfferGroup("Resty", groups.rests),
    ].filter(Boolean).join("");
  };
})();
(() => {
  const stableOpenOrder = globalThis.__akOpenOrderSheetStable84 || globalThis.__akOpenOrderSheetFinal || openOrderSheet;

  function safeOrderTone(order) {
    if (customerStornoOrders(order?.customerId).length || orderHasStorno(order)) return "reject";
    if (order?.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order?.shippingStatus)) return "done";
    if (order?.paymentStatus === "zaplaceno") return "progress";
    return "attention";
  }

  function fallbackRenderOffers() {
    const offers = (state.data.offers || []).filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
    return offers.map((offer) => card({
      id: offer.id,
      type: "offer",
      title: offer.title,
      sub: [formatDate(offer.date), offerTypeLabel(offer), offer.status].filter(Boolean).join(" Â· "),
      pills: [isRestOffer(offer) ? "Resty" : "NabĂ­dka"],
      actions: [["edit-offer", "âśŽ"], ["delete-offer", "Ă—"]],
    })).join("");
  }

  function fallbackRenderOrders() {
    const orders = (state.data.orders || []).filter(matchOrder).sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)));
    if (!orders.length) return empty("Ĺ˝ĂˇdnĂ© objednĂˇvky.");
    return orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const stornoCount = customerStornoOrders(order.customerId).length;
      const latestStornoNote = stornoCount
        ? clean(order.cancelledNote) || clean(orderStornoLines(order).slice().reverse().find((entry) => clean(entry.note))?.note)
        : "";
      return card({
        id: order.id,
        type: "order",
        tone: safeOrderTone(order),
        title: compactName(customerName(customer) || "Bez zĂˇkaznĂ­ka"),
        sub: [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" Â· ")
          + (stornoCount ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoCount > 1 ? ` (${stornoCount})` : ""}</span>${latestStornoNote ? `<span class="customer-storno-mobile-note">${escapeHtml(latestStornoNote)}</span>` : ""}` : ""),
        price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
        pills: [
          ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => `đźŚż ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`),
          ...orderOfferAlternateEntries(order).map((item) => ({ label: `âš  NĂˇhradnĂ­k: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
          ...orderStornoLines(order).map((item) => ({ label: `âś• Storno: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
        ],
        badges: [stornoCount ? `Stornuje${stornoCount > 1 ? ` (${stornoCount})` : ""}` : "", orderHasStorno(order) ? "Storno" : "", paymentPill(order), statusPill(order), orderPaymentTextPill(order)].filter(Boolean),
        actions: [["copy-order", "đź“‹"], ["toggle-order-text-sent", clean(order.paymentTextSentAt) ? "âś“Txt" : "Txt"], ["edit-order", "âśŽ"], ["delete-order", "Ă—"]],
      });
    }).join("");
  }

  function fallbackRenderCustomers() {
    const customers = (state.data.customers || []).filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
    if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
    return customers.map((customer) => {
      const stornoOrders = customerStornoOrders(customer.id);
      const latestStornoNote = clean(stornoOrders[0]?.cancelledNote) || clean(orderStornoLines(stornoOrders[0] || {}).slice().reverse().find((entry) => clean(entry.note))?.note);
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoOrders.length ? "customer-storno-card" : "",
        title: customerName(customer),
        sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>")
          + (stornoOrders.length ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoOrders.length > 1 ? ` (${stornoOrders.length})` : ""}</span>${latestStornoNote ? `<span class="customer-storno-mobile-note">${escapeHtml(latestStornoNote)}</span>` : ""}` : ""),
        pills: [...(customer.tags || []), ...(stornoOrders.length ? [`Stornuje${stornoOrders.length > 1 ? ` (${stornoOrders.length})` : ""}`] : [])],
        actions: [["order-customer", "+"], ["edit-customer", "âśŽ"], ["delete-customer", "Ă—"]],
      });
    }).join("");
  }

  function fallbackRenderVarieties() {
    const varieties = (state.data.varieties || []).filter(matchVariety).sort((a, b) => naturalCompare(a.name, b.name));
    if (!varieties.length) return empty("Ĺ˝ĂˇdnĂ© odrĹŻdy.");
    return varieties.map((variety) => card({
      id: variety.id,
      type: "variety",
      title: `đźŚ± ${variety.name}`,
      sub: `${varietyImages(variety).length ? `${varietyImages(variety).length} fotek` : "Bez fotky"} Â· ${varietyUsageCount(variety.name)} zĂˇznamĹŻ`,
      price: variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny",
      thumb: varietyImages(variety)[0],
      thumbText: initials(variety.name),
      pills: [variety.active === false ? "NeaktivnĂ­" : "AktivnĂ­"],
      actions: [["edit-variety", "âśŽ"], ["delete-variety", "Ă—"]],
    })).join("");
  }

  function fallbackRenderCrosses() {
    const crosses = (state.data.crosses || []).filter(matchCross).sort((a, b) => String(b.pollinatedAt).localeCompare(String(a.pollinatedAt)));
    if (!crosses.length) return empty("Ĺ˝ĂˇdnĂˇ kĹ™Ă­ĹľenĂ­.");
    return crosses.map((cross) => card({
      id: cross.id,
      type: "cross",
      tone: cross.resultRating === "hnusna" ? "reject" : cross.stage === "hotovo" ? "done" : "attention",
      title: crossLineage(cross),
      sub: cross.seedlingName || "",
      thumb: crossSeedlingImages(cross)[0],
      thumbText: initials(crossLineage(cross)),
      pills: [crossStageText(cross.stage), ratingLabels[cross.resultRating] ? `âś“ ${ratingLabels[cross.resultRating]}` : "Bez hodnocenĂ­", cross.seedlingName || "â€”"],
      actions: [["download-cross", "â–Ł"], ["edit-cross", "âśŽ"], ["delete-cross", "Ă—"]],
    })).join("");
  }

  function fallbackRenderSync() {
    try {
      return renderSync();
    } catch {
      return '<section class="sync-card"><strong class="title">NastavenĂ­</strong><p class="sub">NastavenĂ­ se nepodaĹ™ilo naÄŤĂ­st.</p></section>';
    }
  }

  function bindSyncButtonsStable() {
    document.querySelector("#syncLogin")?.addEventListener("click", loginSync, { capture: true });
    document.querySelector("#syncLogout")?.addEventListener("click", logoutSync, { capture: true });
    document.querySelector("#saveAppSettings")?.addEventListener("click", saveAppSettingsFromInputs, { capture: true });
  }

  function rebindStaticControlsStable() {
    document.querySelectorAll("[data-view], [data-action]").forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) return;
      const clone = node.cloneNode(true);
      node.replaceWith(clone);
    });
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        openView(button.dataset.view || "offers");
      }, true);
    });
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const action = button.dataset.action || "";
        if (action === "new-order") return (globalThis.__akOpenOrderSheetFinal || stableOpenOrder || openOrderSheet)();
        if (action === "new-customer") return openCustomerSheet();
        if (action === "new-variety") return openVarietySheet();
        if (action === "new-cross") return openCrossSheet();
        if (action === "new-offer") return openOfferSheet();
        if (action === "new-rest-offer") return openOfferSheet("", { type: "rests" });
      }, true);
    });
  }

  if (!globalThis.__akMobileListDelegationFinal86) {
    globalThis.__akMobileListDelegationFinal86 = true;
    els.list.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const actionButton = target.closest("[data-action-row]");
      if (actionButton?.dataset?.actionRow) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const action = actionButton.dataset.actionRow;
        const id = actionButton.dataset.id || "";
        if (action === "edit-order") return (globalThis.__akOpenOrderSheetFinal || stableOpenOrder || openOrderSheet)(id);
        if (action === "order-customer") return (globalThis.__akOpenOrderSheetFinal || stableOpenOrder || openOrderSheet)("", id);
        return handleRowAction(action, id);
      }
      const cardEl = target.closest("[data-card]");
      if (!cardEl?.dataset?.card || target.closest("button")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      const type = cardEl.dataset.card;
      const id = cardEl.dataset.id || "";
      if (type === "order") return (globalThis.__akOpenOrderSheetFinal || stableOpenOrder || openOrderSheet)(id);
      if (type === "customer") return openCustomerSheet(id);
      if (type === "variety") return openVarietyDetailSheet(id);
      if (type === "cross") return openCrossDetailSheet(id);
      if (type === "offer") return openOfferDetailSheet(id);
    }, true);
  }

  render = function renderStableMobileEOF() {
    if (!isSyncLoggedIn()) state.view = "sync";
    document.body.classList.toggle("private-locked", !isSyncLoggedIn());
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));

    try {
      renderFilters();
    } catch (error) {
      console.error("mobile renderFilters failed", error);
      els.filterRow.innerHTML = "";
    }

    try {
      renderSummary();
    } catch (error) {
      console.error("mobile renderSummary failed", error);
      els.summary.innerHTML = "";
    }

    const renderers = {
      offers: () => {
        try { return renderOffers(); } catch (error) { console.error("mobile offers render failed", error); return fallbackRenderOffers(); }
      },
      orders: () => {
        try { return renderOrders(); } catch (error) { console.error("mobile orders render failed", error); return fallbackRenderOrders(); }
      },
      customers: () => {
        try { return renderCustomers(); } catch (error) { console.error("mobile customers render failed", error); return fallbackRenderCustomers(); }
      },
      varieties: () => {
        try { return renderVarieties(); } catch (error) { console.error("mobile varieties render failed", error); return fallbackRenderVarieties(); }
      },
      crosses: () => {
        try { return renderCrosses(); } catch (error) { console.error("mobile crosses render failed", error); return fallbackRenderCrosses(); }
      },
      sync: fallbackRenderSync,
    };

    els.list.innerHTML = "";
    try {
      els.list.innerHTML = renderers[state.view]?.() || "";
    } catch (error) {
      console.error("mobile final list render failed", error);
      els.list.innerHTML = empty("Tahle sekce se nepodaĹ™ila otevĹ™Ă­t.");
    }

    try {
      resolvePhotos(els.list);
    } catch (error) {
      console.error("mobile resolvePhotos failed", error);
    }
    try {
      bindSyncButtonsStable();
    } catch (error) {
      console.error("mobile bindSyncButtons failed", error);
    }
    try {
      updateSyncIndicator();
    } catch (error) {
      console.error("mobile updateSyncIndicator failed", error);
    }
  };

  openView = function openViewStableMobileEOF(view) {
    if (!isSyncLoggedIn() && view !== "sync") {
      state.view = "sync";
      render();
      toast("NejdĹ™Ă­v se pĹ™ihlas.");
      return;
    }
    state.view = view;
    state.filter = "all";
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    if (els.search) els.search.value = "";
    state.query = "";
    closeSheet({ all: true });
    render();
  };

  if (typeof stableOpenOrder === "function") {
    openOrderSheet = stableOpenOrder;
    globalThis.__akOpenOrderSheetFinal = stableOpenOrder;
  }

  rebindStaticControlsStable();
  render();
})();
(() => {
  function stableParseOrderLineName(line = "") {
    return clean(line)
      .replace(/\b\d+\s*x\b/gi, " ")
      .replace(/\bx\s*\d+\b/gi, " ")
      .replace(/\b\d+\s*(ks|kus|kusy|Ĺ™Ă­zkĹŻ|rizku|sazenic)\b/gi, " ")
      .replace(/(?:-|â€“|â€”)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/(?:@|=)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/\b\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)\b/gi, " ")
      .replace(/[=:@]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stableParseOrderLines(text = "") {
    return clean(text)
      .split(/\n+/)
      .map((rawLine) => {
        const raw = clean(rawLine);
        const name = stableParseOrderLineName(raw);
        return {
          raw,
          name,
          quantity: orderLineQuantity(raw),
          explicitPrice: Number.isFinite(orderLineUnitPrice(raw)) ? normalizeAmount(orderLineUnitPrice(raw)) : "",
          explicitCurrency: "CZK",
        };
      })
      .filter((line) => line.name);
  }

  function stableBuildOrderLineText(name, quantity = 1, amount = "") {
    const normalizedName = clean(name);
    const normalizedQuantity = Math.max(wholeNumber(quantity, 1), 1);
    const parsedAmount = number(amount);
    return Number.isFinite(parsedAmount)
      ? offerOrderLineText(normalizedName, normalizedQuantity, parsedAmount)
      : `${normalizedName} ${normalizedQuantity}x`;
  }

  function stableNormalizeStornoLines(value = "") {
    if (Array.isArray(value)) {
      return value
        .map((entry) => ({
          name: clean(entry?.name),
          quantity: Math.max(wholeNumber(entry?.quantity, 1), 1),
          unitPrice: normalizeAmount(entry?.unitPrice),
          currency: clean(entry?.currency) || "CZK",
          note: clean(entry?.note),
          createdAt: clean(entry?.createdAt),
        }))
        .filter((entry) => entry.name);
    }
    if (!clean(value)) return [];
    try {
      return stableNormalizeStornoLines(JSON.parse(value));
    } catch {
      return [];
    }
  }

  function stableCurrentOrderLines(form) {
    return stableParseOrderLines(form?.elements?.varietiesText?.value || "");
  }

  function stableReadStornoLines(form) {
    return stableNormalizeStornoLines(form?.elements?.stornoLines?.value);
  }

  function stableWriteStornoLines(form, lines = []) {
    if (!form?.elements?.stornoLines) return;
    form.elements.stornoLines.value = JSON.stringify(stableNormalizeStornoLines(lines));
  }

  function stableDefaultPriceInfo(line = {}) {
    if (clean(line.explicitPrice)) return { amount: line.explicitPrice, currency: "CZK" };
    const variety = findVarietyByName(line.name);
    if (clean(variety?.salePrice)) return { amount: variety.salePrice, currency: "CZK" };
    return { amount: "", currency: "CZK" };
  }

  function stableLatestCustomerStorno(customerId = "") {
    const orders = customerStornoOrders(customerId)
      .slice()
      .sort((a, b) => String(b.updatedAt || b.cancelledAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.cancelledAt || a.orderDate || "")));
    const latest = orders[0] || null;
    let note = clean(latest?.cancelledNote);
    if (!note && latest) {
      const stornoEntry = orderStornoLines(latest)
        .slice()
        .reverse()
        .find((entry) => clean(entry.note));
      note = clean(stornoEntry?.note);
    }
    return { count: orders.length, note, latest };
  }

  function stableRenderOrderVarietySelection(form = els.sheet.querySelector("#sheetForm")) {
    const container = form?.querySelector("[data-order-variety-selection]");
    if (!container) return;
    const lines = stableCurrentOrderLines(form);
    container.innerHTML = lines.length
      ? lines.map((line) => `<span class="rest-variety-chip">${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  }

  function stableAddVarietyToOrder(form = els.sheet.querySelector("#sheetForm")) {
    if (!form?.elements) return;
    const select = form.querySelector('[name="orderVarietySelect"]');
    const varietyId = clean(select?.value);
    const variety = findById("varieties", varietyId);
    if (!variety) {
      toast("Vyber odrĹŻdu.");
      return;
    }
    const lines = stableCurrentOrderLines(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(variety.name));
    if (existingIndex >= 0) {
      const existing = lines[existingIndex];
      lines[existingIndex] = {
        ...existing,
        quantity: Math.max(existing.quantity || 1, 1) + 1,
        explicitPrice: clean(existing.explicitPrice) || clean(variety.salePrice),
      };
    } else {
      lines.push({
        raw: "",
        name: variety.name,
        quantity: 1,
        explicitPrice: clean(variety.salePrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => stableBuildOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    if (select) select.value = "";
    recalculateOrderSheetPrice(form);
    stableRenderOrderVarietySelection(form);
    stableRenderOrderStornoBlock(form);
    try {
      syncOrderSheetAlternates();
    } catch (error) {
      console.error("syncOrderSheetAlternates failed", error);
    }
    toast("OdrĹŻda pĹ™idĂˇna do objednĂˇvky.");
  }

  function stableRenderOrderStornoBlock(form = els.sheet.querySelector("#sheetForm")) {
    const block = form?.querySelector("[data-sheet-order-storno]");
    if (!form?.elements || !block) return;
    const activeLines = stableCurrentOrderLines(form);
    const stornoLines = stableReadStornoLines(form);
    if (activeLines.length && clean(form.elements.cancelledAt?.value)) {
      form.elements.cancelledAt.value = "";
      form.elements.cancelledNote.value = "";
    }
    const cancelledAt = clean(form.elements.cancelledAt?.value);
    const cancelledNote = clean(form.elements.cancelledNote?.value);
    const cancelledInfo = cancelledAt
      ? `ObjednĂˇvka stornovĂˇna ${new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(cancelledAt))}${cancelledNote ? ` Â· ${cancelledNote}` : ""}`
      : "";
    block.innerHTML = `
      <div class="order-storno-sheet-heading">
        <div>
          <strong>Storna</strong>
          <small>Toto se nepoÄŤĂ­tĂˇ do ceny.</small>
        </div>
        <button class="button ghost" type="button" data-stable-order-cancel-all ${activeLines.length ? "" : "disabled"}>Stornovat celou objednĂˇvku</button>
      </div>
      ${cancelledInfo ? `<div class="order-storno-sheet-status">${escapeHtml(cancelledInfo)}</div>` : ""}
      <div class="order-storno-sheet-list">
        ${activeLines.map((line, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>
            </div>
            <button class="button order-storno-sheet-action" type="button" data-stable-order-storno="${index}">Stornovat</button>
          </div>
        `).join("")}
        ${stornoLines.map((entry, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>âś• ${escapeHtml(entry.quantity > 1 ? `${entry.name} Â· ${quantityText(entry.quantity)} ks` : entry.name)}</span>
              ${clean(entry.note) ? `<small>${escapeHtml(entry.note)}</small>` : ""}
            </div>
            <button class="button order-storno-sheet-action" type="button" data-stable-order-restore="${index}">Obnovit</button>
          </div>
        `).join("")}
        ${!activeLines.length && !stornoLines.length ? '<div class="order-storno-sheet-status">ZatĂ­m bez storna.</div>' : ""}
      </div>
    `;
    block.querySelector("[data-stable-order-cancel-all]")?.addEventListener("click", () => stableCancelEntireOrder(form));
    block.querySelectorAll("[data-stable-order-storno]").forEach((button) => {
      button.addEventListener("click", () => stableStornoOrderLine(form, Number(button.dataset.stableOrderStorno)));
    });
    block.querySelectorAll("[data-stable-order-restore]").forEach((button) => {
      button.addEventListener("click", () => stableRestoreOrderLine(form, Number(button.dataset.stableOrderRestore)));
    });
  }

  function stableStornoOrderLine(form, index) {
    const lines = stableCurrentOrderLines(form);
    const line = lines[index];
    if (!line) return;
    const rawQuantity = window.prompt(`Kolik ks stornovat u ${line.name}?`, String(Math.max(line.quantity || 1, 1)));
    if (rawQuantity === null) return;
    const stornoQuantity = Number.parseInt(clean(rawQuantity), 10);
    const maxQuantity = Math.max(line.quantity || 1, 1);
    if (!Number.isFinite(stornoQuantity) || stornoQuantity < 1 || stornoQuantity > maxQuantity) {
      toast("NapiĹˇ platnĂ˝ poÄŤet kusĹŻ ke storno.");
      return;
    }
    const note = window.prompt("DĹŻvod storna (volitelnÄ›):", "") ?? "";
    const priceInfo = stableDefaultPriceInfo(line);
    const stornoLines = stableReadStornoLines(form);
    stornoLines.push({
      name: line.name,
      quantity: stornoQuantity,
      unitPrice: priceInfo.amount,
      currency: "CZK",
      note: clean(note),
      createdAt: new Date().toISOString(),
    });
    stableWriteStornoLines(form, stornoLines);
    const nextLines = lines.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return [stableBuildOrderLineText(item.name, item.quantity, item.explicitPrice)];
      const remaining = Math.max(maxQuantity - stornoQuantity, 0);
      return remaining ? [stableBuildOrderLineText(item.name, remaining, clean(item.explicitPrice) || priceInfo.amount)] : [];
    });
    form.elements.varietiesText.value = nextLines.join("\n");
    recalculateOrderSheetPrice(form);
    stableRenderOrderVarietySelection(form);
    stableRenderOrderStornoBlock(form);
    try {
      renderSheetRestWarning(form);
    } catch (error) {
      console.error("renderSheetRestWarning failed", error);
    }
    toast("PoloĹľka pĹ™esunuta do storna.");
  }

  function stableRestoreOrderLine(form, index) {
    const stornoLines = stableReadStornoLines(form);
    const entry = stornoLines[index];
    if (!entry) return;
    const lines = stableCurrentOrderLines(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(entry.name));
    if (existingIndex >= 0) {
      const existing = lines[existingIndex];
      lines[existingIndex] = {
        ...existing,
        quantity: Math.max(existing.quantity || 1, 1) + Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(existing.explicitPrice) || clean(entry.unitPrice),
      };
    } else {
      lines.push({
        raw: "",
        name: entry.name,
        quantity: Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(entry.unitPrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => stableBuildOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    stableWriteStornoLines(form, stornoLines.filter((_, itemIndex) => itemIndex !== index));
    form.elements.cancelledAt.value = "";
    form.elements.cancelledNote.value = "";
    recalculateOrderSheetPrice(form);
    stableRenderOrderVarietySelection(form);
    stableRenderOrderStornoBlock(form);
    try {
      renderSheetRestWarning(form);
    } catch (error) {
      console.error("renderSheetRestWarning failed", error);
    }
    toast("Storno vrĂˇceno do objednĂˇvky.");
  }

  function stableCancelEntireOrder(form) {
    const lines = stableCurrentOrderLines(form);
    if (!lines.length) {
      toast("ObjednĂˇvka uĹľ nemĂˇ ĹľĂˇdnĂ© aktivnĂ­ poloĹľky.");
      return;
    }
    const note = window.prompt("DĹŻvod storna celĂ© objednĂˇvky (volitelnÄ›):", clean(form.elements.cancelledNote?.value) || "");
    if (note === null) return;
    const stornoLines = stableReadStornoLines(form);
    lines.forEach((line) => {
      const priceInfo = stableDefaultPriceInfo(line);
      stornoLines.push({
        name: line.name,
        quantity: Math.max(line.quantity || 1, 1),
        unitPrice: clean(line.explicitPrice) || priceInfo.amount,
        currency: "CZK",
        note: clean(note),
        createdAt: new Date().toISOString(),
      });
    });
    stableWriteStornoLines(form, stornoLines);
    form.elements.varietiesText.value = "";
    form.elements.shippingFee.value = "";
    form.elements.shippingFeeLabel.value = "";
    form.elements.packingFee.value = "";
    form.elements.codFee.value = "";
    form.elements.cancelledAt.value = new Date().toISOString();
    form.elements.cancelledNote.value = clean(note);
    recalculateOrderSheetPrice(form);
    stableRenderOrderVarietySelection(form);
    stableRenderOrderStornoBlock(form);
    try {
      renderSheetRestWarning(form);
    } catch (error) {
      console.error("renderSheetRestWarning failed", error);
    }
    toast("CelĂˇ objednĂˇvka pĹ™esunuta do storna.");
  }

  function stableBindOrderSheet(form, order = {}) {
    if (!form?.elements) return;
    try {
      bindToggles();
    } catch (error) {
      console.error("bindToggles failed", error);
    }
    try {
      bindFees();
    } catch (error) {
      console.error("bindFees failed", error);
    }
    form.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
    syncOrderSheetCustomerValidity(form);
    try {
      syncOrderSheetAlternates();
    } catch (error) {
      console.error("syncOrderSheetAlternates failed", error);
    }
    try {
      renderSheetRestWarning(form);
    } catch (error) {
      console.error("renderSheetRestWarning failed", error);
    }
    stableRenderOrderVarietySelection(form);
    stableRenderOrderStornoBlock(form);
    form.querySelector("[data-order-variety-add]")?.addEventListener("click", () => stableAddVarietyToOrder(form));
    form.querySelector('[name="varietiesText"]')?.addEventListener("input", () => {
      recalculateOrderSheetPrice(form);
      stableRenderOrderVarietySelection(form);
      stableRenderOrderStornoBlock(form);
    });
    form.querySelector('[name="customerId"]')?.addEventListener("change", () => {
      syncOrderSheetCustomerValidity(form);
      if (form.elements.deliveryMethod?.value === "personal_pickup") {
        clearOrderSheetFeeRestoreSnapshot(form);
      } else {
        syncOrderSheetCountryShippingPreset(form);
      }
      form.__syncFeeButtons?.();
      try {
        syncOrderSheetAlternates();
      } catch (error) {
        console.error("syncOrderSheetAlternates failed", error);
      }
      try {
        renderSheetRestWarning(form);
      } catch (error) {
        console.error("renderSheetRestWarning failed", error);
      }
    });
    form.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
      const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
      if (form.elements.deliveryMethod.value === "personal_pickup") {
        if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
        els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
        form.elements.shippingFee.value = "";
        form.elements.shippingFeeLabel.value = "";
        form.elements.packingFee.value = "";
        form.elements.codFee.value = "";
        recalculateOrderSheetPrice(form);
      } else if (previousDelivery === "personal_pickup") {
        const restored = restoreOrderSheetFeeRestoreSnapshot(form);
        if (!restored) form.__syncFeeButtons?.();
        recalculateOrderSheetPrice(form);
      }
      form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
      stableRenderOrderStornoBlock(form);
    });
    els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
      syncOrderSheetCustomerValidity(form);
      if (!clean(form.elements.customerId?.value)) toast("Zvol zĂˇkaznĂ­ka.");
    });
    els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
      button.classList.toggle("active", sent);
      button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
    });
  }

  function stableOpenOrderSheetImpl(id = "", customerId = "") {
    const order = findById("orders", id) || {};
    const customers = state.data.customers || [];
    const selectedCustomerId = clean(order.customerId || customerId);
    const selectedCustomer = findCustomer(selectedCustomerId);
    const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
    const varietyOptions = ['<option value="">Vyber odrĹŻdu</option>']
      .concat(
        [...(state.data.varieties || [])]
          .slice()
          .sort((a, b) => clean(a.name).localeCompare(clean(b.name), "cs"))
          .map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`),
      )
      .join("");
    openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
      <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
        .slice()
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <section class="sheet-rest-warning" data-sheet-rest-warning hidden></section>
      <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
      ${toggle("paymentStatus", [["čeká", "Čeká"], ["nezaplaceno", "Neplatí"], ["zaplaceno", "Zaplaceno"]], normalizeOrderPaymentStatus(order.paymentStatus || "čeká"))}
      ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
      ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
      <div class="toggle-grid">
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "Zásilkovna ČR" ? "active" : ""}" type="button" data-fee="shipping-cz">Zásilkovna ČR · ${escapeHtml(appSettings().shippingFeeCz || "89")} Kč</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "Zásilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">Zásilkovna SK · ${escapeHtml(appSettings().shippingFeeSk || "99")} Kč</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "Balíkovna" ? "active" : ""}" type="button" data-fee="shipping-post">Balíkovna · ${escapeHtml(appSettings().postalFee || "")} Kč</button>
        <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">Zásilkovna na adresu · ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} Kč</button>
        <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">Balné · ${escapeHtml(appSettings().packingFee || "20")} Kč</button>
        <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">Dobírka · ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} Kč</button>
        ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "✓ Text odeslán" : "Text odeslán"}</button>` : ""}
      </div>
      <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
      <label class="field"><span>PĹ™idat odrĹŻdu</span><select name="orderVarietySelect">${varietyOptions}</select></label>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-order-variety-add>PĹ™idat odrĹŻdu</button></div>
      <div class="rest-variety-selection" data-order-variety-selection></div>
      <section class="order-alternate-sheet-block" data-sheet-order-alternates hidden></section>
      <textarea name="stornoLines" hidden>${escapeHtml(JSON.stringify(orderStornoLines(order)))}</textarea>
      <input name="cancelledAt" type="hidden" value="${escapeHtml(clean(order.cancelledAt))}">
      <input name="cancelledNote" type="hidden" value="${escapeHtml(clean(order.cancelledNote))}">
      <section class="order-storno-sheet-block" data-sheet-order-storno></section>
      <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
      <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
      <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
      <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
      <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const item = normalizeOrder({
        ...order,
        id: order.id || uid(),
        offerId: clean(data.get("offerId")),
        customerId: clean(data.get("customerId")),
        orderDate: clean(data.get("orderDate")) || todayInput(),
        paymentStatus: form.querySelector('[name="paymentStatus"]').value,
        shippingStatus: form.querySelector('[name="shippingStatus"]').value,
        deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
        varietiesText: clean(data.get("varietiesText")),
        stornoLines: stableNormalizeStornoLines(data.get("stornoLines")),
        cancelledAt: clean(data.get("cancelledAt")),
        cancelledNote: clean(data.get("cancelledNote")),
        price: clean(data.get("price")),
        shippingFee: clean(data.get("shippingFee")),
        shippingFeeLabel: clean(data.get("shippingFeeLabel")),
        packingFee: clean(data.get("packingFee")),
        codFee: clean(data.get("codFee")),
        note: clean(data.get("note")),
        createdAt: order.createdAt || now,
        updatedAt: now,
      });
      upsert("orders", item);
    });
    const form = els.sheet.querySelector("#sheetForm");
    stableBindOrderSheet(form, order);
  }

  function stableOpenOrderSheetFallback(id = "", customerId = "") {
    const order = findById("orders", id) || {};
    const customers = state.data.customers || [];
    const selectedCustomerId = clean(order.customerId || customerId);
    const selectedCustomer = findCustomer(selectedCustomerId);
    const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
    openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
      <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
        .slice()
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
      ${toggle("paymentStatus", [["čeká", "Čeká"], ["nezaplaceno", "Neplatí"], ["zaplaceno", "Zaplaceno"]], normalizeOrderPaymentStatus(order.paymentStatus || "čeká"))}
      ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
      ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
      <div class="toggle-grid">
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
        <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
      </div>
      <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
      <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
      <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
      <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
      <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
      <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const item = normalizeOrder({
        ...order,
        id: order.id || uid(),
        offerId: clean(data.get("offerId")),
        customerId: clean(data.get("customerId")),
        orderDate: clean(data.get("orderDate")) || todayInput(),
        paymentStatus: form.querySelector('[name="paymentStatus"]').value,
        shippingStatus: form.querySelector('[name="shippingStatus"]').value,
        deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
        varietiesText: clean(data.get("varietiesText")),
        price: clean(data.get("price")),
        shippingFee: clean(data.get("shippingFee")),
        shippingFeeLabel: clean(data.get("shippingFeeLabel")),
        packingFee: clean(data.get("packingFee")),
        codFee: clean(data.get("codFee")),
        note: clean(data.get("note")),
        createdAt: order.createdAt || now,
        updatedAt: now,
      });
      upsert("orders", item);
    });
    const form = els.sheet.querySelector("#sheetForm");
    try {
      bindToggles();
      bindFees();
      form?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
      syncOrderSheetCustomerValidity(form);
      form?.querySelector('[name="varietiesText"]')?.addEventListener("input", () => recalculateOrderSheetPrice(form));
    } catch (error) {
      console.error("fallback order sheet bind failed", error);
    }
  }

  function stableOpenOrderSheet(id = "", customerId = "") {
    try {
      stableOpenOrderSheetImpl(id, customerId);
    } catch (error) {
      console.error("stableOpenOrderSheet failed", error);
      toast("ObjednĂˇvka se otevĹ™ela v nouzovĂ©m reĹľimu.");
      stableOpenOrderSheetFallback(id, customerId);
    }
  }

  renderCustomers = function renderCustomersStableFinal() {
    const customers = state.data.customers.filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
    if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
    return customers.map((customer) => {
      const stornoMeta = stableLatestCustomerStorno(customer.id);
      const stornoText = stornoMeta.count
        ? [`<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>`, stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""].filter(Boolean).join("")
        : "";
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoMeta.count ? "customer-storno-card" : "",
        title: customerName(customer),
        sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>") + stornoText,
        pills: [...(customer.tags || []), ...(stornoMeta.count ? [`Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`] : [])],
        actions: [["order-customer", "+"], ["edit-customer", "âśŽ"], ["delete-customer", "Ă—"]],
      });
    }).join("");
  };

  renderOrders = function renderOrdersStableFinal() {
    const orders = state.data.orders.filter(matchOrder).sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)));
    if (!orders.length) return empty("Ĺ˝ĂˇdnĂ© objednĂˇvky.");
    return orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const stornoMeta = stableLatestCustomerStorno(order.customerId);
      const hasStorno = orderHasStorno(order);
      const tone = stornoMeta.count || hasStorno
        ? "reject"
        : order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus)
          ? "done"
          : order.paymentStatus === "zaplaceno"
            ? "progress"
            : "attention";
      const stornoMarkup = stornoMeta.count
        ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}`
        : "";
      return card({
        id: order.id,
        type: "order",
        tone,
        title: compactName(customerName(customer) || "Bez zĂˇkaznĂ­ka"),
        sub: [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" Â· ") + stornoMarkup,
        price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
        pills: [
          ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => `đźŚż ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`),
          ...orderOfferAlternateEntries(order).map((item) => ({ label: `âš  NĂˇhradnĂ­k: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
          ...orderStornoLines(order).map((item) => ({ label: `âś• Storno: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
        ],
        badges: [
          stornoMeta.count ? `Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}` : "",
          hasStorno ? "Storno" : "",
          paymentPill(order),
          statusPill(order),
          orderPaymentTextPill(order),
        ].filter(Boolean),
        actions: [["copy-order", "đź“‹"], ["toggle-order-text-sent", clean(order.paymentTextSentAt) ? "âś“Txt" : "Txt"], ["edit-order", "âśŽ"], ["delete-order", "Ă—"]],
      });
    }).join("");
  };

  globalThis.__akOpenOrderSheetStable84 = stableOpenOrderSheet;
  globalThis.__akRenderCustomersStable84 = renderCustomers;
  globalThis.__akRenderOrdersStable84 = renderOrders;
  globalThis.__akOpenOrderSheetFinal = stableOpenOrderSheet;
  openOrderSheet = stableOpenOrderSheet;
  globalThis.__akRenderCustomersFinal = renderCustomers;

  if (!globalThis.__akOrderCardClickBridgeFinal84) {
    globalThis.__akOrderCardClickBridgeFinal84 = true;
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const editOrderButton = target.closest('[data-action-row="edit-order"]');
      if (editOrderButton?.dataset?.id) {
        event.preventDefault();
        event.stopPropagation();
        stableOpenOrderSheet(editOrderButton.dataset.id);
        return;
      }
      const orderCard = target.closest('[data-card="order"]');
      if (!orderCard?.dataset?.id) return;
      if (target.closest("button")) return;
      event.preventDefault();
      event.stopPropagation();
      stableOpenOrderSheet(orderCard.dataset.id);
    }, true);
  }

  if (typeof render === "function") {
    render();
    setTimeout(() => render(), 0);
  }
})();
(() => {
  const ak90BaseOfferSheet = openOfferSheet;
  const ak90BaseOfferDetail = openOfferDetailSheet;
  const ak90StableOpenOrder =
    globalThis.__akOpenOrderSheetReal ||
    globalThis.__akOpenOrderSheetStable84 ||
    globalThis.__akOpenOrderSheetFinal ||
    openOrderSheet;

  function ak90RestNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function ak90RestCustomerText(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez zĂˇkaznĂ­ka";
  }

  function ak90LatestStornoNote(orders = []) {
    for (const order of orders) {
      const cancelledNote = clean(order?.cancelledNote);
      if (cancelledNote) return cancelledNote;
      const lineNote = orderStornoLines(order)
        .slice()
        .reverse()
        .find((entry) => clean(entry.note));
      if (lineNote) return clean(lineNote.note);
    }
    return "";
  }

  function ak90CustomerStornoMeta(customerId = "") {
    const stornoOrders = customerStornoOrders(customerId)
      .slice()
      .sort((a, b) => String(b.updatedAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.orderDate || "")));
    return {
      count: stornoOrders.length,
      note: ak90LatestStornoNote(stornoOrders),
    };
  }

  function ak90SafeOrderTone(order = {}) {
    if (customerStornoOrders(order.customerId).length || orderHasStorno(order)) return "reject";
    if (order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus)) return "done";
    if (order.paymentStatus === "zaplaceno") return "progress";
    return "attention";
  }

  function ak90RenderOfferCard(offer) {
    try {
      if (isRestOffer(offer)) {
        const names = ak90RestNames(offer);
        const pills = names.slice(0, 4).map((name) => name);
        if (names.length > 4) pills.push(`+${names.length - 4} dalĹˇĂ­`);
        if (clean(offer.note)) pills.push({ label: clean(offer.note), className: "warn" });
        return card({
          id: offer.id,
          type: "offer",
          title: offer.title,
          sub: [formatDate(offer.date), ak90RestCustomerText(offer)].filter(Boolean).join(" Â· "),
          pills,
          badges: [{ label: "Resty", className: "warn" }],
          actions: [["edit-offer", "Upr"], ["delete-offer", "X"]],
        });
      }

      const offerItems = sortedOfferItems(offer);
      const reserved = offerReservedCount(offer);
      const total = offerTotalCount(offer);
      const available = offerAvailableCount(offer);
      const alternates = offerAlternateCount(offer);
      const coverImage = offerItems.map((item) => offerItemImage(item)).find(Boolean) || "";
      const itemPills = offerItems.slice(0, 4).map((item) => offerItemName(item));
      if (offerItems.length > 4) itemPills.push(`+${offerItems.length - 4} dalĹˇĂ­`);
      return card({
        id: offer.id,
        type: "offer",
        title: offer.title,
        sub: [formatDate(offer.date), offerTypeLabel(offer), offer.status].filter(Boolean).join(" Â· "),
        pills: [
          ...itemPills,
          `VolnĂ© ${available}`,
          `Rezervace ${reserved}/${total}`,
          alternates ? `NĂˇhradnĂ­ci ${alternates}` : "",
        ].filter(Boolean),
        thumb: coverImage,
        thumbText: initials(offer.title),
        actions: [["facebook-offer", "FB"], ["edit-offer", "Upr"], ["delete-offer", "X"]],
      });
    } catch (error) {
      console.error("AK90 offer card render failed", error, offer);
      return card({
        id: offer?.id || "",
        type: "offer",
        title: offer?.title || "NabĂ­dka",
        sub: formatDate(offer?.date || ""),
        pills: [isRestOffer(offer) ? "Resty" : "NabĂ­dka"],
        actions: [["edit-offer", "Upr"], ["delete-offer", "X"]],
      });
    }
  }

  function ak90RenderOffers() {
    const offers = (state.data.offers || [])
      .filter(matchOffer)
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
    const regularOffers = offers.filter((offer) => !isRestOffer(offer));
    const restOffers = offers.filter((offer) => isRestOffer(offer));
    const groups = [
      regularOffers.length
        ? `<div class="card-group-heading">NabĂ­dky</div>${regularOffers.map((offer) => ak90RenderOfferCard(offer)).join("")}`
        : "",
      restOffers.length
        ? `<div class="card-group-heading">Resty</div>${restOffers.map((offer) => ak90RenderOfferCard(offer)).join("")}`
        : "",
    ].filter(Boolean);
    return groups.join("");
  }

  function ak90RenderOrders() {
    const orders = (state.data.orders || [])
      .filter(matchOrder)
      .slice()
      .sort((a, b) => String(b.orderDate || "").localeCompare(String(a.orderDate || "")));
    if (!orders.length) return empty("Ĺ˝ĂˇdnĂ© objednĂˇvky.");
    return orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const stornoMeta = ak90CustomerStornoMeta(order.customerId);
      return card({
        id: order.id,
        type: "order",
        tone: ak90SafeOrderTone(order),
        title: compactName(customerName(customer) || "Bez zĂˇkaznĂ­ka"),
        sub: [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" Â· ")
          + (stornoMeta.count
            ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}`
            : ""),
        price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
        pills: [
          ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name),
          ...orderOfferAlternateEntries(order).map((item) => ({
            label: `NĂˇhradnĂ­k: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`,
            className: "danger order-alternate-preview-pill",
          })),
          ...orderStornoLines(order).map((item) => ({
            label: `Storno: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`,
            className: "danger order-alternate-preview-pill",
          })),
        ],
        badges: [
          stornoMeta.count ? { label: `Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`, className: "danger" } : "",
          orderHasStorno(order) ? { label: "Storno", className: "danger" } : "",
          paymentPill(order),
          statusPill(order),
          orderPaymentTextPill(order),
        ].filter(Boolean),
        actions: [["copy-order", "Kop"], ["toggle-order-text-sent", clean(order.paymentTextSentAt) ? "Txtâś“" : "Txt"], ["edit-order", "Upr"], ["delete-order", "X"]],
      });
    }).join("");
  }

  function ak90RenderCustomers() {
    const customers = (state.data.customers || [])
      .filter(matchCustomer)
      .slice()
      .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
    if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
    return customers.map((customer) => {
      const stornoMeta = ak90CustomerStornoMeta(customer.id);
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoMeta.count ? "customer-storno-card" : "",
        title: customerName(customer),
        sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>")
          + (stornoMeta.count
            ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}`
            : ""),
        pills: [...(customer.tags || []), ...(stornoMeta.count ? [`Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`] : [])],
        actions: [["order-customer", "+"], ["edit-customer", "Upr"], ["delete-customer", "X"]],
      });
    }).join("");
  }

  function ak90RenderVarieties() {
    const varieties = (state.data.varieties || [])
      .filter(matchVariety)
      .slice()
      .sort((a, b) => naturalCompare(a.name, b.name));
    if (!varieties.length) return empty("Ĺ˝ĂˇdnĂ© odrĹŻdy.");
    return varieties.map((variety) => card({
      id: variety.id,
      type: "variety",
      title: `đźŚ± ${variety.name}`,
      sub: `${varietyImages(variety).length ? `${varietyImages(variety).length} fotek` : "Bez fotky"} Â· ${varietyUsageCount(variety.name)} zĂˇznamĹŻ`,
      price: variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny",
      thumb: varietyImages(variety)[0],
      thumbText: initials(variety.name),
      pills: [variety.active === false ? "NeaktivnĂ­" : "AktivnĂ­"],
      actions: [["edit-variety", "Upr"], ["delete-variety", "X"]],
    })).join("");
  }

  function ak90RenderCrosses() {
    const crosses = (state.data.crosses || [])
      .filter(matchCross)
      .slice()
      .sort((a, b) => String(b.pollinatedAt || "").localeCompare(String(a.pollinatedAt || "")));
    if (!crosses.length) return empty("Ĺ˝ĂˇdnĂˇ kĹ™Ă­ĹľenĂ­.");
    return crosses.map((cross) => card({
      id: cross.id,
      type: "cross",
      tone: cross.resultRating === "hnusna" ? "reject" : cross.stage === "hotovo" ? "done" : "attention",
      title: crossLineage(cross),
      sub: cross.seedlingName || "",
      thumb: crossSeedlingImages(cross)[0],
      thumbText: initials(crossLineage(cross)),
      pills: [crossStageText(cross.stage), ratingLabels[cross.resultRating] ? `âś“ ${ratingLabels[cross.resultRating]}` : "Bez hodnocenĂ­", cross.seedlingName || "â€”"],
      actions: [["download-cross", "Karta"], ["edit-cross", "Upr"], ["delete-cross", "X"]],
    })).join("");
  }

  function ak90RenderSync() {
    try {
      return renderSync();
    } catch (error) {
      console.error("AK90 sync render failed", error);
      return '<section class="sync-card"><strong class="title">NastavenĂ­</strong><p class="sub">Tahle sekce se nepodaĹ™ila otevĹ™Ă­t.</p></section>';
    }
  }

  function ak90OpenRestDetail(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer) return;
    state.activeOfferId = id;
    const names = ak90RestNames(offer);
    const body = `<section class="offer-detail">
      <div class="pill-row"><span class="pill warn">Resty</span></div>
      <div class="rest-meta-stack">
        <div class="rest-meta-card"><small>Datum</small><strong>${escapeHtml(formatDate(offer.date))}</strong></div>
        <div class="rest-meta-card"><small>ZĂˇkaznĂ­k</small><strong>${escapeHtml(ak90RestCustomerText(offer))}</strong></div>
        ${names.length ? `<div class="rest-meta-card"><small>${names.length > 1 ? "OdrĹŻdy" : "OdrĹŻda"}</small><strong>${escapeHtml(names.join(", "))}</strong></div>` : ""}
        ${clean(offer.note) ? `<div class="rest-meta-card"><small>PoznĂˇmka</small><strong>${escapeHtml(offer.note)}</strong></div>` : ""}
      </div>
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>ZavĹ™Ă­t</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
      <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">VytvoĹ™it objednĂˇvku</button>`;
    openSheet(offer.title, body, null, footer, {
      ...options,
      restore: () => openOfferDetailSheet(id, { replace: true }),
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  }

  openOfferDetailSheet = function openOfferDetailSheetAk90(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer) return;
    if (isRestOffer(offer)) return ak90OpenRestDetail(id, options);
    try {
      return ak90BaseOfferDetail(id, options);
    } catch (error) {
      console.error("AK90 offer detail fallback failed", error);
      try {
        return ak90BaseOfferSheet(id);
      } catch (sheetError) {
        console.error("AK90 offer sheet fallback failed", sheetError);
        toast("NabĂ­dka se nepodaĹ™ila otevĹ™Ă­t.");
      }
    }
  };

  function ak90BindSyncButtons() {
    const bindClick = (selector, handler) => {
      const node = document.querySelector(selector);
      if (node) node.onclick = handler;
    };
    bindClick("#syncLogin", loginSync);
    bindClick("#syncLogout", logoutSync);
    bindClick("#syncPush", () => pushSync());
    bindClick("#syncPull", () => pullSync());
    bindClick("#syncAuto", toggleAutoSync);
    ["syncUrl", "syncAnon", "syncEmail", "syncPassword"].forEach((id) => {
      const node = document.querySelector(`#${id}`);
      if (node) node.oninput = saveSyncConfigFromInputs;
    });
    const settingsButton = document.querySelector("#saveAppSettings");
    if (settingsButton) settingsButton.onclick = saveAppSettingsFromInputs;
  }

  function ak90ReplaceListHost() {
    if (!els.list || els.list.dataset.ak90Host === "1") return;
    const clone = els.list.cloneNode(false);
    clone.dataset.ak90Host = "1";
    els.list.replaceWith(clone);
    els.list = clone;
  }

  function ak90HandleRowAction(action, id) {
    if (action === "edit-order") return ak90StableOpenOrder?.(id);
    if (action === "order-customer") return ak90StableOpenOrder?.("", id);
    return handleRowAction(action, id);
  }

  function ak90HandleListClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const actionButton = target.closest("[data-action-row]");
    if (actionButton && els.list.contains(actionButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return ak90HandleRowAction(actionButton.dataset.actionRow || "", actionButton.dataset.id || "");
    }

    const cardEl = target.closest("[data-card]");
    if (!cardEl || !els.list.contains(cardEl) || target.closest("button")) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const type = cardEl.dataset.card;
    const id = cardEl.dataset.id || "";
    if (type === "offer") return openOfferDetailSheet(id);
    if (type === "order") return ak90StableOpenOrder?.(id);
    if (type === "customer") return openCustomerSheet(id);
    if (type === "variety") return openVarietyDetailSheet(id);
    if (type === "cross") return openCrossDetailSheet(id);
  }

  function ak90RunAction(action) {
    if (action === "new-offer") return openOfferSheet();
    if (action === "new-rest-offer") return openOfferSheet("", { type: "rests" });
    if (action === "new-order") return ak90StableOpenOrder?.();
    if (action === "new-customer") return openCustomerSheet();
    if (action === "new-variety") return openVarietySheet();
    if (action === "new-cross") return openCrossSheet();
  }

  function ak90BindStaticButtons() {
    document.querySelectorAll("[data-view], [data-action]").forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) return;
      const clone = node.cloneNode(true);
      clone.dataset.ak90Bound = "1";
      node.replaceWith(clone);
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        openView(button.dataset.view || "offers");
      }, true);
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        ak90RunAction(button.dataset.action || "");
      }, true);
    });
  }

  renderOffers = ak90RenderOffers;
  renderOrders = ak90RenderOrders;
  renderCustomers = ak90RenderCustomers;
  renderVarieties = ak90RenderVarieties;
  renderCrosses = ak90RenderCrosses;
  bindListActions = function bindListActionsAk90() {};
  runAction = ak90RunAction;

  render = function renderAk90() {
    if (!isSyncLoggedIn()) state.view = "sync";
    document.body.classList.toggle("private-locked", !isSyncLoggedIn());
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));

    try {
      renderFilters();
    } catch (error) {
      console.error("AK90 renderFilters failed", error);
      if (els.filterRow) els.filterRow.innerHTML = "";
    }

    try {
      renderSummary();
    } catch (error) {
      console.error("AK90 renderSummary failed", error);
      if (els.summary) els.summary.innerHTML = "";
    }

    ak90ReplaceListHost();

    const renderers = {
      offers: ak90RenderOffers,
      orders: ak90RenderOrders,
      customers: ak90RenderCustomers,
      varieties: ak90RenderVarieties,
      crosses: ak90RenderCrosses,
      sync: ak90RenderSync,
    };

    try {
      els.list.innerHTML = renderers[state.view]?.() || "";
    } catch (error) {
      console.error("AK90 section render failed", error);
      els.list.innerHTML = empty("Tahle sekce se nepodaĹ™ila otevĹ™Ă­t.");
    }

    try {
      resolvePhotos(els.list);
    } catch (error) {
      console.error("AK90 resolvePhotos failed", error);
    }

    try {
      ak90BindSyncButtons();
    } catch (error) {
      console.error("AK90 bindSyncButtons failed", error);
    }

    try {
      updateSyncIndicator();
    } catch (error) {
      console.error("AK90 updateSyncIndicator failed", error);
    }
  };

  openView = function openViewAk90(view) {
    if (!isSyncLoggedIn() && view !== "sync") {
      state.view = "sync";
      render();
      toast("NejdĹ™Ă­v se pĹ™ihlas.");
      return;
    }
    state.view = view;
    state.filter = "all";
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    if (els.search) els.search.value = "";
    state.query = "";
    closeSheet({ all: true });
    render();
  };

  if (typeof ak90StableOpenOrder === "function") {
    openOrderSheet = ak90StableOpenOrder;
    globalThis.__akOpenOrderSheetFinal = ak90StableOpenOrder;
  }

  ak90ReplaceListHost();
  if (!globalThis.__akMobileListDelegation90) {
    globalThis.__akMobileListDelegation90 = true;
    els.list.addEventListener("click", ak90HandleListClick, true);
  }
  ak90BindStaticButtons();
  render();
})();
(() => {
  function eof2LatestCustomerStorno(customerId = "") {
    const orders = customerStornoOrders(customerId)
      .slice()
      .sort((a, b) => String(b.updatedAt || b.cancelledAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.cancelledAt || a.orderDate || "")));
    const latest = orders[0] || null;
    let note = clean(latest?.cancelledNote);
    if (!note && latest) {
      const entry = orderStornoLines(latest).slice().reverse().find((item) => clean(item.note));
      note = clean(entry?.note);
    }
    return { count: orders.length, note, latest };
  }

  function eof2OrderTone(order = {}) {
    if (customerStornoOrders(order.customerId).length || orderHasStorno(order)) return "reject";
    if (order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus)) return "done";
    if (order.paymentStatus === "zaplaceno") return "progress";
    return "attention";
  }

  function eof2RenderOffers() {
    const offers = (state.data.offers || []).filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
    const groups = splitOffersByType(offers);
    const renderGroup = (label, items) => {
      if (!items.length) return "";
      return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
        const items = sortedOfferItems(offer);
        const reserved = offerReservedCount(offer);
        const total = offerTotalCount(offer);
        const available = offerAvailableCount(offer);
        const alternates = offerAlternateCount(offer);
        const coverImage = items.map((item) => offerItemImage(item)).find(Boolean) || "";
        const itemPills = items.slice(0, 4).map((item) => `đźŚż ${offerItemName(item)}`);
        if (items.length > 4) itemPills.push(`+${items.length - 4} dalĹˇĂ­`);
        return card({
          id: offer.id,
          type: "offer",
          title: offer.title,
          sub: [formatDate(offer.date), offerTypeLabel(offer), offer.status].filter(Boolean).join(" Â· "),
          pills: [...itemPills, `VolnĂ© ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `NĂˇhradnĂ­ci ${alternates}` : ""],
          badges: isRestOffer(offer) ? [{ label: "Resty", className: "warn" }] : [],
          thumb: coverImage,
          thumbText: initials(offer.title),
          actions: [["facebook-offer", "FB"], ["edit-offer", "Upr"], ["delete-offer", "X"]],
        });
      }).join("")}`;
    };
    return [renderGroup("NabĂ­dky", groups.offers), renderGroup("Resty", groups.rests)].filter(Boolean).join("");
  }

  function eof2RenderOrders() {
    const orders = (state.data.orders || []).filter(matchOrder).sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)));
    if (!orders.length) return empty("Ĺ˝ĂˇdnĂ© objednĂˇvky.");
    return orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const stornoMeta = eof2LatestCustomerStorno(order.customerId);
      const stornoText = stornoMeta.count
        ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}`
        : "";
      return card({
        id: order.id,
        type: "order",
        tone: eof2OrderTone(order),
        title: compactName(customerName(customer) || "Bez zĂˇkaznĂ­ka"),
        sub: [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" Â· ") + stornoText,
        price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
        pills: [
          ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => `đźŚż ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`),
          ...orderOfferAlternateEntries(order).map((item) => ({ label: `âš  NĂˇhradnĂ­k: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
          ...orderStornoLines(order).map((item) => ({ label: `âś• Storno: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
        ],
        badges: [stornoMeta.count ? `Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}` : "", orderHasStorno(order) ? "Storno" : "", paymentPill(order), statusPill(order), orderPaymentTextPill(order)].filter(Boolean),
        actions: [["copy-order", "Kop"], ["toggle-order-text-sent", clean(order.paymentTextSentAt) ? "Txtâś“" : "Txt"], ["edit-order", "Upr"], ["delete-order", "X"]],
      });
    }).join("");
  }

  function eof2RenderCustomers() {
    const customers = (state.data.customers || []).filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
    if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
    return customers.map((customer) => {
      const stornoMeta = eof2LatestCustomerStorno(customer.id);
      const stornoText = stornoMeta.count
        ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}`
        : "";
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoMeta.count ? "customer-storno-card" : "",
        title: customerName(customer),
        sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>") + stornoText,
        pills: [...(customer.tags || []), ...(stornoMeta.count ? [`Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`] : [])],
        actions: [["order-customer", "+"], ["edit-customer", "Upr"], ["delete-customer", "X"]],
      });
    }).join("");
  }

  function eof2RenderVarieties() {
    const varieties = (state.data.varieties || []).filter(matchVariety).sort((a, b) => naturalCompare(a.name, b.name));
    if (!varieties.length) return empty("Ĺ˝ĂˇdnĂ© odrĹŻdy.");
    return varieties.map((variety) => card({
      id: variety.id,
      type: "variety",
      title: `đźŚ± ${variety.name}`,
      sub: `${varietyImages(variety).length ? `${varietyImages(variety).length} fotek` : "Bez fotky"} Â· ${varietyUsageCount(variety.name)} zĂˇznamĹŻ`,
      price: variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny",
      thumb: varietyImages(variety)[0],
      thumbText: initials(variety.name),
      pills: [variety.active === false ? "NeaktivnĂ­" : "AktivnĂ­"],
      actions: [["edit-variety", "Upr"], ["delete-variety", "X"]],
    })).join("");
  }

  function eof2RenderCrosses() {
    const crosses = (state.data.crosses || []).filter(matchCross).sort((a, b) => String(b.pollinatedAt).localeCompare(String(a.pollinatedAt)));
    if (!crosses.length) return empty("Ĺ˝ĂˇdnĂˇ kĹ™Ă­ĹľenĂ­.");
    return crosses.map((cross) => {
      const tone = cross.resultRating === "hnusna" ? "reject" : cross.stage === "hotovo" ? "done" : "attention";
      return card({
        id: cross.id,
        type: "cross",
        tone,
        title: crossLineage(cross),
        sub: cross.seedlingName || "",
        thumb: crossSeedlingImages(cross)[0],
        thumbText: initials(crossLineage(cross)),
        pills: [crossStageText(cross.stage), ratingLabels[cross.resultRating] ? `âś“ ${ratingLabels[cross.resultRating]}` : "Bez hodnocenĂ­", cross.seedlingName || "â€”"],
        actions: [["download-cross", "Karta"], ["edit-cross", "Upr"], ["delete-cross", "X"]],
      });
    }).join("");
  }

  const previousOpenOfferDetailSheetEOF2 = openOfferDetailSheet;
  openOfferDetailSheet = function openOfferDetailSheetStableEOF(id, options = {}) {
    const offer = findById("offers", id);
    if (offer && isRestOffer(offer)) {
      return previousOpenOfferDetailSheetEOF2(id, options);
    }
    return previousOpenOfferDetailSheetEOF2(id, options);
  };

  function eof2BindStaticButtons() {
    document.querySelectorAll("[data-view], [data-action]").forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) return;
      if (node.dataset.eof2bound === "1") return;
      const clone = node.cloneNode(true);
      clone.dataset.eof2bound = "1";
      node.replaceWith(clone);
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        openView(button.dataset.view || "offers");
      }, true);
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const action = button.dataset.action || "";
        if (action === "new-offer") return openOfferSheet();
        if (action === "new-rest-offer") return openOfferSheet("", { type: "rests" });
        if (action === "new-order") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)();
        if (action === "new-customer") return openCustomerSheet();
        if (action === "new-variety") return openVarietySheet();
        if (action === "new-cross") return openCrossSheet();
      }, true);
    });
  }

  if (!globalThis.__akMobileListDelegationFinal87) {
    globalThis.__akMobileListDelegationFinal87 = true;
    els.list.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const actionButton = target.closest("[data-action-row]");
      if (actionButton?.dataset?.actionRow) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const action = actionButton.dataset.actionRow;
        const id = actionButton.dataset.id || "";
        if (action === "edit-order") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(id);
        if (action === "order-customer") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)("", id);
        return handleRowAction(action, id);
      }

      const cardEl = target.closest("[data-card]");
      if (!cardEl?.dataset?.card || target.closest("button")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      const type = cardEl.dataset.card;
      const id = cardEl.dataset.id || "";
      if (type === "order") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(id);
      if (type === "customer") return openCustomerSheet(id);
      if (type === "variety") return openVarietyDetailSheet(id);
      if (type === "cross") return openCrossDetailSheet(id);
      if (type === "offer") return openOfferDetailSheet(id);
    }, true);
  }

  bindListActions = function bindListActionsStableEOF2() {
    document.querySelector("#syncLogin")?.addEventListener("click", loginSync, { capture: true });
    document.querySelector("#syncLogout")?.addEventListener("click", logoutSync, { capture: true });
    document.querySelector("#saveAppSettings")?.addEventListener("click", saveAppSettingsFromInputs, { capture: true });
  };

  renderCustomers = eof2RenderCustomers;
  renderOrders = eof2RenderOrders;
  renderOffers = eof2RenderOffers;
  renderVarieties = eof2RenderVarieties;
  renderCrosses = eof2RenderCrosses;

  render = function renderStableEOF2() {
    if (!isSyncLoggedIn()) state.view = "sync";
    document.body.classList.toggle("private-locked", !isSyncLoggedIn());
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
    try {
      renderFilters();
    } catch (error) {
      console.error("renderFilters failed", error);
      els.filterRow.innerHTML = "";
    }
    try {
      renderSummary();
    } catch (error) {
      console.error("renderSummary failed", error);
      els.summary.innerHTML = "";
    }
    const renderers = {
      offers: renderOffers,
      orders: renderOrders,
      customers: renderCustomers,
      varieties: renderVarieties,
      crosses: renderCrosses,
      sync: renderSync,
    };
    els.list.innerHTML = "";
    try {
      els.list.innerHTML = renderers[state.view]?.() || "";
    } catch (error) {
      console.error("mobile eof2 render failed", error);
      els.list.innerHTML = empty("Tahle sekce se nepodaĹ™ila otevĹ™Ă­t.");
    }
    try { resolvePhotos(els.list); } catch (error) { console.error("resolvePhotos failed", error); }
    try { bindListActions(); } catch (error) { console.error("bindListActions failed", error); }
    try { updateSyncIndicator(); } catch (error) { console.error("updateSyncIndicator failed", error); }
  };

  openView = function openViewStableEOF2(view) {
    if (!isSyncLoggedIn() && view !== "sync") {
      state.view = "sync";
      render();
      toast("NejdĹ™Ă­v se pĹ™ihlas.");
      return;
    }
    state.view = view;
    state.filter = "all";
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    if (els.search) els.search.value = "";
    state.query = "";
    closeSheet({ all: true });
    render();
  };

  eof2BindStaticButtons();
  render();
})();
(() => {
  function eof3CustomerStornoMeta(customerId = "") {
    const orders = customerStornoOrders(customerId)
      .slice()
      .sort((a, b) => String(b.updatedAt || b.cancelledAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.cancelledAt || a.orderDate || "")));
    const latest = orders[0] || null;
    let note = clean(latest?.cancelledNote);
    if (!note && latest) {
      const latestLine = orderStornoLines(latest).slice().reverse().find((entry) => clean(entry.note));
      note = clean(latestLine?.note);
    }
    return { count: orders.length, note };
  }

  function eof3RenderOffers() {
    const offers = (state.data.offers || []).filter(matchOffer).sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
    const groups = splitOffersByType(offers);
    const renderGroup = (label, items) => {
      if (!items.length) return "";
      return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
        const itemCount = Array.isArray(offer.items) ? offer.items.length : 0;
        const available = offerAvailableCount(offer);
        const reserved = offerReservedCount(offer);
        const alternates = offerAlternateCount(offer);
        const coverImage = (Array.isArray(offer.items) ? offer.items : []).map((item) => offerItemImage(item)).find(Boolean) || "";
        return card({
          id: offer.id,
          type: "offer",
          title: offer.title || (isRestOffer(offer) ? "Resty" : "NabĂ­dka"),
          sub: [formatDate(offer.date), offer.status].filter(Boolean).join(" Â· "),
          pills: [
            itemCount ? `${itemCount} poloĹľek` : "Bez poloĹľek",
            !isRestOffer(offer) ? `VolnĂ© ${available}` : "",
            !isRestOffer(offer) ? `Rezervace ${reserved}` : "",
            !isRestOffer(offer) && alternates ? `NĂˇhradnĂ­ci ${alternates}` : "",
          ].filter(Boolean),
          badges: isRestOffer(offer) ? [{ label: "Resty", className: "warn" }] : [],
          thumb: coverImage,
          thumbText: initials(offer.title || "N"),
          actions: [["edit-offer", "Upr"], ["delete-offer", "X"]],
        });
      }).join("")}`;
    };
    return [renderGroup("NabĂ­dky", groups.offers), renderGroup("Resty", groups.rests)].filter(Boolean).join("");
  }

  function eof3RenderOrders() {
    const orders = (state.data.orders || []).filter(matchOrder).sort((a, b) => String(b.orderDate || "").localeCompare(String(a.orderDate || "")));
    if (!orders.length) return empty("Ĺ˝ĂˇdnĂ© objednĂˇvky.");
    return orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const stornoMeta = eof3CustomerStornoMeta(order.customerId);
      const sub = [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" Â· ")
        + (stornoMeta.count ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}` : "");
      return card({
        id: order.id,
        type: "order",
        tone: customerStornoOrders(order.customerId).length || orderHasStorno(order)
          ? "reject"
          : order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus)
            ? "done"
            : order.paymentStatus === "zaplaceno"
              ? "progress"
              : "attention",
        title: compactName(customerName(customer) || "Bez zĂˇkaznĂ­ka"),
        sub,
        price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
        pills: [
          ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => `đźŚż ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`),
          ...orderOfferAlternateEntries(order).map((item) => ({ label: `âš  NĂˇhradnĂ­k: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
          ...orderStornoLines(order).map((item) => ({ label: `âś• Storno: ${item.quantity > 1 ? `${item.name} Â· ${quantityText(item.quantity)} ks` : item.name}`, className: "danger order-alternate-preview-pill" })),
        ],
        badges: [
          stornoMeta.count ? `Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}` : "",
          orderHasStorno(order) ? "Storno" : "",
          paymentPill(order),
          statusPill(order),
          orderPaymentTextPill(order),
        ].filter(Boolean),
        actions: [["copy-order", "Kop"], ["toggle-order-text-sent", clean(order.paymentTextSentAt) ? "Txtâś“" : "Txt"], ["edit-order", "Upr"], ["delete-order", "X"]],
      });
    }).join("");
  }

  function eof3RenderCustomers() {
    const customers = (state.data.customers || []).filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
    if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
    return customers.map((customer) => {
      const stornoMeta = eof3CustomerStornoMeta(customer.id);
      const sub = [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>")
        + (stornoMeta.count ? `<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>${stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""}` : "");
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoMeta.count ? "customer-storno-card" : "",
        title: customerName(customer),
        sub,
        pills: [...(customer.tags || []), ...(stornoMeta.count ? [`Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`] : [])],
        actions: [["order-customer", "+"], ["edit-customer", "Upr"], ["delete-customer", "X"]],
      });
    }).join("");
  }

  function eof3RenderVarieties() {
    const varieties = (state.data.varieties || []).filter(matchVariety).sort((a, b) => naturalCompare(a.name, b.name));
    if (!varieties.length) return empty("Ĺ˝ĂˇdnĂ© odrĹŻdy.");
    return varieties.map((variety) => card({
      id: variety.id,
      type: "variety",
      title: `đźŚ± ${variety.name}`,
      sub: `${varietyImages(variety).length ? `${varietyImages(variety).length} fotek` : "Bez fotky"} Â· ${varietyUsageCount(variety.name)} zĂˇznamĹŻ`,
      price: variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny",
      thumb: varietyImages(variety)[0],
      thumbText: initials(variety.name),
      pills: [variety.active === false ? "NeaktivnĂ­" : "AktivnĂ­"],
      actions: [["edit-variety", "Upr"], ["delete-variety", "X"]],
    })).join("");
  }

  function eof3RenderCrosses() {
    const crosses = (state.data.crosses || []).filter(matchCross).sort((a, b) => String(b.pollinatedAt || "").localeCompare(String(a.pollinatedAt || "")));
    if (!crosses.length) return empty("Ĺ˝ĂˇdnĂˇ kĹ™Ă­ĹľenĂ­.");
    return crosses.map((cross) => card({
      id: cross.id,
      type: "cross",
      tone: cross.resultRating === "hnusna" ? "reject" : cross.stage === "hotovo" ? "done" : "attention",
      title: crossLineage(cross),
      sub: cross.seedlingName || "",
      thumb: crossSeedlingImages(cross)[0],
      thumbText: initials(crossLineage(cross)),
      pills: [crossStageText(cross.stage), ratingLabels[cross.resultRating] ? `âś“ ${ratingLabels[cross.resultRating]}` : "Bez hodnocenĂ­", cross.seedlingName || "â€”"],
      actions: [["download-cross", "Karta"], ["edit-cross", "Upr"], ["delete-cross", "X"]],
    })).join("");
  }

  const previousOpenOfferDetailEOF3 = openOfferDetailSheet;
  openOfferDetailSheet = function openOfferDetailSheetEOF3(id, options = {}) {
    const offer = findById("offers", id);
    if (offer && isRestOffer(offer)) return openMobileRestOfferSheet(id);
    return previousOpenOfferDetailEOF3(id, options);
  };

  if (!globalThis.__akMobileDelegationEOF3) {
    globalThis.__akMobileDelegationEOF3 = true;
    els.list.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const actionButton = target.closest("[data-action-row]");
      if (actionButton?.dataset?.actionRow) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const action = actionButton.dataset.actionRow;
        const id = actionButton.dataset.id || "";
        if (action === "edit-order") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(id);
        if (action === "order-customer") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)("", id);
        return handleRowAction(action, id);
      }

      const cardEl = target.closest("[data-card]");
      if (!cardEl?.dataset?.card || target.closest("button")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      const type = cardEl.dataset.card;
      const id = cardEl.dataset.id || "";
      if (type === "order") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(id);
      if (type === "customer") return openCustomerSheet(id);
      if (type === "variety") return openVarietyDetailSheet(id);
      if (type === "cross") return openCrossDetailSheet(id);
      if (type === "offer") return openOfferDetailSheet(id);
    }, true);
  }

  renderOffers = eof3RenderOffers;
  renderOrders = eof3RenderOrders;
  renderCustomers = eof3RenderCustomers;
  renderVarieties = eof3RenderVarieties;
  renderCrosses = eof3RenderCrosses;

  render = function renderEOF3() {
    if (!isSyncLoggedIn()) state.view = "sync";
    document.body.classList.toggle("private-locked", !isSyncLoggedIn());
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
    try {
      renderFilters();
    } catch (error) {
      console.error("EOF3 renderFilters failed", error);
      els.filterRow.innerHTML = "";
    }
    try {
      renderSummary();
    } catch (error) {
      console.error("EOF3 renderSummary failed", error);
      els.summary.innerHTML = "";
    }
    const renderers = {
      offers: renderOffers,
      orders: renderOrders,
      customers: renderCustomers,
      varieties: renderVarieties,
      crosses: renderCrosses,
      sync: renderSync,
    };
    els.list.innerHTML = "";
    try {
      els.list.innerHTML = renderers[state.view]?.() || "";
    } catch (error) {
      console.error("EOF3 section render failed", error);
      els.list.innerHTML = empty("Tahle sekce se nepodaĹ™ila otevĹ™Ă­t.");
    }
    try { resolvePhotos(els.list); } catch (error) { console.error("EOF3 resolvePhotos failed", error); }
    try { bindListActions(); } catch (error) { console.error("EOF3 bindListActions failed", error); }
    try { updateSyncIndicator(); } catch (error) { console.error("EOF3 updateSyncIndicator failed", error); }
  };

  openView = function openViewEOF3(view) {
    if (!isSyncLoggedIn() && view !== "sync") {
      state.view = "sync";
      render();
      toast("NejdĹ™Ă­v se pĹ™ihlas.");
      return;
    }
    state.view = view;
    state.filter = "all";
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
    if (els.search) els.search.value = "";
    state.query = "";
    closeSheet({ all: true });
    render();
  };

  document.querySelectorAll("[data-view], [data-action]").forEach((node) => {
    if (!(node instanceof HTMLButtonElement)) return;
    const clone = node.cloneNode(true);
    node.replaceWith(clone);
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      openView(button.dataset.view || "offers");
    }, true);
  });
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      const action = button.dataset.action || "";
      if (action === "new-offer") return openOfferSheet();
      if (action === "new-rest-offer") return openOfferSheet("", { type: "rests" });
      if (action === "new-order") return (globalThis.__akOpenOrderSheetFinal || openOrderSheet)();
      if (action === "new-customer") return openCustomerSheet();
      if (action === "new-variety") return openVarietySheet();
      if (action === "new-cross") return openCrossSheet();
    }, true);
  });

  render();
})();
(() => {
  const stableOpenOrderSheet = globalThis.__akOpenOrderSheetStable84 || globalThis.__akOpenOrderSheetFinal || openOrderSheet;
  const stableRenderCustomers = globalThis.__akRenderCustomersStable84 || renderCustomers;
  const stableRenderOrders = globalThis.__akRenderOrdersStable84 || renderOrders;

  if (typeof stableOpenOrderSheet === "function") {
    openOrderSheet = stableOpenOrderSheet;
    globalThis.__akOpenOrderSheetFinal = stableOpenOrderSheet;
  }
  if (typeof stableRenderCustomers === "function") {
    renderCustomers = stableRenderCustomers;
  }
  if (typeof stableRenderOrders === "function") {
    renderOrders = stableRenderOrders;
  }

  function rebindStaticButtonsStable() {
    document.querySelectorAll("[data-view], [data-action]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      if (button.dataset.stableStaticBound === "1") return;
      const clone = button.cloneNode(true);
      clone.dataset.stableStaticBound = "1";
      button.replaceWith(clone);
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        openView(button.dataset.view || "offers");
      }, true);
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        runAction(button.dataset.action || "");
      }, true);
    });
  }

  if (!globalThis.__akMobileListDelegation85) {
    globalThis.__akMobileListDelegation85 = true;
    els.list.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const actionButton = target.closest("[data-action-row]");
      if (actionButton?.dataset?.actionRow) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        const action = actionButton.dataset.actionRow;
        const id = actionButton.dataset.id || "";
        if (action === "edit-order") {
          (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(id);
          return;
        }
        handleRowAction(action, id);
        return;
      }

      const cardEl = target.closest("[data-card]");
      if (!cardEl?.dataset?.card || target.closest("button")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      const type = cardEl.dataset.card;
      const id = cardEl.dataset.id || "";
      if (type === "order") {
        (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(id);
        return;
      }
      if (type === "customer") return openCustomerSheet(id);
      if (type === "variety") return openVarietyDetailSheet(id);
      if (type === "cross") return openCrossDetailSheet(id);
      if (type === "offer") return openOfferDetailSheet(id);
    }, true);
  }

  bindListActions = function bindListActionsStableEOF() {
    document.querySelector("#syncLogin")?.replaceWith(document.querySelector("#syncLogin")?.cloneNode(true));
    document.querySelector("#syncLogout")?.replaceWith(document.querySelector("#syncLogout")?.cloneNode(true));
    document.querySelector("#saveAppSettings")?.replaceWith(document.querySelector("#saveAppSettings")?.cloneNode(true));
    document.querySelector("#syncLogin")?.addEventListener("click", loginSync, { capture: true });
    document.querySelector("#syncLogout")?.addEventListener("click", logoutSync, { capture: true });
    document.querySelector("#saveAppSettings")?.addEventListener("click", saveAppSettingsFromInputs, { capture: true });
  };

  rebindStaticButtonsStable();
  if (typeof render === "function") {
    render();
    setTimeout(() => {
      rebindStaticButtonsStable();
      render();
    }, 0);
  }
})();
(() => {
  const stableOpen = globalThis.__akOpenOrderSheetStable84;
  const stableRenderCustomers = globalThis.__akRenderCustomersStable84;
  const stableRenderOrders = globalThis.__akRenderOrdersStable84;
  if (typeof stableOpen === "function") {
    const safeStableOpen = function safeStableOpenOrderSheet(id = "", customerId = "") {
      try {
        return stableOpen(id, customerId);
      } catch (error) {
        console.error("stable mobile order reopen failed", error);
        toast("ObjednĂˇvku se nepodaĹ™ilo otevĹ™Ă­t.");
        return undefined;
      }
    };
    globalThis.__akOpenOrderSheetFinal = safeStableOpen;
    openOrderSheet = safeStableOpen;
  }
  if (typeof stableRenderCustomers === "function") {
    renderCustomers = stableRenderCustomers;
  }
  if (typeof stableRenderOrders === "function") {
    renderOrders = stableRenderOrders;
  }
  const previousBindListActions = bindListActions;
  bindListActions = function bindListActionsStableFinal() {
    previousBindListActions();
    els.list.querySelectorAll('[data-action-row="edit-order"]').forEach((button) => {
      if (button.dataset.stableOrderBound === "1") return;
      button.dataset.stableOrderBound = "1";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(button.dataset.id || "");
      }, true);
    });
    els.list.querySelectorAll('[data-card="order"]').forEach((cardEl) => {
      if (cardEl.dataset.stableOrderBound === "1") return;
      cardEl.dataset.stableOrderBound = "1";
      cardEl.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("button")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(cardEl.dataset.id || "");
      }, true);
    });
  };
  if (!globalThis.__akOrderCardClickBridgeFinal85) {
    globalThis.__akOrderCardClickBridgeFinal85 = true;
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const editOrderButton = target.closest('[data-action-row="edit-order"]');
      if (editOrderButton?.dataset?.id) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(editOrderButton.dataset.id);
        return;
      }
      const orderCard = target.closest('[data-card="order"]');
      if (!orderCard?.dataset?.id || target.closest("button")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      (globalThis.__akOpenOrderSheetFinal || openOrderSheet)(orderCard.dataset.id);
    }, true);
  }
  if (!globalThis.__akViewBridgeFinal85) {
    globalThis.__akViewBridgeFinal85 = true;
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        openView(button.dataset.view || "offers");
      }, true);
    });
  }
  if (typeof render === "function") {
    render();
    setTimeout(() => render(), 0);
  }
})();
(() => {
  if (globalThis.__akOrderCardClickBridgeBound) return;
  globalThis.__akOrderCardClickBridgeBound = true;
  document.addEventListener("click", (event) => {
    const stableOpenOrderSheet = globalThis.__akOpenOrderSheetFinal || openOrderSheet;
    const orderAction = event.target.closest('[data-action-row="edit-order"]');
    if (orderAction?.dataset?.id) {
      event.preventDefault();
      event.stopPropagation();
      stableOpenOrderSheet(orderAction.dataset.id);
      return;
    }
    const orderCard = event.target.closest('[data-card="order"]');
    if (!orderCard || event.target.closest("button")) return;
    const id = orderCard.dataset.id;
    if (!id) return;
    event.preventDefault();
    stableOpenOrderSheet(id);
  }, true);
})();
(() => {
  function openOrderSheetEmergency(id = "", customerId = "") {
    const order = findById("orders", id) || {};
    const customers = state.data.customers;
    const selectedCustomerId = clean(order.customerId || customerId);
    const selectedCustomer = findCustomer(selectedCustomerId);
    const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
    openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
      <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
        .slice()
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
      ${toggle("paymentStatus", [["ÄŤekĂˇ", "ÄŚekĂˇ"], ["zaplaceno", "Zaplaceno"]], order.paymentStatus || "ÄŤekĂˇ")}
      ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
      ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
      <div class="toggle-grid">
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
        <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn"}</button>` : ""}
      </div>
      <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
      <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
      <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
      <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
      <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
      <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const item = normalizeOrder({
        ...order,
        id: order.id || uid(),
        offerId: clean(data.get("offerId")),
        customerId: clean(data.get("customerId")),
        orderDate: clean(data.get("orderDate")) || todayInput(),
        paymentStatus: form.querySelector('[name="paymentStatus"]').value,
        shippingStatus: form.querySelector('[name="shippingStatus"]').value,
        deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
        varietiesText: clean(data.get("varietiesText")),
        price: clean(data.get("price")),
        shippingFee: clean(data.get("shippingFee")),
        shippingFeeLabel: clean(data.get("shippingFeeLabel")),
        packingFee: clean(data.get("packingFee")),
        codFee: clean(data.get("codFee")),
        note: clean(data.get("note")),
        createdAt: order.createdAt || now,
        updatedAt: now,
      });
      upsert("orders", item);
    });
    bindToggles();
    bindFees();
    const form = els.sheet.querySelector("#sheetForm");
    form?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
    syncOrderSheetCustomerValidity(form);
    form?.querySelector('[name="varietiesText"]')?.addEventListener("input", () => recalculateOrderSheetPrice(form));
    form?.querySelector('[name="customerId"]')?.addEventListener("change", () => {
      syncOrderSheetCustomerValidity(form);
      if (form?.elements?.deliveryMethod?.value === "personal_pickup") {
        clearOrderSheetFeeRestoreSnapshot(form);
      } else {
        syncOrderSheetCountryShippingPreset(form);
      }
      form?.__syncFeeButtons?.();
    });
    form?.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
      if (!form?.elements) return;
      const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
      if (form.elements.deliveryMethod.value === "personal_pickup") {
        if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
        els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
        form.elements.shippingFee.value = "";
        form.elements.shippingFeeLabel.value = "";
        form.elements.packingFee.value = "";
        form.elements.codFee.value = "";
        recalculateOrderSheetPrice(form);
      } else if (previousDelivery === "personal_pickup") {
        const restored = restoreOrderSheetFeeRestoreSnapshot(form);
        if (!restored) form.__syncFeeButtons?.();
        recalculateOrderSheetPrice(form);
      }
      form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
    });
    els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
      syncOrderSheetCustomerValidity(form);
      if (!clean(form?.querySelector('[name="customerId"]')?.value)) toast("Zvol zĂˇkaznĂ­ka.");
    });
    els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
      button.classList.toggle("active", sent);
      button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
    });
    toast("ObjednĂˇvka se otevĹ™ela v nouzovĂ©m reĹľimu.");
  }

  globalThis.__akOpenOrderSheetReal = globalThis.__akOpenOrderSheetFinal || openOrderSheet;
  globalThis.__akOpenOrderSheetFinal = function mobileOrderSheetSafe(id = "", customerId = "") {
    try {
      return (globalThis.__akOpenOrderSheetReal || openOrderSheet)(id, customerId);
    } catch (error) {
      console.error("Order sheet fallback", error);
      return openOrderSheetEmergency(id, customerId);
    }
  };
  openOrderSheet = globalThis.__akOpenOrderSheetFinal;
})();
(() => {
  function eofOrderLineName(line = "") {
    return clean(line)
      .replace(/\b\d+\s*x\b/gi, " ")
      .replace(/\bx\s*\d+\b/gi, " ")
      .replace(/\b\d+\s*(ks|kus|kusy|Ĺ™Ă­zkĹŻ|rizku|sazenic)\b/gi, " ")
      .replace(/(?:-|â€“|â€”)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/(?:@|=)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/\b\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)\b/gi, " ")
      .replace(/[=:@]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function eofOrderLines(text = "") {
    return clean(text)
      .split(/\n+/)
      .map((rawLine) => {
        const raw = clean(rawLine);
        const name = eofOrderLineName(raw);
        return {
          raw,
          name,
          quantity: orderLineQuantity(raw),
          explicitPrice: Number.isFinite(orderLineUnitPrice(raw)) ? normalizeAmount(orderLineUnitPrice(raw)) : "",
          explicitCurrency: "CZK",
        };
      })
      .filter((line) => line.name);
  }

  function eofOrderLineText(name, quantity = 1, amount = "") {
    const parsedAmount = number(amount);
    return Number.isFinite(parsedAmount)
      ? offerOrderLineText(clean(name), Math.max(wholeNumber(quantity, 1), 1), parsedAmount)
      : `${clean(name)} ${Math.max(wholeNumber(quantity, 1), 1)}x`;
  }

  function eofParseStornoLines(value = "") {
    if (Array.isArray(value)) {
      return value
        .map((entry) => ({
          name: clean(entry?.name),
          quantity: Math.max(wholeNumber(entry?.quantity, 1), 1),
          unitPrice: normalizeAmount(entry?.unitPrice),
          currency: clean(entry?.currency) || "CZK",
          note: clean(entry?.note),
          createdAt: clean(entry?.createdAt),
        }))
        .filter((entry) => entry.name);
    }
    if (!clean(value)) return [];
    try {
      return eofParseStornoLines(JSON.parse(value));
    } catch {
      return [];
    }
  }

  function eofReadStorno(form) {
    return eofParseStornoLines(form?.elements?.stornoLines?.value);
  }

  function eofWriteStorno(form, lines = []) {
    if (!form?.elements?.stornoLines) return;
    form.elements.stornoLines.value = JSON.stringify(eofParseStornoLines(lines));
  }

  function eofCurrentLines(form) {
    return eofOrderLines(form?.elements?.varietiesText?.value || "");
  }

  function eofLinePriceInfo(line = {}) {
    if (clean(line.explicitPrice)) return { amount: line.explicitPrice, currency: "CZK" };
    const variety = findVarietyByName(line.name);
    if (clean(variety?.salePrice)) return { amount: variety.salePrice, currency: "CZK" };
    return { amount: "", currency: "CZK" };
  }

  function eofRenderOrderVarietySelection(form) {
    const container = form?.querySelector("[data-order-variety-selection]");
    if (!container) return;
    const lines = eofCurrentLines(form);
    container.innerHTML = lines.length
      ? lines.map((line) => `<span class="rest-variety-chip">${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  }

  function eofRenderStornoBlock(form) {
    const block = form?.querySelector("[data-sheet-order-storno]");
    if (!form?.elements || !block) return;
    const activeLines = eofCurrentLines(form);
    const stornoLines = eofReadStorno(form);
    if (activeLines.length && clean(form.elements.cancelledAt?.value)) {
      form.elements.cancelledAt.value = "";
      form.elements.cancelledNote.value = "";
    }
    const cancelledAt = clean(form.elements.cancelledAt?.value);
    const cancelledNote = clean(form.elements.cancelledNote?.value);
    const cancelledInfo = cancelledAt
      ? `ObjednĂˇvka stornovĂˇna ${new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(cancelledAt))}${cancelledNote ? ` Â· ${cancelledNote}` : ""}`
      : "";
    block.innerHTML = `
      <div class="order-storno-sheet-heading">
        <div>
          <strong>Storna</strong>
          <small>Toto se nepoÄŤĂ­tĂˇ do ceny.</small>
        </div>
        <button class="button ghost" type="button" data-eof-cancel-all ${activeLines.length ? "" : "disabled"}>Stornovat celou objednĂˇvku</button>
      </div>
      ${cancelledInfo ? `<div class="order-storno-sheet-status">${escapeHtml(cancelledInfo)}</div>` : ""}
      <div class="order-storno-sheet-list">
        ${activeLines.map((line, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>
            </div>
            <button class="button order-storno-sheet-action" type="button" data-eof-storno="${index}">Stornovat</button>
          </div>
        `).join("")}
        ${stornoLines.map((entry, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>âś• ${escapeHtml(entry.quantity > 1 ? `${entry.name} Â· ${quantityText(entry.quantity)} ks` : entry.name)}</span>
              ${clean(entry.note) ? `<small>${escapeHtml(entry.note)}</small>` : ""}
            </div>
            <button class="button order-storno-sheet-action" type="button" data-eof-restore="${index}">Obnovit</button>
          </div>
        `).join("")}
        ${!activeLines.length && !stornoLines.length ? '<div class="order-storno-sheet-status">ZatĂ­m bez storna.</div>' : ""}
      </div>
    `;
    block.querySelector("[data-eof-cancel-all]")?.addEventListener("click", () => eofCancelAll(form));
    block.querySelectorAll("[data-eof-storno]").forEach((button) => {
      button.addEventListener("click", () => eofStornoLine(form, Number(button.dataset.eofStorno)));
    });
    block.querySelectorAll("[data-eof-restore]").forEach((button) => {
      button.addEventListener("click", () => eofRestoreLine(form, Number(button.dataset.eofRestore)));
    });
  }

  function eofStornoLine(form, index) {
    const lines = eofCurrentLines(form);
    const line = lines[index];
    if (!line) return;
    const rawQuantity = window.prompt(`Kolik ks stornovat u ${line.name}?`, String(Math.max(line.quantity || 1, 1)));
    if (rawQuantity === null) return;
    const stornoQuantity = Number.parseInt(clean(rawQuantity), 10);
    const maxQuantity = Math.max(line.quantity || 1, 1);
    if (!Number.isFinite(stornoQuantity) || stornoQuantity < 1 || stornoQuantity > maxQuantity) {
      toast("NapiĹˇ platnĂ˝ poÄŤet kusĹŻ ke storno.");
      return;
    }
    const note = window.prompt("DĹŻvod storna (volitelnÄ›):", "") ?? "";
    const priceInfo = eofLinePriceInfo(line);
    const stornoLines = eofReadStorno(form);
    stornoLines.push({
      name: line.name,
      quantity: stornoQuantity,
      unitPrice: priceInfo.amount,
      currency: "CZK",
      note: clean(note),
      createdAt: new Date().toISOString(),
    });
    eofWriteStorno(form, stornoLines);
    const nextLines = lines.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return [eofOrderLineText(item.name, item.quantity, item.explicitPrice)];
      const remaining = Math.max(maxQuantity - stornoQuantity, 0);
      return remaining ? [eofOrderLineText(item.name, remaining, clean(item.explicitPrice) || priceInfo.amount)] : [];
    });
    form.elements.varietiesText.value = nextLines.join("\n");
    recalculateOrderSheetPrice(form);
    eofRenderOrderVarietySelection(form);
    eofRenderStornoBlock(form);
    renderSheetRestWarning(form);
    toast("PoloĹľka pĹ™esunuta do storna.");
  }

  function eofRestoreLine(form, index) {
    const stornoLines = eofReadStorno(form);
    const entry = stornoLines[index];
    if (!entry) return;
    const lines = eofCurrentLines(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(entry.name));
    if (existingIndex >= 0) {
      const current = lines[existingIndex];
      lines[existingIndex] = {
        ...current,
        quantity: Math.max(current.quantity || 1, 1) + Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(current.explicitPrice) || clean(entry.unitPrice),
      };
    } else {
      lines.push({
        raw: "",
        name: entry.name,
        quantity: Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(entry.unitPrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => eofOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    eofWriteStorno(form, stornoLines.filter((_, itemIndex) => itemIndex !== index));
    form.elements.cancelledAt.value = "";
    form.elements.cancelledNote.value = "";
    recalculateOrderSheetPrice(form);
    eofRenderOrderVarietySelection(form);
    eofRenderStornoBlock(form);
    renderSheetRestWarning(form);
    toast("Storno vrĂˇceno do objednĂˇvky.");
  }

  function eofCancelAll(form) {
    const lines = eofCurrentLines(form);
    if (!lines.length) {
      toast("ObjednĂˇvka uĹľ nemĂˇ ĹľĂˇdnĂ© aktivnĂ­ poloĹľky.");
      return;
    }
    const note = window.prompt("DĹŻvod storna celĂ© objednĂˇvky (volitelnÄ›):", clean(form.elements.cancelledNote?.value) || "");
    if (note === null) return;
    const stornoLines = eofReadStorno(form);
    lines.forEach((line) => {
      const priceInfo = eofLinePriceInfo(line);
      stornoLines.push({
        name: line.name,
        quantity: Math.max(line.quantity || 1, 1),
        unitPrice: clean(line.explicitPrice) || priceInfo.amount,
        currency: "CZK",
        note: clean(note),
        createdAt: new Date().toISOString(),
      });
    });
    eofWriteStorno(form, stornoLines);
    form.elements.varietiesText.value = "";
    form.elements.shippingFee.value = "";
    form.elements.shippingFeeLabel.value = "";
    form.elements.packingFee.value = "";
    form.elements.codFee.value = "";
    form.elements.cancelledAt.value = new Date().toISOString();
    form.elements.cancelledNote.value = clean(note);
    recalculateOrderSheetPrice(form);
    eofRenderOrderVarietySelection(form);
    eofRenderStornoBlock(form);
    renderSheetRestWarning(form);
    toast("CelĂˇ objednĂˇvka pĹ™esunuta do storna.");
  }

  function eofAddVariety(form) {
    const varietyId = clean(form?.querySelector('[name="orderVarietySelect"]')?.value);
    const variety = findById("varieties", varietyId);
    if (!variety) {
      toast("Vyber odrĹŻdu.");
      return;
    }
    const lines = eofCurrentLines(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(variety.name));
    if (existingIndex >= 0) {
      const current = lines[existingIndex];
      lines[existingIndex] = {
        ...current,
        quantity: Math.max(current.quantity || 1, 1) + 1,
        explicitPrice: clean(current.explicitPrice) || clean(variety.salePrice),
      };
    } else {
      lines.push({
        raw: "",
        name: variety.name,
        quantity: 1,
        explicitPrice: clean(variety.salePrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => eofOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    form.querySelector('[name="orderVarietySelect"]').value = "";
    recalculateOrderSheetPrice(form);
    eofRenderOrderVarietySelection(form);
    eofRenderStornoBlock(form);
    syncOrderSheetAlternates();
    toast("OdrĹŻda pĹ™idĂˇna do objednĂˇvky.");
  }

  openOrderSheet = function openOrderSheetEOF(id = "", customerId = "") {
    const order = findById("orders", id) || {};
    const customers = state.data.customers;
    const selectedCustomerId = clean(order.customerId || customerId);
    const selectedCustomer = findCustomer(selectedCustomerId);
    const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
    const varietyOptions = ['<option value="">Vyber odrĹŻdu</option>']
      .concat(
        [...state.data.varieties]
          .slice()
          .sort((a, b) => clean(a.name).localeCompare(clean(b.name), "cs"))
          .map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`),
      )
      .join("");
    openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
      <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
        .slice()
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <section class="sheet-rest-warning" data-sheet-rest-warning hidden></section>
      <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
      ${toggle("paymentStatus", [["ÄŤekĂˇ", "ÄŚekĂˇ"], ["zaplaceno", "Zaplaceno"]], order.paymentStatus || "ÄŤekĂˇ")}
      ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
      ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
      <div class="toggle-grid">
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
        <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn"}</button>` : ""}
      </div>
      <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
      <label class="field"><span>PĹ™idat odrĹŻdu</span><select name="orderVarietySelect">${varietyOptions}</select></label>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-order-variety-add>PĹ™idat odrĹŻdu</button></div>
      <div class="rest-variety-selection" data-order-variety-selection></div>
      <section class="order-alternate-sheet-block" data-sheet-order-alternates hidden></section>
      <textarea name="stornoLines" hidden>${escapeHtml(JSON.stringify(orderStornoLines(order)))}</textarea>
      <input name="cancelledAt" type="hidden" value="${escapeHtml(clean(order.cancelledAt))}">
      <input name="cancelledNote" type="hidden" value="${escapeHtml(clean(order.cancelledNote))}">
      <section class="order-storno-sheet-block" data-sheet-order-storno></section>
      <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
      <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
      <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
      <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
      <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const item = normalizeOrder({
        ...order,
        id: order.id || uid(),
        offerId: clean(data.get("offerId")),
        customerId: clean(data.get("customerId")),
        orderDate: clean(data.get("orderDate")) || todayInput(),
        paymentStatus: form.querySelector('[name="paymentStatus"]').value,
        shippingStatus: form.querySelector('[name="shippingStatus"]').value,
        deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
        varietiesText: clean(data.get("varietiesText")),
        stornoLines: eofParseStornoLines(data.get("stornoLines")),
        cancelledAt: clean(data.get("cancelledAt")),
        cancelledNote: clean(data.get("cancelledNote")),
        price: clean(data.get("price")),
        shippingFee: clean(data.get("shippingFee")),
        shippingFeeLabel: clean(data.get("shippingFeeLabel")),
        packingFee: clean(data.get("packingFee")),
        codFee: clean(data.get("codFee")),
        note: clean(data.get("note")),
        createdAt: order.createdAt || now,
        updatedAt: now,
      });
      upsert("orders", item);
    });
    bindToggles();
    bindFees();
    const form = els.sheet.querySelector("#sheetForm");
    form?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
    syncOrderSheetCustomerValidity(form);
    syncOrderSheetAlternates();
    renderSheetRestWarning(form);
    eofRenderOrderVarietySelection(form);
    eofRenderStornoBlock(form);
    form?.querySelector("[data-order-variety-add]")?.addEventListener("click", () => eofAddVariety(form));
    form?.querySelector('[name="varietiesText"]')?.addEventListener("input", () => {
      recalculateOrderSheetPrice(form);
      eofRenderOrderVarietySelection(form);
      eofRenderStornoBlock(form);
    });
    form?.querySelector('[name="customerId"]')?.addEventListener("change", () => {
      syncOrderSheetCustomerValidity(form);
      if (form?.elements?.deliveryMethod?.value === "personal_pickup") {
        clearOrderSheetFeeRestoreSnapshot(form);
      } else {
        syncOrderSheetCountryShippingPreset(form);
      }
      form?.__syncFeeButtons?.();
      syncOrderSheetAlternates();
      renderSheetRestWarning(form);
    });
    form?.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
      if (!form?.elements) return;
      const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
      if (form.elements.deliveryMethod.value === "personal_pickup") {
        if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
        els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
        form.elements.shippingFee.value = "";
        form.elements.shippingFeeLabel.value = "";
        form.elements.packingFee.value = "";
        form.elements.codFee.value = "";
        recalculateOrderSheetPrice(form);
      } else if (previousDelivery === "personal_pickup") {
        const restored = restoreOrderSheetFeeRestoreSnapshot(form);
        if (!restored) form.__syncFeeButtons?.();
        recalculateOrderSheetPrice(form);
      }
      form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
      eofRenderStornoBlock(form);
    });
    els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
      syncOrderSheetCustomerValidity(form);
      if (!clean(form?.querySelector('[name="customerId"]')?.value)) toast("Zvol zĂˇkaznĂ­ka.");
    });
    els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
      button.classList.toggle("active", sent);
      button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
    });
  };

  globalThis.__akOpenOrderSheetFinal = openOrderSheet;
  globalThis.__akRenderCustomersFinal = renderCustomers;
  if (globalThis.__akOpenOrderSheetFinal) openOrderSheet = globalThis.__akOpenOrderSheetFinal;
  if (globalThis.__akRenderCustomersFinal) renderCustomers = globalThis.__akRenderCustomersFinal;
  if (typeof render === "function") {
    render();
    setTimeout(() => render(), 0);
  }
})();
(() => {
  function finalParseOrderLineName(line = "") {
    return clean(line)
      .replace(/\b\d+\s*x\b/gi, " ")
      .replace(/\bx\s*\d+\b/gi, " ")
      .replace(/\b\d+\s*(ks|kus|kusy|Ĺ™Ă­zkĹŻ|rizku|sazenic)\b/gi, " ")
      .replace(/(?:-|â€“|â€”)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/(?:@|=)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/\b\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)\b/gi, " ")
      .replace(/[=:@]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function finalParseOrderLines(text = "") {
    return clean(text)
      .split(/\n+/)
      .map((rawLine) => {
        const raw = clean(rawLine);
        const name = finalParseOrderLineName(raw);
        return {
          raw,
          name,
          quantity: orderLineQuantity(raw),
          explicitPrice: Number.isFinite(orderLineUnitPrice(raw)) ? normalizeAmount(orderLineUnitPrice(raw)) : "",
          explicitCurrency: "CZK",
        };
      })
      .filter((line) => line.name);
  }

  function finalBuildOrderLineText(name, quantity = 1, amount = "") {
    const parsedAmount = number(amount);
    return Number.isFinite(parsedAmount)
      ? offerOrderLineText(clean(name), Math.max(wholeNumber(quantity, 1), 1), parsedAmount)
      : `${clean(name)} ${Math.max(wholeNumber(quantity, 1), 1)}x`;
  }

  function finalParseStornoLines(value = "") {
    if (Array.isArray(value)) {
      return value
        .map((entry) => ({
          name: clean(entry?.name),
          quantity: Math.max(wholeNumber(entry?.quantity, 1), 1),
          unitPrice: normalizeAmount(entry?.unitPrice),
          currency: clean(entry?.currency) || "CZK",
          note: clean(entry?.note),
          createdAt: clean(entry?.createdAt),
        }))
        .filter((entry) => entry.name);
    }
    if (!clean(value)) return [];
    try {
      return finalParseStornoLines(JSON.parse(value));
    } catch {
      return [];
    }
  }

  function finalCurrentSheetLines(form) {
    return finalParseOrderLines(form?.elements?.varietiesText?.value || "");
  }

  function finalReadSheetStornoLines(form) {
    return finalParseStornoLines(form?.elements?.stornoLines?.value);
  }

  function finalWriteSheetStornoLines(form, lines = []) {
    if (!form?.elements?.stornoLines) return;
    form.elements.stornoLines.value = JSON.stringify(finalParseStornoLines(lines));
  }

  function finalDefaultPriceInfo(line = {}) {
    if (clean(line.explicitPrice)) return { amount: line.explicitPrice, currency: "CZK" };
    const variety = findVarietyByName(line.name);
    if (clean(variety?.salePrice)) return { amount: variety.salePrice, currency: "CZK" };
    return { amount: "", currency: "CZK" };
  }

  function finalLatestCustomerStorno(customerId = "") {
    const orders = customerStornoOrders(customerId)
      .slice()
      .sort((a, b) => String(b.updatedAt || b.cancelledAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.cancelledAt || a.orderDate || "")));
    const latest = orders[0] || null;
    let note = clean(latest?.cancelledNote);
    if (!note && latest) {
      const entry = orderStornoLines(latest)
        .slice()
        .reverse()
        .find((item) => clean(item.note));
      note = clean(entry?.note);
    }
    return { count: orders.length, note, latest };
  }

  function finalRenderSheetVarietySelection(form) {
    const container = form?.querySelector("[data-order-variety-selection]");
    if (!container) return;
    const lines = finalCurrentSheetLines(form);
    container.innerHTML = lines.length
      ? lines.map((line) => `<span class="rest-variety-chip">${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  }

  function finalRenderStornoBlock(form) {
    const block = form?.querySelector("[data-sheet-order-storno]");
    if (!form?.elements || !block) return;
    const activeLines = finalCurrentSheetLines(form);
    const stornoLines = finalReadSheetStornoLines(form);
    if (activeLines.length && clean(form.elements.cancelledAt?.value)) {
      form.elements.cancelledAt.value = "";
      form.elements.cancelledNote.value = "";
    }
    const cancelledAt = clean(form.elements.cancelledAt?.value);
    const cancelledNote = clean(form.elements.cancelledNote?.value);
    const cancelledInfo = cancelledAt
      ? `ObjednĂˇvka stornovĂˇna ${new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(cancelledAt))}${cancelledNote ? ` Â· ${cancelledNote}` : ""}`
      : "";
    block.innerHTML = `
      <div class="order-storno-sheet-heading">
        <div>
          <strong>Storna</strong>
          <small>Toto se nepoÄŤĂ­tĂˇ do ceny.</small>
        </div>
        <button class="button ghost" type="button" data-final-order-cancel-all ${activeLines.length ? "" : "disabled"}>Stornovat celou objednĂˇvku</button>
      </div>
      ${cancelledInfo ? `<div class="order-storno-sheet-status">${escapeHtml(cancelledInfo)}</div>` : ""}
      <div class="order-storno-sheet-list">
        ${activeLines.map((line, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>
            </div>
            <button class="button order-storno-sheet-action" type="button" data-final-order-storno="${index}">Stornovat</button>
          </div>
        `).join("")}
        ${stornoLines.map((entry, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>âś• ${escapeHtml(entry.quantity > 1 ? `${entry.name} Â· ${quantityText(entry.quantity)} ks` : entry.name)}</span>
              ${clean(entry.note) ? `<small>${escapeHtml(entry.note)}</small>` : ""}
            </div>
            <button class="button order-storno-sheet-action" type="button" data-final-order-restore="${index}">Obnovit</button>
          </div>
        `).join("")}
        ${!activeLines.length && !stornoLines.length ? '<div class="order-storno-sheet-status">ZatĂ­m bez storna.</div>' : ""}
      </div>
    `;
    block.querySelector("[data-final-order-cancel-all]")?.addEventListener("click", () => finalCancelEntireOrder(form));
    block.querySelectorAll("[data-final-order-storno]").forEach((button) => {
      button.addEventListener("click", () => finalStornoOrderLine(form, Number(button.dataset.finalOrderStorno)));
    });
    block.querySelectorAll("[data-final-order-restore]").forEach((button) => {
      button.addEventListener("click", () => finalRestoreOrderLine(form, Number(button.dataset.finalOrderRestore)));
    });
  }

  function finalStornoOrderLine(form, index) {
    const lines = finalCurrentSheetLines(form);
    const line = lines[index];
    if (!line) return;
    const rawQuantity = window.prompt(`Kolik ks stornovat u ${line.name}?`, String(Math.max(line.quantity || 1, 1)));
    if (rawQuantity === null) return;
    const stornoQuantity = Number.parseInt(clean(rawQuantity), 10);
    const maxQuantity = Math.max(line.quantity || 1, 1);
    if (!Number.isFinite(stornoQuantity) || stornoQuantity < 1 || stornoQuantity > maxQuantity) {
      toast("NapiĹˇ platnĂ˝ poÄŤet kusĹŻ ke storno.");
      return;
    }
    const note = window.prompt("DĹŻvod storna (volitelnÄ›):", "") ?? "";
    const priceInfo = finalDefaultPriceInfo(line);
    const stornoLines = finalReadSheetStornoLines(form);
    stornoLines.push({
      name: line.name,
      quantity: stornoQuantity,
      unitPrice: priceInfo.amount,
      currency: "CZK",
      note: clean(note),
      createdAt: new Date().toISOString(),
    });
    finalWriteSheetStornoLines(form, stornoLines);
    const nextLines = lines.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return [finalBuildOrderLineText(item.name, item.quantity, item.explicitPrice)];
      const remaining = Math.max(maxQuantity - stornoQuantity, 0);
      return remaining ? [finalBuildOrderLineText(item.name, remaining, clean(item.explicitPrice) || priceInfo.amount)] : [];
    });
    form.elements.varietiesText.value = nextLines.join("\n");
    recalculateOrderSheetPrice(form);
    finalRenderSheetVarietySelection(form);
    finalRenderStornoBlock(form);
    renderSheetRestWarning(form);
    toast("PoloĹľka pĹ™esunuta do storna.");
  }

  function finalRestoreOrderLine(form, index) {
    const stornoLines = finalReadSheetStornoLines(form);
    const entry = stornoLines[index];
    if (!entry) return;
    const lines = finalCurrentSheetLines(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(entry.name));
    if (existingIndex >= 0) {
      const current = lines[existingIndex];
      lines[existingIndex] = {
        ...current,
        quantity: Math.max(current.quantity || 1, 1) + Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(current.explicitPrice) || clean(entry.unitPrice),
      };
    } else {
      lines.push({
        raw: "",
        name: entry.name,
        quantity: Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(entry.unitPrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => finalBuildOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    finalWriteSheetStornoLines(form, stornoLines.filter((_, itemIndex) => itemIndex !== index));
    form.elements.cancelledAt.value = "";
    form.elements.cancelledNote.value = "";
    recalculateOrderSheetPrice(form);
    finalRenderSheetVarietySelection(form);
    finalRenderStornoBlock(form);
    renderSheetRestWarning(form);
    toast("Storno vrĂˇceno do objednĂˇvky.");
  }

  function finalCancelEntireOrder(form) {
    const lines = finalCurrentSheetLines(form);
    if (!lines.length) {
      toast("ObjednĂˇvka uĹľ nemĂˇ ĹľĂˇdnĂ© aktivnĂ­ poloĹľky.");
      return;
    }
    const note = window.prompt("DĹŻvod storna celĂ© objednĂˇvky (volitelnÄ›):", clean(form.elements.cancelledNote?.value) || "");
    if (note === null) return;
    const stornoLines = finalReadSheetStornoLines(form);
    lines.forEach((line) => {
      const priceInfo = finalDefaultPriceInfo(line);
      stornoLines.push({
        name: line.name,
        quantity: Math.max(line.quantity || 1, 1),
        unitPrice: clean(line.explicitPrice) || priceInfo.amount,
        currency: "CZK",
        note: clean(note),
        createdAt: new Date().toISOString(),
      });
    });
    finalWriteSheetStornoLines(form, stornoLines);
    form.elements.varietiesText.value = "";
    form.elements.shippingFee.value = "";
    form.elements.shippingFeeLabel.value = "";
    form.elements.packingFee.value = "";
    form.elements.codFee.value = "";
    form.elements.cancelledAt.value = new Date().toISOString();
    form.elements.cancelledNote.value = clean(note);
    recalculateOrderSheetPrice(form);
    finalRenderSheetVarietySelection(form);
    finalRenderStornoBlock(form);
    renderSheetRestWarning(form);
    toast("CelĂˇ objednĂˇvka pĹ™esunuta do storna.");
  }

  function finalAddVarietyToOrder(form) {
    const varietyId = clean(form?.querySelector('[name="orderVarietySelect"]')?.value);
    const variety = findById("varieties", varietyId);
    if (!variety) {
      toast("Vyber odrĹŻdu.");
      return;
    }
    const lines = finalCurrentSheetLines(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(variety.name));
    if (existingIndex >= 0) {
      const current = lines[existingIndex];
      lines[existingIndex] = {
        ...current,
        quantity: Math.max(current.quantity || 1, 1) + 1,
        explicitPrice: clean(current.explicitPrice) || clean(variety.salePrice),
      };
    } else {
      lines.push({
        raw: "",
        name: variety.name,
        quantity: 1,
        explicitPrice: clean(variety.salePrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => finalBuildOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    form.querySelector('[name="orderVarietySelect"]').value = "";
    recalculateOrderSheetPrice(form);
    finalRenderSheetVarietySelection(form);
    finalRenderStornoBlock(form);
    syncOrderSheetAlternates();
    toast("OdrĹŻda pĹ™idĂˇna do objednĂˇvky.");
  }

  openOrderSheet = function openOrderSheetFinal(id = "", customerId = "") {
    const order = findById("orders", id) || {};
    const customers = state.data.customers;
    const selectedCustomerId = clean(order.customerId || customerId);
    const selectedCustomer = findCustomer(selectedCustomerId);
    const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
    const varietyOptions = ['<option value="">Vyber odrĹŻdu</option>']
      .concat(
        [...state.data.varieties]
          .slice()
          .sort((a, b) => clean(a.name).localeCompare(clean(b.name), "cs"))
          .map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`),
      )
      .join("");
    openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
      <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
        .slice()
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <section class="sheet-rest-warning" data-sheet-rest-warning hidden></section>
      <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
      ${toggle("paymentStatus", [["ÄŤekĂˇ", "ÄŚekĂˇ"], ["zaplaceno", "Zaplaceno"]], order.paymentStatus || "ÄŤekĂˇ")}
      ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
      ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
      <div class="toggle-grid">
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
        <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn"}</button>` : ""}
      </div>
      <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
      <label class="field"><span>PĹ™idat odrĹŻdu</span><select name="orderVarietySelect">${varietyOptions}</select></label>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-order-variety-add>PĹ™idat odrĹŻdu</button></div>
      <div class="rest-variety-selection" data-order-variety-selection></div>
      <section class="order-alternate-sheet-block" data-sheet-order-alternates hidden></section>
      <textarea name="stornoLines" hidden>${escapeHtml(JSON.stringify(orderStornoLines(order)))}</textarea>
      <input name="cancelledAt" type="hidden" value="${escapeHtml(clean(order.cancelledAt))}">
      <input name="cancelledNote" type="hidden" value="${escapeHtml(clean(order.cancelledNote))}">
      <section class="order-storno-sheet-block" data-sheet-order-storno></section>
      <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
      <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
      <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
      <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
      <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const item = normalizeOrder({
        ...order,
        id: order.id || uid(),
        offerId: clean(data.get("offerId")),
        customerId: clean(data.get("customerId")),
        orderDate: clean(data.get("orderDate")) || todayInput(),
        paymentStatus: form.querySelector('[name="paymentStatus"]').value,
        shippingStatus: form.querySelector('[name="shippingStatus"]').value,
        deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
        varietiesText: clean(data.get("varietiesText")),
        stornoLines: finalParseStornoLines(data.get("stornoLines")),
        cancelledAt: clean(data.get("cancelledAt")),
        cancelledNote: clean(data.get("cancelledNote")),
        price: clean(data.get("price")),
        shippingFee: clean(data.get("shippingFee")),
        shippingFeeLabel: clean(data.get("shippingFeeLabel")),
        packingFee: clean(data.get("packingFee")),
        codFee: clean(data.get("codFee")),
        note: clean(data.get("note")),
        createdAt: order.createdAt || now,
        updatedAt: now,
      });
      upsert("orders", item);
    });
    bindToggles();
    bindFees();
    const form = els.sheet.querySelector("#sheetForm");
    form?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
    syncOrderSheetCustomerValidity(form);
    syncOrderSheetAlternates();
    renderSheetRestWarning(form);
    finalRenderSheetVarietySelection(form);
    finalRenderStornoBlock(form);
    form?.querySelector("[data-order-variety-add]")?.addEventListener("click", () => finalAddVarietyToOrder(form));
    form?.querySelector('[name="varietiesText"]')?.addEventListener("input", () => {
      recalculateOrderSheetPrice(form);
      finalRenderSheetVarietySelection(form);
      finalRenderStornoBlock(form);
    });
    form?.querySelector('[name="customerId"]')?.addEventListener("change", () => {
      syncOrderSheetCustomerValidity(form);
      if (form?.elements?.deliveryMethod?.value === "personal_pickup") {
        clearOrderSheetFeeRestoreSnapshot(form);
      } else {
        syncOrderSheetCountryShippingPreset(form);
      }
      form?.__syncFeeButtons?.();
      syncOrderSheetAlternates();
      renderSheetRestWarning(form);
    });
    form?.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
      if (!form?.elements) return;
      const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
      if (form.elements.deliveryMethod.value === "personal_pickup") {
        if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
        els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
        form.elements.shippingFee.value = "";
        form.elements.shippingFeeLabel.value = "";
        form.elements.packingFee.value = "";
        form.elements.codFee.value = "";
        recalculateOrderSheetPrice(form);
      } else if (previousDelivery === "personal_pickup") {
        const restored = restoreOrderSheetFeeRestoreSnapshot(form);
        if (!restored) form.__syncFeeButtons?.();
        recalculateOrderSheetPrice(form);
      }
      form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
      finalRenderStornoBlock(form);
    });
    els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
      syncOrderSheetCustomerValidity(form);
      if (!clean(form?.querySelector('[name="customerId"]')?.value)) toast("Zvol zĂˇkaznĂ­ka.");
    });
    els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
      button.classList.toggle("active", sent);
      button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
    });
  };

  renderCustomers = function renderCustomersFinalWithStorno() {
    const customers = state.data.customers.filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
    if (!customers.length) return empty("Ĺ˝ĂˇdnĂ­ zĂˇkaznĂ­ci.");
    return customers.map((customer) => {
      const stornoMeta = finalLatestCustomerStorno(customer.id);
      const stornoText = stornoMeta.count
        ? [`<span class="customer-storno-mobile">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>`, stornoMeta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(stornoMeta.note)}</span>` : ""].filter(Boolean).join("")
        : "";
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoMeta.count ? "customer-storno-card" : "",
        title: customerName(customer),
        sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>") + stornoText,
        pills: [...(customer.tags || []), ...(stornoMeta.count ? [`Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`] : [])],
        actions: [["order-customer", "+"], ["edit-customer", "âśŽ"], ["delete-customer", "Ă—"]],
      });
    }).join("");
  };

  globalThis.__akOpenOrderSheetFinal = openOrderSheet;
  globalThis.__akRenderCustomersFinal = renderCustomers;
  if (typeof render === "function") {
    render();
    setTimeout(() => render(), 0);
  }
})();

(() => {
  function parseSheetOrderLineName(line = "") {
    return clean(line)
      .replace(/\b\d+\s*x\b/gi, " ")
      .replace(/\bx\s*\d+\b/gi, " ")
      .replace(/\b\d+\s*(ks|kus|kusy|Ĺ™Ă­zkĹŻ|rizku|sazenic)\b/gi, " ")
      .replace(/(?:-|â€“|â€”)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/(?:@|=)\s*\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i, " ")
      .replace(/\b\d+(?:[,.]\d+)?\s*(KÄŤ|kc|czk|eur|â‚¬)\b/gi, " ")
      .replace(/[=:@]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseSheetOrderLines(text = "") {
    return clean(text)
      .split(/\n+/)
      .map((rawLine) => {
        const raw = clean(rawLine);
        const name = parseSheetOrderLineName(raw);
        return {
          raw,
          name,
          quantity: orderLineQuantity(raw),
          explicitPrice: Number.isFinite(orderLineUnitPrice(raw)) ? normalizeAmount(orderLineUnitPrice(raw)) : "",
          explicitCurrency: "CZK",
        };
      })
      .filter((line) => line.name);
  }

  function buildMobileOrderLineText(name, quantity = 1, amount = "") {
    const normalizedName = clean(name);
    const normalizedQuantity = Math.max(wholeNumber(quantity, 1), 1);
    const parsedAmount = number(amount);
    return Number.isFinite(parsedAmount)
      ? offerOrderLineText(normalizedName, normalizedQuantity, parsedAmount)
      : `${normalizedName} ${normalizedQuantity}x`;
  }

  function parseMobileOrderStornoLinesSafe(value) {
    if (Array.isArray(value)) return value.map((entry) => ({
      name: clean(entry?.name),
      quantity: Math.max(wholeNumber(entry?.quantity, 1), 1),
      unitPrice: normalizeAmount(entry?.unitPrice),
      currency: clean(entry?.currency) || "CZK",
      note: clean(entry?.note),
      createdAt: clean(entry?.createdAt),
    })).filter((entry) => entry.name);
    if (!clean(value)) return [];
    try {
      return parseMobileOrderStornoLinesSafe(JSON.parse(value));
    } catch {
      return [];
    }
  }

  function currentOrderSheetLinesSafe(form) {
    return parseSheetOrderLines(form?.elements?.varietiesText?.value || "");
  }

  function readOrderSheetStornoLinesSafe(form) {
    return parseMobileOrderStornoLinesSafe(form?.elements?.stornoLines?.value);
  }

  function writeOrderSheetStornoLinesSafe(form, lines = []) {
    if (!form?.elements?.stornoLines) return;
    form.elements.stornoLines.value = JSON.stringify(parseMobileOrderStornoLinesSafe(lines));
  }

  function clearOrderSheetCancellationSafe(form) {
    if (!form?.elements) return;
    if (form.elements.cancelledAt) form.elements.cancelledAt.value = "";
    if (form.elements.cancelledNote) form.elements.cancelledNote.value = "";
  }

  function defaultMobileOrderLinePriceInfo(line = {}) {
    if (clean(line.explicitPrice)) return { amount: line.explicitPrice, currency: "CZK" };
    const variety = findVarietyByName(line.name);
    if (clean(variety?.salePrice)) return { amount: variety.salePrice, currency: "CZK" };
    return { amount: "", currency: "CZK" };
  }

  function renderOrderSheetVarietySelection(form = els.sheet.querySelector("#sheetForm")) {
    const container = form?.querySelector("[data-order-variety-selection]");
    if (!container) return;
    const lines = currentOrderSheetLinesSafe(form);
    container.innerHTML = lines.length
      ? lines.map((line) => `<span class="rest-variety-chip">${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  }

  function addSelectedVarietyToOrderSheet(form = els.sheet.querySelector("#sheetForm")) {
    if (!form?.elements) return;
    const select = form.querySelector('[name="orderVarietySelect"]');
    const varietyId = clean(select?.value);
    const variety = findById("varieties", varietyId);
    if (!variety) {
      toast("Vyber odrĹŻdu.");
      return;
    }
    const lines = currentOrderSheetLinesSafe(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(variety.name));
    if (existingIndex >= 0) {
      const existing = lines[existingIndex];
      const price = clean(existing.explicitPrice) || clean(variety.salePrice);
      lines[existingIndex] = {
        ...existing,
        quantity: Math.max(existing.quantity || 1, 1) + 1,
        explicitPrice: price,
      };
    } else {
      lines.push({
        raw: "",
        name: variety.name,
        quantity: 1,
        explicitPrice: clean(variety.salePrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => buildMobileOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    if (select) select.value = "";
    recalculateOrderSheetPrice(form);
    renderOrderSheetVarietySelection(form);
    syncOrderSheetAlternates();
    renderOrderSheetStornoBlockSafe(form);
    toast("OdrĹŻda pĹ™idĂˇna do objednĂˇvky.");
  }

  function renderOrderSheetStornoBlockSafe(form = els.sheet.querySelector("#sheetForm")) {
    const block = form?.querySelector("[data-sheet-order-storno]");
    if (!form?.elements || !block) return;
    const activeLines = currentOrderSheetLinesSafe(form);
    const stornoLines = readOrderSheetStornoLinesSafe(form);
    if (activeLines.length && clean(form.elements.cancelledAt?.value)) clearOrderSheetCancellationSafe(form);
    const cancelledAt = clean(form.elements.cancelledAt?.value);
    const cancelledNote = clean(form.elements.cancelledNote?.value);
    const cancelledInfo = cancelledAt
      ? `ObjednĂˇvka stornovĂˇna ${new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(cancelledAt))}${cancelledNote ? ` Â· ${cancelledNote}` : ""}`
      : "";
    block.innerHTML = `
      <div class="order-storno-sheet-heading">
        <div>
          <strong>Storna</strong>
          <small>Toto se nepoÄŤĂ­tĂˇ do ceny.</small>
        </div>
        <button class="button ghost" type="button" data-sheet-order-cancel-all ${activeLines.length ? "" : "disabled"}>Stornovat celou objednĂˇvku</button>
      </div>
      ${cancelledInfo ? `<div class="order-storno-sheet-status">${escapeHtml(cancelledInfo)}</div>` : ""}
      <div class="order-storno-sheet-list">
        ${activeLines.map((line, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>${escapeHtml(line.quantity > 1 ? `${line.name} Â· ${quantityText(line.quantity)} ks` : line.name)}</span>
            </div>
            <button class="button order-storno-sheet-action" type="button" data-sheet-order-storno="${index}">Stornovat</button>
          </div>
        `).join("")}
        ${stornoLines.map((entry, index) => `
          <div class="order-storno-sheet-item">
            <div class="order-storno-sheet-copy">
              <span>âś• ${escapeHtml(entry.quantity > 1 ? `${entry.name} Â· ${quantityText(entry.quantity)} ks` : entry.name)}</span>
              ${clean(entry.note) ? `<small>${escapeHtml(entry.note)}</small>` : ""}
            </div>
            <button class="button order-storno-sheet-action" type="button" data-sheet-order-restore="${index}">Obnovit</button>
          </div>
        `).join("")}
        ${!activeLines.length && !stornoLines.length ? '<div class="order-storno-sheet-status">ZatĂ­m bez storna.</div>' : ""}
      </div>
    `;
    block.querySelector("[data-sheet-order-cancel-all]")?.addEventListener("click", () => cancelEntireOrderSheetSafe(form));
    block.querySelectorAll("[data-sheet-order-storno]").forEach((button) => {
      button.addEventListener("click", () => stornoOrderSheetLineSafe(form, Number(button.dataset.sheetOrderStorno)));
    });
    block.querySelectorAll("[data-sheet-order-restore]").forEach((button) => {
      button.addEventListener("click", () => restoreOrderSheetStornoLineSafe(form, Number(button.dataset.sheetOrderRestore)));
    });
  }

  function stornoOrderSheetLineSafe(form, index) {
    const lines = currentOrderSheetLinesSafe(form);
    const line = lines[index];
    if (!line) return;
    const rawQuantity = window.prompt(`Kolik ks stornovat u ${line.name}?`, String(Math.max(line.quantity || 1, 1)));
    if (rawQuantity === null) return;
    const stornoQuantity = Number.parseInt(clean(rawQuantity), 10);
    const maxQuantity = Math.max(line.quantity || 1, 1);
    if (!Number.isFinite(stornoQuantity) || stornoQuantity < 1 || stornoQuantity > maxQuantity) {
      toast("NapiĹˇ platnĂ˝ poÄŤet kusĹŻ ke storno.");
      return;
    }
    const note = window.prompt("DĹŻvod storna (volitelnÄ›):", "") ?? "";
    const priceInfo = defaultMobileOrderLinePriceInfo(line);
    const stornoLines = readOrderSheetStornoLinesSafe(form);
    stornoLines.push({
      name: line.name,
      quantity: stornoQuantity,
      unitPrice: priceInfo.amount,
      currency: "CZK",
      note: clean(note),
      createdAt: new Date().toISOString(),
    });
    writeOrderSheetStornoLinesSafe(form, stornoLines);
    const nextLines = lines.flatMap((item, itemIndex) => {
      if (itemIndex !== index) return [buildMobileOrderLineText(item.name, item.quantity, item.explicitPrice)];
      const remaining = Math.max(maxQuantity - stornoQuantity, 0);
      return remaining ? [buildMobileOrderLineText(item.name, remaining, clean(item.explicitPrice) || priceInfo.amount)] : [];
    });
    form.elements.varietiesText.value = nextLines.join("\n");
    recalculateOrderSheetPrice(form);
    renderOrderSheetVarietySelection(form);
    renderOrderSheetStornoBlockSafe(form);
    renderSheetRestWarning(form);
    toast("PoloĹľka pĹ™esunuta do storna.");
  }

  function restoreOrderSheetStornoLineSafe(form, index) {
    const stornoLines = readOrderSheetStornoLinesSafe(form);
    const entry = stornoLines[index];
    if (!entry) return;
    const lines = currentOrderSheetLinesSafe(form);
    const existingIndex = lines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(entry.name));
    if (existingIndex >= 0) {
      const current = lines[existingIndex];
      lines[existingIndex] = {
        ...current,
        quantity: Math.max(current.quantity || 1, 1) + Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(current.explicitPrice) || clean(entry.unitPrice),
      };
    } else {
      lines.push({
        raw: "",
        name: entry.name,
        quantity: Math.max(entry.quantity || 1, 1),
        explicitPrice: clean(entry.unitPrice),
        explicitCurrency: "CZK",
      });
    }
    form.elements.varietiesText.value = lines.map((line) => buildMobileOrderLineText(line.name, line.quantity, line.explicitPrice)).join("\n");
    writeOrderSheetStornoLinesSafe(form, stornoLines.filter((_, itemIndex) => itemIndex !== index));
    clearOrderSheetCancellationSafe(form);
    recalculateOrderSheetPrice(form);
    renderOrderSheetVarietySelection(form);
    renderOrderSheetStornoBlockSafe(form);
    renderSheetRestWarning(form);
    toast("Storno vrĂˇceno do objednĂˇvky.");
  }

  function cancelEntireOrderSheetSafe(form) {
    const lines = currentOrderSheetLinesSafe(form);
    if (!lines.length) {
      toast("ObjednĂˇvka uĹľ nemĂˇ ĹľĂˇdnĂ© aktivnĂ­ poloĹľky.");
      return;
    }
    const note = window.prompt("DĹŻvod storna celĂ© objednĂˇvky (volitelnÄ›):", clean(form.elements.cancelledNote?.value) || "");
    if (note === null) return;
    const stornoLines = readOrderSheetStornoLinesSafe(form);
    lines.forEach((line) => {
      const priceInfo = defaultMobileOrderLinePriceInfo(line);
      stornoLines.push({
        name: line.name,
        quantity: Math.max(line.quantity || 1, 1),
        unitPrice: clean(line.explicitPrice) || priceInfo.amount,
        currency: "CZK",
        note: clean(note),
        createdAt: new Date().toISOString(),
      });
    });
    writeOrderSheetStornoLinesSafe(form, stornoLines);
    form.elements.varietiesText.value = "";
    form.elements.shippingFee.value = "";
    form.elements.shippingFeeLabel.value = "";
    form.elements.packingFee.value = "";
    form.elements.codFee.value = "";
    if (form.elements.cancelledAt) form.elements.cancelledAt.value = new Date().toISOString();
    if (form.elements.cancelledNote) form.elements.cancelledNote.value = clean(note);
    recalculateOrderSheetPrice(form);
    renderOrderSheetVarietySelection(form);
    renderOrderSheetStornoBlockSafe(form);
    renderSheetRestWarning(form);
    toast("CelĂˇ objednĂˇvka pĹ™esunuta do storna.");
  }

  openOrderSheet = function openOrderSheetWithVarietyPickerAndStorno(id = "", customerId = "") {
    const order = findById("orders", id) || {};
    const customers = state.data.customers;
    const selectedCustomerId = clean(order.customerId || customerId);
    const selectedCustomer = findCustomer(selectedCustomerId);
    const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
    const varietyOptions = ['<option value="">Vyber odrĹŻdu</option>']
      .concat(
        [...state.data.varieties]
          .slice()
          .sort((a, b) => clean(a.name).localeCompare(clean(b.name), "cs"))
          .map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`),
      )
      .join("");
    openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
      <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
        .slice()
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <section class="sheet-rest-warning" data-sheet-rest-warning hidden></section>
      <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
      ${toggle("paymentStatus", [["čeká", "Čeká"], ["nezaplaceno", "Neplatí"], ["zaplaceno", "Zaplaceno"]], normalizeOrderPaymentStatus(order.paymentStatus || "čeká"))}
      ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
      ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
      <div class="toggle-grid">
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
        <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
        ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn"}</button>` : ""}
      </div>
      <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
      <label class="field"><span>PĹ™idat odrĹŻdu</span><select name="orderVarietySelect">${varietyOptions}</select></label>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-order-variety-add>PĹ™idat odrĹŻdu</button></div>
      <div class="rest-variety-selection" data-order-variety-selection></div>
      <section class="order-alternate-sheet-block" data-sheet-order-alternates hidden></section>
      <textarea name="stornoLines" hidden>${escapeHtml(JSON.stringify(orderStornoLines(order)))}</textarea>
      <input name="cancelledAt" type="hidden" value="${escapeHtml(clean(order.cancelledAt))}">
      <input name="cancelledNote" type="hidden" value="${escapeHtml(clean(order.cancelledNote))}">
      <section class="order-storno-sheet-block" data-sheet-order-storno></section>
      <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
      <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
      <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
      <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
      <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const item = normalizeOrder({
        ...order,
        id: order.id || uid(),
        offerId: clean(data.get("offerId")),
        customerId: clean(data.get("customerId")),
        orderDate: clean(data.get("orderDate")) || todayInput(),
        paymentStatus: form.querySelector('[name="paymentStatus"]').value,
        shippingStatus: form.querySelector('[name="shippingStatus"]').value,
        deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
        varietiesText: clean(data.get("varietiesText")),
        stornoLines: parseMobileOrderStornoLinesSafe(data.get("stornoLines")),
        cancelledAt: clean(data.get("cancelledAt")),
        cancelledNote: clean(data.get("cancelledNote")),
        price: clean(data.get("price")),
        shippingFee: clean(data.get("shippingFee")),
        shippingFeeLabel: clean(data.get("shippingFeeLabel")),
        packingFee: clean(data.get("packingFee")),
        codFee: clean(data.get("codFee")),
        note: clean(data.get("note")),
        createdAt: order.createdAt || now,
        updatedAt: now,
      });
      upsert("orders", item);
    });
    bindToggles();
    bindFees();
    const form = els.sheet.querySelector("#sheetForm");
    form?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
    syncOrderSheetCustomerValidity(form);
    syncOrderSheetAlternates();
    renderSheetRestWarning(form);
    renderOrderSheetVarietySelection(form);
    renderOrderSheetStornoBlockSafe(form);
    form?.querySelector('[data-order-variety-add]')?.addEventListener("click", () => addSelectedVarietyToOrderSheet(form));
    form?.querySelector('[name="varietiesText"]')?.addEventListener("input", () => {
      recalculateOrderSheetPrice(form);
      renderOrderSheetVarietySelection(form);
      renderOrderSheetStornoBlockSafe(form);
    });
    form?.querySelector('[name="customerId"]')?.addEventListener("change", () => {
      syncOrderSheetCustomerValidity(form);
      if (form?.elements?.deliveryMethod?.value === "personal_pickup") {
        clearOrderSheetFeeRestoreSnapshot(form);
      } else {
        syncOrderSheetCountryShippingPreset(form);
      }
      form?.__syncFeeButtons?.();
      syncOrderSheetAlternates();
      renderSheetRestWarning(form);
    });
    form?.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
      if (!form?.elements) return;
      const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
      if (form.elements.deliveryMethod.value === "personal_pickup") {
        if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
        els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
        form.elements.shippingFee.value = "";
        form.elements.shippingFeeLabel.value = "";
        form.elements.packingFee.value = "";
        form.elements.codFee.value = "";
        recalculateOrderSheetPrice(form);
      } else if (previousDelivery === "personal_pickup") {
        const restored = restoreOrderSheetFeeRestoreSnapshot(form);
        if (!restored) form.__syncFeeButtons?.();
        recalculateOrderSheetPrice(form);
      }
      form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
      renderOrderSheetStornoBlockSafe(form);
    });
    els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
      syncOrderSheetCustomerValidity(form);
      if (!clean(form?.querySelector('[name="customerId"]')?.value)) toast("Zvol zĂˇkaznĂ­ka.");
    });
    els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
      event.preventDefault();
      const button = event.currentTarget;
      const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
      button.classList.toggle("active", sent);
      button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
    });
  };

  if (typeof render === "function") {
    render();
    setTimeout(() => render(), 0);
  }
})();
(() => {
  window.__akRestPatchVersion = "20260531-73";
  const baseOpenOfferSheet = openOfferSheet;

  function renderRestSelectionEof(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>Ă—</span></button>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  }

  function setupRestSheetPickerEof(form, initialValue = "") {
    if (!form) return;
    const picker = form.elements.restVarietyPicker;
    const hidden = form.elements.restVarietyName;
    const list = form.querySelector("[data-rest-variety-list]");
    const addButton = form.querySelector("[data-rest-variety-add]");
    if (!picker || !hidden || !list || !addButton) return;
    form.__restVarietyNames = restFormVarietyNames(initialValue || hidden.value);

    const renderPicker = () => {
      const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
      const previousValue = clean(picker.value);
      const options = [...(state.data.varieties || [])]
        .map((variety) => clean(variety.name))
        .filter(Boolean)
        .filter((name) => !selected.has(normalize(name)))
        .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }));
      picker.innerHTML = ['<option value="">Vyber odrĹŻdu</option>']
        .concat(options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`))
        .join("");
      if (options.some((name) => name === previousValue)) picker.value = previousValue;
    };

    const sync = () => {
      hidden.value = form.__restVarietyNames.join("\n");
      renderRestSelectionEof(list, form.__restVarietyNames);
      renderPicker();
    };

    addButton.onclick = () => {
      const raw = clean(picker.value);
      if (!raw) return;
      const exact = findVarietyByName(raw);
      const nextName = clean(exact?.name || raw);
      if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(nextName))) {
        form.__restVarietyNames.push(nextName);
      }
      picker.value = "";
      sync();
    };

    list.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-remove]");
      if (!button) return;
      form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
      sync();
    };

    sync();
  }

  openOfferSheet = function openOfferSheetRestEof(id = "", defaults = {}) {
    const offer = findById("offers", id) || {};
    const isRest = offer.id ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    if (!isRest) return baseOpenOfferSheet(id, defaults);
    const initialDate = offer.date || clean(defaults.date) || todayInput();
    const names = restFormVarietyNames(offer.restVarietyName);
    const customers = [...(state.data.customers || [])].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
    openSheet(offer.id ? "Upravit resty" : "NovĂ© resty", `<form class="form-grid" id="sheetForm">
      <input name="type" type="hidden" value="rests">
      <input name="title" type="hidden" value="${escapeHtml(defaultOfferTitle("rests", initialDate))}">
      <input name="facebookPublishDate" type="hidden" value="${escapeHtml(initialDate)}">
      <input name="facebookPublishTime" type="hidden" value="20:00">
      <input name="status" type="hidden" value="pĹ™ipravenĂˇ">
      <input name="restVarietyId" type="hidden" value="">
      <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
      <label class="field"><span>ZĂˇkaznĂ­k</span><select name="restCustomerId"><option value="">Bez zĂˇkaznĂ­ka</option>${customers
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <label class="field"><span>OdrĹŻdy</span><select name="restVarietyPicker"></select></label>
      <textarea name="restVarietyName" hidden aria-hidden="true">${escapeHtml(names.join("\n"))}</textarea>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-rest-variety-add>PĹ™idat odrĹŻdu</button></div>
      <div class="rest-variety-selection" data-rest-variety-list></div>
      <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const nextDate = clean(data.get("date")) || todayInput();
      const nextNames = restFormVarietyNames(data.get("restVarietyName"));
      const matchedVariety = nextNames.length === 1 ? findVarietyByName(nextNames[0]) : null;
      upsert("offers", normalizeOffer({
        ...offer,
        id: offer.id || uid(),
        title: defaultOfferTitle("rests", nextDate),
        date: nextDate,
        facebookPublishDate: nextDate,
        facebookPublishTime: "20:00",
        type: "rests",
        status: "pĹ™ipravenĂˇ",
        note: clean(data.get("note")),
        restCustomerId: clean(data.get("restCustomerId")),
        restVarietyId: clean(matchedVariety?.id),
        restVarietyName: nextNames.join("\n"),
        items: offer.items || [],
        createdAt: offer.createdAt || now,
        updatedAt: now,
      }));
    });
    setupRestSheetPickerEof(els.sheet.querySelector("#sheetForm"), names.join("\n"));
  };

  function hardRebindRestActionButtons() {
    document.querySelectorAll('[data-action="new-rest-offer"]').forEach((button) => {
      const next = button.cloneNode(true);
      next.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openOfferSheet("", { type: "rests" });
      });
      button.replaceWith(next);
    });
  }

  hardRebindRestActionButtons();

  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="new-rest-offer"]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openOfferSheet("", { type: "rests" });
  }, true);
})();
(() => {
  function renderRestVarietySelectionSafe(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>Ă—</span></button>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  }

  const originalOpenOfferSheet = openOfferSheet;
  openOfferSheet = function openOfferSheetSafeRest(id = "", defaults = {}) {
    const originalRender = typeof renderRestVarietySelection === "function" ? renderRestVarietySelection : null;
    renderRestVarietySelection = renderRestVarietySelectionSafe;
    try {
      return originalOpenOfferSheet(id, defaults);
    } finally {
      if (originalRender) renderRestVarietySelection = originalRender;
    }
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="new-rest-offer"]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openOfferSheet("", { type: "rests" });
  }, true);
})();
(() => {
  const previousOpenOfferSheet = openOfferSheet;
  const previousOpenOfferDetailSheet = openOfferDetailSheet;

  function mobileRestNamesFinal(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function mobileRestCustomerFinal(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez z\u00e1kazn\u00edka";
  }

  function setupRestSheetSelectPickerFinal(form, initialValue = "") {
    if (!form) return;
    const picker = form.elements.restVarietyPicker;
    const hidden = form.elements.restVarietyName;
    const list = form.querySelector("[data-rest-variety-list]");
    const addButton = form.querySelector("[data-rest-variety-add]");
    if (!picker || !hidden || !list || !addButton) return;

    form.__restVarietyNames = restFormVarietyNames(initialValue || hidden.value);

    const renderPicker = () => {
      const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
      const previousValue = clean(picker.value);
      const options = [...(state.data.varieties || [])]
        .map((variety) => clean(variety.name))
        .filter(Boolean)
        .filter((name) => !selected.has(normalize(name)))
        .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }));
      picker.innerHTML = ['<option value="">Vyber odr\u016fdu</option>']
        .concat(options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`))
        .join("");
      if (options.some((name) => name === previousValue)) picker.value = previousValue;
    };

    const sync = () => {
      hidden.value = form.__restVarietyNames.join("\n");
      renderRestVarietySelection(list, form.__restVarietyNames);
      renderPicker();
    };

    addButton.onclick = () => {
      const raw = clean(picker.value);
      if (!raw) return;
      const exact = findVarietyByName(raw);
      const nextName = clean(exact?.name || raw);
      if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(nextName))) {
        form.__restVarietyNames.push(nextName);
      }
      picker.value = "";
      sync();
      picker.focus();
    };

    list.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-remove]");
      if (!button) return;
      form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
      sync();
    };

    sync();
  }

  function openMobileRestOfferSheet(id = "", defaults = {}) {
    const offer = findById("offers", id) || {};
    const initialDate = offer.date || clean(defaults.date) || todayInput();
    const names = mobileRestNamesFinal(offer);
    const customers = [...(state.data.customers || [])].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
    openSheet(offer.id ? "Upravit resty" : "Nov\u00e9 resty", `<form class="form-grid" id="sheetForm">
      <input name="type" type="hidden" value="rests">
      <input name="title" type="hidden" value="${escapeHtml(defaultOfferTitle("rests", initialDate))}">
      <input name="facebookPublishDate" type="hidden" value="${escapeHtml(initialDate)}">
      <input name="facebookPublishTime" type="hidden" value="20:00">
      <input name="status" type="hidden" value="p\u0159ipraven\u00e1">
      <input name="restVarietyId" type="hidden" value="">
      <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
      <label class="field"><span>Z\u00e1kazn\u00edk</span><select name="restCustomerId"><option value="">Bez z\u00e1kazn\u00edka</option>${customers
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <label class="field"><span>Odr\u016fdy</span><select name="restVarietyPicker"></select></label>
      <textarea name="restVarietyName" hidden aria-hidden="true">${escapeHtml(names.join("\n"))}</textarea>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-rest-variety-add>P\u0159idat odr\u016fdu</button></div>
      <div class="rest-variety-selection" data-rest-variety-list></div>
      <label class="field"><span>Pozn\u00e1mka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const nextDate = clean(data.get("date")) || todayInput();
      const nextNames = restFormVarietyNames(data.get("restVarietyName"));
      const matchedVariety = nextNames.length === 1 ? findVarietyByName(nextNames[0]) : null;
      upsert("offers", normalizeOffer({
        ...offer,
        id: offer.id || uid(),
        title: defaultOfferTitle("rests", nextDate),
        date: nextDate,
        facebookPublishDate: nextDate,
        facebookPublishTime: "20:00",
        type: "rests",
        status: "p\u0159ipraven\u00e1",
        note: clean(data.get("note")),
        restCustomerId: clean(data.get("restCustomerId")),
        restVarietyId: clean(matchedVariety?.id),
        restVarietyName: nextNames.join("\n"),
        items: offer.items || [],
        createdAt: offer.createdAt || now,
        updatedAt: now,
      }));
    });
    setupRestSheetSelectPickerFinal(els.sheet.querySelector("#sheetForm"), names.join("\n"));
  }

  function openMobileRestOfferDetailSheet(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer) return;
    state.activeOfferId = id;
    const names = mobileRestNamesFinal(offer);
    const body = `<section class="offer-detail">
      <div class="pill-row"><span class="pill warn">Resty</span></div>
      <div class="rest-meta-stack">
        <div class="rest-meta-card"><small>Datum</small><strong>${escapeHtml(formatDate(offer.date))}</strong></div>
        <div class="rest-meta-card"><small>Z\u00e1kazn\u00edk</small><strong>${escapeHtml(mobileRestCustomerFinal(offer))}</strong></div>
        ${names.length ? `<div class="rest-meta-card"><small>${names.length > 1 ? "Odr\u016fdy" : "Odr\u016fda"}</small><strong>${escapeHtml(names.join(", "))}</strong></div>` : ""}
      </div>
      ${clean(offer.note) ? `<div class="rest-meta-stack"><div class="rest-meta-card"><small>Pozn\u00e1mka</small><strong>${escapeHtml(offer.note)}</strong></div></div>` : ""}
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>Zav\u0159\u00edt</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
      <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvo\u0159it objedn\u00e1vku</button>`;
    openSheet(offer.title, body, null, footer, {
      ...options,
      restore: () => openOfferDetailSheet(id, { replace: true }),
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openMobileRestOfferSheet(id));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  }

  openOfferSheet = function openOfferSheetRestDirect(id = "", defaults = {}) {
    const offer = findById("offers", id);
    const isRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    if (isRest) return openMobileRestOfferSheet(id, defaults);
    return previousOpenOfferSheet(id, defaults);
  };

  openOfferDetailSheet = function openOfferDetailSheetRestDirect(id, options = {}) {
    const offer = findById("offers", id);
    if (offer && isRestOffer(offer)) return openMobileRestOfferDetailSheet(id, options);
    return previousOpenOfferDetailSheet(id, options);
  };

  document.querySelectorAll('[data-action="new-rest-offer"]').forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openMobileRestOfferSheet("", { type: "rests" });
    };
  });
})();

function offerItemDetailMarkup(offer, item) {
  const reserved = offerItemReservedCount(item);
  const alternate = offerItemAlternateCount(item);
  const confirmed = offerItemConfirmedCount(item);
  const total = number(item.quantity);
  const available = Math.max(0, total - confirmed);
  const image = offerItemImage(item);
  const offerId = escapeHtml(offer.id);
  const itemId = escapeHtml(item.id);
  const orderProgress = offerItemOrderProgress(offer, item);
  const orderFlag = orderProgress.label
    ? `<span class="offer-order-flag offer-order-flag-${escapeHtml(orderProgress.state)}" title="${escapeHtml(orderProgress.label)}">â†’ OBJ</span>`
    : "";
  return `<article class="offer-item ${available <= 0 ? "sold-out" : ""} ${orderProgress.state ? `is-order-${orderProgress.state}` : ""}">
    <div class="offer-item-head">
      <span class="thumb offer-thumb-wrap">${image ? `<img data-photo-ref="${escapeHtml(image)}" alt="">` : escapeHtml(initials(offerItemName(item)))}${orderFlag}</span>
      <div>
        <strong>${escapeHtml(offerItemName(item))}</strong>
        <small>${total || 0} ks Â· ${formatMoney(item.price, item.currency || "CZK")} / ks</small>
      </div>
    </div>
    <div class="pill-row">
      <span class="pill">VolnĂ© ${available}</span>
      <span class="pill">Potvrzeno ${confirmed}</span>
      ${alternate ? `<span class="pill">NĂˇhradnĂ­k ${alternate}</span>` : ""}
    </div>
    <div class="offer-item-actions">
      <button class="button primary" type="button" data-offer-id="${offerId}" data-reserve-offer-item="${itemId}" ${available <= 0 ? "disabled" : ""}>Rezervovat</button>
      <button class="button" type="button" data-offer-id="${offerId}" data-alternate-offer-item="${itemId}">NĂˇhradnĂ­k</button>
      <button class="button" type="button" data-offer-id="${offerId}" data-edit-offer-item="${itemId}">Upravit</button>
      <button class="button danger" type="button" data-offer-id="${offerId}" data-delete-offer-item="${itemId}">Smazat</button>
    </div>
    <div class="reservation-list">
      ${(item.reservations || []).length ? sortedReservations(item).map((reservation) => reservationLineMarkup(offer, item, reservation)).join("") : `<small class="sub">ZatĂ­m bez rezervacĂ­.</small>`}
    </div>
  </article>`;
}

function reservationLineMarkup(offer, item, reservation) {
  const customer = findCustomer(reservation.customerId);
  const status = reservationStatusValue(reservation.status);
  const offerId = escapeHtml(offer.id);
  const itemId = escapeHtml(item.id);
  const reservationId = escapeHtml(reservation.id);
  return `<div class="reservation-line">
    <strong>${escapeHtml(customerName(customer) || "Bez zĂˇkaznĂ­ka")}</strong>
    <span>${number(reservation.quantity) || 1} ks</span>
    <span class="pill ${status === "alternate" ? "warn" : "ok"}">${status === "alternate" ? "NĂˇhradnĂ­k" : "Potvrzeno"}</span>
    ${reservationLinkedToOrder(offer, item, reservation) ? `<span class="pill ok">ObjednĂˇvka</span>` : ""}
    ${reservation.note ? `<small>${escapeHtml(reservation.note)}</small>` : ""}
    <span class="reservation-line-actions">
      <button class="round" type="button" data-offer-id="${offerId}" data-item-id="${itemId}" data-edit-reservation="${reservationId}" title="Upravit rezervaci">âśŽ</button>
      <button class="round" type="button" data-offer-id="${offerId}" data-item-id="${itemId}" data-delete-reservation="${reservationId}" title="Smazat rezervaci">Ă—</button>
    </span>
  </div>`;
}

function openOfferItemSheet(offerId, itemId = "") {
  const offer = findById("offers", offerId);
  if (!offer) return;
  const item = itemId ? offer.items.find((entry) => entry.id === itemId) : null;
  const matchedVariety = findById("varieties", item?.varietyId) || findVarietyByName(item?.varietyName);
  const visibleVarietyName = matchedVariety?.name || item?.varietyName || "";
  const selectedCurrency = clean(item?.currency || matchedVariety?.saleCurrency || "CZK");
  openSheet(item ? "Upravit odĹ™ezek" : "PĹ™idat odĹ™ezek", `<form class="form-grid" id="sheetForm">
    <input type="hidden" name="varietyId" value="${escapeHtml(matchedVariety?.id || item?.varietyId || "")}">
    <label class="field"><span>OdrĹŻda</span><input name="varietyName" data-offer-variety-input required autocomplete="off" value="${escapeHtml(visibleVarietyName)}" placeholder="NĂˇzev odrĹŻdy"></label>
    <div class="offer-variety-picker" data-offer-variety-picker></div>
    <div class="offer-item-variety-helper" data-offer-item-variety-helper hidden>
      <small data-offer-item-variety-hint></small>
      <label class="offer-item-create-variety" data-offer-item-create-variety-wrap hidden>
        <input type="checkbox" name="createVariety">
        Zalozit rovnou jako novou odrudu v katalogu
      </label>
    </div>
    <label class="field"><span>PoÄŤet ks</span><input name="quantity" inputmode="numeric" required value="${escapeHtml(item?.quantity || "1")}"></label>
    <label class="field"><span>Cena za ks</span><input name="price" inputmode="decimal" value="${escapeHtml(item?.price || matchedVariety?.salePrice || "")}"></label>
    <label class="field"><span>MÄ›na</span><select name="currency">
      <option value="CZK" ${selectedCurrency === "CZK" ? "selected" : ""}>KÄŤ</option>
      <option value="EUR" ${selectedCurrency === "EUR" ? "selected" : ""}>EUR</option>
    </select></label>
    ${photoPickerFields("Fotka odĹ™ezku (volitelnÄ›)")}
    <div class="photo-grid" id="photoGrid">${photoTiles(clean(item?.photoUrl) ? [item.photoUrl] : [])}</div>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(item?.note || "")}</textarea></label>
  </form>`, async () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const varietyName = clean(data.get("varietyName"));
    const conflict = findOfferItemNameConflict(offer, varietyName, item?.id || "");
    if (conflict) {
      toast(`Pozor: polozka "${offerItemName(conflict)}" uz v teto nabidce je. Pokud jde o jinou velikost nebo cenu, muzes ji ulozit.`);
    }
    const exactVariety = findVarietyByName(varietyName);
    const shouldCreateVariety = Boolean(data.get("createVariety"));
    const variety = exactVariety
      || findById("varieties", data.get("varietyId"))
      || (shouldCreateVariety ? ensureVarietyFromOfferItem(varietyName, data.get("price"), data.get("currency")) : null);
    const files = selectedPhotoFiles(form);
    const uploaded = await saveIndexedPhotos(files);
    const existingPhotos = [...form.querySelectorAll("[data-photo-tile]")].map((node) => node.dataset.photoTile);
    const now = new Date().toISOString();
    const nextItem = normalizeOfferItem({
      ...item,
      id: item?.id || uid(),
      varietyId: variety?.id || "",
      varietyName,
      quantity: quantityText(data.get("quantity")),
      price: clean(data.get("price")) || variety?.salePrice || "",
      currency: clean(data.get("currency")) || variety?.saleCurrency || "CZK",
      photoUrl: [...existingPhotos, ...uploaded][0] || "",
      note: clean(data.get("note")),
      reservations: item?.reservations || [],
      createdAt: item?.createdAt || now,
      updatedAt: now,
    });
    if (item) Object.assign(item, nextItem);
    else offer.items.push(nextItem);
    sortOfferItemsInPlace(offer);
    offer.updatedAt = now;
    saveData();
    setTimeout(() => openOfferDetailSheet(offer.id, { replace: true }), 0);
  });
  bindOfferItemVarietyPicker(offer, item);
  bindPhotoGrid();
}

function bindOfferItemVarietyPicker(offer, currentItem = null) {
  const form = document.querySelector("#sheetForm");
  const input = form?.elements.varietyName;
  const picker = form?.querySelector("[data-offer-variety-picker]");
  if (!form || !input || !picker) return;
  const render = () => renderOfferItemVarietyPicker(form, offer, currentItem);
  input.addEventListener("input", () => {
    const exact = findVarietyByName(input.value);
    if (exact) applyOfferItemVarietyToForm(exact, form, { forcePrice: false });
    else form.elements.varietyId.value = "";
    refreshOfferItemVarietyHelper(form, offer, currentItem, true);
    render();
  });
  input.addEventListener("focus", () => {
    refreshOfferItemVarietyHelper(form, offer, currentItem, true);
    render();
  });
  form.elements.price?.addEventListener("input", () => {
    delete form.elements.price.dataset.autoFilledFor;
  });
  picker.addEventListener("click", (event) => {
    const button = event.target.closest("[data-offer-variety-id]");
    if (!button) return;
    const variety = findById("varieties", button.dataset.offerVarietyId);
    if (!variety) return;
    applyOfferItemVarietyToForm(variety, form, { forcePrice: true });
    refreshOfferItemVarietyHelper(form, offer, currentItem, false);
    render();
  });
  refreshOfferItemVarietyHelper(form, offer, currentItem, false);
  render();
}

function renderOfferItemVarietyPicker(form, offer, currentItem = null) {
  const input = form?.elements.varietyName;
  const picker = form?.querySelector("[data-offer-variety-picker]");
  if (!input || !picker) return;
  const query = normalize(input.value);
  const selectedKey = varietyNameMatchKey(input.value);
  const usedKeys = offerUsedVarietyKeys(offer, currentItem?.id);
  const varieties = [...state.data.varieties]
    .filter((variety) => clean(variety.name))
    .sort((a, b) => naturalCompare(a.name, b.name));
  const matches = varieties
    .filter((variety) => !query || normalize(variety.name).includes(query));
  if (!matches.length) {
    picker.innerHTML = `<div class="offer-variety-empty">Ĺ˝ĂˇdnĂˇ odrĹŻda nenalezena. MĹŻĹľeĹˇ napsat novĂ˝ nĂˇzev.</div>`;
    return;
  }
  picker.innerHTML = matches.map((variety) => {
    const key = varietyNameMatchKey(variety.name);
    const used = usedKeys.has(clean(variety.id)) || usedKeys.has(key);
    const selected = selectedKey && key === selectedKey;
    const price = clean(variety.salePrice) ? formatMoney(variety.salePrice, variety.saleCurrency || "CZK") : "";
    const meta = [used ? "UĹľ v nabĂ­dce" : "", price].filter(Boolean).join(" Â· ");
    return `<button class="offer-variety-option ${used ? "used" : ""} ${selected ? "selected" : ""}" type="button" data-offer-variety-id="${escapeHtml(variety.id)}">
      <span>${escapeHtml(variety.name)}</span>
      ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
    </button>`;
  }).join("");
}

function applyOfferItemVarietyToForm(variety, form, options = {}) {
  if (!variety || !form) return;
  const input = form.elements.varietyName;
  const priceInput = form.elements.price;
  const currencyInput = form.elements.currency;
  form.elements.varietyId.value = variety.id || "";
  input.value = variety.name || "";
  if (priceInput && clean(variety.salePrice) && (options.forcePrice || !clean(priceInput.value) || priceInput.dataset.autoFilledFor)) {
    priceInput.value = variety.salePrice;
    priceInput.dataset.autoFilledFor = normalize(variety.name);
  }
  if (currencyInput && clean(variety.saleCurrency)) currencyInput.value = variety.saleCurrency;
}

function refreshOfferItemVarietyHelper(form, offer, currentItem = null, autofillPrice = false) {
  const helper = form?.querySelector("[data-offer-item-variety-helper]");
  const hint = form?.querySelector("[data-offer-item-variety-hint]");
  const createWrap = form?.querySelector("[data-offer-item-create-variety-wrap]");
  const createInput = form?.elements?.createVariety;
  const priceInput = form?.elements?.price;
  const currencyInput = form?.elements?.currency;
  const name = clean(form?.elements?.varietyName?.value);
  if (!helper || !hint || !createWrap || !createInput || !priceInput) return;

  if (!name) {
    helper.hidden = true;
    createWrap.hidden = true;
    createInput.checked = false;
    hint.textContent = "";
    return;
  }

  const exactVariety = findVarietyByName(name);
  const alreadyUsed = offerUsedVarietyKeys(offer, currentItem?.id).has(varietyNameMatchKey(name));
  helper.hidden = false;
  if (exactVariety) {
    createWrap.hidden = true;
    createInput.checked = false;
    hint.textContent = `${clean(exactVariety.salePrice)
      ? `V katalogu uz je. Cena ${formatMoney(exactVariety.salePrice, exactVariety.saleCurrency || "CZK")}.`
      : "V katalogu uz je. Cena se zatim v katalogu nevyplnila."}${alreadyUsed ? " V teto nabidce uz je pouzita." : ""}`;
    if (autofillPrice) {
      if (clean(exactVariety.salePrice)) {
        priceInput.value = exactVariety.salePrice;
        priceInput.dataset.autoFilledFor = normalize(exactVariety.name);
      } else if (priceInput.dataset.autoFilledFor) {
        priceInput.value = "";
        delete priceInput.dataset.autoFilledFor;
      }
      if (currencyInput) currencyInput.value = normalizeCurrency(exactVariety.saleCurrency);
    }
    return;
  }

  createWrap.hidden = false;
  if (autofillPrice && priceInput.dataset.autoFilledFor) {
    priceInput.value = "";
    delete priceInput.dataset.autoFilledFor;
  }
  hint.textContent = `V katalogu zatim neni. Muze zustat jen v nabidce, nebo ji rovnou zaloz do odrud.${alreadyUsed ? " V teto nabidce uz je pouzita." : ""}`;
}

function ensureVarietyFromOfferItem(name, price, currency) {
  const cleanName = clean(name);
  if (!cleanName) return null;
  const existing = findVarietyByName(cleanName);
  if (existing) return existing;
  const now = new Date().toISOString();
  const variety = normalizeVariety({
    id: uid(),
    name: cleanName,
    salePrice: normalizeAmount(price),
    saleCurrency: normalizeCurrency(currency || "CZK"),
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  upsert("varieties", variety);
  return findVarietyByName(cleanName) || variety;
}

function offerUsedVarietyKeys(offer, excludeItemId = "") {
  return new Set((offer?.items || [])
    .filter((item) => !excludeItemId || item.id !== excludeItemId)
    .flatMap((item) => [clean(item.varietyId), varietyNameMatchKey(offerItemName(item))])
    .filter(Boolean));
}

function openReservationSheet(offerId, itemId, reservationId = "", preferredStatus = "confirmed") {
  const offer = findById("offers", offerId);
  const item = offer?.items.find((entry) => entry.id === itemId);
  if (!offer || !item) return;
  item.reservations = Array.isArray(item.reservations) ? item.reservations : [];
  const reservation = reservationId ? item.reservations.find((entry) => entry.id === reservationId) : null;
  const status = reservationStatusValue(reservation?.status || preferredStatus);
  const selectedCustomerId = reservation?.customerId || "";
  openSheet(reservation ? "Upravit rezervaci" : (status === "alternate" ? "PĹ™idat nĂˇhradnĂ­ka" : "NovĂˇ rezervace"), `<form class="form-grid" id="sheetForm">
    <div class="offer-reservation-context">
      <strong>${escapeHtml(offerItemName(item))}</strong>
      <small>${escapeHtml(offer.title)} Â· volnĂ© ${reservationAvailableQuantity(item, reservation?.id)} ks</small>
    </div>
    <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId">
      <option value="">Vybrat zĂˇkaznĂ­ka</option>
      ${state.data.customers.slice().sort((a, b) => customerName(a).localeCompare(customerName(b), "cs")).map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`).join("")}
    </select></label>
    <label class="field"><span>Nebo novĂ˝ zĂˇkaznĂ­k</span><input name="newCustomerName" value="" placeholder="JmĂ©no nebo FB jmĂ©no"></label>
    <label class="field"><span>Telefon novĂ©ho zĂˇkaznĂ­ka</span><input name="newCustomerPhone" value="" inputmode="tel"></label>
    <label class="field"><span>PoÄŤet ks</span><input name="quantity" inputmode="numeric" required value="${escapeHtml(reservation?.quantity || "1")}"></label>
    ${toggle("status", [["confirmed", "Potvrzeno"], ["alternate", "NĂˇhradnĂ­k"]], status)}
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(reservation?.note || "")}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const newCustomerName = clean(data.get("newCustomerName"));
    let customerId = clean(data.get("customerId"));
    if (!customerId) {
      if (!newCustomerName) {
        toast("Vyber zĂˇkaznĂ­ka nebo napiĹˇ novĂ©ho.");
        return false;
      }
    }
    const id = reservation?.id || uid();
    const existing = item.reservations.find((entry) => entry.id === id);
    let nextStatus = reservationStatusValue(form.querySelector('[name="status"]').value);
    const requestedQuantity = wholeNumber(data.get("quantity"), 1);
    const availableQuantity = reservationAvailableQuantity(item, existing?.id);
    if (nextStatus === "confirmed" && availableQuantity <= 0) {
      nextStatus = "alternate";
      toast("PoloĹľka je plnĂˇ, uklĂˇdĂˇm jako nĂˇhradnĂ­ka.");
    } else if (nextStatus === "confirmed" && requestedQuantity > availableQuantity) {
      toast(`VolnĂ© jsou jen ${availableQuantity} ks. ZmenĹˇi poÄŤet nebo zvol nĂˇhradnĂ­ka.`);
      return false;
    }
    if (!customerId && newCustomerName) {
      const customer = normalizeCustomer({
        id: uid(),
        fullName: newCustomerName,
        phone: clean(data.get("newCustomerPhone")),
        createdAt: now,
        updatedAt: now,
      });
      state.data.customers.push(customer);
      customerId = customer.id;
    }
    const nextReservation = normalizeReservation({
      ...reservation,
      id,
      customerId,
      quantity: String(requestedQuantity),
      status: nextStatus,
      note: clean(data.get("note")),
      createdAt: reservation?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, nextReservation);
    else item.reservations.push(nextReservation);
    offer.updatedAt = now;
    saveData();
    setTimeout(() => openOfferDetailSheet(offer.id, { replace: true }), 0);
  });
  bindToggles();
}

function deleteOfferItem(offerId, itemId) {
  const offer = findById("offers", offerId);
  if (!offer) return;
  const item = offer.items.find((entry) => entry.id === itemId);
  if (!item || !confirm(`Smazat odĹ™ezek ${offerItemName(item)}?`)) return;
  pushTrashEntry("offer-item", offerItemName(item), {
    offerId: offer.id,
    offerTitle: offer.title,
    item,
  });
  offer.items = offer.items.filter((entry) => entry.id !== itemId);
  offer.updatedAt = new Date().toISOString();
  saveData();
  render();
  openOfferDetailSheet(offer.id, { replace: true });
  toast("Odřezek přesunut do koše.");
}

function deleteReservation(offerId, itemId, reservationId) {
  const offer = findById("offers", offerId);
  const item = offer?.items.find((entry) => entry.id === itemId);
  const reservation = item?.reservations?.find((entry) => entry.id === reservationId);
  if (!offer || !item || !reservation || !confirm("Smazat rezervaci?")) return;
  pushTrashEntry("reservation", customerName(findCustomer(reservation.customerId)) || "Rezervace", {
    offerId: offer.id,
    offerTitle: offer.title,
    itemId: item.id,
    itemName: offerItemName(item),
    reservation,
  });
  item.reservations = (item.reservations || []).filter((entry) => entry.id !== reservationId);
  offer.updatedAt = new Date().toISOString();
  saveData();
  render();
  openOfferDetailSheet(offer.id, { replace: true });
  toast("Rezervace přesunuta do koše.");
}

function createOrdersFromOffer(id) {
  const offer = findById("offers", id);
  if (!offer) return;
  const reservations = [];
  sortedOfferItems(offer).forEach((item) => {
    (item.reservations || []).forEach((reservation) => {
      if (!reservation.customerId) return;
      if (reservationStatusValue(reservation.status) !== "confirmed") return;
      reservations.push({ item, reservation });
    });
  });
  if (!reservations.length) {
    toast("NabĂ­dka nemĂˇ ĹľĂˇdnĂ© potvrzenĂ© rezervace.");
    return;
  }
  if (state.data.orders.some((order) => order.offerId === offer.id) && !confirm("Z tĂ©to nabĂ­dky uĹľ objednĂˇvky vznikly. VytvoĹ™it dalĹˇĂ­?")) return;
  if (!confirm(`VytvoĹ™it objednĂˇvky z nabĂ­dky ${offer.title}?`)) return;

  const grouped = new Map();
  reservations.forEach(({ item, reservation }) => {
    const key = reservation.customerId;
    if (!grouped.has(key)) grouped.set(key, { customerId: reservation.customerId, lineItems: new Map(), total: 0, entries: [] });
    const group = grouped.get(key);
    const quantity = wholeNumber(reservation.quantity, 1);
    const price = number(item.price);
    const lineKey = clean(item.id) || offerItemName(item);
    const lineItem = group.lineItems.get(lineKey) || {
      name: offerItemName(item),
      quantity: 0,
      unitPrice: item.price,
    };
    lineItem.quantity += quantity;
    group.lineItems.set(lineKey, lineItem);
    if (Number.isFinite(price)) group.total += price * quantity;
    group.entries.push({ item, reservation });
  });

  const now = new Date().toISOString();
  let count = 0;
  grouped.forEach((group) => {
    const fees = defaultOfferOrderFees(group.customerId);
    const shippingFee = number(fees.shippingFee);
    const packingFee = number(fees.packingFee);
    const feeTotal = (Number.isFinite(shippingFee) ? shippingFee : 0) + (Number.isFinite(packingFee) ? packingFee : 0);
    const orderId = uid();
    const lines = [...group.lineItems.values()].map((line) => {
      const unitPrice = number(line.unitPrice);
      return Number.isFinite(unitPrice)
        ? offerOrderLineText(line.name, line.quantity, line.unitPrice)
        : `${line.name} ${line.quantity}x`;
    });
    state.data.orders.push(normalizeOrder({
      id: orderId,
      offerId: offer.id,
      customerId: group.customerId,
      orderDate: offer.date || todayInput(),
      varietiesText: lines.join("\n"),
      price: normalizeAmount(group.total + feeTotal),
      paymentStatus: "ÄŤekĂˇ",
      shippingStatus: "novĂˇ",
      deliveryMethod: "ship",
      shippingFee: Number.isFinite(shippingFee) ? fees.shippingFee : "",
      shippingFeeLabel: Number.isFinite(shippingFee) ? fees.shippingFeeLabel : "",
      packingFee: Number.isFinite(packingFee) ? fees.packingFee : "",
      note: `Z nabĂ­dky: ${offer.title}`,
      createdAt: now,
      updatedAt: now,
    }));
    group.entries.forEach(({ reservation }) => {
      reservation.orderId = orderId;
      reservation.orderCreatedAt = now;
    });
    count += 1;
  });

  offer.status = "uzavĹ™enĂˇ";
  offer.updatedAt = now;
  saveData();
  closeSheet({ all: true });
  state.view = "orders";
  render();
  toast(`VytvoĹ™eno ${count} objednĂˇvek.`);
}

function offerOrderLineText(name, quantity, unitPrice) {
  return `${clean(name)} ${wholeNumber(quantity, 1)}x - ${normalizeAmount(unitPrice)} KÄŤ`.trim();
}

async function prepareFacebookOffer(id) {
  try {
    const offerId = clean(id || state.activeOfferId);
    const offer = findById("offers", offerId) || (state.data.offers.length === 1 ? state.data.offers[0] : null);
    if (!offer) {
      toast("NabĂ­dku se nepodaĹ™ilo najĂ­t.");
      return;
    }
    state.activeOfferId = offer.id;
    toast("OtevĂ­rĂˇm Facebook text...");
    offer.facebookPublishDate = clean(offer.facebookPublishDate || offer.date || todayInput());
    offer.facebookPublishTime = clean(offer.facebookPublishTime || "20:00");
    offer.updatedAt = new Date().toISOString();
    try {
      saveData();
    } catch {
      // Text se mĂˇ otevĹ™Ă­t i pokud prohlĂ­ĹľeÄŤ prĂˇvÄ› odmĂ­tne zĂˇpis do ĂşloĹľiĹˇtÄ›.
    }
    openFacebookOfferSheet(offer.id);
  } catch (error) {
    console.error(error);
    toast(`Facebook chyba: ${clean(error?.message || error).slice(0, 80) || "neznĂˇmĂˇ chyba"}`);
  }
}

function openFacebookOfferSheet(id, options = {}) {
  const offer = findById("offers", id || state.activeOfferId);
  if (!offer) {
    toast("NabĂ­dku se nepodaĹ™ilo najĂ­t.");
    return;
  }
  const text = state.facebookDraftTextByOffer.get(offer.id) || safeBuildFacebookOfferText(offer);
  const photoCount = facebookOfferZipEntries(offer).length;
  const photoStatus = photoCount ? `Fotky k uloĹľenĂ­: ${photoCount}` : "Tahle nabĂ­dka zatĂ­m nemĂˇ volnĂ© fotky.";
  openSheet("Facebook pĹ™Ă­spÄ›vek", `<div class="form-grid">
    <p class="sub">Text mĹŻĹľeĹˇ upravit. Appka si ho uloĹľĂ­ jako Ĺˇablonu; odĹ™ezky, kusy a ceny doplnĂ­ pĹ™Ă­ĹˇtÄ› automaticky.</p>
    <label class="field"><span>Text pĹ™Ă­spÄ›vku</span><textarea data-facebook-offer-text rows="14">${escapeHtml(text)}</textarea></label>
    ${facebookZipProgressMarkup(photoStatus)}
  </div>`, null, `<button class="button" type="button" data-close-sheet>ZpÄ›t</button><button class="button" type="button" data-save-facebook-template>UloĹľit text</button><button class="button" type="button" data-copy-facebook-offer>KopĂ­rovat text</button><button class="button primary" type="button" data-download-facebook-zip="${escapeHtml(id)}">StĂˇhnout fotky ZIP</button>`, {
    ...options,
    restore: () => openFacebookOfferSheet(id, { replace: true }),
  });
  const textArea = els.sheet.querySelector("[data-facebook-offer-text]");
  textArea?.addEventListener("focus", () => textArea.select());
}

function facebookZipProgressMarkup(text) {
  return `<div class="empty light facebook-zip-progress" data-facebook-zip-progress aria-live="polite">
    <span data-facebook-zip-progress-label>${escapeHtml(text)}</span>
    <span class="facebook-zip-progress-bar" aria-hidden="true"><span data-facebook-zip-progress-fill style="width: 0%"></span></span>
  </div>`;
}

function updateFacebookZipProgress(current, total, message = "") {
  const root = els.sheet?.querySelector("[data-facebook-zip-progress]");
  if (!root) return;
  const safeTotal = Math.max(0, Number(total) || 0);
  const safeCurrent = Math.max(0, Math.min(safeTotal, Number(current) || 0));
  const percent = safeTotal ? Math.round((safeCurrent / safeTotal) * 100) : 0;
  const label = root.querySelector("[data-facebook-zip-progress-label]");
  const fill = root.querySelector("[data-facebook-zip-progress-fill]");
  if (label) label.textContent = message || (safeTotal ? `Fotka ${safeCurrent} z ${safeTotal}` : "Bez fotek k uloĹľenĂ­");
  if (fill) fill.style.width = `${percent}%`;
}

function waitForUiPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function downloadFacebookOfferZip(id, button) {
  const offer = findById("offers", id);
  if (!offer) return;
  const text = clean(els.sheet.querySelector("[data-facebook-offer-text]")?.value) || safeBuildFacebookOfferText(offer);
  rememberFacebookDraftText(id);
  await copyTextToClipboard(text);
  const previousLabel = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "PĹ™ipravuji ZIP...";
  }
  try {
    const entries = [{ name: "facebook-text.txt", blob: new Blob([text], { type: "text/plain;charset=utf-8" }) }];
    const photoEntries = facebookOfferZipEntries(offer);
    updateFacebookZipProgress(0, photoEntries.length, photoEntries.length ? `ZaÄŤĂ­nĂˇm pĹ™ipravovat ${photoEntries.length} fotek...` : "Bez fotek k uloĹľenĂ­.");
    await waitForUiPaint();
    for (let index = 0; index < photoEntries.length; index += 1) {
      const entry = photoEntries[index];
      updateFacebookZipProgress(index, photoEntries.length, `NaÄŤĂ­tĂˇm fotku ${index + 1} z ${photoEntries.length}`);
      await waitForUiPaint();
      const file = await photoRefToFacebookFile(entry.ref, entry.name);
      if (!file) {
        updateFacebookZipProgress(index + 1, photoEntries.length, `Fotka ${index + 1} se pĹ™eskoÄŤila`);
        continue;
      }
      updateFacebookZipProgress(index, photoEntries.length, `PĹ™idĂˇvĂˇm text do fotky ${index + 1} z ${photoEntries.length}`);
      await waitForUiPaint();
      const labeledFile = await createFacebookLabeledPhotoFile(file, entry);
      entries.push({ name: `${entry.name}${photoExtension(labeledFile)}`, blob: labeledFile });
      updateFacebookZipProgress(index + 1, photoEntries.length, `Hotovo ${index + 1} z ${photoEntries.length}`);
    }
    updateFacebookZipProgress(photoEntries.length, photoEntries.length, "BalĂ­m ZIP...");
    await waitForUiPaint();
    const zip = await createZipBlob(entries);
    downloadBlob(zip, `${safeFileName(offer.title || "nabidka", "nabidka")}-fotky.zip`);
    updateFacebookZipProgress(photoEntries.length, photoEntries.length, `ZIP hotovĂ˝: ${Math.max(0, entries.length - 1)} fotek.`);
    toast(`ZIP hotovĂ˝: ${Math.max(0, entries.length - 1)} fotek. Text je zkopĂ­rovanĂ˝.`);
  } catch (error) {
    console.error(error);
    updateFacebookZipProgress(0, facebookOfferZipEntries(offer).length, "ZIP se nepodaĹ™ilo vytvoĹ™it.");
    toast("ZIP se nepodaĹ™ilo vytvoĹ™it.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = previousLabel || "StĂˇhnout fotky ZIP";
    }
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function createFacebookLabeledPhotoFile(file, entry) {
  if (!file?.type?.startsWith("image/")) return file;
  let objectUrl = "";
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await loadCanvasImage(objectUrl);
    if (!image) return file;
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) return file;
    const maxEdge = 1800;
    const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
    const imageWidth = Math.max(1, Math.round(sourceWidth * scale));
    const imageHeight = Math.max(1, Math.round(sourceHeight * scale));
    const padding = Math.max(28, Math.round(imageWidth * 0.036));
    const titleFontSize = Math.max(38, Math.min(72, Math.round(imageWidth * 0.062)));
    const valueFontSize = Math.max(36, Math.min(70, Math.round(imageWidth * 0.058)));
    const labelFontSize = Math.max(18, Math.min(30, Math.round(imageWidth * 0.026)));
    const titleLineHeight = Math.round(titleFontSize * 1.12);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.font = `900 ${titleFontSize}px 'Segoe UI', Arial, sans-serif`;
    const titleLines = wrapCanvasText(context, entry.title || entry.label, imageWidth - padding * 3).slice(0, 2);
    const titleBlockHeight = padding * 0.65 + titleLines.length * titleLineHeight;
    const footerHeight = Math.max(210, Math.round(imageWidth * 0.27) + (titleLines.length > 1 ? titleLineHeight : 0));
    canvas.width = imageWidth;
    canvas.height = imageHeight + footerHeight;
    context.fillStyle = "#fbf7e9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, imageWidth, imageHeight);
    const gradient = context.createLinearGradient(0, imageHeight, canvas.width, canvas.height);
    gradient.addColorStop(0, "#fff8e9");
    gradient.addColorStop(1, "#dff4df");
    context.fillStyle = gradient;
    context.fillRect(0, imageHeight, canvas.width, footerHeight);
    context.strokeStyle = "#95c49f";
    context.lineWidth = Math.max(2, Math.round(imageWidth * 0.004));
    context.beginPath();
    context.moveTo(0, imageHeight + 1);
    context.lineTo(canvas.width, imageHeight + 1);
    context.stroke();
    context.fillStyle = "#0d3b2d";
    context.font = `900 ${titleFontSize}px 'Segoe UI', Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    titleLines.forEach((line, index) => {
      context.fillText(line, imageWidth / 2, imageHeight + padding * 0.9 + titleFontSize + index * titleLineHeight);
    });

    const priceText = clean(entry.priceText) || "Bez ceny";
    const quantityTextValue = clean(entry.quantityLabel) || "";
    const gap = Math.max(16, Math.round(imageWidth * 0.025));
    const cardY = imageHeight + padding * 0.9 + titleBlockHeight + Math.round(padding * 0.25);
    const cardHeight = Math.max(92, Math.min(Math.round(imageWidth * 0.14), canvas.height - cardY - padding * 0.65));
    const priceWidth = Math.round((imageWidth - padding * 2 - gap) * 0.58);
    const qtyWidth = imageWidth - padding * 2 - gap - priceWidth;
    drawFacebookValueCard(context, padding, cardY, priceWidth, cardHeight, "Cena", priceText, valueFontSize, labelFontSize, "#8d2d4c");
    drawFacebookValueCard(context, padding + priceWidth + gap, cardY, qtyWidth, cardHeight, "Kusy", quantityTextValue, valueFontSize, labelFontSize, "#0d3b2d");
    context.textAlign = "left";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) return file;
    return await preparePhotoFileForStorage(new File([blob], `${entry.name}.jpg`, { type: "image/jpeg" }));
  } catch {
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function drawFacebookRoundedRect(context, x, y, width, height, radius, fillStyle, strokeStyle = "") {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
  context.fillStyle = fillStyle;
  context.fill();
  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = 2;
    context.stroke();
  }
}

function drawFacebookValueCard(context, x, y, width, height, label, value, valueFontSize, labelFontSize, color) {
  drawFacebookRoundedRect(context, x, y, width, height, Math.round(height * 0.28), "rgba(255, 255, 250, 0.76)", "rgba(13, 59, 45, 0.12)");
  context.textAlign = "center";
  context.fillStyle = color;
  context.font = `950 ${valueFontSize}px 'Segoe UI', Arial, sans-serif`;
  context.fillText(value, x + width / 2, y + height * 0.5 + valueFontSize * 0.22);
  context.fillStyle = "rgba(13, 59, 45, 0.68)";
  context.font = `800 ${labelFontSize}px 'Segoe UI', Arial, sans-serif`;
  context.fillText(label, x + width / 2, y + height - labelFontSize * 0.65);
}

async function createZipBlob(entries) {
  const files = [];
  for (const entry of entries) {
    const blob = entry?.blob;
    const name = safeFileName(clean(entry?.name).replace(/\.[^.]+$/, ""), "soubor") + (clean(entry?.name).match(/\.[a-z0-9]+$/i)?.[0] || "");
    if (!blob || !name) continue;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    files.push({ name, nameBytes: new TextEncoder().encode(name), bytes, crc: crc32(bytes) });
  }
  const parts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const localHeader = zipLocalHeader(file);
    parts.push(localHeader, file.nameBytes, file.bytes);
    centralParts.push(zipCentralHeader(file, offset), file.nameBytes);
    offset += localHeader.byteLength + file.nameBytes.byteLength + file.bytes.byteLength;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  parts.push(...centralParts, zipEndRecord(files.length, centralSize, offset));
  return new Blob(parts, { type: "application/zip" });
}

function zipLocalHeader(file) {
  const header = new ArrayBuffer(30);
  const view = new DataView(header);
  const { time, date } = zipDosDateTime();
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, time, true);
  view.setUint16(12, date, true);
  view.setUint32(14, file.crc, true);
  view.setUint32(18, file.bytes.byteLength, true);
  view.setUint32(22, file.bytes.byteLength, true);
  view.setUint16(26, file.nameBytes.byteLength, true);
  view.setUint16(28, 0, true);
  return header;
}

function zipCentralHeader(file, offset) {
  const header = new ArrayBuffer(46);
  const view = new DataView(header);
  const { time, date } = zipDosDateTime();
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, time, true);
  view.setUint16(14, date, true);
  view.setUint32(16, file.crc, true);
  view.setUint32(20, file.bytes.byteLength, true);
  view.setUint32(24, file.bytes.byteLength, true);
  view.setUint16(28, file.nameBytes.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  return header;
}

function zipEndRecord(count, centralSize, centralOffset) {
  const header = new ArrayBuffer(22);
  const view = new DataView(header);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return header;
}

function zipDosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = Math.max(1, date.getDate());
  const dosDate = ((Math.max(1980, date.getFullYear()) - 1980) << 9) | ((date.getMonth() + 1) << 5) | day;
  return { time, date: dosDate };
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crc32.table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

crc32.table = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  return value >>> 0;
});

async function shareFacebookOffer(id, button) {
  const offer = findById("offers", id);
  if (!offer) return;
  const text = clean(els.sheet.querySelector("[data-facebook-offer-text]")?.value) || safeBuildFacebookOfferText(offer);
  rememberFacebookDraftText(id);
  await copyTextToClipboard(text);
  const photoOffset = Math.max(0, Number(button?.dataset.facebookPhotoOffset ?? state.facebookPhotoOffsetByOffer.get(offer.id)) || 0);
  const photoRefs = facebookPhotoRefs(offer, { offset: photoOffset, limit: FACEBOOK_PHOTO_BATCH_SIZE });
  if (!photoRefs.length) {
    if (navigator.share) {
      try {
        await navigator.share({ title: offer.title, text });
      } catch {
        toast("Text zkopĂ­rovanĂ˝. SdĂ­lenĂ­ zruĹˇeno.");
      }
    } else {
      toast("Text zkopĂ­rovanĂ˝. Fotky nejsou v nabĂ­dce.");
    }
    return;
  }
  if (!navigator.share) {
    toast("Text zkopĂ­rovanĂ˝. Na poÄŤĂ­taÄŤi vloĹľ text do Facebooku ruÄŤnÄ›.");
    return;
  }
  const previousLabel = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "PĹ™ipravuji...";
  }
  toast("PĹ™ipravuji fotky...");
  const files = [];
  try {
    for (const [index, ref] of photoRefs.entries()) {
      const file = await photoRefToFacebookFile(ref, `${offer.title}-${index + 1}`);
      if (file) files.push(file);
    }
    if (files.length && (!navigator.canShare || navigator.canShare({ files }))) {
      await navigator.share({ title: offer.title, text, files });
      toast(`Text i fotky ${photoOffset + 1}-${photoOffset + files.length} pĹ™ipravenĂ©.`);
      return;
    }
    await navigator.share({ title: offer.title, text });
    toast("Text pĹ™ipravenĂ˝, fotky vyber ruÄŤnÄ›.");
  } catch (error) {
    if (error?.name === "AbortError") toast("Text zkopĂ­rovanĂ˝, sdĂ­lenĂ­ zruĹˇeno.");
    else toast("Text zkopĂ­rovanĂ˝. SdĂ­lenĂ­ fotek funguje hlavnÄ› na mobilu.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = previousLabel || "SdĂ­let";
    }
  }
}

async function copyPreparedFacebookText() {
  const text = els.sheet.querySelector("[data-facebook-offer-text]")?.value;
  if (!text) {
    toast("Text se nepodaĹ™ilo najĂ­t.");
    return;
  }
  rememberFacebookDraftText();
  await copyTextToClipboard(text);
  toast("Text pro Facebook zkopĂ­rovanĂ˝.");
}

function savePreparedFacebookText() {
  const text = els.sheet.querySelector("[data-facebook-offer-text]")?.value;
  if (!text) {
    toast("Text se nepodaĹ™ilo najĂ­t.");
    return;
  }
  rememberFacebookDraftText();
  toast("Text uloĹľenĂ˝ jako Ĺˇablona.");
}

function rememberFacebookDraftText(id) {
  const offerId = clean(id || state.activeOfferId);
  const text = els.sheet.querySelector("[data-facebook-offer-text]")?.value;
  if (text == null) return;
  state.facebookDraftTextByOffer.set(offerId, text);
  saveFacebookOfferTemplateFromText(offerId, text);
}

function safeBuildFacebookOfferText(offer) {
  try {
    return buildFacebookOfferText(offer);
  } catch (error) {
    console.error(error);
    return fallbackFacebookOfferText(offer);
  }
}

function fallbackFacebookOfferText(offer = {}) {
  return [
    "đźŚż NabĂ­dka africkĂ˝ch kopĹ™iv (Coleus) đźŚż",
    "",
    "đź“… Kdy?",
    facebookOfferDateLine(offer),
    "",
    "Fotky jednotlivĂ˝ch rostlin budu postupnÄ› pĹ™idĂˇvat do komentĂˇĹ™ĹŻ pod tento pĹ™Ă­spÄ›vek.",
    "",
    FACEBOOK_ITEMS_TOKEN,
    "",
    "Pokud mĂˇte o nÄ›kterou rostlinu zĂˇjem, napiĹˇte prosĂ­m pod konkrĂ©tnĂ­ fotku: â€žzĂˇjemâ€ś nebo â€žkupujiâ€ś.",
    "",
    "PĹ™eji krĂˇsnĂ˝ rostlinnĂ˝ lov đźŚżđź’š",
  ].join("\n").trim();
}

function facebookPhotoRefs(offer, options = {}) {
  const allRefs = unique(facebookOfferAvailableItems(offer).map(({ item }) => offerItemImageSafe(item)).filter(Boolean));
  const offset = Math.max(0, Math.floor(Number(options.offset) || 0));
  const limit = options.limit === Infinity ? allRefs.length : Math.max(1, Math.floor(Number(options.limit) || FACEBOOK_PHOTO_BATCH_SIZE));
  return allRefs.slice(offset, offset + limit);
}

function facebookOfferZipEntries(offer) {
  const usedNames = new Set();
  return facebookOfferAvailableItems(offer)
    .map(({ item, available }, index) => {
      const ref = offerItemImageSafe(item);
      if (!ref) return null;
      const priceText = clean(item?.price) ? formatMoney(item.price, item.currency || "CZK") : "";
      const price = priceText ? `${normalizeAmount(item.price)}-${normalizeCurrencyLabel(item.currency || "CZK")}` : "";
      const title = offerItemNameSafe(item);
      const quantityLabel = `${quantityText(available)} ks`;
      const label = `${title} - ${quantityLabel}${priceText ? ` - ${priceText}` : ""}`;
      const base = safeFileName(`${String(index + 1).padStart(3, "0")}-${offerItemNameSafe(item)}-${quantityText(available)}ks-${price}`, `fotka-${index + 1}`);
      let name = base;
      let suffix = 2;
      while (usedNames.has(name)) {
        name = `${base}-${suffix}`;
        suffix += 1;
      }
      usedNames.add(name);
      return { ref, name, label, title, quantityLabel, priceText };
    })
    .filter(Boolean);
}

function normalizeCurrencyLabel(currency) {
  const value = clean(currency || "CZK").toUpperCase();
  return value === "EUR" ? "eur" : "kc";
}

function safeOfferItems(offer) {
  return sortedOfferItems(offer);
}

function offerItemImageSafe(item) {
  try {
    return offerItemImage(item);
  } catch {
    return clean(item?.photoUrl);
  }
}

function compareOfferItems(a = {}, b = {}) {
  const nameDelta = naturalCompare(a.varietyName || a.name, b.varietyName || b.name);
  return nameDelta || naturalCompare(a.id, b.id);
}

function sortedOfferItems(offer) {
  return Array.isArray(offer?.items) ? [...offer.items].sort(compareOfferItems) : [];
}

function sortOfferItemsInPlace(offer) {
  if (Array.isArray(offer?.items)) offer.items.sort(compareOfferItems);
  return offer;
}

function offerItemNameSafe(item) {
  try {
    return offerItemName(item);
  } catch {
    return clean(item?.varietyName || item?.name || "OdĹ™ezek");
  }
}

function facebookOfferAvailableItems(offer) {
  return safeOfferItems(offer)
    .map((item) => ({ item, available: reservationAvailableQuantity(item) }))
    .filter(({ available }) => available > 0);
}

function facebookOfferItemLines(offer) {
  return facebookOfferAvailableItems(offer).map(({ item, available }) => {
    const price = clean(item?.price) ? formatMoney(item.price, item.currency || "CZK") : "";
    return `• ${offerItemNameSafe(item)} - ${quantityText(available)} ks${price ? ` - ${price}` : ""}`;
  });
}

function buildFacebookOfferText(offer) {
  const settings = appSettings();
  return renderFacebookOfferTemplate(settings.facebookOfferTemplate || defaultFacebookOfferTemplate(settings), offer);
}

function defaultFacebookOfferTemplate(settings = appSettings()) {
  const feeLines = [
    `• balné: ${formatMoney(settings.packingFee || 20, "CZK")}`,
    `• Zásilkovna ČR: ${formatMoney(settings.shippingFeeCz || 89, "CZK")}`,
    `• Zásilkovna SK: ${formatMoney(settings.shippingFeeSk || 99, "CZK")}`,
    clean(settings.shippingFeeAddressCz) ? `• Zásilkovna na adresu ČR: ${formatMoney(settings.shippingFeeAddressCz, "CZK")}` : "",
    clean(settings.shippingFeeAddressSk) ? `• Zásilkovna na adresu Slovensko: ${formatMoney(settings.shippingFeeAddressSk, "CZK")}` : "",
    clean(settings.postalFee) ? `• Balíkovna: ${formatMoney(settings.postalFee, "CZK")}` : "",
    clean(settings.codFeeCz) ? `• dobírka ČR: ${formatMoney(settings.codFeeCz, "CZK")}` : "",
    clean(settings.codFeeSk) ? `• dobírka Slovensko: ${formatMoney(settings.codFeeSk, "CZK")}` : "",
  ].filter(Boolean);
  return [
    "🌿 Nabídka afrických kopřiv (Coleus) 🌿",
    "Nabízím řízky afrických kopřiv, některé mají kořínky.",
    "Řízky které mají kořínky, nejsou plně vybarvené, ostatní již chytají správné barvy ☀️",
    "",
    "📅 Kdy?",
    FACEBOOK_DATE_TOKEN,
    "",
    "📸 Fotky jednotlivých rostlin budu postupně přidávat do komentářů pod tento příspěvek – vždy s názvem, cenou a počtem dostupných kusů.",
    "",
    FACEBOOK_ITEMS_TOKEN,
    "",
    "👉 Pokud máte o některou rostlinu zájem, napište prosím pod konkrétní fotku:",
    "„zájem“ nebo „kupuji“.",
    "",
    "👍 Po zveřejnění všech volných řízků dám „lajk“ jako potvrzení vašeho nákupu. V neděli pošlu foto, co jste nakoupili a balím, odesílám pondělí, když bych nestihla vše, tak v úterý 🙂",
    "",
    "📩 Následně mi prosím pošlete do zprávy:",
    "• sumarizaci vašeho nákupu",
    "• pouze olajkované fotky",
    "• adresu do Zásilkovny",
    "",
    "📦 Cena dopravy:",
    ...feeLines,
    "",
    "🚚 Odesílám po celé ČR, Slovensku i do Evropy.",
    "Přeji krásný rostlinný lov 🌿💚",
  ].join("\n").trim();
}

function renderFacebookOfferTemplate(template, offer) {
  const source = clean(template) || defaultFacebookOfferTemplate();
  const withItems = source.includes(FACEBOOK_ITEMS_TOKEN) ? source : `${source}\n\n${FACEBOOK_ITEMS_TOKEN}`;
  return withItems
    .replaceAll(FACEBOOK_DATE_TOKEN, facebookOfferDateLine(offer))
    .replaceAll(FACEBOOK_ITEMS_TOKEN, facebookOfferItemsBlock(offer))
    .trim();
}

function facebookOfferItemsBlock(offer) {
  const itemLines = facebookOfferItemLines(offer);
  const lines = [
    itemLines.length ? "Volné odřezky v nabídce:" : "Volné odřezky v nabídce doplním postupně.",
    ...itemLines,
  ];
  return lines.filter((line, index) => line || lines[index - 1] !== "").join("\n").trim();
}

function saveFacebookOfferTemplateFromText(id, text) {
  const offer = findById("offers", id);
  if (!offer) return;
  let template = clean(text);
  const itemsBlock = facebookOfferItemsBlock(offer);
  const dateLine = facebookOfferDateLine(offer);
  if (itemsBlock && template.includes(itemsBlock)) template = template.replace(itemsBlock, FACEBOOK_ITEMS_TOKEN);
  if (dateLine && template.includes(dateLine)) template = template.replace(dateLine, FACEBOOK_DATE_TOKEN);
  if (!template.includes(FACEBOOK_ITEMS_TOKEN)) template = `${template}\n\n${FACEBOOK_ITEMS_TOKEN}`.trim();
  state.data.settings = { ...appSettings(), facebookOfferTemplate: template };
  saveData();
}

function facebookOfferDateLine(offer) {
  const date = localDateFromInput(offer?.facebookPublishDate || offer?.date) || new Date();
  const weekday = new Intl.DateTimeFormat("cs-CZ", { weekday: "long" }).format(date);
  const isToday = toDateInput(date) === todayInput();
  const time = clean(offer?.facebookPublishTime) || "20:00";
  return isToday ? `Dnes, v ${weekday} od ${time} hod.` : `${formatDate(toDateInput(date))} od ${time} hod.`;
}

function localDateFromInput(value) {
  const match = clean(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fallback nĂ­Ĺľe funguje i ve starĹˇĂ­m webview.
  }
  fallbackCopyText(text);
}

async function photoRefToFacebookFile(ref, ownerName = "fotka") {
  try {
    const value = clean(ref);
    let file = value.startsWith(SUPABASE_PHOTO_PREFIX)
      ? await supabasePhotoRefToPreparedFile(value, ownerName)
      : await photoToFile(value, ownerName);
    return file ? await preparePhotoFileForStorage(file) : null;
  } catch {
    return null;
  }
}

async function supabasePhotoRefToPreparedFile(ref, ownerName = "fotka") {
  const cached = await getCachedSupabasePhotoBlob(ref, { prepared: true });
  if (cached) return new File([cached], `${safeFileName(ownerName)}${photoExtension(cached)}`, { type: cached.type || "image/jpeg" });
  const source = await supabasePhotoRefToFile(ref, ownerName);
  if (!source) return null;
  const prepared = await preparePhotoFileForStorage(source);
  cacheSupabasePhotoBlob(ref, prepared, parseSupabasePhotoRef(ref), { prepared: true, allowLarge: true }).catch(() => {});
  return prepared;
}

async function supabasePhotoRefToFile(ref, ownerName = "fotka") {
  const localOriginal = await getLocalSupabaseOriginalFile(ref, ownerName);
  if (localOriginal) return localOriginal;
  const cached = await getCachedSupabasePhotoBlob(ref);
  if (cached) return new File([cached], `${safeFileName(ownerName)}${photoExtension(cached)}`, { type: cached.type || "image/jpeg" });
  const path = parseSupabasePhotoRef(ref);
  if (!path) return null;
  const session = await ensureSession();
  const config = loadSyncConfig();
  const response = await fetch(`${config.url.replace(/\/+$/, "")}/storage/v1/object/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  if (!response.ok) return null;
  const blob = await response.blob();
  cacheSupabasePhotoBlob(ref, blob, path).catch(() => {});
  return new File([blob], clean(path).split("/").pop() || `${safeFileName(ownerName)}.jpg`, { type: blob.type || "image/jpeg" });
}

function collectSupabaseOriginalPhotoEntries(data = state.data) {
  const entries = [];
  const add = (ref, ownerName) => {
    const value = clean(ref);
    if (!value.startsWith(SUPABASE_PHOTO_PREFIX)) return;
    const path = parseSupabasePhotoRef(value);
    if (!path) return;
    entries.push({ ref: value, path, ownerName: clean(ownerName) || "fotka" });
  };
  for (const variety of data?.varieties || []) {
    for (const ref of varietyImages(variety)) add(ref, variety?.name || "odruda");
  }
  for (const cross of data?.crosses || []) {
    for (const ref of crossSeedlingImages(cross)) add(ref, crossSeedlingOwnerName(cross));
  }
  for (const offer of data?.offers || []) {
    for (const item of offer?.items || []) add(item?.photoUrl, offerItemName(item) || "nabidka");
  }
  return entries;
}

function crossSeedlingOwnerName(cross = {}) {
  const linked = findById("varieties", clean(cross.linkedVarietyId));
  const namedVariety = findVarietyByName(clean(cross.seedlingName || cross.name));
  const generic = new Set(["semenac", "semenacek", "semenak", "krizeni"]);
  const candidates = [cross.seedlingName, cross.name, linked?.name, namedVariety?.name, crossLineage(cross)]
    .map(clean)
    .filter(Boolean);
  return candidates.find((name) => !generic.has(normalize(name).replace(/[^a-z0-9]+/g, ""))) || candidates[0] || "semenac";
}

function buildSupabaseOriginalDownloadPlan(data = state.data) {
  const byRef = new Map();
  const ownerCounts = new Map();
  for (const entry of collectSupabaseOriginalPhotoEntries(data)) {
    if (byRef.has(entry.ref)) continue;
    const baseKey = safeFileName(entry.ownerName || "fotka", "fotka");
    const nextIndex = (ownerCounts.get(baseKey) || 0) + 1;
    ownerCounts.set(baseKey, nextIndex);
    byRef.set(entry.ref, {
      ...entry,
      fileName: buildOwnerPhotoFileName(entry.ownerName, entry.path, nextIndex),
    });
  }
  return [...byRef.values()];
}

function storagePathExtension(path) {
  return clean(path).match(/\.[a-z0-9]+$/i)?.[0] || ".jpg";
}

function buildOwnerPhotoFileName(ownerName, path = "", index = 1) {
  const base = safeFileName(ownerName || "fotka", "fotka");
  return `${base}${index > 1 ? `-${index}` : ""}${storagePathExtension(path)}`;
}

async function downloadSupabaseOriginalsToMobile() {
  try {
    const plan = buildSupabaseOriginalDownloadPlan(state.data);
    if (!plan.length) {
      toast("V mobilu teď nejsou žádné cloudové originály ke stažení.");
      return false;
    }
    updateSyncIndicator("working");
    const directoryHandle = await getMobileOriginalsFolderHandle({ requestPermission: true });
    const currentCounts = await mobileOriginalsStatusCounts().catch(() => null);
    const folderSnapshot = directoryHandle ? await mobileOriginalFolderSnapshot(plan, { requestPermission: true, timeoutMs: 20000 }).catch(() => null) : null;
    if (currentCounts?.stored === plan.length && folderSnapshot?.count === plan.length) {
      await rememberMobileOriginalsFolderCount(folderSnapshot.count, plan.length).catch(() => {});
      setMobileOriginalsStatusParts(`V appce: ${currentCounts.stored}/${plan.length}`, `Ve složce: ${folderSnapshot.count}/${plan.length}`);
      updateSyncIndicator();
      toast("Všechno už je uložené. Není potřeba nic doplňovat.");
      return true;
    }
    const missingInApp = [];
    if (currentCounts?.plan) {
      for (const entry of currentCounts.plan) {
        const existing = await getLocalSupabaseOriginalRecord(entry.ref);
        if (!existing?.blob) missingInApp.push(entry);
      }
    }
    const entriesToProcess = missingInApp.length
      ? missingInApp
      : folderSnapshot?.missing?.length
        ? folderSnapshot.missing
        : plan;
    let downloaded = 0;
    let alreadyStored = 0;
    let copiedToFolder = 0;
    let alreadyInFolder = 0;
    let folderFailed = 0;
    let failed = 0;
    for (let index = 0; index < entriesToProcess.length; index += 1) {
      const entry = entriesToProcess[index];
      setMobileOriginalsStatusParts(`V appce: ověřuji ${index + 1}/${entriesToProcess.length}`, directoryHandle ? `Ve složce: ověřuji ${index + 1}/${entriesToProcess.length}` : "Ve složce: nevybraná");
      let file = null;
      const existing = await getLocalSupabaseOriginalRecord(entry.ref);
      if (existing?.blob) {
        alreadyStored += 1;
        file = await getLocalSupabaseOriginalFile(entry.ref, entry.ownerName);
      } else {
        file = await supabasePhotoRefToFile(entry.ref, entry.ownerName);
        if (!file) {
          failed += 1;
          continue;
        }
        setMobileOriginalsStatusParts(`V appce: doplňuji ${index + 1}/${entriesToProcess.length}`, directoryHandle ? `Ve složce: ověřuji ${index + 1}/${entriesToProcess.length}` : "Ve složce: nevybraná");
        await saveLocalSupabaseOriginal(entry.ref, file, {
          fileName: entry.fileName,
          ownerName: entry.ownerName,
          path: entry.path,
        });
        downloaded += 1;
      }
      if (directoryHandle && file) {
        try {
          const folderResult = await writeMobileOriginalToFolder(directoryHandle, entry, file, { skipExisting: true });
          if (folderResult === "exists") alreadyInFolder += 1;
          else if (folderResult) {
            copiedToFolder += 1;
            setMobileOriginalsStatusParts(`V appce: ${currentCounts?.stored || alreadyStored + downloaded}/${plan.length}`, `Ve složce: doplňuji ${index + 1}/${entriesToProcess.length}`);
          }
        } catch {
          folderFailed += 1;
        }
      }
    }
    if (directoryHandle) {
      const refreshedFolder = await countMobileOriginalFolderFiles(plan, { requestPermission: true, timeoutMs: 20000 }).catch(() => null);
      await rememberMobileOriginalsFolderCount(refreshedFolder ?? copiedToFolder + alreadyInFolder, plan.length).catch(() => {});
    }
    updateSyncIndicator();
    if (!downloaded && !failed) {
      toast(directoryHandle
        ? `Fotky už v appce jsou. Do složky nové ${copiedToFolder}, už bylo ${alreadyInFolder}.`
        : `Originály už v mobilu jsou. Celkem ${alreadyStored}.`);
      return true;
    }
    if (failed) {
      toast(`Hotovo jen částečně. Staženo ${downloaded}, už bylo ${alreadyStored}, chyba ${failed}.`);
      return false;
    }
    toast(folderFailed
      ? `Fotky doplněné. Nové v appce ${downloaded}, složka chyba ${folderFailed}.`
      : `Fotky doplněné. V appce nové ${downloaded}, už bylo ${alreadyStored}, do složky nové ${copiedToFolder}.`);
    return true;
  } catch (error) {
    updateSyncIndicator("error");
    toast(`Stahování originálů selhalo: ${friendlySyncError(error)}`);
    return false;
  }
  finally {
    refreshMobileOriginalsStatus({ quiet: true }).catch(() => {});
  }
}

function defaultOfferOrderFees(customerId) {
  const settings = appSettings();
  const customer = findCustomer(customerId);
  const countryMode = mobileCustomerCountryMode(customer);
  const shippingFee = countryMode === "sk"
    ? settings.shippingFeeSk
    : countryMode === "cz"
      ? settings.shippingFeeCz
      : "";
  return {
    shippingFee: shippingFee || "",
    shippingFeeLabel: shippingLabel(customer),
    packingFee: defaultPackingFeeValue(settings),
  };
}

function openSheet(title, body, onSave, customFooter = "", options = {}) {
  if (!els.sheet.hidden && !options.replace && typeof state.currentSheetRestore === "function") {
    state.sheetStack.push(state.currentSheetRestore);
  }
  clearPendingPhotoPreviewUrls(els.sheet.querySelector("#sheetForm"));
  state.currentSheetRestore = typeof options.restore === "function" ? options.restore : null;
  els.sheet.hidden = false;
  els.sheet.innerHTML = `<section class="sheet" role="dialog" aria-modal="true">
    <header class="sheet-header"><h2>${escapeHtml(title)}</h2><button class="round" type="button" data-close-sheet>Ă—</button></header>
    <div class="sheet-body">${body}</div>
    <footer class="sheet-footer">${customFooter || `<button class="button" type="button" data-close-sheet>ZruĹˇit</button><button class="button primary" type="button" data-save-sheet>UloĹľit</button>`}</footer>
  </section>`;
  els.sheet.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", async () => {
    const saveButton = els.sheet.querySelector("[data-save-sheet]");
    if (saveButton?.disabled) return;
    const form = els.sheet.querySelector("form");
    if (form && !form.reportValidity()) return;
    const previousLabel = saveButton?.textContent;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "UklĂˇdĂˇm...";
    }
    try {
      const result = await onSave?.();
      if (result === false) return;
      saveData();
      closeSheet();
      render();
      toast("UloĹľeno.");
    } catch (error) {
      console.error(error);
      toast("UloĹľenĂ­ se nepodaĹ™ilo.");
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = previousLabel || "UloĹľit";
      }
    }
  });
}

function closeSheet(options = {}) {
  clearPendingPhotoPreviewUrls(els.sheet.querySelector("#sheetForm"));
  if (!options.all && state.sheetStack.length) {
    const restorePreviousSheet = state.sheetStack.pop();
    els.sheet.hidden = true;
    els.sheet.innerHTML = "";
    state.currentSheetRestore = null;
    restorePreviousSheet();
    return;
  }
  state.sheetStack = [];
  state.currentSheetRestore = null;
  els.sheet.hidden = true;
  els.sheet.innerHTML = "";
}

function toggle(name, values, current) {
  return `<div class="field"><span>${escapeHtml(toggleTitle(name))}</span><div class="toggle-grid" data-toggle="${escapeHtml(name)}">
    ${values.map(([value, label]) => `<button class="chip-button ${value === current ? "active" : ""}" type="button" data-toggle-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`).join("")}
    <input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(current)}">
  </div></div>`;
}

function toggleTitle(name) {
  return { paymentStatus: "Platba", shippingStatus: "ObjednĂˇvka", deliveryMethod: "Doprava", stage: "FĂˇze", resultRating: "VĂ˝sledek", status: "Stav", winteringStatus: "ZimovĂˇnĂ­" }[name] || name;
}

function setSheetToggleValue(name, value) {
  const group = els.sheet.querySelector(`[data-toggle="${name}"]`);
  if (!group) return;
  const input = group.querySelector("input");
  const previousValue = input?.value;
  if (input) input.value = value;
  group.querySelectorAll("[data-toggle-value]").forEach((button) => {
    button.classList.toggle("active", button.dataset.toggleValue === value);
  });
  if (input && previousValue !== value) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function bindToggles() {
  els.sheet.querySelectorAll("[data-toggle]").forEach((group) => {
    group.querySelectorAll("[data-toggle-value]").forEach((button) => button.addEventListener("click", () => {
      setSheetToggleValue(group.dataset.toggle || "", button.dataset.toggleValue);
      renderCrossPreviewInSheet();
    }));
  });
}

function bindFees() {
  const shippingPresets = {
    "shipping-cz": { resolveAmount: (settings) => settings.shippingFeeCz || "", resolveLabel: () => "Zásilkovna ČR" },
    "shipping-sk": { resolveAmount: (settings) => settings.shippingFeeSk || "", resolveLabel: () => "Zásilkovna Slovensko" },
    "shipping-post": { resolveAmount: (settings) => settings.postalFee || "", resolveLabel: () => "Balíkovna" },
    "shipping-address": {
      resolveAmount: (settings, customer) => defaultShippingAddressFeeForCustomer(settings, customer) || "",
      resolveLabel: (customer) => shippingAddressLabel(customer),
    },
  };
  const syncFees = () => {
    const form = document.querySelector("#sheetForm");
    if (!form) return;
    const settings = appSettings();
    const customer = findCustomer(form.elements.customerId?.value);
    syncOrderSheetCountryShippingPreset(form);
    const activeButtons = [...els.sheet.querySelectorAll("[data-fee].active")];
    if (activeButtons.length && form.elements.deliveryMethod?.value === "personal_pickup") {
      setSheetToggleValue("deliveryMethod", "ship");
    }
    const activeShippingPreset = activeButtons.find((item) => shippingPresets[item.dataset.fee || ""]);
    if (activeShippingPreset) {
      const preset = shippingPresets[activeShippingPreset.dataset.fee];
      form.elements.shippingFee.value = preset.resolveAmount(settings, customer);
      form.elements.shippingFeeLabel.value = preset.resolveLabel(customer);
    } else {
      form.elements.shippingFee.value = "";
      form.elements.shippingFeeLabel.value = "";
    }
    form.elements.packingFee.value = activeButtons.some((item) => item.dataset.fee === "packing") ? defaultPackingFeeValue(settings) : "";
    form.elements.codFee.value = activeButtons.some((item) => item.dataset.fee === "cod") ? (defaultCodFeeForCustomer(settings, customer) || "") : "";
    recalculateOrderSheetPrice(form);
  };
  const form = document.querySelector("#sheetForm");
  if (form) form.__syncFeeButtons = syncFees;
  els.sheet.querySelectorAll("[data-fee]").forEach((button) => button.addEventListener("click", () => {
    const preset = button.dataset.fee || "";
    if (shippingPresets[preset]) {
      const wasActive = button.classList.contains("active");
      els.sheet.querySelectorAll("[data-fee]").forEach((item) => {
        if (shippingPresets[item.dataset.fee || ""]) item.classList.remove("active");
      });
      button.classList.toggle("active", !wasActive);
    } else {
      button.classList.toggle("active");
    }
    syncFees();
  }));
  syncFees();
}

function bindPhotoGrid() {
  els.sheet.querySelectorAll("[data-remove-photo]").forEach((button) => button.addEventListener("click", () => {
    button.closest("[data-photo-tile]")?.remove();
    renderCrossPreviewInSheet();
  }));
  els.sheet.querySelectorAll(".photo-pickers input[type='file']").forEach((input) => {
    input.addEventListener("change", () => {
      rememberPendingPhotoFiles(input);
      renderPendingPhotoPreviews(input.form);
      renderCrossPreviewInSheet();
    });
  });
  renderPendingPhotoPreviews(els.sheet.querySelector("#sheetForm"));
  resolvePhotos(els.sheet);
}

function clearPendingPhotoPreviewUrls(form) {
  (form?.__pendingPhotoPreviewUrls || []).forEach((url) => URL.revokeObjectURL(url));
  if (form) form.__pendingPhotoPreviewUrls = [];
}

function renderPendingPhotoPreviews(form) {
  const grid = form?.querySelector("#photoGrid");
  if (!grid) return;
  clearPendingPhotoPreviewUrls(form);
  grid.querySelectorAll("[data-pending-photo-tile]").forEach((node) => node.remove());
  const entries = pendingPhotoEntries(form);
  if (!entries.length) return;
  const fragment = document.createDocumentFragment();
  entries.forEach(({ id, file }) => {
    const url = URL.createObjectURL(file);
    form.__pendingPhotoPreviewUrls.push(url);
    const tile = document.createElement("span");
    tile.className = "photo-tile pending";
    tile.dataset.pendingPhotoTile = "1";
    tile.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(file.name || "Fotka")}"><button type="button" data-remove-pending-photo="${escapeHtml(id)}">&times;</button>`;
    fragment.append(tile);
  });
  grid.append(fragment);
  grid.querySelectorAll("[data-remove-pending-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      removePendingPhotoFile(form, button.dataset.removePendingPhoto);
    });
  });
}

function rememberPendingPhotoFiles(input) {
  const form = input?.form;
  if (!form) return;
  const entries = pendingPhotoEntries(form);
  const seen = new Set(entries.map((entry) => photoFileSignature(entry.file)));
  [...(input.files || [])]
    .filter(isPhotoFile)
    .forEach((file) => {
      const signature = photoFileSignature(file);
      if (seen.has(signature)) return;
      seen.add(signature);
      entries.push({ id: uid(), file });
    });
  input.value = "";
}

function pendingPhotoEntries(form) {
  if (!form) return [];
  if (!Array.isArray(form.__pendingPhotoFiles)) form.__pendingPhotoFiles = [];
  return form.__pendingPhotoFiles;
}

function selectedPhotoFiles(form) {
  const pending = pendingPhotoEntries(form).map((entry) => entry.file).filter(isPhotoFile);
  if (pending.length) return pending;
  return [...(form.elements.photos?.files || []), ...(form.elements.cameraPhotos?.files || [])].filter(isPhotoFile);
}

function removePendingPhotoFile(form, id) {
  if (!form || !Array.isArray(form.__pendingPhotoFiles)) return;
  form.__pendingPhotoFiles = form.__pendingPhotoFiles.filter((entry) => entry.id !== id);
  renderPendingPhotoPreviews(form);
  renderCrossPreviewInSheet();
}

function isPhotoFile(file) {
  return Boolean(file && (file.type?.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || "")));
}

function photoFileSignature(file) {
  return [file?.name, file?.size, file?.lastModified, file?.type].map(clean).join("|");
}

function photoPickerFields(label) {
  const accept = "image/*,.jpg,.jpeg,.png,.webp,.heic,.heif";
  return `<div class="field photo-pickers"><span>${escapeHtml(label)}</span>
    <div class="photo-picker-row">
      <label class="button"><input name="photos" type="file" accept="${accept}" multiple>Vybrat z galerie</label>
      <label class="button"><input name="cameraPhotos" type="file" accept="image/*" capture="environment">Vyfotit</label>
    </div>
  </div>`;
}

function photoTiles(images) {
  return images.map((image) => {
    const previewRef = thumbPreviewRef(image);
    return `<span class="photo-tile" data-photo-tile="${escapeHtml(image)}"><img data-photo-ref="${escapeHtml(previewRef)}" alt=""><button type="button" data-remove-photo>Ă—</button></span>`;
  }).join("");
}

function renderCrossPreviewInSheet() {
  const target = document.querySelector("#crossPreview");
  const form = document.querySelector("#sheetForm");
  if (!target || !form) return;
  const cross = {
    motherVarietyId: form.elements.motherVarietyId?.value,
    pollenVarietyId: form.elements.pollenVarietyId?.value,
    seedlingName: form.elements.seedlingName?.value,
    seedlingPhotoUrl: form.querySelector("[data-photo-tile]")?.dataset.photoTile || form.querySelector("[data-pending-photo-tile] img")?.getAttribute("src") || "",
  };
  target.innerHTML = crossPreviewMarkup(cross);
  resolvePhotos(target);
}

function crossPreviewMarkup(cross) {
  const mother = findById("varieties", cross.motherVarietyId);
  const pollen = findById("varieties", cross.pollenVarietyId);
  const seedlingName = clean(cross.seedlingName) || "Semenáč";
  return `${crossFlowCard("Matka", mother?.name || "Matka", varietyImages(mother)[0], "parent")}
    <div class="cross-symbol">x</div>
    ${crossFlowCard("Pyl", pollen?.name || "Pyl", varietyImages(pollen)[0], "parent")}
    <div class="cross-symbol">=</div>
    ${crossFlowCard("Semenáč", seedlingName, cross.seedlingPhotoUrl, "seedling")}`;
}

function crossFlowCard(label, title, image, role = "parent") {
  const cardClass = `cross-flow-card cross-flow-${role} ${image ? "has-image" : "no-image"}`;
  if (!image) {
    return `<article class="${cardClass}">
      <span class="cross-initials">${escapeHtml(initials(title))}</span>
      <div><small class="sub">${escapeHtml(label)}</small><strong>${escapeHtml(title)}</strong></div>
    </article>`;
  }
  const previewRef = thumbPreviewRef(image);
  return `<article class="${cardClass}">
    <span class="thumb"><img data-photo-ref="${escapeHtml(previewRef)}" alt=""></span>
    <div><small class="sub">${escapeHtml(label)}</small><strong>${escapeHtml(title)}</strong></div>
  </article>`;
}

async function downloadCrossCard(id) {
  const cross = findById("crosses", id);
  if (!cross) return;
  try {
    const canvas = await renderCrossCardCanvas(cross);
    const link = document.createElement("a");
    link.download = `${safeFileName(`krizeni-${crossLineage(cross)}`, "krizeni")}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.append(link);
    link.click();
    link.remove();
    toast("ObrĂˇzek kĹ™Ă­ĹľenĂ­ staĹľen.");
  } catch {
    toast("ObrĂˇzek kĹ™Ă­ĹľenĂ­ se nepodaĹ™ilo vytvoĹ™it.");
  }
}

async function downloadVarietyPhoto(id) {
  const variety = findById("varieties", id);
  const image = varietyImages(variety)[0];
  if (!variety || !image) return;
  let href = "";
  let revokeAfterDownload = false;
  try {
    if (image.startsWith(SUPABASE_PHOTO_PREFIX)) {
      toast("Stahuji fotku...");
      const file = await supabasePhotoRefToFile(image, variety.name);
      if (file) {
        href = URL.createObjectURL(file);
        revokeAfterDownload = true;
      } else {
        href = await fetchSupabasePhotoObjectUrl(parseSupabasePhotoRef(image)) || await createSignedPhotoUrl(parseSupabasePhotoRef(image));
      }
    } else {
      const file = await photoToFile(image, variety.name);
      if (file) {
        href = URL.createObjectURL(file);
        revokeAfterDownload = true;
      } else {
        href = await resolvePhotoUrl(image);
      }
    }
    if (!href) throw new Error("photo");
    const link = document.createElement("a");
    link.href = href;
    link.download = `${safeFileName(variety.name, "fotka")}${photoExtension(href)}`;
    document.body.append(link);
    link.click();
    link.remove();
    if (revokeAfterDownload) window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  } catch {
    toast("Fotku se nepodaĹ™ilo stĂˇhnout.");
  }
}

async function renderCrossCardCanvas(cross) {
  const mother = findById("varieties", cross.motherVarietyId);
  const pollen = findById("varieties", cross.pollenVarietyId);
  const seedlingName = clean(cross.seedlingName) || "Semenáč";
  const cards = [
    { role: "MATKA", name: mother?.name || "Matka", image: varietyImages(mother)[0] },
    { role: "PYL", name: pollen?.name || "Pyl", image: varietyImages(pollen)[0] },
    { role: "SEMENÁČ", name: seedlingName, image: crossSeedlingImages(cross)[0], accent: true },
  ];
  const loadedCards = await Promise.all(cards.map(async (card) => ({ ...card, imageNode: await loadCanvasPhoto(card.image) })));
  const logo = await loadCanvasImage(BRAND_LOGO_IMAGE_DATA_URI);

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1500;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#fffdf6");
  background.addColorStop(0.55, "#eff9ee");
  background.addColorStop(1, "#d9f4e2");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawCrossCardActor(context, loadedCards[0], 70, 70, 395, 405, { imageHeight: 280, nameFont: 26, padding: 16, compact: true });
  drawCrossCardActor(context, loadedCards[1], 615, 70, 395, 405, { imageHeight: 280, nameFont: 26, padding: 16, compact: true });
  drawHeroSeedling(context, loadedCards[2], 70, 520, 940, 875);

  context.fillStyle = "#15563d";
  context.font = "800 58px 'Segoe UI', Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("x", 540, 275);
  context.fillText("=", 540, 505);
  context.textAlign = "left";
  return canvas;
}

function drawCrossCardActor(context, card, x, y, width, height, options = {}) {
  const actorGradient = context.createLinearGradient(x, y, x + width, y + height);
  actorGradient.addColorStop(0, card.accent ? "#eefbf1" : "#fffefa");
  actorGradient.addColorStop(1, card.accent ? "#d9f4e5" : "#fbf5e8");
  context.fillStyle = actorGradient;
  roundRectPath(context, x, y, width, height, 34);
  context.fill();
  context.strokeStyle = card.accent ? "#80c49b" : "#d9c99f";
  context.lineWidth = 2;
  context.stroke();

  const padding = options.padding ?? 24;
  const imageX = x + padding;
  const imageY = y + padding;
  const imageW = width - padding * 2;
  const imageH = options.imageHeight || (card.accent ? 475 : 265);
  context.fillStyle = "#edf2e8";
  roundRectPath(context, imageX, imageY, imageW, imageH, 24);
  context.fill();
  if (card.imageNode) {
    context.save();
    roundRectPath(context, imageX, imageY, imageW, imageH, 24);
    context.clip();
    drawContainedImage(context, card.imageNode, imageX, imageY, imageW, imageH);
    context.restore();
  } else {
    context.fillStyle = "#15563d";
    context.font = "800 70px 'Segoe UI', Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(initials(card.name), imageX + imageW / 2, imageY + imageH / 2 + 22);
    context.textAlign = "left";
  }

  context.fillStyle = "#647360";
  context.font = "800 19px 'Segoe UI', Arial, sans-serif";
  const labelY = imageY + imageH + 46;
  const textX = x + padding + 2;
  context.fillText(card.role, textX, labelY);
  context.fillStyle = "#123629";
  const nameFontSize = options.nameFont || (card.accent ? 44 : 28);
  context.font = `${card.accent ? "900" : "800"} ${nameFontSize}px 'Segoe UI', Arial, sans-serif`;
  wrapCanvasText(context, card.name, width - padding * 2).slice(0, options.compact ? 2 : 3).forEach((line, index) => {
    context.fillText(line, textX, labelY + nameFontSize + 8 + index * (card.accent ? 54 : 34));
  });
}

function drawHeroSeedling(context, card, x, y, width, height) {
  const imageH = height - 18;
  if (card.imageNode) {
    context.save();
    roundRectPath(context, x, y, width, imageH, 36);
    context.clip();
    drawContainedImage(context, card.imageNode, x, y, width, imageH);
    context.restore();
  } else {
    context.fillStyle = "#e3f3e8";
    roundRectPath(context, x, y, width, imageH, 36);
    context.fill();
    context.fillStyle = "#15563d";
    context.font = "900 120px 'Segoe UI', Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(initials(card.name), x + width / 2, y + imageH / 2 + 40);
    context.textAlign = "left";
  }
  context.textAlign = "center";
  const hasCustomName = normalize(card.name) !== "semenac";
  context.fillStyle = "#123629";
  context.font = "900 58px 'Segoe UI', Arial, sans-serif";
  wrapCanvasText(context, hasCustomName ? card.name : "SemenĂˇÄŤ", width - 80).slice(0, 2).forEach((line, index) => {
    context.fillText(line, x + width / 2, y + imageH + 58 + index * 64);
  });
  context.textAlign = "left";
}

function drawContainedImage(context, image, x, y, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const targetWidth = image.naturalWidth * scale;
  const targetHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - targetWidth) / 2, y + (height - targetHeight) / 2, targetWidth, targetHeight);
}

async function loadCanvasPhoto(ref) {
  const url = await resolvePhotoUrl(ref);
  return loadCanvasImage(url);
}

function loadCanvasImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function drawLogoOnCanvas(context, image, x, y, size) {
  context.save();
  roundRectPath(context, x, y, size, size, 22);
  context.clip();
  context.drawImage(image, x, y, size, size);
  context.restore();
}

function wrapCanvasText(context, text, maxWidth) {
  const words = clean(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (current && context.measureText(next).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [clean(text)];
}

function roundRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function upsert(collection, item) {
  const items = state.data[collection];
  const index = items.findIndex((current) => current.id === item.id);
  if (index >= 0) items[index] = item;
  else items.push(item);
}

function ensureTrashData() {
  if (!Array.isArray(state.data.trash)) state.data.trash = [];
  return state.data.trash;
}

function cloneTrashPayload(payload) {
  try {
    return JSON.parse(JSON.stringify(payload ?? null));
  } catch {
    if (payload && typeof payload === "object") return { ...payload };
    return payload;
  }
}

function normalizeTrashEntry(entry = {}) {
  return {
    id: clean(entry.id) || uid(),
    type: clean(entry.type),
    label: clean(entry.label) || "Smazaný záznam",
    deletedAt: clean(entry.deletedAt) || new Date().toISOString(),
    payload: entry?.payload && typeof entry.payload === "object" ? cloneTrashPayload(entry.payload) : {},
  };
}

function trashEntriesSorted() {
  return ensureTrashData()
    .slice()
    .sort((a, b) => String(b.deletedAt || "").localeCompare(String(a.deletedAt || "")));
}

function pushTrashEntry(type, label, payload = {}) {
  ensureTrashData().unshift(normalizeTrashEntry({
    type,
    label,
    deletedAt: new Date().toISOString(),
    payload,
  }));
}

function removeTrashEntry(entryId) {
  state.data.trash = ensureTrashData().filter((entry) => clean(entry.id) !== clean(entryId));
}

function findTrashEntry(entryId) {
  return ensureTrashData().find((entry) => clean(entry.id) === clean(entryId)) || null;
}

function trashTypeLabel(entry = {}) {
  const type = clean(entry.type);
  if (type === "customer-bundle") return "Zákazník";
  if (type === "order") return "Objednávka";
  if (type === "variety") return "Odrůda";
  if (type === "cross") return "Křížení";
  if (type === "offer") return normalizeOfferType(entry?.payload?.offer?.type) === "rests" ? "Resty" : "Nabídka";
  if (type === "offer-item") return "Položka nabídky";
  if (type === "reservation") return "Rezervace";
  return "Záznam";
}

function trashEntryMeta(entry = {}) {
  const deletedLabel = clean(entry.deletedAt) ? formatDate(entry.deletedAt) : "";
  const type = clean(entry.type);
  if (type === "customer-bundle") {
    const orderCount = Array.isArray(entry?.payload?.orders) ? entry.payload.orders.length : 0;
    return [deletedLabel, orderCount ? `${orderCount} objednávek` : ""].filter(Boolean).join(" · ");
  }
  if (type === "offer-item") {
    return [deletedLabel, clean(entry?.payload?.offerTitle)].filter(Boolean).join(" · ");
  }
  if (type === "reservation") {
    return [deletedLabel, clean(entry?.payload?.offerTitle), clean(entry?.payload?.itemName)].filter(Boolean).join(" · ");
  }
  return deletedLabel;
}

function trashCountLabel() {
  const count = ensureTrashData().length;
  if (!count) return "Koš je prázdný.";
  if (count === 1) return "V koši čeká 1 záznam.";
  if (count < 5) return `V koši čekají ${count} záznamy.`;
  return `V koši čeká ${count} záznamů.`;
}

function collectTrashPhotoPaths(entries = []) {
  const paths = new Set();
  const add = (ref) => {
    const path = parseSupabasePhotoRef(clean(ref));
    if (!path) return;
    paths.add(path);
    const thumbPath = supabaseThumbnailPath(path);
    if (thumbPath) paths.add(thumbPath);
  };
  (entries || []).forEach((entry) => {
    const type = clean(entry?.type);
    if (type === "variety") {
      const variety = entry?.payload?.variety || {};
      add(variety.photoUrl);
      (variety.gallery || []).forEach(add);
      return;
    }
    if (type === "cross") {
      const cross = entry?.payload?.cross || {};
      add(cross.seedlingPhotoUrl);
      (cross.seedlingGallery || []).forEach(add);
      return;
    }
    if (type === "offer") {
      (entry?.payload?.offer?.items || []).forEach((item) => add(item?.photoUrl));
      return;
    }
    if (type === "offer-item") add(entry?.payload?.item?.photoUrl);
  });
  return paths;
}

async function releaseTrashPhotos(entriesToDelete = [], remainingTrashEntries = []) {
  const candidatePaths = [...collectTrashPhotoPaths(entriesToDelete)];
  if (!candidatePaths.length) return;
  const retainedPaths = collectPhotoPaths(state.data);
  collectTrashPhotoPaths(remainingTrashEntries).forEach((path) => retainedPaths.add(path));
  const pathsToDelete = candidatePaths.filter((path) => !retainedPaths.has(path));
  if (!pathsToDelete.length) return;
  await deleteStoragePaths(pathsToDelete);
}

function orphanPhotoSummary(paths = []) {
  const originals = paths.filter((path) => !isSupabaseThumbnailPath(path));
  const thumbs = paths.filter((path) => isSupabaseThumbnailPath(path));
  return { total: paths.length, originals: originals.length, thumbs: thumbs.length };
}

function buildOrphanPhotoReport(paths = []) {
  const summary = orphanPhotoSummary(paths);
  const lines = [
    "Staré fotky v cloudu - kontrolní seznam",
    `Vygenerováno: ${new Date().toISOString()}`,
    `Celkem souborů: ${summary.total}`,
    `Originály: ${summary.originals}`,
    `Náhledy: ${summary.thumbs}`,
    "",
    "Seznam cest:",
    ...paths.slice().sort((a, b) => a.localeCompare(b, "cs")).map((path) => path),
  ];
  return lines.join("\n");
}

async function cleanOrphanCloudPhotos() {
  try {
    const session = await ensureSession();
    const userId = clean(session.user?.id) || "user";
    updateSyncIndicator("working");
    const retainedPaths = collectPhotoPaths(state.data);
    collectTrashPhotoPaths(ensureTrashData()).forEach((path) => retainedPaths.add(path));
    const existingPaths = await listStoragePaths(`${encodeURIComponent(userId)}/`);
    const orphanPaths = existingPaths.filter((path) => !retainedPaths.has(path));
    if (!orphanPaths.length) {
      state.syncProblem = "";
      updateSyncIndicator();
      toast("Staré fotky v cloudu nebyly nalezeny.");
      return true;
    }
    const summary = orphanPhotoSummary(orphanPaths);
    downloadBlob(
      new Blob([buildOrphanPhotoReport(orphanPaths)], { type: "text/plain;charset=utf-8" }),
      `africke-koprivy-stare-fotky-${todayISO()}.txt`
    );
    toast("Seznam starých fotek byl stažen.");
    if (!confirm(`Našla jsem ${summary.total} starých souborů v cloudu.\nOriginály: ${summary.originals}\nNáhledy: ${summary.thumbs}\n\nSeznam jsem stáhla do TXT. Smazat je?`)) {
      state.syncProblem = "";
      updateSyncIndicator();
      return false;
    }
    await deleteStoragePaths(orphanPaths);
    const afterDeletePaths = await listStoragePaths(`${encodeURIComponent(userId)}/`);
    const remainingPaths = orphanPaths.filter((path) => afterDeletePaths.includes(path));
    if (remainingPaths.length) {
      downloadBlob(
        new Blob([buildOrphanPhotoReport(remainingPaths)], { type: "text/plain;charset=utf-8" }),
        `africke-koprivy-stare-fotky-zustaly-${todayISO()}.txt`
      );
      state.syncProblem = `Pozor: ${remainingPaths.length} souborů v cloudu zůstalo.`;
      updateSyncIndicator("error");
      toast("Některé soubory v cloudu zůstaly. Stáhla jsem jejich seznam.");
      return false;
    }
    state.syncProblem = "";
    updateSyncIndicator();
    toast(`Smazáno ${orphanPaths.length} starých souborů z cloudu.`);
    return true;
  } catch (error) {
    state.syncProblem = `Čištění cloudu selhalo: ${friendlySyncError(error)}`;
    updateSyncIndicator("error");
    toast(state.syncProblem);
    return false;
  }
}

function restoreTrashEntry(entryId) {
  const entry = findTrashEntry(entryId);
  if (!entry) return;

  if (entry.type === "customer-bundle") {
    const customer = normalizeCustomer(cloneTrashPayload(entry?.payload?.customer || {}));
    if (!clean(customer.id)) {
      toast("Zákazníka se nepodařilo obnovit.");
      return;
    }
    upsert("customers", customer);
    (entry?.payload?.orders || []).forEach((order) => {
      upsert("orders", normalizeOrder(cloneTrashPayload(order)));
    });
  } else if (entry.type === "order") {
    upsert("orders", normalizeOrder(cloneTrashPayload(entry?.payload?.order || {})));
  } else if (entry.type === "variety") {
    upsert("varieties", normalizeVariety(cloneTrashPayload(entry?.payload?.variety || {})));
  } else if (entry.type === "cross") {
    upsert("crosses", normalizeCross(cloneTrashPayload(entry?.payload?.cross || {})));
  } else if (entry.type === "offer") {
    const offer = normalizeOffer(cloneTrashPayload(entry?.payload?.offer || {}));
    upsert("offers", offer);
    state.activeOfferId = offer.id;
  } else if (entry.type === "offer-item") {
    const offer = findById("offers", entry?.payload?.offerId);
    if (!offer) {
      toast("Nejdřív obnov nabídku, do které položka patří.");
      return;
    }
    const item = normalizeOfferItem(cloneTrashPayload(entry?.payload?.item || {}));
    offer.items = (offer.items || []).filter((current) => clean(current.id) !== clean(item.id));
    offer.items.push(item);
    sortOfferItemsInPlace(offer);
    offer.updatedAt = new Date().toISOString();
    state.activeOfferId = offer.id;
  } else if (entry.type === "reservation") {
    const offer = findById("offers", entry?.payload?.offerId);
    const item = offer?.items?.find((current) => clean(current.id) === clean(entry?.payload?.itemId));
    if (!offer || !item) {
      toast("Nejdřív obnov nabídku a položku, ke které rezervace patří.");
      return;
    }
    const reservation = normalizeReservation(cloneTrashPayload(entry?.payload?.reservation || {}));
    item.reservations = (item.reservations || []).filter((current) => clean(current.id) !== clean(reservation.id));
    item.reservations.push(reservation);
    offer.updatedAt = new Date().toISOString();
    state.activeOfferId = offer.id;
  } else {
    toast("Tento záznam zatím nejde obnovit.");
    return;
  }

  removeTrashEntry(entryId);
  saveData();
  render();
  toast("Záznam vrácen z koše.");
}

async function permanentlyDeleteTrashEntry(entryId) {
  const entry = findTrashEntry(entryId);
  if (!entry) return;
  if (!confirm(`Smazat ${trashTypeLabel(entry).toLowerCase()} z koše navždy?`)) return;
  const remainingTrashEntries = ensureTrashData().filter((item) => clean(item.id) !== clean(entryId));
  try {
    await releaseTrashPhotos([entry], remainingTrashEntries);
  } catch (error) {
    toast(`Fotky v cloudu se nepodařilo smazat: ${friendlySyncError(error)}. Záznam zůstává v koši.`);
    return;
  }
  removeTrashEntry(entryId);
  saveData();
  render();
  toast("Záznam smazán z koše navždy.");
}

async function emptyTrash() {
  const count = ensureTrashData().length;
  if (!count) {
    toast("Koš je už prázdný.");
    return;
  }
  if (!confirm(`Vysypat celý koš? Smaže se navždy ${count} záznamů.`)) return;
  const entries = ensureTrashData().slice();
  try {
    await releaseTrashPhotos(entries, []);
  } catch (error) {
    toast(`Fotky v cloudu se nepodařilo smazat: ${friendlySyncError(error)}. Koš zůstává beze změny.`);
    return;
  }
  state.data.trash = [];
  saveData();
  render();
  toast("Koš byl vysypán.");
}

function trashCardMarkup(entry = {}) {
  return `<article class="trash-mobile-entry">
    <div class="trash-mobile-copy">
      <span class="pill">${escapeHtml(trashTypeLabel(entry))}</span>
      <strong>${escapeHtml(clean(entry.label) || "Smazaný záznam")}</strong>
      <small>${escapeHtml(trashEntryMeta(entry) || "Bez detailu")}</small>
    </div>
    <div class="trash-mobile-actions">
      <button class="button ghost" type="button" data-trash-restore="${escapeHtml(entry.id)}">Obnovit</button>
      <button class="button danger" type="button" data-trash-delete="${escapeHtml(entry.id)}">Smazat navždy</button>
    </div>
  </article>`;
}

function renderTrashCards() {
  const entries = trashEntriesSorted();
  return `<section class="sync-card">
    <strong class="title">Koš</strong>
    <p class="sub">${escapeHtml(trashCountLabel())}</p>
    ${entries.length ? `<button class="button danger" type="button" data-trash-empty-all>Vysypat koš</button>` : ""}
    ${entries.length ? `<div class="trash-mobile-list">${entries.map((entry) => trashCardMarkup(entry)).join("")}</div>` : `<div class="empty light trash-mobile-empty">Koš je zatím prázdný.</div>`}
  </section>`;
}

function deleteItem(collection, id, label) {
  const fixedLabel = typeof ak93DisplayText === "function" ? ak93DisplayText(label, label) : label;
  const item = findById(collection, id);
  if (!item) return;
  if (!confirm(`${fixedLabel} smazat?`)) return;
  if (collection === "customers") {
    const orders = state.data.orders.filter((entry) => clean(entry.customerId) === clean(id));
    pushTrashEntry("customer-bundle", customerName(item), {
      customer: item,
      orders,
    });
    state.data.orders = state.data.orders.filter((entry) => clean(entry.customerId) !== clean(id));
  } else if (collection === "orders") {
    const customer = findCustomer(item.customerId);
    pushTrashEntry("order", [customerName(customer), clean(item.orderDate)].filter(Boolean).join(" · ") || "Objednávka", {
      order: item,
    });
  } else if (collection === "varieties") {
    pushTrashEntry("variety", clean(item.name) || fixedLabel, { variety: item });
  } else if (collection === "crosses") {
    pushTrashEntry("cross", clean(item.seedlingName) || "Křížení", { cross: item });
  } else if (collection === "offers") {
    pushTrashEntry("offer", clean(item.title) || fixedLabel, { offer: item });
    if (state.activeOfferId === id) state.activeOfferId = "";
  }
  state.data[collection] = state.data[collection].filter((item) => item.id !== id);
  saveData();
  render();
  toast("Záznam přesunut do koše.");
}

async function copyOrderText(id) {
  const order = findById("orders", id);
  const customer = findCustomer(order?.customerId);
  if (!order) return;
  const text = buildCustomerOrderText(order, customer);
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
  else fallbackCopyText(text);
  toast("Text zkopĂ­rovanĂ˝.");
}

function toggleOrderPaymentTextSent(id, options = {}) {
  const order = findById("orders", id);
  if (!order) return;
  if (clean(order.paymentTextSentAt)) {
    order.paymentTextSentAt = "";
    toast("PĹ™Ă­znak odeslanĂ©ho textu zruĹˇen.");
  } else {
    order.paymentTextSentAt = new Date().toISOString();
    toast("Text k zaplacenĂ­ oznaÄŤen jako odeslanĂ˝.");
  }
  order.updatedAt = new Date().toISOString();
  saveData();
  if (!options.skipRender) render();
  return Boolean(clean(order.paymentTextSentAt));
}

function buildCustomerOrderText(order, customer) {
  const settings = appSettings();
  const lines = clean(order.varietiesText).split(/\n+/).map(clean).filter(Boolean);
  lines.push(...orderFeeLines(order, customer));
  const totalCzk = orderFinalTotal(order);
  const eur = shouldShowEur(customer) ? orderPriceEur(order, totalCzk) : null;
  const paymentLines = [
    clean(settings.paymentAccountName) ? `JmĂ©no a pĹ™Ă­jmenĂ­: ${settings.paymentAccountName}` : "",
    clean(settings.paymentAccountNumber) ? `ÄŚĂ­slo ĂşÄŤtu: ${settings.paymentAccountNumber}` : "",
    clean(settings.paymentIban) ? `IBAN: ${settings.paymentIban}` : "",
    clean(settings.paymentSwift) ? `SWIFT / BIC: ${settings.paymentSwift}` : "",
  ].filter(Boolean);
  const parts = [
    "DobrĂ˝ den,",
    "posĂ­lĂˇm pĹ™ehled objednĂˇvky:",
    "",
    lines.join("\n"),
    "",
    `Celkem v CZK: ${formatMoney(totalCzk, "CZK")}`,
    eur ? `K ĂşhradÄ› v EUR: ${formatMoney(eur, "EUR")}` : "",
    paymentLines.length ? "\nĂšdaje k platbÄ›:" : "",
    paymentLines.join("\n"),
    "",
    "DÄ›kuji.",
  ];
  return parts.filter((part, index) => part || parts[index - 1] !== "").join("\n").trim();
}

function orderFeeLines(order, customer) {
  const currency = "CZK";
  const shipping = number(order.shippingFee);
  const packing = number(order.packingFee);
  const cod = number(order.codFee);
  const parts = [];
  if (Number.isFinite(shipping) && shipping > 0) parts.push(`${orderShippingLabel(order, customer)} ${formatMoney(shipping, currency)}`);
  if (Number.isFinite(packing) && packing > 0) parts.push(`BalnĂ© ${formatMoney(packing, currency)}`);
  if (Number.isFinite(cod) && cod > 0) parts.push(`DobĂ­rka ${formatMoney(cod, currency)}`);
  normalizeNamedFees(order.extraFees).forEach((fee) => {
    const amount = number(fee.amount);
    if (clean(fee.name) && Number.isFinite(amount) && amount > 0) parts.push(`${fee.name} ${formatMoney(amount, currency)}`);
  });
  return parts;
}

function orderFinalTotal(order) {
  const stored = number(order.price);
  const shipping = number(order.shippingFee);
  const packing = number(order.packingFee);
  const cod = number(order.codFee);
  const extra = normalizeNamedFees(order.extraFees).reduce((sum, fee) => {
    const amount = number(fee.amount);
    return sum + (Number.isFinite(amount) && amount > 0 ? amount : 0);
  }, 0);
  const derived = orderTotalFromText(order.varietiesText)
    + (Number.isFinite(shipping) && shipping > 0 ? shipping : 0)
    + (Number.isFinite(packing) && packing > 0 ? packing : 0)
    + (Number.isFinite(cod) && cod > 0 ? cod : 0)
    + extra;
  if (Number.isFinite(derived) && derived > 0) {
    if (!Number.isFinite(stored)) return derived;
    if (orderHasStorno(order) && Math.abs(stored - derived) > 0.0001) return derived;
  }
  if (Number.isFinite(stored)) return stored;
  return Number.isFinite(derived) ? derived : 0;
}

function shouldShowEur(customer) {
  const country = normalize(clean(customer?.country || ""));
  return country && !country.includes("cesko") && !country.includes("ÄŤesko");
}

function orderPriceEur(order, totalCzk) {
  const rate = exchangeRateForOrder(order);
  return rate ? totalCzk / rate : null;
}

function exchangeRateForOrder(order) {
  const explicit = number(order.exchangeRate);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const target = clean(order.orderDate);
  const rates = [...(state.data.exchangeRates || [])]
    .map((rate) => ({ date: clean(rate.date), value: number(rate.rateCzkPerEur || rate.rate || rate.exchangeRate) }))
    .filter((rate) => rate.date && Number.isFinite(rate.value) && rate.value > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  return (rates.find((rate) => rate.date <= target) || rates[0])?.value || null;
}

function fallbackCopyText(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function loadData() {
  const key = [STORE_KEY, ...LEGACY_STORE_KEYS].find((item) => localStorage.getItem(item));
  if (SEED_SIGNATURE && window.AFRICKE_KOPRIVY_SEED && localStorage.getItem(SEED_SIGNATURE_KEY) !== SEED_SIGNATURE) {
    if (key) {
      localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
    } else {
      const seeded = normalizeLoadedData(window.AFRICKE_KOPRIVY_SEED);
      localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
      localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
      return seeded;
    }
  }
  if (key) {
    try {
      const data = normalizeLoadedData(JSON.parse(localStorage.getItem(key)));
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      return data;
    } catch {
      localStorage.removeItem(key);
    }
  }
  const data = normalizeLoadedData(window.AFRICKE_KOPRIVY_SEED || { customers: [], orders: [], varieties: [], crosses: [], offers: [], trash: [], exchangeRates: [], settings: {} });
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  if (SEED_SIGNATURE) localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
  return data;
}

function saveData(options = {}) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.data));
  if (!options.skipAutoSync) {
    markSyncDirty();
    state.syncRevision += 1;
    scheduleAutoSync();
  }
}

function normalizeLoadedData(data = {}) {
  const source = repairLoadedDataStrings(data);
  const result = {
    customers: Array.isArray(source.customers) ? source.customers.map(normalizeCustomer) : [],
    orders: Array.isArray(source.orders) ? source.orders.map(normalizeOrder) : [],
    varieties: Array.isArray(source.varieties) ? source.varieties.map(normalizeVariety) : [],
    crosses: Array.isArray(source.crosses) ? source.crosses.map(normalizeCross) : [],
    offers: Array.isArray(source.offers) ? source.offers.map(normalizeOffer) : [],
    trash: Array.isArray(source.trash) ? source.trash.map(normalizeTrashEntry) : [],
    exchangeRates: Array.isArray(source.exchangeRates) ? source.exchangeRates : [],
    settings: source.settings || {},
  };
  reconcileOfferItemVarietyLinks(result);
  return result;
}

const loadedTextRepairMaps = new Map();
const BROKEN_TEXT_PAIR_REPLACEMENTS = [
  ["\u0102\u02c7", "\u00e1"],
  ["\u0102\u00a9", "\u00e9"],
  ["\u0102\u00ad", "\u00ed"],
  ["\u0102\u00b3", "\u00f3"],
  ["\u0102\u00ba", "\u00fa"],
  ["\u0102\u02dd", "\u00fd"],
  ["\u00c4\u0164", "\u010d"],
  ["\u00c4\u0179", "\u010f"],
  ["\u00c4\u203a", "\u011b"],
  ["\u00c4\u013e", "\u013e"],
  ["\u0139\u02c6", "\u0148"],
  ["\u0139\u2122", "\u0159"],
  ["\u0139\u02c7", "\u0161"],
  ["\u0139\u00a4", "\u0165"],
  ["\u0139\u017b", "\u016f"],
  ["\u0139\u013e", "\u017e"],
  ["\u0102\u2014", "\u00d7"],
  ["\u00c3\u2014", "\u00d7"],
  ["\u00c2\u00b7", "\u00b7"],
];

function repairLoadedDataStrings(value) {
  if (typeof value === "string") return repairLoadedString(value);
  if (Array.isArray(value)) return value.map((item) => repairLoadedDataStrings(item));
  if (!value || typeof value !== "object") return value;
  const next = {};
  Object.keys(value).forEach((key) => {
    next[key] = repairLoadedDataStrings(value[key]);
  });
  return next;
}

function repairLoadedString(value = "") {
  const text = String(value ?? "");
  if (!text || !loadedStringLooksBroken(text)) return text;
  let best = text;
  let bestScore = loadedStringRepairScore(text);
  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false;
    for (const encoding of ["windows-1250", "windows-1252"]) {
      const candidate = decodeLoadedString(best, encoding);
      const candidateScore = loadedStringRepairScore(candidate);
      if (candidate !== best && candidateScore > bestScore) {
        best = candidate;
        bestScore = candidateScore;
        changed = true;
      }
    }
    if (!changed) break;
  }
  const pairFixed = replaceBrokenTextPairs(best);
  if (pairFixed !== best) best = pairFixed;
  return best;
}

function replaceBrokenTextPairs(value = "") {
  let text = String(value ?? "");
  BROKEN_TEXT_PAIR_REPLACEMENTS.forEach(([broken, fixed]) => {
    if (text.includes(broken)) text = text.split(broken).join(fixed);
  });
  return text;
}

function loadedStringLooksBroken(text = "") {
  return /[\u00c3\u00c2\u00c4\u0139\u0102\u00e2\uFFFD]/.test(text) || /Â·|Ã—|Ă—/.test(text);
}

function loadedStringRepairScore(text = "") {
  const markers = (text.match(/[\u00c3\u00c2\u00c4\u0139\u0102\u00e2\uFFFD]/g) || []).length;
  const accents = (text.match(/[áéíóúýčďěňřšťůžľĺôäÁÉÍÓÚÝČĎĚŇŘŠŤŮŽĽĹÔÄ×·]/g) || []).length;
  return accents - markers * 4;
}

function loadedStringByteMap(encoding) {
  if (loadedTextRepairMaps.has(encoding)) return loadedTextRepairMaps.get(encoding);
  const decoder = new TextDecoder(encoding);
  const map = new Map();
  for (let index = 0; index < 256; index += 1) {
    const decoded = decoder.decode(Uint8Array.of(index));
    if (!map.has(decoded)) map.set(decoded, index);
  }
  loadedTextRepairMaps.set(encoding, map);
  return map;
}

function decodeLoadedStringSegment(segment, encoding) {
  if (!segment) return "";
  const map = loadedStringByteMap(encoding);
  const bytes = [];
  for (const ch of segment) {
    const code = ch.codePointAt(0);
    if (code <= 0x7f) {
      bytes.push(code);
      continue;
    }
    const mapped = map.get(ch);
    if (mapped == null) return segment;
    bytes.push(mapped);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return segment;
  }
}

function decodeLoadedString(value, encoding) {
  const text = String(value ?? "");
  if (!text) return "";
  const map = loadedStringByteMap(encoding);
  let result = "";
  let buffer = "";
  const flush = () => {
    if (!buffer) return;
    result += decodeLoadedStringSegment(buffer, encoding);
    buffer = "";
  };
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code <= 0x7f || map.has(ch)) {
      buffer += ch;
    } else {
      flush();
      result += ch;
    }
  }
  flush();
  return result;
}

function normalizeWinteringSeasonValue(value = "") {
  const match = clean(value).match(/^(\d{4})\s*\/\s*(\d{4})$/);
  if (!match) return "";
  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || endYear !== startYear + 1) return "";
  return `${startYear}/${endYear}`;
}

function suggestedWinteringSeason(date = new Date()) {
  const year = date.getFullYear();
  return date.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

function winteringSeasonSortValue(season = "") {
  const normalized = normalizeWinteringSeasonValue(season);
  return normalized ? Number(normalized.slice(0, 4)) : -1;
}

function normalizeWinteringSeasonList(values = []) {
  return unique((Array.isArray(values) ? values : [values])
    .map((value) => normalizeWinteringSeasonValue(value))
    .filter(Boolean))
    .sort((a, b) => winteringSeasonSortValue(b) - winteringSeasonSortValue(a));
}

function winteringStatusKey(value = "") {
  return ["wintering", "not-wintering"].includes(clean(value)) ? clean(value) : "";
}

function normalizeWinteringMap(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([season, status]) => {
    const safeSeason = normalizeWinteringSeasonValue(season);
    const safeStatus = winteringStatusKey(status);
    if (safeSeason && safeStatus) normalized[safeSeason] = safeStatus;
  });
  return normalized;
}

function winteringStatusLabel(status = "") {
  if (status === "wintering") return "Zimuje";
  if (status === "not-wintering") return "Nezimuje";
  return "Bez stavu";
}

function winteringStatusChipLabel(status = "") {
  if (status === "wintering") return "❄ Zimuje";
  if (status === "not-wintering") return "❄ Nezimuje";
  return "❄ Bez stavu";
}

function winteringStatusClassName(status = "") {
  if (status === "wintering") return "is-wintering";
  if (status === "not-wintering") return "is-not-wintering";
  return "is-wintering-empty";
}

function winteringSeasonOptions() {
  const settings = appSettings();
  const seasons = normalizeWinteringSeasonList([
    suggestedWinteringSeason(),
    settings.currentWinteringSeason,
    ...(settings.winteringSeasons || []),
    ...state.data.varieties.flatMap((variety) => Object.keys(normalizeWinteringMap(variety?.wintering))),
  ]);
  if (!settings.currentWinteringSeason && seasons[0]) settings.currentWinteringSeason = seasons[0];
  if (!settings.winteringSeasons?.length) settings.winteringSeasons = seasons;
  return seasons;
}

function selectedWinteringSeason() {
  const options = winteringSeasonOptions();
  const preferred = normalizeWinteringSeasonValue(state.winteringSeason || appSettings().currentWinteringSeason);
  return options.includes(preferred) ? preferred : (options[0] || suggestedWinteringSeason());
}

function varietyWinteringStatus(variety, season = selectedWinteringSeason()) {
  const safeSeason = normalizeWinteringSeasonValue(season);
  if (!safeSeason) return "";
  return winteringStatusKey(normalizeWinteringMap(variety?.wintering)[safeSeason]);
}

function updateVarietyWintering(variety, season, status) {
  const safeSeason = normalizeWinteringSeasonValue(season);
  const safeStatus = winteringStatusKey(status);
  const next = normalizeWinteringMap(variety?.wintering);
  if (!safeSeason) return next;
  if (safeStatus) next[safeSeason] = safeStatus;
  else delete next[safeSeason];
  return next;
}

function nextWinteringSeason(season = selectedWinteringSeason()) {
  const safeSeason = normalizeWinteringSeasonValue(season) || suggestedWinteringSeason();
  const startYear = Number(safeSeason.slice(0, 4));
  return `${startYear + 1}/${startYear + 2}`;
}

function setSelectedWinteringSeason(season, options = {}) {
  const safeSeason = normalizeWinteringSeasonValue(season);
  if (!safeSeason) return;
  state.winteringSeason = safeSeason;
  if (options.persistCurrent) {
    state.data.settings = {
      ...appSettings(),
      currentWinteringSeason: safeSeason,
      winteringSeasons: normalizeWinteringSeasonList([...(appSettings().winteringSeasons || []), safeSeason]),
    };
    saveData();
  }
  render();
}

function createNextWinteringSeason() {
  const nextSeason = nextWinteringSeason(appSettings().currentWinteringSeason || selectedWinteringSeason());
  state.data.settings = {
    ...appSettings(),
    currentWinteringSeason: nextSeason,
    winteringSeasons: normalizeWinteringSeasonList([...(appSettings().winteringSeasons || []), nextSeason]),
  };
  state.winteringSeason = nextSeason;
  saveData();
  render();
  toast(`Zalozeno zimovaci obdobi ${nextSeason}.`);
}

function winteringHistoryEntries(variety) {
  return Object.entries(normalizeWinteringMap(variety?.wintering))
    .sort((a, b) => winteringSeasonSortValue(b[0]) - winteringSeasonSortValue(a[0]));
}

function appSettings() {
  const settings = state.data.settings || {};
  const currentWinteringSeason = normalizeWinteringSeasonValue(settings.currentWinteringSeason || settings.winteringCurrentSeason) || suggestedWinteringSeason();
  state.data.settings = {
    ...settings,
    shippingFeeCz: normalizeAmount(settings.shippingFeeCz ?? settings.shippingFee),
    shippingFeeSk: normalizeAmount(settings.shippingFeeSk),
    postalFee: normalizeAmount(settings.postalFee ?? settings.postageFee),
    shippingFeeAddressCz: normalizeAmount(settings.shippingFeeAddressCz ?? settings.shippingFeeAddress ?? settings.shippingFeeHome ?? settings.shippingFeeAddressHome),
    shippingFeeAddressSk: normalizeAmount(settings.shippingFeeAddressSk ?? settings.shippingFeeAddress ?? settings.shippingFeeHome ?? settings.shippingFeeAddressHome),
    packingFee: normalizeAmount(settings.packingFee),
    codFeeCz: normalizeAmount(settings.codFeeCz ?? settings.codFee),
    codFeeSk: normalizeAmount(settings.codFeeSk),
    paymentAccountName: clean(settings.paymentAccountName),
    paymentAccountNumber: clean(settings.paymentAccountNumber),
    paymentIban: clean(settings.paymentIban),
    paymentSwift: clean(settings.paymentSwift || settings.paymentBic || settings.paymentSwiftBic),
    extraFees: normalizeNamedFees(settings.extraFees),
    facebookOfferTemplate: clean(settings.facebookOfferTemplate),
    currentWinteringSeason,
    winteringSeasons: normalizeWinteringSeasonList([...(settings.winteringSeasons || []), currentWinteringSeason]),
  };
  return state.data.settings;
}

function saveAppSettingsFromInputs() {
  const current = appSettings();
  state.data.settings = {
    ...current,
    shippingFeeCz: normalizeAmount(document.querySelector("#settingShippingCz")?.value),
    shippingFeeSk: normalizeAmount(document.querySelector("#settingShippingSk")?.value),
    postalFee: normalizeAmount(document.querySelector("#settingPostal")?.value),
    shippingFeeAddressCz: normalizeAmount(document.querySelector("#settingShippingAddressCz")?.value),
    shippingFeeAddressSk: normalizeAmount(document.querySelector("#settingShippingAddressSk")?.value),
    packingFee: normalizeAmount(document.querySelector("#settingPacking")?.value),
    codFeeCz: normalizeAmount(document.querySelector("#settingCodCz")?.value),
    codFeeSk: normalizeAmount(document.querySelector("#settingCodSk")?.value),
    currency: "CZK",
    paymentAccountName: clean(document.querySelector("#settingPaymentName")?.value),
    paymentAccountNumber: clean(document.querySelector("#settingPaymentAccount")?.value),
    paymentIban: clean(document.querySelector("#settingPaymentIban")?.value),
    paymentSwift: clean(document.querySelector("#settingPaymentSwift")?.value),
    extraFees: normalizeNamedFees(current.extraFees),
    currentWinteringSeason: current.currentWinteringSeason,
    winteringSeasons: current.winteringSeasons,
  };
  saveData();
  render();
  toast("NastavenĂ­ uloĹľeno.");
}

function normalizeCustomer(customer = {}) {
  const fullName = collapseRepeatedName(customer.fullName);
  const firstName = collapseRepeatedName(customer.firstName || fullName);
  const lastName = collapseRepeatedName(customer.lastName);
  const lastNameAlreadyInFirstName = lastName && normalize(firstName).includes(normalize(lastName));
  return { ...customer, id: clean(customer.id) || uid(), fullName: "", firstName: firstName || "Bez jmĂ©na", lastName: lastNameAlreadyInFirstName ? "" : lastName, phone: clean(customer.phone), email: clean(customer.email), fbName: clean(customer.fbName), street: clean(customer.street), postalCode: clean(customer.postalCode), city: clean(customer.city), country: clean(customer.country), note: clean(customer.note), tags: Array.isArray(customer.tags) ? customer.tags : [] };
}

function normalizeOrderPaymentStatus(value = "") {
  const normalized = normalize(clean(value));
  if (normalized.includes("nezap") || normalized.includes("neplat") || normalized.includes("pozor")) return "nezaplaceno";
  if (normalized.includes("zapl")) return "zaplaceno";
  return "čeká";
}

function normalizeOrder(order = {}) {
  return { ...order, id: clean(order.id) || uid(), offerId: clean(order.offerId), customerId: clean(order.customerId), orderDate: clean(order.orderDate) || todayInput(), varietiesText: clean(order.varietiesText), price: normalizeAmount(order.price), paymentStatus: normalizeOrderPaymentStatus(order.paymentStatus), paymentTextSentAt: clean(order.paymentTextSentAt), shippingStatus: ["novĂˇ", "pĹ™ipraveno", "odeslĂˇno", "zaplaceno"].includes(clean(order.shippingStatus)) ? clean(order.shippingStatus) : "novĂˇ", deliveryMethod: clean(order.deliveryMethod) === "personal_pickup" ? "personal_pickup" : "ship", shippingFee: normalizeAmount(order.shippingFee), shippingFeeLabel: clean(order.shippingFeeLabel || order.shippingLabel), packingFee: normalizeAmount(order.packingFee), codFee: normalizeAmount(order.codFee), currency: "CZK", note: clean(order.note) };
}

function cleanGeneratedCrossNote(note = "") {
  const lines = clean(note).split(/\n+/).map((line) => clean(line)).filter(Boolean);
  if (!lines.length) return "";
  const seedlingPrefix = normalize("Semenáč z křížení ");
  const lineagePrefix = normalize("Kříženec: ");
  const genericBodies = new Set([
    normalize("matka x pyl"),
    normalize("bez matky x bez pylu"),
  ]);
  const hasSeedlingLine = lines.some((line) => normalize(line).startsWith(seedlingPrefix));
  const filtered = lines.filter((line) => {
    const normalizedLine = normalize(line);
    if (!normalizedLine.startsWith(lineagePrefix)) return true;
    const body = normalizedLine.slice(lineagePrefix.length).trim();
    if (genericBodies.has(body)) return false;
    return !hasSeedlingLine;
  });
  return unique(filtered).join("\n");
}

function normalizeVariety(variety = {}) {
  return {
    ...variety,
    id: clean(variety.id) || uid(),
    name: clean(variety.name),
    salePrice: normalizeAmount(variety.salePrice),
    saleCurrency: "CZK",
    photoUrl: clean(variety.photoUrl),
    gallery: normalizeGallery(variety.gallery),
    wintering: normalizeWinteringMap(variety.wintering),
    active: variety.active !== false,
    note: cleanGeneratedCrossNote(variety.note),
  };
}

function normalizeCross(cross = {}) {
  return { ...cross, id: clean(cross.id) || uid(), motherVarietyId: clean(cross.motherVarietyId), pollenVarietyId: clean(cross.pollenVarietyId), pollinatedAt: clean(cross.pollinatedAt || cross.date) || todayInput(), stage: ["opyleno", "vyseto", "roste", "hotovo"].includes(clean(cross.stage)) ? clean(cross.stage) : "opyleno", seedlingName: clean(cross.seedlingName || cross.name), seedlingPhotoUrl: clean(cross.seedlingPhotoUrl || cross.photoUrl), seedlingGallery: normalizeGallery(cross.seedlingGallery || cross.gallery), resultRating: ["krasna", "hnusna", "nejista"].includes(clean(cross.resultRating || cross.rating)) ? clean(cross.resultRating || cross.rating) : "", linkedVarietyId: clean(cross.linkedVarietyId || cross.varietyId), note: cleanGeneratedCrossNote(cross.note) };
}

function normalizeOffer(offer = {}) {
  return { ...offer, id: clean(offer.id) || uid(), title: clean(offer.title) || `NabĂ­dka ${formatDate(offer.date || todayInput())}`, date: clean(offer.date) || todayInput(), facebookPublishDate: clean(offer.facebookPublishDate || offer.date) || todayInput(), facebookPublishTime: clean(offer.facebookPublishTime) || "20:00", type: normalizeOfferType(offer.type), status: clean(offer.status) || "pĹ™ipravenĂˇ", items: Array.isArray(offer.items) ? offer.items.map(normalizeOfferItem) : [], note: clean(offer.note) };
}

function normalizeOfferItem(item = {}) {
  return {
    ...item,
    id: clean(item.id) || uid(),
    varietyId: clean(item.varietyId),
    varietyName: clean(item.varietyName || item.name),
    quantity: normalizeAmount(item.quantity) || "1",
    price: normalizeAmount(item.price),
    currency: clean(item.currency || "CZK"),
    photoUrl: clean(item.photoUrl),
    note: clean(item.note),
    reservations: Array.isArray(item.reservations) ? item.reservations.map(normalizeReservation) : [],
  };
}

function normalizeReservation(reservation = {}) {
  return {
    ...reservation,
    id: clean(reservation.id) || uid(),
    customerId: clean(reservation.customerId),
    quantity: normalizeAmount(reservation.quantity) || "1",
    status: reservationStatusValue(reservation.status),
    note: clean(reservation.note),
    orderId: clean(reservation.orderId),
    orderCreatedAt: clean(reservation.orderCreatedAt),
  };
}

function reconcileOfferItemVarietyLinks(data = state.data) {
  let changed = false;
  const varieties = Array.isArray(data?.varieties) ? data.varieties : [];
  const byId = new Map(varieties.map((variety) => [clean(variety.id), variety]));
  const byName = new Map(varieties.map((variety) => [varietyNameMatchKey(variety.name), variety]).filter(([key]) => key));
  (data?.offers || []).forEach((offer) => {
    (offer.items || []).forEach((item) => {
      const itemNameKey = varietyNameMatchKey(item.varietyName || item.name);
      const linkedById = byId.get(clean(item.varietyId));
      const exactByName = byName.get(itemNameKey);
      const linkedMatchesName = linkedById && (!itemNameKey || varietyNameMatchKey(linkedById.name) === itemNameKey);
      const variety = linkedMatchesName ? linkedById : (exactByName || linkedById);
      if (!variety) return;
      if (clean(item.varietyId) !== clean(variety.id)) {
        item.varietyId = clean(variety.id);
        changed = true;
      }
      if (clean(item.varietyName) !== clean(variety.name)) {
        item.varietyName = clean(variety.name);
        changed = true;
      }
      const varietyPhotos = new Set(varietyImages(variety));
      const itemPhoto = clean(item.photoUrl);
      if (itemPhoto && !varietyPhotos.size) {
        variety.photoUrl = itemPhoto;
        variety.gallery = [];
        varietyPhotos.add(itemPhoto);
        changed = true;
      }
      if (itemPhoto && varietyPhotos.has(itemPhoto)) {
        item.photoUrl = "";
        changed = true;
      }
    });
    sortOfferItemsInPlace(offer);
  });
  return changed;
}

function findById(collection, id) {
  return state.data[collection]?.find((item) => item.id === id) || null;
}

function findCustomer(id) {
  return findById("customers", id);
}

function findVarietyByName(name) {
  const key = varietyNameMatchKey(name);
  return key ? state.data.varieties.find((variety) => varietyNameMatchKey(variety.name) === key) || null : null;
}

function findVarietyNameConflict(name, currentId = "") {
  const key = varietyNameMatchKey(name);
  const current = clean(currentId);
  if (!key) return null;
  return state.data.varieties.find((variety) => clean(variety.id) !== current && varietyNameMatchKey(variety.name) === key) || null;
}

function findOfferItemNameConflict(offer, name, currentItemId = "") {
  const key = varietyNameMatchKey(name);
  const current = clean(currentItemId);
  if (!offer || !key) return null;
  return (offer.items || []).find((item) => clean(item.id) !== current && varietyNameMatchKey(item.varietyName || item.name) === key) || null;
}

function varietyNameMatchKey(name) {
  return normalize(name).replace(/[^a-z0-9]+/g, "");
}

function offerItemName(item = {}) {
  return clean(findById("varieties", item.varietyId)?.name || item.varietyName || item.name || "OdĹ™ezek");
}

function offerItemImage(item = {}) {
  return clean(item.photoUrl) || varietyImages(findById("varieties", item.varietyId) || findVarietyByName(item.varietyName))[0] || "";
}

function reservationStatusValue(value) {
  return clean(value) === "alternate" || normalize(value) === "nahradnik" ? "alternate" : "confirmed";
}

function sortedReservations(item = {}) {
  return [...(item.reservations || [])].sort((a, b) => {
    const statusDelta = Number(reservationStatusValue(a.status) === "alternate") - Number(reservationStatusValue(b.status) === "alternate");
    if (statusDelta) return statusDelta;
    return customerName(findCustomer(a.customerId)).localeCompare(customerName(findCustomer(b.customerId)), "cs");
  });
}

function offerItemConfirmedCount(item = {}) {
  return (item.reservations || []).reduce((sum, reservation) => reservationStatusValue(reservation.status) === "confirmed" ? sum + number(reservation.quantity) : sum, 0);
}

function reservationAvailableQuantity(item = {}, excludeReservationId = "") {
  const total = wholeNumber(item.quantity, 0);
  const confirmed = (item.reservations || []).reduce((sum, reservation) => {
    if (excludeReservationId && reservation.id === excludeReservationId) return sum;
    return reservationStatusValue(reservation.status) === "confirmed" ? sum + wholeNumber(reservation.quantity, 0) : sum;
  }, 0);
  return Math.max(0, total - confirmed);
}

function offerItemOrderKeys(item = {}) {
  const variety = findById("varieties", item.varietyId) || findVarietyByName(item.varietyName);
  return unique([offerItemName(item), item.varietyName, item.name, variety?.name].map(varietyNameMatchKey).filter(Boolean));
}

function orderContainsOfferItem(order = {}, item = {}) {
  const keys = offerItemOrderKeys(item);
  if (!keys.length) return false;
  const orderKeys = orderVarietyNames(order).map(varietyNameMatchKey).filter(Boolean);
  return keys.some((key) => orderKeys.includes(key));
}

function reservationLinkedToOrder(offer = {}, item = {}, reservation = {}) {
  if (reservationStatusValue(reservation.status) !== "confirmed") return false;
  const customerId = clean(reservation.customerId);
  if (!customerId) return false;
  const orderedQuantity = orderedQuantityForOfferItemAndCustomer(offer, item, customerId);
  if (!orderedQuantity) return false;
  const confirmedReservations = (item.reservations || [])
    .filter((entry) => clean(entry.customerId) === customerId && reservationStatusValue(entry.status) === "confirmed");
  let quantityBefore = 0;
  for (const entry of confirmedReservations) {
    if (clean(entry.id) === clean(reservation.id)) {
      const reservationQuantity = wholeNumber(entry.quantity, 0);
      return orderedQuantity >= quantityBefore + reservationQuantity;
    }
    quantityBefore += wholeNumber(entry.quantity, 0);
  }
  return false;
}

function orderOfferAlternateEntries(order = {}) {
  const offerId = clean(order.offerId);
  const customerId = clean(order.customerId);
  if (!offerId || !customerId) return [];
  const offer = findById("offers", offerId);
  if (!offer?.items?.length) return [];

  return (offer.items || []).reduce((entries, item) => {
    const alternateQuantity = reservationQuantityForCustomer(item, customerId, "alternate");
    if (!alternateQuantity) return entries;
    const confirmedQuantity = reservationQuantityForCustomer(item, customerId, "confirmed");
    const orderQuantity = orderQuantityForOfferItem(order, item);
    const pendingQuantity = Math.max(alternateQuantity - Math.max(orderQuantity - confirmedQuantity, 0), 0);
    if (pendingQuantity > 0) {
      entries.push({
        itemId: clean(item.id) || String(entries.length),
        name: offerItemName(item),
        quantity: pendingQuantity,
      });
    }
    return entries;
  }, []);
}

function orderQuantityForOfferItem(order = {}, item = {}) {
  const keys = offerItemOrderKeys(item);
  if (!keys.length) return 0;
  return orderVarietyPreviewItems(order).reduce((sum, previewItem) => {
    const key = varietyNameMatchKey(previewItem.name);
    return sum + (keys.includes(key) ? previewItem.quantity : 0);
  }, 0);
}

function reservationQuantityForCustomer(item = {}, customerId = "", status = "") {
  return (item.reservations || []).reduce((sum, reservation) => {
    if (clean(reservation.customerId) !== customerId) return sum;
    if (status && reservationStatusValue(reservation.status) !== status) return sum;
    return sum + wholeNumber(reservation.quantity, 0);
  }, 0);
}

function orderedQuantityForOfferItemAndCustomer(offer = {}, item = {}, customerId = "") {
  const offerId = clean(offer.id);
  if (!offerId || !customerId) return 0;
  return (state.data.orders || []).reduce((sum, order) => {
    if (clean(order.offerId) !== offerId) return sum;
    if (clean(order.customerId) !== customerId) return sum;
    return sum + orderQuantityForOfferItem(order, item);
  }, 0);
}

function offerItemOrderedQuantity(offer = {}, item = {}) {
  const customerIds = unique((item.reservations || [])
    .filter((reservation) => reservationStatusValue(reservation.status) === "confirmed")
    .map((reservation) => clean(reservation.customerId))
    .filter(Boolean));
  return customerIds.reduce((sum, customerId) => {
    const confirmedQuantity = reservationQuantityForCustomer(item, customerId, "confirmed");
    const orderedQuantity = orderedQuantityForOfferItemAndCustomer(offer, item, customerId);
    return sum + Math.min(confirmedQuantity, orderedQuantity);
  }, 0);
}

function syncOrderSheetAlternates() {
  const container = els.sheet.querySelector("[data-sheet-order-alternates]");
  const form = els.sheet.querySelector("#sheetForm");
  if (!container || !form) return;
  const entries = orderOfferAlternateEntries({
    offerId: clean(form.elements.offerId?.value),
    customerId: clean(form.elements.customerId?.value),
    varietiesText: clean(form.elements.varietiesText?.value),
  });
  if (!entries.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  container.hidden = false;
  container.innerHTML = `
    <div class="order-alternate-sheet-heading">
      <strong>NĂˇhradnĂ­ci z nabĂ­dky</strong>
      <small>Toto se nepoÄŤĂ­tĂˇ do ceny.</small>
    </div>
    <div class="order-alternate-sheet-list">
      ${entries.map((entry) => `<div class="order-alternate-sheet-item"><span>âš  NĂˇhradnĂ­k: ${escapeHtml(entry.name)} Â· ${escapeHtml(quantityText(entry.quantity))} ks</span><button class="round order-alternate-sheet-add" type="button" data-add-sheet-order-alternate="${escapeHtml(entry.itemId)}">+</button></div>`).join("")}
    </div>
  `;
  container.querySelectorAll("[data-add-sheet-order-alternate]").forEach((button) => {
    button.addEventListener("click", () => addAlternateReservationToOrderSheet(button.dataset.addSheetOrderAlternate));
  });
}

function addAlternateReservationToOrderSheet(itemId) {
  const form = els.sheet.querySelector("#sheetForm");
  const offer = findById("offers", clean(form?.elements?.offerId?.value));
  const item = (offer?.items || []).find((entry) => clean(entry.id) === clean(itemId));
  if (!form || !offer || !item) return;
  const orderState = {
    offerId: clean(form.elements.offerId?.value),
    customerId: clean(form.elements.customerId?.value),
    varietiesText: clean(form.elements.varietiesText?.value),
  };
  const entry = orderOfferAlternateEntries(orderState).find((current) => clean(current.itemId) === clean(itemId));
  if (!entry?.quantity) return;

  const keys = offerItemOrderKeys(item);
  const lines = clean(form.elements.varietiesText.value).split(/\n+/).map(clean).filter(Boolean);
  const index = lines.findIndex((line) => {
    const name = line.replace(/\s+\d+\s*(ks|x).*/i, "").replace(/\s+-\s+\d+.*/, "").trim();
    return keys.includes(varietyNameMatchKey(name));
  });
  if (index >= 0) {
    const line = lines[index];
    const name = line.replace(/\s+\d+\s*(ks|x).*/i, "").replace(/\s+-\s+\d+.*/, "").trim();
    const unitPrice = orderLineUnitPrice(line);
    lines[index] = Number.isFinite(unitPrice)
      ? offerOrderLineText(name, orderLineQuantity(line) + entry.quantity, unitPrice)
      : `${name} ${orderLineQuantity(line) + entry.quantity}x`;
  } else {
    const unitPrice = number(item.price);
    lines.push(Number.isFinite(unitPrice) ? offerOrderLineText(offerItemName(item), entry.quantity, unitPrice) : `${offerItemName(item)} ${entry.quantity}x`);
  }

  form.elements.varietiesText.value = lines.join("\n");

  const shippingFee = number(form.elements.shippingFee?.value);
  const packingFee = number(form.elements.packingFee?.value);
  const feesTotal = (Number.isFinite(shippingFee) ? shippingFee : 0) + (Number.isFinite(packingFee) ? packingFee : 0);
  const orderTotal = orderTotalFromText(form.elements.varietiesText.value);
  form.elements.price.value = normalizeAmount(orderTotal + feesTotal);
  syncOrderSheetAlternates();
  toast("NĂˇhradnĂ­k pĹ™idĂˇn do objednĂˇvky.");
}

function offerItemOrderProgress(offer = {}, item = {}) {
  const confirmed = (item.reservations || []).filter((reservation) => reservationStatusValue(reservation.status) === "confirmed");
  const confirmedQuantity = confirmed.reduce((sum, reservation) => sum + wholeNumber(reservation.quantity, 0), 0);
  const orderedQuantity = offerItemOrderedQuantity(offer, item);
  if (!confirmedQuantity || !orderedQuantity) return { state: "", label: "" };
  if (orderedQuantity >= confirmedQuantity) return { state: "done", label: "V objednĂˇvce" };
  return { state: "partial", label: "ÄŚĂˇsteÄŤnÄ› v objednĂˇvce" };
}

function offerItemAlternateCount(item = {}) {
  return (item.reservations || []).reduce((sum, reservation) => reservationStatusValue(reservation.status) === "alternate" ? sum + number(reservation.quantity) : sum, 0);
}

function offerItemReservedCount(item = {}) {
  return (item.reservations || []).reduce((sum, reservation) => sum + number(reservation.quantity), 0);
}

function offerReservedCount(offer = {}) {
  return (offer.items || []).reduce((sum, item) => sum + offerItemReservedCount(item), 0);
}

function offerTotalCount(offer = {}) {
  return (offer.items || []).reduce((sum, item) => sum + number(item.quantity), 0);
}

function offerAvailableCount(offer = {}) {
  return (offer.items || []).reduce((sum, item) => sum + reservationAvailableQuantity(item), 0);
}

function offerAlternateCount(offer = {}) {
  return (offer.items || []).reduce((sum, item) => sum + offerItemAlternateCount(item), 0);
}

function ensureVarietyFromCross(cross) {
  const existing = findVarietyByName(cross.seedlingName);
  const images = crossSeedlingImages(cross);
  if (existing) {
    existing.photoUrl = existing.photoUrl || images[0] || "";
    existing.gallery = unique([...(existing.gallery || []), ...images.slice(existing.photoUrl ? 0 : 1)]);
    return existing.id;
  }
  const variety = normalizeVariety({ id: uid(), name: cross.seedlingName, photoUrl: images[0] || "", gallery: images.slice(1), saleCurrency: "CZK", active: true, note: `Semenáč z křížení ${crossLineage(cross)}` });
  state.data.varieties.push(variety);
  return variety.id;
}

function syncFinishedCrossVarieties() {
  let changed = false;
  (state.data.crosses || []).forEach((cross) => {
    if (clean(cross.seedlingName) && !findById("varieties", clean(cross.linkedVarietyId))) {
      cross.linkedVarietyId = ensureVarietyFromCross(cross);
      changed = true;
    }
  });
  return changed;
}

function normalizeOfferType(value) {
  return clean(value) === "rests" ? "rests" : "offer";
}

function isRestOffer(offer) {
  return normalizeOfferType(offer?.type) === "rests";
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty"
    : "NabĂ­dka";
}

function splitOffersByType(offers = []) {
  return offers.reduce((groups, offer) => {
    if (isRestOffer(offer)) groups.rests.push(offer);
    else groups.offers.push(offer);
    return groups;
  }, { offers: [], rests: [] });
}

function defaultOfferTitle(type = "offer", date = todayInput()) {
  return normalizeOfferType(type) === "rests"
    ? `Resty ${formatDate(date)}`
    : `NabĂ­dka ${formatDate(date)}`;
}

function adjustedOfferTitleForType(title, currentType, nextType, date = todayInput()) {
  const normalizedCurrentType = normalizeOfferType(currentType);
  const normalizedNextType = normalizeOfferType(nextType);
  const cleanTitle = clean(title);
  if (!cleanTitle) return defaultOfferTitle(normalizedNextType, date);
  return cleanTitle === defaultOfferTitle(normalizedCurrentType, date)
    ? defaultOfferTitle(normalizedNextType, date)
    : cleanTitle;
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty/poznĂˇmky"
    : "NabÄ‚Â­dka";
}

function defaultOfferTitle(type = "offer", date = todayInput()) {
  return normalizeOfferType(type) === "rests"
    ? `Resty/poznĂˇmky ${formatDate(date)}`
    : `NabÄ‚Â­dka ${formatDate(date)}`;
}

function setOfferType(id, nextType, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return;
  const normalizedCurrentType = normalizeOfferType(offer.type);
  const normalizedNextType = normalizeOfferType(nextType);
  if (normalizedCurrentType === normalizedNextType) return;
  const offerDate = clean(offer.date) || todayInput();
  upsert("offers", normalizeOffer({
    ...offer,
    title: adjustedOfferTitleForType(offer.title, normalizedCurrentType, normalizedNextType, offerDate),
    type: normalizedNextType,
    updatedAt: new Date().toISOString(),
  }));
  saveData();
  render();
  openOfferDetailSheet(id, { replace: true });
  if (!options.quiet) {
    toast(normalizedNextType === "rests" ? "NabĂ­dka pĹ™esunuta do restĹŻ/poznĂˇmek." : "Resty/poznĂˇmky pĹ™esunuty do nabĂ­dek.");
  }
}

function openOfferSheet(id = "", defaults = {}) {
  const offer = findById("offers", id) || {};
  const initialType = offer.id ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer.date || clean(defaults.date) || todayInput();
  const sheetTitle = offer.id
    ? (initialType === "rests" ? "Upravit resty/poznĂˇmky" : "Upravit nabÄ‚Â­dku")
    : (initialType === "rests" ? "NovÄ‚Â© resty/poznĂˇmky" : "NovÄ‚Ë‡ nabÄ‚Â­dka");
  openSheet(sheetTitle, `<form class="form-grid" id="sheetForm">
    <label class="field"><span>NÄ‚Ë‡zev</span><input name="title" required value="${escapeHtml(offer.title || defaultOfferTitle(initialType, initialDate))}"></label>
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
    <label class="field"><span>Datum na Facebooku</span><input name="facebookPublishDate" type="date" value="${escapeHtml(offer.facebookPublishDate || initialDate)}"></label>
    <label class="field"><span>Ă„Ĺšas na Facebooku</span><input name="facebookPublishTime" type="time" value="${escapeHtml(offer.facebookPublishTime || "20:00")}"></label>
    <label class="field"><span>Typ</span><select name="type"><option value="offer" ${initialType === "offer" ? "selected" : ""}>NabÄ‚Â­dka</option><option value="rests" ${initialType === "rests" ? "selected" : ""}>Resty/poznĂˇmky</option></select></label>
    ${toggle("status", [["pÄąâ„˘ipravenÄ‚Ë‡", "PÄąâ„˘ipravenÄ‚Ë‡"], ["zveÄąâ„˘ejnĂ„â€şnÄ‚Ë‡", "ZveÄąâ„˘ejnĂ„â€şnÄ‚Ë‡"], ["uzavÄąâ„˘enÄ‚Ë‡", "UzavÄąâ„˘enÄ‚Ë‡"]], offer.status || "pÄąâ„˘ipravenÄ‚Ë‡")}
    <label class="field"><span>PoznÄ‚Ë‡mka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const nextDate = clean(data.get("date")) || todayInput();
    const nextType = normalizeOfferType(data.get("type"));
    const sourceType = offer.id ? normalizeOfferType(offer.type) : nextType;
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: adjustedOfferTitleForType(clean(data.get("title")), sourceType, nextType, nextDate),
      date: nextDate,
      facebookPublishDate: clean(data.get("facebookPublishDate")) || nextDate,
      facebookPublishTime: clean(data.get("facebookPublishTime")) || "20:00",
      type: nextType,
      status: form.querySelector('[name="status"]').value,
      note: clean(data.get("note")),
      items: offer.items || [],
      createdAt: offer.createdAt || now,
      updatedAt: now,
    }));
  });
  bindToggles();
}

function openOfferDetailSheet(id, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return;
  state.activeOfferId = id;
  const items = sortedOfferItems(offer);
  const reserved = offerReservedCount(offer);
  const total = offerTotalCount(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty/poznĂˇmky" : "Upravit nabĂ­dku";
  const toggleTypeLabel = isRestOffer(offer) ? "PĹ™esunout do nabĂ­dek" : "PĹ™esunout do restĹŻ/poznĂˇmek";
  const body = `<section class="offer-detail">
    <div class="offer-stats">
      <span><strong>${items.length}</strong><small>odÄąâ„˘ezkÄąĹ»</small></span>
      <span><strong>${total}</strong><small>kusÄąĹ»</small></span>
      <span><strong>${reserved}</strong><small>rezervacÄ‚Â­</small></span>
      <span><strong>${Math.max(0, total - reserved)}</strong><small>volnÄ‚Â©</small></span>
    </div>
    <div class="pill-row"><span class="pill ${isRestOffer(offer) ? "warn" : ""}">${escapeHtml(offerTypeLabel(offer))}</span><span class="pill">${escapeHtml(offer.status)}</span></div>
    ${offer.note ? `<p class="sub">${escapeHtml(offer.note)}</p>` : ""}
    <button class="button" type="button" data-toggle-offer-type="${escapeHtml(id)}">${toggleTypeLabel}</button>
    <button class="button primary" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">PÄąâ„˘ipravit Facebook pÄąâ„˘Ä‚Â­spĂ„â€şvek</button>
    <div class="offer-items">
      ${items.length ? items.map((item) => offerItemDetailMarkup(offer, item)).join("") : `<div class="empty light">ZatÄ‚Â­m bez odÄąâ„˘ezkÄąĹ».</div>`}
    </div>
  </section>`;
  const footer = `<button class="button" type="button" data-close-sheet>ZavÄąâ„˘Ä‚Â­t</button>
    <button class="button" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">Facebook</button>
    <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">${editLabel}</button>
    <button class="button" type="button" data-create-offer-orders="${escapeHtml(id)}">VytvoÄąâ„˘it objednÄ‚Ë‡vky</button>
    <button class="button primary" type="button" data-add-offer-item="${escapeHtml(id)}">PÄąâ„˘idat odÄąâ„˘ezek</button>`;
  openSheet(offer.title, body, null, footer, {
    ...options,
    restore: () => openOfferDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-toggle-offer-type]")?.addEventListener("click", () => {
    setOfferType(id, isRestOffer(offer) ? "offer" : "rests");
  });
  els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
  els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  els.sheet.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemSheet(id));
  els.sheet.querySelectorAll("[data-reserve-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.reserveOfferItem, "", "confirmed"));
  });
  els.sheet.querySelectorAll("[data-alternate-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.alternateOfferItem, "", "alternate"));
  });
  els.sheet.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemSheet(button.dataset.offerId, button.dataset.editOfferItem));
  });
  els.sheet.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(button.dataset.offerId, button.dataset.deleteOfferItem));
  });
  els.sheet.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.itemId, button.dataset.editReservation));
  });
  els.sheet.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(button.dataset.offerId, button.dataset.itemId, button.dataset.deleteReservation));
  });
  resolvePhotos(els.sheet);
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty/pozn\u00e1mky"
    : "Nab\u00eddka";
}

function defaultOfferTitle(type = "offer", date = todayInput()) {
  return normalizeOfferType(type) === "rests"
    ? `Resty/pozn\u00e1mky ${formatDate(date)}`
    : `Nab\u00eddka ${formatDate(date)}`;
}

function setOfferType(id, nextType, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return;
  const normalizedCurrentType = normalizeOfferType(offer.type);
  const normalizedNextType = normalizeOfferType(nextType);
  if (normalizedCurrentType === normalizedNextType) return;
  const offerDate = clean(offer.date) || todayInput();
  upsert("offers", normalizeOffer({
    ...offer,
    title: adjustedOfferTitleForType(offer.title, normalizedCurrentType, normalizedNextType, offerDate),
    type: normalizedNextType,
    updatedAt: new Date().toISOString(),
  }));
  saveData();
  render();
  openOfferDetailSheet(id, { replace: true });
  if (!options.quiet) {
    toast(normalizedNextType === "rests" ? "Nab\u00eddka p\u0159esunuta do rest\u016f/pozn\u00e1mek." : "Resty/pozn\u00e1mky p\u0159esunuty do nab\u00eddek.");
  }
}

function uniqueOfferTitle(baseTitle, excludeId = "") {
  const originalTitle = clean(baseTitle) || defaultOfferTitle("offer", todayInput());
  let nextTitle = originalTitle;
  let index = 2;
  while (state.data.offers.some((offer) => clean(offer.id) !== clean(excludeId) && clean(offer.title) === nextTitle)) {
    nextTitle = `${originalTitle} (${index})`;
    index += 1;
  }
  return nextTitle;
}

function offerLeftoverTransferEntries(offer = {}) {
  return sortedOfferItems(offer).reduce((entries, item) => {
    const availableQuantity = reservationAvailableQuantity(item);
    if (!availableQuantity) return entries;
    const totalQuantity = wholeNumber(item.quantity, 0);
    entries.push({
      item,
      availableQuantity,
      remainingQuantity: Math.max(totalQuantity - availableQuantity, 0),
    });
    return entries;
  }, []);
}

function cloneOfferItemForLeftovers(item = {}, quantity = 0) {
  return normalizeOfferItem({
    ...item,
    id: uid(),
    quantity: String(Math.max(Number(quantity) || 0, 0)),
    reservations: [],
  });
}

function moveOfferLeftoversToNewOffer(id, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return null;
  if (isRestOffer(offer)) {
    toast("Zbytky p\u0159esouvej jen z klasick\u00e9 nab\u00eddky.");
    return null;
  }
  const entries = offerLeftoverTransferEntries(offer);
  if (!entries.length) {
    toast("V nab\u00eddce u\u017e nejsou \u017e\u00e1dn\u00e9 voln\u00e9 kusy k p\u0159esunu.");
    return null;
  }
  const totalQuantity = entries.reduce((sum, entry) => sum + entry.availableQuantity, 0);
  if (!confirm(`P\u0159esunout ${totalQuantity} voln\u00fdch ks do nov\u00e9 nab\u00eddky?`)) return null;

  const now = new Date().toISOString();
  const nextDate = clean(options.date) || todayInput();
  const nextOffer = normalizeOffer({
    id: uid(),
    title: uniqueOfferTitle(defaultOfferTitle("offer", nextDate)),
    date: nextDate,
    facebookPublishDate: nextDate,
    facebookPublishTime: clean(offer.facebookPublishTime) || "20:00",
    type: "offer",
    status: "p\u0159ipraven\u00e1",
    note: `Zbytky z nab\u00eddky ${offer.title}.`,
    items: entries.map(({ item, availableQuantity }) => cloneOfferItemForLeftovers(item, availableQuantity)),
    createdAt: now,
    updatedAt: now,
  });

  const entriesById = new Map(entries.map((entry) => [clean(entry.item.id), entry]));
  offer.items = (offer.items || []).reduce((items, item) => {
    const entry = entriesById.get(clean(item.id));
    if (!entry) {
      items.push(item);
      return items;
    }
    item.quantity = String(entry.remainingQuantity);
    if (wholeNumber(item.quantity, 0) > 0 || (item.reservations || []).length) {
      items.push(item);
    }
    return items;
  }, []);

  upsert("offers", normalizeOffer({
    ...offer,
    items: offer.items,
    updatedAt: now,
  }));
  upsert("offers", nextOffer);
  saveData();
  render();
  openOfferDetailSheet(nextOffer.id, { replace: true });
  if (!options.quiet) toast("Vytvo\u0159ena nov\u00e1 nab\u00eddka z neprodan\u00fdch zbytk\u016f.");
  return nextOffer;
}

function openOfferSheet(id = "", defaults = {}) {
  const offer = findById("offers", id) || {};
  const initialType = offer.id ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer.date || clean(defaults.date) || todayInput();
  const sheetTitle = offer.id
    ? (initialType === "rests" ? "Upravit resty/pozn\u00e1mky" : "Upravit nab\u00eddku")
    : (initialType === "rests" ? "Nov\u00e9 resty/pozn\u00e1mky" : "Nov\u00e1 nab\u00eddka");
  openSheet(sheetTitle, `<form class="form-grid" id="sheetForm">
    <label class="field"><span>N\u00e1zev</span><input name="title" required value="${escapeHtml(offer.title || defaultOfferTitle(initialType, initialDate))}"></label>
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
    <label class="field"><span>Datum na Facebooku</span><input name="facebookPublishDate" type="date" value="${escapeHtml(offer.facebookPublishDate || initialDate)}"></label>
    <label class="field"><span>\u010cas na Facebooku</span><input name="facebookPublishTime" type="time" value="${escapeHtml(offer.facebookPublishTime || "20:00")}"></label>
    <label class="field"><span>Typ</span><select name="type"><option value="offer" ${initialType === "offer" ? "selected" : ""}>Nab\u00eddka</option><option value="rests" ${initialType === "rests" ? "selected" : ""}>Resty/pozn\u00e1mky</option></select></label>
    ${toggle("status", [["p\u0159ipraven\u00e1", "P\u0159ipraven\u00e1"], ["zve\u0159ejn\u011bn\u00e1", "Zve\u0159ejn\u011bn\u00e1"], ["uzav\u0159en\u00e1", "Uzav\u0159en\u00e1"]], offer.status || "p\u0159ipraven\u00e1")}
    <label class="field"><span>Pozn\u00e1mka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const nextDate = clean(data.get("date")) || todayInput();
    const nextType = normalizeOfferType(data.get("type"));
    const sourceType = offer.id ? normalizeOfferType(offer.type) : nextType;
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: adjustedOfferTitleForType(clean(data.get("title")), sourceType, nextType, nextDate),
      date: nextDate,
      facebookPublishDate: clean(data.get("facebookPublishDate")) || nextDate,
      facebookPublishTime: clean(data.get("facebookPublishTime")) || "20:00",
      type: nextType,
      status: form.querySelector('[name="status"]').value,
      note: clean(data.get("note")),
      items: offer.items || [],
      createdAt: offer.createdAt || now,
      updatedAt: now,
    }));
  });
  bindToggles();
}

function openOfferDetailSheet(id, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return;
  state.activeOfferId = id;
  const items = sortedOfferItems(offer);
  const reserved = offerReservedCount(offer);
  const total = offerTotalCount(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty/pozn\u00e1mky" : "Upravit nab\u00eddku";
  const toggleTypeLabel = isRestOffer(offer) ? "P\u0159esunout do nab\u00eddek" : "P\u0159esunout do rest\u016f/pozn\u00e1mek";
  const moveLeftoversButton = !isRestOffer(offer)
    ? `<button class="button" type="button" data-move-offer-leftovers="${escapeHtml(id)}">P\u0159esunout neprodan\u00e9 do nov\u00e9 nab\u00eddky</button>`
    : "";
  const body = `<section class="offer-detail">
    <div class="offer-stats">
      <span><strong>${items.length}</strong><small>od\u0159ezk\u016f</small></span>
      <span><strong>${total}</strong><small>kus\u016f</small></span>
      <span><strong>${reserved}</strong><small>rezervac\u00ed</small></span>
      <span><strong>${Math.max(0, total - reserved)}</strong><small>voln\u00e9</small></span>
    </div>
    <div class="pill-row"><span class="pill ${isRestOffer(offer) ? "warn" : ""}">${escapeHtml(offerTypeLabel(offer))}</span><span class="pill">${escapeHtml(offer.status)}</span></div>
    ${offer.note ? `<p class="sub">${escapeHtml(offer.note)}</p>` : ""}
    <button class="button" type="button" data-toggle-offer-type="${escapeHtml(id)}">${toggleTypeLabel}</button>
    ${moveLeftoversButton}
    <button class="button primary" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">P\u0159ipravit Facebook p\u0159\u00edsp\u011bvek</button>
    <div class="offer-items">
      ${items.length ? items.map((item) => offerItemDetailMarkup(offer, item)).join("") : `<div class="empty light">Zat\u00edm bez od\u0159ezk\u016f.</div>`}
    </div>
  </section>`;
  const footer = `<button class="button" type="button" data-close-sheet>Zav\u0159\u00edt</button>
    <button class="button" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">Facebook</button>
    <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">${editLabel}</button>
    <button class="button" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvo\u0159it objedn\u00e1vky</button>
    <button class="button primary" type="button" data-add-offer-item="${escapeHtml(id)}">P\u0159idat od\u0159ezek</button>`;
  openSheet(offer.title, body, null, footer, {
    ...options,
    restore: () => openOfferDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-toggle-offer-type]")?.addEventListener("click", () => {
    setOfferType(id, isRestOffer(offer) ? "offer" : "rests");
  });
  els.sheet.querySelector("[data-move-offer-leftovers]")?.addEventListener("click", () => {
    moveOfferLeftoversToNewOffer(id);
  });
  els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
  els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  els.sheet.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemSheet(id));
  els.sheet.querySelectorAll("[data-reserve-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.reserveOfferItem, "", "confirmed"));
  });
  els.sheet.querySelectorAll("[data-alternate-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.alternateOfferItem, "", "alternate"));
  });
  els.sheet.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemSheet(button.dataset.offerId, button.dataset.editOfferItem));
  });
  els.sheet.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(button.dataset.offerId, button.dataset.deleteOfferItem));
  });
  els.sheet.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.itemId, button.dataset.editReservation));
  });
  els.sheet.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(button.dataset.offerId, button.dataset.itemId, button.dataset.deleteReservation));
  });
  resolvePhotos(els.sheet);
}

function matchOffer(offer) {
  const isClosed = offer.status === "uzavĹ™enĂˇ";
  if (state.filter === "active" && isClosed) return false;
  if (state.filter === "closed" && !isClosed) return false;
  const items = Array.isArray(offer.items) ? offer.items : [];
  return matches([offer.title, offerTypeLabel(offer), offer.note, offer.status, ...items.map((item) => offerItemName(item))]);
}

function matchOrder(order) {
  if (state.filter === "todo" && order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus)) return false;
  if (state.filter === "done" && !(order.paymentStatus === "zaplaceno" && ["odeslĂˇno", "zaplaceno"].includes(order.shippingStatus))) return false;
  return matches([customerName(findCustomer(order.customerId)), order.varietiesText, order.note, order.orderDate]);
}

function matchCustomer(customer) {
  if (state.filter === "cz" && normalize(customer.country) !== "cesko") return false;
  if (state.filter === "foreign" && normalize(customer.country) === "cesko") return false;
  return matches([customerName(customer), customer.email, customer.phone, customer.country, customer.note]);
}

function matchVariety(variety) {
  const winterStatus = varietyWinteringStatus(variety);
  if (state.filter === "wintering" && winterStatus !== "wintering") return false;
  if (state.filter === "not-wintering" && winterStatus !== "not-wintering") return false;
  if (state.filter === "wintering-empty" && winterStatus) return false;
  if (state.filter === "photo" && !varietyImages(variety).length) return false;
  if (state.filter === "no-photo" && varietyImages(variety).length) return false;
  return matches([variety.name, variety.note, variety.salePrice]);
}

function matchCross(cross) {
  if (state.filter === "active" && cross.stage === "hotovo") return false;
  if (state.filter === "done" && cross.stage !== "hotovo") return false;
  if (state.filter === "bad" && cross.resultRating !== "hnusna") return false;
  return matches([crossLineage(cross), cross.seedlingName, cross.note, ratingLabels[cross.resultRating], stageLabels[cross.stage]]);
}

function matches(parts) {
  const query = normalize(state.query);
  return !query || normalize(parts.filter(Boolean).join(" ")).includes(query);
}

function customerName(customer = {}) {
  return collapseRepeatedName(customer.fullName || [customer.firstName, customer.lastName].filter(Boolean).join(" "));
}

function collapseRepeatedName(value) {
  const words = clean(value).replace(/\s+/g, " ").split(" ").filter(Boolean);
  const result = [];
  const seen = new Set();
  for (const word of words) {
    const key = normalize(word).replace(/[^a-z0-9]+/g, "");
    if (key && seen.has(key)) break;
    if (key) seen.add(key);
    result.push(word);
  }
  return result.join(" ");
}

function compactName(value) {
  const text = clean(value).replace(/\s+/g, " ");
  return text.length > 42 ? `${text.slice(0, 39).trim()}â€¦` : text;
}

function orderVarietyNames(order = {}) {
  return clean(order.varietiesText).split(/\n+/).map((line) => line.replace(/\s+\d+\s*(ks|x).*/i, "").replace(/\s+-\s+\d+.*/, "").trim()).filter(Boolean);
}

function orderVarietyPreviewItems(order = {}) {
  const grouped = new Map();
  clean(order.varietiesText).split(/\n+/).forEach((rawLine) => {
    const line = clean(rawLine);
    if (!line) return;
    const name = line.replace(/\s+\d+\s*(ks|x).*/i, "").replace(/\s+-\s+\d+.*/, "").trim();
    if (!name) return;
    const key = varietyNameMatchKey(name) || name;
    const existing = grouped.get(key) || { name, quantity: 0 };
    existing.quantity += orderLineQuantity(line);
    grouped.set(key, existing);
  });
  return [...grouped.values()];
}

function orderLineQuantity(line = "") {
  const value = clean(line);
  const match =
    value.match(/\b(\d+)\s*x\b/i) ||
    value.match(/\bx\s*(\d+)\b/i) ||
    value.match(/\b(\d+)\s*(ks|kus|kusy|Ĺ™Ă­zkĹŻ|rizku|sazenic)\b/i);
  const quantity = match ? Number(match[1]) : 1;
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function orderLineUnitPrice(line = "") {
  const value = clean(line);
  const pricedAtEnd =
    value.match(/(?:-|â€“|â€”)\s*(\d+(?:[,.]\d+)?)\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i) ||
    value.match(/(?:@|=)\s*(\d+(?:[,.]\d+)?)\s*(KÄŤ|kc|czk|eur|â‚¬)?\s*$/i);
  if (pricedAtEnd) return number(pricedAtEnd[1]);
  const inline = value.match(/(\d+(?:[,.]\d+)?)\s*KÄŤ/i);
  return inline ? number(inline[1]) : Number.NaN;
}

function paymentPill(order) {
  const paymentStatus = normalizeOrderPaymentStatus(order?.paymentStatus);
  if (paymentStatus === "nezaplaceno") return { label: "Neplatí", className: "danger" };
  if (paymentStatus === "zaplaceno") return { label: "Zaplaceno", className: "ok" };
  return { label: "Čeká", className: "warn" };
}

function statusPill(order) {
  return { "novĂˇ": "NovĂˇ", "pĹ™ipraveno": "PĹ™ipravenĂˇ", "odeslĂˇno": "đźšš OdeslanĂˇ", zaplaceno: "Hotovo" }[order.shippingStatus] || "NovĂˇ";
}

function orderPaymentTextPill(order = {}) {
  return clean(order.paymentTextSentAt) ? "Text odeslĂˇn" : "";
}

function crossLineage(cross) {
  return `${findById("varieties", cross.motherVarietyId)?.name || "Matka"} x ${findById("varieties", cross.pollenVarietyId)?.name || "Pyl"}`;
}

function varietyImages(variety = {}) {
  return unique([variety?.photoUrl, ...normalizeGallery(variety?.gallery)].map(clean).filter(Boolean));
}

function linkedCrossVariety(cross = {}) {
  return findById("varieties", clean(cross.linkedVarietyId))
    || (clean(cross.seedlingName || cross.name) ? findVarietyByName(clean(cross.seedlingName || cross.name)) : null);
}

function crossSeedlingImages(cross = {}) {
  const linkedImages = varietyImages(linkedCrossVariety(cross));
  return unique([...linkedImages, cross?.seedlingPhotoUrl, ...normalizeGallery(cross?.seedlingGallery)].map(clean).filter(Boolean));
}

function hasLocalOnlyPhotoRefs(data = state.data) {
  let found = false;
  const check = (ref) => {
    const value = clean(ref);
    if (!value || value.startsWith(SUPABASE_PHOTO_PREFIX)) return;
    if (value.startsWith(INDEXED_PHOTO_PREFIX) || value.startsWith("data:image/") || value.startsWith("blob:")) found = true;
  };
  for (const variety of data?.varieties || []) varietyImages(variety).forEach(check);
  for (const cross of data?.crosses || []) crossSeedlingImages(cross).forEach(check);
  for (const offer of data?.offers || []) {
    for (const item of offer?.items || []) check(item?.photoUrl);
  }
  return found;
}

function varietyUsageCount(name) {
  const key = varietyNameMatchKey(name);
  if (!key) return 0;
  return state.data.orders.filter((order) => orderVarietyNames(order).some((item) => varietyNameMatchKey(item) === key)).length;
}

function orderTotalFromText(text) {
  return clean(text).split(/\n+/).reduce((sum, line) => {
    const unitPrice = orderLineUnitPrice(line);
    return sum + (Number.isFinite(unitPrice) ? unitPrice * orderLineQuantity(line) : 0);
  }, 0);
}

function customerSortPrice(variety) {
  const price = number(variety.salePrice);
  return Number.isFinite(price) ? price : 999999;
}

async function saveIndexedPhotos(files) {
  const refs = [];
  for (const file of files) refs.push(await saveIndexedPhoto(file));
  return refs;
}

async function saveIndexedPhoto(file) {
  const id = uid();
  const storedFile = await preparePhotoFileForStorage(file);
  const db = await openPhotoDb();
  await idbPut(db, PHOTO_BLOB_STORE, { id, blob: storedFile, name: storedFile.name, type: storedFile.type, createdAt: new Date().toISOString() });
  return `${INDEXED_PHOTO_PREFIX}${id}`;
}

async function preparePhotoFileForStorage(file) {
  if (!file || !file.type?.startsWith("image/")) return file;
  if (file.size && file.size <= PHOTO_MAX_UPLOAD_BYTES) return file;
  let objectUrl = "";
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await loadCanvasImage(objectUrl);
    if (!image) return file;
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) return file;
    let scale = Math.min(1, PHOTO_MAX_UPLOAD_EDGE / Math.max(sourceWidth, sourceHeight));
    let bestBlob = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return file;
      context.drawImage(image, 0, 0, width, height);
      for (const quality of PHOTO_UPLOAD_QUALITY_STEPS) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
        if (!blob) continue;
        if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
        if (blob.size <= PHOTO_MAX_UPLOAD_BYTES) return photoBlobToFile(blob, file);
      }
      scale *= 0.84;
    }
    return bestBlob && bestBlob.size < file.size ? photoBlobToFile(bestBlob, file) : file;
  } catch {
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function photoBlobToFile(blob, originalFile) {
  const baseName = clean(originalFile?.name || "fotka").replace(/\.[^.]+$/, "") || "fotka";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

function openPhotoDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PHOTO_BLOB_STORE)) request.result.createObjectStore(PHOTO_BLOB_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbPut(db, storeName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

function idbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGetAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

function idbDelete(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function resolvePhotos(root) {
  const images = [...root.querySelectorAll("[data-photo-ref]")];
  await Promise.all(images.map(async (image) => {
    if (image.dataset.photoLoaded === "1") return;
    const originalRef = clean(image.dataset.photoRef);
    const fullRef = clean(image.dataset.photoFullRef);
    const fallbackAllowed = image.dataset.photoAllowFallback === "1";
    const ref = fullRef ? originalRef : thumbPreviewRef(originalRef);
    if (ref !== originalRef && !image.dataset.photoFullRef) image.dataset.photoFullRef = originalRef;
    const load = async () => {
      image.dataset.photoQueued = "";
      image.onerror = async () => {
        const ownerThumbRef = clean(image.dataset.photoOwnerThumbRef);
        if (ownerThumbRef && image.dataset.photoOwnerFallbackLoaded !== "1") {
          image.dataset.photoOwnerFallbackLoaded = "1";
          const ownerThumbUrl = await resolvePhotoUrl(ownerThumbRef);
          if (ownerThumbUrl) {
            image.src = ownerThumbUrl;
            image.dataset.photoLoaded = "1";
            clearPhotoMissing(image);
            return;
          }
        }
        const ownerFolderRef = clean(image.dataset.photoOwnerFolderRef);
        if (ownerFolderRef && image.dataset.photoOwnerFolderFallbackLoaded !== "1") {
          image.dataset.photoOwnerFolderFallbackLoaded = "1";
          const folderUrl = await resolvePhotoUrl(ownerFolderRef);
          if (folderUrl) {
            image.src = folderUrl;
            image.dataset.photoLoaded = "1";
            clearPhotoMissing(image);
            return;
          }
        }
        if (!fallbackAllowed || !image.dataset.photoFullRef || image.dataset.photoFallbackLoaded === "1") return;
        image.dataset.photoFallbackLoaded = "1";
        const fallbackUrl = await resolvePhotoUrl(image.dataset.photoFullRef);
        if (!fallbackUrl) return;
        image.src = fallbackUrl;
        image.dataset.photoLoaded = "1";
        clearPhotoMissing(image);
      };
      let url = await resolvePhotoUrl(ref);
      if (!url && clean(image.dataset.photoOwnerThumbRef)) url = await resolvePhotoUrl(image.dataset.photoOwnerThumbRef);
      if (!url && clean(image.dataset.photoOwnerFolderRef)) url = await resolvePhotoUrl(image.dataset.photoOwnerFolderRef);
      if (!url && fallbackAllowed && image.dataset.photoFullRef) url = await resolvePhotoUrl(image.dataset.photoFullRef);
      if (url) {
        image.src = url;
        image.dataset.photoLoaded = "1";
        clearPhotoMissing(image);
      } else {
        markPhotoMissing(image);
      }
    };
    const lazyEligible = ref.startsWith(SUPABASE_PHOTO_PREFIX)
      || clean(image.dataset.photoFullRef).startsWith(SUPABASE_PHOTO_PREFIX);
    if (lazyEligible && !isPhotoNearViewport(image) && queueDeferredPhotoLoad(image, load)) return;
    await load();
  }));
}

function isPhotoNearViewport(image) {
  if (!image?.getBoundingClientRect) return true;
  const rect = image.getBoundingClientRect();
  const margin = SUPABASE_PHOTO_LAZY_MARGIN_PX;
  const width = window.innerWidth || document.documentElement?.clientWidth || 0;
  const height = window.innerHeight || document.documentElement?.clientHeight || 0;
  return rect.bottom >= -margin
    && rect.top <= height + margin
    && rect.right >= -margin
    && rect.left <= width + margin;
}

function ensurePhotoObserver() {
  if (photoRuntime.observer || typeof IntersectionObserver !== "function") return photoRuntime.observer;
  photoRuntime.observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && entry.intersectionRatio <= 0) return;
      runDeferredPhotoLoad(entry.target);
    });
  }, { rootMargin: SUPABASE_PHOTO_OBSERVER_ROOT_MARGIN });
  return photoRuntime.observer;
}

function queueDeferredPhotoLoad(image, load) {
  const observer = ensurePhotoObserver();
  if (!observer || image.dataset.photoQueued === "1" || image.dataset.photoLoaded === "1") return false;
  photoRuntime.deferredLoads.set(image, load);
  image.dataset.photoQueued = "1";
  observer.observe(image);
  return true;
}

function runDeferredPhotoLoad(image) {
  const observer = photoRuntime.observer;
  if (observer) observer.unobserve(image);
  const load = photoRuntime.deferredLoads.get(image);
  if (!load) return;
  photoRuntime.deferredLoads.delete(image);
  Promise.resolve(load()).catch(() => {
    markPhotoMissing(image);
  });
}

function markPhotoMissing(image) {
  if (!image) return;
  image.classList.add("photo-missing");
  repairMissingSupabaseThumbnail(image).catch(() => {});
  image.hidden = true;
  const parent = image.parentElement;
  if (!parent || parent.querySelector(".photo-missing-label")) return;
  const label = document.createElement("span");
  label.className = "photo-missing-label";
  label.textContent = initials(image.getAttribute("alt") || "AK");
  parent.append(label);
}

function clearPhotoMissing(image) {
  if (!image) return;
  image.hidden = false;
  image.classList.remove("photo-missing");
  image.parentElement?.querySelector(".photo-missing-label")?.remove();
  image.parentElement?.querySelector(".catalog-mobile-placeholder")?.remove();
}

async function repairMissingSupabaseThumbnail(image) {
  const fullRef = clean(image?.dataset?.photoFullRef || image?.dataset?.photoRef);
  if (!fullRef.startsWith(SUPABASE_PHOTO_PREFIX)) return false;
  const sourceFile = await getLocalSupabaseOriginalFile(fullRef);
  if (!sourceFile) return false;
  const sourcePath = parseSupabasePhotoRef(fullRef);
  const targetPath = isSupabaseThumbnailPath(sourcePath) ? sourcePath : supabaseThumbnailPath(sourcePath);
  if (!targetPath) return false;
  const repairKey = `${fullRef}=>${targetPath}`;
  if (photoRuntime.repairingRefs.has(repairKey)) return false;
  photoRuntime.repairingRefs.add(repairKey);
  try {
    const thumb = await createPhotoThumbnail(sourceFile);
    if (!thumb) return false;
    await uploadStorage(targetPath, thumb);
    const repairedRef = `${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(targetPath)}`;
    state.photoUrls.delete(repairedRef);
    const repairedUrl = await resolvePhotoUrl(repairedRef);
    if (repairedUrl && image?.isConnected) {
      image.src = repairedUrl;
      image.dataset.photoLoaded = "1";
      clearPhotoMissing(image);
    }
    toast("Chybějící náhled fotky jsem doplnila do cloudu.");
    return true;
  } finally {
    photoRuntime.repairingRefs.delete(repairKey);
  }
}

async function resolvePhotoUrl(ref) {
  const value = clean(ref);
  if (!value) return "";
  if (value.startsWith("data:image/") || value.startsWith("blob:") || value.startsWith("http")) return value;
  if (value.startsWith(INDEXED_PHOTO_PREFIX)) {
    if (state.photoUrls.has(value)) return state.photoUrls.get(value);
    const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, value.slice(INDEXED_PHOTO_PREFIX.length));
    if (!record?.blob) return "";
    const url = URL.createObjectURL(record.blob);
    state.photoUrls.set(value, url);
    return url;
  }
  if (value.startsWith(SUPABASE_PHOTO_PREFIX)) {
    const path = parseSupabasePhotoRef(value);
    const localRecord = await getLocalSupabaseOriginalRecord(value);
    if (localRecord?.blob) {
      const currentUrl = state.photoUrls.get(value);
      if (currentUrl?.startsWith("blob:")) return currentUrl;
      const localUrl = URL.createObjectURL(localRecord.blob);
      state.photoUrls.set(value, localUrl);
      return localUrl;
    }
    if (state.photoUrls.has(value)) return state.photoUrls.get(value);
    const cached = await getCachedSupabasePhotoBlob(value);
    if (cached) {
      const cachedUrl = URL.createObjectURL(cached);
      state.photoUrls.set(value, cachedUrl);
      return cachedUrl;
    }
    const fetchedUrl = await fetchSupabasePhotoObjectUrl(path, value);
    if (fetchedUrl) {
      state.photoUrls.set(value, fetchedUrl);
      return fetchedUrl;
    }
    if (isSupabaseThumbnailPath(path)) return "";
    const url = await createSignedPhotoUrl(path);
    state.photoUrls.set(value, url);
    return url;
  }
  if (value.startsWith("supabase-folder-thumb:")) {
    return resolveSupabaseFolderThumbUrl(value.slice("supabase-folder-thumb:".length));
  }
  return "";
}

async function resolveSupabaseFolderThumbUrl(encodedPath = "") {
  const folder = decodeURIComponent(clean(encodedPath));
  if (!folder || state.photoUrls.has(`folder:${folder}`)) return state.photoUrls.get(`folder:${folder}`) || "";
  try {
    const entries = await supabaseRequest(`/storage/v1/object/list/${SUPABASE_SYNC_BUCKET}`, {
      method: "POST",
      body: { prefix: folder, limit: 20, offset: 0, sortBy: { column: "created_at", order: "desc" } },
    });
    const file = (entries || []).map((entry) => clean(entry?.name)).find((name) => /\.(jpe?g|png|webp)$/i.test(name));
    if (!file) return "";
    const path = `${folder}${file}`;
    const ref = `${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(path)}`;
    const url = await resolvePhotoUrl(ref);
    if (url) state.photoUrls.set(`folder:${folder}`, url);
    return url || "";
  } catch {
    return "";
  }
}

function localSupabaseOriginalKey(ref) {
  const value = clean(ref);
  return value.startsWith(SUPABASE_PHOTO_PREFIX) ? `${SUPABASE_LOCAL_ORIGINAL_PREFIX}${value}` : "";
}

async function getLocalSupabaseOriginalRecord(ref) {
  const key = localSupabaseOriginalKey(ref);
  if (!key) return null;
  try {
    return await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, key);
  } catch {
    return null;
  }
}

async function getLocalSupabaseOriginalFile(ref, ownerName = "fotka") {
  const record = await getLocalSupabaseOriginalRecord(ref);
  if (!record?.blob) return null;
  return new File(
    [record.blob],
    clean(record.name) || `${safeFileName(ownerName)}${photoExtension(record.blob)}`,
    { type: clean(record.type) || record.blob.type || "image/jpeg" }
  );
}

async function countLocalSupabaseOriginals() {
  try {
    const records = await idbGetAll(await openPhotoDb(), PHOTO_BLOB_STORE);
    return records.filter((record) => clean(record?.id).startsWith(SUPABASE_LOCAL_ORIGINAL_PREFIX)).length;
  } catch {
    return 0;
  }
}

async function mobileOriginalsStatusCounts() {
  const plan = buildSupabaseOriginalDownloadPlan(state.data);
  let stored = 0;
  for (const entry of plan) {
    const record = await getLocalSupabaseOriginalRecord(entry.ref);
    if (record?.blob) stored += 1;
  }
  return { stored, total: plan.length, plan };
}

function mobileOriginalsFolderSupported() {
  return typeof window.showDirectoryPicker === "function";
}

function setMobileOriginalsStatusText(text) {
  const node = document.querySelector("#mobileOriginalsStatus");
  if (node) node.textContent = text;
}

function setMobileOriginalsStatusParts(appText, folderText) {
  const node = document.querySelector("#mobileOriginalsStatus");
  if (!node) return;
  node.innerHTML = [
    `<span class="mobile-originals-status-pill">${escapeHtml(appText)}</span>`,
    `<span class="mobile-originals-status-pill">${escapeHtml(folderText)}</span>`,
  ].join("");
}

function setMobileOriginalsFolderStatusText(text) {
  const node = document.querySelector("#mobileOriginalsFolderStatus");
  if (node) node.textContent = text;
}

async function refreshMobileOriginalsStatus(options = {}) {
  const node = document.querySelector("#mobileOriginalsStatus");
  if (!node) return 0;
  const token = state.mobileOriginalsStatusToken + 1;
  state.mobileOriginalsStatusToken = token;
  if (!options.quiet) setMobileOriginalsStatusParts("V appce: počítám...", "Ve složce: počítám...");
  const counts = await mobileOriginalsStatusCounts().catch(() => null);
  if (!counts) {
    if (state.mobileOriginalsStatusToken === token) setMobileOriginalsStatusParts("V appce: nejde spočítat", "Ve složce: nejde spočítat");
    return 0;
  }
  if (state.mobileOriginalsStatusToken === token) {
    const appText = `V appce: ${counts.stored}/${counts.total}`;
    const cachedFolder = await getMobileOriginalsFolderCountCache(counts.total).catch(() => null);
    const folderName = await getMobileOriginalsFolderName().catch(() => "");
    setMobileOriginalsStatusParts(appText, cachedFolder ? `Ve složce: ${cachedFolder.count}/${counts.total}` : "Ve složce: kontroluji...");
    countMobileOriginalFolderFiles(counts.plan, { timeoutMs: 8000 })
      .then((folder) => {
        if (state.mobileOriginalsStatusToken !== token) return;
        if (folder === null) {
          const fallbackText = folderName
            ? "Ve složce: ověř tlačítkem"
            : "Ve složce: nevybraná";
          setMobileOriginalsStatusParts(appText, cachedFolder ? `Ve složce: ${cachedFolder.count}/${counts.total}` : fallbackText);
          return;
        }
        rememberMobileOriginalsFolderCount(folder, counts.total).catch(() => {});
        setMobileOriginalsStatusParts(appText, `Ve složce: ${folder}/${counts.total}`);
      })
      .catch(() => {
        if (state.mobileOriginalsStatusToken === token) {
          setMobileOriginalsStatusParts(appText, cachedFolder ? `Ve složce: ${cachedFolder.count}/${counts.total}` : "Ve složce: kontrola trvá");
        }
      });
  }
  refreshMobileOriginalsFolderStatus().catch(() => {});
  return counts.stored;
}

async function getMobileOriginalsFolderName() {
  const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, MOBILE_ORIGINALS_FOLDER_HANDLE_ID);
  return clean(record?.name || record?.directoryHandle?.name);
}

async function getMobileOriginalsFolderCountCache(total = 0) {
  const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, MOBILE_ORIGINALS_FOLDER_COUNT_ID);
  const count = wholeNumber(record?.count, -1);
  const expectedTotal = wholeNumber(record?.total, -1);
  if (count < 0 || expectedTotal !== total) return null;
  return { count, total: expectedTotal };
}

async function rememberMobileOriginalsFolderCount(count, total) {
  if (count < 0 || total < 0) return;
  await idbPut(await openPhotoDb(), PHOTO_BLOB_STORE, {
    id: MOBILE_ORIGINALS_FOLDER_COUNT_ID,
    count,
    total,
    updatedAt: new Date().toISOString(),
  });
}

async function refreshMobileOriginalsFolderStatus() {
  const node = document.querySelector("#mobileOriginalsFolderStatus");
  if (!node) return;
  if (!mobileOriginalsFolderSupported()) {
    setMobileOriginalsFolderStatusText("Složka: telefon výběr složky nepovoluje");
    return;
  }
  const name = await getMobileOriginalsFolderName();
  setMobileOriginalsFolderStatusText(name ? `Složka: ${name}` : "Složka: nevybraná");
}

async function getMobileOriginalsFolderHandle(options = {}) {
  if (!mobileOriginalsFolderSupported()) return null;
  const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, MOBILE_ORIGINALS_FOLDER_HANDLE_ID);
  const handle = record?.directoryHandle;
  if (!handle) return null;
  try {
    if (typeof handle.queryPermission === "function") {
      let permission = await handle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted" && options.requestPermission && typeof handle.requestPermission === "function") {
        permission = await handle.requestPermission({ mode: "readwrite" });
      }
      if (permission !== "granted") return null;
    }
    return handle;
  } catch {
    return null;
  }
}

async function pickMobileOriginalsFolder() {
  if (!mobileOriginalsFolderSupported()) {
    toast("Telefon výběr složky pro webovou appku nepovoluje.");
    refreshMobileOriginalsStatus({ quiet: true }).catch(() => {});
    return false;
  }
  try {
    const directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    await idbPut(await openPhotoDb(), PHOTO_BLOB_STORE, {
      id: MOBILE_ORIGINALS_FOLDER_HANDLE_ID,
      directoryHandle,
      name: clean(directoryHandle?.name),
      pickedAt: new Date().toISOString(),
    });
    toast("Složka pro originály uložená. Teď ji appka ověřuje.");
    await refreshMobileOriginalsStatus({ quiet: true });
    await exportMobileOriginalsToFolder();
    return true;
  } catch (error) {
    if (error?.name !== "AbortError") toast(`Složku se nepodařilo vybrat: ${friendlySyncError(error)}`);
    refreshMobileOriginalsStatus({ quiet: true }).catch(() => {});
    return false;
  }
}

async function writeMobileOriginalToFolder(directoryHandle, entry, file, options = {}) {
  if (!directoryHandle || !file) return false;
  const fileName = mobileOriginalFolderFileName(entry);
  if (options.skipExisting) {
    try {
      const existingHandle = await directoryHandle.getFileHandle(fileName);
      const existingFile = await existingHandle.getFile();
      if (existingFile && existingFile.size >= 0) return "exists";
    } catch {
      // Soubor ve složce zatím není, zapíšeme ho.
    }
  }
  const folderFile = await createMobileOriginalFolderFile(file, entry);
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(folderFile);
  } finally {
    await writable.close();
  }
  return true;
}

function mobileOriginalFolderFileName(entry = {}) {
  return clean(entry.fileName).replace(/\.[a-z0-9]+$/i, ".jpg") || `${safeFileName(entry.ownerName, "fotka")}.jpg`;
}

async function countMobileOriginalFolderFiles(plan = buildSupabaseOriginalDownloadPlan(state.data), options = {}) {
  const snapshot = await mobileOriginalFolderSnapshot(plan, options);
  return snapshot ? snapshot.count : null;
}

async function mobileOriginalFolderSnapshot(plan = buildSupabaseOriginalDownloadPlan(state.data), options = {}) {
  const timeoutMs = wholeNumber(options.timeoutMs, 0);
  if (timeoutMs > 0) {
    return Promise.race([
      mobileOriginalFolderSnapshot(plan, { ...options, timeoutMs: 0 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("folder-count-timeout")), timeoutMs)),
    ]);
  }
  const directoryHandle = await getMobileOriginalsFolderHandle({ requestPermission: !!options.requestPermission });
  if (!directoryHandle) return null;
  let count = 0;
  const missing = [];
  for (const entry of plan) {
    try {
      const fileHandle = await directoryHandle.getFileHandle(mobileOriginalFolderFileName(entry));
      const file = await fileHandle.getFile();
      if (file && Number(file.size) >= 0) count += 1;
    } catch {
      missing.push(entry);
    }
  }
  return { count, missing };
}

async function createMobileOriginalFolderFile(file, entry = {}) {
  if (!file?.type?.startsWith("image/")) return file;
  let objectUrl = "";
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await loadCanvasImage(objectUrl);
    if (!image) return file;
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) return file;
    const maxEdge = 4096;
    const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const label = clean(entry.ownerName) || "Africké kopřivy";
    const padding = Math.max(22, Math.round(width * 0.036));
    const fontSize = Math.max(34, Math.min(76, Math.round(width * 0.055)));
    const lineHeight = Math.round(fontSize * 1.15);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.font = `900 ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    const lines = wrapCanvasText(context, label, width - padding * 2.4).slice(0, 2);
    const footerHeight = Math.max(Math.round(width * 0.13), Math.ceil(padding * 1.45 + lines.length * lineHeight));
    canvas.width = width;
    canvas.height = height + footerHeight;
    context.fillStyle = "#fbf7e9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, width, height);
    const gradient = context.createLinearGradient(0, height, width, canvas.height);
    gradient.addColorStop(0, "#fff8e9");
    gradient.addColorStop(1, "#dff4df");
    context.fillStyle = gradient;
    context.fillRect(0, height, width, footerHeight);
    context.strokeStyle = "#95c49f";
    context.lineWidth = Math.max(2, Math.round(width * 0.004));
    context.beginPath();
    context.moveTo(0, height + 1);
    context.lineTo(width, height + 1);
    context.stroke();

    context.fillStyle = "#0d3b2d";
    context.font = `900 ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    lines.forEach((line, index) => {
      context.fillText(line, width / 2, height + padding * 0.75 + fontSize + index * lineHeight);
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
    if (!blob) return file;
    return new File([blob], clean(entry.fileName).replace(/\.[a-z0-9]+$/i, ".jpg") || `${safeFileName(label, "fotka")}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

async function exportMobileOriginalsToFolder() {
  const directoryHandle = await getMobileOriginalsFolderHandle({ requestPermission: true });
  if (!directoryHandle) return { copied: 0, failed: 0, skipped: 0 };
  const plan = buildSupabaseOriginalDownloadPlan(state.data);
  const snapshot = await mobileOriginalFolderSnapshot(plan, { requestPermission: true, timeoutMs: 20000 }).catch(() => null);
  const entriesToProcess = snapshot?.missing?.length ? snapshot.missing : [];
  if (snapshot && !entriesToProcess.length) {
    await rememberMobileOriginalsFolderCount(snapshot.count, plan.length).catch(() => {});
    await refreshMobileOriginalsStatus({ quiet: true }).catch(() => {});
    toast(`Složka ověřená. Už tam je ${snapshot.count}/${plan.length} fotek.`);
    return { copied: 0, failed: 0, skipped: 0, alreadyInFolder: snapshot.count };
  }
  let copied = 0;
  let failed = 0;
  let skipped = 0;
  let alreadyInFolder = snapshot?.count || 0;
  for (const entry of entriesToProcess) {
    let file = await getLocalSupabaseOriginalFile(entry.ref, entry.ownerName);
    if (!file) {
      file = await supabasePhotoRefToFile(entry.ref, entry.ownerName);
      if (file) {
        try {
          await saveLocalSupabaseOriginal(entry.ref, file, {
            fileName: entry.fileName,
            ownerName: entry.ownerName,
            path: entry.path,
          });
        } catch {
          // I kdyby mobilní úložiště nešlo doplnit, složku zkusíme zapsat.
        }
      }
    }
    if (!file) {
      skipped += 1;
      continue;
    }
    try {
      const result = await writeMobileOriginalToFolder(directoryHandle, entry, file, { skipExisting: true });
      if (result === "exists") alreadyInFolder += 1;
      else if (result) copied += 1;
    } catch {
      failed += 1;
    }
  }
  await rememberMobileOriginalsFolderCount(copied + alreadyInFolder, plan.length).catch(() => {});
  await refreshMobileOriginalsStatus({ quiet: true }).catch(() => {});
  if (copied || failed) toast(failed ? `Do složky se uložilo ${copied}, chyba ${failed}.` : `Do složky doplněno ${copied}, už tam bylo ${alreadyInFolder}.`);
  else toast(`Složka ověřená. Už tam je ${alreadyInFolder}/${plan.length} fotek.`);
  return { copied, failed, skipped, alreadyInFolder };
}

async function saveLocalSupabaseOriginal(ref, file, options = {}) {
  const key = localSupabaseOriginalKey(ref);
  if (!key || !file) return false;
  const storedFile = file instanceof File ? file : new File([file], clean(options.fileName) || "fotka.jpg", { type: file?.type || "image/jpeg" });
  await idbPut(await openPhotoDb(), PHOTO_BLOB_STORE, {
    id: key,
    blob: storedFile,
    name: clean(options.fileName) || clean(storedFile.name) || "fotka.jpg",
    type: clean(options.type) || clean(storedFile.type) || "image/jpeg",
    size: Number(storedFile.size) || 0,
    ownerName: clean(options.ownerName),
    path: clean(options.path) || parseSupabasePhotoRef(ref),
    sourceRef: clean(ref),
    downloadedAt: new Date().toISOString(),
  });
  return true;
}

async function fetchSupabasePhotoObjectUrl(path, ref = "") {
  const cleanPath = clean(path);
  if (!cleanPath) return "";
  try {
    const session = await ensureSession();
    const config = loadSyncConfig();
    const response = await fetch(`${config.url.replace(/\/+$/, "")}/storage/v1/object/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(cleanPath)}`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    if (!response.ok) return "";
    const blob = await response.blob();
    if (ref) cacheSupabasePhotoBlob(ref, blob, cleanPath).catch(() => {});
    return URL.createObjectURL(blob);
  } catch {
    return "";
  }
}

async function getCachedSupabasePhotoBlob(ref, options = {}) {
  const key = supabasePhotoCacheKey(ref, options);
  if (!key) return null;
  try {
    const db = await openPhotoDb();
    const record = await idbGet(db, PHOTO_BLOB_STORE, key);
    if (record?.blob) {
      record.lastAccessedAt = new Date().toISOString();
      idbPut(db, PHOTO_BLOB_STORE, record).catch(() => {});
    }
    return record?.blob || null;
  } catch {
    return null;
  }
}

async function cacheSupabasePhotoBlob(ref, blob, path = "", options = {}) {
  const key = supabasePhotoCacheKey(ref, options);
  if (!key || !blob) return;
  const size = Number(blob.size) || 0;
  const canCache = options.prepared || options.allowLarge || isSupabaseThumbnailPath(path) || size <= SUPABASE_PHOTO_CACHE_MAX_SINGLE_BYTES;
  if (!canCache) return;
  await idbPut(await openPhotoDb(), PHOTO_BLOB_STORE, {
    id: key,
    blob,
    name: clean(path).split("/").pop() || "fotka.jpg",
    type: blob.type || "image/jpeg",
    size,
    path: clean(path),
    prepared: Boolean(options.prepared),
    cachedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  });
  pruneSupabasePhotoCache().catch(() => {});
}

function supabasePhotoCacheKey(ref, options = {}) {
  const value = clean(ref);
  const prefix = options.prepared ? SUPABASE_PREPARED_PHOTO_CACHE_PREFIX : SUPABASE_PHOTO_CACHE_PREFIX;
  return value && value.startsWith(SUPABASE_PHOTO_PREFIX) ? `${prefix}${value}` : "";
}

async function pruneSupabasePhotoCache() {
  const db = await openPhotoDb();
  const records = (await idbGetAll(db, PHOTO_BLOB_STORE))
    .filter((record) => clean(record?.id).startsWith(SUPABASE_PHOTO_CACHE_PREFIX) || clean(record?.id).startsWith(SUPABASE_PREPARED_PHOTO_CACHE_PREFIX))
    .map((record) => ({ ...record, size: Number(record.size || record.blob?.size || record.file?.size) || 0 }));
  let total = records.reduce((sum, record) => sum + record.size, 0);
  let count = records.length;
  if (total <= SUPABASE_PHOTO_CACHE_MAX_BYTES && count <= SUPABASE_PHOTO_CACHE_MAX_ITEMS) return;
  records.sort((a, b) => clean(a.lastAccessedAt || a.cachedAt).localeCompare(clean(b.lastAccessedAt || b.cachedAt)));
  for (const record of records) {
    if (total <= SUPABASE_PHOTO_CACHE_MAX_BYTES && count <= SUPABASE_PHOTO_CACHE_MAX_ITEMS) break;
    await idbDelete(db, PHOTO_BLOB_STORE, record.id);
    total -= record.size;
    count -= 1;
  }
}

async function photoToFile(ref, ownerName = "fotka") {
  const value = clean(ref);
  if (!value) return null;
  if (value.startsWith(INDEXED_PHOTO_PREFIX)) {
    const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, value.slice(INDEXED_PHOTO_PREFIX.length));
    return record?.blob ? new File([record.blob], record.name || `${safeFileName(ownerName)}.jpg`, { type: record.type || record.blob.type || "image/jpeg" }) : null;
  }
  if (value.startsWith("data:image/")) return dataUrlToFile(value, `${safeFileName(ownerName)}.jpg`);
  if (value.startsWith(SUPABASE_PHOTO_PREFIX)) return getLocalSupabaseOriginalFile(value, ownerName);
  return null;
}

function loadSyncConfig() {
  try {
    return normalizeSyncConfig(JSON.parse(localStorage.getItem(SUPABASE_SYNC_CONFIG_KEY) || "{}"));
  } catch {
    return normalizeSyncConfig();
  }
}

function saveSyncConfig(config) {
  localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(normalizeSyncConfig({ ...loadSyncConfig(), ...config })));
}

function normalizeSyncConfig(parsed = {}) {
  const storedUrl = clean(parsed.url);
  const storedAnonKey = clean(parsed.anonKey);
  const useManagedDefaults = !storedUrl || LEGACY_MANAGED_SUPABASE_URLS.includes(storedUrl);
  return {
    url: useManagedDefaults ? DEFAULT_SUPABASE_URL : storedUrl,
    anonKey: useManagedDefaults ? DEFAULT_SUPABASE_ANON_KEY : (storedAnonKey || DEFAULT_SUPABASE_ANON_KEY),
    email: clean(parsed.email),
    autoSync: Boolean(parsed.autoSync),
    lastPulledAt: clean(parsed.lastPulledAt),
    lastPushedAt: clean(parsed.lastPushedAt),
    lastSyncedAt: clean(parsed.lastSyncedAt),
    lastKnownCloudAt: clean(parsed.lastKnownCloudAt),
    lastKnownCloudSummary: normalizeSyncSummary(parsed.lastKnownCloudSummary),
  };
}

function migrateSyncConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUPABASE_SYNC_CONFIG_KEY) || "{}");
    const normalized = normalizeSyncConfig(parsed);
    const storedUrl = clean(parsed.url);
    const storedAnonKey = clean(parsed.anonKey);
    const changed = storedUrl !== normalized.url
      || storedAnonKey !== normalized.anonKey
      || clean(parsed.email) !== normalized.email
      || Boolean(parsed.autoSync) !== normalized.autoSync
      || clean(parsed.lastPulledAt) !== normalized.lastPulledAt
      || clean(parsed.lastPushedAt) !== normalized.lastPushedAt
      || clean(parsed.lastSyncedAt) !== normalized.lastSyncedAt
      || clean(parsed.lastKnownCloudAt) !== normalized.lastKnownCloudAt
      || JSON.stringify(normalizeSyncSummary(parsed.lastKnownCloudSummary)) !== JSON.stringify(normalized.lastKnownCloudSummary);
    if (!changed) return;
    localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(normalized));
    if (storedUrl && (storedUrl !== normalized.url || storedAnonKey !== normalized.anonKey)) {
      localStorage.removeItem(SUPABASE_SYNC_SESSION_KEY);
    }
  } catch {
    localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(normalizeSyncConfig()));
  }
}

function saveSyncConfigFromInputs() {
  const passwordInput = document.querySelector("#syncPassword");
  const config = {
    url: clean(document.querySelector("#syncUrl")?.value) || DEFAULT_SUPABASE_URL,
    anonKey: clean(document.querySelector("#syncAnon")?.value) || DEFAULT_SUPABASE_ANON_KEY,
    email: clean(document.querySelector("#syncEmail")?.value) || loadSyncConfig().email,
    autoSync: true,
  };
  state.syncPassword = passwordInput ? clean(passwordInput.value) : clean(state.syncPassword || localStorage.getItem(SUPABASE_SYNC_PASSWORD_KEY));
  if (passwordInput) state.syncVerifiedPassword = "";
  sessionStorage.setItem(`${STORE_KEY}:sync-password`, state.syncPassword);
  if (state.syncPassword) localStorage.setItem(SUPABASE_SYNC_PASSWORD_KEY, state.syncPassword);
  else localStorage.removeItem(SUPABASE_SYNC_PASSWORD_KEY);
  saveSyncConfig(config);
}

function loadSyncSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUPABASE_SYNC_SESSION_KEY) || "{}");
    return { accessToken: clean(parsed.accessToken), refreshToken: clean(parsed.refreshToken), expiresAt: Number(parsed.expiresAt) || 0, user: parsed.user || null };
  } catch {
    return { accessToken: "", refreshToken: "", expiresAt: 0, user: null };
  }
}

function isSyncLoggedIn() {
  const session = loadSyncSession();
  return Boolean(session.accessToken || session.refreshToken);
}

function saveSyncSession(session) {
  localStorage.setItem(SUPABASE_SYNC_SESSION_KEY, JSON.stringify({ accessToken: session.access_token, refreshToken: session.refresh_token || "", expiresAt: Date.now() + (Number(session.expires_in) || 3600) * 1000 - 30000, user: session.user || null }));
  saveSyncConfig({ autoSync: true });
}

async function loginSync() {
  saveSyncConfigFromInputs();
  const email = clean(document.querySelector("#syncEmail")?.value);
  const password = clean(document.querySelector("#syncLoginPassword")?.value);
  if (!email || !password) return toast("DoplĹ email a heslo.");
  try {
    updateSyncIndicator("working");
    const result = await authRequest("/auth/v1/token?grant_type=password", { email, password });
    saveSyncSession(result);
    const verified = await pullSync({ silent: true, verify: true });
    if (verified === false) {
      if (hasLocalData() && window.confirm("Cloud nejde pĹ™eÄŤĂ­st tĂ­mto ĹˇifrovacĂ­m heslem. Pokud jsou data v mobilu sprĂˇvnĂˇ, pĹ™epsat cloud daty z mobilu?")) {
        state.syncVerifiedPassword = state.syncPassword;
        const repaired = await pushSync({ silent: true, force: true });
        if (repaired) {
          toast("Cloud opravenĂ˝ z mobilu.");
          state.view = "offers";
          render();
          return;
        }
      }
      toast("PĹ™ihlĂˇĹˇeno, ale cloud nejde deĹˇifrovat.");
      render();
      return;
    }
    toast("PĹ™ihlĂˇĹˇeno.");
    state.view = "offers";
    render();
    maybeAutoPull();
  } catch (error) {
    console.error(error);
    updateSyncIndicator("error");
    toast(`PĹ™ihlĂˇĹˇenĂ­ selhalo: ${friendlySyncError(error)}`);
  }
}

function logoutSync() {
  localStorage.removeItem(SUPABASE_SYNC_SESSION_KEY);
  state.photoUrls.clear();
  state.view = "sync";
  toast("OdhlĂˇĹˇeno.");
  render();
}

async function pushSync(options = {}) {
  saveSyncConfigFromInputs();
  if (!state.syncPassword) return toast("DoplĹ ĹˇifrovacĂ­ heslo.");
  if (state.syncRunning) {
    markSyncDirty();
    return false;
  }
  state.syncTimer = null;
  state.syncRunning = true;
  const startedRevision = state.syncRevision;
  const startedDirtyAt = currentSyncDirtyAt();
  const syncedAt = new Date().toISOString();
  try {
    updateSyncIndicator("working");
    const session = await ensureSession();
    if (!options.force && state.syncVerifiedPassword !== state.syncPassword) {
      const verified = await verifySyncPassword(state.syncPassword, session);
      if (verified !== true) {
        updateSyncIndicator("error");
        if (!options.silent) toast(verified === false ? "Ĺ ifrovacĂ­ heslo nesedĂ­." : "Cloud nejde ovÄ›Ĺ™it.");
        return false;
      }
      state.syncVerifiedPassword = state.syncPassword;
    }
    const configBeforePush = loadSyncConfig();
    let cloudState = { updatedAt: "", data: null, summary: normalizeSyncSummary() };
    if (!options.force) {
      cloudState = await readCloudState(session, state.syncPassword);
      if (cloudState.data) rememberSyncSnapshot(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY, "cloud-before-push", cloudState.data, cloudState.updatedAt);
    }
    const localSummary = summarizeSyncData(state.data);
    const blockMessage = options.force ? "" : getSyncPushBlockMessage(
      localSummary,
      cloudState.summary,
      configBeforePush.lastKnownCloudSummary,
      configBeforePush.lastKnownCloudAt,
      cloudState.updatedAt,
      { allowConfirm: !options.auto && !options.silent },
    );
    if (blockMessage) {
      state.syncProblem = blockMessage;
      updateSyncIndicator("error");
      if (!options.silent) toast(blockMessage);
      return false;
    }
    rememberSyncSnapshot(SUPABASE_SYNC_LAST_LOCAL_SNAPSHOT_KEY, "local-before-push", state.data);
    const data = await buildSyncData(session.user?.id || "user");
    const pushedSummary = summarizeSyncData(data);
    const encrypted = await encryptPayload(data, state.syncPassword);
    const updatedAt = new Date().toISOString();
    await supabaseRequest("/rest/v1/app_sync?on_conflict=user_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: { user_id: session.user?.id, encrypted_data: encrypted, updated_at: updatedAt } });
    state.syncVerifiedPassword = state.syncPassword;
    cleanupStorage(session.user?.id || "user", collectPhotoPaths(data)).catch((error) => console.warn("Storage cleanup skipped", error));
    saveSyncConfig({ lastPushedAt: updatedAt, lastSyncedAt: syncedAt, lastKnownCloudAt: updatedAt, lastKnownCloudSummary: pushedSummary });
    rememberSyncSnapshot(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY, "cloud-after-push", data, updatedAt);
    clearSyncDirtyIfUnchanged(startedDirtyAt, startedRevision);
    state.syncProblem = "";
    updateSyncIndicator();
    if (!options.silent) toast("OdeslĂˇno do cloudu.");
    return true;
  } catch (error) {
    console.error(error);
    state.syncProblem = friendlySyncError(error);
    updateSyncIndicator("error");
    if (!options.silent) toast(`OdeslĂˇnĂ­ selhalo: ${friendlySyncError(error)}`);
    return false;
  } finally {
    state.syncRunning = false;
    if (hasPendingSync() && loadSyncConfig().autoSync) scheduleAutoSync();
  }
}

async function pullSync(options = {}) {
  saveSyncConfigFromInputs();
  if (!state.syncPassword) return toast("DoplĹ ĹˇifrovacĂ­ heslo.");
  if (!options.verify && hasPendingSync()) {
    updateSyncIndicator();
    if (loadSyncConfig().autoSync && !state.syncTimer) scheduleAutoSync();
    if (!options.silent) toast("NejdĹ™Ă­v odeĹˇli lokĂˇlnĂ­ zmÄ›ny do cloudu.");
    return false;
  }
  try {
    updateSyncIndicator("working");
    const session = await ensureSession();
    const syncedAt = new Date().toISOString();
    const metadataOnly = Boolean(options.auto && !options.verify);
    let rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=${metadataOnly ? "updated_at" : "encrypted_data,updated_at"}`, { method: "GET" });
    let cloudUpdatedAt = clean(rows?.[0]?.updated_at);
    if (metadataOnly && state.syncVerifiedPassword === state.syncPassword && cloudUpdatedAt && cloudUpdatedAt === loadSyncConfig().lastPulledAt) {
      saveSyncConfig({ lastSyncedAt: syncedAt });
      updateSyncIndicator();
      return true;
    }
    if (metadataOnly && cloudUpdatedAt) {
      rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=encrypted_data,updated_at`, { method: "GET" });
      cloudUpdatedAt = clean(rows?.[0]?.updated_at);
    }
    if (!rows?.[0]?.encrypted_data) {
      saveSyncConfig({ lastSyncedAt: syncedAt });
      if (!options.silent) toast("V cloudu zatĂ­m nejsou data.");
      updateSyncIndicator();
      return true;
    }
    const hadLocalData = hasLocalData();
    if (hadLocalData) rememberSyncSnapshot(SUPABASE_SYNC_LAST_LOCAL_SNAPSHOT_KEY, "local-before-pull", state.data);
    state.data = normalizeLoadedData(await decryptPayload(rows[0].encrypted_data, state.syncPassword));
    syncFinishedCrossVarieties();
    state.syncVerifiedPassword = state.syncPassword;
    saveData({ skipAutoSync: true });
    if (!hadLocalData && state.view === "sync" && hasLocalData()) state.view = "offers";
    const pulledSummary = summarizeSyncData(state.data);
    saveSyncConfig({ lastPulledAt: cloudUpdatedAt, lastSyncedAt: syncedAt, lastKnownCloudAt: cloudUpdatedAt, lastKnownCloudSummary: pulledSummary });
    rememberSyncSnapshot(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY, "cloud-after-pull", state.data, cloudUpdatedAt);
    render();
    updateSyncIndicator();
    if (!options.silent) toast("StaĹľeno z cloudu.");
    return true;
  } catch (error) {
    console.error(error);
    state.syncVerifiedPassword = "";
    updateSyncIndicator("error");
    if (!options.silent) toast(`StaĹľenĂ­ selhalo: ${isSyncDecryptError(error) ? "cloud je zaĹˇifrovanĂ˝ jinĂ˝m heslem" : friendlySyncError(error)}`);
    return false;
  }
}

function hasLocalData() {
  return Boolean((state.data.customers || []).length || (state.data.orders || []).length || (state.data.varieties || []).length || (state.data.offers || []).length || (state.data.crosses || []).length);
}

function needsSyncRecovery() {
  return isSyncLoggedIn() && !hasLocalData();
}

async function verifySyncPassword(password, session = null) {
  try {
    const activeSession = session || await ensureSession();
    const rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(activeSession.user?.id)}&select=encrypted_data`, { method: "GET" });
    const encrypted = rows?.[0]?.encrypted_data;
    if (!encrypted) return true;
    await decryptPayload(encrypted, password);
    return true;
  } catch (error) {
    return isSyncDecryptError(error) ? false : null;
  }
}

function isSyncDecryptError(error) {
  const name = clean(error?.name);
  const message = clean(error?.message || String(error || ""));
  return /OperationError|decrypt|cipher|authentication|Unable to decrypt/i.test(`${name} ${message}`);
}

function toggleAutoSync() {
  saveSyncConfigFromInputs();
  const next = !loadSyncConfig().autoSync;
  saveSyncConfig({ autoSync: next });
  toast(next ? "AutomatickĂ˝ sync zapnutĂ˝." : "AutomatickĂ˝ sync vypnutĂ˝.");
  render();
  if (next) maybeAutoPull();
}

function updateSyncIndicator(status = "") {
  if (!els.syncIndicator) return;
  const config = loadSyncConfig();
  const session = loadSyncSession();
  const last = latestSyncTimestamp(config.lastSyncedAt, config.lastPulledAt, config.lastPushedAt);
  const lastLabel = formatSyncIndicatorTime(last);
  const hasProblem = Boolean(clean(state.syncProblem) && hasPendingSync());
  let text = session.accessToken && config.autoSync ? (lastLabel ? `Syncnuto ${lastLabel}` : "Sync připravený") : "Sync vypnutý";
  let stateClass = session.accessToken && config.autoSync ? "ok" : "off";
  if (status === "working") {
    text = "Syncuji...";
    stateClass = "working";
  } else if (status === "error" || hasProblem) {
    text = "Sync chyba";
    stateClass = "error";
  } else if (hasPendingSync()) {
    text = "Čeká na sync";
    stateClass = "working";
  }
  els.syncIndicator.textContent = text;
  els.syncIndicator.dataset.status = stateClass;
}

function latestSyncTimestamp(...values) {
  return values
    .map(clean)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || "";
}

function normalizeSyncSummary(parsed = {}) {
  return {
    customers: Math.max(0, Number(parsed?.customers) || 0),
    orders: Math.max(0, Number(parsed?.orders) || 0),
    varieties: Math.max(0, Number(parsed?.varieties) || 0),
    crosses: Math.max(0, Number(parsed?.crosses) || 0),
    offers: Math.max(0, Number(parsed?.offers) || 0),
  };
}

function summarizeSyncData(data) {
  return normalizeSyncSummary({
    customers: Array.isArray(data?.customers) ? data.customers.length : 0,
    orders: Array.isArray(data?.orders) ? data.orders.length : 0,
    varieties: Array.isArray(data?.varieties) ? data.varieties.length : 0,
    crosses: Array.isArray(data?.crosses) ? data.crosses.length : 0,
    offers: Array.isArray(data?.offers) ? data.offers.length : 0,
  });
}

function syncSummaryHasData(summary) {
  const normalized = normalizeSyncSummary(summary);
  return Boolean(normalized.customers || normalized.orders || normalized.varieties || normalized.crosses || normalized.offers);
}

function isSyncSummarySmaller(localSummary, cloudSummary) {
  const local = normalizeSyncSummary(localSummary);
  const cloud = normalizeSyncSummary(cloudSummary);
  return local.varieties + 2 < cloud.varieties
    || local.crosses + 1 < cloud.crosses
    || local.orders + 1 < cloud.orders
    || local.offers < cloud.offers
    || local.customers + 3 < cloud.customers;
}

function formatSyncSummary(summary) {
  const normalized = normalizeSyncSummary(summary);
  return `${normalized.varieties} odrůd, ${normalized.crosses} křížení, ${normalized.orders} objednávek, ${normalized.offers} nabídek`;
}

function rememberSyncSnapshot(storageKey, kind, data, updatedAt = "") {
  try {
    const normalized = normalizeLoadedData(JSON.parse(JSON.stringify(data || { customers: [], orders: [], varieties: [], crosses: [], offers: [], exchangeRates: [], settings: {} })));
    localStorage.setItem(storageKey, JSON.stringify({
      kind,
      savedAt: new Date().toISOString(),
      updatedAt: clean(updatedAt),
      summary: summarizeSyncData(normalized),
      data: normalized,
    }));
  } catch {
    // Když se snapshot nevejde, samotný sync musí běžet dál.
  }
}

async function readCloudState(session, encryptionPassword) {
  const rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=encrypted_data,updated_at`, { method: "GET" });
  const updatedAt = clean(rows?.[0]?.updated_at);
  const encrypted = rows?.[0]?.encrypted_data;
  if (!encrypted) return { updatedAt, data: null, summary: normalizeSyncSummary() };
  const decrypted = normalizeLoadedData(await decryptPayload(encrypted, encryptionPassword));
  return {
    updatedAt,
    data: decrypted,
    summary: summarizeSyncData(decrypted),
  };
}

function getSyncPushBlockMessage(localSummary, cloudSummary, knownCloudSummary, knownCloudAt = "", liveCloudAt = "", options = {}) {
  const local = normalizeSyncSummary(localSummary);
  const liveCloud = normalizeSyncSummary(cloudSummary);
  const knownCloud = normalizeSyncSummary(knownCloudSummary);
  const smallerThanLiveCloud = syncSummaryHasData(liveCloud) && isSyncSummarySmaller(local, liveCloud);
  const smallerThanKnownCloud = syncSummaryHasData(knownCloud) && isSyncSummarySmaller(local, knownCloud);
  const sameKnownCloud = Boolean(clean(knownCloudAt) && clean(liveCloudAt) && clean(knownCloudAt) === clean(liveCloudAt));
  if (smallerThanLiveCloud && (!clean(knownCloudAt) || !sameKnownCloud)) {
    return `Cloud má víc dat než tenhle mobil (${formatSyncSummary(liveCloud)} vs ${formatSyncSummary(local)}). Odeslání jsem radši zastavila, aby se nic nesmazalo.`;
  }
  if (sameKnownCloud && smallerThanKnownCloud) {
    const question = `Tenhle mobil má teď míň dat než poslední dobrý cloud (${formatSyncSummary(knownCloud)} vs ${formatSyncSummary(local)}). Opravdu tím chceš přepsat cloud?`;
    if (options.allowConfirm && window.confirm(question)) return "";
    return `Tenhle mobil má teď míň dat než poslední dobrý cloud (${formatSyncSummary(knownCloud)} vs ${formatSyncSummary(local)}). Odeslání jsem radši zastavila.`;
  }
  return "";
}

function formatSyncIndicatorTime(value = "") {
  const raw = clean(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (!Number.isFinite(date.getTime())) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  const time = formatTime(date);
  if (diffDays === 0) return `dnes v ${time}`;
  if (diffDays === 1) return `včera v ${time}`;
  return `${formatDate(toDateInput(date))} v ${time}`;
}

function currentSyncDirtyAt() {
  try {
    return clean(localStorage.getItem(SUPABASE_SYNC_DIRTY_KEY));
  } catch {
    return "";
  }
}

function lastCloudSnapshotMatchesLocalData() {
  try {
    const raw = clean(localStorage.getItem(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY));
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const emptyData = { customers: [], orders: [], varieties: [], crosses: [], offers: [], exchangeRates: [], settings: {} };
    const snapshot = normalizeLoadedData(JSON.parse(JSON.stringify(parsed?.data || emptyData)));
    const current = normalizeLoadedData(JSON.parse(JSON.stringify(state.data || emptyData)));
    return JSON.stringify(snapshot) === JSON.stringify(current);
  } catch {
    return false;
  }
}

function tryClearStaleSyncDirtyFlag() {
  const dirtyAt = currentSyncDirtyAt();
  if (!dirtyAt) return false;
  if (lastCloudSnapshotMatchesLocalData()) {
    state.syncDirty = false;
    try {
      localStorage.removeItem(SUPABASE_SYNC_DIRTY_KEY);
    } catch {
      // ignore localStorage availability issues
    }
    return true;
  }
  const config = loadSyncConfig();
  const lastSyncedAt = latestSyncTimestamp(config.lastSyncedAt, config.lastPushedAt, config.lastPulledAt);
  if (!lastSyncedAt) return false;
  const dirtyMs = new Date(dirtyAt).getTime();
  const syncedMs = new Date(lastSyncedAt).getTime();
  if (!Number.isFinite(dirtyMs) || !Number.isFinite(syncedMs) || syncedMs < dirtyMs) return false;
  state.syncDirty = false;
  try {
    localStorage.removeItem(SUPABASE_SYNC_DIRTY_KEY);
  } catch {
    // ignore localStorage availability issues
  }
  return true;
}

function hasPendingSync() {
  tryClearStaleSyncDirtyFlag();
  return Boolean(state.syncDirty || currentSyncDirtyAt());
}

function markSyncDirty() {
  state.syncDirty = true;
  try {
    localStorage.setItem(SUPABASE_SYNC_DIRTY_KEY, new Date().toISOString());
  } catch {
    // In-memory dirty state still protects this tab if storage is unavailable.
  }
}

function clearSyncDirtyIfUnchanged(startedDirtyAt = "", startedRevision = state.syncRevision) {
  const currentDirtyAt = currentSyncDirtyAt();
  if (state.syncRevision !== startedRevision || (currentDirtyAt && currentDirtyAt !== startedDirtyAt)) {
    state.syncDirty = true;
    return false;
  }
  state.syncDirty = false;
  try {
    localStorage.removeItem(SUPABASE_SYNC_DIRTY_KEY);
  } catch {
    // ignore localStorage availability issues
  }
  return true;
}

function scheduleAutoSync() {
  if (!loadSyncConfig().autoSync) return;
  clearTimeout(state.syncTimer);
  state.syncTimer = setTimeout(() => {
    state.syncTimer = null;
    pushSync({ silent: true });
  }, 5000);
}

async function maybeAutoPull(options = {}) {
  const config = loadSyncConfig();
  if (!config.autoSync || !state.syncPassword || state.syncRunning || document.visibilityState === "hidden") return;
  const now = Date.now();
  if (!options.force && now - Number(state.lastAutoPullAt || 0) < AUTO_PULL_MIN_GAP_MS) return;
  if (hasPendingSync()) {
    if (!state.syncTimer) scheduleAutoSync();
    return;
  }
  state.lastAutoPullAt = now;
  await pullSync({ silent: true, auto: true });
}

async function buildSyncData(userId) {
  const data = JSON.parse(JSON.stringify(state.data));
  for (const variety of data.varieties || []) {
    const images = varietyImages(variety);
    const refs = await uploadPhotoList(userId, variety.name, images);
    ensureUploadedPhotoRefs(images, refs, variety.name || "odrĹŻda");
    variety.photoUrl = refs[0] || "";
    variety.gallery = refs.slice(1);
  }
  for (const cross of data.crosses || []) {
    const images = crossSeedlingImages(cross);
    const refs = await uploadPhotoList(userId, cross.seedlingName || "semenac", images);
    ensureUploadedPhotoRefs(images, refs, cross.seedlingName || "semenĂˇÄŤ");
    cross.seedlingPhotoUrl = refs[0] || "";
    cross.seedlingGallery = refs.slice(1);
  }
  for (const offer of data.offers || []) {
    for (const item of offer.items || []) {
      const originalPhoto = clean(item.photoUrl);
      item.photoUrl = (await uploadPhotoList(userId, offerItemName(item) || "nabidka", originalPhoto ? [originalPhoto] : []))[0] || "";
      ensureUploadedPhotoRefs(originalPhoto ? [originalPhoto] : [], item.photoUrl ? [item.photoUrl] : [], offerItemName(item) || "nabidka");
    }
  }
  return data;
}

function ensureUploadedPhotoRefs(originalRefs, uploadedRefs, ownerName = "fotka") {
  const originals = unique((originalRefs || []).map(clean).filter(Boolean));
  const uploaded = unique((uploadedRefs || []).map(clean).filter(Boolean));
  const allUploaded = originals.every((ref) => ref.startsWith(SUPABASE_PHOTO_PREFIX))
    || (uploaded.length >= originals.length && uploaded.every((ref) => ref.startsWith(SUPABASE_PHOTO_PREFIX)));
  if (!allUploaded) {
    throw new Error(`Fotku u â€ž${ownerName}â€ś se nepodaĹ™ilo nahrĂˇt do cloudu. Cloud jsem radÄ›ji nepĹ™epsala.`);
  }
}

function collectPhotoPaths(data) {
  const paths = new Set();
  const add = (value) => {
    const ref = clean(value);
    if (ref.startsWith(SUPABASE_PHOTO_PREFIX)) {
      const path = parseSupabasePhotoRef(ref);
      paths.add(path);
      const thumbPath = supabaseThumbnailPath(path);
      if (thumbPath) paths.add(thumbPath);
    }
  };
  for (const variety of data?.varieties || []) {
    add(variety.photoUrl);
    for (const image of variety.gallery || []) add(image);
  }
  for (const cross of data?.crosses || []) {
    add(cross.seedlingPhotoUrl);
    for (const image of cross.seedlingGallery || []) add(image);
  }
  for (const offer of data?.offers || []) {
    for (const item of offer.items || []) add(item.photoUrl);
  }
  return paths;
}

async function cleanupStorage(userId, usedPaths) {
  const prefix = `${encodeURIComponent(userId)}/`;
  const existing = await listStoragePaths(prefix);
  const unused = existing.filter((path) => !usedPaths.has(path));
  if (!unused.length) return;
  await deleteStoragePaths(unused);
}

async function listStoragePaths(prefix) {
  const result = [];
  const walk = async (folder) => {
    const entries = await supabaseRequest(`/storage/v1/object/list/${SUPABASE_SYNC_BUCKET}`, { method: "POST", body: { prefix: folder, limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } } });
    for (const entry of entries || []) {
      const name = clean(entry.name);
      if (!name) continue;
      const path = `${folder}${name}`;
      if (entry.id || entry.metadata || /\.[a-z0-9]+$/i.test(name)) result.push(path);
      else await walk(`${path}/`);
    }
  };
  await walk(prefix);
  return result;
}

async function deleteStoragePaths(paths) {
  const config = loadSyncConfig();
  const session = await ensureSession();
  for (const path of paths) {
    const response = await fetch(`${config.url.replace(/\/+$/, "")}/storage/v1/object/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, {
      method: "DELETE",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    if (!response.ok) {
      const message = await response.text();
      if (response.status === 404 || /object not found|not found/i.test(message)) continue;
      throw new Error(message || `HTTP ${response.status}`);
    }
  }
}

async function uploadPhotoList(userId, ownerName, refs) {
  const uploaded = [];
  let uploadedLocalCount = 0;
  for (const ref of unique(refs)) {
    if (ref.startsWith(SUPABASE_PHOTO_PREFIX)) uploaded.push(ref);
    else {
      const file = await photoToFile(ref, ownerName);
      if (!file) throw new Error(`Fotku u â€ž${ownerName}â€ś se nepodaĹ™ilo pĹ™eÄŤĂ­st pro cloud.`);
      const cloudFile = await createPhotoThumbnail(file) || await preparePhotoFileForStorage(file);
      const path = `${encodeURIComponent(userId)}/${safeFileName(ownerName)}/${SUPABASE_THUMB_DIR}/${await fileHash(cloudFile)}.jpg`;
      await uploadStorage(path, cloudFile);
      const uploadedRef = `${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(path)}`;
      uploadedLocalCount += 1;
      const localEntry = {
        ref: uploadedRef,
        path,
        ownerName,
        fileName: buildOwnerPhotoFileName(ownerName, path, uploadedLocalCount),
      };
      try {
        await saveLocalSupabaseOriginal(uploadedRef, file, localEntry);
      } catch {
        await saveLocalSupabaseOriginal(uploadedRef, cloudFile, localEntry);
      }
      getMobileOriginalsFolderHandle({ requestPermission: false })
        .then((directoryHandle) => directoryHandle ? writeMobileOriginalToFolder(directoryHandle, localEntry, file) : false)
        .catch(() => {});
      uploaded.push(uploadedRef);
    }
  }
  return unique(uploaded);
}

async function createPhotoThumbnail(file) {
  try {
    const objectUrl = URL.createObjectURL(file);
    const image = await loadCanvasImage(objectUrl);
    URL.revokeObjectURL(objectUrl);
    if (!image) return null;
    const scale = Math.min(1, SUPABASE_THUMB_MAX_SIZE / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", SUPABASE_THUMB_QUALITY));
    return blob ? new File([blob], "nahled.jpg", { type: "image/jpeg" }) : null;
  } catch {
    return null;
  }
}

async function authRequest(path, body) {
  const config = loadSyncConfig();
  if (!config.url || !config.anonKey) throw new Error("ChybĂ­ Supabase nastavenĂ­.");
  const response = await fetch(`${config.url.replace(/\/+$/, "")}${path}`, { method: "POST", headers: { apikey: config.anonKey, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
  return response.json();
}

async function ensureSession() {
  const session = loadSyncSession();
  if (session.accessToken && session.expiresAt > Date.now() && session.user?.id) return session;
  if (!session.refreshToken) throw new Error("ChybĂ­ pĹ™ihlĂˇĹˇenĂ­.");
  const refreshed = await authRequest("/auth/v1/token?grant_type=refresh_token", { refresh_token: session.refreshToken });
  saveSyncSession(refreshed);
  return loadSyncSession();
}

async function supabaseRequest(path, options = {}) {
  const config = loadSyncConfig();
  const session = await ensureSession();
  const response = await fetch(`${config.url.replace(/\/+$/, "")}${path}`, { method: options.method || "GET", headers: { apikey: config.anonKey, Authorization: `Bearer ${session.accessToken}`, ...(options.body ? { "content-type": "application/json" } : {}), ...(options.headers || {}) }, body: options.body ? JSON.stringify(options.body) : undefined });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function uploadStorage(path, file) {
  const config = loadSyncConfig();
  const session = await ensureSession();
  const response = await fetch(`${config.url.replace(/\/+$/, "")}/storage/v1/object/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, { method: "PUT", headers: { apikey: config.anonKey, Authorization: `Bearer ${session.accessToken}`, "content-type": file.type || "application/octet-stream", "x-upsert": "true" }, body: file });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
}

async function createSignedPhotoUrl(path) {
  const result = await supabaseRequest(`/storage/v1/object/sign/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, { method: "POST", body: { expiresIn: 3600 } });
  const signed = clean(result?.signedURL || result?.signedUrl);
  return signed.startsWith("http") ? signed : `${loadSyncConfig().url.replace(/\/+$/, "")}${signed}`;
}

function friendlySyncError(error) {
  const raw = clean(error?.message || String(error || ""));
  if (!raw) return "neznĂˇmĂˇ chyba";
  try {
    const parsed = JSON.parse(raw);
    const message = clean(parsed.message || parsed.msg || parsed.error_description || parsed.error);
    if (message) return message;
  } catch {
    // Supabase nÄ›kdy vracĂ­ ÄŤistĂ˝ text, nÄ›kdy JSON.
  }
  if (/invalid login credentials/i.test(raw)) return "nesedĂ­ email nebo heslo";
  if (/row-level security|violates row-level security/i.test(raw)) return "RLS nepovolilo zĂˇpis pro tohoto uĹľivatele";
  if (/bucket.*not.*found|not found/i.test(raw)) return "nenaĹˇel se bucket na fotky";
  if (/jwt|token|unauthorized|401/i.test(raw)) return "pĹ™ihlĂˇĹˇenĂ­ vyprĹˇelo nebo nesedĂ­ klĂ­ÄŤ projektu";
  if (/permission|403/i.test(raw)) return "chybĂ­ oprĂˇvnÄ›nĂ­ v Supabase";
  return raw.slice(0, 160);
}

async function encryptPayload(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 180000;
  const key = await deriveKey(password, salt, iterations);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(data)));
  return { version: 1, algorithm: "AES-GCM", kdf: "PBKDF2-SHA256", iterations, salt: bytesToBase64(salt), iv: bytesToBase64(iv), ciphertext: bytesToBase64(new Uint8Array(cipher)) };
}

async function decryptPayload(payload, password) {
  const key = await deriveKey(password, base64ToBytes(payload.salt), Number(payload.iterations) || 180000);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(payload.iv) }, key, base64ToBytes(payload.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}

async function deriveKey(password, salt, iterations) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function fileHash(file) {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 28);
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(clean(value));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseSupabasePhotoRef(ref) {
  return decodeURIComponent(clean(ref).slice(SUPABASE_PHOTO_PREFIX.length));
}

function thumbPreviewRef(ref) {
  const value = clean(ref);
  if (!value.startsWith(SUPABASE_PHOTO_PREFIX)) return value;
  const thumbPath = supabaseThumbnailPath(parseSupabasePhotoRef(value));
  return thumbPath ? `${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(thumbPath)}` : value;
}

function supabaseThumbnailPath(path) {
  const cleanPath = clean(path);
  if (!cleanPath || cleanPath.includes(`/${SUPABASE_THUMB_DIR}/`)) return cleanPath;
  const parts = cleanPath.split("/");
  const fileName = parts.pop();
  if (!fileName) return cleanPath;
  parts.push(SUPABASE_THUMB_DIR, fileName.replace(/\.[a-z0-9]+$/i, ".jpg"));
  return parts.join("/");
}

function isSupabaseThumbnailPath(path) {
  return clean(path).includes(`/${SUPABASE_THUMB_DIR}/`);
}

function encodeStoragePath(path) {
  return clean(path).split("/").map(encodeURIComponent).join("/");
}

function dataUrlToFile(dataUrl, fileName) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/jpeg";
  return new File([base64ToBytes(data)], fileName, { type: mime });
}

function photoExtension(file) {
  const type = typeof file === "string" ? file : file?.type || "";
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  return ".jpg";
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { els.toast.hidden = true; }, 2600);
}

function empty(text) {
  return `<div class="empty">${escapeHtml(text)}</div>`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return clean(value);
  return new Intl.DateTimeFormat("cs-CZ").format(date);
}

function formatTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("cs-CZ", { hour: "2-digit", minute: "2-digit" }).format(Number.isNaN(date.getTime()) ? new Date() : date);
}

function formatMoney(value, currency = "CZK") {
  const amount = number(value);
  if (!Number.isFinite(amount)) return "";
  return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: currency === "CZK" ? 0 : 2 }).format(amount)} ${currency === "EUR" ? "EUR" : "KÄŤ"}`;
}

function todayInput() {
  return toDateInput(new Date());
}

function toDateInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAmount(value) {
  const amount = number(value);
  return Number.isFinite(amount) ? String(Math.round(amount * 100) / 100).replace(".", ",") : "";
}

function wholeNumber(value, fallback = 1) {
  const amount = number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : fallback;
}

function quantityText(value) {
  return String(wholeNumber(value, 1));
}

function normalizeNamedFees(items) {
  return Array.isArray(items)
    ? items
        .map((fee) => ({
          id: clean(fee?.id) || uid(),
          name: clean(fee?.name),
          amount: normalizeAmount(fee?.amount),
        }))
        .filter((fee) => fee.name || fee.amount)
    : [];
}

function number(value) {
  if (typeof value === "number") return value;
  const text = clean(value).replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeGallery(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return clean(value).split(/\n+/).map(clean).filter(Boolean);
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function clean(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function naturalCompare(a, b) {
  return clean(a).localeCompare(clean(b), "cs", { sensitivity: "base", numeric: true });
}

function escapeHtml(value) {
  return clean(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function safeFileName(value, fallback = "fotka") {
  return normalize(value || fallback).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

function initials(value) {
  return clean(value).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "đźŚ±";
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function restFormVarietyNames(value = "") {
  return unique(clean(value).split(/\r?\n|[,;]+/).map(clean).filter(Boolean));
}

function mobileRestOfferVarietyLabel(offer = {}) {
  const values = restFormVarietyNames(offer.restVarietyName);
  if (values.length) return values.join(", ");
  const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
  return clean(linked?.name || offer.restVarietyName);
}

function mobileRestOfferSummaryText(offer = {}) {
  const parts = [];
  const customer = mobileRestOfferCustomer(offer);
  const variety = mobileRestOfferVarietyLabel(offer);
  const items = sortedOfferItems(offer).slice(0, 2).map((item) => `${offerItemName(item)} Â· ${wholeNumber(item.quantity, 1)} ks`);
  if (customer) parts.push(customerName(customer));
  if (variety) parts.push(variety);
  else if (items.length) parts.push(items.join(", "));
  return parts.filter(Boolean).join(" Â· ");
}

function renderRestVarietySelection(container, names = []) {
  if (!container) return;
  container.innerHTML = names.length
    ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>Ă—</span></button>`).join("")
    : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
}

function setupRestVarietyPickerForSheet(form, initialValue = "") {
  if (!form) return;
  const picker = form.elements.restVarietyPicker;
  const hidden = form.elements.restVarietyName;
  const list = form.querySelector("[data-rest-variety-list]");
  const addButton = form.querySelector("[data-rest-variety-add]");
  if (!picker || !hidden || !list || !addButton) return;
  let suggestions = form.querySelector("[data-rest-variety-suggestions]");
  if (!suggestions) {
    suggestions = document.createElement("div");
    suggestions.className = "rest-variety-suggestions";
    suggestions.setAttribute("data-rest-variety-suggestions", "");
    suggestions.hidden = true;
    picker.closest("label")?.after(suggestions);
  }
  form.__restVarietyNames = restFormVarietyNames(initialValue || hidden.value);
  const suggestionNames = (query = "") => {
    const needle = normalize(clean(query));
    const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
    return [...(state.data.varieties || [])]
      .map((variety) => clean(variety.name))
      .filter(Boolean)
      .filter((name) => !selected.has(normalize(name)))
      .filter((name) => !needle || normalize(name).includes(needle))
      .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }))
      .slice(0, 8);
  };
  const renderSuggestions = () => {
    const names = suggestionNames(picker.value);
    suggestions.hidden = !names.length;
    suggestions.innerHTML = names
      .map((name) => `<button class="rest-variety-suggestion" type="button" data-rest-variety-pick="${escapeHtml(name)}">${escapeHtml(name)}</button>`)
      .join("");
  };
  const sync = () => {
    hidden.value = form.__restVarietyNames.join("\n");
    renderRestVarietySelection(list, form.__restVarietyNames);
    renderSuggestions();
  };
  const addCurrent = () => {
    const raw = clean(picker.value);
    if (!raw) return;
    const exact = findVarietyByName(raw);
    const nextName = clean(exact?.name || raw);
    if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(nextName))) {
      form.__restVarietyNames.push(nextName);
    }
    picker.value = "";
    sync();
    picker.focus();
  };
  addButton.onclick = addCurrent;
  picker.oninput = renderSuggestions;
  picker.onkeydown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addCurrent();
  };
  list.onclick = (event) => {
    const button = event.target.closest("[data-rest-variety-remove]");
    if (!button) return;
    form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
    sync();
  };
  suggestions.onclick = (event) => {
    const button = event.target.closest("[data-rest-variety-pick]");
    if (!button) return;
    picker.value = button.dataset.restVarietyPick || "";
    addCurrent();
  };
  sync();
}

function mobileRestOfferOrderLines(offer = {}) {
  const lines = [];
  sortedOfferItems(offer).forEach((item) => {
    const quantity = Math.max(wholeNumber(item.quantity, 0), 0);
    if (!quantity) return;
    const variety = findById("varieties", clean(item.varietyId)) || findVarietyByName(item.varietyName);
    const explicitPrice = number(item.price);
    const fallbackPrice = number(variety?.salePrice);
    const unitPrice = Number.isFinite(explicitPrice) ? item.price : (Number.isFinite(fallbackPrice) ? variety.salePrice : "");
    lines.push(unitPrice ? offerOrderLineText(offerItemName(item), quantity, unitPrice) : `${offerItemName(item)} ${quantity}x`);
  });
  if (lines.length) return lines;
  return restFormVarietyNames(offer.restVarietyName).map((name) => {
    const variety = findVarietyByName(name);
    const fallbackPrice = number(variety?.salePrice);
    return Number.isFinite(fallbackPrice) ? offerOrderLineText(name, 1, variety.salePrice) : `${name} 1x`;
  });
}

function openOfferSheet(id = "", defaults = {}) {
  const offer = findById("offers", id) || {};
  const initialType = offer.id ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  if (initialType !== "rests") return __akPrevMobileOpenOfferSheet(id, defaults);
  const initialDate = offer.date || clean(defaults.date) || todayInput();
  const customers = [...state.data.customers].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
  openSheet(offer.id ? "Upravit resty" : "NovĂ© resty", `<form class="form-grid" id="sheetForm">
    <input name="type" type="hidden" value="rests">
    <input name="title" type="hidden" value="${escapeHtml(defaultOfferTitle("rests", initialDate))}">
    <input name="facebookPublishDate" type="hidden" value="${escapeHtml(initialDate)}">
    <input name="facebookPublishTime" type="hidden" value="20:00">
    <input name="status" type="hidden" value="pĹ™ipravenĂˇ">
    <input name="restVarietyId" type="hidden" value="">
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
    <label class="field"><span>ZĂˇkaznĂ­k</span><select name="restCustomerId"><option value="">Bez zĂˇkaznĂ­ka</option>${customers
      .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
      .join("")}</select></label>
    <label class="field"><span>OdrĹŻdy</span><input name="restVarietyPicker" list="varietyList" placeholder="zaÄŤni psĂˇt a pĹ™idej"></label>
    <textarea name="restVarietyName" hidden aria-hidden="true"></textarea>
    <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-rest-variety-add>PĹ™idat odrĹŻdu</button></div>
    <div class="rest-variety-selection" data-rest-variety-list></div>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const nextDate = clean(data.get("date")) || todayInput();
    const names = restFormVarietyNames(data.get("restVarietyName"));
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: defaultOfferTitle("rests", nextDate),
      date: nextDate,
      facebookPublishDate: nextDate,
      facebookPublishTime: "20:00",
      type: "rests",
      status: "pĹ™ipravenĂˇ",
      note: clean(data.get("note")),
      restCustomerId: clean(data.get("restCustomerId")),
      restVarietyId: "",
      restVarietyName: names.join("\n"),
      items: offer.items || [],
      createdAt: offer.createdAt || now,
      updatedAt: now,
    }));
  });
  setupRestVarietyPickerForSheet(els.sheet.querySelector("#sheetForm"), offer.restVarietyName || "");
}

function mobileRestOfferSummaryText(offer = {}) {
  const parts = [];
  const customer = mobileRestOfferCustomer(offer);
  const variety = mobileRestOfferVarietyLabel(offer);
  const items = sortedOfferItems(offer).slice(0, 2).map((item) => `${offerItemName(item)} Â· ${wholeNumber(item.quantity, 1)} ks`);
  if (customer) parts.push(customerName(customer));
  if (variety) parts.push(variety);
  else if (items.length) parts.push(items.join(", "));
  return parts.filter(Boolean).join(" Â· ");
}

function renderOffers() {
  const offers = state.data.offers.filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
  const groups = splitOffersByType(offers);
  const renderOfferGroup = (label, items) => {
    if (!items.length) return "";
    return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
      if (isRestOffer(offer)) {
        const summary = mobileRestOfferSummaryText(offer);
        const notePill = clean(offer.note) ? `đź“ť ${mobileShortRestText(offer.note, 42)}` : "";
        return card({
          id: offer.id,
          type: "offer",
          title: offer.title,
          sub: [formatDate(offer.date), summary].filter(Boolean).join(" Â· "),
          pills: [notePill].filter(Boolean),
          badges: [{ label: "Resty", className: "warn" }],
          thumb: "",
          thumbText: initials(offer.title),
          actions: [["edit-offer", "âśŽ"], ["delete-offer", "Ă—"]],
        });
      }

      const offerItems = sortedOfferItems(offer);
      const reserved = offerReservedCount(offer);
      const total = offerTotalCount(offer);
      const available = offerAvailableCount(offer);
      const alternates = offerAlternateCount(offer);
      const coverImage = offerItems.map((item) => offerItemImage(item)).find(Boolean) || "";
      const itemPills = offerItems.slice(0, 4).map((item) => `đźŚż ${offerItemName(item)}`);
      if (offerItems.length > 4) itemPills.push(`+${offerItems.length - 4} dalĹˇĂ­`);
      return card({
        id: offer.id,
        type: "offer",
        title: offer.title,
        sub: `${formatDate(offer.date)} Â· ${offerTypeLabel(offer)} Â· ${offer.status}`,
        pills: [...itemPills, `VolnĂ© ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `NĂˇhradnĂ­ci ${alternates}` : ""],
        badges: [],
        thumb: coverImage,
        thumbText: initials(offer.title),
        actions: [["facebook-offer", "FB"], ["edit-offer", "âśŽ"], ["delete-offer", "Ă—"]],
      });
    }).join("")}`;
  };
  return [
    renderOfferGroup("NabĂ­dky", groups.offers),
    renderOfferGroup("Resty", groups.rests),
  ].filter(Boolean).join("");
}

function mobileRestOfferOrderLines(offer = {}) {
  const lines = [];
  sortedOfferItems(offer).forEach((item) => {
    const quantity = Math.max(wholeNumber(item.quantity, 0), 0);
    if (!quantity) return;
    const variety = findById("varieties", clean(item.varietyId)) || findVarietyByName(item.varietyName);
    const explicitPrice = number(item.price);
    const fallbackPrice = number(variety?.salePrice);
    const unitPrice = Number.isFinite(explicitPrice) ? item.price : (Number.isFinite(fallbackPrice) ? variety.salePrice : "");
    lines.push(unitPrice ? offerOrderLineText(offerItemName(item), quantity, unitPrice) : `${offerItemName(item)} ${quantity}x`);
  });
  if (lines.length) return lines;
  const restVariety = mobileRestOfferVarietyLabel(offer);
  if (!restVariety) return [];
  const variety = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(restVariety);
  const fallbackPrice = number(variety?.salePrice);
  return [Number.isFinite(fallbackPrice) ? offerOrderLineText(restVariety, 1, variety.salePrice) : `${restVariety} 1x`];
}

function mobileRestOfferOrderNote(offer = {}) {
  return [`Z restĹŻ: ${offer.title}`, clean(offer.note)].filter(Boolean).join("\n");
}

var __akPrevMobileCreateOrdersFromOffer = createOrdersFromOffer;
createOrdersFromOffer = function createOrdersFromOfferOverride(id) {
  const offer = findById("offers", id);
  if (!offer) return;
  if (!isRestOffer(offer)) return __akPrevMobileCreateOrdersFromOffer(id);
  const customerId = clean(offer.restCustomerId);
  if (!customerId) {
    toast("U restĹŻ nejdĹ™Ă­v vyber zĂˇkaznĂ­ka.");
    return;
  }
  const lines = mobileRestOfferOrderLines(offer);
  const note = mobileRestOfferOrderNote(offer);
  if (!lines.length && !note) {
    toast("Rest nemĂˇ co pĹ™evĂ©st do objednĂˇvky.");
    return;
  }
  if (state.data.orders.some((order) => clean(order.offerId) === clean(offer.id)) && !confirm("Z tÄ›chto restĹŻ uĹľ objednĂˇvka vznikla. VytvoĹ™it dalĹˇĂ­?")) return;
  const now = new Date().toISOString();
  const lineText = lines.join("\n");
  const fees = defaultOfferOrderFees(customerId);
  const shippingFee = number(fees.shippingFee);
  const packingFee = number(fees.packingFee);
  const feeTotal = (Number.isFinite(shippingFee) ? shippingFee : 0) + (Number.isFinite(packingFee) ? packingFee : 0);
  const order = normalizeOrder({
    id: uid(),
    offerId: offer.id,
    customerId,
    orderDate: offer.date || todayInput(),
    varietiesText: lineText,
    price: normalizeAmount(orderTotalFromText(lineText) + feeTotal),
    paymentStatus: "ÄŤekĂˇ",
    shippingStatus: "novĂˇ",
    deliveryMethod: "ship",
    shippingFee: Number.isFinite(shippingFee) ? fees.shippingFee : "",
    shippingFeeLabel: Number.isFinite(shippingFee) ? fees.shippingFeeLabel : "",
    packingFee: Number.isFinite(packingFee) ? fees.packingFee : "",
    codFee: "",
    note,
    createdAt: now,
    updatedAt: now,
  });
  upsert("orders", order);
  saveData();
  render();
  openOrderSheet(order.id);
  toast("VytvoĹ™ena objednĂˇvka z restĹŻ.");
};

var __akPrevMobileOpenOfferSheet = openOfferSheet;
openOfferSheet = function openOfferSheetOverride(id = "", defaults = {}) {
  const offer = findById("offers", id) || {};
  const initialType = offer.id ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  if (initialType !== "rests") return __akPrevMobileOpenOfferSheet(id, defaults);
  const initialDate = offer.date || clean(defaults.date) || todayInput();
  const linkedVariety = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
  const customers = [...state.data.customers].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
  openSheet(offer.id ? "Upravit resty" : "NovĂ© resty", `<form class="form-grid" id="sheetForm">
    <input name="type" type="hidden" value="rests">
    <input name="title" type="hidden" value="${escapeHtml(defaultOfferTitle("rests", initialDate))}">
    <input name="facebookPublishDate" type="hidden" value="${escapeHtml(initialDate)}">
    <input name="facebookPublishTime" type="hidden" value="20:00">
    <input name="status" type="hidden" value="pĹ™ipravenĂˇ">
    <input name="restVarietyId" type="hidden" value="${escapeHtml(clean(offer.restVarietyId || linkedVariety?.id))}">
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
    <label class="field"><span>ZĂˇkaznĂ­k</span><select name="restCustomerId"><option value="">Bez zĂˇkaznĂ­ka</option>${customers
      .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
      .join("")}</select></label>
    <label class="field"><span>OdrĹŻda</span><input name="restVarietyName" list="varietyList" value="${escapeHtml(clean(offer.restVarietyName || linkedVariety?.name))}" placeholder="volitelnÄ›"></label>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const nextDate = clean(data.get("date")) || todayInput();
    const rawRestVarietyName = clean(data.get("restVarietyName"));
    const matchedRestVariety = rawRestVarietyName ? findVarietyByName(rawRestVarietyName) : null;
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: defaultOfferTitle("rests", nextDate),
      date: nextDate,
      facebookPublishDate: nextDate,
      facebookPublishTime: "20:00",
      type: "rests",
      status: "pĹ™ipravenĂˇ",
      note: clean(data.get("note")),
      restCustomerId: clean(data.get("restCustomerId")),
      restVarietyId: clean(data.get("restVarietyId")) || clean(matchedRestVariety?.id),
      restVarietyName: clean(matchedRestVariety?.name || rawRestVarietyName),
      items: offer.items || [],
      createdAt: offer.createdAt || now,
      updatedAt: now,
    }));
  });
  const form = els.sheet.querySelector("#sheetForm");
  form?.elements?.restVarietyName?.addEventListener("input", () => {
    const exact = findVarietyByName(form.elements.restVarietyName.value);
    form.elements.restVarietyId.value = exact?.id || "";
  });
  form?.elements?.restVarietyName?.addEventListener("change", () => {
    const exact = findVarietyByName(form.elements.restVarietyName.value);
    form.elements.restVarietyId.value = exact?.id || "";
  });
};

var __akPrevMobileOpenOfferDetailSheet = openOfferDetailSheet;
openOfferDetailSheet = function openOfferDetailSheetOverride(id, options = {}) {
  const offer = findById("offers", id);
  if (!offer || !isRestOffer(offer)) return __akPrevMobileOpenOfferDetailSheet(id, options);
  state.activeOfferId = id;
  const items = sortedOfferItems(offer);
  const metaCards = [
    { label: "ZĂˇkaznĂ­k", value: customerName(mobileRestOfferCustomer(offer)) },
    { label: "OdrĹŻda", value: mobileRestOfferVarietyLabel(offer) },
  ].filter((entry) => clean(entry.value));
  const body = `<section class="offer-detail">
    <div class="pill-row"><span class="pill warn">Resty</span></div>
    ${metaCards.length ? `<div class="rest-meta-stack">${metaCards.map((entry) => `<div class="rest-meta-card"><small>${escapeHtml(entry.label)}</small><strong>${escapeHtml(entry.value)}</strong></div>`).join("")}</div>` : ""}
    ${offer.note ? `<p class="sub">${escapeHtml(offer.note)}</p>` : ""}
    ${items.length ? `<div class="offer-items">${items.map((item) => offerItemDetailMarkup(offer, item)).join("")}</div>` : `<div class="empty light">Bez odĹ™ezkĹŻ. Rest mĹŻĹľe bĂ˝t jen poznĂˇmka nebo pĹ™ipomĂ­nka.</div>`}
  </section>`;
  const footer = `<button class="button" type="button" data-close-sheet>ZavĹ™Ă­t</button>
    <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
    <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">VytvoĹ™it objednĂˇvku</button>`;
  openSheet(offer.title, body, null, footer, {
    ...options,
    restore: () => openOfferDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
  els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  els.sheet.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemSheet(button.dataset.offerId, button.dataset.editOfferItem));
  });
  els.sheet.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(button.dataset.offerId, button.dataset.deleteOfferItem));
  });
  resolvePhotos(els.sheet);
};

function normalizeOffer(offer = {}) {
  const nextDate = clean(offer.date) || todayInput();
  const nextType = normalizeOfferType(offer.type);
  const legacyRestTitle = `Resty/poznĂˇmky ${formatDate(nextDate)}`;
  const defaultTitle = defaultOfferTitle(nextType, nextDate);
  const title = clean(offer.title);
  return {
    ...offer,
    id: clean(offer.id) || uid(),
    title: nextType === "rests" && title === legacyRestTitle ? defaultTitle : (title || defaultTitle),
    date: nextDate,
    facebookPublishDate: clean(offer.facebookPublishDate || offer.date) || nextDate,
    facebookPublishTime: clean(offer.facebookPublishTime) || "20:00",
    type: nextType,
    status: ["pĹ™ipravenĂˇ", "zveĹ™ejnÄ›nĂˇ", "uzavĹ™enĂˇ"].includes(clean(offer.status)) ? clean(offer.status) : "pĹ™ipravenĂˇ",
    items: Array.isArray(offer.items) ? offer.items.map(normalizeOfferItem) : [],
    note: clean(offer.note),
    restCustomerId: nextType === "rests" ? clean(offer.restCustomerId) : "",
    restVarietyId: nextType === "rests" ? clean(offer.restVarietyId) : "",
    restVarietyName: nextType === "rests" ? clean(offer.restVarietyName) : "",
  };
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty"
    : "NabĂ­dka";
}

function defaultOfferTitle(type = "offer", date = todayInput()) {
  return normalizeOfferType(type) === "rests"
    ? `Resty ${formatDate(date)}`
    : `NabĂ­dka ${formatDate(date)}`;
}

function mobileRestOfferCustomer(offer = {}) {
  return findCustomer(clean(offer.restCustomerId));
}

function mobileRestOfferVarietyLabel(offer = {}) {
  const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
  return clean(linked?.name || offer.restVarietyName);
}

function mobileShortRestText(value = "", max = 88) {
  const text = clean(value);
  return text.length > max ? `${text.slice(0, max - 1)}â€¦` : text;
}

function mobileRestOfferSummaryText(offer = {}) {
  const parts = [];
  const customer = mobileRestOfferCustomer(offer);
  const variety = mobileRestOfferVarietyLabel(offer);
  const items = sortedOfferItems(offer).slice(0, 2).map((item) => `${offerItemName(item)} Â· ${wholeNumber(item.quantity, 1)} ks`);
  if (customer) parts.push(customerName(customer));
  if (variety) parts.push(variety);
  else if (items.length) parts.push(items.join(", "));
  if (offer.note) parts.push(mobileShortRestText(offer.note, 64));
  return parts.filter(Boolean).join(" Â· ");
}

function mobileRestOffersForCustomer(customerId = "") {
  const id = clean(customerId);
  if (!id) return [];
  return (state.data.offers || [])
    .filter((offer) => isRestOffer(offer) && clean(offer.restCustomerId) === id && offer.status !== "uzavĹ™enĂˇ")
    .sort((a, b) => String(b.date || b.updatedAt || "").localeCompare(String(a.date || a.updatedAt || "")));
}

function mobileRestOfferAlertLines(offer = {}) {
  const lines = [];
  const variety = mobileRestOfferVarietyLabel(offer);
  const itemSummary = sortedOfferItems(offer)
    .slice(0, 3)
    .map((item) => `${offerItemName(item)} Â· ${wholeNumber(item.quantity, 1)} ks`)
    .join(", ");
  if (variety) lines.push(variety);
  if (!variety && itemSummary) lines.push(itemSummary);
  if (offer.note) lines.push(mobileShortRestText(offer.note, 84));
  return lines.length ? lines : [mobileShortRestText(offer.title, 84)];
}

function renderSheetRestWarning(form = els.sheet.querySelector("#sheetForm")) {
  const block = form?.querySelector("[data-sheet-rest-warning]");
  if (!block) return;
  const offers = mobileRestOffersForCustomer(form.elements.customerId?.value);
  if (!offers.length) {
    block.hidden = true;
    block.innerHTML = "";
    return;
  }
  block.hidden = false;
  block.innerHTML = `
    <div class="sheet-rest-heading">
      <strong>MĂˇ resty</strong>
      <small>Zkontroluj, jestli je potĹ™eba nÄ›co doplnit nebo pĹ™ipomenout.</small>
    </div>
    <div class="sheet-rest-list">
      ${offers.map((offer) => `
        <article class="sheet-rest-item">
          <strong>${escapeHtml(offer.title)}</strong>
          <small>${escapeHtml(mobileRestOfferAlertLines(offer).join(" Â· "))}</small>
        </article>
      `).join("")}
    </div>
  `;
}

function customerOverviewMarkup(customerId) {
  const orders = state.data.orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => String(b.orderDate || "").localeCompare(String(a.orderDate || "")));
  const waitingOrders = orders.filter((order) => order.paymentStatus !== "zaplaceno");
  const rests = mobileRestOffersForCustomer(customerId);
  const waitingText = waitingOrders.length ? `${waitingOrders.length} Â· ${orderTotalsText(waitingOrders)}` : "Ne";
  return `<section class="customer-overview">
    <div class="offer-stats customer-overview-stats">
      <span><small>ObjednĂˇvky</small><strong>${orders.length}</strong></span>
      <span><small>Celkem koupil</small><strong>${escapeHtml(orderTotalsText(orders))}</strong></span>
      <span><small>ÄŚekĂˇ platba</small><strong>${escapeHtml(waitingText)}</strong></span>
      <span><small>Resty</small><strong>${rests.length ? rests.length : "Ne"}</strong></span>
    </div>
  </section>`;
}

function renderOffers() {
  const offers = state.data.offers.filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  if (!offers.length) return empty("Ĺ˝ĂˇdnĂ© nabĂ­dky.");
  const groups = splitOffersByType(offers);
  const renderOfferGroup = (label, items) => {
    if (!items.length) return "";
    return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
      const offerItems = sortedOfferItems(offer);
      const reserved = offerReservedCount(offer);
      const total = offerTotalCount(offer);
      const available = offerAvailableCount(offer);
      const alternates = offerAlternateCount(offer);
      const coverImage = offerItems.map((item) => offerItemImage(item)).find(Boolean) || "";
      const itemPills = offerItems.slice(0, 4).map((item) => `đźŚż ${offerItemName(item)}`);
      const restSummary = isRestOffer(offer) ? mobileRestOfferSummaryText(offer) : "";
      if (restSummary) itemPills.unshift(`âš  ${restSummary}`);
      if (offerItems.length > 4) itemPills.push(`+${offerItems.length - 4} dalĹˇĂ­`);
      return card({
        id: offer.id,
        type: "offer",
        title: offer.title,
        sub: `${formatDate(offer.date)} Â· ${offerTypeLabel(offer)} Â· ${offer.status}`,
        pills: [...itemPills, `VolnĂ© ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `NĂˇhradnĂ­ci ${alternates}` : ""],
        badges: isRestOffer(offer) ? [{ label: "Resty", className: "warn" }] : [],
        thumb: coverImage,
        thumbText: initials(offer.title),
        actions: isRestOffer(offer) ? [["edit-offer", "âśŽ"], ["delete-offer", "Ă—"]] : [["facebook-offer", "FB"], ["edit-offer", "âśŽ"], ["delete-offer", "Ă—"]],
      });
    }).join("")}`;
  };
  return [
    renderOfferGroup("NabĂ­dky", groups.offers),
    renderOfferGroup("Resty", groups.rests),
  ].filter(Boolean).join("");
}

function openOrderSheet(id = "", customerId = "") {
  const order = findById("orders", id) || {};
  const customers = state.data.customers;
  const selectedCustomerId = clean(order.customerId || customerId);
  const selectedCustomer = findCustomer(selectedCustomerId);
  const activeShippingLabel = clean(order.shippingFeeLabel) || (clean(order.shippingFee) ? shippingLabel(selectedCustomer) : "");
  openSheet(order.id ? "Upravit objednĂˇvku" : "NovĂˇ objednĂˇvka", `<form class="form-grid" id="sheetForm">
    <input name="offerId" type="hidden" value="${escapeHtml(order.offerId || "")}">
    <label class="field"><span>ZĂˇkaznĂ­k</span><select name="customerId" required><option value="" ${selectedCustomerId ? "" : "selected"}>Zvol zĂˇkaznĂ­ka</option>${customers
      .slice()
      .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
      .map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
      .join("")}</select></label>
    <section class="sheet-rest-warning" data-sheet-rest-warning hidden></section>
    <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
    ${toggle("paymentStatus", [["ÄŤekĂˇ", "ÄŚekĂˇ"], ["zaplaceno", "Zaplaceno"]], order.paymentStatus || "ÄŤekĂˇ")}
    ${toggle("shippingStatus", [["novĂˇ", "NovĂˇ"], ["pĹ™ipraveno", "PĹ™ipravenĂˇ"], ["odeslĂˇno", "OdeslanĂˇ"], ["zaplaceno", "VyĹ™Ă­zenĂˇ"]], order.shippingStatus || "novĂˇ")}
    ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "OsobnĂ­ odbÄ›r"]], order.deliveryMethod || "ship")}
    <div class="toggle-grid">
      <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna ÄŚR" ? "active" : ""}" type="button" data-fee="shipping-cz">ZĂˇsilkovna ÄŚR Â· ${escapeHtml(appSettings().shippingFeeCz || "89")} KÄŤ</button>
      <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "ZĂˇsilkovna Slovensko" ? "active" : ""}" type="button" data-fee="shipping-sk">ZĂˇsilkovna SK Â· ${escapeHtml(appSettings().shippingFeeSk || "99")} KÄŤ</button>
      <button class="chip-button ${clean(order.shippingFee) && activeShippingLabel === "BalĂ­kovna" ? "active" : ""}" type="button" data-fee="shipping-post">BalĂ­kovna Â· ${escapeHtml(appSettings().postalFee || "")} KÄŤ</button>
      <button class="chip-button ${clean(order.shippingFee) && isShippingAddressLabel(activeShippingLabel) ? "active" : ""}" type="button" data-fee="shipping-address">ZĂˇsilkovna na adresu Â· ${escapeHtml(defaultShippingAddressFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
      <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">BalnĂ© Â· ${escapeHtml(appSettings().packingFee || "20")} KÄŤ</button>
      <button class="chip-button ${clean(order.codFee) ? "active" : ""}" type="button" data-fee="cod">DobĂ­rka Â· ${escapeHtml(defaultCodFeeForCustomer(appSettings(), selectedCustomer) || "")} KÄŤ</button>
      ${order.id ? `<button class="chip-button ${clean(order.paymentTextSentAt) ? "active" : ""}" type="button" data-toggle-sheet-order-text="${escapeHtml(order.id)}">${clean(order.paymentTextSentAt) ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn"}</button>` : ""}
    </div>
    <label class="field"><span>OdrĹŻdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 KÄŤ">${escapeHtml(order.varietiesText)}</textarea></label>
    <section class="order-alternate-sheet-block" data-sheet-order-alternates hidden></section>
    <label class="field"><span>Celkem KÄŤ</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
    <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
    <input name="shippingFeeLabel" type="hidden" value="${escapeHtml(order.shippingFeeLabel || activeShippingLabel)}">
    <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
    <input name="codFee" type="hidden" value="${escapeHtml(order.codFee)}">
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const item = normalizeOrder({
      ...order,
      id: order.id || uid(),
      offerId: clean(data.get("offerId")),
      customerId: clean(data.get("customerId")),
      orderDate: clean(data.get("orderDate")) || todayInput(),
      paymentStatus: form.querySelector('[name="paymentStatus"]').value,
      shippingStatus: form.querySelector('[name="shippingStatus"]').value,
      deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
      varietiesText: clean(data.get("varietiesText")),
      price: clean(data.get("price")),
      shippingFee: clean(data.get("shippingFee")),
      shippingFeeLabel: clean(data.get("shippingFeeLabel")),
      packingFee: clean(data.get("packingFee")),
      codFee: clean(data.get("codFee")),
      note: clean(data.get("note")),
      createdAt: order.createdAt || now,
      updatedAt: now,
    });
    upsert("orders", item);
  });
  const form = els.sheet.querySelector("#sheetForm");
  form?.setAttribute("data-order-id", order.id || "");
  bindToggles();
  bindFees();
  form?.setAttribute("data-last-delivery-method", order.deliveryMethod || "ship");
  syncOrderSheetCustomerValidity(form);
  syncOrderSheetAlternates();
  renderSheetRestWarning(form);
  form?.querySelector('[name="varietiesText"]')?.addEventListener("input", () => recalculateOrderSheetPrice());
  form?.querySelector('[name="customerId"]')?.addEventListener("change", () => {
    syncOrderSheetCustomerValidity(form);
    if (form?.elements?.deliveryMethod?.value === "personal_pickup") {
      clearOrderSheetFeeRestoreSnapshot(form);
    } else {
      syncOrderSheetCountryShippingPreset(form);
    }
    form?.__syncFeeButtons?.();
    syncOrderSheetAlternates();
    renderSheetRestWarning(form);
  });
  form?.querySelector('[name="deliveryMethod"]')?.addEventListener("change", () => {
    if (!form?.elements) return;
    const previousDelivery = form.dataset.lastDeliveryMethod || "ship";
    if (form.elements.deliveryMethod.value === "personal_pickup") {
      if (previousDelivery !== "personal_pickup") rememberOrderSheetFeeRestoreSnapshot(form);
      els.sheet.querySelectorAll("[data-fee].active").forEach((button) => button.classList.remove("active"));
      form.elements.shippingFee.value = "";
      form.elements.shippingFeeLabel.value = "";
      form.elements.packingFee.value = "";
      form.elements.codFee.value = "";
      recalculateOrderSheetPrice(form);
    } else if (previousDelivery === "personal_pickup") {
      const restored = restoreOrderSheetFeeRestoreSnapshot(form);
      if (!restored) form.__syncFeeButtons?.();
      recalculateOrderSheetPrice(form);
    }
    form.dataset.lastDeliveryMethod = form.elements.deliveryMethod.value || "ship";
  });
  els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", () => {
    syncOrderSheetCustomerValidity(form);
    if (!clean(form?.querySelector('[name="customerId"]')?.value)) toast("Zvol zĂˇkaznĂ­ka.");
  });
  els.sheet.querySelector("[data-toggle-sheet-order-text]")?.addEventListener("click", (event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const sent = toggleOrderPaymentTextSent(button.dataset.toggleSheetOrderText, { skipRender: true });
    button.classList.toggle("active", sent);
    button.textContent = sent ? "âś“ Text odeslĂˇn" : "Text odeslĂˇn";
  });
}

function openOfferSheet(id = "", defaults = {}) {
  const offer = findById("offers", id) || {};
  const initialType = offer.id ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer.date || clean(defaults.date) || todayInput();
  const linkedVariety = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
  const customers = [...state.data.customers].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
  const sheetTitle = offer.id
    ? (initialType === "rests" ? "Upravit resty" : "Upravit nabĂ­dku")
    : (initialType === "rests" ? "NovĂ© resty" : "NovĂˇ nabĂ­dka");
  const restMetaMarkup = initialType === "rests" ? `
    <input name="restVarietyId" type="hidden" value="${escapeHtml(clean(offer.restVarietyId || linkedVariety?.id))}">
    <label class="field"><span>ZĂˇkaznĂ­k</span><select name="restCustomerId"><option value="">Bez zĂˇkaznĂ­ka</option>${customers
      .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
      .join("")}</select></label>
    <label class="field"><span>OdrĹŻda</span><input name="restVarietyName" list="varietyList" value="${escapeHtml(clean(offer.restVarietyName || linkedVariety?.name))}" placeholder="volitelnÄ›"></label>
  ` : `<input name="restVarietyId" type="hidden" value=""><input name="restCustomerId" type="hidden" value=""><input name="restVarietyName" type="hidden" value="">`;
  openSheet(sheetTitle, `<form class="form-grid" id="sheetForm">
    <input name="type" type="hidden" value="${escapeHtml(initialType)}">
    <label class="field"><span>NĂˇzev</span><input name="title" required value="${escapeHtml(offer.title || defaultOfferTitle(initialType, initialDate))}"></label>
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
    <label class="field"><span>Datum na Facebooku</span><input name="facebookPublishDate" type="date" value="${escapeHtml(offer.facebookPublishDate || initialDate)}"></label>
    <label class="field"><span>ÄŚas na Facebooku</span><input name="facebookPublishTime" type="time" value="${escapeHtml(offer.facebookPublishTime || "20:00")}"></label>
    ${restMetaMarkup}
    ${toggle("status", [["pĹ™ipravenĂˇ", "PĹ™ipravenĂˇ"], ["zveĹ™ejnÄ›nĂˇ", "ZveĹ™ejnÄ›nĂˇ"], ["uzavĹ™enĂˇ", "UzavĹ™enĂˇ"]], offer.status || "pĹ™ipravenĂˇ")}
    <label class="field"><span>PoznĂˇmka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const nextDate = clean(data.get("date")) || todayInput();
    const nextType = normalizeOfferType(data.get("type") || offer.type || defaults.type);
    const sourceType = offer.id ? normalizeOfferType(offer.type) : nextType;
    const rawRestVarietyName = nextType === "rests" ? clean(data.get("restVarietyName")) : "";
    const matchedRestVariety = rawRestVarietyName ? findVarietyByName(rawRestVarietyName) : null;
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: adjustedOfferTitleForType(clean(data.get("title")), sourceType, nextType, nextDate),
      date: nextDate,
      facebookPublishDate: clean(data.get("facebookPublishDate")) || nextDate,
      facebookPublishTime: clean(data.get("facebookPublishTime")) || "20:00",
      type: nextType,
      status: form.querySelector('[name="status"]').value,
      note: clean(data.get("note")),
      restCustomerId: nextType === "rests" ? clean(data.get("restCustomerId")) : "",
      restVarietyId: nextType === "rests" ? clean(data.get("restVarietyId")) || clean(matchedRestVariety?.id) : "",
      restVarietyName: nextType === "rests" ? clean(matchedRestVariety?.name || rawRestVarietyName) : "",
      items: offer.items || [],
      createdAt: offer.createdAt || now,
      updatedAt: now,
    }));
  });
  bindToggles();
  const form = els.sheet.querySelector("#sheetForm");
  form?.elements?.restVarietyName?.addEventListener("input", () => {
    const exact = findVarietyByName(form.elements.restVarietyName.value);
    form.elements.restVarietyId.value = exact?.id || "";
  });
  form?.elements?.restVarietyName?.addEventListener("change", () => {
    const exact = findVarietyByName(form.elements.restVarietyName.value);
    form.elements.restVarietyId.value = exact?.id || "";
  });
}

function openOfferDetailSheet(id, options = {}) {
  const offer = findById("offers", id);
  if (!offer) return;
  state.activeOfferId = id;
  const items = sortedOfferItems(offer);
  const reserved = offerReservedCount(offer);
  const total = offerTotalCount(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty" : "Upravit nabĂ­dku";
  const moveLeftoversButton = !isRestOffer(offer)
    ? `<button class="button" type="button" data-move-offer-leftovers="${escapeHtml(id)}">PĹ™esunout neprodanĂ© do novĂ© nabĂ­dky</button>`
    : "";
  const restMetaCards = isRestOffer(offer)
    ? [
        { label: "ZĂˇkaznĂ­k", value: customerName(mobileRestOfferCustomer(offer)) },
        { label: "OdrĹŻda", value: mobileRestOfferVarietyLabel(offer) },
      ].filter((entry) => clean(entry.value))
    : [];
  const restMetaMarkup = restMetaCards.length
    ? `<div class="rest-meta-stack">${restMetaCards.map((entry) => `<div class="rest-meta-card"><small>${escapeHtml(entry.label)}</small><strong>${escapeHtml(entry.value)}</strong></div>`).join("")}</div>`
    : "";
  const facebookPrimaryButton = !isRestOffer(offer)
    ? `<button class="button primary" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">PĹ™ipravit Facebook pĹ™Ă­spÄ›vek</button>`
    : "";
  const facebookFooterButton = !isRestOffer(offer)
    ? `<button class="button" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">Facebook</button>`
    : "";
  const body = `<section class="offer-detail">
    <div class="offer-stats">
      <span><strong>${items.length}</strong><small>odĹ™ezkĹŻ</small></span>
      <span><strong>${total}</strong><small>kusĹŻ</small></span>
      <span><strong>${reserved}</strong><small>rezervacĂ­</small></span>
      <span><strong>${Math.max(0, total - reserved)}</strong><small>volnĂ©</small></span>
    </div>
    <div class="pill-row"><span class="pill ${isRestOffer(offer) ? "warn" : ""}">${escapeHtml(offerTypeLabel(offer))}</span><span class="pill">${escapeHtml(offer.status)}</span></div>
    ${restMetaMarkup}
    ${offer.note ? `<p class="sub">${escapeHtml(offer.note)}</p>` : ""}
    ${moveLeftoversButton}
    ${facebookPrimaryButton}
    <div class="offer-items">
      ${items.length ? items.map((item) => offerItemDetailMarkup(offer, item)).join("") : `<div class="empty light">ZatĂ­m bez odĹ™ezkĹŻ.</div>`}
    </div>
  </section>`;
  const footer = `<button class="button" type="button" data-close-sheet>ZavĹ™Ă­t</button>
    ${facebookFooterButton}
    <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">${editLabel}</button>
    <button class="button" type="button" data-create-offer-orders="${escapeHtml(id)}">VytvoĹ™it objednĂˇvky</button>
    <button class="button primary" type="button" data-add-offer-item="${escapeHtml(id)}">PĹ™idat odĹ™ezek</button>`;
  openSheet(offer.title, body, null, footer, {
    ...options,
    restore: () => openOfferDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-move-offer-leftovers]")?.addEventListener("click", () => {
    moveOfferLeftoversToNewOffer(id);
  });
  els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
  els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  els.sheet.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemSheet(id));
  els.sheet.querySelectorAll("[data-reserve-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.reserveOfferItem, "", "confirmed"));
  });
  els.sheet.querySelectorAll("[data-alternate-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.alternateOfferItem, "", "alternate"));
  });
  els.sheet.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemSheet(button.dataset.offerId, button.dataset.editOfferItem));
  });
  els.sheet.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(button.dataset.offerId, button.dataset.deleteOfferItem));
  });
  els.sheet.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.itemId, button.dataset.editReservation));
  });
  els.sheet.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(button.dataset.offerId, button.dataset.itemId, button.dataset.deleteReservation));
  });
  resolvePhotos(els.sheet);
}
(() => {
  function eofLegacyRest(offer = {}) {
    const title = clean(offer.title);
    if (!/^Resty(?:\/pozn.*)?/i.test(title)) return false;
    return Boolean(clean(offer.restCustomerId) || clean(offer.restVarietyId) || clean(offer.restVarietyName) || clean(offer.note));
  }

  function eofRestNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function eofRestCustomer(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez z\u00e1kazn\u00edka";
  }

  function eofRestNotePill(offer = {}, max = 42) {
    return clean(offer.note) ? `\ud83d\udcdd ${mobileShortRestText(offer.note, max)}` : "";
  }

  const baseOpenOfferSheet = openOfferSheet;
  const baseOpenOfferDetailSheet = openOfferDetailSheet;

  isRestOffer = function isRestOfferEof(offer) {
    return normalizeOfferType(offer?.type) === "rests" || eofLegacyRest(offer);
  };

  offerTypeLabel = function offerTypeLabelEof(offerOrType) {
    if (typeof offerOrType === "string") return normalizeOfferType(offerOrType) === "rests" ? "Resty" : "Nab\u00eddka";
    return isRestOffer(offerOrType) ? "Resty" : "Nab\u00eddka";
  };

  mobileRestOfferVarietyLabel = function mobileRestOfferVarietyLabelEof(offer = {}) {
    return eofRestNames(offer).join(", ");
  };

  mobileRestOfferSummaryText = function mobileRestOfferSummaryTextEof(offer = {}) {
    return [eofRestCustomer(offer), mobileRestOfferVarietyLabel(offer)].filter(Boolean).join(" \u00b7 ");
  };

  function setupRestSheetSelectPicker(form, initialValue = "") {
    if (!form) return;
    const label = form.querySelector('[name="restVarietyPicker"]')?.closest("label");
    let picker = form.querySelector('[name="restVarietyPicker"]');
    const hidden = form.querySelector('textarea[name="restVarietyName"]');
    const list = form.querySelector("[data-rest-variety-list]");
    const addButton = form.querySelector("[data-rest-variety-add]");
    if (!label || !picker || !hidden || !list || !addButton) return;
    if (picker.tagName !== "SELECT") {
      const select = document.createElement("select");
      select.name = "restVarietyPicker";
      picker.replaceWith(select);
      picker = select;
      const heading = label.querySelector("span");
      if (heading) heading.textContent = "OdrĹŻda";
    }
    form.__restVarietyNames = restFormVarietyNames(initialValue || hidden.value);
    const renderPicker = () => {
      const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
      const previousValue = clean(picker.value);
      const options = [...(state.data.varieties || [])]
        .map((variety) => clean(variety.name))
        .filter(Boolean)
        .filter((name) => !selected.has(normalize(name)))
        .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }));
      picker.innerHTML = ['<option value="">Vyber odrĹŻdu</option>']
        .concat(options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`))
        .join("");
      if (options.includes(previousValue)) picker.value = previousValue;
    };
    const sync = () => {
      hidden.value = form.__restVarietyNames.join("\n");
      renderRestVarietySelection(list, form.__restVarietyNames);
      renderPicker();
    };
    const addCurrent = () => {
      const raw = clean(picker.value);
      if (!raw) return;
      if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(raw))) form.__restVarietyNames.push(raw);
      picker.value = "";
      sync();
    };
    addButton.onclick = addCurrent;
    list.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-remove]");
      if (!button) return;
      form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
      sync();
    };
    sync();
  }
  setupRestVarietyPickerForSheet = setupRestSheetSelectPicker;

  openOfferSheet = function openOfferSheetEof(id = "", defaults = {}) {
    const offer = findById("offers", id) || {};
    const initialIsRest = offer.id ? isRestOffer(offer) : normalizeOfferType(defaults.type) === "rests";
    if (!initialIsRest) return baseOpenOfferSheet(id, defaults);
    const initialDate = offer.date || clean(defaults.date) || todayInput();
    const names = eofRestNames(offer);
    const customers = [...state.data.customers].sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
    openSheet(offer.id ? "Upravit resty" : "Nov\u00e9 resty", `<form class="form-grid" id="sheetForm">
      <input name="type" type="hidden" value="rests">
      <input name="title" type="hidden" value="${escapeHtml(defaultOfferTitle("rests", initialDate))}">
      <input name="facebookPublishDate" type="hidden" value="${escapeHtml(initialDate)}">
      <input name="facebookPublishTime" type="hidden" value="20:00">
      <input name="status" type="hidden" value="p\u0159ipraven\u00e1">
      <input name="restVarietyId" type="hidden" value="">
      <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(initialDate)}"></label>
      <label class="field"><span>Z\u00e1kazn\u00edk</span><select name="restCustomerId"><option value="">Bez z\u00e1kazn\u00edka</option>${customers
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(offer.restCustomerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
        .join("")}</select></label>
      <label class="field"><span>OdrĹŻda</span><select name="restVarietyPicker"></select></label>
      <textarea name="restVarietyName" hidden aria-hidden="true">${escapeHtml(names.join("\n"))}</textarea>
      <div class="rest-variety-picker-row"><button class="button ghost" type="button" data-rest-variety-add>P\u0159idat odr\u016fdu</button></div>
      <div class="rest-variety-selection" data-rest-variety-list></div>
      <label class="field"><span>Pozn\u00e1mka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
    </form>`, () => {
      const form = document.querySelector("#sheetForm");
      const data = new FormData(form);
      const now = new Date().toISOString();
      const nextDate = clean(data.get("date")) || todayInput();
      const nextNames = restFormVarietyNames(data.get("restVarietyName"));
      const matchedVariety = nextNames.length === 1 ? findVarietyByName(nextNames[0]) : null;
      upsert("offers", normalizeOffer({
        ...offer,
        id: offer.id || uid(),
        title: defaultOfferTitle("rests", nextDate),
        date: nextDate,
        facebookPublishDate: nextDate,
        facebookPublishTime: "20:00",
        type: "rests",
        status: "p\u0159ipraven\u00e1",
        note: clean(data.get("note")),
        restCustomerId: clean(data.get("restCustomerId")),
        restVarietyId: clean(matchedVariety?.id),
        restVarietyName: nextNames.join("\n"),
        items: offer.items || [],
        createdAt: offer.createdAt || now,
        updatedAt: now,
      }));
    });
    setupRestSheetSelectPicker(els.sheet.querySelector("#sheetForm"), names.join("\n"));
  };

  openOfferDetailSheet = function openOfferDetailSheetEof(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer || !isRestOffer(offer)) return baseOpenOfferDetailSheet(id, options);
    state.activeOfferId = id;
    const names = eofRestNames(offer);
    const body = `<section class="offer-detail">
      <div class="pill-row"><span class="pill warn">Resty</span></div>
      <div class="rest-meta-stack">
        <div class="rest-meta-card"><small>Datum</small><strong>${escapeHtml(formatDate(offer.date))}</strong></div>
        <div class="rest-meta-card"><small>Z\u00e1kazn\u00edk</small><strong>${escapeHtml(eofRestCustomer(offer))}</strong></div>
        ${names.length ? `<div class="rest-meta-card"><small>${names.length > 1 ? "Odr\u016fdy" : "Odr\u016fda"}</small><strong>${escapeHtml(names.join(", "))}</strong></div>` : ""}
      </div>
      ${names.length ? `<div class="rest-variety-selection">${names.map((name) => `<span class="rest-variety-chip">${escapeHtml(name)}</span>`).join("")}</div>` : ""}
      ${clean(offer.note) ? `<div class="rest-meta-stack"><div class="rest-meta-card"><small>Pozn\u00e1mka</small><strong>${escapeHtml(offer.note)}</strong></div></div>` : ""}
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>Zav\u0159\u00edt</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
      <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvo\u0159it objedn\u00e1vku</button>`;
    openSheet(offer.title, body, null, footer, {
      ...options,
      restore: () => openOfferDetailSheet(id, { replace: true }),
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  };

  renderOffers = function renderOffersEof() {
    const offers = state.data.offers.filter(matchOffer).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!offers.length) return empty("\u017d\u00e1dn\u00e9 nab\u00eddky.");
    const groups = splitOffersByType(offers);
    const renderOfferGroup = (label, items) => {
      if (!items.length) return "";
      return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
        if (isRestOffer(offer)) {
          const names = eofRestNames(offer);
          const pills = names.slice(0, 4).map((name) => `\ud83c\udf3f ${name}`);
          if (names.length > 4) pills.push(`+${names.length - 4} dal\u0161\u00ed`);
          const notePill = eofRestNotePill(offer);
          if (notePill) pills.push(notePill);
          return card({
            id: offer.id,
            type: "offer",
            title: offer.title,
            sub: [formatDate(offer.date), eofRestCustomer(offer)].filter(Boolean).join(" \u00b7 "),
            pills,
            badges: [{ label: "Resty", className: "warn" }],
            thumb: "",
            thumbText: "R",
            actions: [["edit-offer", "\u270e"], ["delete-offer", "\u00d7"]],
          });
        }

        const offerItems = sortedOfferItems(offer);
        const reserved = offerReservedCount(offer);
        const total = offerTotalCount(offer);
        const available = offerAvailableCount(offer);
        const alternates = offerAlternateCount(offer);
        const coverImage = offerItems.map((item) => offerItemImage(item)).find(Boolean) || "";
        const itemPills = offerItems.slice(0, 4).map((item) => `\ud83c\udf3f ${offerItemName(item)}`);
        if (offerItems.length > 4) itemPills.push(`+${offerItems.length - 4} dal\u0161\u00ed`);
        return card({
          id: offer.id,
          type: "offer",
          title: offer.title,
          sub: `${formatDate(offer.date)} \u00b7 ${offerTypeLabel(offer)} \u00b7 ${offer.status}`,
          pills: [...itemPills, `Voln\u00e9 ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `N\u00e1hradn\u00edci ${alternates}` : ""],
          badges: [],
          thumb: coverImage,
          thumbText: initials(offer.title),
          actions: [["facebook-offer", "FB"], ["edit-offer", "\u270e"], ["delete-offer", "\u00d7"]],
        });
      }).join("")}`;
    };
    return [
      renderOfferGroup("Nab\u00eddky", groups.offers),
      renderOfferGroup("Resty", groups.rests),
    ].filter(Boolean).join("");
  };
})();
(() => {
  const previousOpenOfferDetailSheet = openOfferDetailSheet;

  function finalRestNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function finalRestCustomerText(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez zĂˇkaznĂ­ka";
  }

  renderRestVarietySelection = function renderRestVarietySelectionFinal(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>Ă—</span></button>`).join("")
      : '<div class="rest-variety-empty">ZatĂ­m bez odrĹŻd.</div>';
  };

  setupRestVarietyPickerForSheet = function setupRestVarietyPickerForSheetFinal(form, initialValue = "") {
    if (!form) return;
    let picker = form.elements.restVarietyPicker;
    let hidden = form.elements.restVarietyName;
    const list = form.querySelector("[data-rest-variety-list]");
    const addButton = form.querySelector("[data-rest-variety-add]");
    if (!picker || !hidden || !list || !addButton) return;
    if (picker.tagName !== "SELECT") {
      const label = picker.closest("label");
      const heading = label?.querySelector("span");
      if (heading) heading.textContent = "OdrĹŻda";
      const select = document.createElement("select");
      select.name = "restVarietyPicker";
      picker.replaceWith(select);
      picker = select;
    }
    form.__restVarietyNames = restFormVarietyNames(initialValue || hidden.value);
    const renderPickerOptions = () => {
      const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
      const previousValue = clean(picker.value);
      const options = [...(state.data.varieties || [])]
        .map((variety) => clean(variety.name))
        .filter(Boolean)
        .filter((name) => !selected.has(normalize(name)))
        .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }));
      picker.innerHTML = ['<option value="">Vyber odrĹŻdu</option>']
        .concat(options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`))
        .join("");
      if (options.some((name) => name === previousValue)) picker.value = previousValue;
    };
    const sync = () => {
      hidden.value = form.__restVarietyNames.join("\n");
      renderRestVarietySelection(list, form.__restVarietyNames);
      renderPickerOptions();
    };
    const addCurrent = () => {
      const raw = clean(picker.value);
      if (!raw) return;
      const exact = findVarietyByName(raw);
      const nextName = clean(exact?.name || raw);
      if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(nextName))) {
        form.__restVarietyNames.push(nextName);
      }
      picker.value = "";
      sync();
      picker.focus();
    };
    addButton.onclick = addCurrent;
    list.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-remove]");
      if (!button) return;
      form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
      sync();
    };
    sync();
  };

  openOfferDetailSheet = function openOfferDetailSheetNoDuplicateRest(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer || !isRestOffer(offer)) return previousOpenOfferDetailSheet(id, options);
    state.activeOfferId = id;
    const names = finalRestNames(offer);
    const body = `<section class="offer-detail">
      <div class="pill-row"><span class="pill warn">Resty</span></div>
      <div class="rest-meta-stack">
        <div class="rest-meta-card"><small>Datum</small><strong>${escapeHtml(formatDate(offer.date))}</strong></div>
        <div class="rest-meta-card"><small>ZĂˇkaznĂ­k</small><strong>${escapeHtml(finalRestCustomerText(offer))}</strong></div>
        ${names.length ? `<div class="rest-meta-card"><small>${names.length > 1 ? "OdrĹŻdy" : "OdrĹŻda"}</small><strong>${escapeHtml(names.join(", "))}</strong></div>` : ""}
      </div>
      ${clean(offer.note) ? `<div class="rest-meta-stack"><div class="rest-meta-card"><small>PoznĂˇmka</small><strong>${escapeHtml(offer.note)}</strong></div></div>` : ""}
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>ZavĹ™Ă­t</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
      <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">VytvoĹ™it objednĂˇvku</button>`;
    openSheet(offer.title, body, null, footer, {
      ...options,
      restore: () => openOfferDetailSheet(id, { replace: true }),
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  };

  document.querySelectorAll('[data-action="new-rest-offer"]').forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openOfferSheet("", { type: "rests" });
    };
  });
})();
(() => {
  function finalRestTitleMatch(value = "") {
    return /^Resty(?:\/pozn.*)?(?:\s|$)/i.test(clean(value));
  }

  function finalRestLikeOffer(offer = {}) {
    if (!offer) return false;
    if (normalizeOfferType(offer.type) === "rests") return true;
    if (clean(offer.restCustomerId) || clean(offer.restVarietyId) || clean(offer.restVarietyName)) return true;
    return finalRestTitleMatch(offer.title);
  }

  const previousNormalizeOfferBootstrap = normalizeOffer;
  normalizeOffer = function normalizeOfferRestBootstrap(offer = {}) {
    const shouldBeRest = finalRestLikeOffer(offer);
    const normalized = previousNormalizeOfferBootstrap({
      ...offer,
      type: shouldBeRest ? "rests" : offer?.type,
    });
    return shouldBeRest ? { ...normalized, type: "rests" } : normalized;
  };

  const previousIsRestOfferBootstrap = isRestOffer;
  isRestOffer = function isRestOfferRestBootstrap(offer = {}) {
    return finalRestLikeOffer(offer) || previousIsRestOfferBootstrap(offer);
  };

  if (Array.isArray(state?.data?.offers) && state.data.offers.length) {
    state.data.offers = state.data.offers.map((offer) => normalizeOffer(offer));
  }

  const rerender = () => {
    if (typeof render === "function") render();
  };

  rerender();
  setTimeout(rerender, 0);
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      rerender();
      requestAnimationFrame(rerender);
    });
  }
})();
(() => {
  const previousNormalizeOrderStorno = normalizeOrder;

  function ak91ParseMobileOrderStornoLines(value = "") {
    if (Array.isArray(value)) {
      return value
        .map((entry) => ({
          name: clean(entry?.name),
          quantity: Math.max(wholeNumber(entry?.quantity, 1), 1),
          unitPrice: normalizeAmount(entry?.unitPrice),
          currency: clean(entry?.currency) || "CZK",
          note: clean(entry?.note),
          createdAt: clean(entry?.createdAt),
        }))
        .filter((entry) => entry.name);
    }
    if (!clean(value)) return [];
    try {
      return ak91ParseMobileOrderStornoLines(JSON.parse(value));
    } catch {
      return [];
    }
  }

  normalizeOrder = function normalizeOrderWithStorno(order = {}) {
    const normalized = previousNormalizeOrderStorno(order);
    return {
      ...normalized,
      stornoLines: ak91ParseMobileOrderStornoLines(order.stornoLines || normalized.stornoLines),
      cancelledAt: clean(order.cancelledAt || normalized.cancelledAt),
      cancelledNote: clean(order.cancelledNote || normalized.cancelledNote),
    };
  };

  orderStornoLines = function orderStornoLinesMobile(order = {}) {
    return ak91ParseMobileOrderStornoLines(order?.stornoLines);
  };

  orderHasStorno = function orderHasStornoMobile(order = {}) {
    return Boolean(orderStornoLines(order).length || clean(order?.cancelledAt));
  };

  customerStornoOrders = function customerStornoOrdersMobile(customerId = "") {
    const id = clean(customerId);
    if (!id) return [];
    return (state.data.orders || []).filter((order) => clean(order.customerId) === id && orderHasStorno(order));
  };

  if (Array.isArray(state?.data?.orders) && state.data.orders.length) {
    state.data.orders = state.data.orders.map((order) => normalizeOrder(order));
  }
})();

(() => {
  const ak91OpenOrderSheet = openOrderSheet;
  const ak91PreviousOfferDetailSheet = openOfferDetailSheet;
  const ak91RenderVarieties = renderVarieties;
  const ak91RenderCrosses = renderCrosses;
  const ak91RenderSync = renderSync;
  const ak93EncodingMaps = new Map();

  function ak93ReverseByteMap(encoding) {
    if (ak93EncodingMaps.has(encoding)) return ak93EncodingMaps.get(encoding);
    const decoder = new TextDecoder(encoding);
    const map = new Map();
    for (let index = 0; index < 256; index += 1) {
      const decoded = decoder.decode(Uint8Array.of(index));
      if (!map.has(decoded)) map.set(decoded, index);
    }
    ak93EncodingMaps.set(encoding, map);
    return map;
  }

  function ak93RepairScore(text = "") {
    const markers = (text.match(/[\u00c3\u00c2\u00c4\u0139\u0102\u00e2\uFFFD]/g) || []).length;
    const accents = (text.match(/[áéíóúýčďěňřšťůžľĺôäÁÉÍÓÚÝČĎĚŇŘŠŤŮŽĽĹÔÄ×·]/g) || []).length;
    return accents - markers * 4;
  }

  function ak93LooksBroken(text = "") {
    return /[\u00c3\u00c2\u00c4\u0139\u0102\u00e2\uFFFD]/.test(text) || /Â·|Ã—|Ă—/.test(text);
  }

  function ak93DecodeSegment(segment, encoding) {
    if (!segment) return "";
    const map = ak93ReverseByteMap(encoding);
    const bytes = [];
    for (const ch of segment) {
      const code = ch.codePointAt(0);
      if (code <= 0x7f) {
        bytes.push(code);
        continue;
      }
      const mapped = map.get(ch);
      if (mapped == null) return segment;
      bytes.push(mapped);
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
    } catch {
      return segment;
    }
  }

  function ak93DecodeText(value, encoding) {
    const text = String(value ?? "");
    if (!text) return "";
    const map = ak93ReverseByteMap(encoding);
    let result = "";
    let buffer = "";
    const flush = () => {
      if (!buffer) return;
      result += ak93DecodeSegment(buffer, encoding);
      buffer = "";
    };
    for (const ch of text) {
      const code = ch.codePointAt(0);
      if (code <= 0x7f || map.has(ch)) {
        buffer += ch;
      } else {
        flush();
        result += ch;
      }
    }
    flush();
    return result;
  }

  function ak93RepairRawText(value) {
    const text = String(value ?? "");
    if (!text) return "";
    if (!ak93LooksBroken(text)) return text;
    let best = text;
    let bestScore = ak93RepairScore(text);
    for (let pass = 0; pass < 3; pass += 1) {
      let changed = false;
      for (const encoding of ["windows-1250", "windows-1252"]) {
        const candidate = ak93DecodeText(best, encoding);
        const candidateScore = ak93RepairScore(candidate);
        if (candidate !== best && candidateScore > bestScore) {
          best = candidate;
          bestScore = candidateScore;
          changed = true;
        }
      }
      if (!changed) break;
    }
    const pairFixed = replaceBrokenTextPairs(best);
    if (pairFixed !== best) {
      const pairScore = ak93RepairScore(pairFixed);
      if (pairScore >= bestScore) {
        best = pairFixed;
        bestScore = pairScore;
      }
    }
    return best;
  }

  function ak93DisplayText(value, fallback = "") {
    const text = clean(ak93RepairRawText(value));
    if (!text) return fallback;
    return text || fallback;
  }

  function ak93RepairSheetDom(root = els.sheet) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const fixed = ak93RepairRawText(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    });
    root.querySelectorAll("[title], [placeholder], input:not([type='hidden']), textarea").forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.hasAttribute("title")) {
        const currentTitle = node.getAttribute("title") || "";
        const fixedTitle = ak93RepairRawText(currentTitle);
        if (fixedTitle !== currentTitle) node.setAttribute("title", fixedTitle);
      }
      if ("placeholder" in node && node.placeholder) {
        const fixedPlaceholder = ak93RepairRawText(node.placeholder);
        if (fixedPlaceholder !== node.placeholder) node.placeholder = fixedPlaceholder;
      }
      if ((node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) && node.type !== "hidden" && node.type !== "password" && node.value) {
        const fixedValue = ak93RepairRawText(node.value);
        if (fixedValue !== node.value) node.value = fixedValue;
      }
    });

    const orderVarietySelect = root.querySelector('[name="orderVarietySelect"]');
    if (orderVarietySelect instanceof HTMLSelectElement) {
      const firstOption = orderVarietySelect.querySelector('option[value=""]');
      if (firstOption && firstOption.textContent !== "Vyber odrůdu") firstOption.textContent = "Vyber odrůdu";
    }

    root.querySelectorAll("[data-order-variety-add]").forEach((node) => {
      if (node.textContent !== "Přidat odrůdu") node.textContent = "Přidat odrůdu";
    });

    root.querySelectorAll(".rest-variety-empty").forEach((node) => {
      if (node.textContent !== "Zatím bez odrůd.") node.textContent = "Zatím bez odrůd.";
    });

    root.querySelectorAll("[data-sheet-order-cancel-all], [data-stable-order-cancel-all], [data-final-order-cancel-all]").forEach((node) => {
      if (node.textContent !== "Stornovat celou objednávku") node.textContent = "Stornovat celou objednávku";
    });

    root.querySelectorAll("button[data-sheet-order-storno], button[data-stable-order-storno], button[data-final-order-storno]").forEach((node) => {
      if (node.textContent !== "Stornovat") node.textContent = "Stornovat";
    });

    root.querySelectorAll("button[data-sheet-order-restore], button[data-stable-order-restore], button[data-final-order-restore]").forEach((node) => {
      if (node.textContent !== "Obnovit") node.textContent = "Obnovit";
    });
  }

  function ak93EnsureSheetObserver() {
    if (!els.sheet || els.sheet.dataset.ak93Observed === "1") return;
    let repairing = false;
    const observer = new MutationObserver(() => {
      if (repairing) return;
      repairing = true;
      try {
        ak93RepairSheetDom(els.sheet);
      } finally {
        repairing = false;
      }
    });
    observer.observe(els.sheet, { childList: true, subtree: true, characterData: true });
    els.sheet.dataset.ak93Observed = "1";
    els.sheet.__ak93Observer = observer;
  }

  renderRestVarietySelection = function renderRestVarietySelectionAK93(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(ak93DisplayText(name))} <span>×</span></button>`).join("")
      : '<div class="rest-variety-empty">Zatím bez odrůd.</div>';
  };

  if (typeof toast === "function") {
    const ak93PreviousToast = toast;
    toast = function toastAK93(message, ...rest) {
      return ak93PreviousToast.call(this, ak93DisplayText(message), ...rest);
    };
  }

  if (typeof window.prompt === "function") {
    const ak93PreviousPrompt = window.prompt.bind(window);
    window.prompt = function promptAK93(message, defaultValue) {
      return ak93PreviousPrompt(
        ak93DisplayText(message),
        typeof defaultValue === "string" ? ak93DisplayText(defaultValue) : defaultValue,
      );
    };
  }

  if (typeof window.confirm === "function") {
    const ak93PreviousConfirm = window.confirm.bind(window);
    window.confirm = function confirmAK93(message) {
      return ak93PreviousConfirm(ak93DisplayText(message));
    };
  }

  if (typeof defaultFacebookOfferTemplate === "function") {
    const ak93PreviousDefaultFacebookOfferTemplate = defaultFacebookOfferTemplate;
    defaultFacebookOfferTemplate = function defaultFacebookOfferTemplateAK93(settings = appSettings()) {
      return ak93RepairRawText(ak93PreviousDefaultFacebookOfferTemplate.call(this, settings));
    };
  }

  if (typeof renderFacebookOfferTemplate === "function") {
    const ak93PreviousRenderFacebookOfferTemplate = renderFacebookOfferTemplate;
    renderFacebookOfferTemplate = function renderFacebookOfferTemplateAK93(template, offer) {
      return ak93RepairRawText(ak93PreviousRenderFacebookOfferTemplate.call(this, ak93RepairRawText(template), offer));
    };
  }

  if (typeof buildFacebookOfferText === "function") {
    const ak93PreviousBuildFacebookOfferText = buildFacebookOfferText;
    buildFacebookOfferText = function buildFacebookOfferTextAK93(offer) {
      return ak93RepairRawText(ak93PreviousBuildFacebookOfferText.call(this, offer));
    };
  }

  if (typeof buildCustomerOrderText === "function") {
    const ak93PreviousBuildCustomerOrderText = buildCustomerOrderText;
    buildCustomerOrderText = function buildCustomerOrderTextAK93(order, customer) {
      return ak93RepairRawText(ak93PreviousBuildCustomerOrderText.call(this, order, customer));
    };
  }

  openSheet = function openSheetAK93(title, body, onSave, customFooter = "", options = {}) {
    if (!els.sheet.hidden && !options.replace && typeof state.currentSheetRestore === "function") {
      state.sheetStack.push(state.currentSheetRestore);
    }
    clearPendingPhotoPreviewUrls(els.sheet.querySelector("#sheetForm"));
    state.currentSheetRestore = typeof options.restore === "function" ? options.restore : null;
    els.sheet.hidden = false;
    els.sheet.innerHTML = `<section class="sheet" role="dialog" aria-modal="true">
      <header class="sheet-header"><h2>${escapeHtml(ak93DisplayText(title))}</h2><button class="round" type="button" data-close-sheet>×</button></header>
      <div class="sheet-body">${body}</div>
      <footer class="sheet-footer">${customFooter || `<button class="button" type="button" data-close-sheet>Zrušit</button><button class="button primary" type="button" data-save-sheet>Uložit</button>`}</footer>
    </section>`;
    ak93RepairSheetDom(els.sheet);
    els.sheet.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
    els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", async () => {
      const saveButton = els.sheet.querySelector("[data-save-sheet]");
      if (saveButton?.disabled) return;
      const form = els.sheet.querySelector("form");
      if (form && !form.reportValidity()) return;
      const previousLabel = saveButton?.textContent;
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = "Ukládám...";
      }
      try {
        const result = await onSave?.();
        if (result === false) return;
        saveData();
        closeSheet();
        render();
        toast("Uloženo.");
      } catch (error) {
        console.error(error);
        toast("Uložení se nepodařilo.");
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = previousLabel || "Uložit";
        }
      }
    });
  }

  function ak93OfferTypeLabel(offerOrType) {
    return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
      ? "Resty"
      : "Nabídka";
  }

  const ak93Icons = {
    share: `<svg class="action-icon-svg action-icon-facebook" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="#1877F2"></circle>
      <path fill="#ffffff" d="M13.69 20v-7.02h2.36l.35-2.74h-2.71V8.49c0-.79.22-1.33 1.36-1.33H16.5V4.71c-.25-.03-1.08-.11-2.05-.11-2.03 0-3.42 1.24-3.42 3.51v1.96H8.75v2.74h2.28V20h2.66z"></path>
    </svg>`,
    copy: "&#128203;",
    message: "&#128172;",
    edit: "&#9998;",
    delete: "&times;",
    add: "&#10133;",
    download: "&#8681;",
  };

  function ak93ActionIcon(action = "", label = "") {
    const key = clean(action);
    if (key === "facebook-offer") return ak93Icons.share;
    if (key === "copy-order") return ak93Icons.copy;
    if (key === "toggle-order-text-sent") return ak93Icons.message;
    if (key === "edit-order" || key === "edit-customer" || key === "edit-variety" || key === "edit-cross" || key === "edit-offer") return ak93Icons.edit;
    if (key === "delete-order" || key === "delete-customer" || key === "delete-variety" || key === "delete-cross" || key === "delete-offer") return ak93Icons.delete;
    if (key === "order-customer") return ak93Icons.add;
    if (key === "download-cross") return ak93Icons.download;
    const text = ak93DisplayText(label).trim().toLowerCase();
    if (["fb", "sta"].includes(text) || text.includes("facebook")) return ak93Icons.share;
    if (text.startsWith("kop")) return ak93Icons.copy;
    if (text.startsWith("txt")) return ak93Icons.message;
    if (text.startsWith("upr")) return ak93Icons.edit;
    if (text === "x") return ak93Icons.delete;
    if (text === "+") return ak93Icons.add;
    return escapeHtml(ak93DisplayText(label));
  }

  function ak93ActionTitle(action = "", label = "") {
    const key = clean(action);
    return {
      "facebook-offer": "Facebook příspěvek",
      "copy-order": "Kopírovat objednávku",
      "toggle-order-text-sent": "Text zákazníkovi",
      "edit-order": "Upravit objednávku",
      "delete-order": "Smazat objednávku",
      "order-customer": "Nová objednávka",
      "edit-customer": "Upravit zákazníka",
      "delete-customer": "Smazat zákazníka",
      "edit-variety": "Upravit odrůdu",
      "delete-variety": "Smazat odrůdu",
      "download-cross": "Stáhnout kartu",
      "edit-cross": "Upravit křížení",
      "delete-cross": "Smazat křížení",
      "edit-offer": "Upravit nabídku",
      "delete-offer": "Smazat nabídku",
    }[key] || ak93DisplayText(label, "Akce");
  }

  const ak96CurrencyToken = "(?:Kč|KÄŤ|kc|czk|eur|€)";
  const ak96QuantityToken = "(?:ks|kus|kusy|řízků|Ĺ™Ă­zkĹŻ|rizku|sazenic)";

  orderLineQuantity = function orderLineQuantityAK96(line = "") {
    const value = clean(line);
    const match =
      value.match(/\b(\d+)\s*x\b/iu) ||
      value.match(/\bx\s*(\d+)\b/iu) ||
      value.match(new RegExp(`\\b(\\d+)\\s*${ak96QuantityToken}\\b`, "iu"));
    const quantity = match ? Number(match[1]) : 1;
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  };

  orderLineUnitPrice = function orderLineUnitPriceAK96(line = "") {
    const value = clean(line);
    const trailingQuantityToken = `(?:\\d+\\s*x|x\\s*\\d+|\\d+\\s*${ak96QuantityToken})`;
    const pricedAtEnd =
      value.match(new RegExp(`(?:-|–|—)\\s*(\\d+(?:[,.]\\d+)?)\\s*${ak96CurrencyToken}?(?:\\s*${trailingQuantityToken})?\\s*$`, "iu")) ||
      value.match(new RegExp(`(?:@|=)\\s*(\\d+(?:[,.]\\d+)?)\\s*${ak96CurrencyToken}?(?:\\s*${trailingQuantityToken})?\\s*$`, "iu"));
    if (pricedAtEnd) return number(pricedAtEnd[1]);
    const inline = value.match(new RegExp(`(\\d+(?:[,.]\\d+)?)\\s*${ak96CurrencyToken}(?=\\s*(?:${trailingQuantityToken})?\\s*$)`, "iu"));
    return inline ? number(inline[1]) : Number.NaN;
  };

  parseSheetOrderLineName = function parseSheetOrderLineNameAK96(line = "") {
    return clean(line)
      .replace(/\b\d+\s*x\b/giu, " ")
      .replace(/\bx\s*\d+\b/giu, " ")
      .replace(new RegExp(`\\b\\d+\\s*${ak96QuantityToken}\\b`, "giu"), " ")
      .replace(new RegExp(`(?:-|–|—)\\s*\\d+(?:[,.]\\d+)?\\s*${ak96CurrencyToken}?\\s*$`, "iu"), " ")
      .replace(new RegExp(`(?:@|=)\\s*\\d+(?:[,.]\\d+)?\\s*${ak96CurrencyToken}?\\s*$`, "iu"), " ")
      .replace(new RegExp(`\\b\\d+(?:[,.]\\d+)?\\s*${ak96CurrencyToken}\\b`, "giu"), " ")
      .replace(/[=:@]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  offerOrderLineText = function offerOrderLineTextAK96(name, quantity, unitPrice) {
    return `${clean(name)} ${wholeNumber(quantity, 1)}x - ${normalizeAmount(unitPrice)} Kč`.trim();
  };

  orderFeeLines = function orderFeeLinesAK97(order, customer) {
    const currency = "CZK";
    const shipping = number(order.shippingFee);
    const packing = number(order.packingFee);
    const cod = number(order.codFee);
    const parts = [];
    if (Number.isFinite(shipping) && shipping > 0) parts.push(`${orderShippingLabel(order, customer)} ${formatMoney(shipping, currency)}`);
    if (Number.isFinite(packing) && packing > 0) parts.push(`Balné ${formatMoney(packing, currency)}`);
    if (Number.isFinite(cod) && cod > 0) parts.push(`Dobírka ${formatMoney(cod, currency)}`);
    normalizeNamedFees(order.extraFees).forEach((fee) => {
      const amount = number(fee.amount);
      if (clean(fee.name) && Number.isFinite(amount) && amount > 0) parts.push(`${fee.name} ${formatMoney(amount, currency)}`);
    });
    return parts;
  };

  buildCustomerOrderText = function buildCustomerOrderTextAK97(order, customer) {
    const settings = appSettings();
    const lines = clean(order.varietiesText).split(/\n+/).map(clean).filter(Boolean);
    lines.push(...orderFeeLines(order, customer));
    const totalCzk = orderFinalTotal(order);
    const eur = shouldShowEur(customer) ? orderPriceEur(order, totalCzk) : null;
    const paymentLines = [
      clean(settings.paymentAccountName) ? `Jméno a příjmení: ${settings.paymentAccountName}` : "",
      clean(settings.paymentAccountNumber) ? `Číslo účtu: ${settings.paymentAccountNumber}` : "",
      clean(settings.paymentIban) ? `IBAN: ${settings.paymentIban}` : "",
      clean(settings.paymentSwift) ? `SWIFT / BIC: ${settings.paymentSwift}` : "",
    ].filter(Boolean);
    const parts = [
      "Dobrý den,",
      "posílám přehled objednávky:",
      "",
      lines.join("\n"),
      "",
      `Celkem v CZK: ${formatMoney(totalCzk, "CZK")}`,
      eur ? `K úhradě v EUR: ${formatMoney(eur, "EUR")}` : "",
      paymentLines.length ? "\nÚdaje k platbě:" : "",
      paymentLines.join("\n"),
      "",
      "Děkuji.",
    ];
    return parts.filter((part, index) => part || parts[index - 1] !== "").join("\n").trim();
  };

  card = function cardAK93({ id, type, tone = "", title, sub = "", price = "", pills = [], badges = [], actions = [], thumb = "", thumbText = "" }) {
    const thumbRef = thumbPreviewRef(thumb);
    const thumbHtml = thumb || thumbText ? `<span class="thumb">${thumb ? `<img data-photo-ref="${escapeHtml(thumbRef)}" alt="">` : escapeHtml(thumbText)}</span>` : "";
    return `<article class="card card-${escapeHtml(type)} ${tone} ${badges.length ? "has-status" : ""}" data-card="${type}" data-id="${escapeHtml(id)}">
      ${badges.length ? `<div class="status-badges">${badges.filter(Boolean).map(renderCardPill).join("")}</div>` : ""}
      <div class="card-row">
        ${thumbHtml}
        <div class="card-main">
          <strong class="title">${title}</strong>
          ${sub ? `<small>${sub}</small>` : ""}
          ${price ? `<div class="price">${price}</div>` : ""}
          ${pills.length ? `<div class="pill-row">${pills.filter(Boolean).map(renderCardPill).join("")}</div>` : ""}
        </div>
      </div>
      ${actions.length ? `<div class="card-actions">${actions.map(([action, label]) => {
        const titleText = ak93ActionTitle(action, label);
        return `<button class="round" type="button" data-action-row="${escapeHtml(action)}" data-id="${escapeHtml(id)}" title="${escapeHtml(titleText)}" aria-label="${escapeHtml(titleText)}">${ak93ActionIcon(action, label)}</button>`;
      }).join("")}</div>` : ""}
    </article>`;
  };

  function ak93OfferItemName(item = {}) {
    return ak93DisplayText(offerItemNameSafe(item), ak93DisplayText(item?.varietyName || item?.name, "Odřezek"));
  }

  function ak93CrossStageLabel(stage = "") {
    return {
      opyleno: "Opyleno",
      vyseto: "Vyseto",
      roste: "Roste",
      hotovo: "Hotovo",
    }[clean(stage)] || ak93DisplayText(crossStageText(stage), "Opyleno");
  }

  function ak93CrossRatingLabel(rating = "") {
    return {
      krasna: "Krásná",
      hnusna: "Hnusná",
      nejista: "Nejistá",
    }[clean(rating)] || "";
  }

  function ak93PhotoCountLabel(count = 0) {
    const value = wholeNumber(count, 0);
    if (!value) return "Bez fotky";
    if (value === 1) return "1 fotka";
    if (value >= 2 && value <= 4) return `${value} fotky`;
    return `${value} fotek`;
  }

  function ak93CatalogThumbMarkup(image = "", fallbackText = "", alt = "") {
    const safeImage = clean(image);
    const safeFallback = ak93DisplayText(fallbackText, "AK");
    if (safeImage) {
      const ownerThumbRef = ak93OwnerThumbnailFallbackRef(safeImage, safeFallback);
      const ownerFolderRef = ak93OwnerThumbnailFolderFallbackRef(safeImage, safeFallback);
      return `<img class="catalog-mobile-photo" data-photo-ref="${escapeHtml(thumbPreviewRef(safeImage))}" data-photo-full-ref="${escapeHtml(safeImage)}" data-photo-owner-thumb-ref="${escapeHtml(ownerThumbRef)}" data-photo-owner-folder-ref="${escapeHtml(ownerFolderRef)}" data-photo-allow-fallback="1" alt="${escapeHtml(alt || safeFallback)}">`;
    }
    return `<div class="catalog-mobile-placeholder"><span class="catalog-mobile-placeholder-mark">${escapeHtml(initials(safeFallback))}</span></div>`;
  }

  function ak93OwnerThumbnailFallbackRef(ref = "", ownerName = "") {
    const value = clean(ref);
    if (!value.startsWith(SUPABASE_PHOTO_PREFIX)) return "";
    const path = parseSupabasePhotoRef(value);
    const parts = path.split("/");
    if (parts.length < 3) return "";
    const fileName = parts[parts.length - 1];
    const userId = parts[0];
    const ownerFolder = safeFileName(ownerName, "");
    if (!userId || !ownerFolder || !fileName) return "";
    const fallbackPath = `${userId}/${ownerFolder}/${SUPABASE_THUMB_DIR}/${fileName.replace(/\.[a-z0-9]+$/i, ".jpg")}`;
    return `${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(fallbackPath)}`;
  }

  function ak93OwnerThumbnailFolderFallbackRef(ref = "", ownerName = "") {
    const value = clean(ref);
    if (!value.startsWith(SUPABASE_PHOTO_PREFIX)) return "";
    const path = parseSupabasePhotoRef(value);
    const userId = path.split("/")[0];
    const ownerFolder = safeFileName(ownerName, "");
    if (!userId || !ownerFolder) return "";
    return `supabase-folder-thumb:${encodeURIComponent(`${userId}/${ownerFolder}/${SUPABASE_THUMB_DIR}/`)}`;
  }

  function ak93CatalogActionButtons(id, actions = []) {
    if (!actions.length) return "";
    return `<div class="catalog-mobile-actions">${actions.map(([action, label]) => {
      const titleText = ak93ActionTitle(action, label);
      return `<button class="round" type="button" data-action-row="${escapeHtml(action)}" data-id="${escapeHtml(id)}" title="${escapeHtml(titleText)}" aria-label="${escapeHtml(titleText)}">${ak93ActionIcon(action, label)}</button>`;
    }).join("")}</div>`;
  }

  function ak93VarietyCatalogCard(variety) {
    const name = ak93DisplayText(variety.name, "Odrůda");
    const images = varietyImages(variety);
    const note = ak93DisplayText(variety.note);
    const usage = varietyUsageCount(variety.name);
    const priceLabel = variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny";
    const winterSeason = selectedWinteringSeason();
    const winterStatus = varietyWinteringStatus(variety, winterSeason);
    const winterBadgeTitle = winteringStatusLabel(winterStatus);
    const winterBadge = `<span class="catalog-mobile-winter-badge ${winteringStatusClassName(winterStatus)}" title="${escapeHtml(winterBadgeTitle)}" aria-label="${escapeHtml(winterBadgeTitle)}">❄</span>`;
    return `<article class="card catalog-mobile-card catalog-mobile-variety ${winteringStatusClassName(winterStatus)}" data-card="variety" data-id="${escapeHtml(variety.id)}">
      <div class="catalog-mobile-visual">
        ${winterBadge}
        ${ak93CatalogThumbMarkup(images[0], name, name)}
      </div>
      <div class="catalog-mobile-copy">
        <strong class="catalog-mobile-name">${escapeHtml(name)}</strong>
        ${note ? `<p class="catalog-mobile-note">${escapeHtml(note)}</p>` : ""}
        <div class="catalog-mobile-tags">
          ${renderCardPill(`${usage}× v objednávce${usage === 1 ? "" : "ch"}`)}
        </div>
        <div class="catalog-mobile-footer">
          <span class="catalog-mobile-price">${escapeHtml(priceLabel)}</span>
          ${ak93CatalogActionButtons(variety.id, [["edit-variety", ak93Icons.edit], ["delete-variety", ak93Icons.delete]])}
        </div>
      </div>
    </article>`;
  }

  function ak93CrossToneClass(cross) {
    if (clean(cross.resultRating) === "hnusna") return "reject";
    if (clean(cross.resultRating) === "krasna" && clean(cross.stage) === "hotovo") return "done";
    if (["vyseto", "roste"].includes(clean(cross.stage))) return "progress";
    return "attention";
  }

  function ak93CrossPreviewNote(cross) {
    const lineage = normalize(crossLineage(cross)).replace(/\s*[×x]\s*/g, " x ").replace(/\s+/g, " ").trim();
    const lines = ak93DisplayText(cross?.note)
      .split(/\n+/)
      .map((line) => ak93DisplayText(line))
      .filter(Boolean);
    if (!lines.length) return "";
    return unique(lines.filter((line) => {
      const comparable = normalize(line).replace(/\s*[×x]\s*/g, " x ").replace(/\s+/g, " ").trim();
      const isGeneratedSeedlingLine = /^semenac z krizen/i.test(comparable);
      const isGeneratedCrossLine = /^krizenec:?/i.test(comparable);
      const hasLineage = Boolean(lineage) && comparable.includes(lineage);
      return !(hasLineage && (isGeneratedSeedlingLine || isGeneratedCrossLine));
    })).join("\n");
  }

  function ak93CrossCatalogCard(cross) {
    const lineage = ak93DisplayText(crossLineage(cross), "Křížení");
    const seedlingName = ak93DisplayText(cross.seedlingName);
    const note = ak93CrossPreviewNote(cross);
    const title = seedlingName || lineage;
    const rating = ak93CrossRatingLabel(cross.resultRating);

    return `<article class="card catalog-mobile-card catalog-mobile-cross ${ak93CrossToneClass(cross)}" data-card="cross" data-id="${escapeHtml(cross.id)}">
      <div class="catalog-mobile-visual">
        ${ak93CatalogThumbMarkup(crossSeedlingImages(cross)[0], title, title)}
      </div>
      <div class="catalog-mobile-copy">
        <strong class="catalog-mobile-name">${escapeHtml(title)}</strong>
        ${seedlingName ? `<p class="catalog-mobile-lineage">${escapeHtml(lineage)}</p>` : ""}
        ${note ? `<p class="catalog-mobile-note">${escapeHtml(note)}</p>` : ""}
        ${rating ? `<div class="catalog-mobile-tags">${renderCardPill(rating)}</div>` : ""}
        <div class="catalog-mobile-footer actions-only">
          ${ak93CatalogActionButtons(cross.id, [["edit-cross", ak93Icons.edit], ["delete-cross", ak93Icons.delete]])}
        </div>
      </div>
    </article>`;
  }

  function ak93ReservationLineMarkup(offer, item, reservation) {
    const customer = findCustomer(reservation.customerId);
    const status = reservationStatusValue(reservation.status);
    const offerId = escapeHtml(offer.id);
    const itemId = escapeHtml(item.id);
    const reservationId = escapeHtml(reservation.id);
    const customerLabel = ak93DisplayText(customerName(customer), "Bez zákazníka");
    const note = ak93DisplayText(reservation.note);
    return `<div class="reservation-line">
      <strong>${escapeHtml(customerLabel)}</strong>
      <span>${number(reservation.quantity) || 1} ks</span>
      <span class="pill ${status === "alternate" ? "warn" : "ok"}">${status === "alternate" ? "Náhradník" : "Potvrzeno"}</span>
      ${reservationLinkedToOrder(offer, item, reservation) ? `<span class="pill ok">Objednávka</span>` : ""}
      ${note ? `<small>${escapeHtml(note)}</small>` : ""}
      <span class="reservation-line-actions">
        <button class="round" type="button" data-offer-id="${offerId}" data-item-id="${itemId}" data-edit-reservation="${reservationId}" title="Upravit rezervaci">${ak93Icons.edit}</button>
        <button class="round" type="button" data-offer-id="${offerId}" data-item-id="${itemId}" data-delete-reservation="${reservationId}" title="Smazat rezervaci">${ak93Icons.delete}</button>
      </span>
    </div>`;
  }

  function ak93OfferItemDetailMarkup(offer, item) {
    const reserved = offerItemReservedCount(item);
    const alternate = offerItemAlternateCount(item);
    const confirmed = offerItemConfirmedCount(item);
    const total = number(item.quantity);
    const available = Math.max(0, total - confirmed);
    const image = offerItemImageSafe(item);
    const offerId = escapeHtml(offer.id);
    const itemId = escapeHtml(item.id);
    const orderProgress = offerItemOrderProgress(offer, item);
    const orderProgressLabel = orderProgress.state === "done"
      ? "V objednávce"
      : orderProgress.state === "partial"
        ? "Částečně v objednávce"
        : ak93DisplayText(orderProgress.label);
    const orderFlag = orderProgress.state
      ? `<span class="offer-order-flag offer-order-flag-${escapeHtml(orderProgress.state)}" title="${escapeHtml(orderProgressLabel)}">OBJ</span>`
      : "";
    const itemName = ak93OfferItemName(item);
    const note = ak93DisplayText(item.note);
    const priceText = formatMoney(item.price, item.currency || "CZK");
    const priceBadge = priceText === "Bez ceny" ? priceText : `${priceText} / ks`;
    const emptyReservationsText = "Zatím bez rezervací.";
    return `<article class="offer-item offer-item-catalog ${available <= 0 ? "sold-out" : ""} ${orderProgress.state ? `is-order-${orderProgress.state}` : ""}">
      <div class="offer-item-head offer-item-head-catalog">
        <span class="thumb offer-thumb-wrap">${image ? `<img data-photo-ref="${escapeHtml(image)}" alt="">` : escapeHtml(initials(itemName || "O"))}${orderFlag}</span>
        <div class="offer-item-copy">
          <strong>${escapeHtml(itemName)}</strong>
          ${note ? `<p class="offer-item-note">${escapeHtml(note)}</p>` : ""}
        </div>
      </div>
      <div class="offer-item-footer">
        <div class="pill-row offer-stock offer-stock-catalog">
        <span class="pill">Volné ${available}</span>
        <span class="pill">Potvrzeno ${confirmed}</span>
        ${alternate ? `<span class="pill">Náhradník ${alternate}</span>` : ""}
        ${reserved > confirmed ? `<span class="pill">Rezervace ${reserved}</span>` : ""}
          ${orderProgressLabel ? `<span class="pill ${orderProgress.state === "done" ? "paid" : orderProgress.state === "partial" ? "ready" : ""}">${escapeHtml(orderProgressLabel)}</span>` : ""}
        </div>
        <span class="offer-item-price-row">
          <span class="offer-qty-tag">${escapeHtml(`${total || 0} ks`)}</span>
          <span class="offer-price-tag">${escapeHtml(priceBadge)}</span>
        </span>
      </div>
      <div class="offer-item-actions offer-item-actions-catalog">
        <button class="button primary" type="button" data-offer-id="${offerId}" data-reserve-offer-item="${itemId}" ${available <= 0 ? "disabled" : ""}>Rezervovat</button>
        <button class="button" type="button" data-offer-id="${offerId}" data-alternate-offer-item="${itemId}">Náhradník</button>
        <button class="button" type="button" data-offer-id="${offerId}" data-edit-offer-item="${itemId}">Upravit</button>
        <button class="button danger" type="button" data-offer-id="${offerId}" data-delete-offer-item="${itemId}">Smazat</button>
      </div>
      <div class="reservation-list">
        ${(item.reservations || []).length ? sortedReservations(item).map((reservation) => ak93ReservationLineMarkup(offer, item, reservation)).join("") : `<small class="sub">${emptyReservationsText}</small>`}
      </div>
    </article>`;
  }

  function ak93RenderVarieties() {
    const varieties = (state.data.varieties || [])
      .filter(matchVariety)
      .slice()
      .sort((a, b) => {
        if (state.filter === "newest") {
          return String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || "")) || naturalCompare(ak93DisplayText(a?.name, ""), ak93DisplayText(b?.name, ""));
        }
        return naturalCompare(ak93DisplayText(a?.name, ""), ak93DisplayText(b?.name, ""));
      });
    if (!varieties.length) return empty("Žádné odrůdy.");
    return varieties.map((variety) => ak93VarietyCatalogCard(variety)).join("");
  }

  function ak93RenderCrosses() {
    const crosses = (state.data.crosses || [])
      .filter(matchCross)
      .slice()
      .sort((a, b) => String(b.pollinatedAt || "").localeCompare(String(a.pollinatedAt || "")));
    if (!crosses.length) return empty("Žádné křížení.");
    return crosses.map((cross) => ak93CrossCatalogCard(cross)).join("");
  }

  function ak93OpenStandardOfferDetail(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer) return;
    state.activeOfferId = id;
    const items = sortedOfferItems(offer);
    const reserved = offerReservedCount(offer);
    const total = offerTotalCount(offer);
    const available = Math.max(0, total - reserved);
    const title = ak93DisplayText(offer.title, "Nabídka");
    const statusLabel = ak91OfferStatusLabel(offer.status);
    const note = ak93DisplayText(offer.note);
    const body = `<section class="offer-detail">
      <div class="offer-stats">
        <span><strong>${items.length}</strong><small>odřezků</small></span>
        <span><strong>${total}</strong><small>kusů</small></span>
        <span><strong>${reserved}</strong><small>rezervací</small></span>
        <span><strong>${available}</strong><small>volné</small></span>
      </div>
      <div class="pill-row"><span class="pill">${ak93OfferTypeLabel(offer)}</span><span class="pill">${escapeHtml(statusLabel)}</span></div>
      ${note ? `<p class="sub">${escapeHtml(note)}</p>` : ""}
      <button class="button" type="button" data-move-offer-leftovers="${escapeHtml(id)}">Přesunout neprodané do nové nabídky</button>
      <button class="button primary" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">Připravit Facebook příspěvek</button>
      <div class="offer-items offer-items-catalog">
        ${items.length ? items.map((item) => ak93OfferItemDetailMarkup(offer, item)).join("") : `<div class="empty light">Zatím bez odřezků.</div>`}
      </div>
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>Zavřít</button>
      <button class="button" type="button" data-prepare-facebook-offer="${escapeHtml(id)}" onclick="window.__akPrepareFacebookOffer?.(this.dataset.prepareFacebookOffer); return false;">Facebook</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit nabídku</button>
      <button class="button" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvořit objednávky</button>
      <button class="button primary" type="button" data-add-offer-item="${escapeHtml(id)}">Přidat odřezek</button>`;
    openSheet(title, body, null, footer, {
      ...options,
      restore: () => ak91OpenOfferDetail(id, { replace: true }),
    });
    els.sheet.querySelector("[data-move-offer-leftovers]")?.addEventListener("click", () => {
      moveOfferLeftoversToNewOffer(id);
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
    els.sheet.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemSheet(id));
    els.sheet.querySelectorAll("[data-reserve-offer-item]").forEach((button) => {
      button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.reserveOfferItem, "", "confirmed"));
    });
    els.sheet.querySelectorAll("[data-alternate-offer-item]").forEach((button) => {
      button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.alternateOfferItem, "", "alternate"));
    });
    els.sheet.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
      button.addEventListener("click", () => openOfferItemSheet(button.dataset.offerId, button.dataset.editOfferItem));
    });
    els.sheet.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
      button.addEventListener("click", () => deleteOfferItem(button.dataset.offerId, button.dataset.deleteOfferItem));
    });
    els.sheet.querySelectorAll("[data-edit-reservation]").forEach((button) => {
      button.addEventListener("click", () => openReservationSheet(button.dataset.offerId, button.dataset.itemId, button.dataset.editReservation));
    });
    els.sheet.querySelectorAll("[data-delete-reservation]").forEach((button) => {
      button.addEventListener("click", () => deleteReservation(button.dataset.offerId, button.dataset.itemId, button.dataset.deleteReservation));
    });
    resolvePhotos(els.sheet);
  }

  function ak91LatestStornoNote(order = {}) {
    const cancelledNote = clean(order?.cancelledNote);
    if (cancelledNote) return cancelledNote;
    const latestLine = orderStornoLines(order)
      .slice()
      .reverse()
      .find((entry) => clean(entry?.note));
    return clean(latestLine?.note);
  }

  function ak91CustomerStornoMeta(customerId = "") {
    const id = clean(customerId);
    if (!id) return { count: 0, note: "", latest: null };
    const orders = customerStornoOrders(id)
      .slice()
      .sort((a, b) => String(b.updatedAt || b.cancelledAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.cancelledAt || a.orderDate || "")));
    const latest = orders[0] || null;
    return {
      count: orders.length,
      note: latest ? ak91LatestStornoNote(latest) : "",
      latest,
    };
  }

  function ak91CustomerNonPaymentMeta(customerId = "") {
    const id = clean(customerId);
    if (!id) return { count: 0, note: "", latest: null };
    const orders = (state.data.orders || [])
      .filter((order) => clean(order.customerId) === id && ak91StatusKey(order.paymentStatus) === "overdue")
      .slice()
      .sort((a, b) => String(b.updatedAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.orderDate || "")));
    const latest = orders[0] || null;
    return {
      count: orders.length,
      note: clean(latest?.note),
      latest,
    };
  }

  function ak91OrderStornoMeta(order = {}) {
    const customerMeta = ak91CustomerStornoMeta(order?.customerId);
    if (customerMeta.count) return customerMeta;
    return {
      count: orderHasStorno(order) ? 1 : 0,
      note: ak91LatestStornoNote(order),
      latest: orderHasStorno(order) ? order : null,
    };
  }

  function ak91NonPaymentMarkup(meta = {}) {
    if (!meta.count) return "";
    return [
      `<span class="customer-storno-mobile">Neplatí${meta.count > 1 ? ` (${meta.count})` : ""}</span>`,
      meta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(ak93DisplayText(meta.note))}</span>` : "",
    ].filter(Boolean).join("");
  }

  function ak91StornoMarkup(meta = {}) {
    if (!meta.count) return "";
    return [
      `<span class="customer-storno-mobile">Pozor, stornuje${meta.count > 1 ? ` (${meta.count})` : ""}</span>`,
      meta.note ? `<span class="customer-storno-mobile-note">${escapeHtml(ak93DisplayText(meta.note))}</span>` : "",
    ].filter(Boolean).join("");
  }

  function ak91RestNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName).map((name) => ak93DisplayText(name)).filter(Boolean);
    if (names.length) return names;
    const linked = findById("varieties", clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    const fallbackName = ak93DisplayText(linked?.name || offer.restVarietyName);
    return fallbackName ? [fallbackName] : [];
  }

  function ak91RestCustomerText(offer = {}) {
    return ak93DisplayText(customerName(findCustomer(clean(offer.restCustomerId))), "Bez zákazníka");
  }

  function ak91OpenRestDetail(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer) return;
    state.activeOfferId = id;
    const names = ak91RestNames(offer);
    const body = `<section class="offer-detail">
      <div class="pill-row"><span class="pill warn">Resty</span></div>
      <div class="rest-meta-stack">
        <div class="rest-meta-card"><small>Datum</small><strong>${escapeHtml(formatDate(offer.date))}</strong></div>
        <div class="rest-meta-card"><small>Zákazník</small><strong>${escapeHtml(ak91RestCustomerText(offer))}</strong></div>
        ${names.length ? `<div class="rest-meta-card"><small>${names.length > 1 ? "Odrůdy" : "Odrůda"}</small><strong>${escapeHtml(names.join(", "))}</strong></div>` : ""}
      </div>
      ${clean(offer.note) ? `<div class="rest-meta-stack"><div class="rest-meta-card"><small>Poznámka</small><strong>${escapeHtml(ak93DisplayText(offer.note))}</strong></div></div>` : ""}
    </section>`;
    const footer = `<button class="button" type="button" data-close-sheet>Zavřít</button>
      <button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit resty</button>
      <button class="button primary" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvořit objednávku</button>`;
    openSheet(ak93DisplayText(offer.title, "Resty"), body, null, footer, {
      ...options,
      restore: () => ak91OpenOfferDetail(id, { replace: true }),
    });
    els.sheet.querySelector("[data-edit-offer-detail]")?.addEventListener("click", () => openOfferSheet(id, { type: "rests" }));
    els.sheet.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(id));
  }

  function ak91RenderOfferCard(offer) {
    if (isRestOffer(offer)) {
      const names = ak91RestNames(offer);
      const pills = names.slice(0, 4);
      if (names.length > 4) pills.push(`+${names.length - 4} další`);
      if (clean(offer.note)) pills.push({ label: ak93DisplayText(offer.note), className: "warn" });
      return card({
        id: offer.id,
        type: "offer",
        title: escapeHtml(ak93DisplayText(offer.title, "Resty")),
        sub: [formatDate(offer.date), ak91RestCustomerText(offer)].filter(Boolean).join(" · "),
        pills,
        badges: [{ label: "Resty", className: "warn" }],
        thumbText: "R",
        actions: [["edit-offer", ak93Icons.edit], ["delete-offer", ak93Icons.delete]],
      });
    }

    const items = sortedOfferItems(offer);
    const reserved = offerReservedCount({ items });
    const total = offerTotalCount({ items });
    const available = offerAvailableCount({ items });
    const alternates = offerAlternateCount({ items });
    const coverImage = items.map((item) => offerItemImageSafe(item)).find(Boolean) || "";
    const itemPills = items.slice(0, 4).map((item) => ak93OfferItemName(item));
    if (items.length > 4) itemPills.push(`+${items.length - 4} další`);
    const offerTitle = ak93DisplayText(offer.title, "Nabídka");
    return card({
      id: offer.id,
      type: "offer",
      title: escapeHtml(offerTitle),
      sub: [formatDate(offer.date), ak93OfferTypeLabel(offer), ak91OfferStatusLabel(offer.status)].filter(Boolean).join(" · "),
      pills: [
        ...itemPills,
        `Volné ${available}`,
        `Rezervace ${reserved}/${total}`,
        alternates ? `Náhradníci ${alternates}` : "",
      ].filter(Boolean),
      thumb: coverImage,
      thumbText: initials(offerTitle || "N"),
      actions: [["facebook-offer", ak93Icons.share], ["edit-offer", ak93Icons.edit], ["delete-offer", ak93Icons.delete]],
    });
  }

  function ak91RenderOffers() {
    const offers = (Array.isArray(state.data.offers) ? state.data.offers : [])
      .filter((offer) => {
        try {
          return ak91MatchOffer(offer);
        } catch (error) {
          console.error("AK91 offer filter failed", error, offer);
          return true;
        }
      })
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    if (!offers.length) return empty("Žádné nabídky.");
    const groups = splitOffersByType(offers);
    const renderGroup = (label, items) => {
      if (!items.length) return "";
      return `<div class="card-group-heading">${escapeHtml(label)}</div>${items.map((offer) => {
        try {
          return ak91RenderOfferCard(offer);
        } catch (error) {
          console.error("AK91 offer card failed", error, offer);
          return card({
            id: clean(offer?.id) || uid(),
            type: "offer",
            title: clean(offer?.title) || "Nabídka",
            sub: [formatDate(offer?.date), ak91OfferStatusLabel(offer?.status)].filter(Boolean).join(" · "),
            thumbText: initials(clean(offer?.title) || "N"),
            actions: [["edit-offer", ak93Icons.edit], ["delete-offer", ak93Icons.delete]],
          });
        }
      }).join("")}`;
    };
    return [renderGroup("Nabídky", groups.offers), renderGroup("Resty", groups.rests)].filter(Boolean).join("");
  }

  function ak91StatusKey(value) {
    const raw = clean(value);
    const exact = {
      "novĂˇ": "new",
      "pĹ™ipraveno": "prepared",
      "pĹ™ipravenĂˇ": "prepared",
      "odeslĂˇno": "shipped",
      "odeslanĂˇ": "shipped",
      "ÄŤekĂˇ": "waiting",
      nezaplaceno: "overdue",
      "Neplatí": "overdue",
      "zveĹ™ejnÄ›nĂˇ": "published",
      "uzavĹ™enĂˇ": "closed",
      zaplaceno: "paid",
    };
    if (exact[raw]) return exact[raw];
    const normalized = normalize(clean(value)).replace(/[^a-z0-9]+/g, "");
    if (!normalized) return "";
    if (normalized.startsWith("nova")) return "new";
    if (normalized.startsWith("pripraven")) return "prepared";
    if (normalized.startsWith("odeslan")) return "shipped";
    if (normalized.startsWith("nezaplacen") || normalized.startsWith("neplati")) return "overdue";
    if (normalized.startsWith("zaplacen")) return "paid";
    if (normalized.startsWith("cek")) return "waiting";
    if (normalized.startsWith("zverejnen")) return "published";
    if (normalized.startsWith("uzavren")) return "closed";
    return normalized;
  }

  function ak91OfferStatusLabel(value) {
    return {
      prepared: "Připravená",
      published: "Zveřejněná",
      closed: "Uzavřená",
    }[ak91StatusKey(value)] || clean(value) || "Připravená";
  }

  function ak91ShippingStatusLabel(value) {
    return {
      new: "Nová",
      prepared: "Připravená",
      shipped: "Odeslaná",
      paid: "Hotovo",
    }[ak91StatusKey(value)] || clean(value) || "Nová";
  }

  function ak91PaymentStatusLabel(value) {
    const key = ak91StatusKey(value);
    if (key === "paid") return "Zaplaceno";
    if (key === "overdue") return "Neplatí";
    return "Čeká";
  }

  function ak91SummaryMeta() {
    return {
      offers: ["Nabídky", `${(state.data.offers || []).length} nabídek`, "Rychle vytvoříš nabídku a rezervace."],
      orders: ["Objednávky", `${(state.data.orders || []).length} objednávek`, "Platby, doprava a text zákazníkovi po ruce."],
      customers: ["Zákazníci", `${(state.data.customers || []).length} kontaktů`, ""],
      varieties: ["Odrůdy", `${(state.data.varieties || []).length} odrůd`, `Zimování ${selectedWinteringSeason()}`],
      crosses: ["Křížení", `${(state.data.crosses || []).length} záznamů`, ""],
      sync: ["Nastavení", loadSyncConfig().autoSync ? "Sync zapnutý" : "Sync vypnutý", "Soukromý cloud, fotky a základní nastavení aplikace."],
    }[state.view] || ["Přehled", "", ""];
  }

  function ak91RenderSummary() {
    if (!els.summary) return;
    const summary = ak91SummaryMeta();
    els.summary.innerHTML = `<div><span>${escapeHtml(summary[0])}</span><strong>${escapeHtml(summary[1])}</strong></div>${summary[2] ? `<p>${escapeHtml(summary[2])}</p>` : ""}`;
  }

  function ak91RenderFilters() {
    if (!els.filterRow) return;
    const filters = {
      offers: [],
      orders: [["all", "Vše"], ["todo", "K řešení"], ["done", "Hotovo"]],
      customers: [["all", "Vše"], ["cz", "Česko"], ["foreign", "Zahraničí"]],
      varieties: [["all", "Vše"], ["newest", "Nejnovější"], ["wintering", "❄ Zimuje"], ["not-wintering", "❄ Nezimuje"], ["wintering-empty", "Bez stavu"], ["photo", "S fotkou"], ["no-photo", "Bez fotky"]],
      crosses: [],
      sync: [],
    }[state.view] || [];
    if (!filters.some(([value]) => value === state.filter)) state.filter = "all";
    els.filterRow.innerHTML = filters.map(([value, label]) => `<button class="chip-button ${state.filter === value ? "active" : ""}" type="button" data-filter="${value}">${escapeHtml(label)}</button>`).join("");
    els.filterRow.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        render();
      });
    });
  }

  function ak91MatchOffer(offer = {}) {
    const offerStatus = ak91OfferStatusLabel(offer.status);
    const isClosed = ak91StatusKey(offer.status) === "closed";
    if (state.filter === "active" && isClosed) return false;
    if (state.filter === "closed" && !isClosed) return false;
    const items = sortedOfferItems(offer);
    return matches([offer.title, offerTypeLabel(offer), offer.note, offerStatus, ...items.map((item) => offerItemNameSafe(item))]);
  }

  function ak91MatchOrder(order = {}) {
    const paymentKey = ak91StatusKey(order.paymentStatus);
    const shippingKey = ak91StatusKey(order.shippingStatus);
    if (state.filter === "todo" && paymentKey === "paid" && ["shipped", "paid"].includes(shippingKey)) return false;
    if (state.filter === "done" && !(paymentKey === "paid" && ["shipped", "paid"].includes(shippingKey))) return false;
    return matches([customerName(findCustomer(order.customerId)), order.varietiesText, order.note, order.orderDate]);
  }

  function ak91PaymentPill(order = {}) {
    const paymentKey = ak91StatusKey(order?.paymentStatus);
    if (paymentKey === "overdue") return { label: "⛔ Neplatí", className: "payment-overdue" };
    if (paymentKey === "paid") return { label: "💰 Zaplaceno", className: "payment-paid" };
    return { label: "⏳ Čeká", className: "payment-waiting" };
  }

  function ak91StatusPill(order = {}) {
    const key = ak91StatusKey(order?.shippingStatus);
    if (key === "prepared") return { label: "📦 Zabaleno", className: "shipping-packed" };
    if (key === "shipped") return { label: "🚚 Odeslaná", className: "shipping-shipped" };
    if (key === "paid") return { label: "🏁 Vyřízená", className: "shipping-done" };
    return { label: "📝 Nová", className: "shipping-new" };
  }

  function ak91OrderPaymentTextPill(order = {}) {
    return clean(order.paymentTextSentAt) ? { label: "💬 Text odeslán", className: "message-sent" } : "";
  }

  function ak91FormatMoney(value, currency = "CZK") {
    const amount = number(value);
    if (!Number.isFinite(amount)) return "";
    return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: currency === "CZK" ? 0 : 2 }).format(amount)} ${currency === "EUR" ? "EUR" : "Kč"}`;
  }

  function ak92RenderSync() {
    const config = loadSyncConfig();
    const session = loadSyncSession();
    const loggedIn = Boolean(session.accessToken || session.refreshToken);
    const recoveryMode = needsSyncRecovery();
    const settings = appSettings();
    const accountFields = loggedIn
      ? ""
      : `<label class="field"><span>Email</span><input id="syncEmail" type="email" value="${escapeHtml(config.email)}" autocomplete="email"></label>
    <label class="field"><span>Heslo k účtu</span><input id="syncLoginPassword" type="password" autocomplete="current-password"></label>`;
    const encryptionField = `<label class="field"><span>Šifrovací heslo</span><input id="syncPassword" type="password" value="${escapeHtml(state.syncPassword)}" placeholder="nesmí se ztratit" autocomplete="current-password"></label>`;
    const leadText = !loggedIn
      ? "Po přihlášení se ukáže obsah appky. Sync běží úsporně."
      : recoveryMode
        ? "Jsi přihlášená, ale v mobilu teď nejsou data. Zadej šifrovací heslo a stáhni cloud."
        : "Přihlášeno. Sync běží automaticky na pozadí.";
    const footerText = !loggedIn
      ? "Obsah se zobrazí až po přihlášení."
      : recoveryMode
        ? "Jakmile se cloud stáhne, appka se sama otevře."
        : "Obsah je odemčený.";
    const actionButtons = loggedIn
      ? `<button class="button primary" type="button" id="syncPull">${recoveryMode ? "Stáhnout data" : "Stáhnout z cloudu"}</button><button class="button" type="button" id="syncLogout">Odhlásit</button>`
      : `<button class="button primary" type="button" id="syncLogin">Přihlásit</button>`;
    return `<section class="sync-card">
    <strong class="title">Soukromá appka</strong>
    <p class="sub">${leadText}</p>
    <input id="syncUrl" type="hidden" value="${escapeHtml(config.url)}">
    <input id="syncAnon" type="hidden" value="${escapeHtml(config.anonKey)}">
    ${accountFields}
    ${encryptionField}
    <div class="two">
      ${actionButtons}
    </div>
    ${loggedIn ? `<button class="button secondary" type="button" id="downloadMobileOriginals">Doplnit chybějící velké fotky</button>` : ""}
    ${loggedIn ? `<button class="button secondary" type="button" id="pickMobileOriginalsFolder">Vybrat / ověřit složku fotek</button>` : ""}
    ${loggedIn ? `<div class="mobile-originals-status" id="mobileOriginalsStatus"><span class="mobile-originals-status-pill">V appce: počítám...</span><span class="mobile-originals-status-pill">Ve složce: počítám...</span></div>` : ""}
    ${loggedIn ? `<small class="sub" id="mobileOriginalsFolderStatus">Složka: kontroluji...</small>` : ""}
    ${loggedIn ? `<small class="sub">V appce = velké fotky uložené uvnitř aplikace. Ve složce = kopie fotek jako normální soubory v telefonu.</small>` : ""}
    ${loggedIn ? `<small class="sub">Před mazáním originálů v cloudu musí být hotovo hlavně: Fotky v appce i ve složce. Pokud složka nejde ověřit, zkontroluj ji ručně v telefonu.</small>` : ""}
    ${loggedIn ? `<small class="sub">Tlačítko doplní jen chybějící fotky. Co už ve složce je, znovu nepřepisuje.</small>` : ""}
    <small class="sub">${footerText}</small>
  </section>
  <section class="sync-card">
    <strong class="title">Zimování</strong>
    <p class="sub">Tady nastavíš aktuální zimovací období. Starší období zůstávají uložená a nové začne prázdné.</p>
    <div class="two">
      <label class="field">
        <span>Aktuální období</span>
        <select data-mobile-wintering-season-select>${winteringSeasonOptions().map((item) => `<option value="${escapeHtml(item)}" ${item === selectedWinteringSeason() ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
      </label>
      <button class="button" type="button" data-mobile-next-wintering-season>Nové zimování ${escapeHtml(nextWinteringSeason(selectedWinteringSeason()))}</button>
    </div>
  </section>
  <section class="sync-card">
    <strong class="title">Poplatky</strong>
    <div class="two">
      <label class="field"><span>Zásilkovna ČR</span><input id="settingShippingCz" inputmode="decimal" value="${escapeHtml(settings.shippingFeeCz)}"></label>
      <label class="field"><span>Zásilkovna SK</span><input id="settingShippingSk" inputmode="decimal" value="${escapeHtml(settings.shippingFeeSk)}"></label>
    </div>
    <div class="two">
      <label class="field"><span>Balíkovna</span><input id="settingPostal" inputmode="decimal" value="${escapeHtml(settings.postalFee)}"></label>
      <label class="field"><span>Balné</span><input id="settingPacking" inputmode="decimal" value="${escapeHtml(settings.packingFee)}"></label>
    </div>
    <div class="two">
      <label class="field"><span>Zásilkovna na adresu ČR</span><input id="settingShippingAddressCz" inputmode="decimal" value="${escapeHtml(settings.shippingFeeAddressCz)}"></label>
      <label class="field"><span>Zásilkovna na adresu Slovensko</span><input id="settingShippingAddressSk" inputmode="decimal" value="${escapeHtml(settings.shippingFeeAddressSk)}"></label>
    </div>
    <div class="two">
      <label class="field"><span>Dobírka ČR</span><input id="settingCodCz" inputmode="decimal" value="${escapeHtml(settings.codFeeCz)}"></label>
      <label class="field"><span>Dobírka Slovensko</span><input id="settingCodSk" inputmode="decimal" value="${escapeHtml(settings.codFeeSk)}"></label>
    </div>
    <strong class="title small-title">Platba pro zákazníka</strong>
    <label class="field"><span>Jméno a příjmení</span><input id="settingPaymentName" value="${escapeHtml(settings.paymentAccountName)}"></label>
    <label class="field"><span>Číslo účtu</span><input id="settingPaymentAccount" value="${escapeHtml(settings.paymentAccountNumber)}"></label>
    <label class="field"><span>IBAN</span><input id="settingPaymentIban" value="${escapeHtml(settings.paymentIban)}"></label>
    <label class="field"><span>SWIFT / BIC</span><input id="settingPaymentSwift" value="${escapeHtml(settings.paymentSwift)}"></label>
    <button class="button primary" type="button" id="saveAppSettings">Uložit nastavení</button>
  </section>
  ${loggedIn ? renderTrashCards() : ""}`;
  }

  function ak91UpdateSyncIndicator(status = "") {
    if (!els.syncIndicator) return;
    const config = loadSyncConfig();
    const session = loadSyncSession();
    const last = latestSyncTimestamp(config.lastSyncedAt, config.lastPulledAt, config.lastPushedAt);
    const lastLabel = formatSyncIndicatorTime(last);
    const hasProblem = Boolean(clean(state.syncProblem) && hasPendingSync());
    let text = session.accessToken && config.autoSync ? (lastLabel ? `Syncnuto ${lastLabel}` : "Sync připravený") : "Sync vypnutý";
    let stateClass = session.accessToken && config.autoSync ? "ok" : "off";
    if (status === "working") {
      text = "Syncuji...";
      stateClass = "working";
    } else if (status === "error" || hasProblem) {
      text = "Sync chyba";
      stateClass = "error";
    } else if (hasPendingSync()) {
      text = "Čeká na sync";
      stateClass = "working";
    }
    els.syncIndicator.textContent = text;
    els.syncIndicator.dataset.status = stateClass;
  }

  function ak91OrderTone(order = {}) {
    const paymentKey = ak91StatusKey(order.paymentStatus);
    const shippingKey = ak91StatusKey(order.shippingStatus);
    if (ak91OrderStornoMeta(order).count || orderHasStorno(order)) return "reject";
    if (paymentKey === "overdue") return "reject";
    if (paymentKey === "paid" && ["shipped", "paid"].includes(shippingKey)) return "done";
    if (paymentKey === "paid") return "progress";
    return "attention";
  }

  function ak91RenderOrders() {
    const orders = (state.data.orders || [])
      .filter(matchOrder)
      .slice()
      .sort((a, b) => String(b.orderDate || "").localeCompare(String(a.orderDate || "")));
    if (!orders.length) return empty("Žádné objednávky.");
    return orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const stornoMeta = ak91OrderStornoMeta(order);
      return card({
        id: order.id,
        type: "order",
        tone: ak91OrderTone(order),
        title: escapeHtml(ak93DisplayText(compactName(customerName(customer) || "Bez zákazníka"), "Bez zákazníka")),
        sub: [formatDate(order.orderDate), ak93DisplayText(customer?.country)].filter(Boolean).join(" · ") + ak91StornoMarkup(stornoMeta),
        price: formatMoney(orderFinalTotal(order), "CZK"),
        pills: [
          ...orderVarietyPreviewItems(order).slice(0, 5).map((item) => item.quantity > 1 ? `${ak93DisplayText(item.name)} · ${quantityText(item.quantity)} ks` : ak93DisplayText(item.name)),
          ...orderOfferAlternateEntries(order).map((item) => ({
            label: `Náhradník: ${item.quantity > 1 ? `${ak93DisplayText(item.name)} · ${quantityText(item.quantity)} ks` : ak93DisplayText(item.name)}`,
            className: "danger order-alternate-preview-pill",
          })),
          ...orderStornoLines(order).map((item) => ({
            label: `Storno: ${item.quantity > 1 ? `${ak93DisplayText(item.name)} · ${quantityText(item.quantity)} ks` : ak93DisplayText(item.name)}`,
            className: "danger order-alternate-preview-pill",
          })),
        ],
        badges: [
          stornoMeta.count ? { label: `Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`, className: "danger" } : "",
          orderHasStorno(order) ? { label: "Storno", className: "danger" } : "",
          paymentPill(order),
          statusPill(order),
          orderPaymentTextPill(order),
        ].filter(Boolean),
        actions: [["copy-order", ak93Icons.copy], ["toggle-order-text-sent", ak93Icons.message], ["edit-order", ak93Icons.edit], ["delete-order", ak93Icons.delete]],
      });
    }).join("");
  }

  function ak91RenderCustomers() {
    const customers = (state.data.customers || [])
      .filter(matchCustomer)
      .slice()
      .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }));
    if (!customers.length) return empty("Žádní zákazníci.");
    return customers.map((customer) => {
      const stornoMeta = ak91CustomerStornoMeta(customer.id);
      const nonPaymentMeta = ak91CustomerNonPaymentMeta(customer.id);
      const avatar = ak91CustomerAvatarMeta(customer, stornoMeta, nonPaymentMeta);
      return card({
        id: customer.id,
        type: "customer",
        tone: stornoMeta.count || nonPaymentMeta.count ? "customer-storno-card" : "",
        title: escapeHtml(ak93DisplayText(customerName(customer), "Bez zákazníka")),
        sub: [customer.email, customer.phone, ak93DisplayText(customer.country)].filter(Boolean).join("<br>") + ak91NonPaymentMarkup(nonPaymentMeta) + ak91StornoMarkup(stornoMeta),
        pills: [
          ...(customer.tags || []).map((tag) => ak93DisplayText(tag)),
          ...(nonPaymentMeta.count ? [{ label: `Neplatí${nonPaymentMeta.count > 1 ? ` (${nonPaymentMeta.count})` : ""}`, className: "danger" }] : []),
          ...(stornoMeta.count ? [`Stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}`] : []),
        ],
        thumbText: avatar.icon,
        actions: [["order-customer", ak93Icons.add], ["edit-customer", ak93Icons.edit], ["delete-customer", ak93Icons.delete]],
      });
    }).join("");
  }

  function ak91CustomerAvatarMeta(customer = {}, stornoMeta = ak91CustomerStornoMeta(customer.id), nonPaymentMeta = ak91CustomerNonPaymentMeta(customer.id)) {
    const customerId = clean(customer?.id);
    const orders = customerId ? (state.data.orders || []).filter((order) => clean(order.customerId) === customerId) : [];
    const allPaid = orders.length > 0 && orders.every((order) => ak91StatusKey(order.paymentStatus) === "paid" && !orderHasStorno(order));
    if (nonPaymentMeta.count || stornoMeta.count) return { icon: "😠", label: "Pozor" };
    if (orders.length > 1 && allPaid) return { icon: "😄", label: "Top" };
    if (orders.length > 0) return { icon: "🙂", label: "Nakoupil" };
    return { icon: "😐", label: "Nový" };
  }

  function ak91OpenOfferDetail(id, options = {}) {
    const offer = findById("offers", id);
    if (!offer) return;
    try {
      if (isRestOffer(offer)) return ak91OpenRestDetail(id, options);
      return ak93OpenStandardOfferDetail(id, options);
    } catch (error) {
      console.error("AK91 offer detail failed", error);
      try {
        if (isRestOffer(offer)) return openOfferSheet(id, { type: "rests" });
        return openOfferSheet(id);
      } catch (fallbackError) {
        console.error("AK91 offer detail fallback failed", fallbackError);
        toast(isRestOffer(offer) ? "Resty se nepodařilo otevřít." : "Nabídku se nepodařilo otevřít.");
      }
    }
  }

  function ak91HandleRowAction(action, id) {
    if (action === "edit-order") return ak91OpenOrderSheet(id);
    if (action === "order-customer") return ak91OpenOrderSheet("", id);
    return handleRowAction(action, id);
  }

  function ak91HandleListClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const actionButton = target.closest("[data-action-row]");
    if (actionButton && els.list.contains(actionButton)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return ak91HandleRowAction(actionButton.dataset.actionRow || "", actionButton.dataset.id || "");
    }

    const cardEl = target.closest("[data-card]");
    if (!cardEl || !els.list.contains(cardEl) || target.closest("button")) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    const type = cardEl.dataset.card || "";
    const id = cardEl.dataset.id || "";
    if (type === "offer") return ak91OpenOfferDetail(id);
    if (type === "order") return ak91OpenOrderSheet(id);
    if (type === "customer") return openCustomerSheet(id);
    if (type === "variety") return openVarietyDetailSheet(id);
    if (type === "cross") return openCrossDetailSheet(id);
  }

  function ak91EnsureListHost() {
    if (!els.list || els.list.dataset.ak91Host === "1") return;
    const clone = els.list.cloneNode(false);
    clone.dataset.ak91Host = "1";
    els.list.replaceWith(clone);
    els.list = clone;
    els.list.addEventListener("click", ak91HandleListClick, true);
  }

  function ak91RunAction(action) {
    if (action === "new-offer") return openOfferSheet();
    if (action === "new-rest-offer") return openOfferSheet("", { type: "rests" });
    if (action === "new-order") return ak91OpenOrderSheet();
    if (action === "new-customer") return openCustomerSheet();
    if (action === "new-variety") return openVarietySheet();
    if (action === "new-cross") return openCrossSheet();
  }

  function ak91BindStaticButtons() {
    document.querySelectorAll("[data-view], [data-action]").forEach((node) => {
      if (!(node instanceof HTMLButtonElement)) return;
      const clone = node.cloneNode(true);
      node.replaceWith(clone);
    });

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        openView(button.dataset.view || "offers");
      }, true);
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        ak91RunAction(button.dataset.action || "");
      }, true);
    });
  }

  function ak91BindSyncButtons() {
    const bindClick = (selector, handler) => {
      const node = document.querySelector(selector);
      if (node) node.onclick = handler;
    };
    bindClick("#syncLogin", loginSync);
    bindClick("#syncLogout", logoutSync);
    bindClick("#syncPush", () => pushSync());
    bindClick("#syncPull", () => pullSync());
    bindClick("#syncAuto", toggleAutoSync);
    bindClick("#downloadMobileOriginals", () => downloadSupabaseOriginalsToMobile());
    bindClick("#pickMobileOriginalsFolder", () => pickMobileOriginalsFolder());
    bindClick("#mobileOriginalsStatus", () => exportMobileOriginalsToFolder());
    ["syncUrl", "syncAnon", "syncEmail", "syncPassword"].forEach((id) => {
      const node = document.querySelector(`#${id}`);
      if (node) node.oninput = saveSyncConfigFromInputs;
    });
    const settingsButton = document.querySelector("#saveAppSettings");
    if (settingsButton) settingsButton.onclick = saveAppSettingsFromInputs;
    const emptyTrashButton = document.querySelector("[data-trash-empty-all]");
    if (emptyTrashButton) emptyTrashButton.onclick = emptyTrash;
    document.querySelectorAll("[data-trash-restore]").forEach((button) => {
      button.onclick = () => restoreTrashEntry(button.dataset.trashRestore || "");
    });
    document.querySelectorAll("[data-trash-delete]").forEach((button) => {
      button.onclick = () => permanentlyDeleteTrashEntry(button.dataset.trashDelete || "");
    });
  }

  function ak91HandleSyncActionBridge(event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || !els.list?.contains(target)) return false;

    const action = target.closest("#syncLogin, #syncLogout, #syncPull, #syncPush, #downloadMobileOriginals, #pickMobileOriginalsFolder, #saveAppSettings, [data-trash-empty-all]");
    if (action) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      if (action.id === "syncLogin") loginSync();
      else if (action.id === "syncLogout") logoutSync();
      else if (action.id === "syncPull") pullSync();
      else if (action.id === "syncPush") pushSync();
      else if (action.id === "downloadMobileOriginals") downloadSupabaseOriginalsToMobile();
      else if (action.id === "pickMobileOriginalsFolder") pickMobileOriginalsFolder();
      else if (action.id === "saveAppSettings") saveAppSettingsFromInputs();
      else if (action.hasAttribute("data-trash-empty-all")) emptyTrash();
      return true;
    }

    if (state.view !== "sync") return false;

    const focusField = target.closest(".sync-card input, .sync-card select, .sync-card textarea")
      || target.closest(".sync-card label.field")?.querySelector("input, select, textarea");
    if (!(focusField instanceof HTMLElement)) return false;

    focusField.focus?.({ preventScroll: true });
    if (focusField instanceof HTMLInputElement || focusField instanceof HTMLTextAreaElement) {
      try {
        const end = focusField.value.length;
        focusField.setSelectionRange?.(end, end);
      } catch {
        // ignore selection support differences
      }
    }
    event.stopImmediatePropagation();
    event.stopPropagation();
    return true;
  }

  if (!globalThis.__akSyncBridge91) {
    globalThis.__akSyncBridge91 = true;
    document.addEventListener("click", (event) => {
      ak91HandleSyncActionBridge(event);
    }, true);
  }

  if (!globalThis.__akTrashButtonsBridge91) {
    globalThis.__akTrashButtonsBridge91 = true;
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const restoreButton = target.closest("[data-trash-restore]");
      if (restoreButton && els.list?.contains(restoreButton)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        restoreTrashEntry(restoreButton.dataset.trashRestore || "");
        return;
      }

      const deleteButton = target.closest("[data-trash-delete]");
      if (deleteButton && els.list?.contains(deleteButton)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        permanentlyDeleteTrashEntry(deleteButton.dataset.trashDelete || "");
      }
    }, true);
  }

  renderOffers = ak91RenderOffers;
  renderOrders = ak91RenderOrders;
  renderCustomers = ak91RenderCustomers;
  renderVarieties = ak93RenderVarieties;
  renderCrosses = ak93RenderCrosses;
  renderSummary = ak91RenderSummary;
  renderFilters = ak91RenderFilters;
  renderSync = ak92RenderSync;
  matchOffer = ak91MatchOffer;
  matchOrder = ak91MatchOrder;
  paymentPill = ak91PaymentPill;
  statusPill = ak91StatusPill;
  orderPaymentTextPill = ak91OrderPaymentTextPill;
  formatMoney = ak91FormatMoney;
  updateSyncIndicator = ak91UpdateSyncIndicator;
  openOfferDetailSheet = ak91OpenOfferDetail;
  runAction = ak91RunAction;
  bindListActions = function bindListActionsAK91() {
    ak91BindSyncButtons();
  };

  render = function renderAK91() {
    const loggedIn = isSyncLoggedIn();
    const recoveryMode = needsSyncRecovery();
    if (els.todayLine) els.todayLine.textContent = mobileTodayLineText();
    if (!loggedIn || recoveryMode) state.view = "sync";
    document.body.classList.toggle("private-locked", !loggedIn || recoveryMode);
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));

    try {
      renderFilters();
    } catch (error) {
      console.error("AK91 renderFilters failed", error);
      if (els.filterRow) els.filterRow.innerHTML = "";
    }

    try {
      renderSummary();
    } catch (error) {
      console.error("AK91 renderSummary failed", error);
      if (els.summary) els.summary.innerHTML = "";
    }

    const renderers = {
      offers: renderOffers,
      orders: renderOrders,
      customers: renderCustomers,
      varieties: renderVarieties,
      crosses: renderCrosses,
      sync: renderSync,
    };

    els.list.innerHTML = "";
    try {
      els.list.innerHTML = renderers[state.view]?.() || "";
    } catch (error) {
      console.error("AK91 section render failed", error);
      els.list.innerHTML = empty("Tahle sekce se nepodařila otevřít.");
    }

    try {
      syncMobileListChrome();
    } catch (error) {
      console.error("AK91 syncMobileListChrome failed", error);
    }

    try {
      resolvePhotos(els.list);
    } catch (error) {
      console.error("AK91 resolvePhotos failed", error);
    }

    try {
      bindListActions();
    } catch (error) {
      console.error("AK91 bindListActions failed", error);
    }

    try {
      updateSyncIndicator();
    } catch (error) {
      console.error("AK91 updateSyncIndicator failed", error);
    }

    if (state.view === "sync") {
      refreshMobileOriginalsStatus().catch(() => {});
    }
  };

  function mobileTodayLineText() {
    const dateText = new Intl.DateTimeFormat("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
    const season = appSettings().currentWinteringSeason || selectedWinteringSeason();
    return season ? `${dateText} · Zimování ${season}` : dateText;
  }

  openView = function openViewAK91(view) {
    const nextView = ["offers", "orders", "customers", "varieties", "crosses", "sync"].includes(view) ? view : "offers";
    if ((!isSyncLoggedIn() || needsSyncRecovery()) && nextView !== "sync") {
      state.view = "sync";
      render();
      toast(isSyncLoggedIn() ? "Nejdřív stáhni data z cloudu." : "Nejdřív se přihlas.");
      return;
    }
    state.view = nextView;
    state.filter = "all";
    document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === nextView));
    if (els.search) els.search.value = "";
    state.query = "";
    closeSheet({ all: true });
    render();
  };

  globalThis.__akOpenOrderSheetFinal = ak91OpenOrderSheet;
  globalThis.__akRenderCustomersFinal = ak91RenderCustomers;
  globalThis.__akRenderOrdersFinal = ak91RenderOrders;
  globalThis.__akMobileRuntimeFinal93 = true;

  ak93EnsureSheetObserver();
  ak91EnsureListHost();
  ak91BindStaticButtons();
  render();
  setTimeout(() => render(), 0);
})();
