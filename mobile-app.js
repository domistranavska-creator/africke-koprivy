const STORE_KEY = "africke-koprivy-data-v11";
const LEGACY_STORE_KEYS = ["africke-koprivy-data-v10", "africke-koprivy-data-v9", "africke-koprivy-data-v8", "africke-koprivy-data-v7"];
const SEED_SIGNATURE = window.AFRICKE_KOPRIVY_SEED_SIGNATURE || "";
const SEED_SIGNATURE_KEY = `${STORE_KEY}:seed-signature`;
const PHOTO_DB_NAME = "africke-koprivy-photos";
const PHOTO_BLOB_STORE = "photos";
const SUPABASE_SYNC_CONFIG_KEY = `${STORE_KEY}:supabase-sync-config`;
const SUPABASE_SYNC_SESSION_KEY = `${STORE_KEY}:supabase-sync-session`;
const SUPABASE_SYNC_PASSWORD_KEY = `${STORE_KEY}:supabase-sync-password`;
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
const INDEXED_PHOTO_PREFIX = "indexed-photo:";
const BRAND_LOGO_IMAGE_DATA_URI = clean(window.AFRICKE_KOPRIVY_BRAND_LOGO_DATA_URI || "");

const stageLabels = { opyleno: "Opyleno", vyseto: "Vyseto", roste: "Roste", hotovo: "Hotovo" };
const stageIcons = { opyleno: "✦", vyseto: "🌱", roste: "🌿", hotovo: "✓" };
const ratingLabels = { krasna: "Krásná", hnusna: "Hnusná", nejista: "Nejistá" };
const statusLabels = { "nová": "Nová", "připraveno": "Připravená", "odesláno": "Odeslaná", zaplaceno: "Vyřízená" };

const state = {
  view: "offers",
  query: "",
  filter: "all",
  syncPassword: localStorage.getItem(SUPABASE_SYNC_PASSWORD_KEY) || sessionStorage.getItem(`${STORE_KEY}:sync-password`) || "",
  syncTimer: null,
  syncDirty: false,
  syncRunning: false,
  syncVerifiedPassword: "",
  installPromptEvent: null,
  data: loadData(),
  photoUrls: new Map(),
  sheetStack: [],
  currentSheetRestore: null,
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
  toast: document.querySelector("#toast"),
};

init();

function init() {
  migrateSyncConfig();
  els.todayLine.textContent = new Intl.DateTimeFormat("cs-CZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  if (syncFinishedCrossVarieties()) saveData({ skipAutoSync: true });
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => openView(button.dataset.view)));
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => runAction(button.dataset.action)));
  els.search.addEventListener("input", () => {
    state.query = els.search.value;
    render();
  });
  window.addEventListener("focus", () => maybeAutoPull());
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
  els.installAppBtn?.addEventListener("click", installPwaApp);
  window.setInterval(maybeAutoPull, 8000);
  if (!isSyncLoggedIn()) state.view = "sync";
  render();
  maybeAutoPull();
}

function openView(view) {
  if (!isSyncLoggedIn() && view !== "sync") {
    state.view = "sync";
    render();
    toast("Nejdřív se přihlas.");
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
  if (action === "new-customer") return openCustomerSheet();
  if (action === "new-order") return openOrderSheet();
  if (action === "new-variety") return openVarietySheet();
  if (action === "new-cross") return openCrossSheet();
  if (action === "new-offer") return openOfferSheet();
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  state.installPromptEvent = event;
  if (els.installAppBtn) els.installAppBtn.hidden = false;
}

function handleAppInstalled() {
  state.installPromptEvent = null;
  if (els.installAppBtn) els.installAppBtn.hidden = true;
  toast("Appka je nainstalovaná.");
}

async function installPwaApp() {
  if (!state.installPromptEvent) {
    toast("Instalace se objeví až po otevření z HTTPS odkazu v Chrome.");
    return;
  }
  const promptEvent = state.installPromptEvent;
  state.installPromptEvent = null;
  promptEvent.prompt();
  const result = await promptEvent.userChoice.catch(() => null);
  if (result?.outcome === "accepted" && els.installAppBtn) els.installAppBtn.hidden = true;
}

function render() {
  if (!isSyncLoggedIn()) state.view = "sync";
  document.body.classList.toggle("private-locked", !isSyncLoggedIn());
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
  bindListActions();
  resolvePhotos(els.list);
  updateSyncIndicator();
}

function renderSummary() {
  const summary = {
    offers: ["Nabídky", `${state.data.offers.length} nabídek`, "Rychle vytvoříš nabídku a rezervace."],
    orders: ["Objednávky", `${state.data.orders.length} objednávek`, "Platby, doprava a text zákazníkovi po ruce."],
    customers: ["Zákazníci", `${state.data.customers.length} kontaktů`, ""],
    varieties: ["Odrůdy", `${state.data.varieties.length} odrůd`, "Fotky a ceny v Kč."],
    crosses: ["Křížení", `${state.data.crosses.length} záznamů`, ""],
    sync: ["Nastavení", loadSyncConfig().autoSync ? "Sync zapnutý" : "Sync vypnutý", "Soukromý cloud, fotky a základní nastavení aplikace."],
  }[state.view] || ["Přehled", "", ""];
  els.summary.innerHTML = `<div><span>${escapeHtml(summary[0])}</span><strong>${escapeHtml(summary[1])}</strong></div>${summary[2] ? `<p>${escapeHtml(summary[2])}</p>` : ""}`;
}

function renderFilters() {
  const filters = {
    offers: [],
    orders: [["all", "Vše"], ["todo", "K řešení"], ["done", "Hotovo"]],
    customers: [["all", "Vše"], ["cz", "Česko"], ["foreign", "Zahraničí"]],
    varieties: [["all", "Vše"], ["active", "Aktivní"], ["photo", "S fotkou"]],
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
  if (!offers.length) return empty("Žádné nabídky.");
  return offers.map((offer) => {
    const items = Array.isArray(offer.items) ? offer.items : [];
    const reserved = offerReservedCount(offer);
    const total = offerTotalCount(offer);
    const available = offerAvailableCount(offer);
    const alternates = offerAlternateCount(offer);
    const coverImage = items.map((item) => offerItemImage(item)).find(Boolean) || "";
    const itemPills = items.slice(0, 4).map((item) => `🌿 ${offerItemName(item)}`);
    if (items.length > 4) itemPills.push(`+${items.length - 4} další`);
    return card({
      id: offer.id,
      type: "offer",
      title: offer.title,
      sub: `${formatDate(offer.date)} · ${offer.status}`,
      pills: [...itemPills, `Volné ${available}`, `Rezervace ${reserved}/${total}`, alternates ? `Náhradníci ${alternates}` : ""],
      thumb: coverImage,
      thumbText: initials(offer.title),
      actions: [["edit-offer", "✎"], ["delete-offer", "×"]],
    });
  }).join("");
}

function renderOrders() {
  const orders = state.data.orders.filter(matchOrder).sort((a, b) => String(b.orderDate).localeCompare(String(a.orderDate)));
  if (!orders.length) return empty("Žádné objednávky.");
  return orders.map((order) => {
    const customer = findCustomer(order.customerId);
    const tone = order.paymentStatus === "zaplaceno" && ["odesláno", "zaplaceno"].includes(order.shippingStatus)
      ? "done"
      : order.paymentStatus === "zaplaceno"
        ? "progress"
        : "attention";
    return card({
      id: order.id,
      type: "order",
      tone,
      title: compactName(customerName(customer) || "Bez zákazníka"),
      sub: [formatDate(order.orderDate), customer?.country].filter(Boolean).join(" · "),
      price: `${formatMoney(order.price || orderTotalFromText(order.varietiesText), "CZK")}`,
      pills: orderVarietyNames(order).slice(0, 5).map((name) => `🌿 ${name}`),
      badges: [paymentPill(order), statusPill(order)],
      actions: [["copy-order", "📋"], ["edit-order", "✎"], ["delete-order", "×"]],
    });
  }).join("");
}

function renderCustomers() {
  const customers = state.data.customers.filter(matchCustomer).sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
  if (!customers.length) return empty("Žádní zákazníci.");
  return customers.map((customer) => card({
    id: customer.id,
    type: "customer",
    title: customerName(customer),
    sub: [customer.email, customer.phone, customer.country].filter(Boolean).join("<br>"),
    pills: customer.tags || [],
    actions: [["order-customer", "+"], ["edit-customer", "✎"], ["delete-customer", "×"]],
  })).join("");
}

function renderVarieties() {
  const varieties = state.data.varieties.filter(matchVariety).sort((a, b) => customerSortPrice(a) - customerSortPrice(b) || a.name.localeCompare(b.name, "cs"));
  if (!varieties.length) return empty("Žádné odrůdy.");
  return varieties.map((variety) => card({
    id: variety.id,
    type: "variety",
    title: `🌿 ${variety.name}`,
    sub: `${varietyImages(variety).length ? `${varietyImages(variety).length} fotek` : "Bez fotky"} · ${varietyUsageCount(variety.name)} záznamů`,
    price: variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "Bez ceny",
    thumb: varietyImages(variety)[0],
    thumbText: initials(variety.name),
    pills: [variety.active === false ? "Neaktivní" : "✅ Aktivní"],
    actions: [["edit-variety", "✎"], ["delete-variety", "×"]],
  })).join("");
}

function renderCrosses() {
  const crosses = state.data.crosses.filter(matchCross).sort((a, b) => String(b.pollinatedAt).localeCompare(String(a.pollinatedAt)));
  if (!crosses.length) return empty("Žádná křížení.");
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
      pills: [crossStageText(cross.stage), ratingLabels[cross.resultRating] ? `✅ ${ratingLabels[cross.resultRating]}` : "Bez hodnocení", cross.seedlingName || "—"],
      actions: [["download-cross", "▣"], ["edit-cross", "✎"], ["delete-cross", "×"]],
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
    <label class="field"><span>Heslo k účtu</span><input id="syncLoginPassword" type="password" autocomplete="current-password"></label>
    <label class="field"><span>Šifrovací heslo</span><input id="syncPassword" type="password" value="${escapeHtml(state.syncPassword)}" placeholder="nesmí se ztratit"></label>`;
  return `<section class="sync-card">
    <strong class="title">Soukromá appka</strong>
    <p class="sub">${loggedIn ? "Přihlášeno. Sync běží automaticky na pozadí." : "Po přihlášení se ukáže obsah appky. Sync běží úsporně."}</p>
    <input id="syncUrl" type="hidden" value="${escapeHtml(config.url)}">
    <input id="syncAnon" type="hidden" value="${escapeHtml(config.anonKey)}">
    ${loginFields}
    <div class="two">
      ${loggedIn ? `<button class="button" type="button" id="syncLogout">Odhlásit</button>` : `<button class="button primary" type="button" id="syncLogin">Přihlásit</button>`}
    </div>
    <small class="sub">${loggedIn ? "Obsah je odemčený." : "Obsah se zobrazí až po přihlášení."}</small>
  </section>
  <section class="sync-card">
    <strong class="title">Poplatky</strong>
    <div class="two">
      <label class="field"><span>Zásilkovna ČR</span><input id="settingShippingCz" inputmode="decimal" value="${escapeHtml(settings.shippingFeeCz)}"></label>
      <label class="field"><span>Zásilkovna SK</span><input id="settingShippingSk" inputmode="decimal" value="${escapeHtml(settings.shippingFeeSk)}"></label>
    </div>
    <label class="field"><span>Balné</span><input id="settingPacking" inputmode="decimal" value="${escapeHtml(settings.packingFee)}"></label>
    <strong class="title small-title">Platba pro zákazníka</strong>
    <label class="field"><span>Jméno a příjmení</span><input id="settingPaymentName" value="${escapeHtml(settings.paymentAccountName)}"></label>
    <label class="field"><span>Číslo účtu</span><input id="settingPaymentAccount" value="${escapeHtml(settings.paymentAccountNumber)}"></label>
    <label class="field"><span>IBAN</span><input id="settingPaymentIban" value="${escapeHtml(settings.paymentIban)}"></label>
    <label class="field"><span>SWIFT / BIC</span><input id="settingPaymentSwift" value="${escapeHtml(settings.paymentSwift)}"></label>
    <button class="button primary" type="button" id="saveAppSettings">Uložit nastavení</button>
  </section>`;
}

function card({ id, type, tone = "", title, sub = "", price = "", pills = [], badges = [], actions = [], thumb = "", thumbText = "" }) {
  const thumbRef = thumbPreviewRef(thumb);
  const thumbHtml = thumb || thumbText ? `<span class="thumb">${thumb ? `<img data-photo-ref="${escapeHtml(thumbRef)}" alt="">` : escapeHtml(thumbText)}</span>` : "";
  return `<article class="card card-${escapeHtml(type)} ${tone} ${badges.length ? "has-status" : ""}" data-card="${type}" data-id="${escapeHtml(id)}">
    ${badges.length ? `<div class="status-badges">${badges.filter(Boolean).map((badge) => `<span class="pill">${escapeHtml(badge)}</span>`).join("")}</div>` : ""}
    <div class="card-row">
      ${thumbHtml}
      <div class="card-main">
        <strong class="title">${title}</strong>
        ${sub ? `<span class="sub">${sub}</span>` : ""}
      </div>
    </div>
    ${price ? `<strong class="price">${escapeHtml(price)}</strong>` : ""}
    ${pills.length ? `<div class="pill-row">${pills.filter(Boolean).map((pill) => `<span class="pill">${escapeHtml(pill)}</span>`).join("")}</div>` : ""}
    ${actions.length ? `<div class="card-actions">${actions.map(([action, label]) => `<button class="round" type="button" data-action-row="${action}" data-id="${escapeHtml(id)}">${label}</button>`).join("")}</div>` : ""}
  </article>`;
}

function bindListActions() {
  els.list.querySelectorAll("[data-card]").forEach((cardEl) => {
    cardEl.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      const type = cardEl.dataset.card;
      const id = cardEl.dataset.id;
      if (type === "customer") openCustomerSheet(id);
      if (type === "order") openOrderSheet(id);
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
  if (action === "edit-customer") return openCustomerSheet(id);
  if (action === "order-customer") return openOrderSheet(null, id);
  if (action === "delete-customer") return deleteItem("customers", id, "Zákazníka");
  if (action === "edit-order") return openOrderSheet(id);
  if (action === "delete-order") return deleteItem("orders", id, "Objednávku");
  if (action === "copy-order") return copyOrderText(id);
  if (action === "edit-variety") return openVarietySheet(id);
  if (action === "delete-variety") return deleteItem("varieties", id, "Odrůdu");
  if (action === "edit-cross") return openCrossSheet(id);
  if (action === "download-cross") return downloadCrossCard(id);
  if (action === "delete-cross") return deleteItem("crosses", id, "Křížení");
  if (action === "edit-offer") return openOfferSheet(id);
  if (action === "delete-offer") return deleteItem("offers", id, "Nabídku");
}

function crossStageText(stage) {
  return `${stageIcons[stage] || stageIcons.opyleno} ${stageLabels[stage] || "Opyleno"}`;
}

function customerOverviewMarkup(customerId) {
  const orders = state.data.orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => String(b.orderDate || "").localeCompare(String(a.orderDate || "")));
  const waitingOrders = orders.filter((order) => order.paymentStatus !== "zaplaceno");
  const waitingText = waitingOrders.length ? `${waitingOrders.length} · ${orderTotalsText(waitingOrders)}` : "Ne";
  return `<section class="customer-overview">
    <div class="offer-stats customer-overview-stats">
      <span><small>Objednávky</small><strong>${orders.length}</strong></span>
      <span><small>Celkem koupil</small><strong>${escapeHtml(orderTotalsText(orders))}</strong></span>
      <span><small>Čeká platba</small><strong>${escapeHtml(waitingText)}</strong></span>
    </div>
  </section>`;
}

function orderTotalsText(orders = []) {
  const total = orders.reduce((sum, order) => sum + orderFinalTotal(order), 0);
  return total > 0 ? formatMoney(total, "CZK") : "0 Kč";
}

function openCustomerSheet(id = "") {
  const customer = findById("customers", id) || {};
  openSheet(customer.id ? "Upravit zákazníka" : "Nový zákazník", `${customer.id ? customerOverviewMarkup(customer.id) : ""}<form class="form-grid" id="sheetForm">
    <label class="field"><span>Jméno a příjmení</span><input name="fullName" required value="${escapeHtml(customerName(customer))}"></label>
    <label class="field"><span>Telefon</span><input name="phone" value="${escapeHtml(customer.phone)}"></label>
    <label class="field"><span>Email</span><input name="email" type="email" value="${escapeHtml(customer.email)}"></label>
    <label class="field"><span>FB jméno</span><input name="fbName" value="${escapeHtml(customer.fbName)}"></label>
    <label class="field"><span>Ulice</span><input name="street" value="${escapeHtml(customer.street)}"></label>
    <div class="two">
      <label class="field"><span>PSČ</span><input name="postalCode" value="${escapeHtml(customer.postalCode)}"></label>
      <label class="field"><span>Město</span><input name="city" value="${escapeHtml(customer.city)}"></label>
    </div>
    <label class="field"><span>Země</span><input name="country" value="${escapeHtml(customer.country)}"></label>
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(customer.note)}</textarea></label>
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
  openSheet(order.id ? "Upravit objednávku" : "Nová objednávka", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>Zákazník</span><select name="customerId" required>${customers.map((customer) => `<option value="${escapeHtml(customer.id)}" ${(order.customerId || customerId) === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`).join("")}</select></label>
    <label class="field"><span>Datum</span><input name="orderDate" type="date" required value="${escapeHtml(order.orderDate || todayInput())}"></label>
    ${toggle("paymentStatus", [["čeká", "Čeká"], ["zaplaceno", "Zaplaceno"]], order.paymentStatus || "čeká")}
    ${toggle("shippingStatus", [["nová", "Nová"], ["připraveno", "Připravená"], ["odesláno", "Odeslaná"], ["zaplaceno", "Vyřízená"]], order.shippingStatus || "nová")}
    ${toggle("deliveryMethod", [["ship", "Odeslat"], ["personal_pickup", "Osobní odběr"]], order.deliveryMethod || "ship")}
    <div class="toggle-grid">
      <button class="chip-button ${clean(order.shippingFee) === appSettings().shippingFeeCz ? "active" : ""}" type="button" data-fee="shipping-cz">Zásilkovna ČR · ${escapeHtml(appSettings().shippingFeeCz || "89")} Kč</button>
      <button class="chip-button ${clean(order.shippingFee) === appSettings().shippingFeeSk ? "active" : ""}" type="button" data-fee="shipping-sk">Zásilkovna SK · ${escapeHtml(appSettings().shippingFeeSk || "99")} Kč</button>
      <button class="chip-button ${clean(order.packingFee) ? "active" : ""}" type="button" data-fee="packing">Balné · ${escapeHtml(appSettings().packingFee || "20")} Kč</button>
    </div>
    <label class="field"><span>Odrůdy</span><textarea name="varietiesText" placeholder="NN Harriet 1x - 600 Kč">${escapeHtml(order.varietiesText)}</textarea></label>
    <label class="field"><span>Celkem Kč</span><input name="price" inputmode="decimal" value="${escapeHtml(order.price)}"></label>
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(order.note)}</textarea></label>
    <input name="shippingFee" type="hidden" value="${escapeHtml(order.shippingFee)}">
    <input name="packingFee" type="hidden" value="${escapeHtml(order.packingFee)}">
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const item = normalizeOrder({
      ...order,
      id: order.id || uid(),
      customerId: clean(data.get("customerId")),
      orderDate: clean(data.get("orderDate")) || todayInput(),
      paymentStatus: form.querySelector('[name="paymentStatus"]').value,
      shippingStatus: form.querySelector('[name="shippingStatus"]').value,
      deliveryMethod: form.querySelector('[name="deliveryMethod"]').value,
      varietiesText: clean(data.get("varietiesText")),
      price: clean(data.get("price")),
      shippingFee: clean(data.get("shippingFee")),
      packingFee: clean(data.get("packingFee")),
      note: clean(data.get("note")),
      createdAt: order.createdAt || now,
      updatedAt: now,
    });
    upsert("orders", item);
  });
  bindToggles();
  bindFees();
}

function openVarietySheet(id = "") {
  const variety = findById("varieties", id) || {};
  openSheet(variety.id ? "Upravit odrůdu" : "Nová odrůda", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>Název</span><input name="name" required value="${escapeHtml(variety.name)}"></label>
    <label class="field"><span>Prodejní cena Kč</span><input name="salePrice" inputmode="decimal" value="${escapeHtml(variety.salePrice)}"></label>
    <button class="chip-button ${variety.active === false ? "" : "active"}" type="button" data-toggle-active>${variety.active === false ? "Neaktivní" : "✅ Aktivní"}</button>
    ${photoPickerFields("Fotky")}
    <div class="photo-grid" id="photoGrid">${photoTiles(varietyImages(variety))}</div>
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(variety.note)}</textarea></label>
  </form>`, async () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const files = selectedPhotoFiles(form);
    const uploaded = await saveIndexedPhotos(files);
    const existing = [...form.querySelectorAll("[data-photo-tile]")].map((node) => node.dataset.photoTile);
    const now = new Date().toISOString();
    const item = {
      ...variety,
      id: variety.id || uid(),
      name: clean(data.get("name")),
      salePrice: normalizeAmount(data.get("salePrice")),
      saleCurrency: "CZK",
      photoUrl: [...existing, ...uploaded][0] || "",
      gallery: [...existing, ...uploaded].slice(1),
      active: !form.querySelector("[data-toggle-active]").classList.contains("is-off"),
      note: clean(data.get("note")),
      createdAt: variety.createdAt || now,
      updatedAt: now,
    };
    upsert("varieties", item);
  });
  bindPhotoGrid();
  document.querySelector("[data-toggle-active]").addEventListener("click", (buttonEvent) => {
    const button = buttonEvent.currentTarget;
    button.classList.toggle("active");
    button.classList.toggle("is-off");
    button.textContent = button.classList.contains("is-off") ? "Neaktivní" : "✅ Aktivní";
  });
}

function openVarietyDetailSheet(id, options = {}) {
  const variety = findById("varieties", id);
  if (!variety) return;
  const images = varietyImages(variety);
  const usage = varietyUsageCount(variety.name);
  const mainImage = images[0] || "";
  openSheet(variety.name, `<section class="variety-detail">
    <div class="variety-detail-photo ${mainImage ? "" : "empty"}">
      ${mainImage ? `<img data-photo-ref="${escapeHtml(thumbPreviewRef(mainImage))}" alt="${escapeHtml(variety.name)}">` : `<span>${escapeHtml(initials(variety.name))}</span>`}
    </div>
    <div class="offer-stats variety-detail-stats">
      <span><strong>${escapeHtml(variety.salePrice ? formatMoney(variety.salePrice, "CZK") : "-")}</strong><small>cena</small></span>
      <span><strong>${images.length}</strong><small>fotek</small></span>
      <span><strong>${usage}</strong><small>v objednávkách</small></span>
      <span><strong>${variety.active === false ? "Ne" : "Ano"}</strong><small>aktivní</small></span>
    </div>
    ${variety.note ? `<p class="sub">${escapeHtml(variety.note)}</p>` : ""}
    ${images.length > 1 ? `<div class="photo-grid variety-detail-gallery">${images.map((image) => `<span class="photo-tile"><img data-photo-ref="${escapeHtml(thumbPreviewRef(image))}" alt="${escapeHtml(variety.name)}"></span>`).join("")}</div>` : ""}
  </section>`, null, `<button class="button" type="button" data-download-variety-photo="${escapeHtml(id)}" ${mainImage ? "" : "disabled"}>Stáhnout fotku</button><button class="button primary" type="button" data-edit-variety-detail="${escapeHtml(id)}">Upravit</button>`, {
    ...options,
    restore: () => openVarietyDetailSheet(id, { replace: true }),
  });
  els.sheet.querySelector("[data-edit-variety-detail]")?.addEventListener("click", () => openVarietySheet(id));
  els.sheet.querySelector("[data-download-variety-photo]")?.addEventListener("click", () => downloadVarietyPhoto(id));
  resolvePhotos(els.sheet);
}

function openCrossSheet(id = "") {
  const cross = findById("crosses", id) || {};
  const options = state.data.varieties.map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`).join("");
  openSheet(cross.id ? "Upravit křížení" : "Nové křížení", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>Matka</span><select name="motherVarietyId" required>${options}</select></label>
    <label class="field"><span>Pyl</span><select name="pollenVarietyId" required>${options}</select></label>
    <label class="field"><span>Datum opylení</span><input name="pollinatedAt" type="date" required value="${escapeHtml(cross.pollinatedAt || todayInput())}"></label>
    ${toggle("stage", [["opyleno", "Opyleno"], ["vyseto", "Vyseto"], ["roste", "Roste"], ["hotovo", "Hotovo"]], cross.stage || "opyleno")}
    ${toggle("resultRating", [["krasna", "Krásná"], ["hnusna", "Hnusná"], ["nejista", "Nejistá"]], cross.resultRating || "nejista")}
    <label class="field"><span>Název semenáče</span><input name="seedlingName" value="${escapeHtml(cross.seedlingName)}"></label>
    ${photoPickerFields("Fotky semenáče")}
    <div class="photo-grid" id="photoGrid">${photoTiles(crossSeedlingImages(cross))}</div>
    <div class="cross-flow" id="crossPreview"></div>
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(cross.note)}</textarea></label>
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
  document.querySelector('[name="motherVarietyId"]').value = cross.motherVarietyId || state.data.varieties[0]?.id || "";
  document.querySelector('[name="pollenVarietyId"]').value = cross.pollenVarietyId || state.data.varieties[1]?.id || state.data.varieties[0]?.id || "";
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
      <span class="pill">${ratingLabels[cross.resultRating] || "Bez hodnocení"}</span>
      ${cross.seedlingName ? `<span class="pill">${escapeHtml(cross.seedlingName)}</span>` : ""}
    </div>
    ${cross.note ? `<p class="sub">${escapeHtml(cross.note)}</p>` : ""}`, null, `<button class="button" type="button" data-download-cross="${escapeHtml(id)}">Stáhnout obrázek</button><button class="button primary" type="button" data-edit-cross="${escapeHtml(id)}">Upravit</button>`, {
    ...options,
    restore: () => openCrossDetailSheet(id, { replace: true }),
  });
  document.querySelector("[data-edit-cross]")?.addEventListener("click", () => openCrossSheet(id));
  document.querySelector("[data-download-cross]")?.addEventListener("click", () => downloadCrossCard(id));
  resolvePhotos(els.sheet);
}

function openOfferSheet(id = "") {
  const offer = findById("offers", id) || {};
  openSheet(offer.id ? "Upravit nabídku" : "Nová nabídka", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>Název</span><input name="title" required value="${escapeHtml(offer.title || `Nabídka ${formatDate(todayInput())}`)}"></label>
    <label class="field"><span>Datum</span><input name="date" type="date" required value="${escapeHtml(offer.date || todayInput())}"></label>
    ${toggle("status", [["připravená", "Připravená"], ["zveřejněná", "Zveřejněná"], ["uzavřená", "Uzavřená"]], offer.status || "připravená")}
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(offer.note)}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    upsert("offers", normalizeOffer({
      ...offer,
      id: offer.id || uid(),
      title: clean(data.get("title")),
      date: clean(data.get("date")),
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
  const reserved = offerReservedCount(offer);
  const total = offerTotalCount(offer);
  openSheet(offer.title, `<section class="offer-detail">
    <div class="offer-stats">
      <span><strong>${offer.items.length}</strong><small>odřezků</small></span>
      <span><strong>${total}</strong><small>kusů</small></span>
      <span><strong>${reserved}</strong><small>rezervací</small></span>
      <span><strong>${Math.max(0, total - reserved)}</strong><small>volné</small></span>
    </div>
    ${offer.note ? `<p class="sub">${escapeHtml(offer.note)}</p>` : ""}
    <div class="offer-items">
      ${offer.items.length ? offer.items.map((item) => offerItemDetailMarkup(offer, item)).join("") : `<div class="empty light">Zatím bez odřezků.</div>`}
    </div>
  </section>`, null, `<button class="button" type="button" data-close-sheet>Zavřít</button><button class="button" type="button" data-edit-offer-detail="${escapeHtml(id)}">Upravit nabídku</button><button class="button" type="button" data-create-offer-orders="${escapeHtml(id)}">Vytvořit objednávky</button><button class="button primary" type="button" data-add-offer-item="${escapeHtml(id)}">Přidat odřezek</button>`, {
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

function offerItemDetailMarkup(offer, item) {
  const reserved = offerItemReservedCount(item);
  const alternate = offerItemAlternateCount(item);
  const confirmed = offerItemConfirmedCount(item);
  const total = number(item.quantity);
  const available = Math.max(0, total - confirmed);
  const image = offerItemImage(item);
  const offerId = escapeHtml(offer.id);
  const itemId = escapeHtml(item.id);
  return `<article class="offer-item ${available <= 0 ? "sold-out" : ""}">
    <div class="offer-item-head">
      <span class="thumb">${image ? `<img data-photo-ref="${escapeHtml(image)}" alt="">` : escapeHtml(initials(offerItemName(item)))}</span>
      <div>
        <strong>${escapeHtml(offerItemName(item))}</strong>
        <small>${total || 0} ks · ${formatMoney(item.price, item.currency || "CZK")} / ks</small>
      </div>
    </div>
    <div class="pill-row">
      <span class="pill">Volné ${available}</span>
      <span class="pill">Potvrzeno ${confirmed}</span>
      ${alternate ? `<span class="pill">Náhradník ${alternate}</span>` : ""}
    </div>
    <div class="offer-item-actions">
      <button class="button primary" type="button" data-offer-id="${offerId}" data-reserve-offer-item="${itemId}" ${available <= 0 ? "disabled" : ""}>Rezervovat</button>
      <button class="button" type="button" data-offer-id="${offerId}" data-alternate-offer-item="${itemId}">Náhradník</button>
      <button class="button" type="button" data-offer-id="${offerId}" data-edit-offer-item="${itemId}">Upravit</button>
      <button class="button danger" type="button" data-offer-id="${offerId}" data-delete-offer-item="${itemId}">Smazat</button>
    </div>
    <div class="reservation-list">
      ${(item.reservations || []).length ? sortedReservations(item).map((reservation) => reservationLineMarkup(offer, item, reservation)).join("") : `<small class="sub">Zatím bez rezervací.</small>`}
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
    <strong>${escapeHtml(customerName(customer) || "Bez zákazníka")}</strong>
    <span>${number(reservation.quantity) || 1} ks</span>
    <span class="pill ${status === "alternate" ? "warn" : "ok"}">${status === "alternate" ? "Náhradník" : "Potvrzeno"}</span>
    ${reservation.note ? `<small>${escapeHtml(reservation.note)}</small>` : ""}
    <span class="reservation-line-actions">
      <button class="round" type="button" data-offer-id="${offerId}" data-item-id="${itemId}" data-edit-reservation="${reservationId}" title="Upravit rezervaci">✎</button>
      <button class="round" type="button" data-offer-id="${offerId}" data-item-id="${itemId}" data-delete-reservation="${reservationId}" title="Smazat rezervaci">×</button>
    </span>
  </div>`;
}

function openOfferItemSheet(offerId, itemId = "") {
  const offer = findById("offers", offerId);
  if (!offer) return;
  const item = itemId ? offer.items.find((entry) => entry.id === itemId) : null;
  const matchedVariety = findById("varieties", item?.varietyId) || findVarietyByName(item?.varietyName);
  const selectedCurrency = clean(item?.currency || matchedVariety?.saleCurrency || "CZK");
  openSheet(item ? "Upravit odřezek" : "Přidat odřezek", `<form class="form-grid" id="sheetForm">
    <label class="field"><span>Odrůda</span><input name="varietyName" list="offerVarietyOptions" required value="${escapeHtml(item?.varietyName || "")}" placeholder="Název odrůdy"></label>
    <datalist id="offerVarietyOptions">${state.data.varieties.map((variety) => `<option value="${escapeHtml(variety.name)}"></option>`).join("")}</datalist>
    <label class="field"><span>Počet ks</span><input name="quantity" inputmode="numeric" required value="${escapeHtml(item?.quantity || "1")}"></label>
    <label class="field"><span>Cena za ks</span><input name="price" inputmode="decimal" value="${escapeHtml(item?.price || matchedVariety?.salePrice || "")}"></label>
    <label class="field"><span>Měna</span><select name="currency">
      <option value="CZK" ${selectedCurrency === "CZK" ? "selected" : ""}>Kč</option>
      <option value="EUR" ${selectedCurrency === "EUR" ? "selected" : ""}>EUR</option>
    </select></label>
    ${photoPickerFields("Fotka odřezku (volitelně)")}
    <div class="photo-grid" id="photoGrid">${photoTiles(clean(item?.photoUrl) ? [item.photoUrl] : [])}</div>
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(item?.note || "")}</textarea></label>
  </form>`, async () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const varietyName = clean(data.get("varietyName"));
    const variety = findVarietyByName(varietyName);
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
    offer.updatedAt = now;
    setTimeout(() => openOfferDetailSheet(offer.id, { replace: true }), 0);
  });
  bindPhotoGrid();
}

function openReservationSheet(offerId, itemId, reservationId = "", preferredStatus = "confirmed") {
  const offer = findById("offers", offerId);
  const item = offer?.items.find((entry) => entry.id === itemId);
  if (!offer || !item) return;
  item.reservations = Array.isArray(item.reservations) ? item.reservations : [];
  const reservation = reservationId ? item.reservations.find((entry) => entry.id === reservationId) : null;
  const status = reservationStatusValue(reservation?.status || preferredStatus);
  const selectedCustomerId = reservation?.customerId || "";
  openSheet(reservation ? "Upravit rezervaci" : (status === "alternate" ? "Přidat náhradníka" : "Nová rezervace"), `<form class="form-grid" id="sheetForm">
    <div class="offer-reservation-context">
      <strong>${escapeHtml(offerItemName(item))}</strong>
      <small>${escapeHtml(offer.title)} · volné ${reservationAvailableQuantity(item, reservation?.id)} ks</small>
    </div>
    <label class="field"><span>Zákazník</span><select name="customerId">
      <option value="">Vybrat zákazníka</option>
      ${state.data.customers.slice().sort((a, b) => customerName(a).localeCompare(customerName(b), "cs")).map((customer) => `<option value="${escapeHtml(customer.id)}" ${selectedCustomerId === customer.id ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`).join("")}
    </select></label>
    <label class="field"><span>Nebo nový zákazník</span><input name="newCustomerName" value="" placeholder="Jméno nebo FB jméno"></label>
    <label class="field"><span>Telefon nového zákazníka</span><input name="newCustomerPhone" value="" inputmode="tel"></label>
    <label class="field"><span>Počet ks</span><input name="quantity" inputmode="numeric" required value="${escapeHtml(reservation?.quantity || "1")}"></label>
    ${toggle("status", [["confirmed", "Potvrzeno"], ["alternate", "Náhradník"]], status)}
    <label class="field"><span>Poznámka</span><textarea name="note">${escapeHtml(reservation?.note || "")}</textarea></label>
  </form>`, () => {
    const form = document.querySelector("#sheetForm");
    const data = new FormData(form);
    const now = new Date().toISOString();
    const newCustomerName = clean(data.get("newCustomerName"));
    let customerId = clean(data.get("customerId"));
    if (!customerId) {
      if (!newCustomerName) {
        toast("Vyber zákazníka nebo napiš nového.");
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
      toast("Položka je plná, ukládám jako náhradníka.");
    } else if (nextStatus === "confirmed" && requestedQuantity > availableQuantity) {
      toast(`Volné jsou jen ${availableQuantity} ks. Zmenši počet nebo zvol náhradníka.`);
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
    setTimeout(() => openOfferDetailSheet(offer.id, { replace: true }), 0);
  });
  bindToggles();
}

function deleteOfferItem(offerId, itemId) {
  const offer = findById("offers", offerId);
  if (!offer) return;
  const item = offer.items.find((entry) => entry.id === itemId);
  if (!item || !confirm(`Smazat odřezek ${offerItemName(item)}?`)) return;
  offer.items = offer.items.filter((entry) => entry.id !== itemId);
  offer.updatedAt = new Date().toISOString();
  saveData();
  render();
  openOfferDetailSheet(offer.id, { replace: true });
  toast("Odřezek smazán.");
}

function deleteReservation(offerId, itemId, reservationId) {
  const offer = findById("offers", offerId);
  const item = offer?.items.find((entry) => entry.id === itemId);
  if (!offer || !item || !confirm("Smazat rezervaci?")) return;
  item.reservations = (item.reservations || []).filter((entry) => entry.id !== reservationId);
  offer.updatedAt = new Date().toISOString();
  saveData();
  render();
  openOfferDetailSheet(offer.id, { replace: true });
  toast("Rezervace smazána.");
}

function createOrdersFromOffer(id) {
  const offer = findById("offers", id);
  if (!offer) return;
  const reservations = [];
  offer.items.forEach((item) => {
    (item.reservations || []).forEach((reservation) => {
      if (!reservation.customerId) return;
      if (reservationStatusValue(reservation.status) !== "confirmed") return;
      reservations.push({ item, reservation });
    });
  });
  if (!reservations.length) {
    toast("Nabídka nemá žádné potvrzené rezervace.");
    return;
  }
  if (state.data.orders.some((order) => order.offerId === offer.id) && !confirm("Z této nabídky už objednávky vznikly. Vytvořit další?")) return;
  if (!confirm(`Vytvořit objednávky z nabídky ${offer.title}?`)) return;

  const grouped = new Map();
  reservations.forEach(({ item, reservation }) => {
    const key = reservation.customerId;
    if (!grouped.has(key)) grouped.set(key, { customerId: reservation.customerId, lines: [], total: 0 });
    const group = grouped.get(key);
    const quantity = wholeNumber(reservation.quantity, 1);
    const price = number(item.price);
    group.lines.push(Number.isFinite(price) ? offerOrderLineText(item.varietyName, quantity, price) : `${offerItemName(item)} ${quantity}x`);
    if (Number.isFinite(price)) group.total += price * quantity;
  });

  const now = new Date().toISOString();
  let count = 0;
  grouped.forEach((group) => {
    const fees = defaultOfferOrderFees(group.customerId);
    const shippingFee = number(fees.shippingFee);
    const packingFee = number(fees.packingFee);
    const feeTotal = (Number.isFinite(shippingFee) ? shippingFee : 0) + (Number.isFinite(packingFee) ? packingFee : 0);
    state.data.orders.push(normalizeOrder({
      id: uid(),
      offerId: offer.id,
      customerId: group.customerId,
      orderDate: offer.date || todayInput(),
      varietiesText: group.lines.join("\n"),
      price: normalizeAmount(group.total + feeTotal),
      paymentStatus: "čeká",
      shippingStatus: "nová",
      deliveryMethod: "ship",
      shippingFee: Number.isFinite(shippingFee) ? fees.shippingFee : "",
      packingFee: Number.isFinite(packingFee) ? fees.packingFee : "",
      note: `Z nabídky: ${offer.title}`,
      createdAt: now,
      updatedAt: now,
    }));
    count += 1;
  });

  offer.status = "uzavřená";
  offer.updatedAt = now;
  saveData();
  closeSheet({ all: true });
  state.view = "orders";
  render();
  toast(`Vytvořeno ${count} objednávek.`);
}

function offerOrderLineText(name, quantity, unitPrice) {
  return `${clean(name)} ${wholeNumber(quantity, 1)}x - ${normalizeAmount(unitPrice)} Kč`.trim();
}

function defaultOfferOrderFees(customerId) {
  const settings = appSettings();
  const country = normalize(findCustomer(customerId)?.country);
  const shippingFee = country.includes("slovensko")
    ? settings.shippingFeeSk
    : country.includes("cesko") || country.includes("česko")
      ? settings.shippingFeeCz
      : "";
  return { shippingFee: shippingFee || "", packingFee: settings.packingFee || "" };
}

function openSheet(title, body, onSave, customFooter = "", options = {}) {
  if (!els.sheet.hidden && !options.replace && typeof state.currentSheetRestore === "function") {
    state.sheetStack.push(state.currentSheetRestore);
  }
  clearPendingPhotoPreviewUrls(els.sheet.querySelector("#sheetForm"));
  state.currentSheetRestore = typeof options.restore === "function" ? options.restore : null;
  els.sheet.hidden = false;
  els.sheet.innerHTML = `<section class="sheet" role="dialog" aria-modal="true">
    <header class="sheet-header"><h2>${escapeHtml(title)}</h2><button class="round" type="button" data-close-sheet>×</button></header>
    <div class="sheet-body">${body}</div>
    <footer class="sheet-footer">${customFooter || `<button class="button" type="button" data-close-sheet>Zrušit</button><button class="button primary" type="button" data-save-sheet>Uložit</button>`}</footer>
  </section>`;
  els.sheet.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  els.sheet.querySelector("[data-save-sheet]")?.addEventListener("click", async () => {
    const form = els.sheet.querySelector("form");
    if (form && !form.reportValidity()) return;
    const result = await onSave?.();
    if (result === false) return;
    saveData();
    closeSheet();
    render();
    toast("Uloženo.");
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
  return { paymentStatus: "Platba", shippingStatus: "Objednávka", deliveryMethod: "Doprava", stage: "Fáze", resultRating: "Výsledek", status: "Stav" }[name] || name;
}

function bindToggles() {
  els.sheet.querySelectorAll("[data-toggle]").forEach((group) => {
    group.querySelectorAll("[data-toggle-value]").forEach((button) => button.addEventListener("click", () => {
      group.querySelector("input").value = button.dataset.toggleValue;
      group.querySelectorAll("[data-toggle-value]").forEach((item) => item.classList.toggle("active", item === button));
      renderCrossPreviewInSheet();
    }));
  });
}

function bindFees() {
  els.sheet.querySelectorAll("[data-fee]").forEach((button) => button.addEventListener("click", () => {
    button.classList.toggle("active");
    const form = document.querySelector("#sheetForm");
    const settings = appSettings();
    const shipping = [...els.sheet.querySelectorAll("[data-fee].active")].some((item) => item.dataset.fee === "shipping-cz") ? (settings.shippingFeeCz || "89")
      : [...els.sheet.querySelectorAll("[data-fee].active")].some((item) => item.dataset.fee === "shipping-sk") ? (settings.shippingFeeSk || "99") : "";
    form.elements.shippingFee.value = shipping;
    form.elements.packingFee.value = [...els.sheet.querySelectorAll("[data-fee].active")].some((item) => item.dataset.fee === "packing") ? (settings.packingFee || "20") : "";
  }));
}

function bindPhotoGrid() {
  els.sheet.querySelectorAll("[data-remove-photo]").forEach((button) => button.addEventListener("click", () => {
    button.closest("[data-photo-tile]")?.remove();
    renderCrossPreviewInSheet();
  }));
  els.sheet.querySelectorAll(".photo-pickers input[type='file']").forEach((input) => {
    input.addEventListener("change", () => {
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
  const entries = ["photos", "cameraPhotos"].flatMap((inputName) => {
    const input = form.elements[inputName];
    return [...(input?.files || [])]
      .map((file, index) => ({ file, inputName, index }))
      .filter(({ file }) => file.type?.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || ""));
  });
  if (!entries.length) return;
  const fragment = document.createDocumentFragment();
  entries.forEach(({ file, inputName, index }) => {
    const url = URL.createObjectURL(file);
    form.__pendingPhotoPreviewUrls.push(url);
    const tile = document.createElement("span");
    tile.className = "photo-tile pending";
    tile.dataset.pendingPhotoTile = "1";
    tile.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(file.name || "Fotka")}"><button type="button" data-remove-pending-photo="${escapeHtml(inputName)}" data-pending-photo-index="${index}">&times;</button>`;
    fragment.append(tile);
  });
  grid.append(fragment);
  grid.querySelectorAll("[data-remove-pending-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      removePendingPhotoFile(form, button.dataset.removePendingPhoto, Number(button.dataset.pendingPhotoIndex));
    });
  });
}

function removePendingPhotoFile(form, inputName, index) {
  const input = form?.elements?.[inputName];
  if (!input) return;
  const files = [...(input.files || [])];
  files.splice(index, 1);
  try {
    const transfer = new DataTransfer();
    files.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  } catch {
    input.value = "";
  }
  renderPendingPhotoPreviews(form);
  renderCrossPreviewInSheet();
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

function selectedPhotoFiles(form) {
  return [...(form.elements.photos?.files || []), ...(form.elements.cameraPhotos?.files || [])]
    .filter((file) => file.type?.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || ""));
}

function photoTiles(images) {
  return images.map((image) => {
    const previewRef = thumbPreviewRef(image);
    return `<span class="photo-tile" data-photo-tile="${escapeHtml(image)}"><img data-photo-ref="${escapeHtml(previewRef)}" alt=""><button type="button" data-remove-photo>×</button></span>`;
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
    <div class="cross-symbol">×</div>
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
    toast("Obrázek křížení stažen.");
  } catch {
    toast("Obrázek křížení se nepodařilo vytvořit.");
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
      href = await fetchSupabasePhotoObjectUrl(parseSupabasePhotoRef(image)) || await createSignedPhotoUrl(parseSupabasePhotoRef(image));
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
    toast("Fotku se nepodařilo stáhnout.");
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
  context.fillText("×", 540, 275);
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
  wrapCanvasText(context, hasCustomName ? card.name : "Semenáč", width - 80).slice(0, 2).forEach((line, index) => {
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

function deleteItem(collection, id, label) {
  if (!confirm(`${label} smazat?`)) return;
  state.data[collection] = state.data[collection].filter((item) => item.id !== id);
  saveData();
  render();
}

async function copyOrderText(id) {
  const order = findById("orders", id);
  const customer = findCustomer(order?.customerId);
  if (!order) return;
  const text = buildCustomerOrderText(order, customer);
  if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
  else fallbackCopyText(text);
  toast("Text zkopírovaný.");
}

function buildCustomerOrderText(order, customer) {
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
}

function orderFeeLines(order, customer) {
  const currency = "CZK";
  const shipping = number(order.shippingFee);
  const packing = number(order.packingFee);
  const parts = [];
  if (Number.isFinite(shipping) && shipping > 0) parts.push(`${shippingLabel(customer)} ${formatMoney(shipping, currency)}`);
  if (Number.isFinite(packing) && packing > 0) parts.push(`Balné ${formatMoney(packing, currency)}`);
  normalizeNamedFees(order.extraFees).forEach((fee) => {
    const amount = number(fee.amount);
    if (clean(fee.name) && Number.isFinite(amount) && amount > 0) parts.push(`${fee.name} ${formatMoney(amount, currency)}`);
  });
  return parts;
}

function shippingLabel(customer) {
  const country = normalize(clean(customer?.country || ""));
  if (country.includes("slovensko")) return "Zásilkovna Slovensko";
  if (country.includes("cesko") || country.includes("česko")) return "Zásilkovna ČR";
  return "Zásilkovna";
}

function orderFinalTotal(order) {
  const price = number(order.price);
  if (Number.isFinite(price)) return price;
  return orderTotalFromText(order.varietiesText) + orderFeeLines(order, findCustomer(order.customerId)).reduce((sum, line) => {
    const match = line.match(/(\d+(?:[,.]\d+)?)\s*Kč/i);
    return sum + (match ? number(match[1]) : 0);
  }, 0);
}

function shouldShowEur(customer) {
  const country = normalize(clean(customer?.country || ""));
  return country && !country.includes("cesko") && !country.includes("česko");
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
  if (SEED_SIGNATURE && window.AFRICKE_KOPRIVY_SEED && localStorage.getItem(SEED_SIGNATURE_KEY) !== SEED_SIGNATURE) {
    const seeded = normalizeLoadedData(window.AFRICKE_KOPRIVY_SEED);
    localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
    localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
    return seeded;
  }
  const key = [STORE_KEY, ...LEGACY_STORE_KEYS].find((item) => localStorage.getItem(item));
  if (key) {
    try {
      const data = normalizeLoadedData(JSON.parse(localStorage.getItem(key)));
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      return data;
    } catch {
      localStorage.removeItem(key);
    }
  }
  const data = normalizeLoadedData(window.AFRICKE_KOPRIVY_SEED || { customers: [], orders: [], varieties: [], crosses: [], offers: [], exchangeRates: [], settings: {} });
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  if (SEED_SIGNATURE) localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
  return data;
}

function saveData(options = {}) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state.data));
  if (!options.skipAutoSync) scheduleAutoSync();
}

function normalizeLoadedData(data = {}) {
  return {
    customers: Array.isArray(data.customers) ? data.customers.map(normalizeCustomer) : [],
    orders: Array.isArray(data.orders) ? data.orders.map(normalizeOrder) : [],
    varieties: Array.isArray(data.varieties) ? data.varieties.map(normalizeVariety) : [],
    crosses: Array.isArray(data.crosses) ? data.crosses.map(normalizeCross) : [],
    offers: Array.isArray(data.offers) ? data.offers.map(normalizeOffer) : [],
    exchangeRates: Array.isArray(data.exchangeRates) ? data.exchangeRates : [],
    settings: data.settings || {},
  };
}

function appSettings() {
  const settings = state.data.settings || {};
  state.data.settings = {
    ...settings,
    shippingFeeCz: normalizeAmount(settings.shippingFeeCz ?? settings.shippingFee),
    shippingFeeSk: normalizeAmount(settings.shippingFeeSk),
    packingFee: normalizeAmount(settings.packingFee),
    paymentAccountName: clean(settings.paymentAccountName),
    paymentAccountNumber: clean(settings.paymentAccountNumber),
    paymentIban: clean(settings.paymentIban),
    paymentSwift: clean(settings.paymentSwift || settings.paymentBic || settings.paymentSwiftBic),
    extraFees: normalizeNamedFees(settings.extraFees),
  };
  return state.data.settings;
}

function saveAppSettingsFromInputs() {
  const current = appSettings();
  state.data.settings = {
    ...current,
    shippingFeeCz: normalizeAmount(document.querySelector("#settingShippingCz")?.value),
    shippingFeeSk: normalizeAmount(document.querySelector("#settingShippingSk")?.value),
    packingFee: normalizeAmount(document.querySelector("#settingPacking")?.value),
    currency: "CZK",
    paymentAccountName: clean(document.querySelector("#settingPaymentName")?.value),
    paymentAccountNumber: clean(document.querySelector("#settingPaymentAccount")?.value),
    paymentIban: clean(document.querySelector("#settingPaymentIban")?.value),
    paymentSwift: clean(document.querySelector("#settingPaymentSwift")?.value),
    extraFees: normalizeNamedFees(current.extraFees),
  };
  saveData();
  render();
  toast("Nastavení uloženo.");
}

function normalizeCustomer(customer = {}) {
  const fullName = collapseRepeatedName(customer.fullName);
  const firstName = collapseRepeatedName(customer.firstName || fullName);
  const lastName = collapseRepeatedName(customer.lastName);
  const lastNameAlreadyInFirstName = lastName && normalize(firstName).includes(normalize(lastName));
  return { ...customer, id: clean(customer.id) || uid(), fullName: "", firstName: firstName || "Bez jména", lastName: lastNameAlreadyInFirstName ? "" : lastName, phone: clean(customer.phone), email: clean(customer.email), fbName: clean(customer.fbName), street: clean(customer.street), postalCode: clean(customer.postalCode), city: clean(customer.city), country: clean(customer.country), note: clean(customer.note), tags: Array.isArray(customer.tags) ? customer.tags : [] };
}

function normalizeOrder(order = {}) {
  return { ...order, id: clean(order.id) || uid(), customerId: clean(order.customerId), orderDate: clean(order.orderDate) || todayInput(), varietiesText: clean(order.varietiesText), price: normalizeAmount(order.price), paymentStatus: clean(order.paymentStatus) === "zaplaceno" ? "zaplaceno" : "čeká", shippingStatus: ["nová", "připraveno", "odesláno", "zaplaceno"].includes(clean(order.shippingStatus)) ? clean(order.shippingStatus) : "nová", deliveryMethod: clean(order.deliveryMethod) === "personal_pickup" ? "personal_pickup" : "ship", shippingFee: normalizeAmount(order.shippingFee), packingFee: normalizeAmount(order.packingFee), codFee: "", currency: "CZK", note: clean(order.note) };
}

function normalizeVariety(variety = {}) {
  return { ...variety, id: clean(variety.id) || uid(), name: clean(variety.name), salePrice: normalizeAmount(variety.salePrice), saleCurrency: "CZK", photoUrl: clean(variety.photoUrl), gallery: normalizeGallery(variety.gallery), active: variety.active !== false, note: clean(variety.note) };
}

function normalizeCross(cross = {}) {
  return { ...cross, id: clean(cross.id) || uid(), motherVarietyId: clean(cross.motherVarietyId), pollenVarietyId: clean(cross.pollenVarietyId), pollinatedAt: clean(cross.pollinatedAt || cross.date) || todayInput(), stage: ["opyleno", "vyseto", "roste", "hotovo"].includes(clean(cross.stage)) ? clean(cross.stage) : "opyleno", seedlingName: clean(cross.seedlingName || cross.name), seedlingPhotoUrl: clean(cross.seedlingPhotoUrl || cross.photoUrl), seedlingGallery: normalizeGallery(cross.seedlingGallery || cross.gallery), resultRating: ["krasna", "hnusna", "nejista"].includes(clean(cross.resultRating || cross.rating)) ? clean(cross.resultRating || cross.rating) : "", linkedVarietyId: clean(cross.linkedVarietyId || cross.varietyId), note: clean(cross.note) };
}

function normalizeOffer(offer = {}) {
  return { ...offer, id: clean(offer.id) || uid(), title: clean(offer.title) || `Nabídka ${formatDate(offer.date || todayInput())}`, date: clean(offer.date) || todayInput(), status: clean(offer.status) || "připravená", items: Array.isArray(offer.items) ? offer.items.map(normalizeOfferItem) : [], note: clean(offer.note) };
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
  };
}

function findById(collection, id) {
  return state.data[collection]?.find((item) => item.id === id) || null;
}

function findCustomer(id) {
  return findById("customers", id);
}

function findVarietyByName(name) {
  const key = normalize(name);
  return state.data.varieties.find((variety) => normalize(variety.name) === key) || null;
}

function offerItemName(item = {}) {
  return clean(item.varietyName || findById("varieties", item.varietyId)?.name || item.name || "Odřezek");
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

function matchOffer(offer) {
  const isClosed = offer.status === "uzavřená";
  if (state.filter === "active" && isClosed) return false;
  if (state.filter === "closed" && !isClosed) return false;
  const items = Array.isArray(offer.items) ? offer.items : [];
  return matches([offer.title, offer.note, offer.status, ...items.map((item) => item.varietyName)]);
}

function matchOrder(order) {
  if (state.filter === "todo" && order.paymentStatus === "zaplaceno" && ["odesláno", "zaplaceno"].includes(order.shippingStatus)) return false;
  if (state.filter === "done" && !(order.paymentStatus === "zaplaceno" && ["odesláno", "zaplaceno"].includes(order.shippingStatus))) return false;
  return matches([customerName(findCustomer(order.customerId)), order.varietiesText, order.note, order.orderDate]);
}

function matchCustomer(customer) {
  if (state.filter === "cz" && normalize(customer.country) !== "cesko") return false;
  if (state.filter === "foreign" && normalize(customer.country) === "cesko") return false;
  return matches([customerName(customer), customer.email, customer.phone, customer.country, customer.note]);
}

function matchVariety(variety) {
  if (state.filter === "active" && variety.active === false) return false;
  if (state.filter === "photo" && !varietyImages(variety).length) return false;
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
  return text.length > 42 ? `${text.slice(0, 39).trim()}…` : text;
}

function orderVarietyNames(order = {}) {
  return clean(order.varietiesText).split(/\n+/).map((line) => line.replace(/\s+\d+\s*(ks|x).*/i, "").replace(/\s+-\s+\d+.*/, "").trim()).filter(Boolean);
}

function paymentPill(order) {
  return order.paymentStatus === "zaplaceno" ? "✅ Zaplaceno" : "⏳ Čeká";
}

function statusPill(order) {
  return { "nová": "Nová", "připraveno": "Připravená", "odesláno": "🚚 Odeslaná", zaplaceno: "Hotovo" }[order.shippingStatus] || "Nová";
}

function crossLineage(cross) {
  return `${findById("varieties", cross.motherVarietyId)?.name || "Matka"} × ${findById("varieties", cross.pollenVarietyId)?.name || "Pyl"}`;
}

function varietyImages(variety = {}) {
  return unique([variety?.photoUrl, ...normalizeGallery(variety?.gallery)].map(clean).filter(Boolean));
}

function crossSeedlingImages(cross = {}) {
  return unique([cross?.seedlingPhotoUrl, ...normalizeGallery(cross?.seedlingGallery)].map(clean).filter(Boolean));
}

function varietyUsageCount(name) {
  const key = normalize(name);
  return state.data.orders.filter((order) => normalize(order.varietiesText).includes(key)).length;
}

function orderTotalFromText(text) {
  return clean(text).split(/\n+/).reduce((sum, line) => {
    const match = line.match(/(\d+(?:[,.]\d+)?)\s*Kč/i);
    return sum + (match ? number(match[1]) : 0);
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

async function resolvePhotos(root) {
  const images = [...root.querySelectorAll("[data-photo-ref]")];
  await Promise.all(images.map(async (image) => {
    const originalRef = clean(image.dataset.photoRef);
    const fullRef = clean(image.dataset.photoFullRef);
    const fallbackAllowed = image.dataset.photoAllowFallback === "1";
    const ref = fullRef ? originalRef : thumbPreviewRef(originalRef);
    if (ref !== originalRef && !image.dataset.photoFullRef) image.dataset.photoFullRef = originalRef;
    image.onerror = async () => {
      if (!fallbackAllowed || !image.dataset.photoFullRef || image.dataset.photoFallbackLoaded === "1") return;
      image.dataset.photoFallbackLoaded = "1";
      const fallbackUrl = await resolvePhotoUrl(image.dataset.photoFullRef);
      if (!fallbackUrl) return;
      image.src = fallbackUrl;
      clearPhotoMissing(image);
    };
    let url = await resolvePhotoUrl(ref);
    if (!url && fallbackAllowed && image.dataset.photoFullRef) url = await resolvePhotoUrl(image.dataset.photoFullRef);
    if (url) {
      image.src = url;
      clearPhotoMissing(image);
    } else markPhotoMissing(image);
  }));
}

function markPhotoMissing(image) {
  if (!image) return;
  image.classList.add("photo-missing");
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
}

async function resolvePhotoUrl(ref) {
  const value = clean(ref);
  if (!value) return "";
  if (value.startsWith("data:image/") || value.startsWith("blob:") || value.startsWith("http")) return value;
  if (state.photoUrls.has(value)) return state.photoUrls.get(value);
  if (value.startsWith(INDEXED_PHOTO_PREFIX)) {
    const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, value.slice(INDEXED_PHOTO_PREFIX.length));
    if (!record?.blob) return "";
    const url = URL.createObjectURL(record.blob);
    state.photoUrls.set(value, url);
    return url;
  }
  if (value.startsWith(SUPABASE_PHOTO_PREFIX)) {
    const cached = await getCachedSupabasePhotoBlob(value);
    if (cached) {
      const cachedUrl = URL.createObjectURL(cached);
      state.photoUrls.set(value, cachedUrl);
      return cachedUrl;
    }
    const url = await fetchSupabasePhotoObjectUrl(parseSupabasePhotoRef(value), value) || await createSignedPhotoUrl(parseSupabasePhotoRef(value));
    state.photoUrls.set(value, url);
    return url;
  }
  return "";
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

async function getCachedSupabasePhotoBlob(ref) {
  const key = supabasePhotoCacheKey(ref);
  if (!key) return null;
  try {
    const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, key);
    return record?.blob || null;
  } catch {
    return null;
  }
}

async function cacheSupabasePhotoBlob(ref, blob, path = "") {
  const key = supabasePhotoCacheKey(ref);
  if (!key || !blob) return;
  await idbPut(await openPhotoDb(), PHOTO_BLOB_STORE, {
    id: key,
    blob,
    name: clean(path).split("/").pop() || "fotka.jpg",
    type: blob.type || "image/jpeg",
    cachedAt: new Date().toISOString(),
  });
}

function supabasePhotoCacheKey(ref) {
  const value = clean(ref);
  return value && value.startsWith(SUPABASE_PHOTO_PREFIX) ? `supabase-cache:${value}` : "";
}

async function photoToFile(ref, ownerName = "fotka") {
  const value = clean(ref);
  if (!value) return null;
  if (value.startsWith(INDEXED_PHOTO_PREFIX)) {
    const record = await idbGet(await openPhotoDb(), PHOTO_BLOB_STORE, value.slice(INDEXED_PHOTO_PREFIX.length));
    return record?.blob ? new File([record.blob], record.name || `${safeFileName(ownerName)}.jpg`, { type: record.type || record.blob.type || "image/jpeg" }) : null;
  }
  if (value.startsWith("data:image/")) return dataUrlToFile(value, `${safeFileName(ownerName)}.jpg`);
  if (value.startsWith(SUPABASE_PHOTO_PREFIX)) return null;
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
      || clean(parsed.lastPushedAt) !== normalized.lastPushedAt;
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
  if (!email || !password) return toast("Doplň email a heslo.");
  try {
    updateSyncIndicator("working");
    const result = await authRequest("/auth/v1/token?grant_type=password", { email, password });
    saveSyncSession(result);
    const verified = await pullSync({ silent: true, verify: true });
    if (verified === false) {
      if (hasLocalData() && window.confirm("Cloud nejde přečíst tímto šifrovacím heslem. Pokud jsou data v mobilu správná, přepsat cloud daty z mobilu?")) {
        state.syncVerifiedPassword = state.syncPassword;
        const repaired = await pushSync({ silent: true, force: true });
        if (repaired) {
          toast("Cloud opravený z mobilu.");
          state.view = "offers";
          render();
          return;
        }
      }
      toast("Přihlášeno, ale cloud nejde dešifrovat.");
      render();
      return;
    }
    toast("Přihlášeno.");
    state.view = "offers";
    render();
    maybeAutoPull();
  } catch (error) {
    console.error(error);
    updateSyncIndicator("error");
    toast(`Přihlášení selhalo: ${friendlySyncError(error)}`);
  }
}

function logoutSync() {
  localStorage.removeItem(SUPABASE_SYNC_SESSION_KEY);
  state.photoUrls.clear();
  state.view = "sync";
  toast("Odhlášeno.");
  render();
}

async function pushSync(options = {}) {
  saveSyncConfigFromInputs();
  if (!state.syncPassword) return toast("Doplň šifrovací heslo.");
  if (state.syncRunning) return;
  state.syncRunning = true;
  try {
    updateSyncIndicator("working");
    const session = await ensureSession();
    if (!options.force && state.syncVerifiedPassword !== state.syncPassword) {
      const verified = await verifySyncPassword(state.syncPassword, session);
      if (verified !== true) {
        updateSyncIndicator("error");
        if (!options.silent) toast(verified === false ? "Šifrovací heslo nesedí." : "Cloud nejde ověřit.");
        return false;
      }
      state.syncVerifiedPassword = state.syncPassword;
    }
    const data = await buildSyncData(session.user?.id || "user");
    const encrypted = await encryptPayload(data, state.syncPassword);
    const updatedAt = new Date().toISOString();
    await supabaseRequest("/rest/v1/app_sync?on_conflict=user_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: { user_id: session.user?.id, encrypted_data: encrypted, updated_at: updatedAt } });
    state.syncVerifiedPassword = state.syncPassword;
    cleanupStorage(session.user?.id || "user", collectPhotoPaths(data)).catch((error) => console.warn("Storage cleanup skipped", error));
    saveSyncConfig({ lastPushedAt: updatedAt });
    state.syncDirty = false;
    updateSyncIndicator();
    if (!options.silent) toast("Odesláno do cloudu.");
    return true;
  } catch (error) {
    console.error(error);
    updateSyncIndicator("error");
    if (!options.silent) toast(`Odeslání selhalo: ${friendlySyncError(error)}`);
    return false;
  } finally {
    state.syncRunning = false;
  }
}

async function pullSync(options = {}) {
  saveSyncConfigFromInputs();
  if (!state.syncPassword) return toast("Doplň šifrovací heslo.");
  try {
    updateSyncIndicator("working");
    const session = await ensureSession();
    const rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=encrypted_data,updated_at`, { method: "GET" });
    if (!rows?.[0]?.encrypted_data) return toast("V cloudu zatím nejsou data.");
    if (options.auto && !options.verify && state.syncVerifiedPassword === state.syncPassword && clean(rows[0].updated_at) === loadSyncConfig().lastPulledAt) {
      updateSyncIndicator();
      return true;
    }
    state.data = normalizeLoadedData(await decryptPayload(rows[0].encrypted_data, state.syncPassword));
    syncFinishedCrossVarieties();
    state.syncVerifiedPassword = state.syncPassword;
    saveData({ skipAutoSync: true });
    saveSyncConfig({ lastPulledAt: clean(rows[0].updated_at) });
    render();
    updateSyncIndicator();
    if (!options.silent) toast("Staženo z cloudu.");
    return true;
  } catch (error) {
    console.error(error);
    state.syncVerifiedPassword = "";
    updateSyncIndicator("error");
    if (!options.silent) toast(`Stažení selhalo: ${isSyncDecryptError(error) ? "cloud je zašifrovaný jiným heslem" : friendlySyncError(error)}`);
    return false;
  }
}

function hasLocalData() {
  return Boolean((state.data.customers || []).length || (state.data.orders || []).length || (state.data.varieties || []).length || (state.data.offers || []).length || (state.data.crosses || []).length);
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
  toast(next ? "Automatický sync zapnutý." : "Automatický sync vypnutý.");
  render();
  if (next) maybeAutoPull();
}

function updateSyncIndicator(status = "") {
  if (!els.syncIndicator) return;
  const config = loadSyncConfig();
  const session = loadSyncSession();
  const last = config.lastPulledAt || config.lastPushedAt;
  const time = last ? formatTime(last) : formatTime(new Date());
  let text = session.accessToken && config.autoSync ? `Syncnuto ${time}` : "Sync vypnutý";
  let stateClass = session.accessToken && config.autoSync ? "ok" : "off";
  if (status === "working") {
    text = "Syncuji...";
    stateClass = "working";
  } else if (status === "error") {
    text = "Sync chyba";
    stateClass = "error";
  }
  els.syncIndicator.textContent = text;
  els.syncIndicator.dataset.status = stateClass;
}

function scheduleAutoSync() {
  if (!loadSyncConfig().autoSync) return;
  state.syncDirty = true;
  clearTimeout(state.syncTimer);
  state.syncTimer = setTimeout(() => pushSync({ silent: true }), 5000);
}

async function maybeAutoPull() {
  const config = loadSyncConfig();
  if (!config.autoSync || !state.syncPassword || state.syncRunning || state.syncDirty) return;
  await pullSync({ silent: true });
}

async function buildSyncData(userId) {
  const data = JSON.parse(JSON.stringify(state.data));
  for (const variety of data.varieties || []) {
    const refs = await uploadPhotoList(userId, variety.name, varietyImages(variety));
    variety.photoUrl = refs[0] || "";
    variety.gallery = refs.slice(1);
  }
  for (const cross of data.crosses || []) {
    const refs = await uploadPhotoList(userId, cross.seedlingName || "semenac", crossSeedlingImages(cross));
    cross.seedlingPhotoUrl = refs[0] || "";
    cross.seedlingGallery = refs.slice(1);
  }
  return data;
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
  for (let index = 0; index < paths.length; index += 100) {
    await supabaseRequest(`/storage/v1/object/${SUPABASE_SYNC_BUCKET}`, { method: "DELETE", body: { prefixes: paths.slice(index, index + 100) } });
  }
}

async function uploadPhotoList(userId, ownerName, refs) {
  const uploaded = [];
  for (const ref of unique(refs)) {
    if (ref.startsWith(SUPABASE_PHOTO_PREFIX)) uploaded.push(ref);
    else {
      const file = await photoToFile(ref, ownerName);
      if (!file) continue;
      const uploadFile = await preparePhotoFileForStorage(file);
      const path = `${encodeURIComponent(userId)}/${safeFileName(ownerName)}/${await fileHash(uploadFile)}${photoExtension(uploadFile)}`;
      await uploadStorage(path, uploadFile);
      const thumb = await createPhotoThumbnail(uploadFile);
      if (thumb) await uploadStorage(supabaseThumbnailPath(path), thumb);
      uploaded.push(`${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(path)}`);
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
  if (!config.url || !config.anonKey) throw new Error("Chybí Supabase nastavení.");
  const response = await fetch(`${config.url.replace(/\/+$/, "")}${path}`, { method: "POST", headers: { apikey: config.anonKey, "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
  return response.json();
}

async function ensureSession() {
  const session = loadSyncSession();
  if (session.accessToken && session.expiresAt > Date.now() && session.user?.id) return session;
  if (!session.refreshToken) throw new Error("Chybí přihlášení.");
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
  if (!raw) return "neznámá chyba";
  try {
    const parsed = JSON.parse(raw);
    const message = clean(parsed.message || parsed.msg || parsed.error_description || parsed.error);
    if (message) return message;
  } catch {
    // Supabase někdy vrací čistý text, někdy JSON.
  }
  if (/invalid login credentials/i.test(raw)) return "nesedí email nebo heslo";
  if (/row-level security|violates row-level security/i.test(raw)) return "RLS nepovolilo zápis pro tohoto uživatele";
  if (/bucket.*not.*found|not found/i.test(raw)) return "nenašel se bucket na fotky";
  if (/jwt|token|unauthorized|401/i.test(raw)) return "přihlášení vypršelo nebo nesedí klíč projektu";
  if (/permission|403/i.test(raw)) return "chybí oprávnění v Supabase";
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
  return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: currency === "CZK" ? 0 : 2 }).format(amount)} ${currency === "EUR" ? "EUR" : "Kč"}`;
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
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

function escapeHtml(value) {
  return clean(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function safeFileName(value, fallback = "fotka") {
  return normalize(value || fallback).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

function initials(value) {
  return clean(value).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "🌱";
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
