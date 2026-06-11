const STORE_KEY = "africke-koprivy-data-v11";
const LEGACY_STORE_KEYS = ["africke-koprivy-data-v10", "africke-koprivy-data-v9", "africke-koprivy-data-v8", "africke-koprivy-data-v7", "africke-koprivy-data-v6", "africke-koprivy-data-v5", "africke-koprivy-data-v4"];
const PHOTO_DB_NAME = "africke-koprivy-photo-handles";
const PHOTO_DB_VERSION = 2;
const PHOTO_DB_STORE = "handles";
const PHOTO_BLOB_STORE = "photos";
const PHOTO_HANDLE_KEY = "photo-root";
const PHOTO_VARIETIES_DIR = "odrudy";
const LOCAL_PHOTO_PREFIX = "local-photo:";
const INDEXED_PHOTO_PREFIX = "indexed-photo:";
const SUPABASE_PHOTO_PREFIX = "supabase-photo:";
const SUPABASE_THUMB_DIR = "_nahledy_v2";
const SUPABASE_THUMB_MAX_SIZE = 520;
const SUPABASE_THUMB_QUALITY = 0.82;
const SUPABASE_SYNC_PULL_INTERVAL_MS = 2 * 60 * 1000;
const SUPABASE_SYNC_PULL_MIN_GAP_MS = 30 * 1000;
const SUPABASE_PHOTO_LAZY_MARGIN_PX = 600;
const SUPABASE_PHOTO_OBSERVER_ROOT_MARGIN = "600px 0px";
const PHOTO_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const PHOTO_MAX_UPLOAD_EDGE = 3200;
const PHOTO_UPLOAD_QUALITY_STEPS = [0.9, 0.86, 0.82, 0.78, 0.74];
const FACEBOOK_ITEMS_TOKEN = "{{ODREZKY}}";
const FACEBOOK_DATE_TOKEN = "{{DATUM}}";
const MOBILE_PHOTO_CATALOG_TYPE = "africke-koprivy-mobile-photo-catalog-v1";
const MOBILE_PHOTO_EXPORT_TYPE = "africke-koprivy-mobile-photo-export-v1";
const SUPABASE_SYNC_CONFIG_KEY = `${STORE_KEY}:supabase-sync-config`;
const SUPABASE_SYNC_SESSION_KEY = `${STORE_KEY}:supabase-sync-session`;
const SUPABASE_SYNC_PASSWORD_KEY = `${STORE_KEY}:supabase-sync-password`;
const SUPABASE_SYNC_DIRTY_KEY = `${STORE_KEY}:supabase-sync-dirty-at`;
const SUPABASE_SYNC_LAST_LOCAL_SNAPSHOT_KEY = `${STORE_KEY}:supabase-sync-last-local-snapshot`;
const SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY = `${STORE_KEY}:supabase-sync-last-cloud-snapshot`;
const SUPABASE_SYNC_BUCKET = "africke-koprivy-fotky";
const DEFAULT_SUPABASE_URL = "https://gqlpdvdrlcsibmyttmwt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_40A8Vvi-vd3IPimbEZlDiQ_Uo_5Cp0n";
const LEGACY_MANAGED_SUPABASE_URLS = ["https://nexthiehxcksrnydepnv.supabase.co"];
const SEED_SIGNATURE = typeof window !== "undefined" ? String(window.AFRICKE_KOPRIVY_SEED_SIGNATURE || "").trim() : "";
const SEED_SIGNATURE_KEY = `${STORE_KEY}:seed-signature`;
const ORDER_PAYMENT_QR_SIZE = 240;
const ORDER_CUSTOMER_IMAGE_WIDTH = 1120;
const ORDER_CUSTOMER_IMAGE_QR_SIZE = 320;
const BRAND_LOGO_IMAGE_DATA_URI = typeof window !== "undefined"
  ? clean(window.AFRICKE_KOPRIVY_BRAND_LOGO_DATA_URI || "")
  : "";
const CUSTOMER_IMAGE_BRAND_LOGO = typeof Image === "undefined"
  ? null
  : (() => {
      if (!BRAND_LOGO_IMAGE_DATA_URI) return null;
      const image = new Image();
      image.src = BRAND_LOGO_IMAGE_DATA_URI;
      return image;
    })();

const photoRuntime = {
  rootHandle: null,
  objectUrls: new Map(),
  indexedObjectUrls: new Map(),
  indexedPreviewUrls: new Map(),
  supabaseSignedUrls: new Map(),
  supabaseObserver: null,
  deferredSupabaseLoads: new WeakMap(),
};

const paymentLabels = {
  čeká: "Čeká",
  zaplaceno: "Zaplaceno",
  nezaplaceno: "Neplatí",
};

const shippingLabels = {
  nová: "Nová",
  připraveno: "Připravená",
  odesláno: "Odeslaná",
  zaplaceno: "Vyřízená",
};

const orderShippingSteps = ["nová", "připraveno", "odesláno", "zaplaceno"];

const deliveryLabels = {
  ship: "Odeslat",
  personal_pickup: "Osobní odběr",
};

const crossStageLabels = {
  opyleno: "Opyleno",
  vyseto: "Vyseto",
  roste: "Roste",
  hotovo: "Hotovo",
};

const crossStageIcons = {
  opyleno: "✦",
  vyseto: "🌱",
  roste: "🌿",
  hotovo: "✓",
};

const crossResultLabels = {
  krasna: "Krásná",
  hnusna: "Hnusná",
  nejista: "Nejistá",
};

const crossStages = ["opyleno", "vyseto", "roste", "hotovo"];

const crossStageAliases = {
  opyleno: "opyleno",
  opylení: "opyleno",
  opyleni: "opyleno",
  vyseto: "vyseto",
  výsev: "vyseto",
  vysev: "vyseto",
  roste: "roste",
  semenáč: "roste",
  semenac: "roste",
  hotovo: "hotovo",
  hotová: "hotovo",
  hotova: "hotovo",
};

const reservationStatusLabels = {
  confirmed: "Potvrzeno",
  alternate: "Náhradník",
};

const currencyLabels = {
  CZK: "Kč",
  EUR: "EUR",
};

const defaultCountries = ["Česko", "Slovensko", "Polsko", "Rakousko", "Německo", "Maďarsko", "Rumunsko", "Ukrajina", "Itálie", "Francie", "Španělsko", "Nizozemsko", "Belgie", "Chorvatsko"];
const priorityCountries = ["Česko", "Slovensko", "Polsko", "Rakousko", "Německo"];

const mappingTargets = [
  ["ignore", "Nevkládat"],
  ["fullName", "Celé jméno"],
  ["fbName", "FB jméno"],
  ["firstName", "Jméno"],
  ["lastName", "Příjmení"],
  ["phone", "Telefon"],
  ["email", "Email"],
  ["street", "Ulice"],
  ["postalCode", "PSČ"],
  ["city", "Město"],
  ["address", "Adresa celá"],
  ["country", "Země"],
  ["varieties", "Odrůdy"],
  ["price", "Cena"],
  ["paymentStatus", "Platba"],
  ["shippingStatus", "Stav"],
  ["deliveryMethod", "Doprava"],
  ["customerNote", "Poznámka zákazníka"],
  ["orderNote", "Poznámka objednávky"],
  ["tags", "Štítky"],
];

const state = {
  view: "offers",
  selectedCustomerId: null,
  selectedOfferId: null,
  selectedCrossId: null,
  customerSearch: "",
  orderSearch: "",
  varietySearch: "",
  offerSearch: "",
  crossSearch: "",
  countryFilter: "",
  tagFilter: "",
  paymentFilter: "",
  shippingFilter: "",
  deliveryFilter: "",
  orderVarietyFilter: "",
  seasonFilter: "",
  crossStageFilter: "",
  crossResultFilter: "",
  dashboardProfitYear: "",
  customerQuickFilter: "",
  orderQuickFilter: "",
  varietyUsageFilter: "",
  varietySort: "name",
  selectedOrderIds: new Set(),
  orderDialogDirty: false,
  orderDialogInitializing: false,
  orderDialogBaseline: "",
  orderPaymentQrVisible: false,
  orderPaymentQrRequestId: 0,
  orderPaymentPreviewRequestId: 0,
  orderPaymentCountryOverride: "",
  orderPaymentQrState: null,
  orderCountryPromptPromise: null,
  orderCountryPromptResolve: null,
  facebookDraftTextByOffer: new Map(),
  orderSuggestionIndex: -1,
  commandPaletteIndex: 0,
  commandPaletteQuery: "",
  commandPaletteItems: [],
  commandPaletteVisibleItems: [],
  importRows: [],
  importMappings: [],
  rateLoading: false,
  visibleOrderIds: [],
  visibleOrders: [],
  supabaseSyncTimer: null,
  supabaseSyncDirty: false,
  supabaseSyncRunning: false,
  supabasePullRunning: false,
  lastSupabaseAutoPullAt: 0,
  supabaseSyncMuted: false,
  syncEncryptionPassword: clean(localStorage.getItem(SUPABASE_SYNC_PASSWORD_KEY)),
  syncEncryptionVerifiedPassword: "",
  installPromptEvent: null,
  data: loadData(),
};

const derivedCache = {
  customersById: null,
  ordersById: null,
  varietiesById: null,
  offersById: null,
  crossesById: null,
  latestOrderByCustomerId: null,
  varietyUsageByName: null,
};

const els = {
  todayLine: document.querySelector("#todayLine"),
  studioHeadline: document.querySelector("#studioHeadline"),
  studioSubline: document.querySelector("#studioSubline"),
  studioMiniStats: document.querySelector("#studioMiniStats"),
  metrics: document.querySelector("#metrics"),
  dashboardSpotlight: document.querySelector("#dashboardSpotlight"),
  dashboardLaunchpad: document.querySelector("#dashboardLaunchpad"),
  dashboardBoards: document.querySelector("#dashboardBoards"),
  attentionList: document.querySelector("#attentionList"),
  profitYearFilter: document.querySelector("#profitYearFilter"),
  profitChartSummary: document.querySelector("#profitChartSummary"),
  profitChart: document.querySelector("#profitChart"),
  recentCustomers: document.querySelector("#recentCustomers"),
  paymentOverview: document.querySelector("#paymentOverview"),
  customersScene: document.querySelector("#customersScene"),
  ordersScene: document.querySelector("#ordersScene"),
  varietiesScene: document.querySelector("#varietiesScene"),
  crossesScene: document.querySelector("#crossesScene"),
  offersScene: document.querySelector("#offersScene"),
  settingsScene: document.querySelector("#settingsScene"),
  defaultShippingFeeCz: document.querySelector("#defaultShippingFeeCz"),
  defaultShippingFeeSk: document.querySelector("#defaultShippingFeeSk"),
  defaultPostalFee: document.querySelector("#defaultPostalFee"),
  defaultShippingFeeAddressCz: document.querySelector("#defaultShippingFeeAddressCz"),
  defaultShippingFeeAddressSk: document.querySelector("#defaultShippingFeeAddressSk"),
  defaultPackingFee: document.querySelector("#defaultPackingFee"),
  defaultCodFeeCz: document.querySelector("#defaultCodFeeCz"),
  defaultCodFeeSk: document.querySelector("#defaultCodFeeSk"),
  defaultFeeCurrency: document.querySelector("#defaultFeeCurrency"),
  savePaymentSettingsBtn: document.querySelector("#savePaymentSettingsBtn"),
  savePaymentSettingsBottomBtn: document.querySelector("#savePaymentSettingsBottomBtn"),
  paymentAccountName: document.querySelector("#paymentAccountName"),
  paymentAccountNumber: document.querySelector("#paymentAccountNumber"),
  paymentIban: document.querySelector("#paymentIban"),
  paymentSwift: document.querySelector("#paymentSwift"),
  feeSettingsHint: document.querySelector("#feeSettingsHint"),
  feeExtrasSettings: document.querySelector("#feeExtrasSettings"),
  addExtraFeeSettingBtn: document.querySelector("#addExtraFeeSettingBtn"),
  customersTable: document.querySelector("#customersTable"),
  customerDetail: document.querySelector("#customerDetail"),
  ordersTable: document.querySelector("#ordersTable"),
  varietiesTable: document.querySelector("#varietiesTable"),
  crossesTable: document.querySelector("#crossesTable"),
  crossDetail: document.querySelector("#crossDetail"),
  offersTable: document.querySelector("#offersTable"),
  offerDetail: document.querySelector("#offerDetail"),
  countryFilter: document.querySelector("#countryFilter"),
  tagFilter: document.querySelector("#tagFilter"),
  customerSearch: document.querySelector("#customerSearch"),
  orderSearch: document.querySelector("#orderSearch"),
  varietySearch: document.querySelector("#varietySearch"),
  offerSearch: document.querySelector("#offerSearch"),
  crossSearch: document.querySelector("#crossSearch"),
  paymentFilter: document.querySelector("#paymentFilter"),
  shippingFilter: document.querySelector("#shippingFilter"),
  deliveryFilter: document.querySelector("#deliveryFilter"),
  orderVarietyFilter: document.querySelector("#orderVarietyFilter"),
  seasonFilter: document.querySelector("#seasonFilter"),
  crossStageFilter: document.querySelector("#crossStageFilter"),
  crossResultFilter: document.querySelector("#crossResultFilter"),
  orderQuickFilters: document.querySelector("#orderQuickFilters"),
  selectVisibleOrders: document.querySelector("#selectVisibleOrders"),
  bulkOrderSummary: document.querySelector("#bulkOrderSummary"),
  bulkPaidBtn: document.querySelector("#bulkPaidBtn"),
  bulkSentBtn: document.querySelector("#bulkSentBtn"),
  varietyUsageFilter: document.querySelector("#varietyUsageFilter"),
  varietySort: document.querySelector("#varietySort"),
  customerDialog: document.querySelector("#customerDialog"),
  customerForm: document.querySelector("#customerForm"),
  customerDialogTitle: document.querySelector("#customerDialogTitle"),
  orderDialog: document.querySelector("#orderDialog"),
  orderForm: document.querySelector("#orderForm"),
  orderDialogTitle: document.querySelector("#orderDialogTitle"),
  orderAlternateBlock: document.querySelector("#orderAlternateBlock"),
  orderStornoBlock: document.querySelector("#orderStornoBlock"),
  orderAdvancedDetails: document.querySelector("#orderAdvancedDetails"),
  currencyRateHint: document.querySelector("#currencyRateHint"),
  loadOrderRateBtn: document.querySelector("#loadOrderRateBtn"),
  orderPricePreview: document.querySelector("#orderPricePreview"),
  orderFeePreview: document.querySelector("#orderFeePreview"),
  orderTotalHighlight: document.querySelector("#orderTotalHighlight"),
  orderForeignTotalHint: document.querySelector("#orderForeignTotalHint"),
  orderAdvancedSummary: document.querySelector("#orderAdvancedSummary"),
  copyCustomerOrderTextBtn: document.querySelector("#copyCustomerOrderTextBtn"),
  toggleOrderPaymentTextSentBtn: document.querySelector("#toggleOrderPaymentTextSentBtn"),
  downloadCustomerOrderImageBtn: document.querySelector("#downloadCustomerOrderImageBtn"),
  toggleOrderPaymentQrBtn: document.querySelector("#toggleOrderPaymentQrBtn"),
  orderPaymentQrPanel: document.querySelector("#orderPaymentQrPanel"),
  orderPaymentQrCanvas: document.querySelector("#orderPaymentQrCanvas"),
  orderPaymentQrText: document.querySelector("#orderPaymentQrText"),
  downloadOrderPaymentQrBtn: document.querySelector("#downloadOrderPaymentQrBtn"),
  orderCountryPromptDialog: document.querySelector("#orderCountryPromptDialog"),
  orderCountryPromptCzBtn: document.querySelector("#orderCountryPromptCzBtn"),
  orderCountryPromptForeignBtn: document.querySelector("#orderCountryPromptForeignBtn"),
  closeOrderCountryPromptBtn: document.querySelector("#closeOrderCountryPromptBtn"),
  orderPaymentToggle: document.querySelector(".order-payment-toggle"),
  orderStatusToggle: document.querySelector(".order-status-toggle"),
  orderDeliveryToggle: document.querySelector(".order-delivery-toggle"),
  orderVarietyPicker: document.querySelector("#orderVarietyPicker"),
  orderVarietyQuantity: document.querySelector("#orderVarietyQuantity"),
  orderVarietyCatalogPrice: document.querySelector("#orderVarietyCatalogPrice"),
  orderVarietyManualPrice: document.querySelector("#orderVarietyManualPrice"),
  orderVarietySuggestions: document.querySelector("#orderVarietySuggestions"),
  orderLineSummary: document.querySelector("#orderLineSummary"),
  addOrderVarietyBtn: document.querySelector("#addOrderVarietyBtn"),
  addFeesToOrderBtn: document.querySelector("#addFeesToOrderBtn"),
  orderExtraFeeFields: document.querySelector("#orderExtraFeeFields"),
  varietyDialog: document.querySelector("#varietyDialog"),
  varietyForm: document.querySelector("#varietyForm"),
  varietyDialogTitle: document.querySelector("#varietyDialogTitle"),
  crossDialog: document.querySelector("#crossDialog"),
  crossForm: document.querySelector("#crossForm"),
  crossDialogTitle: document.querySelector("#crossDialogTitle"),
  crossPreview: document.querySelector("#crossPreview"),
  crossSeedlingPhotoPicker: document.querySelector("#crossSeedlingPhotoPicker"),
  offerDialog: document.querySelector("#offerDialog"),
  offerForm: document.querySelector("#offerForm"),
  offerDialogTitle: document.querySelector("#offerDialogTitle"),
  offerItemDialog: document.querySelector("#offerItemDialog"),
  offerItemForm: document.querySelector("#offerItemForm"),
  offerItemDialogTitle: document.querySelector("#offerItemDialogTitle"),
  offerItemVarietyHelper: document.querySelector("#offerItemVarietyHelper"),
  offerItemVarietyHint: document.querySelector("#offerItemVarietyHint"),
  offerItemCreateVarietyWrap: document.querySelector("#offerItemCreateVarietyWrap"),
  offerItemVarietyPicker: document.querySelector("#offerItemVarietyPicker"),
  facebookOfferDialog: document.querySelector("#facebookOfferDialog"),
  facebookOfferForm: document.querySelector("#facebookOfferForm"),
  facebookOfferDialogTitle: document.querySelector("#facebookOfferDialogTitle"),
  facebookOfferPhotoStatus: document.querySelector("#facebookOfferPhotoStatus"),
  saveFacebookOfferTextBtn: document.querySelector("#saveFacebookOfferTextBtn"),
  copyFacebookOfferTextBtn: document.querySelector("#copyFacebookOfferTextBtn"),
  downloadFacebookOfferZipBtn: document.querySelector("#downloadFacebookOfferZipBtn"),
  reservationDialog: document.querySelector("#reservationDialog"),
  reservationForm: document.querySelector("#reservationForm"),
  reservationDialogTitle: document.querySelector("#reservationDialogTitle"),
  newReservationCustomerBtn: document.querySelector("#newReservationCustomerBtn"),
  reservationNewCustomerFields: document.querySelector("#reservationNewCustomerFields"),
  galleryDialog: document.querySelector("#galleryDialog"),
  galleryTitle: document.querySelector("#galleryTitle"),
  galleryContent: document.querySelector("#galleryContent"),
  mainPhotoPicker: document.querySelector("#mainPhotoPicker"),
  choosePhotoFolderBtn: document.querySelector("#choosePhotoFolderBtn"),
  photoFolderStatus: document.querySelector("#photoFolderStatus"),
  syncSupabaseUrl: document.querySelector("#syncSupabaseUrl"),
  syncSupabaseAnonKey: document.querySelector("#syncSupabaseAnonKey"),
  syncEmail: document.querySelector("#syncEmail"),
  syncPassword: document.querySelector("#syncPassword"),
  syncEncryptionKey: document.querySelector("#syncEncryptionKey"),
  syncAutoEnabled: document.querySelector("#syncAutoEnabled"),
  syncStatus: document.querySelector("#syncStatus"),
  syncFloat: document.querySelector("#syncFloat"),
  importText: document.querySelector("#importText"),
  csvFile: document.querySelector("#csvFile"),
  importSummary: document.querySelector("#importSummary"),
  mappingArea: document.querySelector("#mappingArea"),
  importBtn: document.querySelector("#importBtn"),
  commandPaletteDialog: document.querySelector("#commandPaletteDialog"),
  commandPaletteInput: document.querySelector("#commandPaletteInput"),
  commandPaletteList: document.querySelector("#commandPaletteList"),
  commandPaletteBtn: document.querySelector("#commandPaletteBtn"),
  commandPaletteTopBtn: document.querySelector("#commandPaletteTopBtn"),
  installAppBtn: document.querySelector("#installAppBtn"),
  dockCommandBtn: document.querySelector("#dockCommandBtn"),
  dockOrderBtn: document.querySelector("#dockOrderBtn"),
  dockCustomerBtn: document.querySelector("#dockCustomerBtn"),
  dockVarietyBtn: document.querySelector("#dockVarietyBtn"),
  dockCrossBtn: document.querySelector("#dockCrossBtn"),
  dockOfferBtn: document.querySelector("#dockOfferBtn"),
  toast: document.querySelector("#toast"),
  countryList: document.querySelector("#countryList"),
  varietyList: document.querySelector("#varietyList"),
  seasonList: document.querySelector("#seasonList"),
};

init();

function init() {
  migrateSupabaseSyncClientConfig();
  els.todayLine.textContent = new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "full",
  }).format(new Date());
  if (syncFinishedCrossVarieties()) saveData({ skipAutoSync: true });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openMainView(button.dataset.view));
  });

  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => openMainView(button.dataset.viewJump));
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeParentDialog(button));
  });

  document.querySelector("#addCustomerBtn").addEventListener("click", () => openCustomerDialog());
  document.querySelector("#addVarietyTopBtn").addEventListener("click", () => openVarietyDialog());
  document.querySelector("#addCrossTopBtn")?.addEventListener("click", () => openCrossDialog());
  document.querySelector("#addOfferTopBtn").addEventListener("click", () => openOfferDialog());
  document.querySelector("#addRestOfferTopBtn")?.addEventListener("click", () => openOfferDialog(null, { type: "rests" }));
  document.querySelector("#addOrderTopBtn").addEventListener("click", () => openOrderDialog());
  document.querySelector("#addOrderBtn")?.addEventListener("click", () => openOrderDialog());
  document.querySelector("#addCrossBtn")?.addEventListener("click", () => openCrossDialog());
  document.querySelector("#addOfferBtn").addEventListener("click", () => openOfferDialog());
  document.querySelector("#addRestOfferBtn")?.addEventListener("click", () => openOfferDialog(null, { type: "rests" }));
  els.commandPaletteBtn?.addEventListener("click", () => openCommandPalette());
  els.commandPaletteTopBtn?.addEventListener("click", () => openCommandPalette());
  els.installAppBtn?.addEventListener("click", installPwaApp);
  els.dockCommandBtn?.addEventListener("click", () => openCommandPalette());
  els.dockOrderBtn?.addEventListener("click", () => openOrderDialog());
  els.dockCustomerBtn?.addEventListener("click", () => openCustomerDialog());
  els.dockVarietyBtn?.addEventListener("click", () => openVarietyDialog());
  els.dockCrossBtn?.addEventListener("click", () => openCrossDialog());
  els.dockOfferBtn?.addEventListener("click", () => openOfferDialog());
  els.orderQuickFilters?.querySelectorAll("[data-order-quick-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.orderQuickFilter = button.dataset.orderQuickFilter || "";
      renderOrders();
    });
  });
  els.commandPaletteInput?.addEventListener("input", (event) => {
    state.commandPaletteQuery = event.target.value;
    renderCommandPalette();
  });
  els.commandPaletteInput?.addEventListener("keydown", handleCommandPaletteKeydown);
  els.commandPaletteList?.addEventListener("click", handleCommandPaletteClick);
  els.commandPaletteDialog?.addEventListener("close", () => {
    state.commandPaletteQuery = "";
    state.commandPaletteIndex = 0;
    state.commandPaletteVisibleItems = [];
  });
  document.querySelector("#saveCustomerBtn").addEventListener("click", saveCustomerFromForm);
  document.querySelector("#saveOrderBtn").addEventListener("click", saveOrderFromForm);
  document.querySelector("#saveOfferBtn").addEventListener("click", saveOfferFromForm);
  document.querySelector("#saveOfferItemBtn").addEventListener("click", saveOfferItemFromForm);
  els.saveFacebookOfferTextBtn?.addEventListener("click", saveFacebookOfferTextFromDialog);
  els.copyFacebookOfferTextBtn?.addEventListener("click", copyFacebookOfferTextFromDialog);
  els.downloadFacebookOfferZipBtn?.addEventListener("click", () => downloadFacebookOfferZipFromDialog(els.downloadFacebookOfferZipBtn));
  els.offerForm?.querySelectorAll("[data-offer-status-option]").forEach((button) => {
    button.addEventListener("click", () => setOfferStatus(button.dataset.offerStatusOption));
  });
  els.offerItemForm.elements.varietyName.addEventListener("input", () => {
    const exact = findExactVarietyByName(els.offerItemForm.elements.varietyName.value);
    if (exact) applyOfferItemVarietyToForm(exact, { forcePrice: false });
    else els.offerItemForm.elements.varietyId.value = "";
    refreshOfferItemVarietyHelper(true);
    renderOfferItemVarietyPicker();
  });
  els.offerItemForm.elements.varietyName.addEventListener("focus", renderOfferItemVarietyPicker);
  els.offerItemForm.elements.varietyName.addEventListener("blur", () => refreshOfferItemVarietyHelper(true));
  els.offerItemVarietyPicker?.addEventListener("click", handleOfferItemVarietyPickerClick);
  els.offerItemForm.elements.price.addEventListener("input", () => {
    delete els.offerItemForm.elements.price.dataset.autoFilledFor;
  });
  document.querySelector("#saveReservationBtn").addEventListener("click", saveReservationFromForm);
  document.querySelector("#newReservationCustomerBtn").addEventListener("click", toggleReservationNewCustomer);
  document.addEventListener("click", handleCountryComboClick);
  document.addEventListener("click", handleOrderVarietyPickerClick);
  document.addEventListener("input", handleCountryComboInput);
  document.querySelector("#saveFeeSettingsBtn").addEventListener("click", saveFeeSettingsFromPanel);
  els.savePaymentSettingsBtn?.addEventListener("click", saveFeeSettingsFromPanel);
  els.savePaymentSettingsBottomBtn?.addEventListener("click", saveFeeSettingsFromPanel);
  els.addExtraFeeSettingBtn?.addEventListener("click", addFeeSettingExtraRow);
  els.feeExtrasSettings?.addEventListener("click", handleFeeSettingsExtrasClick);
  document.querySelector("#saveVarietyBtn").addEventListener("click", saveVarietyFromForm);
  document.querySelector("#saveCrossBtn")?.addEventListener("click", saveCrossFromForm);
  document.querySelector("#parseImportBtn")?.addEventListener("click", parseImportInput);
  document.querySelector("#clearImportBtn")?.addEventListener("click", clearImport);
  document.querySelector("#backupDataBtn").addEventListener("click", backupData);
  document.querySelector("#exportOrdersBtn").addEventListener("click", exportOrders);
  document.querySelector("#exportCustomersBtn").addEventListener("click", exportCustomers);
  document.querySelector("#exportVarietiesBtn").addEventListener("click", exportVarieties);
  document.querySelector("#exportMobilePhotoCatalogBtn")?.addEventListener("click", exportMobilePhotoCatalog);
  document.querySelector("#exportMobilePhotosBtn")?.addEventListener("click", exportMobilePhotos);
  document.querySelector("#importMobilePhotosBtn")?.addEventListener("click", () => document.querySelector("#mobilePhotoImportFile")?.click());
  document.querySelector("#mobilePhotoImportFile")?.addEventListener("change", importMobilePhotosFromFile);
  document.querySelector("#saveSyncConfigBtn")?.addEventListener("click", saveSupabaseSyncConfigFromPanel);
  document.querySelector("#syncSignUpBtn")?.addEventListener("click", signUpSupabaseSync);
  document.querySelector("#syncLoginBtn")?.addEventListener("click", loginSupabaseSync);
  document.querySelector("#syncLogoutBtn")?.addEventListener("click", logoutSupabaseSync);
  document.querySelector("#syncPushBtn")?.addEventListener("click", pushSupabaseSync);
  document.querySelector("#syncPullBtn")?.addEventListener("click", pullSupabaseSync);
  els.syncAutoEnabled?.addEventListener("change", () => {
    saveSupabaseSyncConfigFromPanel({ quiet: true });
    updateSupabaseSyncStatus();
    if (els.syncAutoEnabled.checked) {
      maybeAutoPullSupabaseSync();
      scheduleAutoSupabaseSync("auto-enabled");
    }
  });
  els.syncEncryptionKey?.addEventListener("input", () => {
    state.syncEncryptionPassword = clean(els.syncEncryptionKey.value);
    state.syncEncryptionVerifiedPassword = "";
    if (state.syncEncryptionPassword) localStorage.setItem(SUPABASE_SYNC_PASSWORD_KEY, state.syncEncryptionPassword);
    else localStorage.removeItem(SUPABASE_SYNC_PASSWORD_KEY);
    updateSupabaseSyncStatus();
    maybeAutoPullSupabaseSync();
  });
  els.choosePhotoFolderBtn?.addEventListener("click", choosePhotoFolder);
  els.importBtn?.addEventListener("click", importMappedRows);

  els.customerSearch.addEventListener("input", (event) => {
    state.customerQuickFilter = "";
    state.customerSearch = event.target.value;
    scheduleRender("customers", renderCustomers);
  });
  els.orderSearch.addEventListener("input", (event) => {
    state.orderQuickFilter = "";
    state.orderSearch = event.target.value;
    scheduleRender("orders", renderOrders);
  });
  els.varietySearch.addEventListener("input", (event) => {
    state.varietySearch = event.target.value;
    scheduleRender("varieties", renderVarieties);
  });
  els.offerSearch?.addEventListener("input", (event) => {
    state.offerSearch = event.target.value;
    scheduleRender("offers", renderOffers);
  });
  els.crossSearch?.addEventListener("input", (event) => {
    state.crossSearch = event.target.value;
    scheduleRender("crosses", renderCrosses);
  });
  els.countryFilter.addEventListener("change", (event) => {
    state.customerQuickFilter = "";
    state.countryFilter = event.target.value;
    renderCustomers();
  });
  els.tagFilter.addEventListener("change", (event) => {
    state.customerQuickFilter = "";
    state.tagFilter = event.target.value;
    renderCustomers();
  });
  els.paymentFilter.addEventListener("change", (event) => {
    state.orderQuickFilter = "";
    state.paymentFilter = event.target.value;
    renderOrders();
  });
  els.shippingFilter.addEventListener("change", (event) => {
    state.orderQuickFilter = "";
    state.shippingFilter = event.target.value;
    renderOrders();
  });
  els.deliveryFilter.addEventListener("change", (event) => {
    state.orderQuickFilter = "";
    state.deliveryFilter = event.target.value;
    renderOrders();
  });
  els.orderVarietyFilter.addEventListener("change", (event) => {
    state.orderQuickFilter = "";
    state.orderVarietyFilter = event.target.value;
    renderOrders();
  });
  els.seasonFilter.addEventListener("change", (event) => {
    state.orderQuickFilter = "";
    state.seasonFilter = event.target.value;
    renderOrders();
  });
  els.crossStageFilter?.addEventListener("change", (event) => {
    state.crossStageFilter = event.target.value;
    renderCrosses();
  });
  els.crossResultFilter?.addEventListener("change", (event) => {
    state.crossResultFilter = event.target.value;
    renderCrosses();
  });
  els.profitYearFilter?.addEventListener("change", (event) => {
    state.dashboardProfitYear = event.target.value;
    renderDashboard();
  });
  els.selectVisibleOrders.addEventListener("change", () => toggleVisibleOrderSelection(els.selectVisibleOrders.checked));
  els.bulkPaidBtn.addEventListener("click", () => bulkUpdateOrders("paid"));
  els.bulkSentBtn.addEventListener("click", () => bulkUpdateOrders("sent"));
  els.addOrderVarietyBtn.addEventListener("click", () => addPickedVarietyToOrder());
  els.crossForm?.querySelectorAll("[data-cross-stage-option]").forEach((button) => {
    button.addEventListener("click", () => setCrossStage(button.dataset.crossStageOption));
  });
  els.crossForm?.querySelectorAll("[data-cross-rating-option]").forEach((button) => {
    button.addEventListener("click", () => setCrossRating(button.dataset.crossRatingOption));
  });
  els.crossForm?.elements.motherVarietyId?.addEventListener("change", renderCrossPreview);
  els.crossForm?.elements.pollenVarietyId?.addEventListener("change", renderCrossPreview);
  els.crossForm?.elements.seedlingName?.addEventListener("input", renderCrossPreview);
  els.crossForm?.elements.seedlingPhotoFiles?.addEventListener("change", renderCrossPreview);
  els.orderVarietyPicker.addEventListener("input", () => {
    updateOrderVarietyCatalogPrice();
    renderOrderVarietySuggestions();
  });
  els.orderVarietyPicker.addEventListener("focus", renderOrderVarietySuggestions);
  els.orderVarietyPicker.addEventListener("blur", () => {
    window.setTimeout(hideOrderVarietySuggestions, 120);
  });
  els.orderVarietyPicker.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (els.orderVarietySuggestions.hidden) renderOrderVarietySuggestions();
      moveOrderSuggestion(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (els.orderVarietySuggestions.hidden) renderOrderVarietySuggestions();
      moveOrderSuggestion(-1);
      return;
    }
    if (event.key === "Escape") {
      hideOrderVarietySuggestions();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const suggestion = activeOrderVarietySuggestionName();
      if (suggestion) {
        chooseOrderVarietySuggestion(suggestion);
        return;
      }
      if (clean(els.orderVarietyPicker.value) && els.orderVarietyQuantity) {
        els.orderVarietyQuantity.focus();
        els.orderVarietyQuantity.select?.();
      }
    }
  });
  els.orderVarietyQuantity?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addPickedVarietyToOrder();
    }
  });
  els.orderVarietyManualPrice?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addPickedVarietyToOrder();
    }
  });
  els.loadOrderRateBtn.addEventListener("click", loadCurrentOrderRate);
  els.addFeesToOrderBtn?.addEventListener("click", applyOrderFeesToPrice);
  els.copyCustomerOrderTextBtn?.addEventListener("click", copyCurrentOrderCustomerText);
  els.toggleOrderPaymentTextSentBtn?.addEventListener("click", toggleCurrentOrderPaymentTextSent);
  els.downloadCustomerOrderImageBtn?.addEventListener("click", downloadCurrentOrderCustomerImage);
  els.toggleOrderPaymentQrBtn?.addEventListener("click", toggleCurrentOrderPaymentQr);
  els.downloadOrderPaymentQrBtn?.addEventListener("click", downloadCurrentOrderPaymentQr);
  els.orderCountryPromptCzBtn?.addEventListener("click", () => submitOrderCountryPromptChoice("cz"));
  els.orderCountryPromptForeignBtn?.addEventListener("click", () => submitOrderCountryPromptChoice("foreign"));
  els.closeOrderCountryPromptBtn?.addEventListener("click", () => submitOrderCountryPromptChoice(""));
  els.orderCountryPromptDialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    submitOrderCountryPromptChoice("");
  });
  els.orderForm?.querySelectorAll("[data-order-fee-preset]").forEach((button) => {
    button.addEventListener("click", () => applyOrderFeePreset(button.dataset.orderFeePreset));
  });
  els.orderForm.elements.customerId.addEventListener("change", () => {
    syncOrderCustomerValidity();
    state.orderPaymentCountryOverride = "";
    if (normalizeDeliveryMethod(els.orderForm.elements.deliveryMethod.value) === "personal_pickup") {
      clearOrderDeliveryFeeRestoreSnapshot();
    }
    applyDefaultShippingFeeForSelectedCustomer();
    applyDefaultCodFeeForSelectedCustomer({ force: Boolean(clean(els.orderForm.elements.codFee.value)) });
    renderOrderExtraFeeFields(undefined, { preserveValues: true });
    updateOrderAdvancedSummary();
    syncOrderAlternateBlock();
    syncOrderRestWarningBlock();
    refreshOrderPricingPreview();
  });
  els.orderForm.elements.paymentStatus.addEventListener("change", handleOrderPaymentStatusChange);
  els.orderPaymentToggle?.querySelectorAll("[data-order-payment-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setOrderPaymentStatus(button.dataset.orderPaymentOption);
    });
  });
  els.orderForm.elements.shippingStatus.addEventListener("change", handleOrderShippingStatusChange);
  els.orderStatusToggle?.querySelectorAll("[data-order-shipping-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setOrderShippingStatus(button.dataset.orderShippingOption);
    });
  });
  els.orderForm.elements.deliveryMethod?.addEventListener("change", handleOrderDeliveryMethodChange);
  els.orderDeliveryToggle?.querySelectorAll("[data-order-delivery-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setOrderDeliveryMethod(button.dataset.orderDeliveryOption);
    });
  });
  ["shippingFee", "packingFee", "codFee"].forEach((fieldName) => {
    els.orderForm.elements[fieldName]?.addEventListener("input", refreshOrderPricingPreview);
    els.orderForm.elements[fieldName]?.addEventListener("change", refreshOrderPricingPreview);
  });
  els.orderForm.elements.price.addEventListener("input", () => {
    if (els.orderForm.dataset.programmaticPrice === "1") return;
    els.orderForm.dataset.priceManual = "1";
    els.orderForm.dataset.feesBasePrice = "";
    autoCalculateOrderPrice({ silent: true });
  });
  els.orderForm.elements.varietiesText.addEventListener("input", () => {
    autoCalculateOrderPrice({ silent: true });
    renderOrderStornoBlock();
  });
  els.orderForm.querySelectorAll('input[name="currency"]').forEach((input) => {
    input.addEventListener("change", () => {
      convertOrderFormCurrency(input.value);
    });
  });
  els.orderForm.elements.orderDate.addEventListener("change", () => {
    refreshOrderRateHint(true);
    autoCalculateOrderPrice({ silent: true });
  });
  els.orderForm.addEventListener("input", handleOrderFormInteraction);
  els.orderForm.addEventListener("change", handleOrderFormInteraction);
  els.orderForm.addEventListener("keydown", handleOrderDialogHotkeys);
  els.orderDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    attemptCloseOrderDialog();
  });
  window.addEventListener("beforeunload", handleWindowBeforeUnload);
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
  window.addEventListener("focus", () => maybeAutoPullSupabaseSync({ force: true }));
  window.setInterval(() => maybeAutoPullSupabaseSync(), SUPABASE_SYNC_PULL_INTERVAL_MS);
  document.addEventListener("keydown", handleGlobalHotkeys);
  els.varietyUsageFilter.addEventListener("change", (event) => {
    state.varietyUsageFilter = event.target.value;
    renderVarieties();
  });
  els.varietySort.addEventListener("change", (event) => {
    state.varietySort = event.target.value;
    renderVarieties();
  });
  els.csvFile?.addEventListener("change", readCsvFile);

  clearLegacyOrderDrafts();
  loadSupabaseSyncConfigIntoPanel();
  if (!isSupabaseSyncLoggedIn()) setView("settings");
  renderAll();
  restorePhotoFolder();
  if (hasPendingSupabaseSync()) {
    updateSupabaseSyncStatus("Čeká na odeslání lokální změny.");
    scheduleAutoSupabaseSync("retry");
  }
  // Kurzy se načítají až při práci s konkrétní objednávkou, aby start appky nečekal na síť.
}

function clearLegacyOrderDrafts() {
  try {
    localStorage.removeItem(`${STORE_KEY}:order-drafts`);
  } catch {
    // ignore localStorage availability issues
  }
}

function scheduleRender(key, renderFn) {
  scheduleRender.frames = scheduleRender.frames || {};
  if (scheduleRender.frames[key]) cancelAnimationFrame(scheduleRender.frames[key]);
  scheduleRender.frames[key] = requestAnimationFrame(() => {
    scheduleRender.frames[key] = null;
    renderFn();
  });
}

function loadData() {
  const storedKey = [STORE_KEY, ...LEGACY_STORE_KEYS].find((key) => localStorage.getItem(key));
  if (SEED_SIGNATURE && window.AFRICKE_KOPRIVY_SEED) {
    const storedSeedSignature = localStorage.getItem(SEED_SIGNATURE_KEY);
    if (storedSeedSignature !== SEED_SIGNATURE) {
      if (storedKey) {
        localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
      } else {
        const seeded = normalizeLoadedData(window.AFRICKE_KOPRIVY_SEED);
        localStorage.setItem(STORE_KEY, JSON.stringify(seeded));
        localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
        return seeded;
      }
    }
  }

  if (storedKey) {
    try {
      const parsed = JSON.parse(localStorage.getItem(storedKey));
      const normalized = normalizeLoadedData(parsed);
      localStorage.setItem(STORE_KEY, JSON.stringify(normalized));
      if (SEED_SIGNATURE) localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
      return normalized;
    } catch {
      localStorage.removeItem(storedKey);
    }
  }

  const initial = normalizeLoadedData(window.AFRICKE_KOPRIVY_SEED || fallbackData());
  localStorage.setItem(STORE_KEY, JSON.stringify(initial));
  if (SEED_SIGNATURE) localStorage.setItem(SEED_SIGNATURE_KEY, SEED_SIGNATURE);
  return initial;
}

function normalizeLoadedData(parsed) {
  const source = repairLoadedDataStrings(parsed || {});
  const data = {
    customers: Array.isArray(source.customers) ? source.customers : [],
    orders: Array.isArray(source.orders) ? source.orders : [],
    varieties: Array.isArray(source.varieties) ? source.varieties : [],
    crosses: Array.isArray(source.crosses) ? source.crosses : [],
    offers: Array.isArray(source.offers) ? source.offers : [],
    exchangeRates: Array.isArray(source.exchangeRates) ? source.exchangeRates : [],
    settings: normalizeFeeSettings(source.settings),
  };

  data.customers = data.customers.map(sanitizeCustomer);

  data.orders = data.orders.map(normalizeOrder);
  data.customers = mergeDuplicateCustomers(data.customers, data.orders);

  data.varieties = data.varieties.length
    ? mergeVarieties(data.varieties.map((variety) => ({ ...variety, note: cleanBusinessNote(variety.note) })))
    : mergeVarieties(data.orders.flatMap((order) => varietyNamesFromText(order.varietiesText)));

  data.crosses = data.crosses.map(normalizeCross);
  data.offers = data.offers.map(normalizeOffer);
  reconcileOfferItemVarietyLinks(data);
  data.exchangeRates = mergeExchangeRates(data.exchangeRates);

  return data;
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

function syncFinishedCrossVarieties(data = state.data) {
  const previousData = state.data;
  let changed = false;
  if (data && data !== state.data) state.data = data;
  try {
    (data.crosses || []).forEach((cross) => {
      if (clean(cross.seedlingName) && !findVariety(clean(cross.linkedVarietyId))) {
        cross.linkedVarietyId = ensureVarietyFromCross(cross);
        changed = true;
      }
    });
  } finally {
    if (previousData && data !== previousData) state.data = previousData;
  }
  return changed;
}

function fallbackData() {
  const now = new Date().toISOString();
  const customers = [
    {
      id: uid(),
      firstName: "Jana",
      lastName: "Nováková",
      phone: "+420 777 123 456",
      email: "jana@example.cz",
      street: "",
      postalCode: "",
      city: "Praha",
      address: "Praha",
      country: "Česko",
      tags: [],
      note: "Ukázkový záznam",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      firstName: "Mária",
      lastName: "Horváthová",
      phone: "+421 905 111 222",
      email: "maria@example.sk",
      street: "",
      postalCode: "",
      city: "Bratislava",
      address: "Bratislava",
      country: "Slovensko",
      tags: ["VIP"],
      note: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      firstName: "Petra",
      lastName: "Malá",
      phone: "",
      email: "petra@example.cz",
      street: "",
      postalCode: "",
      city: "Brno",
      address: "Brno",
      country: "Česko",
      tags: ["pozor"],
      note: "Ověřit platbu před odesláním",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const orders = [
    {
      id: uid(),
      customerId: customers[0].id,
      orderDate: toDateInput(new Date()),
      varietiesText: "Piňata Yellow 2x\nKaleidoskop 1x",
      price: "260",
      paymentStatus: "čeká",
      shippingStatus: "nová",
      deliveryMethod: "ship",
      packetaPointId: "",
      codAmount: "",
      trackingNumber: "",
      packetaPacketId: "",
      currency: "CZK",
      exchangeRate: "",
      note: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      customerId: customers[1].id,
      orderDate: toDateInput(new Date(Date.now() - 86400000 * 2)),
      varietiesText: "Bandit Queen 3x",
      price: "390",
      paymentStatus: "zaplaceno",
      shippingStatus: "připraveno",
      deliveryMethod: "ship",
      packetaPointId: "",
      codAmount: "",
      trackingNumber: "",
      packetaPacketId: "",
      currency: "CZK",
      exchangeRate: "",
      note: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uid(),
      customerId: customers[2].id,
      orderDate: toDateInput(new Date(Date.now() - 86400000 * 8)),
      varietiesText: "Color Clouds 2x",
      price: "220",
      paymentStatus: "nezaplaceno",
      shippingStatus: "nová",
      deliveryMethod: "ship",
      packetaPointId: "",
      codAmount: "",
      trackingNumber: "",
      packetaPacketId: "",
      currency: "CZK",
      exchangeRate: "",
      note: "Čeká dlouho",
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    customers,
    orders,
    varieties: mergeVarieties(orders.flatMap((order) => varietyNamesFromText(order.varietiesText))),
    crosses: [],
    exchangeRates: [],
    settings: normalizeFeeSettings(),
  };
}

function saveData(options = {}) {
  invalidateDerivedCache();
  localStorage.setItem(STORE_KEY, JSON.stringify(state.data));
  if (!options.skipAutoSync) {
    markSupabaseSyncDirty();
    scheduleAutoSupabaseSync("save");
  }
}

function invalidateDerivedCache() {
  Object.keys(derivedCache).forEach((key) => {
    derivedCache[key] = null;
  });
}

function mapById(items) {
  return new Map((items || []).map((item) => [item.id, item]));
}

function customersById() {
  derivedCache.customersById = derivedCache.customersById || mapById(state.data.customers);
  return derivedCache.customersById;
}

function ordersById() {
  derivedCache.ordersById = derivedCache.ordersById || mapById(state.data.orders);
  return derivedCache.ordersById;
}

function varietiesById() {
  derivedCache.varietiesById = derivedCache.varietiesById || mapById(state.data.varieties);
  return derivedCache.varietiesById;
}

function offersById() {
  derivedCache.offersById = derivedCache.offersById || mapById(state.data.offers);
  return derivedCache.offersById;
}

function crossesById() {
  derivedCache.crossesById = derivedCache.crossesById || mapById(state.data.crosses);
  return derivedCache.crossesById;
}

function latestOrderByCustomerId() {
  if (derivedCache.latestOrderByCustomerId) return derivedCache.latestOrderByCustomerId;
  const map = new Map();
  [...state.data.orders]
    .sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1))
    .forEach((order) => {
      if (!map.has(order.customerId)) map.set(order.customerId, order);
    });
  derivedCache.latestOrderByCustomerId = map;
  return map;
}

function varietyUsageByName() {
  if (derivedCache.varietyUsageByName) return derivedCache.varietyUsageByName;
  const map = new Map();
  state.data.orders.forEach((order) => {
    unique(orderVarietyNames(order).map(varietyNameMatchKey).filter(Boolean)).forEach((name) => {
      map.set(name, (map.get(name) || 0) + 1);
    });
  });
  derivedCache.varietyUsageByName = map;
  return map;
}

function renderAll() {
  renderShared();
  renderView(state.view);
}

function renderShared() {
  renderTabCounts();
  renderFilters();
  renderOrderCustomerOptions();
  renderCountryList();
  renderVarietyList();
  renderCrossVarietyOptions();
  renderOrderVarietyFilter();
  renderSeasonList();
  renderFeeSettings();
  updatePhotoFolderStatus();
  renderStudioShell();
  renderSettingsScene();
}

function renderTabCounts() {
  const counts = {
    offers: state.data.offers.length,
    orders: state.data.orders.length,
    customers: state.data.customers.length,
    varieties: state.data.varieties.length,
    crosses: state.data.crosses.length,
    dashboard: paidVarietyProfitText(state.data.orders),
  };
  document.querySelectorAll(".tab[data-view]").forEach((button) => {
    const view = button.dataset.view;
    if (button.classList.contains("settings-tab")) return;
    if (!button.dataset.tabLabel) button.dataset.tabLabel = button.textContent.trim();
    const count = counts[view];
    if (count === undefined) return;
    button.innerHTML = `<span class="tab-label">${escapeHtml(button.dataset.tabLabel)}</span><span class="tab-count">${escapeHtml(String(count))}</span>`;
  });
}

function renderView(view) {
  if (view === "dashboard") renderDashboard();
  if (view === "customers") renderCustomers();
  if (view === "orders") renderOrders();
  if (view === "varieties") renderVarieties();
  if (view === "crosses") renderCrosses();
  if (view === "offers") renderOffers();
  if (view === "settings") renderSettingsScene();
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
}

function openMainView(view) {
  if (!isSupabaseSyncLoggedIn() && view !== "settings") {
    setView("settings");
    updatePrivateAppMode();
    toast("Nejdřív se přihlas.");
    return;
  }
  if (view === "customers") {
    state.customerQuickFilter = "";
  }
  if (view === "orders") {
    state.orderQuickFilter = "";
  }
  setView(view);
  renderShared();
  renderView(view);
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
    toast("Instalace se objeví až po otevření z HTTPS odkazu v Chrome nebo Edge.");
    return;
  }
  const promptEvent = state.installPromptEvent;
  state.installPromptEvent = null;
  promptEvent.prompt();
  const result = await promptEvent.userChoice.catch(() => null);
  if (result?.outcome === "accepted" && els.installAppBtn) els.installAppBtn.hidden = true;
}

function renderStudioShell() {
  if (!els.studioHeadline || !els.studioMiniStats) return;
  const orders = state.data.orders;
  const customers = state.data.customers;
  const paymentDue = orders.filter((order) => order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno").length;
  const ready = orders.filter((order) => order.shippingStatus === "připraveno").length;
  const noPrice = orders.filter((order) => !hasSavedOrderPrice(order)).length;
  const topVariety = topVarietyHighlights(1)[0];
  const viewCopy = {
    dashboard: {
      headline: "Přehled sezóny",
      subline: `${paymentDue} plateb · ${ready} připraveno · ${noPrice} bez ceny`,
    },
    orders: {
      headline: "Objednávky",
      subline: `${orders.length} celkem · ${paymentDue} čeká na platbu`,
    },
    customers: {
      headline: "Zákazníci",
      subline: `${customers.length} kontaktů`,
    },
    varieties: {
      headline: "Odrůdy",
      subline: `${state.data.varieties.length} položek`,
    },
    crosses: {
      headline: "Křížení",
      subline: `${state.data.crosses.length} záznamů`,
    },
    offers: {
      headline: "Nabídky",
      subline: `${state.data.offers.length} nabídek`,
    },
    settings: {
      headline: "Nástroje",
      subline: "Záloha, export, poplatky",
    },
  }[state.view] || {
    headline: "Afričké kopřivy",
    subline: "",
  };

  els.studioHeadline.textContent = viewCopy.headline;
  els.studioSubline.textContent = viewCopy.subline;
  els.studioMiniStats.innerHTML = [
    studioStatMarkup("Nabídky", String(state.data.offers.length), activeOfferCountText(), 'data-action-view="offers"'),
    studioStatMarkup("Objednávky", String(orders.length), paymentDue ? `${paymentDue} čeká` : "hotovo", 'data-action-view="orders"'),
    studioStatMarkup("Zákazníci", String(customers.length), "", 'data-action-view="customers"'),
    studioStatMarkup("Odrůdy", String(state.data.varieties.length), topVariety ? `top ${topVariety.name}` : "", 'data-action-view="varieties"'),
    studioStatMarkup("Křížení", String(state.data.crosses.length), "", 'data-action-view="crosses"'),
  ].join("");
  wireActionSurface(els.studioMiniStats);
}

function activeOfferCountText() {
  const active = state.data.offers.filter((offer) => offer.status !== "uzavřená").length;
  return active ? `${active} aktivní` : "";
}

function studioStatMarkup(label, value, meta, attrs = "") {
  return `<button class="studio-stat" type="button" ${attrs}>
    <span>${escapeHtml(label)}</span>
    <strong>${escapeHtml(String(value ?? ""))}</strong>
    ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
  </button>`;
}

function sceneCardMarkup({ eyebrow, value, title, meta, tone = "", actionLabel = "", actionAttrs = "" }) {
  return `<article class="scene-card ${tone}">
    <span class="scene-eyebrow">${escapeHtml(eyebrow || "")}</span>
    <strong>${escapeHtml(String(value ?? ""))}</strong>
    <h3>${escapeHtml(title || "")}</h3>
    ${meta ? `<p>${escapeHtml(meta)}</p>` : ""}
    ${actionLabel ? `<button class="mini-button scene-action" type="button" ${actionAttrs}>${escapeHtml(actionLabel)}</button>` : ""}
  </article>`;
}

function topVarietyHighlights(limit = 5) {
  return [...varietyUsageByName().entries()]
    .map(([key, count]) => {
      const match = state.data.varieties.find((variety) => varietyNameMatchKey(variety.name) === key);
      return { key, name: match?.name || key, count };
    })
    .sort((a, b) => b.count - a.count || naturalCompare(a.name, b.name))
    .slice(0, limit);
}

function recentOrderHighlights(limit = 4) {
  return [...state.data.orders]
    .sort((a, b) => String(b.updatedAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.orderDate || "")))
    .slice(0, limit);
}

function attentionCustomerHighlights(limit = 4) {
  return state.data.customers
    .filter(isAttentionCustomer)
    .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
    .slice(0, limit);
}

function focusVarietyUsage(filter = "") {
  state.varietyUsageFilter = filter;
  state.varietySearch = "";
  els.varietySearch.value = "";
  els.varietyUsageFilter.value = filter;
  renderVarieties();
  setView("varieties");
}

function wireActionSurface(root) {
  if (!root) return;
  root.querySelectorAll("[data-action-view]").forEach((button) => {
    button.addEventListener("click", () => openMainView(button.dataset.actionView));
  });
  root.querySelectorAll("[data-action-order-filter]").forEach((button) => {
    button.addEventListener("click", () => focusDashboardFilter(button.dataset.actionOrderFilter));
  });
  root.querySelectorAll("[data-action-variety-name]").forEach((button) => {
    button.addEventListener("click", () => openVarietyDetailByName(button.dataset.actionVarietyName));
  });
  root.querySelectorAll("[data-action-customer-id]").forEach((button) => {
    button.addEventListener("click", () => focusCustomer(button.dataset.actionCustomerId));
  });
  root.querySelectorAll("[data-action-order-id]").forEach((button) => {
    button.addEventListener("click", () => openOrderDialog(button.dataset.actionOrderId));
  });
  root.querySelectorAll("[data-action-command]").forEach((button) => {
    button.addEventListener("click", () => openCommandPalette(button.dataset.actionCommand || ""));
  });
  root.querySelectorAll("[data-action-new-order]").forEach((button) => {
    button.addEventListener("click", () => openOrderDialog());
  });
  root.querySelectorAll("[data-action-new-customer]").forEach((button) => {
    button.addEventListener("click", () => openCustomerDialog());
  });
  root.querySelectorAll("[data-action-new-variety]").forEach((button) => {
    button.addEventListener("click", () => openVarietyDialog());
  });
  root.querySelectorAll("[data-action-new-offer]").forEach((button) => {
    button.addEventListener("click", () => openOfferDialog());
  });
  root.querySelectorAll("[data-action-customer-filter]").forEach((button) => {
    button.addEventListener("click", () => focusDashboardFilter(button.dataset.actionCustomerFilter));
  });
  root.querySelectorAll("[data-action-variety-filter]").forEach((button) => {
    button.addEventListener("click", () => focusVarietyUsage(button.dataset.actionVarietyFilter || ""));
  });
  root.querySelectorAll("[data-action-backup]").forEach((button) => {
    button.addEventListener("click", backupData);
  });
}

function renderDashboard() {
  const { orders } = state.data;
  const overview = renderProfitOverview(orders);
  const averageProfit = overview.pricedPaidOrderCount ? overview.total / overview.pricedPaidOrderCount : 0;
  const bestMonthValue = overview.bestMonth?.total > 0 ? formatMoney(overview.bestMonth.total, "CZK") : "0 Kč";
  const bestMonthHint = overview.bestMonth?.total > 0 ? overview.bestMonth.label : "zatím bez špičky";

  els.metrics.innerHTML = [
    metric(`Zisk ${overview.selectedYear}`, formatMoney(overview.total, "CZK"), "", { icon: "💰", hint: "jen odrůdy po úhradě" }),
    metric("Zaplaceno", overview.paidOrders.length, "", { icon: "✓", hint: "objednávky v roce" }),
    metric("Průměr", formatMoney(averageProfit, "CZK"), "", { icon: "≈", hint: "na započtenou objednávku" }),
    metric("Nejlepší měsíc", bestMonthValue, "", { icon: "📈", hint: bestMonthHint }),
  ].join("");
}

function wireDashboardButton(button) {
  if (button.dataset.openDashboardOrder) {
    button.addEventListener("click", () => openOrderDialog(button.dataset.openDashboardOrder));
  }
  if (button.dataset.focusDashboardCustomer) {
    button.addEventListener("click", () => focusCustomer(button.dataset.focusDashboardCustomer));
  }
}

function focusDashboardFilter(filter) {
  if (filter === "warning-customers") {
    state.customerQuickFilter = "attention";
    state.customerSearch = "";
    state.countryFilter = "";
    state.tagFilter = "";
    els.customerSearch.value = "";
    els.countryFilter.value = "";
    els.tagFilter.value = "";
    state.selectedCustomerId = null;
    renderCustomers();
    setView("customers");
    toast("Zobrazuji zákazníky Pozor.");
    return;
  }

  state.orderQuickFilter = filter;
  state.orderSearch = "";
  state.paymentFilter = "";
  state.shippingFilter = "";
  state.deliveryFilter = "";
  state.orderVarietyFilter = "";
  state.seasonFilter = "";
  els.orderSearch.value = "";
  els.paymentFilter.value = "";
  els.shippingFilter.value = "";
  els.deliveryFilter.value = "";
  els.orderVarietyFilter.value = "";
  els.seasonFilter.value = "";
  state.selectedOrderIds.clear();
  renderOrders();
  setView("orders");
  toast("Zobrazuji objednávky z přehledu.");
}

function buildCommandPaletteItems() {
  const recentCustomers = [...state.data.customers]
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
    .slice(0, 6);
  const topVarieties = topVarietyHighlights(6);
  const hotOrders = [...state.data.orders]
    .filter((order) => order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno" || order.shippingStatus === "připraveno")
    .sort((a, b) => String(b.updatedAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.orderDate || "")))
    .slice(0, 6);

  return [
    {
      title: "Nová objednávka",
      meta: "Akce · založit objednávku",
      keywords: "nova objednavka order objednávky vytvořit",
      run: () => openOrderDialog(),
    },
    {
      title: "Nový zákazník",
      meta: "Akce · přidat kontakt",
      keywords: "novy zakaznik kontakt customer",
      run: () => openCustomerDialog(),
    },
    {
      title: "Přidat odrůdu",
      meta: "Akce · nový katalogový záznam",
      keywords: "odruda katalog variety přidat",
      run: () => openVarietyDialog(),
    },
    {
      title: "Nové křížení",
      meta: "Akce · matka, pyl a semenáč",
      keywords: "krizeni křížení opylení pyl matka semenač semenac",
      run: () => openCrossDialog(),
    },
    {
      title: "Nová nabídka",
      meta: "Akce · sezónní nabídka",
      keywords: "nabidka offer kampan",
      run: () => openOfferDialog(),
    },
    {
      title: "Nové resty",
      meta: "Akce · zbytky a poznámky",
      keywords: "resty zbytky zbytek doplnky",
      run: () => openOfferDialog(null, { type: "rests" }),
    },
    {
      title: "Přehled zisku",
      meta: "Sekce · dashboard",
      keywords: "zisk dashboard prehled overview",
      run: () => openMainView("dashboard"),
    },
    {
      title: "Objednávky čekající na platbu",
      meta: "Filtr · finance",
      keywords: "cekajici platba nezaplaceno finance",
      run: () => focusDashboardFilter("payment-due"),
    },
    {
      title: "Připravené objednávky",
      meta: "Filtr · balení",
      keywords: "pripravene baleni expedice",
      run: () => focusDashboardFilter("ready"),
    },
    {
      title: "Objednávky bez ceny",
      meta: "Filtr · dopočet",
      keywords: "bez ceny dopocet ruční cena",
      run: () => focusDashboardFilter("no-price"),
    },
    {
      title: "Pozor zákazníci",
      meta: "Filtr · kontakty",
      keywords: "pozor vip adresa kontakt warning",
      run: () => focusDashboardFilter("warning-customers"),
    },
    {
      title: "Osobní odběry",
      meta: "Filtr · vyzvednutí",
      keywords: "osobni odber pickup",
      run: () => focusDashboardFilter("pickup"),
    },
    ...recentCustomers.map((customer) => ({
      title: customerName(customer),
      meta: `Zákazník · ${customer.country || "bez země"}`,
      keywords: [customer.email, customer.phone, customer.country, customer.fbName].filter(Boolean).join(" "),
      run: () => focusCustomer(customer.id),
    })),
    ...topVarieties.map((item) => ({
      title: item.name,
      meta: `Odrůda · ${item.count}× v objednávkách`,
      keywords: `odruda variety ${item.name}`,
      run: () => openVarietyDetailByName(item.name),
    })),
    ...hotOrders.map((order) => {
      const customer = findCustomer(order.customerId);
      return {
        title: `${customerName(customer)} · ${formatDate(order.orderDate)}`,
        meta: `Objednávka · ${formatOrderPrice(order)}`,
        keywords: [customerName(customer), order.varietiesText, order.note, customer?.country].filter(Boolean).join(" "),
        run: () => openOrderDialog(order.id),
      };
    }),
  ];
}

function renderCommandPalette() {
  if (!els.commandPaletteList) return;
  const query = normalize(state.commandPaletteQuery);
  const items = buildCommandPaletteItems();
  const visible = items.filter((item) => {
    if (!query) return true;
    return matchesSearchText([item.title, item.meta, item.keywords].join(" "), query);
  }).slice(0, 14);

  state.commandPaletteItems = items;
  state.commandPaletteVisibleItems = visible;
  state.commandPaletteIndex = visible.length
    ? Math.max(0, Math.min(state.commandPaletteIndex, visible.length - 1))
    : 0;

  els.commandPaletteList.innerHTML = visible.length
    ? visible.map((item, index) => `
      <button class="command-option ${index === state.commandPaletteIndex ? "active" : ""}" type="button" data-command-item="${index}">
        <span class="command-option-copy">
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.meta)}</small>
        </span>
        <span class="command-option-arrow">↗</span>
      </button>`).join("")
    : emptyState("Nenalezena žádná akce ani záznam.");
}

function openCommandPalette(query = "") {
  if (!els.commandPaletteDialog || !els.commandPaletteInput) return;
  if (!els.commandPaletteDialog.open) els.commandPaletteDialog.showModal();
  state.commandPaletteQuery = query;
  state.commandPaletteIndex = 0;
  els.commandPaletteInput.value = query;
  renderCommandPalette();
  window.requestAnimationFrame(() => {
    els.commandPaletteInput.focus();
    els.commandPaletteInput.select();
  });
}

function closeCommandPalette() {
  if (!els.commandPaletteDialog?.open) return;
  els.commandPaletteDialog.close();
  state.commandPaletteQuery = "";
  state.commandPaletteIndex = 0;
  state.commandPaletteVisibleItems = [];
}

function executeCommandPaletteItem(index) {
  const item = state.commandPaletteVisibleItems[index];
  if (!item) return;
  closeCommandPalette();
  item.run();
}

function handleCommandPaletteClick(event) {
  const button = event.target.closest("[data-command-item]");
  if (!button) return;
  executeCommandPaletteItem(Number(button.dataset.commandItem));
}

function handleCommandPaletteKeydown(event) {
  if (!els.commandPaletteDialog?.open) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!state.commandPaletteVisibleItems.length) return;
    state.commandPaletteIndex = (state.commandPaletteIndex + 1) % state.commandPaletteVisibleItems.length;
    renderCommandPalette();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!state.commandPaletteVisibleItems.length) return;
    state.commandPaletteIndex = (state.commandPaletteIndex - 1 + state.commandPaletteVisibleItems.length) % state.commandPaletteVisibleItems.length;
    renderCommandPalette();
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    executeCommandPaletteItem(state.commandPaletteIndex);
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeCommandPalette();
  }
}

function handleGlobalHotkeys(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette(els.commandPaletteInput?.value || "");
  }
}

function renderCustomers() {
  const customers = filteredCustomers();
  renderCustomersScene();
  if (!state.selectedCustomerId && customers[0]) {
    state.selectedCustomerId = customers[0].id;
  }

  els.customersTable.innerHTML = customers.length
    ? customers
        .map((customer) => {
          const lastOrder = latestOrderForCustomer(customer.id);
          const stornoMeta = customerStornoMeta(customer.id);
          const nonPaymentMeta = customerNonPaymentMeta(customer.id);
          return `<tr class="${[
            customer.id === state.selectedCustomerId ? "selected" : "",
            nonPaymentMeta.count ? "customer-row-unpaid" : "",
            stornoMeta.count ? "customer-row-storno" : "",
          ].filter(Boolean).join(" ")}" data-customer-row="${customer.id}">
            <td>
              <span class="cell-main">${escapeHtml(customerName(customer))}</span>
              <span class="cell-sub">${escapeHtml([customer.fbName ? `FB: ${customer.fbName}` : "", customerRatingLabel(customer)].filter(Boolean).join(" · ") || customer.note || "")}</span>
              ${nonPaymentMeta.count ? `<span class="customer-unpaid-warning">Neplatí${nonPaymentMeta.count > 1 ? ` (${nonPaymentMeta.count})` : ""}</span>` : ""}
              ${stornoMeta.count ? `<span class="customer-storno-warning">Pozor, stornuje${stornoMeta.count > 1 ? ` (${stornoMeta.count})` : ""}</span>` : ""}
              ${nonPaymentMeta.note ? `<span class="customer-unpaid-note">${escapeHtml(shortRestText(nonPaymentMeta.note, 92))}</span>` : ""}
              ${stornoMeta.note ? `<span class="customer-storno-note">${escapeHtml(shortRestText(stornoMeta.note, 92))}</span>` : ""}
            </td>
            <td>
              <span class="cell-main">${escapeHtml(customer.email || customer.phone || "")}</span>
              <span class="cell-sub">${escapeHtml(customer.phone && customer.email ? customer.phone : "")}</span>
            </td>
            <td>${escapeHtml(customer.country || "")}</td>
            <td>
              <span class="cell-main">${lastOrder ? formatDate(lastOrder.orderDate) : ""}</span>
              <span class="cell-sub">${lastOrder ? escapeHtml(formatOrderPrice(lastOrder)) : ""}</span>
            </td>
            <td>
              <span class="row-actions">
                <button class="mini-button" type="button" title="Objednávka" data-add-order="${customer.id}">+</button>
                <button class="mini-button" type="button" title="Upravit" data-edit-customer="${customer.id}">✎</button>
                <button class="mini-button" type="button" title="Smazat" data-delete-customer="${customer.id}">×</button>
              </span>
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="5">${emptyState("Žádný záznam.")}</td></tr>`;

  els.customersTable.querySelectorAll("[data-customer-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.selectedCustomerId = row.dataset.customerRow;
      renderCustomers();
    });
  });
  els.customersTable.querySelectorAll("[data-edit-customer]").forEach((button) => {
    button.addEventListener("click", () => openCustomerDialog(button.dataset.editCustomer));
  });
  els.customersTable.querySelectorAll("[data-delete-customer]").forEach((button) => {
    button.addEventListener("click", () => deleteCustomer(button.dataset.deleteCustomer));
  });
  els.customersTable.querySelectorAll("[data-add-order]").forEach((button) => {
    button.addEventListener("click", () => openOrderDialog(null, button.dataset.addOrder));
  });

  renderCustomerDetail();
}

function renderCustomerDetail() {
  const customer = findCustomer(state.selectedCustomerId) || filteredCustomers()[0];
  if (!customer) {
    els.customerDetail.innerHTML = emptyState("Vyber zákazníka.");
    return;
  }

  state.selectedCustomerId = customer.id;
  const orders = state.data.orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1));
  const alerts = customerAlerts(customer, orders);

  els.customerDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${escapeHtml(customerName(customer))}</h2>
        ${customer.fbName ? `<p class="fb-name">FB: ${escapeHtml(customer.fbName)}</p>` : ""}
        <div class="pills">${renderTags(customer.tags || [])}</div>
        ${alerts.length ? `<div class="alert-list">${alerts.map(renderAlert).join("")}</div>` : ""}
      </div>
      <div class="detail-actions">
        <button class="button secondary" type="button" data-add-detail-order="${customer.id}">Nová objednávka</button>
        <button class="button ghost" type="button" data-edit-detail="${customer.id}">Upravit údaje</button>
      </div>
    </div>
    <section class="detail-section">
      <h2>Kontakt</h2>
      ${detailLine("FB jméno", customer.fbName || "—")}
      ${detailLine("Telefon", customer.phone || "—")}
      ${detailLine("Email", customer.email || "—")}
      ${detailLine("Ulice", customer.street || "—")}
      ${detailLine("PSČ", customer.postalCode || "—")}
      ${detailLine("Město", customer.city || "—")}
      ${detailLine("Země", customer.country || "—")}
      ${detailLine("Interně", customerRatingLabel(customer) || "—")}
    </section>
    <section class="detail-section">
      <div class="panel-heading">
        <h2>Historie objednávek</h2>
        <button class="text-button" type="button" data-focus-customer-orders="${customer.id}">Zobrazit v objednávkách</button>
      </div>
      ${customerOrderSummary(orders)}
      <div class="stack-list order-history-list">
        ${orders.length ? orders.map(renderCustomerOrderHistoryItem).join("") : emptyState("Bez objednávek.")}
      </div>
    </section>
    <section class="detail-section">
      <h2>Poznámky</h2>
      <p class="detail-note-text">${escapeHtml(customer.note || "—")}</p>
      <textarea class="quick-note" data-quick-note rows="3" placeholder="Přidat krátkou poznámku k zákazníkovi"></textarea>
      <button class="button secondary" type="button" data-add-note="${customer.id}">Přidat poznámku</button>
    </section>
  `;

  els.customerDetail.querySelector("[data-edit-detail]").addEventListener("click", () => openCustomerDialog(customer.id));
  els.customerDetail.querySelector("[data-add-detail-order]").addEventListener("click", () => openOrderDialog(null, customer.id));
  els.customerDetail.querySelector("[data-add-note]").addEventListener("click", () => addCustomerNote(customer.id));
  els.customerDetail.querySelector("[data-focus-customer-orders]").addEventListener("click", () => focusOrdersForCustomer(customer.id));
  els.customerDetail.querySelectorAll("[data-edit-detail-order]").forEach((button) => {
    button.addEventListener("click", () => openOrderDialog(button.dataset.editDetailOrder));
  });
  els.customerDetail.querySelectorAll("[data-open-variety-name]").forEach((button) => {
    button.addEventListener("click", () => openVarietyDetailByName(button.dataset.openVarietyName));
  });
  els.customerDetail.querySelectorAll("[data-focus-customer-variety-orders]").forEach((button) => {
    button.addEventListener("click", () => focusOrdersForCustomerVariety(customer.id, button.dataset.focusCustomerVarietyOrders));
  });
  els.customerDetail.querySelectorAll("[data-copy-message]").forEach((button) => {
    button.addEventListener("click", () => copyCustomerMessage(customer.id, button.dataset.copyMessage));
  });
}

function noPriceOrdersCount() {
  return state.data.orders.filter((order) => !hasSavedOrderPrice(order)).length;
}

function renderCustomersScene() {
  if (!els.customersScene) return;
  const customers = state.data.customers;
  const czCount = customers.filter((customer) => normalize(customer.country || "").includes("česko") || normalize(customer.country || "").includes("cesko")).length;
  const skCount = customers.filter((customer) => normalize(customer.country || "").includes("slovensko")).length;
  const vipCount = customers.filter((customer) => customer.tags?.includes("VIP")).length;
  const warningCount = customers.filter(isAttentionCustomer).length;

  els.customersScene.innerHTML = [
    sceneCardMarkup({
      eyebrow: "Celkem",
      value: customers.length,
      title: "Zákazníků",
      meta: `${czCount} ČR · ${skCount} SK`,
      tone: "tone-sage",
      actionLabel: "Přidat",
      actionAttrs: 'data-action-new-customer="1"',
    }),
    sceneCardMarkup({
      eyebrow: "Pozor",
      value: warningCount,
      title: "K řešení",
      meta: "",
      tone: "tone-amber",
      actionLabel: "Filtrovat",
      actionAttrs: 'data-action-customer-filter="warning-customers"',
    }),
    sceneCardMarkup({
      eyebrow: "VIP",
      value: vipCount,
      title: "Kontakty",
      meta: "",
      tone: "tone-rose",
      actionLabel: "Zákazníci",
      actionAttrs: 'data-action-view="customers"',
    }),
  ].join("");
  wireActionSurface(els.customersScene);
}

function renderOrdersScene() {
  if (!els.ordersScene) return;
  const orders = state.data.orders;
  const paymentOrders = orders.filter((order) => order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno");
  const readyOrders = orders.filter((order) => order.shippingStatus === "připraveno");
  const pickupOrders = orders.filter((order) => normalizeDeliveryMethod(order.deliveryMethod) === "personal_pickup" && order.shippingStatus !== "zaplaceno");
  const noPrice = noPriceOrdersCount();

  els.ordersScene.innerHTML = [
    sceneCardMarkup({
      eyebrow: "Platby",
      value: paymentOrders.length,
      title: "Čeká",
      meta: totalByCurrencyText(paymentOrders),
      tone: "tone-gold",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-order-filter="payment-due"',
    }),
    sceneCardMarkup({
      eyebrow: "Stav",
      value: readyOrders.length,
      title: "Připravené",
      meta: "",
      tone: "tone-mint",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-order-filter="ready"',
    }),
    sceneCardMarkup({
      eyebrow: "Cena",
      value: noPrice,
      title: "Bez ceny",
      meta: "",
      tone: "tone-ink",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-order-filter="no-price"',
    }),
    sceneCardMarkup({
      eyebrow: "Odběr",
      value: pickupOrders.length,
      title: "Osobní",
      meta: "",
      tone: "tone-sky",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-order-filter="pickup"',
    }),
  ].join("");
  wireActionSurface(els.ordersScene);
}

function renderVarietiesScene() {
  if (!els.varietiesScene) return;
  const varieties = state.data.varieties;
  const active = varieties.filter((variety) => variety.active !== false).length;
  const used = varieties.filter((variety) => varietyUsageCount(variety.name) > 0).length;
  const unused = varieties.filter((variety) => varietyUsageCount(variety.name) === 0).length;
  const topVariety = topVarietyHighlights(1)[0];

  els.varietiesScene.innerHTML = [
    sceneCardMarkup({
      eyebrow: "Aktivní",
      value: active,
      title: "Odrůdy",
      meta: `${varieties.length} celkem`,
      tone: "tone-mint",
      actionLabel: "Přidat",
      actionAttrs: 'data-action-new-variety="1"',
    }),
    sceneCardMarkup({
      eyebrow: "Použité",
      value: used,
      title: "V objednávkách",
      meta: "",
      tone: "tone-sage",
      actionLabel: "Filtrovat",
      actionAttrs: 'data-action-variety-filter="used"',
    }),
    sceneCardMarkup({
      eyebrow: "Bez použití",
      value: unused,
      title: "Bez objednávek",
      meta: "",
      tone: "tone-amber",
      actionLabel: "Filtrovat",
      actionAttrs: 'data-action-variety-filter="unused"',
    }),
    sceneCardMarkup({
      eyebrow: "Top",
      value: topVariety ? `${topVariety.count}×` : "—",
      title: topVariety ? topVariety.name : "Bez favorita",
      meta: "",
      tone: "tone-rose",
      actionLabel: topVariety ? "Detail" : "Katalog",
      actionAttrs: topVariety ? `data-action-variety-name="${escapeHtml(topVariety.name)}"` : 'data-action-view="varieties"',
    }),
  ].join("");
  wireActionSurface(els.varietiesScene);
}

function renderCrossesScene() {
  if (!els.crossesScene) return;
  const crosses = state.data.crosses;
  const active = crosses.filter((cross) => cross.stage !== "hotovo").length;
  const beautiful = crosses.filter((cross) => cross.resultRating === "krasna").length;
  const rejected = crosses.filter((cross) => cross.resultRating === "hnusna").length;
  const ready = crosses.filter((cross) => cross.stage === "hotovo" && clean(cross.seedlingName)).length;

  els.crossesScene.innerHTML = [
    sceneCardMarkup({
      eyebrow: "Aktivní",
      value: active,
      title: "Rozdělaná křížení",
      meta: "",
      tone: "tone-amber",
      actionLabel: "Přidat",
      actionAttrs: 'data-action-new-cross="1"',
    }),
    sceneCardMarkup({
      eyebrow: "Hotovo",
      value: ready,
      title: "Semenáče",
      meta: "",
      tone: "tone-mint",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-view="crosses"',
    }),
    sceneCardMarkup({
      eyebrow: "Krásná",
      value: beautiful,
      title: "Zopakovat",
      meta: "",
      tone: "tone-sage",
      actionLabel: "Filtrovat",
      actionAttrs: 'data-action-cross-rating="krasna"',
    }),
    sceneCardMarkup({
      eyebrow: "Hnusná",
      value: rejected,
      title: "Neopylovat znovu",
      meta: "",
      tone: "tone-rose",
      actionLabel: "Filtrovat",
      actionAttrs: 'data-action-cross-rating="hnusna"',
    }),
  ].join("");

  wireActionSurface(els.crossesScene);
  els.crossesScene.querySelectorAll("[data-action-new-cross]").forEach((button) => {
    button.addEventListener("click", () => openCrossDialog());
  });
  els.crossesScene.querySelectorAll("[data-action-cross-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      state.crossResultFilter = button.dataset.actionCrossRating || "";
      if (els.crossResultFilter) els.crossResultFilter.value = state.crossResultFilter;
      renderCrosses();
      setView("crosses");
    });
  });
}

function renderOffersScene() {
  if (!els.offersScene) return;
  const offers = state.data.offers;
  const activeOffers = offers.filter((offer) => offer.status !== "uzavřená");
  const totalReservations = offers.reduce((sum, offer) => sum + offerConfirmedCount(offer), 0);
  const totalAlternates = offers.reduce((sum, offer) => sum + offerAlternateCount(offer), 0);
  const generatedOrders = state.data.orders.filter((order) => clean(order.offerId)).length;
  const latestOffer = [...offers].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];

  els.offersScene.innerHTML = [
    sceneCardMarkup({
      eyebrow: "Aktivní",
      value: activeOffers.length,
      title: "Nabídky",
      meta: latestOffer ? formatDate(latestOffer.date) : "",
      tone: "tone-rose",
      actionLabel: "Přidat",
      actionAttrs: 'data-action-new-offer="1"',
    }),
    sceneCardMarkup({
      eyebrow: "Rezervace",
      value: totalReservations,
      title: "Potvrzené",
      meta: totalAlternates ? `Náhradníci ${totalAlternates}` : "",
      tone: "tone-sky",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-view="offers"',
    }),
    sceneCardMarkup({
      eyebrow: "Z nabídek",
      value: generatedOrders,
      title: "Objednávky",
      meta: "",
      tone: "tone-mint",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-view="orders"',
    }),
  ].join("");
  wireActionSurface(els.offersScene);
}

function renderSettingsScene() {
  if (!els.settingsScene) return;
  const totalRows = state.data.customers.length + state.data.orders.length + state.data.varieties.length;
  els.settingsScene.innerHTML = [
    sceneCardMarkup({
      eyebrow: "Data",
      value: `${totalRows} záznamů`,
      title: "Celkem",
      meta: "",
      tone: "tone-ink",
      actionLabel: "Záloha",
      actionAttrs: 'data-action-backup="1"',
    }),
    sceneCardMarkup({
      eyebrow: "Poplatky",
      value: `${state.data.settings?.feeExtras?.length || 0} extra`,
      title: "Nastavení",
      meta: "",
      tone: "tone-gold",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-view="settings"',
    }),
    sceneCardMarkup({
      eyebrow: "Paleta",
      value: "Ctrl+K",
      title: "Rychlé akce",
      meta: "",
      tone: "tone-sage",
      actionLabel: "Otevřít",
      actionAttrs: 'data-action-command=""',
    }),
  ].join("");
  wireActionSurface(els.settingsScene);
}

function orderSavedTotal(order) {
  const amount = parseDecimal(order?.price);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function ordersTotalText(orders) {
  const totals = new Map();
  orders.forEach((order) => {
    const amount = orderSavedTotal(order);
    if (amount <= 0) return;
    const currency = normalizeCurrency(order.currency);
    totals.set(currency, (totals.get(currency) || 0) + amount);
  });
  return [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency)).join(" · ") || "0 Kč";
}

function customerOrderSummary(orders) {
  const paid = orders.filter((order) => parsePaymentStatus(order.paymentStatus) === "zaplaceno").length;
  const waitingOrders = orders.filter((order) => parsePaymentStatus(order.paymentStatus) !== "zaplaceno");
  const waitingText = waitingOrders.length ? `${waitingOrders.length} · ${ordersTotalText(waitingOrders)}` : "Ne";
  return `<div class="history-summary">
    <article><span>Objednávek</span><strong>${orders.length}</strong></article>
    <article><span>Celkem koupil</span><strong>${escapeHtml(ordersTotalText(orders))}</strong></article>
    <article><span>Čeká platba</span><strong>${escapeHtml(waitingText)}</strong></article>
    <article><span>Zaplaceno</span><strong>${paid}</strong></article>
  </div>`;
}

function renderCustomerVarietySummary(customerId, orders) {
  const stats = customerVarietyStats(orders);
  if (!stats.length) return emptyState("Zatím bez odrůd.");
  return stats
    .slice(0, 12)
    .map((item) => `<article class="stack-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${item.count}× v objednávkách · naposledy ${formatDate(item.lastDate)}</small>
      </div>
      <span class="row-actions">
        <button class="mini-button" type="button" title="Detail odrůdy" data-open-variety-name="${escapeHtml(item.name)}">↗</button>
        <button class="mini-button" type="button" title="Objednávky zákazníka s odrůdou" data-focus-customer-variety-orders="${escapeHtml(item.name)}">⌕</button>
      </span>
    </article>`)
    .join("");
}

function customerVarietyStats(orders) {
  const map = new Map();
  orders.forEach((order) => {
    unique(orderVarietyNames(order).map(clean).filter(Boolean)).forEach((name) => {
      const resolvedName = findVarietyByName(name)?.name || name;
      const key = varietyNameMatchKey(resolvedName);
      const item = map.get(key) || { name: resolvedName, count: 0, lastDate: order.orderDate, orderIds: [] };
      item.count += 1;
      item.lastDate = item.lastDate && item.lastDate > order.orderDate ? item.lastDate : order.orderDate;
      item.orderIds.push(order.id);
      map.set(key, item);
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || naturalCompare(a.name, b.name));
}

function renderOrderVarietyLinks(order) {
  const items = orderVarietyPreviewItems(order);
  const alternates = orderOfferAlternateEntries(order);
  const stornoEntries = orderStornoLines(order);
  if (!items.length && !alternates.length && !stornoEntries.length) return `<small>${escapeHtml(order.varietiesText || "Bez odrůd")}</small>`;
  return `<div class="variety-links">${items
    .map((item) => `<button class="variety-link" type="button" data-open-variety-name="${escapeHtml(item.name)}">${escapeHtml(item.quantity > 1 ? `${item.name} · ${quantityText(item.quantity)} ks` : item.name)}</button>`)
    .concat(alternates.map((item) => `<span class="variety-link order-alternate-preview">⚠ ${escapeHtml(item.quantity > 1 ? `${item.name} · ${quantityText(item.quantity)} ks` : item.name)}</span>`))
    .concat(stornoEntries.map((item) => `<span class="variety-link order-storno-preview">✕ ${escapeHtml(item.quantity > 1 ? `${item.name} · ${quantityText(item.quantity)} ks` : item.name)}</span>`))
    .join("")}</div>`;
}

function renderCustomerOrderHistoryItem(order) {
  const details = [deliverySummary(order), orderConversionText(order)]
    .filter(Boolean)
    .join(" · ");
  const noteLine = [order.note].filter(Boolean).join(" · ");
  return `<article class="stack-item order-history-item">
    <div>
      <strong>${escapeHtml(orderNumber(order))} · ${formatDate(order.orderDate)} · ${escapeHtml(formatOrderPrice(order))}</strong>
      ${renderOrderVarietyLinks(order)}
      ${details ? `<small>${escapeHtml(details)}</small>` : ""}
      ${noteLine ? `<small>${escapeHtml(noteLine)}</small>` : ""}
    </div>
    <span class="order-statuses">
      ${orderHasStorno(order) ? '<span class="pill warning">Storno</span>' : ""}
      ${statusPill(order.paymentStatus, paymentLabels[order.paymentStatus])}
      ${shippingPill(order.shippingStatus, shippingLabels[order.shippingStatus])}
      <button class="mini-button" type="button" title="Upravit objednávku" data-edit-detail-order="${order.id}">✎</button>
    </span>
  </article>`;
}

function focusOrdersForCustomer(id) {
  const customer = findCustomer(id);
  if (!customer) return;
  state.selectedOrderIds.clear();
  state.orderQuickFilter = "";
  state.orderSearch = customerName(customer);
  state.paymentFilter = "";
  state.shippingFilter = "";
  state.deliveryFilter = "";
  state.orderVarietyFilter = "";
  state.seasonFilter = "";
  els.orderSearch.value = state.orderSearch;
  els.orderVarietyFilter.value = "";
  els.seasonFilter.value = "";
  renderOrders();
  setView("orders");
}

function focusOrdersForCustomerVariety(customerId, varietyName) {
  const customer = findCustomer(customerId);
  if (!customer) return;
  state.selectedOrderIds.clear();
  state.orderQuickFilter = "";
  state.orderSearch = `${customerName(customer)} ${clean(varietyName)}`.trim();
  state.paymentFilter = "";
  state.shippingFilter = "";
  state.deliveryFilter = "";
  state.orderVarietyFilter = clean(varietyName);
  state.seasonFilter = "";
  els.orderSearch.value = state.orderSearch;
  els.orderVarietyFilter.value = state.orderVarietyFilter;
  els.seasonFilter.value = "";
  renderOrders();
  setView("orders");
}

function orderRowToneClass(order) {
  if (orderHasStorno(order) || customerStornoOrders(order?.customerId).length) return "order-tone-storno";
  const paymentStatus = parsePaymentStatus(order?.paymentStatus);
  const shippingStatus = normalizeShippingStatus(order?.shippingStatus);
  if (paymentStatus === "nezaplaceno") return "order-tone-overdue";
  if (paymentStatus === "zaplaceno" && ["odesláno", "zaplaceno"].includes(shippingStatus)) return "order-tone-complete";
  if (paymentStatus === "zaplaceno") return "order-tone-progress";
  return "order-tone-attention";
}

function renderOrders() {
  const orders = filteredOrders();
  renderOrdersScene();
  state.visibleOrders = orders;
  state.visibleOrderIds = orders.map((order) => order.id);
  syncSelectedOrderIds();
  syncOrderQuickFilterButtons();
  els.paymentFilter.value = state.paymentFilter;
  els.shippingFilter.value = state.shippingFilter;
  els.deliveryFilter.value = state.deliveryFilter;
  els.orderVarietyFilter.value = state.orderVarietyFilter;
  els.seasonFilter.value = state.seasonFilter;
  els.ordersTable.innerHTML = orders.length
    ? orders
        .map((order) => {
          const customer = findCustomer(order.customerId);
          const priceNote = orderConversionText(order);
          const toneClass = orderRowToneClass(order);
          return `<tr class="order-row-openable ${toneClass}" data-open-order="${escapeHtml(order.id)}" tabindex="0" title="Otevřít objednávku">
            <td>
              <input class="row-check" type="checkbox" aria-label="Označit objednávku" data-select-order="${order.id}" ${state.selectedOrderIds.has(order.id) ? "checked" : ""} />
            </td>
            <td>${formatDate(order.orderDate)}</td>
            <td>
              <span class="cell-main">${escapeHtml(customerName(customer))}</span>
              <span class="cell-sub">${escapeHtml(customer?.country || "")}</span>
            </td>
            <td>
              ${renderOrderVarietyLinks(order)}
              <span class="cell-sub">${escapeHtml(order.note || "")}</span>
            </td>
            <td class="order-price-cell">
              <span class="cell-main">${escapeHtml(formatOrderPrice(order))}</span>
              <span class="cell-sub price-note">${escapeHtml(priceNote)}</span>
            </td>
            <td class="order-status-cell">
              <span class="order-statuses">
                ${customerStornoOrders(order.customerId).length ? '<span class="pill danger">Stornuje</span>' : ""}
                ${orderHasStorno(order) ? '<span class="pill warning">Storno</span>' : ""}
                ${statusPill(order.paymentStatus, paymentLabels[order.paymentStatus])}
                ${shippingPill(order.shippingStatus, shippingLabels[order.shippingStatus])}
                ${orderPaymentTextPill(order)}
                ${orderAlternateReservationsPill(order)}
              </span>
              <span class="cell-sub status-note">${escapeHtml(deliverySummary(order))}</span>
            </td>
            <td>
              <span class="row-actions row-actions-compact">
                <button class="mini-button" type="button" title="${clean(order.paymentTextSentAt) ? "Zrušit: text k zaplacení odeslán" : "Označit: text k zaplacení odeslán"}" data-toggle-payment-text-sent="${order.id}">Txt</button>
                <button class="mini-button" type="button" title="Upravit" data-edit-order="${order.id}">✎</button>
                <button class="mini-button" type="button" title="Smazat" data-delete-order="${order.id}">×</button>
              </span>
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="7">${emptyState("Žádná objednávka.")}</td></tr>`;

  els.ordersTable.querySelectorAll("[data-select-order]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.selectedOrderIds.add(input.dataset.selectOrder);
      else state.selectedOrderIds.delete(input.dataset.selectOrder);
      renderBulkOrderControls();
    });
  });
  els.ordersTable.querySelectorAll("[data-edit-order]").forEach((button) => {
    button.addEventListener("click", () => openOrderDialog(button.dataset.editOrder));
  });
  els.ordersTable.querySelectorAll("[data-delete-order]").forEach((button) => {
    button.addEventListener("click", () => deleteOrder(button.dataset.deleteOrder));
  });
  els.ordersTable.querySelectorAll("[data-toggle-payment-text-sent]").forEach((button) => {
    button.addEventListener("click", () => toggleOrderPaymentTextSent(button.dataset.togglePaymentTextSent));
  });
  els.ordersTable.querySelectorAll("[data-open-variety-name]").forEach((button) => {
    button.addEventListener("click", () => openVarietyDetailByName(button.dataset.openVarietyName));
  });
  els.ordersTable.querySelectorAll("[data-open-order]").forEach((row) => {
    const openOrder = () => openOrderDialog(row.dataset.openOrder);
    row.addEventListener("click", (event) => {
      if (shouldIgnoreRowOpen(event.target)) return;
      openOrder();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (shouldIgnoreRowOpen(event.target)) return;
      event.preventDefault();
      openOrder();
    });
  });
  renderBulkOrderControls();
}

function shouldIgnoreRowOpen(target) {
  return Boolean(target?.closest("button, a, input, select, textarea, label, summary, [contenteditable='true']"));
}

function syncSelectedOrderIds() {
  const existingIds = new Set(state.data.orders.map((order) => order.id));
  [...state.selectedOrderIds].forEach((id) => {
    if (!existingIds.has(id)) state.selectedOrderIds.delete(id);
  });
}

function visibleOrderIds() {
  return state.visibleOrderIds || [];
}

function toggleVisibleOrderSelection(checked) {
  visibleOrderIds().forEach((id) => {
    if (checked) state.selectedOrderIds.add(id);
    else state.selectedOrderIds.delete(id);
  });
  renderOrders();
}

function selectedOrVisibleOrders() {
  const selected = state.data.orders.filter((order) => state.selectedOrderIds.has(order.id));
  return selected.length ? selected : state.visibleOrders || [];
}

function renderBulkOrderControls() {
  const visibleIds = visibleOrderIds();
  const visibleSelected = visibleIds.filter((id) => state.selectedOrderIds.has(id)).length;
  const selectedCount = state.selectedOrderIds.size;
  const targetOrders = selectedOrVisibleOrders();
  const paidCount = targetOrders.filter((order) => order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno").length;
  const sentCount = targetOrders.filter((order) => ["nová", "připraveno"].includes(order.shippingStatus)).length;

  els.selectVisibleOrders.checked = Boolean(visibleIds.length && visibleSelected === visibleIds.length);
  els.selectVisibleOrders.indeterminate = Boolean(visibleSelected && visibleSelected < visibleIds.length);
  els.bulkOrderSummary.textContent = selectedCount
    ? `${selectedCount} označeno`
    : `${targetOrders.length} zobrazeno`;
  els.bulkPaidBtn.disabled = paidCount === 0;
  els.bulkSentBtn.disabled = sentCount === 0;
  els.bulkPaidBtn.textContent = `Hromadně zaplaceno (${paidCount})`;
  els.bulkSentBtn.textContent = `Hromadně odesláno (${sentCount})`;
}

function bulkUpdateOrders(action) {
  const now = new Date().toISOString();
  const targets = selectedOrVisibleOrders().filter((order) => {
    if (action === "paid") return order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno";
    if (action === "sent") return ["nová", "připraveno"].includes(order.shippingStatus);
    return false;
  });
  if (!targets.length) {
    toast("Není co hromadně upravit.");
    return;
  }

  const label = action === "paid" ? "označit jako zaplacené" : "označit jako odeslané";
  if (!confirm(`Opravdu ${label} ${targets.length} objednávek?`)) return;

  targets.forEach((order) => {
    if (action === "paid") order.paymentStatus = "zaplaceno";
    if (action === "sent") order.shippingStatus = "odesláno";
    order.updatedAt = now;
  });
  state.selectedOrderIds.clear();
  saveData();
  renderAll();
  toast(action === "paid" ? `${targets.length} objednávek zaplaceno.` : `${targets.length} objednávek odesláno.`);
}

function renderVarieties() {
  const varieties = filteredVarieties();
  renderVarietiesScene();
  els.varietyUsageFilter.value = state.varietyUsageFilter;
  els.varietySort.value = state.varietySort;
  els.varietiesTable.innerHTML = varieties.length
    ? varieties.map((variety) => varietyCatalogCardMarkup(variety)).join("")
    : emptyState("Žádná odrůda.");

  els.varietiesTable.querySelectorAll("[data-edit-variety]").forEach((button) => {
    button.addEventListener("click", () => openVarietyDialog(button.dataset.editVariety));
  });
  els.varietiesTable.querySelectorAll("[data-open-variety-detail]").forEach((button) => {
    button.addEventListener("click", () => openVarietyDetailDialog(button.dataset.openVarietyDetail));
  });
  els.varietiesTable.querySelectorAll("[data-delete-variety]").forEach((button) => {
    button.addEventListener("click", () => deleteVariety(button.dataset.deleteVariety));
  });
  els.varietiesTable.querySelectorAll("[data-open-variety]").forEach((row) => {
    const openVariety = () => openVarietyDetailDialog(row.dataset.openVariety);
    row.addEventListener("click", (event) => {
      if (shouldIgnoreRowOpen(event.target)) return;
      openVariety();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (shouldIgnoreRowOpen(event.target)) return;
      event.preventDefault();
      openVariety();
    });
  });
  hydrateLocalPhotoImages(els.varietiesTable);
}

function varietyCatalogCardMarkup(variety) {
  const safeId = escapeHtml(variety.id);
  const used = varietyUsageCount(variety.name);
  const images = varietyImages(variety);
  const note = cleanBusinessNote(variety?.note || "");
  const mainImage = images[0];
  const visual = mainImage
    ? photoImageMarkup(mainImage, variety.name, "variety-catalog-card-photo", 'loading="lazy"')
    : `<div class="variety-catalog-card-placeholder">
        <span class="variety-catalog-card-placeholder-mark">${escapeHtml(varietyInitials(variety.name))}</span>
      </div>`;
  const stateChip = variety.active === false
    ? '<span class="variety-catalog-card-chip variety-catalog-card-chip-state">Neaktivní</span>'
    : "";

  return `<article class="variety-catalog-card${variety.active === false ? " is-inactive" : ""}" data-open-variety="${safeId}" tabindex="0" title="Otevřít odrůdu">
    <div class="variety-catalog-card-visual">
      <span class="variety-catalog-card-badge">Odrůda</span>
      ${visual}
    </div>
    <div class="variety-catalog-card-copy">
      <div class="variety-catalog-card-heading">
        <button class="text-button variety-name-button variety-catalog-card-name" type="button" data-open-variety-detail="${safeId}">
          ${escapeHtml(variety.name)}
        </button>
      </div>
      ${note ? `<p class="variety-catalog-card-note">${escapeHtml(note)}</p>` : ""}
      <div class="variety-catalog-card-tags">
        <span class="variety-catalog-card-chip">${escapeHtml(varietyPhotoCountText(images.length))}</span>
        <span class="variety-catalog-card-chip">${escapeHtml(priceHistoryText(variety))}</span>
        <span class="variety-catalog-card-chip">${escapeHtml(varietyUsageText(used))}</span>
        ${stateChip}
      </div>
      <div class="variety-catalog-card-footer">
        <span class="variety-catalog-card-price">${escapeHtml(varietyPriceText(variety))}</span>
        <span class="variety-catalog-card-actions">
          <button class="mini-button" type="button" title="Upravit" data-edit-variety="${safeId}">✎</button>
          <button class="mini-button" type="button" title="Smazat" data-delete-variety="${safeId}">×</button>
        </span>
      </div>
    </div>
  </article>`;
}

function filteredCrosses() {
  const query = normalize(state.crossSearch);
  return state.data.crosses
    .filter((cross) => {
      if (state.crossStageFilter && cross.stage !== state.crossStageFilter) return false;
      if (state.crossResultFilter && cross.resultRating !== state.crossResultFilter) return false;
      if (!query) return true;
      const mother = findVariety(cross.motherVarietyId);
      const pollen = findVariety(cross.pollenVarietyId);
      return matchesSearchText([
        mother?.name,
        pollen?.name,
        cross.seedlingName,
        cross.note,
        crossStageLabels[cross.stage],
        crossResultLabels[cross.resultRating],
      ].join(" "), query);
    })
    .sort((a, b) => String(b.pollinatedAt || "").localeCompare(String(a.pollinatedAt || "")) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

function crossLineageLabel(cross) {
  const mother = findVariety(cross.motherVarietyId);
  const pollen = findVariety(cross.pollenVarietyId);
  return `${mother?.name || "Bez matky"} x ${pollen?.name || "Bez pylu"}`;
}

function crossSeedlingVariety(cross) {
  return findVariety(clean(cross.linkedVarietyId)) || (clean(cross.seedlingName) ? findVarietyByName(cross.seedlingName) : null);
}

function crossCatalogPreviewNote(cross) {
  const lines = clean(cross.note).split(/\n+/).map((line) => clean(line)).filter(Boolean);
  if (!lines.length) return "";
  return unique(lines.filter((line) => !parseCrossLineageNoteLine(line))).join("\n");
}

function crossStagePill(stage) {
  const safeStage = crossStages.includes(stage) ? stage : "opyleno";
  const label = `${crossStageIcons[safeStage] || ""} ${crossStageLabels[safeStage] || "—"}`.trim();
  return `<span class="pill cross-stage-pill cross-stage-${escapeHtml(safeStage)}">${escapeHtml(label)}</span>`;
}

function crossResultPill(rating) {
  if (!rating) return `<span class="pill">Bez hodnocení</span>`;
  const classes = {
    krasna: "paid",
    hnusna: "warning",
    nejista: "ready",
  };
  return `<span class="pill ${classes[rating] || ""}">${escapeHtml(crossResultLabels[rating] || rating)}</span>`;
}

function crossRowToneClass(cross) {
  if (cross.resultRating === "hnusna") return "cross-tone-reject";
  if (cross.stage === "hotovo" && cross.resultRating === "krasna") return "cross-tone-success";
  if (cross.stage === "hotovo") return "cross-tone-ready";
  return "cross-tone-active";
}

function crossActorThumb(image, label) {
  if (image) return `<span class="cross-actor-thumb">${photoImageMarkup(image, label, "", 'loading="lazy"')}</span>`;
  return `<span class="cross-actor-thumb empty">${escapeHtml(varietyInitials(label || "K"))}</span>`;
}

function crossSeedlingImages(cross) {
  return unique([cross?.seedlingPhotoUrl, ...normalizeGallery(cross?.seedlingGallery || cross?.gallery)].map(clean).filter(Boolean));
}

function crossSeedlingMainPhoto(cross) {
  return clean(cross?.seedlingPhotoUrl) || crossSeedlingImages(cross)[0] || "";
}

function buildCrossPreviewMarkup(cross, options = {}) {
  const mother = options.mother || findVariety(cross?.motherVarietyId);
  const pollen = options.pollen || findVariety(cross?.pollenVarietyId);
  const seedlingName = clean(options.seedlingName ?? cross?.seedlingName) || "Semenáč";
  const seedlingPhotoUrl = clean(options.seedlingPhotoUrl ?? crossSeedlingMainPhoto(cross));
  return `
    <div class="cross-preview-flow">
      <article class="cross-actor">
        ${crossActorThumb(varietyImages(mother)[0], mother?.name || "Matka")}
        <small>Matka</small>
        <strong>${escapeHtml(mother?.name || "Vyber odrůdu")}</strong>
      </article>
      <span class="cross-preview-symbol">x</span>
      <article class="cross-actor">
        ${crossActorThumb(varietyImages(pollen)[0], pollen?.name || "Pyl")}
        <small>Pyl</small>
        <strong>${escapeHtml(pollen?.name || "Vyber odrůdu")}</strong>
      </article>
      <span class="cross-preview-symbol">=</span>
      <article class="cross-actor accent">
        ${crossActorThumb(seedlingPhotoUrl, seedlingName)}
        <small>Semenáč</small>
        <strong>${escapeHtml(seedlingName)}</strong>
      </article>
    </div>
  `;
}

function crossSeedlingGalleryMarkup(cross) {
  const images = crossSeedlingImages(cross);
  if (images.length <= 1) return "";
  return `<section class="detail-section cross-seedling-gallery-section">
    <div class="panel-heading">
      <h2>Fotky semenáče</h2>
      <strong>${images.length}</strong>
    </div>
    <div class="cross-seedling-gallery">
      ${images
        .map((image) => `<span class="cross-seedling-gallery-thumb ${image === crossSeedlingMainPhoto(cross) ? "active" : ""}">
          ${photoImageMarkup(image, cross.seedlingName || "Semenáč", "", 'loading="lazy"')}
        </span>`)
        .join("")}
    </div>
  </section>`;
}

function renderCrosses() {
  const crosses = filteredCrosses();
  renderCrossesScene();
  if (!state.selectedCrossId && crosses[0]) state.selectedCrossId = crosses[0].id;
  if (state.selectedCrossId && !state.data.crosses.some((cross) => cross.id === state.selectedCrossId)) {
    state.selectedCrossId = crosses[0]?.id || null;
  }
  if (els.crossStageFilter) els.crossStageFilter.value = state.crossStageFilter;
  if (els.crossResultFilter) els.crossResultFilter.value = state.crossResultFilter;

  els.crossesTable.innerHTML = crosses.length
    ? crosses.map((cross) => crossCatalogCardMarkup(cross)).join("")
    : emptyState("Zatím žádné křížení.");

  els.crossesTable.querySelectorAll("[data-cross-row]").forEach((row) => {
    const openCross = () => {
      state.selectedCrossId = row.dataset.crossRow;
      els.crossesTable.querySelectorAll("[data-cross-row]").forEach((item) => {
        item.classList.toggle("is-selected", item === row);
      });
      renderCrossDetail();
    };
    row.addEventListener("click", (event) => {
      if (shouldIgnoreRowOpen(event.target)) return;
      openCross();
    });
    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (shouldIgnoreRowOpen(event.target)) return;
      event.preventDefault();
      openCross();
    });
  });
  els.crossesTable.querySelectorAll("[data-edit-cross]").forEach((button) => {
    button.addEventListener("click", () => openCrossDialog(button.dataset.editCross));
  });
  els.crossesTable.querySelectorAll("[data-download-cross-card]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      downloadCrossCard(button.dataset.downloadCrossCard);
    });
  });
  els.crossesTable.querySelectorAll("[data-delete-cross]").forEach((button) => {
    button.addEventListener("click", () => deleteCross(button.dataset.deleteCross));
  });
  renderCrossDetail();
  hydrateLocalPhotoImages(els.crossesTable);
}

function crossCatalogCardMarkup(cross) {
  const safeId = escapeHtml(cross.id);
  const lineage = crossLineageLabel(cross);
  const seedlingName = clean(cross.seedlingName);
  const title = seedlingName || lineage;
  const seedlingPhoto = crossSeedlingMainPhoto(cross);
  const note = crossCatalogPreviewNote(cross);
  const visual = seedlingPhoto
    ? photoImageMarkup(seedlingPhoto, title, "cross-catalog-card-photo", 'loading="lazy"')
    : `<div class="cross-catalog-card-placeholder">
        <span class="cross-catalog-card-placeholder-mark">${escapeHtml(varietyInitials(title))}</span>
      </div>`;

  return `<article class="cross-catalog-card ${crossRowToneClass(cross)}${cross.id === state.selectedCrossId ? " is-selected" : ""}" data-cross-row="${safeId}" tabindex="0" title="Otevřít křížení">
    <div class="cross-catalog-card-visual">
      ${visual}
    </div>
    <div class="cross-catalog-card-copy">
      <div class="cross-catalog-card-heading">
        <h3 class="cross-catalog-card-name">${escapeHtml(title)}</h3>
      </div>
      ${seedlingName ? `<p class="cross-catalog-card-lineage">${escapeHtml(lineage)}</p>` : ""}
      ${note ? `<p class="cross-catalog-card-note">${escapeHtml(note)}</p>` : ""}
      <div class="cross-catalog-card-tags">
        ${clean(cross.resultRating) ? crossResultPill(cross.resultRating) : ""}
      </div>
      <div class="cross-catalog-card-footer">
        <span class="cross-catalog-card-actions">
          <button class="mini-button" type="button" title="Upravit" data-edit-cross="${safeId}">✎</button>
          <button class="mini-button" type="button" title="Smazat" data-delete-cross="${safeId}">×</button>
        </span>
      </div>
    </div>
  </article>`;
}

function renderCrossDetail() {
  const cross = findCross(state.selectedCrossId) || filteredCrosses()[0];
  if (!cross) {
    els.crossDetail.innerHTML = emptyState("Vyber křížení nebo založ nové.");
    return;
  }
  state.selectedCrossId = cross.id;
  const mother = findVariety(cross.motherVarietyId);
  const pollen = findVariety(cross.pollenVarietyId);
  const createdVariety = crossSeedlingVariety(cross);

  els.crossDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${escapeHtml(crossLineageLabel(cross))}</h2>
        <p class="fb-name">${escapeHtml(formatDate(cross.pollinatedAt))} · ${escapeHtml(crossStageLabels[cross.stage] || "")}</p>
        ${cross.note ? `<p class="detail-note-text">${escapeHtml(cross.note)}</p>` : ""}
      </div>
      <div class="detail-actions">
        <button class="button ghost" type="button" data-download-cross-detail="${escapeHtml(cross.id)}">Stáhnout obrázek</button>
        <button class="button primary" type="button" data-edit-cross-detail="${escapeHtml(cross.id)}">Upravit</button>
        ${createdVariety ? `<button class="button ghost" type="button" data-open-cross-variety="${escapeHtml(createdVariety.id)}">Odrůda</button>` : ""}
      </div>
    </div>
    <section class="detail-section">
      <div class="history-summary">
        <article><span>Fáze</span><strong>${escapeHtml(crossStageLabels[cross.stage] || "—")}</strong></article>
        <article><span>Výsledek</span><strong>${escapeHtml(crossResultLabels[cross.resultRating] || "Bez hodnocení")}</strong></article>
        <article><span>Semenáč</span><strong>${escapeHtml(clean(cross.seedlingName) || "Zatím ne")}</strong></article>
      </div>
    </section>
    <section class="detail-section cross-detail-visual">
      ${buildCrossPreviewMarkup(cross, { mother, pollen })}
    </section>
    ${crossSeedlingGalleryMarkup(cross)}
    <section class="detail-section">
      <div class="detail-lines">
        ${detailLine("Matka", mother?.name || "—")}
        ${detailLine("Pyl", pollen?.name || "—")}
        ${detailLine("Hodnocení", crossResultLabels[cross.resultRating] || "Bez hodnocení")}
      </div>
    </section>
  `;

  els.crossDetail.querySelector("[data-download-cross-detail]")?.addEventListener("click", () => downloadCrossCard(cross.id));
  els.crossDetail.querySelector("[data-edit-cross-detail]")?.addEventListener("click", () => openCrossDialog(cross.id));
  els.crossDetail.querySelector("[data-open-cross-variety]")?.addEventListener("click", () => {
    openVarietyDetailDialog(els.crossDetail.querySelector("[data-open-cross-variety]").dataset.openCrossVariety);
  });
  hydrateLocalPhotoImages(els.crossDetail);
}

function renderOffers() {
  const offers = filteredOffers();
  renderOffersScene();
  if (!state.selectedOfferId && offers[0]) state.selectedOfferId = offers[0].id;
  if (state.selectedOfferId && !offers.some((offer) => offer.id === state.selectedOfferId)) {
    state.selectedOfferId = offers[0]?.id || null;
  }

  const groups = splitOffersByType(offers);
  const renderOfferRows = (items, heading) => {
    if (!items.length) return "";
    return `
      <tr class="table-section-row"><td colspan="5">${escapeHtml(heading)}</td></tr>
      ${items.map((offer) => {
        const confirmed = offerConfirmedCount(offer);
        const alternates = offerAlternateCount(offer);
        const available = offerAvailableCount(offer);
        return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
          <td class="offer-main-cell">
            <div class="offer-mobile-card">
              <strong>${escapeHtml(offer.title)}</strong>
              <small>${formatDate(offer.date)} · ${escapeHtml(offerTypeLabel(offer))}</small>
              ${isRestOffer(offer) ? '<span class="pill warning">Resty/poznámky</span>' : ""}
              <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
              <div class="offer-mobile-stats">
                <span><small>Položky</small><b>${offer.items.length}</b></span>
                <span><small>Volné</small><b>${available}</b></span>
                <span><small>Rezervace</small><b>${confirmed}</b></span>
              </div>
            </div>
            <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)}${isRestOffer(offer) ? ' <span class="pill warning">Resty/poznámky</span>' : ""}</span>
            <span class="cell-sub offer-desktop-sub">${formatDate(offer.date)} · ${escapeHtml(offerTypeLabel(offer))}</span>
          </td>
          <td><span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span></td>
          <td>${offer.items.length}</td>
          <td>
            <span class="cell-main">${confirmed}</span>
            <span class="cell-sub">${[`Volné ${available}`, alternates ? `Náhradníci ${alternates}` : ""].filter(Boolean).join(" · ")}</span>
          </td>
          <td>
            <span class="row-actions">
              <button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">✎</button>
              <button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">×</button>
            </span>
          </td>
        </tr>`;
      }).join("")}
    `;
  };

  els.offersTable.innerHTML = offers.length
    ? [
        renderOfferRows(groups.offers, "Nabídky"),
        renderOfferRows(groups.rests, "Resty/poznámky"),
      ].filter(Boolean).join("")
    : `<tr><td colspan="5">${emptyState("Žádná nabídka.")}</td></tr>`;

  els.offersTable.querySelectorAll("[data-offer-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.selectedOfferId = row.dataset.offerRow;
      renderOffers();
    });
  });
  els.offersTable.querySelectorAll("[data-edit-offer]").forEach((button) => {
    button.addEventListener("click", () => openOfferDialog(button.dataset.editOffer));
  });
  els.offersTable.querySelectorAll("[data-delete-offer]").forEach((button) => {
    button.addEventListener("click", () => deleteOffer(button.dataset.deleteOffer));
  });
  renderOfferDetail();
}

function renderOfferDetail() {
  const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
  if (!offer) {
    els.offerDetail.innerHTML = emptyState("Vyber nabídku nebo založ novou.");
    return;
  }
  state.selectedOfferId = offer.id;
  const items = sortedOfferItems(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty/poznámky" : "Upravit nabídku";
  const toggleTypeLabel = isRestOffer(offer) ? "Přesunout do nabídek" : "Přesunout do restů/poznámek";

  els.offerDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${escapeHtml(offer.title)}</h2>
        <div class="pills">
          <span class="pill">${escapeHtml(offerTypeLabel(offer))}</span>
          <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
        </div>
        <p class="fb-name">${formatDate(offer.date)}</p>
        ${offer.note ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : ""}
      </div>
      <div class="detail-actions">
        <button class="button ghost" type="button" data-edit-offer="${offer.id}">${editLabel}</button>
        <button class="button ghost" type="button" data-toggle-offer-type="${offer.id}">${toggleTypeLabel}</button>
        <button class="button primary" type="button" data-add-offer-item="${offer.id}">Přidat odřezek</button>
        <button class="button ghost" type="button" data-facebook-offer="${offer.id}">Facebook</button>
        <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvořit objednávky</button>
      </div>
    </div>
    <section class="detail-section">
      <div class="history-summary">
        <article><span>Položky</span><strong>${items.length}</strong></article>
        <article><span>Potvrzeno</span><strong>${offerConfirmedCount(offer)}</strong></article>
        <article><span>Náhradníci</span><strong>${offerAlternateCount(offer)}</strong></article>
        <article><span>Hodnota</span><strong>${escapeHtml(offerTotalText(offer))}</strong></article>
      </div>
    </section>
    <section class="detail-section">
      <div class="stack-list">
        ${items.length ? items.map((item) => renderOfferItem(offer, item)).join("") : emptyState("Zatím bez odřezků.")}
      </div>
    </section>
  `;

  els.offerDetail.querySelector("[data-edit-offer]").addEventListener("click", () => openOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-toggle-offer-type]").addEventListener("click", () => {
    setOfferType(offer.id, isRestOffer(offer) ? "offer" : "rests");
  });
  els.offerDetail.querySelector("[data-add-offer-item]").addEventListener("click", () => openOfferItemDialog(offer.id));
  els.offerDetail.querySelector("[data-facebook-offer]").addEventListener("click", () => openFacebookOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-create-offer-orders]").addEventListener("click", () => createOrdersFromOffer(offer.id));
  els.offerDetail.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemDialog(offer.id, button.dataset.editOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(offer.id, button.dataset.deleteOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-add-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationDialog(offer.id, button.dataset.addReservation, null, {
      status: button.dataset.addReservationStatus || "",
    }));
  });
  els.offerDetail.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationDialog(offer.id, button.dataset.itemId, button.dataset.editReservation));
  });
  els.offerDetail.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(offer.id, button.dataset.itemId, button.dataset.deleteReservation));
  });
  hydrateLocalPhotoImages(els.offerDetail);
}

(function finalizeDesktopRestMode() {
  function looksLikeLegacyRestOffer(offer = {}) {
    const title = clean(offer.title);
    if (!/^Resty(?:\/pozn.*)?/i.test(title)) return false;
    return Boolean(clean(offer.restCustomerId) || clean(offer.restVarietyId) || clean(offer.restVarietyName) || clean(offer.note));
  }

  function desktopRestVarietyNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findVariety(clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function desktopRestCustomerText(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez z\u00e1kazn\u00edka";
  }

  function desktopRestCustomerOptions(selectedId = "") {
    return [`<option value="">Bez z\u00e1kazn\u00edka</option>`].concat(
      [...state.data.customers]
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(selectedId) === clean(customer.id) ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
    ).join("");
  }

  function desktopRestNotePreview(offer = {}, max = 72) {
    return clean(offer.note) ? `<small>${escapeHtml(shortRestText(offer.note, max))}</small>` : "";
  }

  function syncDesktopRestDate(form) {
    if (!form || !isRestOffer({ type: form.elements.type?.value, title: form.elements.title?.value, note: form.elements.note?.value })) return;
    const nextDate = clean(form.elements.date?.value) || toDateInput(new Date());
    form.elements.title.value = defaultOfferTitle("rests", nextDate);
    form.elements.facebookPublishDate.value = nextDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "p\u0159ipraven\u00e1";
  }

  const previousOpenOfferDialog = openOfferDialog;
  const previousSaveOfferFromForm = saveOfferFromForm;
  const previousRenderOfferDetail = renderOfferDetail;

  isRestOffer = function isRestOfferFinal(offer) {
    return normalizeOfferType(offer?.type) === "rests" || looksLikeLegacyRestOffer(offer);
  };

  offerTypeLabel = function offerTypeLabelFinal(offerOrType) {
    if (typeof offerOrType === "string") return normalizeOfferType(offerOrType) === "rests" ? "Resty" : "Nab\u00eddka";
    return isRestOffer(offerOrType) ? "Resty" : "Nab\u00eddka";
  };

  restOfferVarietyLabel = function restOfferVarietyLabelFinal(offer = {}) {
    return desktopRestVarietyNames(offer).join(", ");
  };

  restOfferSummaryText = function restOfferSummaryTextFinal(offer = {}) {
    return [desktopRestCustomerText(offer), restOfferVarietyLabel(offer)].filter(Boolean).join(" \u00b7 ");
  };

  renderRestMetaPanel = function renderRestMetaPanelFinal(offer = {}) {
    if (!isRestOffer(offer)) return "";
    const names = desktopRestVarietyNames(offer);
    const meta = [
      { label: "Z\u00e1kazn\u00edk", value: desktopRestCustomerText(offer) },
      { label: names.length > 1 ? "Odr\u016fdy" : "Odr\u016fda", value: names.join(", ") },
    ].filter((entry) => clean(entry.value));
    if (!meta.length) return "";
    return `<section class="rest-meta-panel"><div class="rest-meta-grid">${meta.map((entry) => `<div class="rest-meta-item"><span>${escapeHtml(entry.label)}</span><strong>${escapeHtml(entry.value)}</strong></div>`).join("")}</div></section>`;
  };

  syncOfferRestFieldsVisibility = function syncOfferRestFieldsVisibilityFinal() {
    const form = els.offerForm;
    if (!form) return;
    const isRest = isRestOffer({ type: form.elements.type?.value, title: form.elements.title?.value, note: form.elements.note?.value });
    const restBlock = form.querySelector("[data-rest-offer-fields]");
    const titleField = form.elements.title?.closest("label");
    const dateField = form.elements.date?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const statusField = form.querySelector(".offer-status-field");
    const optionalDivider = form.querySelector(".form-divider");
    const noteField = form.elements.note?.closest("label");
    const setVisible = (node, visible) => {
      if (!node) return;
      node.hidden = false;
      node.style.display = visible ? "" : "none";
    };
    setVisible(titleField, !isRest);
    setVisible(dateField, true);
    setVisible(facebookDateField, !isRest);
    setVisible(facebookTimeField, !isRest);
    setVisible(statusField, !isRest);
    setVisible(optionalDivider, !isRest);
    setVisible(noteField, true);
    if (restBlock) {
      restBlock.hidden = !isRest;
      restBlock.style.display = isRest ? "" : "none";
    }
    if (isRest) {
      syncDesktopRestDate(form);
      setupRestVarietyPickerForOfferForm(form, form.elements.restVarietyName?.value || "");
    }
  };

  openOfferDialog = function openOfferDialogFinal(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const initialIsRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults.type) === "rests";
    if (!initialIsRest) return previousOpenOfferDialog(id, defaults);
    const form = els.offerForm;
    const initialDate = clean(offer?.date || defaults.date) || toDateInput(new Date());
    const names = desktopRestVarietyNames(offer);
    const singleVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    els.offerDialogTitle.textContent = offer ? "Upravit resty" : "Nov\u00e9 resty";
    form.reset();
    form.elements.id.value = offer?.id || "";
    form.elements.type.value = "rests";
    form.elements.title.value = defaultOfferTitle("rests", initialDate);
    form.elements.date.value = initialDate;
    form.elements.facebookPublishDate.value = initialDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "p\u0159ipraven\u00e1";
    form.elements.note.value = offer?.note || "";
    form.elements.restCustomerId.innerHTML = desktopRestCustomerOptions(offer?.restCustomerId || defaults.restCustomerId || "");
    form.elements.restCustomerId.value = clean(offer?.restCustomerId || defaults.restCustomerId);
    form.elements.restVarietyId.value = clean(singleVariety?.id || offer?.restVarietyId);
    form.elements.restVarietyName.value = names.join("\n");
    syncOfferStatusToggle();
    setupRestVarietyPickerForOfferForm(form, names.join("\n"));
    syncOfferRestFieldsVisibility();
    const onDateChange = () => syncOfferRestFieldsVisibility();
    form.elements.date.oninput = onDateChange;
    form.elements.date.onchange = onDateChange;
    showDialog(els.offerDialog);
  };

  saveOfferFromForm = function saveOfferFromFormFinal() {
    const formEl = els.offerForm;
    const shouldSaveAsRest = isRestOffer({
      type: formEl?.elements?.type?.value,
      title: formEl?.elements?.title?.value,
      restCustomerId: formEl?.elements?.restCustomerId?.value,
      restVarietyName: formEl?.elements?.restVarietyName?.value,
      note: formEl?.elements?.note?.value,
    });
    if (!shouldSaveAsRest) return previousSaveOfferFromForm();
    if (!formEl.reportValidity()) return;
    const form = new FormData(formEl);
    const id = form.get("id") || uid();
    const existing = findOffer(id);
    const now = new Date().toISOString();
    const nextDate = clean(form.get("date")) || toDateInput(new Date());
    const names = restFormVarietyNames(form.get("restVarietyName"));
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    const offer = normalizeOffer({
      ...existing,
      id,
      title: defaultOfferTitle("rests", nextDate),
      date: nextDate,
      facebookPublishDate: nextDate,
      facebookPublishTime: "20:00",
      type: "rests",
      status: "p\u0159ipraven\u00e1",
      note: clean(form.get("note")),
      restCustomerId: clean(form.get("restCustomerId")),
      restVarietyId: clean(matchedVariety?.id),
      restVarietyName: names.join("\n"),
      items: existing?.items || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, offer);
    else state.data.offers.push(offer);
    state.selectedOfferId = offer.id;
    saveData();
    renderAll();
    els.offerDialog.close();
    toast("Resty ulo\u017eeny.");
  };

  renderOffers = function renderOffersFinal() {
    const offers = filteredOffers();
    if (!state.selectedOfferId && offers[0]) state.selectedOfferId = offers[0].id;
    if (state.selectedOfferId && !offers.some((offer) => offer.id === state.selectedOfferId)) {
      state.selectedOfferId = offers[0]?.id || null;
    }

    const groups = splitOffersByType(offers);
    const renderOfferRows = (items, heading, groupType) => {
      if (!items.length) return "";
      return `
        <tr class="table-section-row"><td colspan="5">${escapeHtml(heading)}</td></tr>
        ${items.map((offer) => {
          if (groupType === "rests") {
            const restNames = desktopRestVarietyNames(offer);
            const restLabel = restNames.length ? shortRestText(restNames.join(", "), 72) : "";
            const customerText = desktopRestCustomerText(offer);
            return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
              <td class="offer-main-cell">
                <div class="offer-mobile-card">
                  <strong>${escapeHtml(offer.title)}</strong>
                  <small>${escapeHtml([formatDate(offer.date), customerText].join(" \u00b7 "))}</small>
                  <span class="pill warning">Resty</span>
                  ${restLabel ? `<small>${escapeHtml(restLabel)}</small>` : ""}
                  ${desktopRestNotePreview(offer, 62)}
                </div>
                <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)} <span class="pill warning">Resty</span></span>
                <span class="cell-sub offer-desktop-sub">${escapeHtml([formatDate(offer.date), customerText].join(" \u00b7 "))}</span>
                ${restLabel ? `<span class="cell-sub">${escapeHtml(restLabel)}</span>` : ""}
                ${desktopRestNotePreview(offer, 88)}
              </td>
              <td><span class="cell-sub">-</span></td>
              <td>
                <span class="cell-main">${restNames.length || "\u2014"}</span>
                ${restNames.length ? `<span class="cell-sub">odrůd</span>` : ""}
              </td>
              <td>
                <span class="cell-main">${escapeHtml(customerText)}</span>
                <span class="cell-sub">${escapeHtml(clean(offer.note) ? shortRestText(offer.note, 48) : "Bez rezervac\u00ed")}</span>
              </td>
              <td>
                <span class="row-actions">
                  <button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">\u270e</button>
                  <button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">\u00d7</button>
                </span>
              </td>
            </tr>`;
          }

          const confirmed = offerConfirmedCount(offer);
          const alternates = offerAlternateCount(offer);
          const available = offerAvailableCount(offer);
          const itemCount = Array.isArray(offer.items) ? offer.items.length : 0;
          const metaLine = [formatDate(offer.date), offerTypeLabel(offer)].filter(Boolean).join(" \u00b7 ");
          const statLine = [`Voln\u00e9 ${available}`, alternates ? `N\u00e1hradn\u00edci ${alternates}` : ""].filter(Boolean).join(" \u00b7 ");
          return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
            <td class="offer-main-cell">
              <div class="offer-mobile-card">
                <strong>${escapeHtml(offer.title)}</strong>
                <small>${escapeHtml(metaLine)}</small>
                <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
                <div class="offer-mobile-stats">
                  <span><small>Polo\u017eky</small><b>${itemCount}</b></span>
                  <span><small>Voln\u00e9</small><b>${available}</b></span>
                  <span><small>Rezervace</small><b>${confirmed}</b></span>
                </div>
              </div>
              <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)}</span>
              <span class="cell-sub offer-desktop-sub">${escapeHtml(metaLine)}</span>
            </td>
            <td><span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span></td>
            <td>${itemCount}</td>
            <td>
              <span class="cell-main">${confirmed}</span>
              <span class="cell-sub">${escapeHtml(statLine)}</span>
            </td>
            <td>
              <span class="row-actions">
                <button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">\u270e</button>
                <button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">\u00d7</button>
              </span>
            </td>
          </tr>`;
        }).join("")}
      `;
    };

    els.offersTable.innerHTML = offers.length
      ? [
          renderOfferRows(groups.offers, "Nab\u00eddky", "offers"),
          renderOfferRows(groups.rests, "Resty", "rests"),
        ].filter(Boolean).join("")
      : `<tr><td colspan="5">${emptyState("\u017d\u00e1dn\u00e1 nab\u00eddka.")}</td></tr>`;

    els.offersTable.querySelectorAll("[data-offer-row]").forEach((row) => {
      row.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        state.selectedOfferId = row.dataset.offerRow;
        renderOffers();
      });
    });
    els.offersTable.querySelectorAll("[data-edit-offer]").forEach((button) => {
      button.addEventListener("click", () => openOfferDialog(button.dataset.editOffer));
    });
    els.offersTable.querySelectorAll("[data-delete-offer]").forEach((button) => {
      button.addEventListener("click", () => deleteOffer(button.dataset.deleteOffer));
    });
    renderOfferDetail();
  };

  renderOfferDetail = function renderOfferDetailFinal() {
    const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
    if (!offer || !isRestOffer(offer)) return previousRenderOfferDetail();
    state.selectedOfferId = offer.id;
    const restNames = desktopRestVarietyNames(offer);
    els.offerDetail.innerHTML = `
      <div class="detail-header">
        <div>
          <h2>${escapeHtml(offer.title)}</h2>
          <div class="pills">
            <span class="pill warning">Resty</span>
          </div>
          <p class="fb-name">${formatDate(offer.date)}</p>
          ${renderRestMetaPanel(offer)}
          ${restNames.length ? `<div class="pills">${restNames.map((name) => `<span class="pill">${escapeHtml(name)}</span>`).join("")}</div>` : ""}
          ${clean(offer.note) ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : `<p class="detail-note-text">Bez pozn\u00e1mky.</p>`}
        </div>
        <div class="detail-actions">
          <button class="button ghost" type="button" data-edit-offer="${offer.id}">Upravit resty</button>
          <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvo\u0159it objedn\u00e1vku</button>
        </div>
      </div>
    `;
    els.offerDetail.querySelector("[data-edit-offer]")?.addEventListener("click", () => openOfferDialog(offer.id));
    els.offerDetail.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(offer.id));
  };
})();
(() => {
  const previousOpenOfferDialogFinal = openOfferDialog;
  const previousDesktopRestOpenFinal = typeof window.openDesktopRestOfferDialog === "function"
    ? window.openDesktopRestOfferDialog
    : null;

  function setImportant(node, property, value) {
    if (!node) return;
    if (value === null) node.style.removeProperty(property);
    else node.style.setProperty(property, value, "important");
  }

  function clearDesktopRestSimpleLayout() {
    const form = els.offerForm;
    if (!form) return;
    const titleField = form.elements.title?.closest("label");
    const dateField = form.elements.date?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const restGrid = form.querySelector("[data-rest-offer-fields]");
    const statusField = form.querySelector(".offer-status-field");
    const divider = form.querySelector(".form-divider");
    const noteField = form.elements.note?.closest("label");
    const addRow = form.querySelector(".rest-variety-picker-row");
    const list = form.querySelector("[data-rest-variety-list]");
    const restCustomerField = form.elements.restCustomerId?.closest("label");
    const restVarietyField = form.querySelector('[name="restVarietyPicker"]')?.closest("label")
      || form.querySelector('[name="restVarietyName"]')?.closest("label");

    form.classList.remove("rest-dialog-simple-final");
    form.dataset.restMode = normalizeOfferType(form.elements.type?.value) === "rests" ? "true" : "false";
    setImportant(form, "grid-template-columns", null);

    [titleField, dateField, facebookDateField, facebookTimeField, restGrid, statusField, divider, noteField, addRow, list, restCustomerField, restVarietyField].forEach((node) => {
      setImportant(node, "display", null);
      setImportant(node, "grid-column", null);
      setImportant(node, "grid-template-columns", null);
    });

    if (titleField) titleField.hidden = false;
    if (facebookDateField) facebookDateField.hidden = false;
    if (facebookTimeField) facebookTimeField.hidden = false;
    if (statusField) statusField.hidden = false;
    if (divider) divider.hidden = false;
    if (typeof syncOfferRestFieldsVisibility === "function") syncOfferRestFieldsVisibility();
  }

  function applyDesktopRestSimpleLayoutFinal() {
    const form = els.offerForm;
    if (!form) return;
    const titleField = form.elements.title?.closest("label");
    const dateField = form.elements.date?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const restGrid = form.querySelector("[data-rest-offer-fields]");
    const statusField = form.querySelector(".offer-status-field");
    const divider = form.querySelector(".form-divider");
    const noteField = form.elements.note?.closest("label");
    const addRow = form.querySelector(".rest-variety-picker-row");
    const list = form.querySelector("[data-rest-variety-list]");
    const restCustomerField = form.elements.restCustomerId?.closest("label");
    const restVarietyField = form.querySelector('[name="restVarietyPicker"]')?.closest("label")
      || form.querySelector('[name="restVarietyName"]')?.closest("label");

    form.classList.add("rest-dialog-simple-final");
    form.dataset.restMode = "true";
    setImportant(form, "grid-template-columns", "minmax(0, 1fr)");

    [titleField, facebookDateField, facebookTimeField, statusField, divider].forEach((node) => {
      if (!node) return;
      node.hidden = true;
      setImportant(node, "display", "none");
    });

    if (restGrid) {
      restGrid.hidden = false;
      setImportant(restGrid, "display", "grid");
      setImportant(restGrid, "grid-template-columns", "minmax(0, 1fr)");
      setImportant(restGrid, "grid-column", "1 / -1");
    }

    [dateField, restCustomerField, restVarietyField, noteField, addRow, list].forEach((node) => {
      if (!node) return;
      node.hidden = false;
      setImportant(node, "display", null);
      setImportant(node, "grid-column", "1 / -1");
    });

    if (restCustomerField) {
      const label = restCustomerField.querySelector("span");
      if (label) label.textContent = "Z\u00e1kazn\u00edk";
    }
    if (restVarietyField) {
      const label = restVarietyField.querySelector("span");
      if (label) label.textContent = "Odr\u016fdy";
    }
  }

  function openDesktopRestOfferDialogLast(id = null, defaults = {}) {
    if (previousDesktopRestOpenFinal) previousDesktopRestOpenFinal(id, defaults);
    else previousOpenOfferDialogFinal(id, { ...defaults, type: "rests" });
    if (typeof setupRestVarietyPickerForOfferForm === "function") {
      setupRestVarietyPickerForOfferForm(els.offerForm, els.offerForm?.elements?.restVarietyName?.value || "");
    }
    applyDesktopRestSimpleLayoutFinal();
  }

  window.openDesktopRestOfferDialog = openDesktopRestOfferDialogLast;

  openOfferDialog = function openOfferDialogLast(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const isRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    if (isRest) return openDesktopRestOfferDialogLast(id, defaults);
    const result = previousOpenOfferDialogFinal(id, defaults);
    clearDesktopRestSimpleLayout();
    return result;
  };

  [document.querySelector("#addRestOfferTopBtn"), document.querySelector("#addRestOfferBtn")].forEach((button) => {
    if (!button) return;
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDesktopRestOfferDialogLast();
    };
  });
})();
(() => {
  function setImportantStyle(node, property, value) {
    if (!node) return;
    if (!value) node.style.removeProperty(property);
    else node.style.setProperty(property, value, "important");
  }

  function applyDesktopRestSimpleLayout(isRest) {
    const form = els.offerForm;
    if (!form) return;

    const titleField = form.elements.title?.closest("label");
    const dateField = form.elements.date?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const restCustomerField = form.elements.restCustomerId?.closest("label");
    const restVarietyField = form.querySelector('[name="restVarietyPicker"]')?.closest("label")
      || form.querySelector('[name="restVarietyName"]')?.closest("label");
    const statusField = form.querySelector(".offer-status-field");
    const divider = form.querySelector(".form-divider");
    const noteField = form.elements.note?.closest("label");
    const addRow = form.querySelector(".rest-variety-picker-row");
    const list = form.querySelector("[data-rest-variety-list]");

    form.classList.toggle("rest-dialog-simple", Boolean(isRest));
    setImportantStyle(form, "grid-template-columns", isRest ? "minmax(0, 1fr)" : "");

    [titleField, facebookDateField, facebookTimeField, statusField, divider].forEach((node) => {
      setImportantStyle(node, "display", isRest ? "none" : "");
    });

    [dateField, restCustomerField, restVarietyField, noteField, addRow, list].forEach((node) => {
      setImportantStyle(node, "grid-column", isRest ? "1 / -1" : "");
      if (node) setImportantStyle(node, "display", "");
    });

    if (restCustomerField) {
      const label = restCustomerField.querySelector("span");
      if (label && isRest) label.textContent = "Zákazník";
    }
    if (restVarietyField) {
      const label = restVarietyField.querySelector("span");
      if (label && isRest) label.textContent = "Odrůdy";
    }
  }

  if (typeof window.openDesktopRestOfferDialog === "function") {
    const previousOpenDesktopRestOfferDialog = window.openDesktopRestOfferDialog;
    window.openDesktopRestOfferDialog = function openDesktopRestOfferDialogSimple(...args) {
      const result = previousOpenDesktopRestOfferDialog(...args);
      applyDesktopRestSimpleLayout(true);
      return result;
    };
  }

  const previousOpenOfferDialog = openOfferDialog;
  openOfferDialog = function openOfferDialogDesktopRestSimple(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const isRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    const result = previousOpenOfferDialog(id, defaults);
    applyDesktopRestSimpleLayout(isRest);
    return result;
  };
})();
(() => {
  window.__akRestPatchVersion = "20260531-73";
  const baseOpenOfferDialog = openOfferDialog;
  const baseSaveOfferFromForm = saveOfferFromForm;

  function renderRestSelectionEof(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>×</span></button>`).join("")
      : '<div class="rest-variety-empty">Zatím bez odrůd.</div>';
  }

  function desktopRestCustomerOptionsEof(selectedId = "") {
    return ['<option value="">Bez zákazníka</option>']
      .concat(
        [...(state.data.customers || [])]
          .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }))
          .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(selectedId) === clean(customer.id) ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`),
      )
      .join("");
  }

  function ensureDesktopRestPickerEof(form, initialValue = "") {
    const restGrid = form.querySelector("[data-rest-offer-fields]");
    if (!restGrid) return null;
    let varietyLabel = restGrid.querySelector('[name="restVarietyPicker"]')?.closest("label")
      || restGrid.querySelector('[name="restVarietyName"]')?.closest("label");
    if (!varietyLabel) {
      varietyLabel = document.createElement("label");
      varietyLabel.innerHTML = '<span>Odrůdy</span><select name="restVarietyPicker"></select>';
      restGrid.appendChild(varietyLabel);
    } else {
      const title = varietyLabel.querySelector("span");
      if (title) title.textContent = "Odrůdy";
    }

    let picker = varietyLabel.querySelector('[name="restVarietyPicker"]');
    if (!picker || picker.tagName !== "SELECT") {
      const select = document.createElement("select");
      select.name = "restVarietyPicker";
      varietyLabel.querySelector('[name="restVarietyName"], [name="restVarietyPicker"]')?.replaceWith(select);
      picker = select;
    }

    let hidden = form.querySelector('textarea[name="restVarietyName"]');
    if (!hidden) {
      hidden = document.createElement("textarea");
      hidden.name = "restVarietyName";
      hidden.hidden = true;
      hidden.setAttribute("aria-hidden", "true");
      restGrid.appendChild(hidden);
    }

    let actionRow = form.querySelector(".rest-variety-picker-row");
    if (!actionRow) {
      actionRow = document.createElement("div");
      actionRow.className = "wide rest-variety-picker-row";
      actionRow.innerHTML = '<button class="button ghost" type="button" data-rest-variety-add>Přidat odrůdu</button>';
      restGrid.after(actionRow);
    }

    let list = form.querySelector("[data-rest-variety-list]");
    if (!list) {
      list = document.createElement("div");
      list.className = "wide rest-variety-selection";
      list.dataset.restVarietyList = "";
      actionRow.after(list);
    }

    form.__restVarietyNames = restFormVarietyNames(initialValue || hidden.value);
    const addButton = actionRow.querySelector("[data-rest-variety-add]");

    const renderPicker = () => {
      const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
      const previousValue = clean(picker.value);
      const options = [...(state.data.varieties || [])]
        .map((variety) => clean(variety.name))
        .filter(Boolean)
        .filter((name) => !selected.has(normalize(name)))
        .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }));
      picker.innerHTML = ['<option value="">Vyber odrůdu</option>']
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
    return { picker, hidden, list };
  }

  function toggleDesktopRestFieldsEof(form, isRest) {
    const titleField = form.elements.title?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const statusField = form.querySelector(".offer-status-field");
    const optionalDivider = form.querySelector(".form-divider");
    const restGrid = form.querySelector("[data-rest-offer-fields]");
    if (titleField) titleField.hidden = Boolean(isRest);
    if (facebookDateField) facebookDateField.hidden = Boolean(isRest);
    if (facebookTimeField) facebookTimeField.hidden = Boolean(isRest);
    if (statusField) statusField.hidden = Boolean(isRest);
    if (optionalDivider) optionalDivider.hidden = Boolean(isRest);
    if (restGrid) restGrid.hidden = !isRest;
  }

  window.openDesktopRestOfferDialog = function openDesktopRestOfferDialogEof(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const form = els.offerForm;
    if (!form) return;
    const initialDate = clean(offer?.date || defaults.date) || toDateInput(new Date());
    const names = restFormVarietyNames(offer?.restVarietyName);
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    els.offerDialogTitle.textContent = offer ? "Upravit resty" : "Nové resty";
    form.reset();
    form.dataset.restMode = "true";
    form.elements.id.value = offer?.id || "";
    form.elements.type.value = "rests";
    form.elements.title.value = defaultOfferTitle("rests", initialDate);
    form.elements.date.value = initialDate;
    form.elements.facebookPublishDate.value = initialDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "připravená";
    form.elements.note.value = offer?.note || "";
    form.elements.restCustomerId.innerHTML = desktopRestCustomerOptionsEof(offer?.restCustomerId || defaults.restCustomerId || "");
    form.elements.restCustomerId.value = clean(offer?.restCustomerId || defaults.restCustomerId);
    form.elements.restVarietyId.value = clean(matchedVariety?.id || offer?.restVarietyId);
    toggleDesktopRestFieldsEof(form, true);
    ensureDesktopRestPickerEof(form, names.join("\n"));
    showDialog(els.offerDialog);
  };

  openOfferDialog = function openOfferDialogRestEof(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const isRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    if (isRest) return window.openDesktopRestOfferDialog(id, defaults);
    if (els.offerForm) {
      els.offerForm.dataset.restMode = "false";
      toggleDesktopRestFieldsEof(els.offerForm, false);
    }
    return baseOpenOfferDialog(id, defaults);
  };

  saveOfferFromForm = function saveOfferFromFormRestEof() {
    const formEl = els.offerForm;
    const isRest = normalizeOfferType(formEl?.elements?.type?.value) === "rests" || formEl?.dataset?.restMode === "true";
    if (!isRest) return baseSaveOfferFromForm();
    if (!formEl?.reportValidity()) return;
    const form = new FormData(formEl);
    const existing = findOffer(clean(form.get("id")));
    const nextDate = clean(form.get("date")) || toDateInput(new Date());
    const names = restFormVarietyNames(form.get("restVarietyName"));
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    const now = new Date().toISOString();
    const offer = normalizeOffer({
      ...existing,
      id: clean(form.get("id")) || uid(),
      title: defaultOfferTitle("rests", nextDate),
      date: nextDate,
      facebookPublishDate: nextDate,
      facebookPublishTime: "20:00",
      type: "rests",
      status: "připravená",
      note: clean(form.get("note")),
      restCustomerId: clean(form.get("restCustomerId")),
      restVarietyId: clean(matchedVariety?.id),
      restVarietyName: names.join("\n"),
      items: existing?.items || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, offer);
    else state.data.offers.push(offer);
    state.selectedOfferId = offer.id;
    saveData();
    renderAll();
    els.offerDialog.close();
    toast("Resty uloženy.");
  };

  function hardRebindRestButton(selector) {
    const current = document.querySelector(selector);
    if (!current) return;
    const next = current.cloneNode(true);
    next.removeAttribute("onclick");
    next.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.openDesktopRestOfferDialog();
    });
    current.replaceWith(next);
  }

  hardRebindRestButton("#addRestOfferTopBtn");
  hardRebindRestButton("#addRestOfferBtn");

  document.addEventListener("click", (event) => {
    const button = event.target.closest("#addRestOfferTopBtn, #addRestOfferBtn");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.openDesktopRestOfferDialog();
  }, true);
})();
(() => {
  function renderRestVarietySelectionSafe(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>×</span></button>`).join("")
      : '<div class="rest-variety-empty">Zatím bez odrůd.</div>';
  }

  if (typeof window.openDesktopRestOfferDialog === "function") {
    const previousOpenDesktopRestOfferDialog = window.openDesktopRestOfferDialog;
    window.openDesktopRestOfferDialog = function openDesktopRestOfferDialogSafe(...args) {
      const originalRender = typeof renderRestVarietySelection === "function" ? renderRestVarietySelection : null;
      renderRestVarietySelection = renderRestVarietySelectionSafe;
      try {
        return previousOpenDesktopRestOfferDialog(...args);
      } finally {
        if (originalRender) renderRestVarietySelection = originalRender;
      }
    };
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("#addRestOfferTopBtn, #addRestOfferBtn");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (typeof window.openDesktopRestOfferDialog === "function") {
      window.openDesktopRestOfferDialog();
    } else {
      openOfferDialog(null, { type: "rests" });
    }
  }, true);
})();
(() => {
  const previousOpenOfferDialog = openOfferDialog;
  const previousSaveOfferFromForm = saveOfferFromForm;

  function restCustomerOptionsFinal(selectedId = "") {
    return ['<option value="">Bez z\u00e1kazn\u00edka</option>']
      .concat(
        [...(state.data.customers || [])]
          .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }))
          .map((customer) => {
            const id = clean(customer.id);
            return `<option value="${escapeHtml(id)}" ${id === clean(selectedId) ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`;
          }),
      )
      .join("");
  }

  function toggleDesktopRestDialogMode(form, isRest) {
    if (!form) return;
    form.dataset.restMode = isRest ? "true" : "false";
    const titleField = form.elements.title?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const statusField = form.querySelector(".offer-status-field");
    const optionalDivider = form.querySelector(".form-divider");
    const restFields = form.querySelector("[data-rest-offer-fields]");
    if (titleField) titleField.hidden = Boolean(isRest);
    if (facebookDateField) facebookDateField.hidden = Boolean(isRest);
    if (facebookTimeField) facebookTimeField.hidden = Boolean(isRest);
    if (statusField) statusField.hidden = Boolean(isRest);
    if (optionalDivider) optionalDivider.hidden = Boolean(isRest);
    if (restFields) restFields.hidden = !isRest;
  }

  function ensureDesktopRestPickerFinal(form, initialValue = "") {
    if (!form) return;
    const restFields = form.querySelector("[data-rest-offer-fields]");
    if (!restFields) return;
    const varietyLabel = form.querySelector('[name="restVarietyPicker"]')?.closest("label")
      || form.querySelector('[name="restVarietyName"]')?.closest("label");
    if (!varietyLabel) return;
    const heading = varietyLabel.querySelector("span");
    if (heading) heading.textContent = "Odr\u016fdy";

    let picker = varietyLabel.querySelector('[name="restVarietyPicker"]');
    if (!picker || picker.tagName !== "SELECT") {
      const nextPicker = document.createElement("select");
      nextPicker.name = "restVarietyPicker";
      const current = varietyLabel.querySelector('[name="restVarietyPicker"], [name="restVarietyName"]');
      current?.replaceWith(nextPicker);
      picker = nextPicker;
    }

    let hidden = form.querySelector('textarea[name="restVarietyName"]');
    if (!hidden) {
      hidden = document.createElement("textarea");
      hidden.name = "restVarietyName";
      hidden.hidden = true;
      hidden.setAttribute("aria-hidden", "true");
      restFields.appendChild(hidden);
    }

    let actionRow = form.querySelector(".rest-variety-picker-row");
    if (!actionRow) {
      actionRow = document.createElement("div");
      actionRow.className = "wide rest-variety-picker-row";
      restFields.appendChild(actionRow);
    }

    let addButton = actionRow.querySelector("[data-rest-variety-add]");
    if (!addButton) {
      addButton = document.createElement("button");
      addButton.className = "button ghost";
      addButton.type = "button";
      addButton.dataset.restVarietyAdd = "";
      addButton.textContent = "P\u0159idat odr\u016fdu";
      actionRow.appendChild(addButton);
    }

    let list = form.querySelector("[data-rest-variety-list]");
    if (!list) {
      list = document.createElement("div");
      list.className = "wide rest-variety-selection";
      list.dataset.restVarietyList = "";
      actionRow.after(list);
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

  function openDesktopRestOfferDialog(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const form = els.offerForm;
    if (!form) return;
    const initialDate = clean(offer?.date || defaults.date) || toDateInput(new Date());
    const names = restFormVarietyNames(offer?.restVarietyName);
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    els.offerDialogTitle.textContent = offer ? "Upravit resty" : "Nov\u00e9 resty";
    form.reset();
    form.elements.id.value = offer?.id || "";
    form.elements.type.value = "rests";
    form.elements.title.value = defaultOfferTitle("rests", initialDate);
    form.elements.date.value = initialDate;
    form.elements.facebookPublishDate.value = initialDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "p\u0159ipraven\u00e1";
    form.elements.note.value = offer?.note || "";
    form.elements.restCustomerId.innerHTML = restCustomerOptionsFinal(offer?.restCustomerId || defaults.restCustomerId || "");
    form.elements.restCustomerId.value = clean(offer?.restCustomerId || defaults.restCustomerId);
    form.elements.restVarietyId.value = clean(matchedVariety?.id || offer?.restVarietyId);
    toggleDesktopRestDialogMode(form, true);
    ensureDesktopRestPickerFinal(form, names.join("\n"));
    showDialog(els.offerDialog);
  }

  function saveDesktopRestOfferForm() {
    const formEl = els.offerForm;
    if (!formEl?.reportValidity()) return;
    const form = new FormData(formEl);
    const existing = findOffer(clean(form.get("id")));
    const nextDate = clean(form.get("date")) || toDateInput(new Date());
    const names = restFormVarietyNames(form.get("restVarietyName"));
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    const now = new Date().toISOString();
    const offer = normalizeOffer({
      ...existing,
      id: clean(form.get("id")) || uid(),
      title: defaultOfferTitle("rests", nextDate),
      date: nextDate,
      facebookPublishDate: nextDate,
      facebookPublishTime: "20:00",
      type: "rests",
      status: "p\u0159ipraven\u00e1",
      note: clean(form.get("note")),
      restCustomerId: clean(form.get("restCustomerId")),
      restVarietyId: clean(matchedVariety?.id),
      restVarietyName: names.join("\n"),
      items: existing?.items || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, offer);
    else state.data.offers.push(offer);
    state.selectedOfferId = offer.id;
    saveData();
    renderAll();
    els.offerDialog.close();
    toast("Resty ulo\u017eeny.");
  }

  window.openDesktopRestOfferDialog = openDesktopRestOfferDialog;

  openOfferDialog = function openOfferDialogRestDirect(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const isRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    if (isRest) return openDesktopRestOfferDialog(id, defaults);
    toggleDesktopRestDialogMode(els.offerForm, false);
    return previousOpenOfferDialog(id, defaults);
  };

  saveOfferFromForm = function saveOfferFromFormRestDirect() {
    const form = els.offerForm;
    const isRest = normalizeOfferType(form?.elements?.type?.value) === "rests" || form?.dataset?.restMode === "true";
    if (isRest) return saveDesktopRestOfferForm();
    toggleDesktopRestDialogMode(form, false);
    return previousSaveOfferFromForm();
  };

  [document.querySelector("#addRestOfferTopBtn"), document.querySelector("#addRestOfferBtn")].forEach((button) => {
    if (!button) return;
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openDesktopRestOfferDialog();
    };
  });
})();

function renderOfferItem(offer, item) {
  const confirmed = offerItemConfirmedCount(item);
  const alternate = offerItemAlternateCount(item);
  const available = Math.max(0, Number(item.quantity || 0) - confirmed);
  const soldOut = Number(item.quantity || 0) > 0 && available === 0;
  const reservations = sortedReservationsForItem(item);
  const image = offerItemImage(item);
  const displayName = offerItemNameSafe(item);
  const orderProgress = offerItemOrderProgress(offer, item);
  const orderFlag = orderProgress.label
    ? `<span class="offer-order-flag offer-order-flag-${escapeHtml(orderProgress.state)}" title="${escapeHtml(orderProgress.label)}">→ OBJ</span>`
    : "";
  return `<article class="offer-item ${soldOut ? "sold-out" : ""} ${orderProgress.state ? `is-order-${orderProgress.state}` : ""}">
    <div class="offer-item-main">
      <div class="offer-thumb-wrap">
        <div class="offer-thumb">${image ? photoImageMarkup(image, displayName, "", 'loading="lazy"') : varietyInitials(displayName)}</div>
        ${orderFlag}
      </div>
      <div>
        <strong>${escapeHtml(displayName)}</strong>
        <small>${escapeHtml([`${item.quantity} ks`, `${formatMoney(item.price, item.currency)}/ks`, item.note].filter(Boolean).join(" · "))}</small>
        <div class="pills offer-stock">
          <span class="pill ${soldOut ? "warning" : "paid"}">Volné ${available}</span>
          <span class="pill ${soldOut || confirmed > Number(item.quantity || 0) ? "warning" : ""}">Potvrzeno ${confirmed}</span>
          ${alternate ? `<span class="pill ready">Náhradníci ${alternate}</span>` : ""}
        </div>
      </div>
      <span class="row-actions">
        <button class="mini-button" type="button" title="Rezervovat" data-add-reservation="${item.id}">+</button>
        <button class="mini-button" type="button" title="Přidat náhradníka" data-add-reservation="${item.id}" data-add-reservation-status="alternate">N</button>
        <button class="mini-button" type="button" title="Upravit" data-edit-offer-item="${item.id}">✎</button>
        <button class="mini-button" type="button" title="Smazat" data-delete-offer-item="${item.id}">×</button>
      </span>
    </div>
    <div class="reservation-list">
      ${reservations.length ? reservations.map((reservation) => renderReservationLine(offer, item, reservation)).join("") : `<small class="cell-sub">Zatím bez rezervací.</small>`}
    </div>
  </article>`;
}

function renderReservationLine(offer, item, reservation) {
  const customer = findCustomer(reservation.customerId);
  const status = reservationStatusValue(reservation.status);
  return `<div class="reservation-line">
    <span><strong>${escapeHtml(customerName(customer))}</strong> · ${reservation.quantity} ks${reservation.note ? ` · ${escapeHtml(reservation.note)}` : ""}</span>
    <span class="row-actions">
      <span class="pill ${status === "alternate" ? "ready" : "paid"}">${escapeHtml(reservationStatusLabels[status])}</span>
      ${reservationLinkedToOrder(offer, item, reservation) ? `<span class="pill paid">Objednávka</span>` : ""}
      <button class="mini-button" type="button" title="Upravit rezervaci" data-item-id="${item.id}" data-edit-reservation="${reservation.id}">✎</button>
      <button class="mini-button" type="button" title="Smazat rezervaci" data-item-id="${item.id}" data-delete-reservation="${reservation.id}">×</button>
    </span>
  </div>`;
}

function renderFilters() {
  const countries = [...new Set(state.data.customers.map((customer) => customer.country).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "cs"));
  els.countryFilter.innerHTML = `<option value="">Vše</option>${countries
    .map((country) => `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`)
    .join("")}`;
  els.countryFilter.value = state.countryFilter;
}

function renderOrderCustomerOptions() {
  const select = els.orderForm.elements.customerId;
  const currentValue = clean(select.value);
  select.innerHTML = [`<option value="">Zvol zákazníka</option>`, ...state.data.customers
    .slice()
    .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
    .map((customer) => `<option value="${customer.id}">${escapeHtml(customerName(customer))}</option>`)]
    .join("");
  select.value = state.data.customers.some((customer) => customer.id === currentValue) ? currentValue : "";
  syncOrderCustomerValidity();
}

function syncOrderCustomerValidity() {
  const customerSelect = els.orderForm?.elements?.customerId;
  if (!customerSelect) return;
  customerSelect.setCustomValidity(clean(customerSelect.value) ? "" : "Zvol zákazníka.");
}

function renderCountryList() {
  els.countryList.innerHTML = countryOptions().map((country) => `<option value="${escapeHtml(country)}"></option>`).join("");
}

function countryOptions() {
  const all = unique([...defaultCountries, ...state.data.customers.map((customer) => clean(customer.country)).filter(Boolean)]);
  const priority = priorityCountries.filter((country) => all.some((item) => normalize(item) === normalize(country)));
  const rest = all.filter((country) => !priority.some((item) => normalize(item) === normalize(country))).sort((a, b) => a.localeCompare(b, "cs"));
  return [...priority, ...rest];
}

function handleCountryComboClick(event) {
  const toggle = event.target.closest("[data-country-toggle]");
  if (toggle) {
    event.preventDefault();
    event.stopPropagation();
    const input = toggle.closest(".country-combo")?.querySelector("[data-country-input]");
    if (input) toggleCountryMenu(input);
    return;
  }

  const item = event.target.closest("[data-country-value]");
  if (item) {
    event.preventDefault();
    const combo = item.closest(".country-combo");
    const input = combo?.querySelector("[data-country-input]");
    if (input) {
      input.value = item.dataset.countryValue;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
    }
    closeCountryMenus();
    return;
  }

  const newItem = event.target.closest("[data-country-new]");
  if (newItem) {
    event.preventDefault();
    const input = newItem.closest(".country-combo")?.querySelector("[data-country-input]");
    closeCountryMenus();
    input?.focus();
    return;
  }

  if (!event.target.closest(".country-combo")) closeCountryMenus();
}

function handleCountryComboInput(event) {
  const input = event.target.closest("[data-country-input]");
  if (!input) return;
  const menu = input.closest(".country-combo")?.querySelector("[data-country-menu]");
  if (menu && !menu.hidden) renderCountryMenu(input);
}

function toggleCountryMenu(input) {
  const menu = input.closest(".country-combo")?.querySelector("[data-country-menu]");
  if (!menu) return;
  if (!menu.hidden) {
    closeCountryMenus();
    return;
  }
  renderCountryMenu(input);
}

function renderCountryMenu(input) {
  const combo = input.closest(".country-combo");
  const menu = combo?.querySelector("[data-country-menu]");
  if (!menu) return;
  const current = clean(input.value);
  const options = countryOptions();
  const exact = current && options.some((country) => normalize(country) === normalize(current));
  const addButton = current && !exact ? `<button type="button" class="country-menu-item add" data-country-value="${escapeHtml(current)}">Přidat „${escapeHtml(current)}”</button>` : "";
  const newButton = !current ? `<button type="button" class="country-menu-item add" data-country-new>Napsat novou zemi</button>` : "";
  menu.innerHTML = `
    ${addButton || newButton}
    ${options.map((country) => `<button type="button" class="country-menu-item" data-country-value="${escapeHtml(country)}">${escapeHtml(country)}</button>`).join("")}
  `;
  closeCountryMenus(menu);
  menu.hidden = false;
}

function closeCountryMenus(except = null) {
  document.querySelectorAll("[data-country-menu]").forEach((menu) => {
    if (menu !== except) menu.hidden = true;
  });
}

function renderVarietyList() {
  const varieties = [...state.data.varieties].sort((a, b) => naturalCompare(a.name, b.name));
  els.varietyList.innerHTML = varieties.map((variety) => `<option value="${escapeHtml(variety.name)}"></option>`).join("");
}

function renderCrossVarietyOptions() {
  if (!els.crossForm) return;
  const varieties = [...state.data.varieties]
    .filter((variety) => clean(variety.name))
    .sort((a, b) => naturalCompare(a.name, b.name));
  const motherSelect = els.crossForm.elements.motherVarietyId;
  const pollenSelect = els.crossForm.elements.pollenVarietyId;
  if (!motherSelect || !pollenSelect) return;
  const motherValue = clean(motherSelect.value);
  const pollenValue = clean(pollenSelect.value);
  const options = `<option value="">Vyber odrůdu</option>${varieties
    .map((variety) => `<option value="${escapeHtml(variety.id)}">${escapeHtml(variety.name)}</option>`)
    .join("")}`;
  motherSelect.innerHTML = options;
  pollenSelect.innerHTML = options;
  motherSelect.value = varieties.some((variety) => variety.id === motherValue) ? motherValue : "";
  pollenSelect.value = varieties.some((variety) => variety.id === pollenValue) ? pollenValue : "";
}

function renderOrderVarietyFilter() {
  const selected = state.orderVarietyFilter;
  const names = [...new Set([
    ...state.data.varieties.map((variety) => clean(variety.name)),
    ...state.data.orders.flatMap(orderVarietyNames),
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b, "cs"));
  els.orderVarietyFilter.innerHTML = `<option value="">Vše</option>${names
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join("")}`;
  els.orderVarietyFilter.value = names.includes(selected) ? selected : "";
  if (selected && !names.includes(selected)) state.orderVarietyFilter = "";
}

function renderSeasonList() {
  const seasons = seasonOptions();
  els.seasonFilter.innerHTML = `<option value="">Vše</option>${seasons
    .map((season) => `<option value="${escapeHtml(season)}">${escapeHtml(season)}</option>`)
    .join("")}`;
  els.seasonFilter.value = state.seasonFilter;
  els.seasonList.innerHTML = seasons.map((season) => `<option value="${escapeHtml(season)}"></option>`).join("");
}

function renderFeeSettings() {
  const settings = feeSettings();
  els.defaultShippingFeeCz.value = settings.shippingFeeCz || "";
  els.defaultShippingFeeSk.value = settings.shippingFeeSk || "";
  if (els.defaultPostalFee) els.defaultPostalFee.value = settings.postalFee || "";
  if (els.defaultShippingFeeAddressCz) els.defaultShippingFeeAddressCz.value = settings.shippingFeeAddressCz || "";
  if (els.defaultShippingFeeAddressSk) els.defaultShippingFeeAddressSk.value = settings.shippingFeeAddressSk || "";
  els.defaultPackingFee.value = settings.packingFee || "";
  if (els.defaultCodFeeCz) els.defaultCodFeeCz.value = settings.codFeeCz || "";
  if (els.defaultCodFeeSk) els.defaultCodFeeSk.value = settings.codFeeSk || "";
  els.defaultFeeCurrency.value = normalizeCurrency(settings.currency);
  els.paymentAccountName.value = settings.paymentAccountName || "";
  els.paymentAccountNumber.value = settings.paymentAccountNumber || "";
  els.paymentIban.value = settings.paymentIban || "";
  els.paymentSwift.value = settings.paymentSwift || "";
  renderFeeSettingsExtraRows(settings.extraFees);
  els.feeSettingsHint.textContent = feeSettingsSummary(settings);
}

function saveFeeSettingsFromPanel() {
  state.data.settings = readFeeSettingsDraftFromPanel();
  saveData();
  renderFeeSettings();
  if (els.orderDialog?.open) {
    renderOrderExtraFeeFields(undefined, { preserveValues: true });
    refreshOrderPricingPreview();
    syncOrderDialogState();
  }
  toast("Nastavení uloženo.");
}

function readFeeSettingsDraftFromPanel() {
  const current = feeSettings();
  return normalizeFeeSettings({
    shippingFeeCz: els.defaultShippingFeeCz?.value,
    shippingFeeSk: els.defaultShippingFeeSk?.value,
    postalFee: els.defaultPostalFee?.value,
    shippingFeeAddressCz: els.defaultShippingFeeAddressCz?.value,
    shippingFeeAddressSk: els.defaultShippingFeeAddressSk?.value,
    packingFee: els.defaultPackingFee?.value,
    codFeeCz: els.defaultCodFeeCz?.value,
    codFeeSk: els.defaultCodFeeSk?.value,
    currency: els.defaultFeeCurrency?.value,
    paymentAccountName: els.paymentAccountName?.value,
    paymentAccountNumber: els.paymentAccountNumber?.value,
    paymentIban: els.paymentIban?.value,
    paymentSwift: els.paymentSwift?.value,
    extraFees: collectFeeSettingsExtraRows(),
    facebookOfferTemplate: current.facebookOfferTemplate,
  });
}

function collectFeeSettingsExtraRows() {
  return [...(els.feeExtrasSettings?.querySelectorAll("[data-fee-extra-setting-row]") || [])].map((row) => ({
    id: clean(row.dataset.feeExtraSettingRow),
    name: row.querySelector("[data-fee-extra-name]")?.value,
    amount: row.querySelector("[data-fee-extra-amount]")?.value,
  }));
}

function renderFeeSettingsExtraRows(extraFees = []) {
  if (!els.feeExtrasSettings) return;
  els.feeExtrasSettings.innerHTML = extraFees.length
    ? extraFees
        .map((fee) => `<div class="fee-extra-row" data-fee-extra-setting-row="${escapeHtml(fee.id)}">
            <label>
              <span>Název poplatku</span>
              <input data-fee-extra-name value="${escapeHtml(fee.name)}" placeholder="např. Krabička" />
            </label>
            <label>
              <span>Částka</span>
              <input data-fee-extra-amount inputmode="decimal" value="${escapeHtml(fee.amount)}" placeholder="0" />
            </label>
            <button class="mini-button" type="button" title="Smazat extra poplatek" data-remove-fee-extra="${escapeHtml(fee.id)}">×</button>
          </div>`)
        .join("")
    : `<div class="empty-state">Zatím žádný extra poplatek.</div>`;
}

function addFeeSettingExtraRow() {
  const draft = readFeeSettingsDraftFromPanel();
  draft.extraFees.push({ id: uid(), name: "", amount: "" });
  renderFeeSettingsExtraRows(draft.extraFees);
}

function handleFeeSettingsExtrasClick(event) {
  const remove = event.target.closest("[data-remove-fee-extra]");
  if (!remove) return;
  const draft = readFeeSettingsDraftFromPanel();
  renderFeeSettingsExtraRows(draft.extraFees.filter((fee) => fee.id !== remove.dataset.removeFeeExtra));
}

function openCustomerDialog(id = null) {
  const customer = id ? findCustomer(id) : null;
  els.customerDialogTitle.textContent = customer ? "Upravit zákazníka" : "Nový zákazník";
  els.customerForm.reset();
  els.customerForm.elements.id.value = customer?.id || "";
  els.customerForm.elements.fullName.value = customer ? customerName(customer) : "";
  els.customerForm.elements.fbName.value = customer?.fbName || "";
  els.customerForm.elements.phone.value = customer?.phone || "";
  els.customerForm.elements.email.value = customer?.email || "";
  els.customerForm.elements.street.value = customer?.street || "";
  els.customerForm.elements.postalCode.value = customer?.postalCode || "";
  els.customerForm.elements.city.value = customer?.city || "";
  els.customerForm.elements.country.value = customer?.country || "";
  els.customerForm.elements.customerRating.value = customer?.customerRating || "";
  els.customerForm.elements.note.value = customer?.note || "";
  els.customerForm.querySelectorAll('input[name="tags"]').forEach((input) => {
    input.checked = Boolean(customer?.tags?.includes(input.value));
  });
  showDialog(els.customerDialog);
}

function saveCustomerFromForm() {
  if (!els.customerForm.reportValidity()) return;
  const form = new FormData(els.customerForm);
  const id = form.get("id") || uid();
  const existing = findCustomer(id);
  const now = new Date().toISOString();
  const nameParts = splitName(form.get("fullName"));
  const customer = sanitizeCustomer({
    id,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    fbName: clean(form.get("fbName")),
    phone: clean(form.get("phone")),
    email: clean(form.get("email")),
    street: clean(form.get("street")),
    postalCode: clean(form.get("postalCode")),
    city: clean(form.get("city")),
    country: clean(form.get("country")),
    customerRating: clean(form.get("customerRating")),
    tags: normalizeTags(form.getAll("tags")),
    note: clean(form.get("note")),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });

  if (existing) {
    Object.assign(existing, customer);
  } else {
    state.data.customers.push(customer);
  }

  state.selectedCustomerId = id;
  saveData();
  renderAll();
  els.customerDialog.close();
  toast("Zákazník uložen.");
}

function captureOrderFormSnapshot() {
  return {
    id: clean(els.orderForm.elements.id.value),
    customerId: clean(els.orderForm.elements.customerId.value),
    orderDate: clean(els.orderForm.elements.orderDate.value),
    season: clean(els.orderForm.elements.season.value),
    price: clean(els.orderForm.elements.price.value),
    currency: currentOrderCurrency(),
    paymentStatus: clean(els.orderForm.elements.paymentStatus.value),
    shippingStatus: normalizeShippingStatus(els.orderForm.elements.shippingStatus.value),
    deliveryMethod: normalizeDeliveryMethod(els.orderForm.elements.deliveryMethod.value),
    shippingFee: clean(els.orderForm.elements.shippingFee.value),
    shippingFeeLabel: clean(els.orderForm.elements.shippingFee.dataset.shippingLabel),
    packingFee: clean(els.orderForm.elements.packingFee.value),
    codFee: clean(els.orderForm.elements.codFee.value),
    codAmount: clean(els.orderForm.elements.codAmount.value),
    note: clean(els.orderForm.elements.note.value),
    varietiesText: clean(els.orderForm.elements.varietiesText.value),
    stornoLines: clean(els.orderForm.elements.stornoLines?.value),
    cancelledAt: clean(els.orderForm.elements.cancelledAt?.value),
    cancelledNote: clean(els.orderForm.elements.cancelledNote?.value),
    extraFees: normalizeNamedFees(collectOrderExtraFeesFromForm()),
    priceManual: els.orderForm.dataset.priceManual === "1",
    feesBasePrice: clean(els.orderForm.dataset.feesBasePrice),
    pickerName: clean(els.orderVarietyPicker?.value),
    pickerQuantity: clean(els.orderVarietyQuantity?.value),
    pickerManualPrice: clean(els.orderVarietyManualPrice?.value),
  };
}

function applyOrderFormSnapshot(snapshot = {}) {
  const currency = normalizeCurrency(snapshot.currency || currentOrderCurrency());
  els.orderForm.elements.id.value = snapshot.id || "";
  els.orderForm.elements.customerId.value = snapshot.customerId || els.orderForm.elements.customerId.value;
  els.orderForm.elements.orderDate.value = snapshot.orderDate || els.orderForm.elements.orderDate.value;
  els.orderForm.elements.season.value = snapshot.season || els.orderForm.elements.season.value;
  els.orderForm.elements.price.value = snapshot.price || "";
  setOrderCurrencyValue(currency);
  els.orderForm.elements.paymentStatus.value = normalizeOrderPaymentFormValue(snapshot.paymentStatus || "čeká");
  els.orderForm.elements.shippingStatus.value = normalizeShippingStatus(snapshot.shippingStatus);
  els.orderForm.elements.deliveryMethod.value = normalizeDeliveryMethod(snapshot.deliveryMethod || "ship");
  els.orderForm.elements.shippingFee.value = snapshot.shippingFee || "";
  if (clean(snapshot.shippingFeeLabel)) els.orderForm.elements.shippingFee.dataset.shippingLabel = clean(snapshot.shippingFeeLabel);
  else delete els.orderForm.elements.shippingFee.dataset.shippingLabel;
  els.orderForm.elements.packingFee.value = snapshot.packingFee || "";
  els.orderForm.elements.codFee.value = snapshot.codFee || "";
  els.orderForm.elements.codAmount.value = snapshot.codAmount || "";
  els.orderForm.elements.note.value = snapshot.note || "";
  els.orderForm.elements.varietiesText.value = snapshot.varietiesText || "";
  if (els.orderForm.elements.stornoLines) els.orderForm.elements.stornoLines.value = snapshot.stornoLines || "";
  if (els.orderForm.elements.cancelledAt) els.orderForm.elements.cancelledAt.value = snapshot.cancelledAt || "";
  if (els.orderForm.elements.cancelledNote) els.orderForm.elements.cancelledNote.value = snapshot.cancelledNote || "";
  els.orderForm.dataset.priceManual = snapshot.priceManual ? "1" : "";
  els.orderForm.dataset.feesBasePrice = snapshot.feesBasePrice || "";
  renderOrderExtraFeeFields(snapshot.extraFees || [], { preserveValues: false, activateValues: true });
  if (els.orderVarietyPicker) els.orderVarietyPicker.value = snapshot.pickerName || "";
  if (els.orderVarietyQuantity) els.orderVarietyQuantity.value = snapshot.pickerQuantity || "1";
  updateOrderVarietyCatalogPrice();
  if (els.orderVarietyManualPrice) els.orderVarietyManualPrice.value = snapshot.pickerManualPrice || "";
  syncOrderPaymentFieldTone();
  syncOrderPaymentToggle();
  syncOrderShippingStatusToggle();
  initializeOrderDeliveryFieldState();
}

function syncOrderCustomerFieldLock(isLocked = Boolean(clean(els.orderForm?.elements?.id?.value))) {
  const customerSelect = els.orderForm?.elements?.customerId;
  const customerField = customerSelect?.closest(".order-customer-field");
  if (!customerSelect || !customerField) return;
  customerSelect.disabled = false;
  customerSelect.setAttribute("aria-disabled", "false");
  customerField.classList.remove("is-locked");
}

function syncOrderPaymentFieldTone() {
  const paymentSelect = els.orderForm?.elements?.paymentStatus;
  const paymentField = paymentSelect?.closest(".order-payment-field");
  if (!paymentSelect || !paymentField) return;
  const paymentStatus = parsePaymentStatus(paymentSelect.value);
  paymentField.classList.toggle("is-waiting", paymentStatus === "čeká");
  paymentField.classList.toggle("is-overdue", paymentStatus === "nezaplaceno");
  paymentField.classList.toggle("is-paid", paymentStatus === "zaplaceno");
  paymentField.classList.remove("is-cod");
}

function syncOrderPaymentToggle() {
  const paymentStatus = parsePaymentStatus(els.orderForm?.elements?.paymentStatus?.value || "čeká");
  els.orderPaymentToggle?.querySelectorAll("[data-order-payment-option]").forEach((button) => {
    const buttonValue = parsePaymentStatus(button.dataset.orderPaymentOption || "čeká");
    const isActive = buttonValue === paymentStatus;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function handleOrderPaymentStatusChange() {
  applyDefaultCodFeeIfNeeded();
  syncOrderPaymentFieldTone();
  syncOrderPaymentToggle();
  updateOrderAdvancedSummary();
  refreshOrderPricingPreview();
}

function setOrderPaymentStatus(status) {
  const form = els.orderForm;
  if (!form) return;
  const nextStatus = normalizeOrderPaymentFormValue(status || "čeká");
  if (normalizeOrderPaymentFormValue(form.elements.paymentStatus.value) === nextStatus) {
    syncOrderPaymentFieldTone();
    syncOrderPaymentToggle();
    return;
  }
  form.elements.paymentStatus.value = nextStatus;
  handleOrderPaymentStatusChange();
}

function syncOrderShippingStatusToggle() {
  const current = normalizeShippingStatus(els.orderForm?.elements?.shippingStatus?.value || "nová");
  const currentIndex = orderShippingSteps.indexOf(current);
  els.orderStatusToggle?.querySelectorAll("[data-order-shipping-option]").forEach((button) => {
    const step = normalizeShippingStatus(button.dataset.orderShippingOption || "nová");
    const stepIndex = orderShippingSteps.indexOf(step);
    const isCurrent = step === current;
    const isComplete = stepIndex > -1 && currentIndex > -1 && stepIndex < currentIndex;
    const isUpcoming = stepIndex > currentIndex;
    button.classList.toggle("is-current", isCurrent);
    button.classList.toggle("is-complete", isComplete);
    button.classList.toggle("is-upcoming", isUpcoming);
    button.setAttribute("aria-pressed", isCurrent ? "true" : "false");
  });
}

function handleOrderShippingStatusChange() {
  syncOrderShippingStatusToggle();
  syncOrderDialogState();
}

function setOrderShippingStatus(status) {
  const form = els.orderForm;
  if (!form) return;
  const nextStatus = normalizeShippingStatus(status || "nová");
  if (normalizeShippingStatus(form.elements.shippingStatus.value) === nextStatus) {
    syncOrderShippingStatusToggle();
    return;
  }
  form.elements.shippingStatus.value = nextStatus;
  handleOrderShippingStatusChange();
}

function syncOrderDeliveryToggle() {
  const delivery = normalizeDeliveryMethod(els.orderForm?.elements?.deliveryMethod?.value || "ship");
  els.orderDeliveryToggle?.querySelectorAll("[data-order-delivery-option]").forEach((button) => {
    const isActive = normalizeDeliveryMethod(button.dataset.orderDeliveryOption) === delivery;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function captureOrderDeliveryFeeRestoreSnapshot() {
  const form = els.orderForm;
  if (!form) return null;
  return {
    shippingFee: clean(form.elements.shippingFee.value),
    shippingLabel: clean(form.elements.shippingFee.dataset.shippingLabel),
    packingFee: clean(form.elements.packingFee.value),
    codFee: clean(form.elements.codFee.value),
    codAmount: clean(form.elements.codAmount.value),
    extraFees: normalizeNamedFees(collectOrderExtraFeesFromForm()),
  };
}

function clearOrderDeliveryFeeRestoreSnapshot() {
  if (!els.orderForm) return;
  delete els.orderForm.dataset.deliveryRestoreFees;
}

function rememberOrderDeliveryFeeRestoreSnapshot() {
  const snapshot = captureOrderDeliveryFeeRestoreSnapshot();
  if (!snapshot || !els.orderForm) return;
  const hasValues =
    clean(snapshot.shippingFee)
    || clean(snapshot.packingFee)
    || clean(snapshot.codFee)
    || clean(snapshot.codAmount)
    || clean(snapshot.shippingLabel)
    || snapshot.extraFees.some((fee) => clean(fee.amount));
  if (!hasValues) {
    clearOrderDeliveryFeeRestoreSnapshot();
    return;
  }
  els.orderForm.dataset.deliveryRestoreFees = JSON.stringify(snapshot);
}

function restoreOrderDeliveryFeeRestoreSnapshot() {
  const form = els.orderForm;
  const raw = clean(form?.dataset?.deliveryRestoreFees);
  if (!form || !raw) return false;
  try {
    const snapshot = JSON.parse(raw);
    form.elements.shippingFee.value = clean(snapshot.shippingFee);
    if (clean(snapshot.shippingLabel)) form.elements.shippingFee.dataset.shippingLabel = clean(snapshot.shippingLabel);
    else delete form.elements.shippingFee.dataset.shippingLabel;
    form.elements.packingFee.value = clean(snapshot.packingFee);
    form.elements.codFee.value = clean(snapshot.codFee);
    form.elements.codAmount.value = clean(snapshot.codAmount);
    renderOrderExtraFeeFields(snapshot.extraFees || [], { preserveValues: false, activateValues: true });
    return true;
  } catch {
    clearOrderDeliveryFeeRestoreSnapshot();
    return false;
  }
}

function initializeOrderDeliveryFieldState() {
  const form = els.orderForm;
  if (!form) return;
  form.dataset.lastDeliveryMethod = normalizeDeliveryMethod(form.elements.deliveryMethod.value || "ship");
  clearOrderDeliveryFeeRestoreSnapshot();
  syncOrderDeliveryToggle();
}

function setOrderDeliveryMethod(method) {
  const form = els.orderForm;
  if (!form) return;
  const nextMethod = normalizeDeliveryMethod(method || "ship");
  if (normalizeDeliveryMethod(form.elements.deliveryMethod.value) === nextMethod) {
    syncOrderDeliveryToggle();
    return;
  }
  form.elements.deliveryMethod.value = nextMethod;
  handleOrderDeliveryMethodChange();
}

function orderDialogFingerprint(snapshot) {
  return JSON.stringify(snapshot || {});
}

function resetOrderDialogRuntime() {
  state.orderDialogDirty = false;
  state.orderDialogInitializing = false;
  state.orderDialogBaseline = "";
  state.orderPaymentQrVisible = false;
  state.orderPaymentQrRequestId += 1;
  state.orderPaymentPreviewRequestId += 1;
  state.orderPaymentCountryOverride = "";
  state.orderPaymentQrState = null;
  state.orderSuggestionIndex = -1;
  if (els.orderPaymentQrPanel) els.orderPaymentQrPanel.hidden = true;
  if (els.orderPaymentQrText) els.orderPaymentQrText.textContent = "QR se připraví podle finální částky objednávky.";
  if (els.toggleOrderPaymentQrBtn) els.toggleOrderPaymentQrBtn.textContent = "QR k platbě";
  if (els.downloadOrderPaymentQrBtn) els.downloadOrderPaymentQrBtn.hidden = true;
  if (els.orderForeignTotalHint) {
    els.orderForeignTotalHint.hidden = true;
    els.orderForeignTotalHint.textContent = "";
  }
  if (els.orderPaymentQrCanvas) {
    els.orderPaymentQrCanvas.dataset.qrReady = "0";
    clearPaymentQrCanvas(els.orderPaymentQrCanvas);
  }
  if (els.orderCountryPromptDialog?.open) submitOrderCountryPromptChoice("");
  if (els.orderForm) {
    delete els.orderForm.dataset.lastDeliveryMethod;
    clearOrderDeliveryFeeRestoreSnapshot();
  }
  hideOrderVarietySuggestions();
}

function updateOrderAdvancedSummary() {
  if (!els.orderAdvancedSummary) return;
  const form = els.orderForm;
  const parts = [];
  const delivery = normalizeDeliveryMethod(form.elements.deliveryMethod.value);
  parts.push(deliveryLabels[delivery] || "Odeslat");
  const feeSummary = getOrderFeeSummary();
  if (feeSummary.items.length) parts.push(feeSummary.items.map((item) => item.label).join(", "));
  if (clean(form.elements.note.value)) parts.push("poznámka");
  els.orderAdvancedSummary.textContent = parts.join(" · ");
  renderOrderFeeInlinePreview();
}

function refreshOrderPricingPreview() {
  autoCalculateOrderPrice({ silent: true });
}

function syncOrderDialogState() {
  if (!els.orderDialog?.open) return;
  syncOrderPaymentFieldTone();
  syncOrderPaymentToggle();
  syncOrderShippingStatusToggle();
  syncOrderDeliveryToggle();
  updateOrderAdvancedSummary();
  if (state.orderDialogInitializing) return;
  const snapshot = captureOrderFormSnapshot();
  const dirty = orderDialogFingerprint(snapshot) !== state.orderDialogBaseline;
  state.orderDialogDirty = dirty;
}

function handleOrderFormInteraction(event) {
  if (!els.orderDialog?.open || !els.orderForm.contains(event.target)) return;
  syncOrderDialogState();
}

function handleWindowBeforeUnload(event) {
  if (!state.orderDialogDirty) return;
  event.preventDefault();
  event.returnValue = "";
}

function attemptCloseOrderDialog() {
  if (state.orderDialogDirty) {
    const confirmed = confirm("Rozpracovaná objednávka ještě není uložená. Zavřít okno? Neuložené změny se ztratí.");
    if (!confirmed) return;
  }
  if (typeof els.orderDialog.close === "function") els.orderDialog.close("cancel");
  else els.orderDialog.removeAttribute("open");
  resetOrderDialogRuntime();
}

function handleOrderDialogHotkeys(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveOrderFromForm();
  }
}

async function openOrderDialog(id = null, customerId = null, defaults = {}) {
  if (!state.data.customers.length) {
    toast("Nejdřív přidej zákazníka.");
    return;
  }
  renderOrderCustomerOptions();
  const order = id ? findOrder(id) : null;
  const draft = order || defaults || {};
  const draftCurrency = normalizeCurrency(draft.currency);
  state.orderDialogInitializing = true;
  els.orderDialogTitle.textContent = order ? "Upravit objednávku" : "Nová objednávka";
  els.orderForm.reset();
  els.orderForm.dataset.feesBasePrice = "";
  els.orderForm.dataset.priceManual = "";
  els.orderForm.dataset.programmaticPrice = "";
  els.orderForm.elements.id.value = order?.id || "";
  els.orderForm.elements.offerId.value = draft.offerId || order?.offerId || "";
  els.orderForm.elements.customerId.value = draft.customerId || customerId || "";
  syncOrderCustomerFieldLock(Boolean(order?.id));
  syncOrderCustomerValidity();
  els.orderForm.elements.orderDate.value = draft.orderDate || toDateInput(new Date());
  els.orderForm.elements.season.value = draft.season || defaultSeason();
  els.orderForm.elements.price.value = draft.price || "";
  setOrderCurrencyValue(draftCurrency);
  els.orderForm.elements.paymentStatus.value = normalizeOrderPaymentFormValue(draft.paymentStatus || "čeká");
  els.orderForm.elements.shippingStatus.value = normalizeShippingStatus(draft.shippingStatus);
  els.orderForm.elements.deliveryMethod.value = normalizeDeliveryMethod(draft.deliveryMethod || "ship");
  syncOrderPaymentFieldTone();
  syncOrderPaymentToggle();
  syncOrderShippingStatusToggle();
  initializeOrderDeliveryFieldState();
  const defaultFees = order ? { shippingFee: "", packingFee: "", codFee: "", extraFees: [] } : defaultOrderFees(draftCurrency, els.orderForm.elements.customerId.value);
  els.orderForm.elements.shippingFee.value = draft.shippingFee || defaultFees.shippingFee || "";
  delete els.orderForm.elements.shippingFee.dataset.shippingLabel;
  if (clean(draft.shippingFeeLabel)) els.orderForm.elements.shippingFee.dataset.shippingLabel = clean(draft.shippingFeeLabel);
  const paymentStatus = parsePaymentStatus(draft.paymentStatus || "čeká");
  els.orderForm.elements.codAmount.value = "";
  els.orderForm.elements.packingFee.value = draft.packingFee || defaultFees.packingFee || "";
  els.orderForm.elements.codFee.value = draft.codFee || "";
  const orderExtraFees = normalizeNamedFees(draft.extraFees);
  renderOrderExtraFeeFields(orderExtraFees.length ? orderExtraFees : defaultOrderFees(draftCurrency, els.orderForm.elements.customerId.value).extraFees, {
    preserveValues: false,
    activateValues: orderExtraFees.length > 0,
  });
  if (normalizeDeliveryMethod(els.orderForm.elements.deliveryMethod.value) === "personal_pickup") {
    clearOrderFeesForPersonalPickup();
  }
  const initialFeeTotal =
    (Number.isFinite(parseDecimal(els.orderForm.elements.shippingFee.value)) ? parseDecimal(els.orderForm.elements.shippingFee.value) : 0)
    + (Number.isFinite(parseDecimal(els.orderForm.elements.packingFee.value)) ? parseDecimal(els.orderForm.elements.packingFee.value) : 0)
    + (Number.isFinite(parseDecimal(els.orderForm.elements.codFee.value)) ? parseDecimal(els.orderForm.elements.codFee.value) : 0)
    + sumNamedFees(collectOrderExtraFeesFromForm());
  if (order?.feesIncludedInTotal || (order && !order.priceManualOverride && initialFeeTotal > 0)) {
    els.orderForm.dataset.feesBasePrice = "0";
  }
  if (!clean(els.orderForm.elements.shippingFee.dataset.shippingLabel) && clean(els.orderForm.elements.shippingFee.value)) {
    els.orderForm.elements.shippingFee.dataset.shippingLabel = currentOrderShippingLabel();
  }
  els.orderForm.elements.varietiesText.value = draft.varietiesText || "";
  if (els.orderForm.elements.stornoLines) els.orderForm.elements.stornoLines.value = JSON.stringify(orderStornoLines(draft));
  if (els.orderForm.elements.cancelledAt) els.orderForm.elements.cancelledAt.value = clean(draft.cancelledAt);
  if (els.orderForm.elements.cancelledNote) els.orderForm.elements.cancelledNote.value = clean(draft.cancelledNote);
  resetOrderVarietyComposer();
  hideOrderVarietySuggestions();
  els.orderForm.elements.note.value = draft.note || "";
  refreshOrderRateHint(true);
  syncOrderPaymentTextSentButton(order);
  syncOrderAlternateBlock();
  syncOrderStornoBlock();
  syncOrderRestWarningBlock();
  showDialog(els.orderDialog);
  await autoCalculateOrderPrice({ silent: true });
  state.orderDialogBaseline = orderDialogFingerprint(captureOrderFormSnapshot());
  state.orderDialogDirty = false;
  state.orderDialogInitializing = false;
  syncOrderDialogState();
}

async function saveOrderFromForm() {
  syncOrderCustomerValidity();
  if (!els.orderForm.reportValidity()) {
    if (!clean(els.orderForm.elements.customerId.value)) toast("Zvol zákazníka.");
    return;
  }
  await autoCalculateOrderPrice({ force: true, silent: true });
  const form = new FormData(els.orderForm);
  const id = form.get("id") || uid();
  const existing = findOrder(id);
  const customerId = clean(els.orderForm.elements.customerId.value || form.get("customerId")) || existing?.customerId || "";
  const now = new Date().toISOString();
  const feeSummary = getOrderFeeSummary();
  const order = {
    id,
    offerId: existing?.offerId || clean(form.get("offerId")),
    customerId,
    orderDate: clean(form.get("orderDate")) || toDateInput(new Date()),
    season: clean(form.get("season")) || defaultSeason(),
    price: clean(form.get("price")),
    currency: normalizeCurrency(form.get("currency")),
    exchangeRate: existing?.exchangeRate || "",
    paymentStatus: clean(form.get("paymentStatus")) || "čeká",
    shippingStatus: normalizeShippingStatus(form.get("shippingStatus")),
    paymentReminderDate: "",
    shippingReminderDate: "",
    deliveryMethod: normalizeDeliveryMethod(form.get("deliveryMethod") || "ship"),
    packetaPointId: "",
    codAmount: clean(form.get("codAmount")),
    shippingFee: clean(form.get("shippingFee")),
    shippingFeeLabel: clean(els.orderForm.elements.shippingFee.dataset.shippingLabel),
    packingFee: clean(form.get("packingFee")),
    codFee: clean(form.get("codFee")),
    extraFees: collectOrderExtraFeesFromForm(),
    trackingNumber: "",
    packetaPacketId: "",
    priceManualOverride: false,
    feesIncludedInTotal: feeSummary.total > 0,
    varietiesText: clean(form.get("varietiesText")),
    stornoLines: normalizeOrderStornoLines(form.get("stornoLines")),
    cancelledAt: clean(form.get("cancelledAt")),
    cancelledNote: clean(form.get("cancelledNote")),
    note: clean(form.get("note")),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (existing) {
    Object.assign(existing, order);
  } else {
    state.data.orders.push(order);
  }

  const customer = findCustomer(order.customerId);
  if (customer) customer.updatedAt = now;
  upsertVarietiesFromText(order.varietiesText);
  state.selectedCustomerId = order.customerId;
  saveData();
  renderAll();
  if (typeof els.orderDialog.close === "function") els.orderDialog.close("saved");
  else els.orderDialog.removeAttribute("open");
  resetOrderDialogRuntime();
  ensureRateForDate(order.orderDate);
  toast("Objednávka uložena.");
}

async function convertOrderFormCurrency(targetCurrency) {
  const form = els.orderForm;
  const target = normalizeCurrency(targetCurrency);
  const previous = normalizeCurrency(form.dataset.currency || currentOrderCurrency() || target);
  if (previous === target) {
    refreshOrderRateHint(true);
    autoCalculateOrderPrice({ silent: true });
    return;
  }

  const price = parseDecimal(form.elements.price.value);
  const cod = parseDecimal(form.elements.codAmount.value);
  const shipping = parseDecimal(form.elements.shippingFee.value);
  const packing = parseDecimal(form.elements.packingFee.value);
  const codFee = parseDecimal(form.elements.codFee.value);
  const extraFees = normalizeNamedFees(collectOrderExtraFeesFromForm());
  const hasNumericExtraFee = extraFees.some((fee) => Number.isFinite(parseDecimal(fee.amount)));
  const basePrice = parseDecimal(form.dataset.feesBasePrice);
  if (!Number.isFinite(price) && !Number.isFinite(cod) && !Number.isFinite(shipping) && !Number.isFinite(packing) && !Number.isFinite(codFee) && !hasNumericExtraFee) {
    setOrderCurrencyValue(target);
    updateOrderVarietyCatalogPrice();
    refreshOrderRateHint(true);
    autoCalculateOrderPrice({ silent: true });
    return;
  }

  setCurrencyHint("Načítám kurz pro přepočet...");
  try {
    const rate = await resolveOrderExchangeRate(form.elements.orderDate.value);
    if (!rate?.rate) throw new Error("Kurz chybí.");

    if (Number.isFinite(price)) {
      form.elements.price.value = formatEditableAmount(convertAmount(price, previous, target, rate.rate), target);
    }
    if (Number.isFinite(cod)) {
      form.elements.codAmount.value = formatEditableAmount(convertAmount(cod, previous, target, rate.rate), target);
    }
    if (Number.isFinite(shipping)) {
      form.elements.shippingFee.value = formatEditableAmount(convertAmount(shipping, previous, target, rate.rate), target);
    }
    if (Number.isFinite(packing)) {
      form.elements.packingFee.value = formatEditableAmount(convertAmount(packing, previous, target, rate.rate), target);
    }
    if (Number.isFinite(codFee)) {
      form.elements.codFee.value = formatEditableAmount(convertAmount(codFee, previous, target, rate.rate), target);
    }
    extraFees.forEach((fee) => {
      const input = [...(els.orderExtraFeeFields?.querySelectorAll("[data-order-extra-fee-row]") || [])]
        .find((row) => row.dataset.orderExtraFeeRow === fee.id)
        ?.querySelector("[data-order-extra-fee]");
      const amount = parseDecimal(fee.amount);
      if (!input || !Number.isFinite(amount)) return;
      input.value = formatEditableAmount(convertAmount(amount, previous, target, rate.rate), target);
    });
    if (Number.isFinite(basePrice)) {
      form.dataset.feesBasePrice = String(convertAmount(basePrice, previous, target, rate.rate));
    }
    const pickerManualPrice = parseDecimal(els.orderVarietyManualPrice?.value);
    if (Number.isFinite(pickerManualPrice) && els.orderVarietyManualPrice) {
      els.orderVarietyManualPrice.value = formatEditableAmount(convertAmount(pickerManualPrice, previous, target, rate.rate), target);
    }
    setOrderCurrencyValue(target);
    updateOrderVarietyCatalogPrice();
    setCurrencyHint(rateHintText(rate));
    autoCalculateOrderPrice({ silent: true });
    updateOrderAdvancedSummary();
    syncOrderDialogState();
  } catch {
    setOrderCurrencyValue(previous);
    setCurrencyHint("Kurz se nepodařilo načíst, měna zůstala beze změny.");
    toast("Kurz se nepodařilo načíst.");
  }
}

function convertOrderLineManualPrices(previousCurrency, targetCurrency, rateValue) {
  const lines = parseVarietyOrderLines(els.orderForm.elements.varietiesText.value);
  if (!lines.some((line) => Number.isFinite(parseDecimal(line.explicitPrice)))) return;
  const next = lines.map((line) => {
    const unitPrice = parseDecimal(line.explicitPrice);
    if (!Number.isFinite(unitPrice)) return line.raw;
    const sourceCurrency = normalizeCurrency(line.explicitCurrency || previousCurrency);
    const converted = sourceCurrency === targetCurrency ? unitPrice : convertAmount(unitPrice, sourceCurrency, targetCurrency, rateValue);
    return buildOrderLineText(line.name, line.quantity, converted, targetCurrency);
  });
  writeOrderLineText(next);
}

async function refreshOrderRateHint(fetchIfMissing = false) {
  const date = els.orderForm.elements.orderDate.value || toDateInput(new Date());
  const stored = storedExchangeRateForDate(date);
  if (stored) {
    setCurrencyHint(rateHintText(stored));
    return;
  }
  if (!fetchIfMissing) {
    setCurrencyHint("Kurz se načte podle data objednávky.");
    return;
  }
  setCurrencyHint("Načítám kurz...");
  try {
    const rate = await getOrFetchExchangeRateForDate(date);
    setCurrencyHint(rateHintText(rate));
  } catch {
    const fallback = exchangeRateForDate(date);
    if (fallback) setCurrencyHint(rateHintText({ rate: fallback.rateCzkPerEur, source: `${fallback.source}, záložní`, date: fallback.date }));
    else setCurrencyHint("Kurz zatím není načtený.");
  }
}

async function loadCurrentOrderRate() {
  const date = els.orderForm.elements.orderDate.value || toDateInput(new Date());
  setRateButtonLoading(true);
  setCurrencyHint("Načítám kurz...");
  try {
    const rate = await getOrFetchExchangeRateForDate(date);
    setCurrencyHint(rateHintText(rate));
    renderDashboard();
    renderCustomers();
    renderOrders();
    toast("Kurz načtený.");
  } catch {
    const fallback = exchangeRateForDate(date);
    if (fallback) setCurrencyHint(rateHintText({ rate: fallback.rateCzkPerEur, source: `${fallback.source}, záložní`, date: fallback.date }));
    else setCurrencyHint("Kurz se nepodařilo načíst.");
    toast("Kurz se nepodařilo načíst.");
  } finally {
    setRateButtonLoading(false);
  }
}

function setCurrencyHint(text) {
  els.currencyRateHint.textContent = text;
}

function setRateButtonLoading(isLoading) {
  if (!els.loadOrderRateBtn) return;
  els.loadOrderRateBtn.disabled = Boolean(isLoading);
  els.loadOrderRateBtn.textContent = isLoading ? "..." : "↻";
}

function hasAdvancedOrderData(order) {
  return [
    order.deliveryMethod && order.deliveryMethod !== "ship",
    order.shippingFee,
    order.packingFee,
    ...normalizeNamedFees(order.extraFees).map((fee) => `${fee.name} ${fee.amount}`),
    order.note,
  ].some(Boolean);
}

function hasSavedOrderPrice(order) {
  const amount = parseDecimal(order?.price);
  return Number.isFinite(amount) && amount > 0;
}

function addPickedVarietyToOrder(pickedOverride = "") {
  const pickerValue = clean(els.orderVarietyPicker.value);
  const exactMatch = findVarietyByName(pickerValue)?.name || "";
  const overrideValue = typeof pickedOverride === "string" ? clean(pickedOverride) : "";
  const picked = overrideValue || exactMatch || activeOrderVarietySuggestionName() || pickerValue;
  if (!picked) {
    toast("Doplň název odrůdy.");
    return;
  }
  const variety = findVarietyByName(picked);
  const name = variety?.name || picked;
  const quantity = normalizeOrderLineQuantity(els.orderVarietyQuantity?.value, 1);
  const manualPrice = clean(els.orderVarietyManualPrice?.value);
  const orderCurrency = normalizeCurrency(els.orderForm.elements.currency.value);
  const lineAmount = manualPrice || clean(variety?.salePrice);
  const lineCurrency = manualPrice ? orderCurrency : normalizeCurrency(variety?.saleCurrency || orderCurrency);
  const textarea = els.orderForm.elements.varietiesText;
  const lines = clean(textarea.value).split(/\n+/).map(clean).filter(Boolean);
  lines.push(buildOrderLineText(name, quantity, lineAmount, lineCurrency));
  textarea.value = lines.join("\n");
  resetOrderVarietyComposer();
  hideOrderVarietySuggestions();
  els.orderForm.dataset.feesBasePrice = "";
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
}

function resetOrderVarietyComposer() {
  if (els.orderVarietyPicker) els.orderVarietyPicker.value = "";
  if (els.orderVarietyQuantity) els.orderVarietyQuantity.value = "1";
  if (els.orderVarietyCatalogPrice) els.orderVarietyCatalogPrice.value = "";
  if (els.orderVarietyManualPrice) els.orderVarietyManualPrice.value = "";
}

function updateOrderVarietyCatalogPrice() {
  if (!els.orderVarietyCatalogPrice) return;
  const picked = clean(els.orderVarietyPicker?.value);
  const variety = picked ? findVarietyByName(picked) : null;
  if (!variety) {
    els.orderVarietyCatalogPrice.value = "";
    return;
  }
  const orderCurrency = currentOrderCurrency();
  const price = parseDecimal(variety.salePrice);
  const priceCurrency = normalizeCurrency(variety.saleCurrency || orderCurrency);
  if (!Number.isFinite(price)) {
    els.orderVarietyCatalogPrice.value = "";
    return;
  }
  if (priceCurrency === orderCurrency) {
    els.orderVarietyCatalogPrice.value = formatMoney(price, orderCurrency);
    return;
  }
  const rate = storedExchangeRateForDate(els.orderForm?.elements?.orderDate?.value);
  const converted = priceInCurrency(price, priceCurrency, orderCurrency, rate?.rate);
  els.orderVarietyCatalogPrice.value = Number.isFinite(converted)
    ? formatMoney(converted, orderCurrency)
    : varietyPriceText(variety);
}

function handleOrderVarietyPickerClick(event) {
  const picker = els.orderVarietyPicker;
  const menu = els.orderVarietySuggestions;
  if (!picker || !menu) return;
  if (picker.contains(event.target) || menu.contains(event.target)) return;
  hideOrderVarietySuggestions();
}

function activeOrderVarietySuggestionName() {
  return els.orderVarietySuggestions?.querySelector("[data-order-variety-suggestion].active")?.dataset.orderVarietySuggestion || "";
}

function setOrderSuggestionIndex(index) {
  const buttons = [...(els.orderVarietySuggestions?.querySelectorAll("[data-order-variety-suggestion]") || [])];
  if (!buttons.length) {
    state.orderSuggestionIndex = -1;
    return;
  }
  const nextIndex = Math.max(0, Math.min(index, buttons.length - 1));
  state.orderSuggestionIndex = nextIndex;
  buttons.forEach((button, buttonIndex) => {
    const isActive = buttonIndex === nextIndex;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    if (isActive) button.scrollIntoView({ block: "nearest" });
  });
}

function moveOrderSuggestion(delta) {
  const buttons = [...(els.orderVarietySuggestions?.querySelectorAll("[data-order-variety-suggestion]") || [])];
  if (!buttons.length) return;
  const currentIndex = state.orderSuggestionIndex >= 0 ? state.orderSuggestionIndex : 0;
  const nextIndex = (currentIndex + delta + buttons.length) % buttons.length;
  setOrderSuggestionIndex(nextIndex);
}

function chooseOrderVarietySuggestion(name) {
  const picked = clean(name);
  if (!picked || !els.orderVarietyPicker) return;
  els.orderVarietyPicker.value = picked;
  updateOrderVarietyCatalogPrice();
  hideOrderVarietySuggestions();
  if (els.orderVarietyQuantity) {
    els.orderVarietyQuantity.focus();
    els.orderVarietyQuantity.select?.();
  }
}

function renderOrderVarietySuggestions() {
  const menu = els.orderVarietySuggestions;
  if (!menu) return;
  const query = normalize(els.orderVarietyPicker.value);
  const items = state.data.varieties
    .filter((variety) => variety.active !== false)
    .filter((variety) => !query || normalize(variety.name).includes(query))
    .sort((a, b) => {
      const aStarts = normalize(a.name).startsWith(query) ? 0 : 1;
      const bStarts = normalize(b.name).startsWith(query) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return naturalCompare(a.name, b.name);
    })
    .slice(0, query ? 14 : 10);

  if (!items.length) {
    hideOrderVarietySuggestions();
    return;
  }

  menu.innerHTML = items
    .map(
      (variety) => `<button class="country-menu-item variety-suggestion" type="button" data-order-variety-suggestion="${escapeHtml(variety.name)}">
        <strong>${escapeHtml(variety.name)}</strong>
        <small>${escapeHtml(varietyPriceText(variety))}</small>
      </button>`,
    )
    .join("");
  menu.hidden = false;
  menu.querySelectorAll("[data-order-variety-suggestion]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
    });
    button.addEventListener("click", () => {
      chooseOrderVarietySuggestion(button.dataset.orderVarietySuggestion);
    });
  });
  setOrderSuggestionIndex(0);
}

function hideOrderVarietySuggestions() {
  if (!els.orderVarietySuggestions) return;
  els.orderVarietySuggestions.hidden = true;
  els.orderVarietySuggestions.innerHTML = "";
  state.orderSuggestionIndex = -1;
}

function shouldMoveManualPriceToMissingLine(estimate) {
  return Boolean(
    estimate?.hasLines &&
      estimate.missing === 1 &&
      estimate.lines?.some((line) => line.source === "missing") &&
      !estimate.lines?.some((line) => line.source === "manual"),
  );
}

function normalizeOrderLineQuantity(value, fallback = 1) {
  const quantity = Number.parseInt(clean(value), 10);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback;
}

function buildOrderLineText(name, quantity = 1, amount = Number.NaN, currency = "CZK") {
  const qty = normalizeOrderLineQuantity(quantity, 1);
  const normalizedCurrency = normalizeCurrency(currency);
  const parsedAmount = parseDecimal(amount);
  const pricePart = Number.isFinite(parsedAmount)
    ? ` - ${formatEditableAmount(parsedAmount, normalizedCurrency)} ${currencyLabels[normalizedCurrency] || normalizedCurrency}`
    : "";
  return `${clean(name)} ${qty}x${pricePart}`.trim();
}

function orderLinePriceMarkup(amountText = "") {
  return `<span class="order-line-price-value">${escapeHtml(amountText)}</span>`;
}

function renderOrderLineSummary(estimate = {}) {
  if (!els.orderLineSummary) return;
  if (!estimate?.hasLines || !estimate.lines?.length) {
    els.orderLineSummary.innerHTML = "";
    return;
  }

  els.orderLineSummary.innerHTML = estimate.lines
    .map((line, index) => {
      const orderCurrency = currentOrderCurrency();
      const orderCurrencyLabel = currencyLabels[orderCurrency] || orderCurrency;
      const catalogDisplayUnitPrice = Number.isFinite(line.catalogDisplayUnitPrice) ? line.catalogDisplayUnitPrice : line.catalogUnitPrice;
      const catalogDisplayCurrency = normalizeCurrency(line.catalogDisplayCurrency || line.catalogUnitCurrency || orderCurrency);
      const catalogInfo = Number.isFinite(catalogDisplayUnitPrice)
        ? `${formatMoney(catalogDisplayUnitPrice, catalogDisplayCurrency)} / ks`
        : "";
      const manualDisplayUnitPrice = Number.isFinite(line.displayUnitPrice) ? line.displayUnitPrice : line.unitPrice;
      const manualDisplayCurrency = normalizeCurrency(line.displayCurrency || line.unitCurrency || orderCurrency);
      const manualValue = line.source === "manual" && Number.isFinite(manualDisplayUnitPrice)
        ? formatEditableAmount(manualDisplayUnitPrice, manualDisplayCurrency)
        : "";
      const pricePlaceholder = catalogInfo
        ? formatEditableAmount(catalogDisplayUnitPrice, catalogDisplayCurrency)
        : "";
      const priceLabel = `Cena za kus (${orderCurrencyLabel})`;
      const badgeClass = line.source === "manual" ? "manual" : line.source === "catalog" ? "catalog" : "missing";
      const badgeText = line.source === "manual" ? "Ručně" : line.source === "catalog" ? "Ceník" : "Dopsat";
      const clearLabel = line.source === "manual" ? (catalogInfo ? "Zpět na ceník" : "Smazat cenu") : "";
      return `<div class="order-line-card ${line.source}">
        <div class="order-line-heading">
          <div class="order-line-copy">
          <strong>${escapeHtml(line.name)}</strong>
        </div>
          <div class="order-line-meta">
            ${clearLabel ? `<button class="mini-button order-line-clear-button" type="button" data-order-line-price-clear="${index}">${escapeHtml(clearLabel)}</button>` : ""}
            <span class="order-line-badge ${badgeClass}">${badgeText}</span>
            <button class="mini-button order-line-storno-button" type="button" data-order-line-storno="${index}" title="Stornovat položku">Storno</button>
            <button class="order-line-remove-button" type="button" data-order-line-remove="${index}" aria-label="${escapeHtml(`Odebrat ${line.name}`)}" title="Odebrat položku">×</button>
          </div>
        </div>
        <div class="order-line-editor-grid">
          <label class="compact-inline-field">
            <input data-order-line-quantity="${index}" inputmode="numeric" aria-label="${escapeHtml(`Kusů u ${line.name}`)}" value="${line.quantity}" />
          </label>
          <label class="compact-inline-field">
            <input data-order-line-unit-price="${index}" inputmode="decimal" aria-label="${escapeHtml(`${priceLabel} u ${line.name}`)}" value="${escapeHtml(manualValue)}" placeholder="${escapeHtml(pricePlaceholder)}" />
          </label>
        </div>
      </div>`;
    })
    .join("");

  els.orderLineSummary.querySelectorAll("[data-order-line-quantity]").forEach((input) => {
    input.addEventListener("change", () => updateOrderLineQuantity(Number(input.dataset.orderLineQuantity), input.value));
  });
  els.orderLineSummary.querySelectorAll("[data-order-line-unit-price]").forEach((input) => {
    input.addEventListener("change", () => updateOrderLinePrice(Number(input.dataset.orderLineUnitPrice), input.value));
  });
  els.orderLineSummary.querySelectorAll("[data-order-line-price-clear]").forEach((button) => {
    button.addEventListener("click", () => clearOrderLinePrice(Number(button.dataset.orderLinePriceClear)));
  });
  els.orderLineSummary.querySelectorAll("[data-order-line-storno]").forEach((button) => {
    button.addEventListener("click", () => stornoOrderLine(Number(button.dataset.orderLineStorno)));
  });
  els.orderLineSummary.querySelectorAll("[data-order-line-remove]").forEach((button) => {
    button.addEventListener("click", () => removeOrderLine(Number(button.dataset.orderLineRemove)));
  });
}

function writeOrderLineText(updateLines) {
  els.orderForm.elements.varietiesText.value = updateLines.filter(Boolean).join("\n");
  els.orderForm.dataset.feesBasePrice = "";
  renderOrderStornoBlock();
}

function defaultExplicitPriceForOrderLine(line) {
  if (clean(line?.explicitPrice)) {
    return {
      amount: line.explicitPrice,
      currency: normalizeCurrency(line.explicitCurrency || els.orderForm.elements.currency.value),
    };
  }
  const variety = findVarietyForOrderLine(line?.name);
  if (clean(variety?.salePrice)) {
    return {
      amount: variety.salePrice,
      currency: normalizeCurrency(variety.saleCurrency || els.orderForm.elements.currency.value),
    };
  }
  return {
    amount: "",
    currency: normalizeCurrency(els.orderForm.elements.currency.value),
  };
}

function applyManualPriceToOrderLine(index, amount, currency, options = {}) {
  const lines = parseVarietyOrderLines(els.orderForm.elements.varietiesText.value);
  const line = lines[index];
  if (!line) return;
  if (!clean(amount)) {
    clearOrderLinePrice(index);
    return;
  }
  const parsedAmount = parseDecimal(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    toast("Napiš platnou cenu za kus.");
    return;
  }
  const nextAmount = options.mode === "line-total" ? parsedAmount / Math.max(line.quantity, 1) : parsedAmount;
  const next = lines.map((item, itemIndex) =>
    itemIndex === index ? buildOrderLineText(item.name, item.quantity, nextAmount, currency) : item.raw,
  );
  writeOrderLineText(next);
  els.orderForm.dataset.priceManual = "";
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
}

function updateOrderLineQuantity(index, value) {
  const lines = parseVarietyOrderLines(els.orderForm.elements.varietiesText.value);
  const line = lines[index];
  if (!line) return;
  const nextQuantity = normalizeOrderLineQuantity(value, line.quantity || 1);
  const defaultPrice = defaultExplicitPriceForOrderLine(line);
  const next = lines.map((item, itemIndex) =>
    itemIndex === index
      ? buildOrderLineText(item.name, nextQuantity, defaultPrice.amount, defaultPrice.currency)
      : item.raw,
  );
  writeOrderLineText(next);
  els.orderForm.dataset.priceManual = "";
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
}

function updateOrderLinePrice(index, value) {
  applyManualPriceToOrderLine(index, value, currentOrderCurrency());
}

function clearOrderLinePrice(index) {
  const lines = parseVarietyOrderLines(els.orderForm.elements.varietiesText.value);
  const line = lines[index];
  if (!line) return;
  const defaultPrice = defaultExplicitPriceForOrderLine({ ...line, explicitPrice: "", explicitCurrency: "" });
  const next = lines.map((item, itemIndex) =>
    itemIndex === index ? buildOrderLineText(item.name, item.quantity, defaultPrice.amount, defaultPrice.currency) : item.raw,
  );
  writeOrderLineText(next);
  els.orderForm.dataset.priceManual = "";
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
}

function removeOrderLine(index) {
  const lines = parseVarietyOrderLines(els.orderForm.elements.varietiesText.value);
  if (!lines[index]) return;
  const next = lines.filter((_, itemIndex) => itemIndex !== index).map((item) => item.raw);
  writeOrderLineText(next);
  els.orderForm.dataset.priceManual = "";
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
}

function readOrderFormStornoLines(form = els.orderForm) {
  return normalizeOrderStornoLines(form?.elements?.stornoLines?.value);
}

function syncOrderStornoBlock() {
  renderOrderStornoBlock();
}

function writeOrderFormStornoLines(lines = [], form = els.orderForm) {
  if (!form?.elements?.stornoLines) return;
  form.elements.stornoLines.value = JSON.stringify(normalizeOrderStornoLines(lines));
}

function appendOrderFormStornoEntry(entry, form = els.orderForm) {
  const lines = readOrderFormStornoLines(form);
  lines.push(normalizeOrderStornoEntry(entry));
  writeOrderFormStornoLines(lines, form);
}

function clearOrderFormCancellation(form = els.orderForm) {
  if (!form?.elements) return;
  if (form.elements.cancelledAt) form.elements.cancelledAt.value = "";
  if (form.elements.cancelledNote) form.elements.cancelledNote.value = "";
}

function currentActiveOrderLines(form = els.orderForm) {
  return parseVarietyOrderLines(form?.elements?.varietiesText?.value || "");
}

function formatDateTime(value = "") {
  const date = value ? new Date(value) : null;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderOrderStornoBlock() {
  const form = els.orderForm;
  const block = els.orderStornoBlock;
  if (!form || !block) return;
  const activeLines = currentActiveOrderLines(form);
  const stornoLines = readOrderFormStornoLines(form);
  if (activeLines.length && clean(form.elements.cancelledAt?.value)) clearOrderFormCancellation(form);
  const cancelledAt = clean(form.elements.cancelledAt?.value);
  const cancelledNote = clean(form.elements.cancelledNote?.value);
  const cancelledInfo = cancelledAt
    ? `Objednávka stornována ${formatDateTime(cancelledAt)}${cancelledNote ? ` · ${cancelledNote}` : ""}`
    : "";
  block.innerHTML = `
    <div class="order-storno-heading">
      <div>
        <strong>Storna</strong>
        <small>Toto se nepočítá do ceny.</small>
      </div>
      <div class="order-storno-actions">
        <button class="button ghost" type="button" data-order-cancel-all ${activeLines.length ? "" : "disabled"}>Stornovat celou objednávku</button>
      </div>
    </div>
    ${cancelledInfo ? `<div class="order-storno-status">${escapeHtml(cancelledInfo)}</div>` : ""}
    <div class="order-storno-list">
      ${stornoLines.length
        ? stornoLines.map((entry, index) => `
            <div class="order-storno-item">
              <div class="order-storno-copy">
                <span>✕ Storno: ${escapeHtml(entry.name)} · ${escapeHtml(quantityText(entry.quantity))} ks</span>
                ${clean(entry.note) ? `<small>${escapeHtml(entry.note)}</small>` : ""}
              </div>
              <button class="mini-button order-storno-restore-button" type="button" data-order-storno-restore="${index}">Obnovit</button>
            </div>
          `).join("")
        : '<div class="order-storno-status">Zatím bez storna.</div>'}
    </div>
  `;
  block.querySelector("[data-order-cancel-all]")?.addEventListener("click", cancelEntireOrder);
  block.querySelectorAll("[data-order-storno-restore]").forEach((button) => {
    button.addEventListener("click", () => restoreOrderStornoLine(Number(button.dataset.orderStornoRestore)));
  });
}

function stornoOrderLine(index) {
  const form = els.orderForm;
  const lines = currentActiveOrderLines(form);
  const line = lines[index];
  if (!form || !line) return;
  const rawQuantity = window.prompt(`Kolik ks stornovat u ${line.name}?`, String(Math.max(line.quantity || 1, 1)));
  if (rawQuantity === null) return;
  const stornoQuantity = Number.parseInt(clean(rawQuantity), 10);
  const maxQuantity = Math.max(line.quantity || 1, 1);
  if (!Number.isFinite(stornoQuantity) || stornoQuantity < 1 || stornoQuantity > maxQuantity) {
    toast("Napiš platný počet kusů ke storno.");
    return;
  }
  const note = window.prompt("Důvod storna (volitelně):", "") ?? "";
  const priceInfo = defaultExplicitPriceForOrderLine(line);
  appendOrderFormStornoEntry({
    name: line.name,
    quantity: stornoQuantity,
    unitPrice: priceInfo.amount,
    currency: priceInfo.currency,
    note,
  }, form);
  const next = lines.flatMap((item, itemIndex) => {
    if (itemIndex !== index) return [item.raw];
    const remaining = Math.max(maxQuantity - stornoQuantity, 0);
    if (!remaining) return [];
    const price = clean(item.explicitPrice) ? item.explicitPrice : priceInfo.amount;
    return [buildOrderLineText(item.name, remaining, price, item.explicitCurrency || priceInfo.currency)];
  });
  writeOrderLineText(next);
  els.orderForm.dataset.priceManual = "";
  renderOrderStornoBlock();
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
  toast("Položka přesunuta do storna.");
}

function restoreOrderStornoLine(index) {
  const form = els.orderForm;
  const stornoLines = readOrderFormStornoLines(form);
  const entry = stornoLines[index];
  if (!form || !entry) return;
  const activeLines = currentActiveOrderLines(form);
  const existingIndex = activeLines.findIndex((line) => varietyNameMatchKey(line.name) === varietyNameMatchKey(entry.name));
  if (existingIndex >= 0) {
    const target = activeLines[existingIndex];
    const nextQuantity = Math.max(target.quantity || 1, 1) + Math.max(entry.quantity || 1, 1);
    const price = clean(target.explicitPrice) || clean(entry.unitPrice);
    activeLines[existingIndex] = {
      ...target,
      quantity: nextQuantity,
      explicitPrice: price,
      explicitCurrency: target.explicitCurrency || entry.currency || currentOrderCurrency(),
    };
  } else {
    activeLines.push({
      raw: "",
      name: entry.name,
      quantity: Math.max(entry.quantity || 1, 1),
      explicitPrice: clean(entry.unitPrice),
      explicitCurrency: entry.currency || currentOrderCurrency(),
    });
  }
  writeOrderLineText(activeLines.map((line) => {
    const price = clean(line.explicitPrice);
    return price
      ? buildOrderLineText(line.name, line.quantity, price, line.explicitCurrency || currentOrderCurrency())
      : buildOrderLineText(line.name, line.quantity);
  }));
  writeOrderFormStornoLines(stornoLines.filter((_, itemIndex) => itemIndex !== index), form);
  clearOrderFormCancellation(form);
  els.orderForm.dataset.priceManual = "";
  renderOrderStornoBlock();
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
  toast("Storno vráceno do objednávky.");
}

function cancelEntireOrder() {
  const form = els.orderForm;
  const lines = currentActiveOrderLines(form);
  if (!form || !lines.length) {
    toast("Objednávka už nemá žádné aktivní položky.");
    return;
  }
  const note = window.prompt("Důvod storna celé objednávky (volitelně):", clean(form.elements.cancelledNote?.value)) ;
  if (note === null) return;
  lines.forEach((line) => {
    const priceInfo = defaultExplicitPriceForOrderLine(line);
    appendOrderFormStornoEntry({
      name: line.name,
      quantity: Math.max(line.quantity || 1, 1),
      unitPrice: clean(line.explicitPrice) || priceInfo.amount,
      currency: line.explicitCurrency || priceInfo.currency,
      note: clean(note),
    }, form);
  });
  form.elements.varietiesText.value = "";
  form.elements.shippingFee.value = "";
  delete form.elements.shippingFee.dataset.shippingLabel;
  form.elements.packingFee.value = "";
  form.elements.codFee.value = "";
  form.elements.codAmount.value = "";
  form.elements.cancelledAt.value = new Date().toISOString();
  form.elements.cancelledNote.value = clean(note);
  [...(els.orderExtraFeeFields?.querySelectorAll("[data-order-extra-fee]") || [])].forEach((input) => {
    input.value = "";
  });
  els.orderForm.dataset.priceManual = "";
  els.orderForm.dataset.feesBasePrice = "";
  refreshOrderFeePresetButtons();
  refreshOrderExtraFeeButtons();
  renderOrderStornoBlock();
  autoCalculateOrderPrice({ silent: true });
  syncOrderDialogState();
  toast("Celá objednávka přesunuta do storna.");
}

function sumOrderEstimateLines(lines = [], source) {
  return lines
    .filter((line) => line.source === source)
    .reduce((sum, line) => sum + (Number.isFinite(line.lineTotal) ? line.lineTotal : 0), 0);
}

function amountsMatch(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) < 0.0001;
}

function priceInCurrency(amount, sourceCurrency, targetCurrency, rateValue) {
  const parsed = parseDecimal(amount);
  if (!Number.isFinite(parsed)) return Number.NaN;
  const from = normalizeCurrency(sourceCurrency);
  const to = normalizeCurrency(targetCurrency);
  if (from === to) return parsed;
  if (!Number.isFinite(rateValue)) return Number.NaN;
  return convertAmount(parsed, from, to, rateValue);
}

function currentOrderCurrency() {
  const checked = els.orderForm?.querySelector('input[name="currency"]:checked')?.value;
  return normalizeCurrency(checked || els.orderForm?.dataset.currency || els.orderForm?.elements?.currency?.value || "CZK");
}

function setOrderCurrencyValue(currency) {
  const normalized = normalizeCurrency(currency);
  els.orderForm?.querySelectorAll('input[name="currency"]').forEach((input) => {
    input.checked = normalizeCurrency(input.value) === normalized;
  });
  if (els.orderForm) els.orderForm.dataset.currency = normalized;
  return normalized;
}

function getOrderFeeSummary() {
  const form = els.orderForm;
  const currency = currentOrderCurrency();
  const items = [];
  const shippingFee = parseDecimal(form.elements.shippingFee.value);
  const packingFee = parseDecimal(form.elements.packingFee.value);
  const codFee = parseDecimal(form.elements.codFee.value);

  if (Number.isFinite(shippingFee) && shippingFee > 0) {
    items.push({
      kind: "shipping",
      label: currentOrderShippingLabel(),
      amount: shippingFee,
    });
  }
  if (Number.isFinite(packingFee) && packingFee > 0) items.push({ kind: "packing", label: "Balné", amount: packingFee });
  if (Number.isFinite(codFee) && codFee > 0) items.push({ kind: "cod", label: "Dobírka", amount: codFee });

  normalizeNamedFees(collectOrderExtraFeesFromForm()).forEach((fee) => {
    const amount = parseDecimal(fee.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    items.push({ kind: "extra", label: clean(fee.name) || "Extra", amount });
  });

  return {
    currency,
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  };
}

function currentOrderShippingLabel() {
  const form = els.orderForm;
  if (!form) return "Zásilkovna";
  if (normalizeDeliveryMethod(form.elements.deliveryMethod.value) === "personal_pickup") return "Doprava";
  const explicit = clean(form.elements.shippingFee?.dataset.shippingLabel);
  if (explicit) return explicit;
  return shippingLabelForCustomer(findCustomer(form.elements.customerId.value));
}

function shippingLabelForCustomer(customer) {
  const country = normalize(normalizeCountry(customer?.country || ""));
  if (country.includes("slovensko")) return "Zásilkovna Slovensko";
  if (country.includes("cesko") || country.includes("česko")) return "Zásilkovna ČR";
  return "Zásilkovna";
}

function shippingAddressLabelForCustomer(customer) {
  const country = normalize(normalizeCountry(customer?.country || ""));
  if (country.includes("slovensko")) return "Zásilkovna na adresu Slovensko";
  if (country.includes("cesko") || country.includes("česko")) return "Zásilkovna na adresu ČR";
  return "Zásilkovna na adresu";
}

function shippingLabelForOrder(order = {}) {
  return clean(order.shippingFeeLabel) || shippingLabelForCustomer(findCustomer(order.customerId));
}

function formatOrderFeeButtonLabel(label, amount, currency) {
  const parsedAmount = parseDecimal(amount);
  return Number.isFinite(parsedAmount) && parsedAmount > 0
    ? `${label} · ${formatMoney(parsedAmount, currency)}`
    : label;
}

function refreshOrderFeePresetButtons() {
  const form = els.orderForm;
  if (!form) return;
  const settings = feeSettings();
  const currency = currentOrderCurrency();
  const shippingLabel = currentOrderShippingLabel();
  const shippingValue = parseDecimal(form.elements.shippingFee.value);
  const packingValue = parseDecimal(form.elements.packingFee.value);
  const codValue = parseDecimal(form.elements.codFee.value);
  const delivery = normalizeDeliveryMethod(form.elements.deliveryMethod.value);
  const defaultCodFee = defaultCodFeeForCustomer(settings, currentOrderCustomer());

  form.querySelectorAll("[data-order-fee-preset]").forEach((button) => {
    const preset = button.dataset.orderFeePreset;
    let label = button.textContent.trim();
    let displayAmount = "";
    let active = false;

    if (preset === "shipping-cz") {
      label = "Zásilkovna ČR";
      displayAmount = shippingLabel === label && Number.isFinite(shippingValue) ? form.elements.shippingFee.value : settings.shippingFeeCz;
      active = delivery !== "personal_pickup" && shippingLabel === label && Number.isFinite(shippingValue) && shippingValue > 0;
    } else if (preset === "shipping-sk") {
      label = "Zásilkovna SK";
      displayAmount = shippingLabel === "Zásilkovna Slovensko" && Number.isFinite(shippingValue) ? form.elements.shippingFee.value : settings.shippingFeeSk;
      active = delivery !== "personal_pickup" && shippingLabel === "Zásilkovna Slovensko" && Number.isFinite(shippingValue) && shippingValue > 0;
    } else if (preset === "shipping-post") {
      label = "Balíkovna";
      displayAmount = shippingLabel === label && Number.isFinite(shippingValue) ? form.elements.shippingFee.value : settings.postalFee;
      active = delivery !== "personal_pickup" && shippingLabel === label && Number.isFinite(shippingValue) && shippingValue > 0;
    } else if (preset === "shipping-address") {
      label = "Zásilkovna na adresu";
      displayAmount = isShippingAddressLabel(shippingLabel) && Number.isFinite(shippingValue)
        ? form.elements.shippingFee.value
        : defaultShippingAddressFeeForCustomer(settings, currentOrderCustomer());
      active = delivery !== "personal_pickup" && isShippingAddressLabel(shippingLabel) && Number.isFinite(shippingValue) && shippingValue > 0;
    } else if (preset === "packing") {
      label = "Balné";
      displayAmount = Number.isFinite(packingValue) && packingValue > 0 ? form.elements.packingFee.value : settings.packingFee;
      active = Number.isFinite(packingValue) && packingValue > 0;
    } else if (preset === "cod") {
      label = "Dobírka";
      displayAmount = Number.isFinite(codValue) && codValue > 0 ? form.elements.codFee.value : defaultCodFee;
      active = Number.isFinite(codValue) && codValue > 0;
    }

    button.textContent = formatOrderFeeButtonLabel(label, displayAmount, currency);
    button.classList.toggle("is-active", active);
  });
}

function refreshOrderExtraFeeButtons() {
  const form = els.orderForm;
  if (!form || !els.orderExtraFeeFields) return;
  const currency = currentOrderCurrency();
  els.orderExtraFeeFields.querySelectorAll("[data-order-extra-fee-row]").forEach((row) => {
    const label = clean(row.dataset.orderExtraFeeName) || "Extra";
    const hiddenInput = row.querySelector("[data-order-extra-fee]");
    const button = row.querySelector("[data-order-extra-fee-toggle]");
    if (!hiddenInput || !button) return;
    const activeAmount = clean(hiddenInput.value);
    const defaultAmount = clean(row.dataset.orderExtraFeeDefault);
    button.textContent = formatOrderFeeButtonLabel(label, activeAmount || defaultAmount, currency);
    button.classList.toggle("is-active", Boolean(activeAmount));
  });
}

function toggleOrderExtraFee(feeId) {
  const form = els.orderForm;
  const row = els.orderExtraFeeFields?.querySelector(`[data-order-extra-fee-row="${CSS.escape(feeId)}"]`);
  if (!row || !form) return;
  const input = row.querySelector("[data-order-extra-fee]");
  if (!input) return;
  const defaultAmount = clean(row.dataset.orderExtraFeeDefault);
  if (!clean(input.value) && normalizeDeliveryMethod(form.elements.deliveryMethod.value) === "personal_pickup") {
    form.elements.deliveryMethod.value = "ship";
  }
  input.value = clean(input.value) ? "" : defaultAmount;
  refreshOrderExtraFeeButtons();
  form.dataset.lastDeliveryMethod = normalizeDeliveryMethod(form.elements.deliveryMethod.value || "ship");
  syncOrderPaymentFieldTone();
  syncOrderPaymentToggle();
  syncOrderDeliveryToggle();
  refreshOrderPricingPreview();
  syncOrderDialogState();
}

function applyDefaultCodFeeForSelectedCustomer({ force = false } = {}) {
  const form = els.orderForm;
  if (!form) return;
  if (normalizeDeliveryMethod(form.elements.deliveryMethod.value) === "personal_pickup") {
    form.elements.codFee.value = "";
    return;
  }
  if (!force && !clean(form.elements.codFee.value)) return;
  form.elements.codFee.value = defaultCodFeeForCustomer(feeSettings(), currentOrderCustomer()) || "";
}

function calculateCurrentOrderFinalTotal(estimate = null, options = {}) {
  const form = els.orderForm;
  if (!form) return Number.NaN;
  const feeSummary = options.feeSummary || getOrderFeeSummary();
  const currentPrice = parseDecimal(form.elements.price.value);
  const feesAlreadyAdded = Number.isFinite(parseDecimal(form.dataset.feesBasePrice)) && feeSummary.total > 0;
  const manualFinal = options.isManual === true || form.dataset.priceManual === "1";

  if (feesAlreadyAdded && Number.isFinite(currentPrice)) return currentPrice;
  if (estimate?.hasLines) return estimate.total + feeSummary.total;
  if (Number.isFinite(currentPrice)) return manualFinal ? currentPrice : currentPrice + feeSummary.total;
  return Number.NaN;
}

function renderOrderTotalHighlight(estimate = null, isManual = false) {
  if (!els.orderTotalHighlight) return;
  const feeSummary = getOrderFeeSummary();
  const total = calculateCurrentOrderFinalTotal(estimate, { feeSummary, isManual });

  if (!Number.isFinite(total)) {
    els.orderTotalHighlight.innerHTML = "";
    clearOrderForeignTotalHint();
    return Number.NaN;
  }

  const currency = normalizeCurrency(currentOrderCurrency() || estimate?.currency);
  els.orderTotalHighlight.innerHTML = `<span>Celkem v ceně</span>
    <div class="order-total-amounts">
      <strong>${escapeHtml(formatMoney(total, currency))}</strong>
    </div>`;
  return total;
}

function renderOrderFeeInlinePreview(estimate = null, isManual = false) {
  if (!els.orderFeePreview) return;
  const feeSummary = getOrderFeeSummary();
  refreshOrderFeePresetButtons();
  refreshOrderExtraFeeButtons();
  const total = renderOrderTotalHighlight(estimate, isManual);
  void refreshCurrentOrderForeignTotalHint(total);
  if (feeSummary.total <= 0) {
    els.orderFeePreview.textContent = "";
    if (state.orderPaymentQrVisible) void refreshCurrentOrderPaymentQr();
    return;
  }
  const lines = feeSummary.items.map((item) => `${item.label} ${formatMoney(item.amount, feeSummary.currency)}`);
  els.orderFeePreview.textContent = lines.join("\n");
  if (state.orderPaymentQrVisible) void refreshCurrentOrderPaymentQr();
}

function orderFeeLinesFromSummary(feeSummary, options = {}) {
  if (!feeSummary?.items?.length) return [];
  return feeSummary.items.map((item) => `${item.label} ${formatMoney(item.amount, feeSummary.currency)}`);
}

function paymentDetailsLines(settings = feeSettings()) {
  const lines = [];
  if (clean(settings.paymentAccountName)) lines.push(`Jméno a příjmení: ${settings.paymentAccountName}`);
  if (clean(settings.paymentAccountNumber)) lines.push(`Číslo účtu: ${settings.paymentAccountNumber}`);
  if (clean(settings.paymentIban)) lines.push(`IBAN: ${settings.paymentIban}`);
  if (clean(settings.paymentSwift)) lines.push(`SWIFT / BIC: ${settings.paymentSwift}`);
  return lines;
}

function clearOrderForeignTotalHint() {
  if (!els.orderForeignTotalHint) return;
  els.orderForeignTotalHint.hidden = true;
  els.orderForeignTotalHint.textContent = "";
}

function shortForeignRateNote(note = "") {
  const normalized = normalize(note);
  if (!normalized) return "";
  if (normalized.includes("dnesnim kurzem")) return "dnešní kurz";
  return "aktuální kurz";
}

function currentOrderCustomer() {
  return findCustomer(els.orderForm?.elements?.customerId?.value);
}

function paymentCountryModeFromCustomerCountry(country) {
  const normalized = normalize(clean(country));
  if (!normalized) return "";
  if (["cz", "cr"].includes(normalized) || normalized.includes("cesko") || normalized.includes("ceska republika") || normalized.includes("czech")) {
    return "cz";
  }
  return "foreign";
}

function paymentCountryLabel(mode) {
  if (mode === "foreign") return "zahraničí";
  if (mode === "cz") return "Česko";
  return "bez země";
}

function submitOrderCountryPromptChoice(choice = "") {
  if (els.orderCountryPromptDialog?.open) {
    if (typeof els.orderCountryPromptDialog.close === "function") els.orderCountryPromptDialog.close(choice || "cancel");
    else els.orderCountryPromptDialog.removeAttribute("open");
  }
  const resolve = state.orderCountryPromptResolve;
  state.orderCountryPromptResolve = null;
  state.orderCountryPromptPromise = null;
  if (resolve) resolve(choice || "");
}

async function promptOrderPaymentCountryChoice() {
  if (state.orderCountryPromptPromise) return state.orderCountryPromptPromise;
  if (!els.orderCountryPromptDialog) {
    return window.confirm("Zákazník nemá vyplněnou zemi. Použít pro tuto platbu Česko? Storno = zahraničí.")
      ? "cz"
      : "foreign";
  }
  state.orderCountryPromptPromise = new Promise((resolve) => {
    state.orderCountryPromptResolve = resolve;
  });
  showDialog(els.orderCountryPromptDialog);
  return state.orderCountryPromptPromise;
}

async function resolveCurrentOrderPaymentCountryMode(options = {}) {
  const customer = options.customer || currentOrderCustomer();
  const knownMode = paymentCountryModeFromCustomerCountry(customer?.country);
  if (knownMode) {
    return {
      mode: knownMode,
      label: paymentCountryLabel(knownMode),
      from: "customer",
    };
  }

  const override = state.orderPaymentCountryOverride === "foreign" || state.orderPaymentCountryOverride === "cz"
    ? state.orderPaymentCountryOverride
    : "";
  if (override) {
    return {
      mode: override,
      label: paymentCountryLabel(override),
      from: "override",
    };
  }

  if (!options.promptIfMissing) {
    return {
      mode: "",
      label: paymentCountryLabel(""),
      from: "missing",
    };
  }

  const choice = await promptOrderPaymentCountryChoice();
  if (!choice) {
    return {
      mode: "",
      label: paymentCountryLabel(""),
      from: "cancelled",
    };
  }
  state.orderPaymentCountryOverride = choice;
  return {
    mode: choice,
    label: paymentCountryLabel(choice),
    from: "override",
  };
}

async function resolveForeignPaymentExchangeRate(orderDate, sourceCurrency = "CZK") {
  const normalizedSourceCurrency = normalizeCurrency(sourceCurrency);
  if (normalizedSourceCurrency === "EUR") {
    return {
      rate: 1,
      source: "objednávka",
      date: clean(orderDate) || toDateInput(new Date()),
      note: "",
      usedFallback: false,
    };
  }

  const targetDate = clean(orderDate) || toDateInput(new Date());
  const exact = exactExchangeRateForDate(targetDate);
  if (exact?.rateCzkPerEur) {
    return {
      rate: exact.rateCzkPerEur,
      source: exact.source,
      date: exact.date,
      note: "",
      usedFallback: false,
    };
  }

  const today = toDateInput(new Date());
  try {
    const todayRate = await getOrFetchExchangeRateForDate(today);
    return {
      rate: todayRate.rate,
      source: todayRate.source,
      date: todayRate.date || today,
      note: todayRate?.date === today
        ? "EUR částka je dopočtená dnešním kurzem."
        : "EUR částka je dopočtená aktuálně dostupným kurzem.",
      usedFallback: true,
    };
  } catch {
    const fallback = storedExchangeRateForDate(today);
    if (!fallback?.rate) return null;
    return {
      rate: fallback.rate,
      source: fallback.source,
      date: fallback.date || today,
      note: "EUR částka je dopočtená aktuálně dostupným kurzem.",
      usedFallback: true,
    };
  }
}

async function buildOrderPaymentDescriptor({ order, customer, promptIfMissingCountry = false } = {}) {
  const primaryCurrency = normalizeCurrency(order?.currency);
  const primaryTotal = parseDecimal(order?.price);
  const countryDecision = await resolveCurrentOrderPaymentCountryMode({ customer, promptIfMissing: promptIfMissingCountry });
  const isDomestic = countryDecision.mode === "cz";
  const isForeign = countryDecision.mode === "foreign";

  let foreignTotal = Number.NaN;
  let rateInfo = null;
  if (isForeign && Number.isFinite(primaryTotal) && primaryTotal >= 0) {
    rateInfo = await resolveForeignPaymentExchangeRate(order?.orderDate, primaryCurrency);
    if (primaryCurrency === "EUR") foreignTotal = primaryTotal;
    else if (rateInfo?.rate) foreignTotal = convertAmount(primaryTotal, primaryCurrency, "EUR", rateInfo.rate);
  }

  return {
    countryMode: countryDecision.mode,
    countryLabel: countryDecision.label,
    isDomestic,
    isForeign,
    primaryCurrency,
    primaryTotal,
    foreignTotal,
    foreignNote: rateInfo?.note || "",
    rateInfo,
    qrLabel: (isDomestic || isForeign) ? "PAY by square" : "",
  };
}

async function buildCurrentOrderPaymentContext(options = {}) {
  const form = els.orderForm;
  if (!form) return { ok: false, message: "Objednávku se teď nepodařilo připravit." };

  const customer = currentOrderCustomer();
  const paymentStatus = parsePaymentStatus(form.elements.paymentStatus.value);
  const summaryLines = clean(form.elements.varietiesText.value).split(/\n+/).map(clean).filter(Boolean);
  if (options.requireSummaryLines && !summaryLines.length) {
    return { ok: false, message: "Nejdřív doplň přehled objednávky." };
  }

  const feeSummary = getOrderFeeSummary();
  const estimate = await estimateOrderPriceFromVarieties().catch(() => null);
  const total = calculateCurrentOrderFinalTotal(estimate, { feeSummary });
  if (options.requirePositiveTotal && (!Number.isFinite(total) || total <= 0)) {
    return { ok: false, message: "Nejdřív doplň platnou finální částku objednávky." };
  }

  const settings = feeSettings();
  const detailLines = paymentDetailsLines(settings);
  if (options.requirePaymentDetails && !detailLines.length) {
    return { ok: false, message: "V Nastavení chybí platební údaje." };
  }

  const order = {
    customerId: clean(form.elements.customerId.value),
    orderDate: clean(form.elements.orderDate.value) || toDateInput(new Date()),
    varietiesText: summaryLines.join("\n"),
    price: Number.isFinite(total) ? total : clean(form.elements.price.value),
    currency: currentOrderCurrency(),
    paymentStatus,
    shippingFee: clean(form.elements.shippingFee.value),
    shippingFeeLabel: clean(form.elements.shippingFee.dataset.shippingLabel),
    packingFee: clean(form.elements.packingFee.value),
    codFee: clean(form.elements.codFee.value),
    extraFees: collectOrderExtraFeesFromForm(),
  };

  const payment = await buildOrderPaymentDescriptor({
    order,
    customer,
    promptIfMissingCountry: options.promptIfMissingCountry,
  });

  if (options.promptIfMissingCountry && !payment.countryMode) {
    return { ok: false, message: "Nejdřív vyber, jestli jde o Česko nebo zahraničí." };
  }
  if (payment.isForeign && options.requireForeignAmount && !Number.isFinite(payment.foreignTotal)) {
    return { ok: false, message: "Pro zahraniční platbu se teď nepodařilo dopočítat EUR částku." };
  }

  return {
    ok: true,
    customer,
    summaryLines,
    feeSummary,
    total,
    order,
    settings,
    paymentStatus,
    payment,
    paymentDetails: detailLines,
    lines: [...summaryLines, ...orderFeeLinesFromSummary(feeSummary)],
  };
}

function buildCustomerPaymentTextFromContext(context) {
  const textParts = [
    "Dobrý den,",
    "posílám přehled objednávky:",
    "",
    ...context.lines,
    "",
  ];

  if (context.payment.isForeign && Number.isFinite(context.payment.foreignTotal)) {
    textParts.push(`Celkem v CZK: ${formatMoney(context.total || 0, context.order.currency)}`);
    textParts.push(`K úhradě v EUR: ${formatMoney(context.payment.foreignTotal, "EUR")}`);
    if (context.payment.foreignNote) textParts.push(context.payment.foreignNote);
  } else {
    textParts.push(`Celkem: ${formatMoney(context.total || 0, context.order.currency)}`);
  }

  const details = [...context.paymentDetails];
  textParts.push("", "Údaje k platbě:", ...details, "", "Děkuji.");
  return textParts.join("\n");
}

async function refreshCurrentOrderForeignTotalHint(total) {
  if (!els.orderForeignTotalHint) return;
  const requestId = ++state.orderPaymentPreviewRequestId;
  if (!Number.isFinite(total) || total <= 0) {
    clearOrderForeignTotalHint();
    return;
  }

  const payment = await buildOrderPaymentDescriptor({
    order: {
      orderDate: clean(els.orderForm?.elements?.orderDate?.value) || toDateInput(new Date()),
      price: total,
      currency: currentOrderCurrency(),
    },
    customer: currentOrderCustomer(),
    promptIfMissingCountry: false,
  });

  if (requestId !== state.orderPaymentPreviewRequestId || !els.orderDialog?.open) return;
  if (!payment.isForeign || !Number.isFinite(payment.foreignTotal)) {
    clearOrderForeignTotalHint();
    return;
  }

  els.orderForeignTotalHint.hidden = false;
  els.orderForeignTotalHint.textContent = `K úhradě v EUR: ${formatMoney(payment.foreignTotal, "EUR")}${payment.foreignNote ? ` · ${shortForeignRateNote(payment.foreignNote)}` : ""}`;
}

function applyOrderFeePreset(preset) {
  const settings = feeSettings();
  const form = els.orderForm;
  if (!form) return;

  if (preset === "shipping-cz") {
    const isActive = currentOrderShippingLabel() === "Zásilkovna ČR" && Number.isFinite(parseDecimal(form.elements.shippingFee.value));
    if (isActive) {
      form.elements.shippingFee.value = "";
      delete form.elements.shippingFee.dataset.shippingLabel;
    } else {
      form.elements.deliveryMethod.value = "ship";
      form.elements.shippingFee.value = settings.shippingFeeCz || "";
      form.elements.shippingFee.dataset.shippingLabel = "Zásilkovna ČR";
    }
  }
  if (preset === "shipping-sk") {
    const isActive = currentOrderShippingLabel() === "Zásilkovna Slovensko" && Number.isFinite(parseDecimal(form.elements.shippingFee.value));
    if (isActive) {
      form.elements.shippingFee.value = "";
      delete form.elements.shippingFee.dataset.shippingLabel;
    } else {
      form.elements.deliveryMethod.value = "ship";
      form.elements.shippingFee.value = settings.shippingFeeSk || "";
      form.elements.shippingFee.dataset.shippingLabel = "Zásilkovna Slovensko";
    }
  }
  if (preset === "shipping-post") {
    const isActive = currentOrderShippingLabel() === "Balíkovna" && Number.isFinite(parseDecimal(form.elements.shippingFee.value));
    if (isActive) {
      form.elements.shippingFee.value = "";
      delete form.elements.shippingFee.dataset.shippingLabel;
    } else {
      form.elements.deliveryMethod.value = "ship";
      form.elements.shippingFee.value = settings.postalFee || "";
      form.elements.shippingFee.dataset.shippingLabel = "Balíkovna";
    }
  }
  if (preset === "shipping-address") {
    const isActive = isShippingAddressLabel(currentOrderShippingLabel()) && Number.isFinite(parseDecimal(form.elements.shippingFee.value));
    if (isActive) {
      form.elements.shippingFee.value = "";
      delete form.elements.shippingFee.dataset.shippingLabel;
    } else {
      form.elements.deliveryMethod.value = "ship";
      form.elements.shippingFee.value = defaultShippingAddressFeeForCustomer(settings, currentOrderCustomer()) || "";
      form.elements.shippingFee.dataset.shippingLabel = shippingAddressLabelForCustomer(currentOrderCustomer());
    }
  }
  if (preset === "packing") {
    if (!clean(form.elements.packingFee.value) && normalizeDeliveryMethod(form.elements.deliveryMethod.value) === "personal_pickup") {
      form.elements.deliveryMethod.value = "ship";
    }
    form.elements.packingFee.value = clean(form.elements.packingFee.value) ? "" : settings.packingFee || "";
  }
  if (preset === "cod") {
    if (!clean(form.elements.codFee.value) && normalizeDeliveryMethod(form.elements.deliveryMethod.value) === "personal_pickup") {
      form.elements.deliveryMethod.value = "ship";
    }
    form.elements.codFee.value = clean(form.elements.codFee.value) ? "" : defaultCodFeeForCustomer(settings, currentOrderCustomer()) || "";
    form.elements.codAmount.value = "";
  }
  form.dataset.lastDeliveryMethod = normalizeDeliveryMethod(form.elements.deliveryMethod.value || "ship");
  syncOrderPaymentFieldTone();
  syncOrderPaymentToggle();
  syncOrderDeliveryToggle();
  refreshOrderPricingPreview();
  syncOrderDialogState();
}

async function copyCurrentOrderCustomerText() {
  const text = await customerPaymentTextFromCurrentOrder(true);
  if (!text) return;
  copyText(text, "Text pro zákazníka zkopírován.");
}

async function customerPaymentTextFromCurrentOrder(promptIfCountryMissing = false) {
  const context = await buildCurrentOrderPaymentContext({
    requireSummaryLines: true,
    requirePositiveTotal: true,
    requirePaymentDetails: true,
    promptIfMissingCountry: promptIfCountryMissing,
    requireForeignAmount: true,
  });
  if (!context.ok) {
    toast(context.message);
    return "";
  }
  return buildCustomerPaymentTextFromContext(context);
}

async function downloadCurrentOrderCustomerImage() {
  const context = await buildCurrentOrderPaymentContext({
    requireSummaryLines: true,
    requirePositiveTotal: true,
    requirePaymentDetails: true,
    promptIfMissingCountry: true,
    requireForeignAmount: true,
  });
  if (!context.ok) {
    toast(context.message);
    return;
  }

  const text = buildCustomerPaymentTextFromContext(context);
  const qrState = context.paymentStatus === "dobírka"
    ? null
    : await buildCurrentOrderPaymentQrState({ context });

  if (qrState && !qrState.ok) {
    toast(qrState.message);
    return;
  }

  const canvas = renderCurrentOrderCustomerImageCanvas(text, qrState, context);
  downloadCanvasAsPng(canvas, buildOrderPaymentFileName("objednavka"));
  toast("Obrázek pro zákazníka stažen.");
}

async function toggleCurrentOrderPaymentQr() {
  if (!state.orderPaymentQrVisible && parsePaymentStatus(els.orderForm?.elements?.paymentStatus?.value) !== "dobírka") {
    const countryChoice = await resolveCurrentOrderPaymentCountryMode({ promptIfMissing: true });
    if (!countryChoice.mode) return;
    const currentTotal = parseDecimal(els.orderForm?.elements?.price?.value);
    void refreshCurrentOrderForeignTotalHint(currentTotal);
  }
  state.orderPaymentQrVisible = !state.orderPaymentQrVisible;
  if (els.orderPaymentQrPanel) els.orderPaymentQrPanel.hidden = !state.orderPaymentQrVisible;
  if (els.toggleOrderPaymentQrBtn) {
    els.toggleOrderPaymentQrBtn.textContent = state.orderPaymentQrVisible ? "Skrýt QR k platbě" : "QR k platbě";
  }
  if (state.orderPaymentQrVisible) {
    await refreshCurrentOrderPaymentQr();
  }
}

async function refreshCurrentOrderPaymentQr() {
  if (!state.orderPaymentQrVisible || !els.orderDialog?.open || !els.orderPaymentQrCanvas) return;
  const requestId = ++state.orderPaymentQrRequestId;
  const nextState = await buildCurrentOrderPaymentQrState();
  if (requestId !== state.orderPaymentQrRequestId || !state.orderPaymentQrVisible) return;
  state.orderPaymentQrState = nextState?.ok ? nextState : null;
  renderCurrentOrderPaymentQr(nextState);
}

async function buildCurrentOrderPaymentQrState(options = {}) {
  const context = options.context || await buildCurrentOrderPaymentContext({
    requirePositiveTotal: true,
    requirePaymentDetails: true,
    promptIfMissingCountry: true,
    requireForeignAmount: true,
  });
  if (!context?.ok) {
    return { ok: false, message: context?.message || "QR kód se teď nepodařilo připravit." };
  }

  if (context.paymentStatus === "dobírka") {
    return { ok: false, message: "U dobírky se QR pro převod negeneruje." };
  }

  const iban = clean(context.settings.paymentIban).replace(/\s+/g, "").toUpperCase();
  if (!iban) {
    return { ok: false, message: "V Nastavení chybí IBAN pro QR platbu." };
  }

  const accountName = clean(context.settings.paymentAccountName);
  const reference = buildCurrentOrderPaymentQrMessage(context.customer, context.order.orderDate);
  let qrAmount = context.total;
  let qrCurrency = normalizeCurrency(context.order.currency);
  let payload = "";
  let standardLabel = "PAY by square";

  if (!window.PayBySquareEncoder?.encodePayment) {
    return { ok: false, message: "PAY by square se teď nepodařilo načíst." };
  }

  if (context.payment.isForeign) {
    qrAmount = context.payment.foreignTotal;
    qrCurrency = "EUR";
  }

  payload = buildPayBySquarePayload({
    iban,
    bic: clean(context.settings.paymentSwift).replace(/\s+/g, "").toUpperCase(),
    amount: qrAmount,
    currency: qrCurrency,
    beneficiaryName: accountName,
    message: reference,
  });

  const qr = createPaymentQrCode(payload);
  const summaryText = context.payment.isForeign
    ? `QR platba zahraničí · ${formatMoney(qrAmount, qrCurrency)}${context.payment.foreignNote ? ` · ${shortForeignRateNote(context.payment.foreignNote)}` : ""}`
    : `QR platba Česko · ${formatMoney(qrAmount, qrCurrency)} · PAY by square`;

  return {
    ok: true,
    matrix: qr.modules,
    total: qrAmount,
    currency: qrCurrency,
    iban,
    accountName,
    standardLabel,
    message: summaryText,
  };
}

function renderCurrentOrderPaymentQr(qrState) {
  const canvas = els.orderPaymentQrCanvas;
  if (!canvas) return;
  clearPaymentQrCanvas(canvas);

  if (!qrState?.ok) {
    canvas.dataset.qrReady = "0";
    if (els.orderPaymentQrText) {
      els.orderPaymentQrText.textContent = qrState?.message || "QR kód se teď nepodařilo připravit.";
    }
    if (els.downloadOrderPaymentQrBtn) els.downloadOrderPaymentQrBtn.hidden = true;
    return;
  }

  drawQrMatrixToCanvas(canvas, qrState.matrix, ORDER_PAYMENT_QR_SIZE);
  canvas.dataset.qrReady = "1";
  if (els.orderPaymentQrText) els.orderPaymentQrText.textContent = qrState.message;
  if (els.downloadOrderPaymentQrBtn) els.downloadOrderPaymentQrBtn.hidden = false;
}

function downloadCurrentOrderPaymentQr() {
  const canvas = els.orderPaymentQrCanvas;
  if (!canvas || canvas.dataset.qrReady !== "1") {
    toast("Nejdřív zobraz QR kód k platbě.");
    return;
  }
  downloadCanvasAsPng(canvas, buildOrderPaymentFileName("qr-platba"));
}

function renderCurrentOrderCustomerImageCanvas(text, qrState = null, contextData = null) {
  const lines = String(text || "").split(/\r?\n/);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const padding = 42;
  const logo = CUSTOMER_IMAGE_BRAND_LOGO;
  const hasLogo = Boolean(logo?.complete && logo.naturalWidth && logo.naturalHeight);
  const logoSize = hasLogo ? 82 : 0;
  const qrCardWidth = qrState?.ok ? ORDER_CUSTOMER_IMAGE_QR_SIZE + 32 : 0;
  const qrBlockWidth = qrCardWidth ? qrCardWidth + 26 : 0;
  const bodyWidth = ORDER_CUSTOMER_IMAGE_WIDTH - padding * 2 - qrBlockWidth;
  const wrappedLines = [];
  const bodyFont = "21px 'Segoe UI', Arial, sans-serif";
  const titleFont = "700 38px 'Iowan Old Style', Georgia, serif";
  const metaFont = "600 18px 'Segoe UI', Arial, sans-serif";
  const orderDateLabel = formatDate(clean(contextData?.order?.orderDate) || clean(els.orderForm?.elements?.orderDate?.value) || toDateInput(new Date()));
  const customerLabel = customerName(contextData?.customer || currentOrderCustomer()) || "zákazníka";
  const headerLine = `Připraveno pro ${customerLabel} · ${orderDateLabel}`;
  const headerX = padding + (logoSize ? logoSize + 18 : 0);
  const headerLines = wrapCanvasText(context, headerLine, bodyWidth, metaFont);

  context.font = bodyFont;
  lines.forEach((line) => {
    const normalizedLine = normalize(line);
    if (
      normalizedLine.startsWith("eur castka je dopoctena")
      || normalizedLine === "dnesni kurz"
      || normalizedLine === "aktualni kurz"
    ) return;
    if (!line.trim()) {
      wrappedLines.push({ text: "", font: bodyFont, color: "#445446", gap: 10 });
      return;
    }
    const font = normalizedLine.startsWith("celkem") || normalizedLine.startsWith("k uhrade")
      ? "700 24px 'Segoe UI', Arial, sans-serif"
      : normalizedLine.startsWith("udaje k platbe:") || normalizedLine.startsWith("qr platba:")
        ? metaFont
        : bodyFont;
    const color = normalizedLine.startsWith("k uhrade") ? "#184c38" : "#213529";
    wrapCanvasText(context, line, bodyWidth, font).forEach((item) => {
      wrappedLines.push({ text: item, font, color, gap: 6 });
    });
  });

  const textHeight = wrappedLines.reduce((sum, line) => sum + lineHeightForFont(line.font) + line.gap, 0);
  const headerHeight = Math.max(logoSize || 0, 62 + Math.max(0, headerLines.length - 1) * 24);
  const contentTop = padding + headerHeight + 32;
  const qrHeight = qrState?.ok ? ORDER_CUSTOMER_IMAGE_QR_SIZE + 56 : 0;
  const height = Math.max(440, contentTop + Math.max(textHeight, qrHeight) + padding);

  canvas.width = ORDER_CUSTOMER_IMAGE_WIDTH;
  canvas.height = height;

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#fffdf8");
  background.addColorStop(1, "#f2f5ee");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (hasLogo) drawCustomerImageBrandLogo(context, logo, padding, padding, logoSize);

  context.fillStyle = "#173126";
  context.font = titleFont;
  context.fillText("Africké kopřivy", headerX, padding + 20);

  context.font = metaFont;
  context.fillStyle = "#5f6f61";
  headerLines.forEach((line, index) => {
    context.fillText(line, headerX, padding + 56 + index * 24);
  });

  context.fillStyle = "rgba(63, 109, 85, 0.16)";
  context.fillRect(headerX, padding + headerHeight + 8, Math.min(bodyWidth, 170), 2);

  let y = contentTop;
  wrappedLines.forEach((line) => {
    if (!line.text) {
      y += line.gap + 8;
      return;
    }
    context.font = line.font;
    context.fillStyle = line.color;
    context.fillText(line.text, padding, y);
    y += lineHeightForFont(line.font) + line.gap;
  });

  if (qrState?.ok) {
    const qrCanvas = document.createElement("canvas");
    drawQrMatrixToCanvas(qrCanvas, qrState.matrix, ORDER_CUSTOMER_IMAGE_QR_SIZE);
    const qrCardX = canvas.width - padding - qrCardWidth;
    const qrCardY = padding + 2;
    const qrX = qrCardX + 16;
    const qrY = qrCardY + 34;

    context.fillStyle = "#ffffff";
    roundRect(context, qrCardX, qrCardY, qrCardWidth, ORDER_CUSTOMER_IMAGE_QR_SIZE + 52, 26);
    context.fill();

    context.drawImage(qrCanvas, qrX, qrY);
    context.fillStyle = "#173126";
    context.font = "700 18px 'Segoe UI', Arial, sans-serif";
    context.fillText("QR k platbě", qrX, qrCardY + 24);
  }

  return canvas;
}

async function downloadCrossCard(id) {
  const cross = findCross(id);
  if (!cross) return;
  try {
    const canvas = await renderCrossCardCanvas(cross);
    downloadCanvasAsPng(canvas, `${safeFileName(`krizeni-${crossLineageLabel(cross)}`, "krizeni")}.png`);
    toast("Obrázek křížení stažen.");
  } catch {
    toast("Obrázek křížení se nepodařilo vytvořit.");
  }
}

async function renderCrossCardCanvas(cross) {
  const mother = findVariety(cross.motherVarietyId);
  const pollen = findVariety(cross.pollenVarietyId);
  const seedlingName = clean(cross.seedlingName) || "Semenáč";
  const cards = [
    { role: "MATKA", name: mother?.name || "Matka", image: varietyImages(mother)[0] },
    { role: "PYL", name: pollen?.name || "Pyl", image: varietyImages(pollen)[0] },
    { role: "SEMENÁČ", name: seedlingName, image: crossSeedlingMainPhoto(cross), accent: true },
  ];
  const loaded = await Promise.all(cards.map(async (card) => ({ ...card, imageNode: await loadCanvasPhoto(card.image) })));

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1500;
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#fffdf6");
  background.addColorStop(0.55, "#eef8ee");
  background.addColorStop(1, "#d7f3df");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const logo = CUSTOMER_IMAGE_BRAND_LOGO;
  const hasLogo = Boolean(logo?.complete && logo.naturalWidth && logo.naturalHeight);
  drawCrossCardActor(context, loaded[0], 70, 70, 395, 405, { imageHeight: 280, nameFont: 26, padding: 16, compact: true });
  drawCrossCardActor(context, loaded[1], 615, 70, 395, 405, { imageHeight: 280, nameFont: 26, padding: 16, compact: true });
  drawHeroSeedling(context, loaded[2], 70, 520, 940, 875);

  context.fillStyle = "#15563d";
  context.font = "800 58px 'Segoe UI', Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("x", 540, 275);
  context.fillText("=", 540, 505);
  context.textAlign = "left";
  return canvas;
}

function drawCrossCardActor(context, card, x, y, width, height, options = {}) {
  context.save();
  const actorGradient = context.createLinearGradient(x, y, x + width, y + height);
  actorGradient.addColorStop(0, card.accent ? "#eefbf1" : "#fffefa");
  actorGradient.addColorStop(1, card.accent ? "#d9f4e5" : "#fbf5e8");
  context.fillStyle = actorGradient;
  roundRect(context, x, y, width, height, 34);
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
  roundRect(context, imageX, imageY, imageW, imageH, 24);
  context.fill();
  if (card.imageNode) {
    context.save();
    roundRect(context, imageX, imageY, imageW, imageH, 24);
    context.clip();
    drawContainedImage(context, card.imageNode, imageX, imageY, imageW, imageH);
    context.restore();
  } else {
    context.fillStyle = "#15563d";
    context.font = "800 70px 'Segoe UI', Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(varietyInitials(card.name), imageX + imageW / 2, imageY + imageH / 2 + 22);
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
  wrapCanvasText(context, card.name, width - padding * 2, context.font).slice(0, options.compact ? 2 : 3).forEach((line, index) => {
    context.fillText(line, textX, labelY + nameFontSize + 8 + index * (card.accent ? 54 : 34));
  });
  context.restore();
}

function drawHeroSeedling(context, card, x, y, width, height) {
  context.save();
  const imageH = height - 18;
  const imageW = width;
  if (card.imageNode) {
    context.save();
    roundRect(context, x, y, imageW, imageH, 36);
    context.clip();
    drawContainedImage(context, card.imageNode, x, y, imageW, imageH);
    context.restore();
  } else {
    context.fillStyle = "#e3f3e8";
    roundRect(context, x, y, imageW, imageH, 36);
    context.fill();
    context.fillStyle = "#15563d";
    context.font = "900 120px 'Segoe UI', Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(varietyInitials(card.name), x + imageW / 2, y + imageH / 2 + 40);
    context.textAlign = "left";
  }
  context.textAlign = "center";
  const hasCustomName = normalize(card.name) !== "semenac";
  context.fillStyle = "#123629";
  context.font = "900 58px 'Segoe UI', Arial, sans-serif";
  wrapCanvasText(context, hasCustomName ? card.name : "Semenáč", width - 80, context.font).slice(0, 2).forEach((line, index) => {
    context.fillText(line, x + width / 2, y + imageH + 58 + index * 64);
  });
  context.textAlign = "left";
  context.restore();
}

function drawContainedImage(context, image, x, y, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const targetWidth = image.naturalWidth * scale;
  const targetHeight = image.naturalHeight * scale;
  const targetX = x + (width - targetWidth) / 2;
  const targetY = y + (height - targetHeight) / 2;
  context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
}

async function loadCanvasPhoto(ref) {
  const value = clean(ref);
  if (!value) return null;
  let url = value;
  if (isLocalPhotoRef(value)) url = await resolveLocalPhotoUrl(value);
  else if (isIndexedPhotoRef(value)) url = await resolveIndexedPhotoUrl(value, { original: true });
  else if (isSupabasePhotoRef(value)) url = await resolveSupabasePhotoUrl(value);
  if (!url) return null;
  return loadCanvasImage(url);
}

function loadCanvasImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function drawCustomerImageBrandLogo(context, image, x, y, size) {
  context.save();
  roundRect(context, x, y, size, size, 22);
  context.clip();
  context.drawImage(image, x, y, size, size);
  context.restore();
  context.save();
  context.strokeStyle = "rgba(208, 197, 168, 0.86)";
  context.lineWidth = 1.5;
  roundRect(context, x, y, size, size, 22);
  context.stroke();
  context.restore();
}

function wrapCanvasText(context, text, maxWidth, font) {
  context.save();
  context.font = font;
  const words = String(text || "").split(/\s+/).filter(Boolean);
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
  context.restore();
  return lines.length ? lines : [String(text || "")];
}

function lineHeightForFont(font) {
  if (font.includes("34px")) return 40;
  if (font.includes("24px")) return 30;
  if (font.includes("20px")) return 26;
  if (font.includes("18px")) return 24;
  return 28;
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function downloadCanvasAsPng(canvas, fileName) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function currentOrderSafeCustomerSlug() {
  const customer = currentOrderCustomer();
  return normalize(customerName(customer) || "zakaznik").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "zakaznik";
}

function buildOrderPaymentFileName(prefix = "qr-platba") {
  const orderDate = clean(els.orderForm?.elements?.orderDate?.value) || toDateInput(new Date());
  return `${prefix}-${currentOrderSafeCustomerSlug()}-${orderDate}.png`;
}

function clearPaymentQrCanvas(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawQrMatrixToCanvas(canvas, matrix, canvasSize = 240) {
  const context = canvas.getContext("2d");
  if (!context || !Array.isArray(matrix) || !matrix.length) return;
  const quietZone = 4;
  const moduleCount = matrix.length;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = Math.max(1, Math.floor(canvasSize / totalModules));
  const effectiveSize = moduleSize * totalModules;
  const offset = Math.floor((canvasSize - effectiveSize) / 2);

  canvas.width = canvasSize;
  canvas.height = canvasSize;
  context.clearRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = "#111111";

  matrix.forEach((row, rowIndex) => {
    row.forEach((isDark, colIndex) => {
      if (!isDark) return;
      const x = offset + (colIndex + quietZone) * moduleSize;
      const y = offset + (rowIndex + quietZone) * moduleSize;
      context.fillRect(x, y, moduleSize, moduleSize);
    });
  });
}

function buildCurrentOrderPaymentQrMessage(customer, orderDate) {
  const compactDate = clean(orderDate).replace(/\D/g, "");
  const parts = ["AFRICKE KOPRIVY"];
  if (compactDate) parts.push(compactDate);
  return sanitizePaymentQrField(parts.filter(Boolean).join(" "), 60);
}

function buildSpdPaymentPayload({ iban, amount, currency, message }) {
  const fields = [
    "SPD",
    "1.0",
    `ACC:${sanitizePaymentQrAccountPart(iban, 34)}`,
    `AM:${amount}`,
    `CC:${normalizeCurrency(currency)}`,
  ];
  if (clean(message)) fields.push(`MSG:${sanitizePaymentQrField(message, 60)}`);
  return fields.join("*");
}

function buildPayBySquarePayload({ iban, bic, amount, currency, beneficiaryName, message }) {
  return window.PayBySquareEncoder.encodePayment({
    payment: {
      amount: Number(formatPaymentQrAmount(amount)),
      currencyCode: normalizeCurrency(currency || "EUR"),
      iban: sanitizePaymentQrAccountPart(iban, 34),
      bic: sanitizePaymentQrAccountPart(bic, 11),
      paymentNote: clean(message),
      beneficiary: {
        name: clean(beneficiaryName),
      },
    },
  });
}

function formatPaymentQrAmount(amount) {
  const rounded = Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
}

function sanitizePaymentQrField(value, maxLength = 80) {
  return stripDiacritics(clean(value))
    .toUpperCase()
    .replace(/[^0-9A-Z $%+\-./:]/g, " ")
    .replace(/[\r\n\t*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizePaymentQrAccountPart(value, maxLength = 46) {
  return stripDiacritics(clean(value))
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "")
    .slice(0, maxLength);
}

function formatIbanForDisplay(value) {
  return clean(value).replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function deleteCustomer(id) {
  const customer = findCustomer(id);
  if (!customer) return;
  if (!confirm(`Smazat zákazníka ${customerName(customer)} včetně objednávek?`)) return;
  state.data.customers = state.data.customers.filter((item) => item.id !== id);
  state.data.orders = state.data.orders.filter((item) => item.customerId !== id);
  state.selectedCustomerId = state.data.customers[0]?.id || null;
  saveData();
  renderAll();
  toast("Zákazník smazán.");
}

function deleteOrder(id) {
  if (!confirm("Smazat objednávku?")) return;
  state.data.orders = state.data.orders.filter((item) => item.id !== id);
  state.selectedOrderIds.delete(id);
  saveData();
  renderAll();
  toast("Objednávka smazána.");
}

function syncOrderPaymentTextSentButton(order = null) {
  const current =
    order ||
    state.data.orders.find((item) => item.id === clean(els.orderForm?.elements?.id?.value));
  const sent = Boolean(clean(current?.paymentTextSentAt));
  const button = els.toggleOrderPaymentTextSentBtn;
  if (!button) return;
  button.disabled = !clean(current?.id);
  button.textContent = sent ? "✓ Text odeslán" : "Text odeslán";
  button.classList.toggle("primary", sent);
  button.classList.toggle("ghost", !sent);
  button.title = clean(current?.id)
    ? sent
      ? "Zrušit příznak odeslaného textu"
      : "Označit, že text k zaplacení byl odeslán"
    : "Nejdřív objednávku ulož";
}

function toggleCurrentOrderPaymentTextSent() {
  const id = clean(els.orderForm?.elements?.id?.value);
  if (!id) {
    toast("Nejdřív objednávku ulož.");
    return;
  }
  toggleOrderPaymentTextSent(id, { keepDialogOpen: true });
}

function toggleOrderPaymentTextSent(id, options = {}) {
  const order = state.data.orders.find((item) => item.id === id);
  if (!order) return;
  if (clean(order.paymentTextSentAt)) {
    order.paymentTextSentAt = "";
    toast("Příznak odeslaného textu zrušen.");
  } else {
    order.paymentTextSentAt = new Date().toISOString();
    toast("Text k zaplacení označen jako odeslaný.");
  }
  order.updatedAt = new Date().toISOString();
  saveData();
  if (options.keepDialogOpen) {
    syncOrderPaymentTextSentButton(order);
    renderOrders();
    renderCustomerDetail();
    return;
  }
  renderAll();
}

function addCustomerNote(id) {
  const customer = findCustomer(id);
  const textarea = els.customerDetail.querySelector("[data-quick-note]");
  const note = clean(textarea?.value);
  if (!customer || !note) {
    toast("Napiš krátkou poznámku.");
    return;
  }

  const stampedNote = `${formatDate(toDateInput(new Date()))}: ${note}`;
  customer.note = [customer.note, stampedNote].filter(Boolean).join("\n");
  customer.updatedAt = new Date().toISOString();
  saveData();
  renderAll();
  toast("Poznámka přidána.");
}

function openVarietyDialog(id = null) {
  const variety = id ? findVariety(id) : null;
  els.varietyDialogTitle.textContent = variety ? "Upravit odrůdu" : "Nová odrůda";
  els.varietyForm.reset();
  els.varietyForm.elements.id.value = variety?.id || "";
  els.varietyForm.elements.name.value = variety?.name || "";
  els.varietyForm.elements.photoUrl.value = isStoredPhoto(variety?.photoUrl) ? "" : variety?.photoUrl || "";
  els.varietyForm.elements.salePrice.value = variety?.salePrice || "";
  els.varietyForm.elements.saleCurrency.value = "CZK";
  els.varietyForm.elements.stockAvailable.value = variety?.stockAvailable || "";
  els.varietyForm.elements.stockReserved.value = variety?.stockReserved || "";
  els.varietyForm.elements.gallery.value = (variety?.gallery || []).filter((image) => !isStoredPhoto(image)).join("\n");
  els.varietyForm.elements.mainPhoto.value = variety?.photoUrl || "";
  els.varietyForm.elements.removedPhotos.value = "";
  els.varietyForm.elements.note.value = variety?.note || "";
  els.varietyForm.elements.active.checked = variety?.active !== false;
  renderMainPhotoPicker(variety);
  showDialog(els.varietyDialog);
}

function renderMainPhotoPicker(variety) {
  if (!els.mainPhotoPicker) return;
  const images = varietyImages(variety);
  const mainPhoto = clean(variety?.photoUrl);
  if (!images.length) {
    els.mainPhotoPicker.hidden = true;
    els.mainPhotoPicker.innerHTML = "";
    return;
  }

  els.mainPhotoPicker.hidden = false;
  els.mainPhotoPicker.innerHTML = `
    <span class="form-section-label">Hlavní fotka</span>
    <div class="main-photo-options">
      ${images
        .map(
          (image, index) => `<div class="main-photo-option-wrap" data-photo-option="${escapeHtml(image)}">
            <button class="main-photo-option ${image === mainPhoto || (!mainPhoto && index === 0) ? "active" : ""}" type="button" data-main-photo="${escapeHtml(image)}" title="Nastavit jako hlavní">
              ${photoImageMarkup(image, `${variety?.name || "Odrůda"} ${index + 1}`, "", 'loading="lazy"')}
            </button>
            <button class="main-photo-remove" type="button" data-remove-photo="${escapeHtml(image)}" aria-label="Odstranit fotku">×</button>
          </div>`,
        )
        .join("")}
    </div>
  `;
  els.mainPhotoPicker.querySelectorAll("[data-main-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      els.varietyForm.elements.mainPhoto.value = button.dataset.mainPhoto;
      els.mainPhotoPicker.querySelectorAll("[data-main-photo]").forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  els.mainPhotoPicker.querySelectorAll("[data-remove-photo]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      markPhotoForRemoval(button.dataset.removePhoto);
    });
  });
  hydrateLocalPhotoImages(els.mainPhotoPicker);
}

function markPhotoForRemoval(image) {
  const current = normalizeGallery(els.varietyForm.elements.removedPhotos.value);
  els.varietyForm.elements.removedPhotos.value = unique([...current, image]).join("\n");
  if (clean(els.varietyForm.elements.photoUrl.value) === image) els.varietyForm.elements.photoUrl.value = "";
  [...els.mainPhotoPicker.querySelectorAll("[data-photo-option]")].find((item) => item.dataset.photoOption === image)?.remove();

  if (els.varietyForm.elements.mainPhoto.value === image) {
    const next = els.mainPhotoPicker.querySelector("[data-main-photo]");
    els.varietyForm.elements.mainPhoto.value = next?.dataset.mainPhoto || "";
    next?.classList.add("active");
  }

  if (!els.mainPhotoPicker.querySelector("[data-main-photo]")) {
    els.mainPhotoPicker.hidden = true;
    els.mainPhotoPicker.innerHTML = "";
  }
}

async function saveVarietyFromForm() {
  if (!els.varietyForm.reportValidity()) return;
  const form = new FormData(els.varietyForm);
  const id = form.get("id") || uid();
  const existing = findVariety(id);
  const previousName = existing?.name || "";
  const previousImages = varietyImages(existing);
  const now = new Date().toISOString();
  const name = clean(form.get("name"));
  const uploadedImages = await saveVarietyPhotoFiles(name, els.varietyForm.elements.photoFiles.files);
  const existingImages = existing ? varietyImages(existing) : [];
  const removedPhotos = new Set(normalizeGallery(form.get("removedPhotos")));
  const explicitPhotoUrl = removedPhotos.has(clean(form.get("photoUrl"))) ? "" : clean(form.get("photoUrl"));
  const chosenMainPhoto = clean(form.get("mainPhoto"));
  const allImages = unique([...existingImages, ...normalizeGallery(form.get("gallery")), ...uploadedImages]).filter((image) => !removedPhotos.has(image));
  const photoUrl = explicitPhotoUrl || (allImages.includes(chosenMainPhoto) ? chosenMainPhoto : "") || uploadedImages[0] || allImages[0] || "";
  const gallery = unique(allImages.filter((image) => image !== photoUrl));
  const salePrice = normalizeAmount(form.get("salePrice"));
  const saleCurrency = "CZK";
  const variety = {
    id,
    name,
    photoUrl,
    gallery,
    salePrice,
    saleCurrency,
    priceHistory: updateVarietyPriceHistory(existing, salePrice, saleCurrency, now),
    stockAvailable: normalizeWholeNumber(form.get("stockAvailable")),
    stockReserved: normalizeWholeNumber(form.get("stockReserved")),
    note: clean(form.get("note")),
    active: form.has("active"),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (existing) {
    Object.assign(existing, variety);
  } else {
    state.data.varieties.push(variety);
  }

  state.data.varieties = mergeVarieties(state.data.varieties);
  syncOfferItemsForVariety(variety, { previousName, previousImages });
  saveData();
  renderAll();
  els.varietyDialog.close();
  toast("Odrůda uložena.");
}

function normalizeCrossStage(value) {
  const raw = clean(value);
  const key = normalize(raw);
  return crossStageAliases[raw] || crossStageAliases[key] || (crossStages.includes(raw) ? raw : "opyleno");
}

function normalizeCrossResult(value) {
  const raw = clean(value);
  const key = normalize(raw);
  if (["krasna", "krásná", "hezka", "hezká", "top"].includes(key) || raw === "krasna") return "krasna";
  if (["hnusna", "hnusná", "spatna", "špatná", "ne"].includes(key) || raw === "hnusna") return "hnusna";
  if (["nejista", "nejistá", "uvidime", "uvidíme"].includes(key) || raw === "nejista") return "nejista";
  return "";
}

function syncCrossStageToggle() {
  const form = els.crossForm;
  if (!form) return;
  const current = normalizeCrossStage(form.elements.stage.value);
  const currentIndex = crossStages.indexOf(current);
  form.querySelectorAll("[data-cross-stage-option]").forEach((button) => {
    const stage = normalizeCrossStage(button.dataset.crossStageOption);
    const stageIndex = crossStages.indexOf(stage);
    const isCurrent = stage === current;
    button.classList.toggle("is-current", isCurrent);
    button.classList.toggle("is-complete", stageIndex > -1 && currentIndex > -1 && stageIndex < currentIndex);
    button.classList.toggle("is-upcoming", stageIndex > currentIndex);
    button.setAttribute("aria-pressed", isCurrent ? "true" : "false");
  });
}

function syncCrossRatingToggle() {
  const form = els.crossForm;
  if (!form) return;
  const current = normalizeCrossResult(form.elements.resultRating.value);
  form.querySelectorAll("[data-cross-rating-option]").forEach((button) => {
    const rating = normalizeCrossResult(button.dataset.crossRatingOption);
    const isActive = rating === current;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setCrossStage(stage) {
  if (!els.crossForm) return;
  els.crossForm.elements.stage.value = normalizeCrossStage(stage);
  syncCrossStageToggle();
}

function setCrossRating(rating) {
  if (!els.crossForm) return;
  const current = normalizeCrossResult(els.crossForm.elements.resultRating.value);
  const next = normalizeCrossResult(rating);
  els.crossForm.elements.resultRating.value = current === next ? "" : next;
  syncCrossRatingToggle();
}

function crossFormSeedlingImages() {
  if (!els.crossForm) return [];
  const removed = new Set(normalizeGallery(els.crossForm.elements.seedlingRemovedPhotos?.value));
  return unique([
    els.crossForm.elements.seedlingPhotoUrl.value,
    ...normalizeGallery(els.crossForm.elements.seedlingGallery.value),
  ].map(clean).filter((image) => image && !removed.has(image)));
}

function removeCrossUploadAt(index) {
  const input = els.crossForm?.elements?.seedlingPhotoFiles;
  if (!input) return;
  const files = Array.from(input.files || []);
  if (index < 0 || index >= files.length) return;
  try {
    const transfer = new DataTransfer();
    files.forEach((file, fileIndex) => {
      if (fileIndex !== index) transfer.items.add(file);
    });
    input.files = transfer.files;
  } catch {
    input.value = "";
  }
}

function renderCrossSeedlingPhotoPicker() {
  if (!els.crossSeedlingPhotoPicker || !els.crossForm) return "";
  const form = els.crossForm;
  const savedImages = crossFormSeedlingImages();
  const uploads = Array.from(form.elements.seedlingPhotoFiles?.files || []).filter((file) => file.type?.startsWith("image/"));
  const currentMain = clean(form.elements.seedlingMainPhoto.value) || clean(form.elements.seedlingPhotoUrl.value) || savedImages[0] || (uploads.length ? "upload:0" : "");
  const items = [
    ...savedImages.map((image) => ({ key: image, image, label: "uložená" })),
    ...uploads.map((file, index) => ({ key: `upload:${index}`, image: URL.createObjectURL(file), label: "nová" })),
  ];
  const activeMain = items.some((item) => item.key === currentMain) ? currentMain : items[0]?.key || "";

  if (!items.length) {
    els.crossSeedlingPhotoPicker.hidden = true;
    els.crossSeedlingPhotoPicker.innerHTML = "";
    return "";
  }

  els.crossSeedlingPhotoPicker.hidden = false;
  els.crossSeedlingPhotoPicker.innerHTML = `
    <span class="form-section-label">Hlavní fotka semenáče</span>
    <div class="cross-photo-options">
      ${items
        .map((item, index) => `<span class="cross-photo-option ${item.key === activeMain || (!activeMain && index === 0) ? "active" : ""}">
          <button class="cross-photo-main-button" type="button" data-cross-main-photo="${escapeHtml(item.key)}" title="Nastavit jako hlavní">
            ${photoImageMarkup(item.image, `${form.elements.seedlingName.value || "Semenáč"} ${index + 1}`, "", 'loading="lazy"')}
            <small>${escapeHtml(item.label)}</small>
          </button>
          <button class="cross-photo-remove-button" type="button" data-cross-remove-photo="${escapeHtml(item.key)}" title="Smazat fotku" aria-label="Smazat fotku">×</button>
        </span>`)
        .join("")}
    </div>
  `;

  els.crossSeedlingPhotoPicker.querySelectorAll("[data-cross-main-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      form.elements.seedlingMainPhoto.value = button.dataset.crossMainPhoto;
      els.crossSeedlingPhotoPicker.querySelectorAll(".cross-photo-option").forEach((item) => item.classList.toggle("active", item.contains(button)));
      renderCrossPreview();
    });
  });
  els.crossSeedlingPhotoPicker.querySelectorAll("[data-cross-remove-photo]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = clean(button.dataset.crossRemovePhoto);
      if (key.startsWith("upload:")) {
        removeCrossUploadAt(Number(key.split(":")[1]));
      } else {
        form.elements.seedlingRemovedPhotos.value = unique([...normalizeGallery(form.elements.seedlingRemovedPhotos.value), key]).join("\n");
      }
      if (clean(form.elements.seedlingMainPhoto.value) === key) form.elements.seedlingMainPhoto.value = "";
      renderCrossPreview();
    });
  });
  hydrateLocalPhotoImages(els.crossSeedlingPhotoPicker);
  return items.find((item) => item.key === activeMain)?.image || items[0]?.image || "";
}

function renderCrossPreview() {
  if (!els.crossPreview || !els.crossForm) return;
  const form = els.crossForm;
  const seedlingPhotoUrl = renderCrossSeedlingPhotoPicker();
  els.crossPreview.innerHTML = buildCrossPreviewMarkup({
    motherVarietyId: form.elements.motherVarietyId.value,
    pollenVarietyId: form.elements.pollenVarietyId.value,
    seedlingName: form.elements.seedlingName.value,
    seedlingPhotoUrl,
  });
  hydrateLocalPhotoImages(els.crossPreview);
}

function openCrossDialog(id = null) {
  const cross = id ? findCross(id) : null;
  renderCrossVarietyOptions();
  els.crossDialogTitle.textContent = cross ? "Upravit křížení" : "Nové křížení";
  els.crossForm.reset();
  els.crossForm.elements.id.value = cross?.id || "";
  els.crossForm.elements.linkedVarietyId.value = cross?.linkedVarietyId || "";
  els.crossForm.elements.motherVarietyId.value = cross?.motherVarietyId || "";
  els.crossForm.elements.pollenVarietyId.value = cross?.pollenVarietyId || "";
  els.crossForm.elements.pollinatedAt.value = cross?.pollinatedAt || toDateInput(new Date());
  els.crossForm.elements.stage.value = normalizeCrossStage(cross?.stage);
  els.crossForm.elements.seedlingName.value = cross?.seedlingName || "";
  els.crossForm.elements.seedlingPhotoUrl.value = cross?.seedlingPhotoUrl || "";
  els.crossForm.elements.seedlingGallery.value = crossSeedlingImages(cross).filter((image) => image !== clean(cross?.seedlingPhotoUrl)).join("\n");
  els.crossForm.elements.seedlingMainPhoto.value = cross?.seedlingPhotoUrl || "";
  els.crossForm.elements.seedlingRemovedPhotos.value = "";
  els.crossForm.elements.resultRating.value = normalizeCrossResult(cross?.resultRating);
  els.crossForm.elements.note.value = cross?.note || "";
  syncCrossStageToggle();
  syncCrossRatingToggle();
  renderCrossPreview();
  showDialog(els.crossDialog);
}

async function saveCrossFromForm() {
  if (!els.crossForm.reportValidity()) return;
  const form = new FormData(els.crossForm);
  const id = clean(form.get("id")) || uid();
  const existing = findCross(id);
  const now = new Date().toISOString();
  const motherVarietyId = clean(form.get("motherVarietyId"));
  const pollenVarietyId = clean(form.get("pollenVarietyId"));
  const stage = normalizeCrossStage(form.get("stage"));
  const seedlingName = clean(form.get("seedlingName"));
  if (motherVarietyId && pollenVarietyId && motherVarietyId === pollenVarietyId && !confirm("Matka a pyl jsou stejná odrůda. Uložit i tak?")) return;
  if (stage === "hotovo" && !seedlingName) {
    toast("U fáze Hotovo doplň název semenáče.");
    return;
  }

  const uploaded = await saveVarietyPhotoFiles(seedlingName || `křížení-${id}`, els.crossForm.elements.seedlingPhotoFiles.files);
  const removedPhotos = new Set(normalizeGallery(form.get("seedlingRemovedPhotos")));
  const existingImages = unique([
    ...normalizeGallery(form.get("seedlingPhotoUrl")),
    ...normalizeGallery(form.get("seedlingGallery")),
    ...crossSeedlingImages(existing),
  ].map(clean).filter((image) => image && !removedPhotos.has(image)));
  const allSeedlingImages = unique([...existingImages, ...uploaded]);
  const mainToken = clean(form.get("seedlingMainPhoto"));
  const uploadMainMatch = mainToken.match(/^upload:(\d+)$/);
  const uploadedMain = uploadMainMatch ? uploaded[Number(uploadMainMatch[1])] : "";
  const seedlingPhotoUrl = uploadedMain || (allSeedlingImages.includes(mainToken) ? mainToken : "") || uploaded[0] || clean(form.get("seedlingPhotoUrl")) || existing?.seedlingPhotoUrl || allSeedlingImages[0] || "";
  const seedlingGallery = unique(allSeedlingImages.filter((image) => image && image !== seedlingPhotoUrl));
  const cross = normalizeCross({
    ...(existing || {}),
    id,
    motherVarietyId,
    pollenVarietyId,
    pollinatedAt: clean(form.get("pollinatedAt")) || toDateInput(new Date()),
    stage,
    seedlingName,
    seedlingPhotoUrl,
    seedlingGallery,
    resultRating: normalizeCrossResult(form.get("resultRating")),
    note: clean(form.get("note")),
    linkedVarietyId: clean(form.get("linkedVarietyId")) || existing?.linkedVarietyId || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });

  if (cross.seedlingName) {
    cross.linkedVarietyId = ensureVarietyFromCross(cross);
    const linkedVariety = findVariety(cross.linkedVarietyId);
    if (linkedVariety && removedPhotos.size) {
      if (removedPhotos.has(clean(linkedVariety.photoUrl))) linkedVariety.photoUrl = cross.seedlingPhotoUrl || "";
      linkedVariety.gallery = normalizeGallery(linkedVariety.gallery).filter((image) => !removedPhotos.has(image));
      if (!clean(linkedVariety.photoUrl) && linkedVariety.gallery.length) {
        linkedVariety.photoUrl = linkedVariety.gallery.shift();
      }
    }
  }

  if (existing) Object.assign(existing, cross);
  else state.data.crosses.push(cross);

  saveData();
  renderAll();
  els.crossDialog.close();
  toast(cross.linkedVarietyId ? "Křížení uloženo a odrůda je v katalogu." : "Křížení uloženo.");
}

function ensureVarietyFromCross(cross) {
  const name = clean(cross.seedlingName);
  if (!name) return "";
  const mother = findVariety(cross.motherVarietyId);
  const pollen = findVariety(cross.pollenVarietyId);
  const now = new Date().toISOString();
  const seedlingNote = `Semenáč z křížení ${mother?.name || "matka"} x ${pollen?.name || "pyl"}`;
  const seedlingImages = crossSeedlingImages(cross);
  const mainPhoto = crossSeedlingMainPhoto(cross);
  const existing = findVariety(clean(cross.linkedVarietyId)) || findVarietyByName(name);
  if (existing) {
    existing.name = existing.name || name;
    if (mainPhoto) {
      existing.photoUrl = mainPhoto;
      existing.gallery = unique(seedlingImages.filter((image) => image && image !== mainPhoto));
    }
    if (!noteAlreadyContainsCrossLineage(existing.note, mother?.name || "matka", pollen?.name || "pyl")) {
      existing.note = cleanBusinessNote([existing.note, seedlingNote].filter(Boolean).join("\n"));
    }
    existing.saleCurrency = "CZK";
    existing.active = existing.active !== false;
    existing.updatedAt = now;
    state.data.varieties = mergeVarieties(state.data.varieties);
    return existing.id;
  }

  const variety = {
    id: uid(),
    name,
    photoUrl: mainPhoto,
    gallery: seedlingImages.filter((image) => image !== mainPhoto),
    salePrice: "",
    saleCurrency: "CZK",
    priceHistory: [],
    stockAvailable: "",
    stockReserved: "",
    note: seedlingNote,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  state.data.varieties.push(variety);
  state.data.varieties = mergeVarieties(state.data.varieties);
  return findVarietyByName(name)?.id || variety.id;
}

function deleteCross(id) {
  const cross = findCross(id);
  if (!cross) return;
  if (!confirm("Smazat záznam křížení? Vzniklá odrůda v katalogu zůstane.")) return;
  state.data.crosses = state.data.crosses.filter((item) => item.id !== id);
  if (state.selectedCrossId === id) state.selectedCrossId = state.data.crosses[0]?.id || null;
  saveData();
  renderAll();
  toast("Křížení smazáno.");
}

function deleteVariety(id) {
  const variety = findVariety(id);
  if (!variety) return;
  if (!confirm(`Smazat odrůdu ${variety.name}? Objednávky zůstanou beze změny.`)) return;
  state.data.varieties = state.data.varieties.filter((item) => item.id !== id);
  saveData();
  renderAll();
  toast("Odrůda smazána.");
}

const offerStatusSteps = ["připravená", "zveřejněná", "uzavřená"];

function syncOfferStatusToggle() {
  const form = els.offerForm;
  if (!form) return;
  const current = clean(form.elements.status.value) || "připravená";
  const currentIndex = offerStatusSteps.indexOf(current);
  form.querySelectorAll("[data-offer-status-option]").forEach((button) => {
    const step = clean(button.dataset.offerStatusOption);
    const stepIndex = offerStatusSteps.indexOf(step);
    const isCurrent = step === current;
    const isComplete = stepIndex > -1 && currentIndex > -1 && stepIndex < currentIndex;
    const isUpcoming = stepIndex > currentIndex;
    button.classList.toggle("is-current", isCurrent);
    button.classList.toggle("is-complete", isComplete);
    button.classList.toggle("is-upcoming", isUpcoming);
    button.setAttribute("aria-pressed", isCurrent ? "true" : "false");
  });
}

function setOfferStatus(status) {
  const form = els.offerForm;
  if (!form) return;
  const nextStatus = offerStatusSteps.includes(clean(status)) ? clean(status) : "připravená";
  form.elements.status.value = nextStatus;
  syncOfferStatusToggle();
}

function openOfferDialog(id = null, defaults = {}) {
  const offer = id ? findOffer(id) : null;
  const initialType = offer ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer?.date || clean(defaults.date) || toDateInput(new Date());
  els.offerDialogTitle.textContent = offer
    ? (initialType === "rests" ? "Upravit resty" : "Upravit nabídku")
    : (initialType === "rests" ? "Nové resty" : "Nová nabídka");
  els.offerForm.reset();
  els.offerForm.elements.id.value = offer?.id || "";
  els.offerForm.elements.title.value = offer?.title || defaultOfferTitle(initialType, initialDate);
  els.offerForm.elements.date.value = initialDate;
  els.offerForm.elements.facebookPublishDate.value = offer?.facebookPublishDate || initialDate;
  els.offerForm.elements.facebookPublishTime.value = offer?.facebookPublishTime || "20:00";
  els.offerForm.elements.type.value = initialType;
  els.offerForm.elements.status.value = offer?.status || "připravená";
  els.offerForm.elements.note.value = offer?.note || "";
  syncOfferStatusToggle();
  showDialog(els.offerDialog);
}

function saveOfferFromForm() {
  if (!els.offerForm.reportValidity()) return;
  const form = new FormData(els.offerForm);
  const id = form.get("id") || uid();
  const existing = findOffer(id);
  const now = new Date().toISOString();
  const nextDate = clean(form.get("date")) || toDateInput(new Date());
  const nextType = normalizeOfferType(form.get("type"));
  const sourceType = existing ? normalizeOfferType(existing.type) : nextType;
  const offer = normalizeOffer({
    id,
    title: adjustedOfferTitleForType(clean(form.get("title")), sourceType, nextType, nextDate),
    date: nextDate,
    facebookPublishDate: clean(form.get("facebookPublishDate")) || nextDate,
    facebookPublishTime: clean(form.get("facebookPublishTime")) || "20:00",
    type: nextType,
    status: clean(form.get("status")) || "připravená",
    note: clean(form.get("note")),
    items: existing?.items || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });

  if (existing) Object.assign(existing, offer);
  else state.data.offers.push(offer);
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  els.offerDialog.close();
  toast("Nabídka uložena.");
}

function deleteOffer(id) {
  const offer = findOffer(id);
  if (!offer) return;
  if (!confirm(`Smazat nabídku ${offer.title}?`)) return;
  state.data.offers = state.data.offers.filter((item) => item.id !== id);
  state.selectedOfferId = state.data.offers[0]?.id || null;
  saveData();
  renderAll();
  toast("Nabídka smazána.");
}

function openOfferItemDialog(offerId, itemId = null) {
  const offer = findOffer(offerId);
  if (!offer) return;
  const item = itemId ? offer.items.find((entry) => entry.id === itemId) : null;
  els.offerItemDialogTitle.textContent = item ? "Upravit odřezek" : "Přidat odřezek";
  els.offerItemForm.reset();
  els.offerItemForm.elements.offerId.value = offerId;
  els.offerItemForm.elements.itemId.value = item?.id || "";
  const matchedVariety = findVariety(clean(item?.varietyId)) || findExactVarietyByName(item?.varietyName);
  els.offerItemForm.elements.varietyName.value = matchedVariety?.name || item?.varietyName || "";
  els.offerItemForm.elements.varietyId.value = matchedVariety?.id || item?.varietyId || "";
  els.offerItemForm.elements.quantity.value = item?.quantity || "1";
  els.offerItemForm.elements.price.value = item?.price || "";
  delete els.offerItemForm.elements.price.dataset.autoFilledFor;
  els.offerItemForm.elements.currency.value = normalizeCurrency(item?.currency);
  els.offerItemForm.elements.note.value = item?.note || "";
  els.offerItemForm.elements.createVariety.checked = false;
  refreshOfferItemVarietyHelper(false);
  renderOfferItemVarietyPicker();
  showDialog(els.offerItemDialog);
}

function renderOfferItemVarietyPicker() {
  const form = els.offerItemForm;
  const picker = els.offerItemVarietyPicker;
  if (!form || !picker) return;
  const offer = findOffer(form.elements.offerId.value);
  const currentItemId = clean(form.elements.itemId.value);
  const input = form.elements.varietyName;
  const query = normalize(input.value);
  const selectedKey = varietyNameMatchKey(input.value);
  const usedKeys = offerUsedVarietyKeys(offer, currentItemId);
  const varieties = [...state.data.varieties]
    .filter((variety) => clean(variety.name))
    .sort((a, b) => naturalCompare(a.name, b.name));
  const matches = varieties
    .filter((variety) => !query || normalize(variety.name).includes(query));
  if (!matches.length) {
    picker.innerHTML = `<div class="offer-variety-empty">Žádná odrůda nenalezena. Můžeš napsat nový název.</div>`;
    return;
  }
  picker.innerHTML = matches.map((variety) => {
    const key = varietyNameMatchKey(variety.name);
    const used = usedKeys.has(clean(variety.id)) || usedKeys.has(key);
    const selected = selectedKey && key === selectedKey;
    const price = clean(variety.salePrice) ? formatMoney(variety.salePrice, variety.saleCurrency || "CZK") : "";
    const meta = [used ? "Už v nabídce" : "", price].filter(Boolean).join(" · ");
    return `<button class="offer-variety-option ${used ? "used" : ""} ${selected ? "selected" : ""}" type="button" data-offer-variety-id="${escapeHtml(variety.id)}">
      <span>${escapeHtml(variety.name)}</span>
      ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
    </button>`;
  }).join("");
}

function handleOfferItemVarietyPickerClick(event) {
  const button = event.target.closest("[data-offer-variety-id]");
  if (!button) return;
  const variety = findVariety(button.dataset.offerVarietyId);
  if (!variety) return;
  applyOfferItemVarietyToForm(variety, { forcePrice: true });
  refreshOfferItemVarietyHelper(false);
  renderOfferItemVarietyPicker();
}

function applyOfferItemVarietyToForm(variety, options = {}) {
  const form = els.offerItemForm;
  if (!form || !variety) return;
  const priceInput = form.elements.price;
  form.elements.varietyId.value = variety.id || "";
  form.elements.varietyName.value = variety.name || "";
  if (priceInput && clean(variety.salePrice) && (options.forcePrice || !clean(priceInput.value) || priceInput.dataset.autoFilledFor)) {
    priceInput.value = variety.salePrice;
    priceInput.dataset.autoFilledFor = varietyNameMatchKey(variety.name);
  }
  const currency = normalizeCurrency(variety.saleCurrency);
  const radio = form.querySelector(`input[name="currency"][value="${currency}"]`);
  if (radio) radio.checked = true;
}

function offerUsedVarietyKeys(offer, excludeItemId = "") {
  return new Set((offer?.items || [])
    .filter((item) => !excludeItemId || item.id !== excludeItemId)
    .flatMap((item) => [clean(item.varietyId), varietyNameMatchKey(item.varietyName || item.name)])
    .filter(Boolean));
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

function reconcileOfferItemVarietyLinks(data = state.data) {
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
      item.varietyId = variety.id;
      item.varietyName = variety.name;
      const varietyPhotos = new Set(varietyImages(variety));
      if (clean(item.photoUrl) && varietyPhotos.has(clean(item.photoUrl))) item.photoUrl = "";
    });
    sortOfferItemsInPlace(offer);
  });
}

function refreshOfferItemVarietyHelper(autofillPrice = false) {
  if (!els.offerItemForm || !els.offerItemVarietyHelper || !els.offerItemVarietyHint || !els.offerItemCreateVarietyWrap) return;
  const name = clean(els.offerItemForm.elements.varietyName.value);
  const createInput = els.offerItemForm.elements.createVariety;
  const priceInput = els.offerItemForm.elements.price;
  const helper = els.offerItemVarietyHelper;
  const hint = els.offerItemVarietyHint;
  const createWrap = els.offerItemCreateVarietyWrap;

  if (!name) {
    helper.hidden = true;
    createWrap.hidden = true;
    createInput.checked = false;
    hint.textContent = "";
    return;
  }

  const exactVariety = findExactVarietyByName(name);
  const variety = exactVariety || findVarietyByName(name);
  const offer = findOffer(els.offerItemForm.elements.offerId.value);
  const currentItemId = clean(els.offerItemForm.elements.itemId.value);
  const alreadyUsed = offerUsedVarietyKeys(offer, currentItemId).has(varietyNameMatchKey(name));
  helper.hidden = false;
  if (variety) {
    createWrap.hidden = true;
    createInput.checked = false;
    hint.textContent = `${variety.salePrice
      ? `V katalogu už je. Cena ${formatMoney(variety.salePrice, variety.saleCurrency)}.`
      : "V katalogu už je. Cena se zatím v katalogu nevyplnila."}${alreadyUsed ? " V této nabídce už je použitá." : ""}`;
    if (autofillPrice && exactVariety) {
      if (clean(variety.salePrice)) {
        priceInput.value = variety.salePrice;
        priceInput.dataset.autoFilledFor = varietyNameMatchKey(variety.name);
      } else if (priceInput.dataset.autoFilledFor) {
        priceInput.value = "";
        delete priceInput.dataset.autoFilledFor;
      }
      const currency = normalizeCurrency(variety.saleCurrency);
      const radio = els.offerItemForm.querySelector(`input[name="currency"][value="${currency}"]`);
      if (radio) radio.checked = true;
    }
    return;
  }

  createWrap.hidden = false;
  if (autofillPrice && priceInput.dataset.autoFilledFor) {
    priceInput.value = "";
    delete priceInput.dataset.autoFilledFor;
  }
  hint.textContent = `V katalogu zatím není. Může zůstat jen v nabídce, nebo ji rovnou založ do odrůd.${alreadyUsed ? " V této nabídce už je použitá." : ""}`;
}

function ensureVarietyFromOfferItem(name, price, currency) {
  const cleanName = clean(name);
  if (!cleanName) return null;
  const existing = findVarietyByName(cleanName);
  if (existing) return existing;
  const now = new Date().toISOString();
  state.data.varieties = mergeVarieties([
    ...state.data.varieties,
    {
      id: uid(),
      name: cleanName,
      salePrice: normalizeAmount(price),
      saleCurrency: "CZK",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  return findVarietyByName(cleanName);
}

async function saveOfferItemFromForm() {
  if (!els.offerItemForm.reportValidity()) return;
  const form = new FormData(els.offerItemForm);
  const offer = findOffer(form.get("offerId"));
  if (!offer) return;
  const id = form.get("itemId") || uid();
  const existing = offer.items.find((item) => item.id === id);
  const varietyName = clean(form.get("varietyName"));
  const uploaded = await saveIndexedPhotoFiles(els.offerItemForm.elements.photoFile.files);
  const shouldCreateVariety = Boolean(form.get("createVariety"));
  const exactVariety = findExactVarietyByName(varietyName);
  const variety = exactVariety
    || findVariety(clean(form.get("varietyId")))
    || (shouldCreateVariety ? ensureVarietyFromOfferItem(varietyName, form.get("price"), form.get("currency")) : null);
  const item = normalizeOfferItem({
    id,
    varietyId: variety?.id || existing?.varietyId || "",
    varietyName,
    quantity: form.get("quantity"),
    price: form.get("price"),
    currency: form.get("currency"),
    photoUrl: uploaded[0] || existing?.photoUrl || "",
    note: form.get("note"),
    reservations: existing?.reservations || [],
  });

  if (existing) Object.assign(existing, item);
  else offer.items.push(item);
  sortOfferItemsInPlace(offer);
  offer.updatedAt = new Date().toISOString();
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  els.offerItemDialog.close();
  toast(shouldCreateVariety && variety ? "Položka nabídky i nová odrůda uloženy." : "Položka nabídky uložena.");
}

function deleteOfferItem(offerId, itemId) {
  const offer = findOffer(offerId);
  if (!offer) return;
  const item = offer.items.find((entry) => entry.id === itemId);
  if (!item || !confirm(`Smazat položku ${offerItemNameSafe(item)}?`)) return;
  offer.items = offer.items.filter((entry) => entry.id !== itemId);
  offer.updatedAt = new Date().toISOString();
  saveData();
  renderAll();
  toast("Položka smazána.");
}

function openFacebookOfferDialog(id) {
  const offer = findOffer(id);
  if (!offer || !els.facebookOfferDialog || !els.facebookOfferForm) return;
  offer.facebookPublishDate = clean(offer.facebookPublishDate || offer.date || toDateInput(new Date()));
  offer.facebookPublishTime = clean(offer.facebookPublishTime || "20:00");
  state.selectedOfferId = offer.id;
  const text = state.facebookDraftTextByOffer.get(offer.id) || safeBuildFacebookOfferText(offer);
  const photoCount = facebookOfferZipEntries(offer).length;
  els.facebookOfferDialogTitle.textContent = `Facebook příspěvek · ${offer.title}`;
  els.facebookOfferForm.reset();
  els.facebookOfferForm.elements.offerId.value = offer.id;
  els.facebookOfferForm.elements.text.value = text;
  if (els.facebookOfferPhotoStatus) {
    els.facebookOfferPhotoStatus.innerHTML = facebookZipProgressMarkup(photoCount
      ? `Fotky k uložení: ${photoCount}. Načtou se až po tlačítku ZIP.`
      : "Tahle nabídka zatím nemá volné fotky.");
  }
  showDialog(els.facebookOfferDialog);
}

function facebookZipProgressMarkup(text) {
  return `<div class="facebook-zip-progress" data-facebook-zip-progress aria-live="polite">
    <span data-facebook-zip-progress-label>${escapeHtml(text)}</span>
    <span class="facebook-zip-progress-bar" aria-hidden="true"><span data-facebook-zip-progress-fill style="width: 0%"></span></span>
  </div>`;
}

function updateFacebookZipProgress(current, total, message = "") {
  const root = els.facebookOfferPhotoStatus?.querySelector("[data-facebook-zip-progress]");
  if (!root) return;
  const safeTotal = Math.max(0, Number(total) || 0);
  const safeCurrent = Math.max(0, Math.min(safeTotal, Number(current) || 0));
  const percent = safeTotal ? Math.round((safeCurrent / safeTotal) * 100) : 0;
  const label = root.querySelector("[data-facebook-zip-progress-label]");
  const fill = root.querySelector("[data-facebook-zip-progress-fill]");
  if (label) label.textContent = message || (safeTotal ? `Fotka ${safeCurrent} z ${safeTotal}` : "Bez fotek k uložení");
  if (fill) fill.style.width = `${percent}%`;
}

function waitForUiPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function facebookOfferDialogDraft() {
  const offerId = clean(els.facebookOfferForm?.elements.offerId.value);
  const offer = findOffer(offerId);
  const text = clean(els.facebookOfferForm?.elements.text.value) || safeBuildFacebookOfferText(offer);
  return { offer, text };
}

function saveFacebookOfferTextFromDialog() {
  const { offer, text } = facebookOfferDialogDraft();
  if (!offer || !text) {
    toast("Text se nepodařilo najít.");
    return;
  }
  rememberFacebookOfferText(offer.id, text);
  toast("Text uložený jako šablona.");
}

function copyFacebookOfferTextFromDialog() {
  const { offer, text } = facebookOfferDialogDraft();
  if (!offer || !text) {
    toast("Text se nepodařilo najít.");
    return;
  }
  rememberFacebookOfferText(offer.id, text);
  copyText(text, "Text pro Facebook zkopírovaný.");
}

async function downloadFacebookOfferZipFromDialog(button) {
  const { offer, text } = facebookOfferDialogDraft();
  if (!offer) return;
  rememberFacebookOfferText(offer.id, text);
  copyText(text, "Text pro Facebook zkopírovaný.");
  const previousLabel = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = "Připravuji ZIP...";
  }
  try {
    const entries = [{ name: "facebook-text.txt", blob: new Blob([text], { type: "text/plain;charset=utf-8" }) }];
    const photoEntries = facebookOfferZipEntries(offer);
    updateFacebookZipProgress(0, photoEntries.length, photoEntries.length ? `Začínám připravovat ${photoEntries.length} fotek...` : "Bez fotek k uložení.");
    await waitForUiPaint();
    for (let index = 0; index < photoEntries.length; index += 1) {
      const entry = photoEntries[index];
      updateFacebookZipProgress(index, photoEntries.length, `Načítám fotku ${index + 1} z ${photoEntries.length}`);
      await waitForUiPaint();
      const file = await photoRefToFacebookFile(entry.ref, entry.name);
      if (!file) {
        updateFacebookZipProgress(index + 1, photoEntries.length, `Fotka ${index + 1} se přeskočila`);
        continue;
      }
      updateFacebookZipProgress(index, photoEntries.length, `Přidávám text do fotky ${index + 1} z ${photoEntries.length}`);
      await waitForUiPaint();
      const labeledFile = await createFacebookLabeledPhotoFile(file, entry);
      entries.push({ name: `${entry.name}${photoExtension(labeledFile)}`, blob: labeledFile });
      updateFacebookZipProgress(index + 1, photoEntries.length, `Hotovo ${index + 1} z ${photoEntries.length}`);
    }
    updateFacebookZipProgress(photoEntries.length, photoEntries.length, "Balím ZIP...");
    await waitForUiPaint();
    const zip = await createZipBlob(entries);
    downloadBlob(zip, `${safeFileName(offer.title || "nabidka", "nabidka")}-fotky.zip`);
    updateFacebookZipProgress(photoEntries.length, photoEntries.length, `ZIP hotový: ${Math.max(0, entries.length - 1)} fotek.`);
    toast(`ZIP hotový: ${Math.max(0, entries.length - 1)} fotek. Text je zkopírovaný.`);
  } catch (error) {
    console.error(error);
    updateFacebookZipProgress(0, facebookOfferZipEntries(offer).length, "ZIP se nepodařilo vytvořit.");
    toast("ZIP se nepodařilo vytvořit.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = previousLabel || "Stáhnout fotky ZIP";
    }
  }
}

function rememberFacebookOfferText(id, text) {
  const offer = findOffer(id);
  if (!offer || text == null) return;
  state.facebookDraftTextByOffer.set(offer.id, text);
  saveFacebookOfferTemplateFromText(offer.id, text);
}

function safeBuildFacebookOfferText(offer) {
  try {
    return buildFacebookOfferText(offer);
  } catch (error) {
    console.error(error);
    return fallbackFacebookOfferText(offer);
  }
}

function buildFacebookOfferText(offer) {
  const settings = feeSettings();
  return renderFacebookOfferTemplate(settings.facebookOfferTemplate || defaultFacebookOfferTemplate(settings), offer);
}

function defaultFacebookOfferTemplate(settings = feeSettings()) {
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

function fallbackFacebookOfferText(offer = {}) {
  return [
    "🌿 Nabídka afrických kopřiv (Coleus) 🌿",
    "",
    "📅 Kdy?",
    facebookOfferDateLine(offer),
    "",
    "Fotky jednotlivých rostlin budu postupně přidávat do komentářů pod tento příspěvek.",
    "",
    FACEBOOK_ITEMS_TOKEN,
    "",
    "Pokud máte o některou rostlinu zájem, napište prosím pod konkrétní fotku: „zájem“ nebo „kupuji“.",
    "",
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

function saveFacebookOfferTemplateFromText(id, text) {
  const offer = findOffer(id);
  if (!offer) return;
  let template = clean(text);
  const itemsBlock = facebookOfferItemsBlock(offer);
  const dateLine = facebookOfferDateLine(offer);
  if (itemsBlock && template.includes(itemsBlock)) template = template.replace(itemsBlock, FACEBOOK_ITEMS_TOKEN);
  if (dateLine && template.includes(dateLine)) template = template.replace(dateLine, FACEBOOK_DATE_TOKEN);
  if (!template.includes(FACEBOOK_ITEMS_TOKEN)) template = `${template}\n\n${FACEBOOK_ITEMS_TOKEN}`.trim();
  state.data.settings = { ...feeSettings(), facebookOfferTemplate: template };
  saveData();
}

function facebookOfferDateLine(offer) {
  const date = localDateFromInput(offer?.facebookPublishDate || offer?.date) || new Date();
  const weekday = new Intl.DateTimeFormat("cs-CZ", { weekday: "long" }).format(date);
  const isToday = toDateInput(date) === toDateInput(new Date());
  const time = clean(offer?.facebookPublishTime) || "20:00";
  return isToday ? `Dnes, v ${weekday} od ${time} hod.` : `${formatDate(toDateInput(date))} od ${time} hod.`;
}

function localDateFromInput(value) {
  const match = clean(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function facebookOfferItemsBlock(offer) {
  const itemLines = facebookOfferItemLines(offer);
  const lines = [
    itemLines.length ? "Volné odřezky v nabídce:" : "Volné odřezky v nabídce doplním postupně.",
    ...itemLines,
  ];
  return lines.filter((line, index) => line || lines[index - 1] !== "").join("\n").trim();
}

function facebookOfferItemLines(offer) {
  return facebookOfferAvailableItems(offer).map(({ item, available }) => {
    const price = clean(item?.price) ? formatMoney(item.price, item.currency || "CZK") : "";
    return `• ${offerItemNameSafe(item)} - ${quantityText(available)} ks${price ? ` - ${price}` : ""}`;
  });
}

function facebookOfferZipEntries(offer) {
  const usedNames = new Set();
  return facebookOfferAvailableItems(offer)
    .map(({ item, available }, index) => {
      const ref = offerItemImageSafe(item);
      if (!ref) return null;
      const priceText = clean(item?.price) ? formatMoney(item.price, item.currency || "CZK") : "";
      const price = priceText ? `${normalizeAmount(item.price)}-${normalizeCurrencyLabel(item.currency || "CZK")}` : "";
      const label = `${offerItemNameSafe(item)} - ${quantityText(available)} ks${priceText ? ` - ${priceText}` : ""}`;
      const base = safeFileName(`${String(index + 1).padStart(3, "0")}-${offerItemNameSafe(item)}-${quantityText(available)}ks-${price}`, `fotka-${index + 1}`);
      let name = base;
      let suffix = 2;
      while (usedNames.has(name)) {
        name = `${base}-${suffix}`;
        suffix += 1;
      }
      usedNames.add(name);
      return { ref, name, label };
    })
    .filter(Boolean);
}

function facebookOfferAvailableItems(offer) {
  return sortedOfferItems(offer)
    .map((item) => ({ item, available: reservationAvailableQuantity(item) }))
    .filter(({ available }) => available > 0);
}

function offerItemNameSafe(item = {}) {
  return clean(findVariety(clean(item.varietyId))?.name || item.varietyName || item.name || "Odřezek");
}

function offerItemImageSafe(item = {}) {
  try {
    return offerItemImage(item);
  } catch {
    return clean(item.photoUrl);
  }
}

function quantityText(value) {
  const amount = Number(normalizeWholeNumber(value));
  return String(Number.isFinite(amount) && amount > 0 ? amount : 1);
}

function normalizeCurrencyLabel(currency) {
  const value = clean(currency || "CZK").toUpperCase();
  return value === "EUR" ? "eur" : "kc";
}

async function photoRefToFacebookFile(ref, ownerName = "fotka") {
  try {
    const file = await photoToOriginalFile(ref, ownerName);
    return file ? await preparePhotoFileForStorage(file) : null;
  } catch {
    return null;
  }
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
    const padding = Math.max(26, Math.round(imageWidth * 0.035));
    const fontSize = Math.max(34, Math.min(58, Math.round(imageWidth * 0.052)));
    const lineHeight = Math.round(fontSize * 1.22);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.font = `900 ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    const lines = wrapCanvasText(context, entry.label, imageWidth - padding * 2, context.font).slice(0, 3);
    const footerHeight = padding * 2 + lines.length * lineHeight;
    canvas.width = imageWidth;
    canvas.height = imageHeight + footerHeight;
    context.fillStyle = "#fbf7e9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, imageWidth, imageHeight);
    const gradient = context.createLinearGradient(0, imageHeight, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f8f1da");
    gradient.addColorStop(1, "#e0f3df");
    context.fillStyle = gradient;
    context.fillRect(0, imageHeight, canvas.width, footerHeight);
    context.strokeStyle = "#9ac7ac";
    context.lineWidth = Math.max(2, Math.round(imageWidth * 0.004));
    context.beginPath();
    context.moveTo(0, imageHeight + 1);
    context.lineTo(canvas.width, imageHeight + 1);
    context.stroke();
    context.fillStyle = "#0d3b2d";
    context.font = `900 ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    context.textAlign = "center";
    lines.forEach((line, index) => {
      context.fillText(line, canvas.width / 2, imageHeight + padding + fontSize + index * lineHeight);
    });
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

function openReservationDialog(offerId, itemId, reservationId = null, defaults = {}) {
  const offer = findOffer(offerId);
  const item = offer?.items.find((entry) => entry.id === itemId);
  if (!offer || !item) return;
  const reservation = reservationId ? item.reservations.find((entry) => entry.id === reservationId) : null;
  const preferredStatus = reservation?.status
    || clean(defaults.status)
    || (reservationAvailableQuantity(item, reservation?.id) > 0 ? "confirmed" : "alternate");
  renderReservationCustomerOptions();
  els.reservationDialogTitle.textContent = reservation ? "Upravit rezervaci" : "Nová rezervace";
  els.reservationForm.reset();
  els.reservationForm.elements.offerId.value = offerId;
  els.reservationForm.elements.itemId.value = itemId;
  els.reservationForm.elements.reservationId.value = reservation?.id || "";
  els.reservationForm.elements.customerId.value = reservation?.customerId || state.selectedCustomerId || state.data.customers[0]?.id || "";
  els.reservationForm.elements.quantity.value = reservation?.quantity || "1";
  els.reservationForm.elements.status.value = reservationStatusValue(preferredStatus);
  els.reservationForm.elements.note.value = reservation?.note || "";
  els.reservationForm.elements.newCustomerName.value = "";
  els.reservationForm.elements.newCustomerFbName.value = "";
  els.reservationForm.elements.newCustomerPhone.value = "";
  els.reservationForm.elements.newCustomerEmail.value = "";
  els.reservationForm.elements.newCustomerStreet.value = "";
  els.reservationForm.elements.newCustomerPostalCode.value = "";
  els.reservationForm.elements.newCustomerCity.value = "";
  els.reservationForm.elements.newCustomerCountry.value = "";
  els.reservationForm.elements.newCustomerNote.value = "";
  setReservationNewCustomerMode(!reservation && !state.data.customers.length);
  showDialog(els.reservationDialog);
}

function renderReservationCustomerOptions() {
  const select = els.reservationForm.elements.customerId;
  if (!state.data.customers.length) {
    select.innerHTML = `<option value="">Zatím žádný zákazník</option>`;
    return;
  }
  select.innerHTML = state.data.customers
    .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"))
    .map((customer) => `<option value="${customer.id}">${escapeHtml(customerName(customer))}</option>`)
    .join("");
}

function toggleReservationNewCustomer() {
  const next = els.reservationForm.dataset.newCustomer !== "1";
  if (!next && !state.data.customers.length) {
    toast("Nejdřív ulož nového zákazníka.");
    return;
  }
  setReservationNewCustomerMode(next);
}

function setReservationNewCustomerMode(enabled) {
  els.reservationForm.dataset.newCustomer = enabled ? "1" : "";
  els.reservationNewCustomerFields.hidden = !enabled;
  els.reservationForm.elements.customerId.disabled = enabled;
  els.reservationForm.elements.customerId.required = !enabled;
  els.newReservationCustomerBtn.textContent = enabled ? "Vybrat existujícího" : "Nový zákazník";
  if (enabled) window.setTimeout(() => els.reservationForm.elements.newCustomerName.focus(), 0);
}

function createCustomerFromReservationForm() {
  const fullName = clean(els.reservationForm.elements.newCustomerName.value);
  if (!fullName) {
    toast("Vyplň jméno zákazníka.");
    els.reservationForm.elements.newCustomerName.focus();
    return null;
  }

  const id = uid();
  const now = new Date().toISOString();
  const nameParts = splitName(fullName);
  const customer = sanitizeCustomer({
    id,
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    fbName: clean(els.reservationForm.elements.newCustomerFbName.value),
    phone: clean(els.reservationForm.elements.newCustomerPhone.value),
    email: clean(els.reservationForm.elements.newCustomerEmail.value),
    street: clean(els.reservationForm.elements.newCustomerStreet.value),
    postalCode: clean(els.reservationForm.elements.newCustomerPostalCode.value),
    city: clean(els.reservationForm.elements.newCustomerCity.value),
    country: clean(els.reservationForm.elements.newCustomerCountry.value),
    customerRating: "",
    tags: [],
    note: clean(els.reservationForm.elements.newCustomerNote.value),
    createdAt: now,
    updatedAt: now,
  });
  state.data.customers.push(customer);
  state.selectedCustomerId = customer.id;
  return customer;
}

function saveReservationFromForm() {
  if (!els.reservationForm.reportValidity()) return;
  const form = new FormData(els.reservationForm);
  const offer = findOffer(form.get("offerId"));
  const item = offer?.items.find((entry) => entry.id === form.get("itemId"));
  if (!offer || !item) return;
  const createdCustomer = els.reservationForm.dataset.newCustomer === "1" ? createCustomerFromReservationForm() : null;
  if (els.reservationForm.dataset.newCustomer === "1" && !createdCustomer) return;
  const customerId = createdCustomer?.id || form.get("customerId");
  if (!customerId) {
    toast("Vyber zákazníka.");
    return;
  }
  const id = form.get("reservationId") || uid();
  const existing = item.reservations.find((entry) => entry.id === id);
  let status = reservationStatusValue(form.get("status"));
  const requestedQuantity = Number(normalizeWholeNumber(form.get("quantity"))) || 1;
  const availableQuantity = reservationAvailableQuantity(item, existing?.id);
  if (status === "confirmed" && availableQuantity <= 0) {
    status = "alternate";
    toast("Položka už je plná, ukládám jako náhradníka.");
  } else if (status === "confirmed" && requestedQuantity > availableQuantity) {
    toast(`Volné jsou už jen ${availableQuantity} ks. Zmenši počet nebo ulož jako náhradníka.`);
    els.reservationForm.elements.quantity.focus();
    return;
  }
  const reservation = normalizeReservation({
    id,
    customerId,
    quantity: form.get("quantity"),
    status,
    note: form.get("note"),
  });

  if (existing) Object.assign(existing, reservation);
  else item.reservations.push(reservation);
  offer.updatedAt = new Date().toISOString();
  state.selectedCustomerId = reservation.customerId;
  saveData();
  renderAll();
  els.reservationDialog.close();
  toast(createdCustomer ? "Zákazník a rezervace uloženi." : "Rezervace uložena.");
}

function deleteReservation(offerId, itemId, reservationId) {
  const offer = findOffer(offerId);
  const item = offer?.items.find((entry) => entry.id === itemId);
  if (!offer || !item) return;
  item.reservations = item.reservations.filter((entry) => entry.id !== reservationId);
  offer.updatedAt = new Date().toISOString();
  saveData();
  renderAll();
  toast("Rezervace smazána.");
}

function parseImportInput() {
  const rows = parseDelimited(els.importText.value);
  state.importRows = rows.filter((row) => row.some((cell) => clean(cell)));
  state.importMappings = guessMappings(state.importRows);
  renderImportMapping();
}

function readCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    els.importText.value = String(reader.result || "");
    parseImportInput();
  });
  reader.readAsText(file, "utf-8");
}

function clearImport() {
  els.importText.value = "";
  els.csvFile.value = "";
  state.importRows = [];
  state.importMappings = [];
  renderImportMapping();
}

function renderImportMapping() {
  const rows = state.importRows;
  els.importSummary.textContent = rows.length ? `${rows.length} řádků, ${maxColumns(rows)} sloupců` : "Žádná data";
  els.importBtn.disabled = !rows.length;

  if (!rows.length) {
    els.mappingArea.innerHTML = emptyState("Vlož data a načti sloupce.");
    return;
  }

  const columns = maxColumns(rows);
  els.mappingArea.innerHTML = Array.from({ length: columns }, (_, index) => {
    const samples = rows
      .map((row) => clean(row[index]))
      .filter(Boolean)
      .slice(0, 4);
    const selected = state.importMappings[index] || "ignore";
    return `<div class="mapping-row">
      <strong>Sloupec ${index + 1}</strong>
      <div class="sample-values">${samples.map((sample) => `<span>${escapeHtml(sample)}</span>`).join("") || "<span>Prázdný</span>"}</div>
      <select data-mapping-index="${index}">
        ${mappingTargets.map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </div>`;
  }).join("");

  els.mappingArea.querySelectorAll("[data-mapping-index]").forEach((select) => {
    select.addEventListener("change", () => {
      state.importMappings[Number(select.dataset.mappingIndex)] = select.value;
    });
  });
}

function importMappedRows() {
  if (!state.importRows.length) return;
  let customersAdded = 0;
  let ordersAdded = 0;
  let customersUpdated = 0;
  const now = new Date().toISOString();

  state.importRows.forEach((row) => {
    const record = {};
    state.importMappings.forEach((target, index) => {
      if (!target || target === "ignore") return;
      record[target] = [record[target], clean(row[index])].filter(Boolean).join("\n");
    });
    if (!Object.keys(record).length) return;

    const contactText = Object.values(record).join("\n");
    const nameParts = splitName(record.fullName);
    const firstName = cleanCustomerName(clean(record.firstName || nameParts.firstName));
    const lastName = cleanCustomerName(clean(record.lastName || nameParts.lastName));
    const email = extractEmailFromText(contactText);
    const phone = extractPhoneFromText(contactText);
    const customer = findOrCreateCustomer({ firstName, lastName, email, phone }, now);
    const wasNew = customer.createdAt === now && customer.updatedAt === now;

    customer.firstName = firstName || customer.firstName || "Bez jména";
    customer.lastName = lastName || customer.lastName || "";
    customer.fbName = clean(record.fbName) || customer.fbName || "";
    customer.email = email || extractEmailFromText(customer.email) || customer.email || "";
    customer.phone = phone || extractPhoneFromText(customer.phone) || customer.phone || "";
    const parsedAddress = parseAddressParts(record.address);
    customer.street = clean(record.street) || parsedAddress.street || customer.street || "";
    customer.postalCode = normalizePostalCode(record.postalCode || parsedAddress.postalCode || customer.postalCode);
    customer.city = clean(record.city) || parsedAddress.city || customer.city || "";
    customer.address = customerAddress(customer) || removeContactParts(record.address) || customer.address || "";
    customer.country = normalizeCountry(record.country, [contactText, customerAddress(customer)].join("\n")) || normalizeCountry(customer.country, contactText);
    customer.note = [customer.note, clean(record.customerNote)].filter(Boolean).join("\n");
    customer.tags = normalizeTags([...(customer.tags || []), ...parseTags(record.tags), ...tagsFromRecord(record)]);
    customer.updatedAt = now;

    if (wasNew) customersAdded += 1;
    else customersUpdated += 1;

    const hasOrder = clean(record.varieties) || clean(record.price) || clean(record.orderNote);
    if (hasOrder) {
      state.data.orders.push({
        id: uid(),
        customerId: customer.id,
        orderDate: toDateInput(new Date()),
        season: defaultSeason(),
        varietiesText: clean(record.varieties),
        price: clean(record.price).replace(/[^\d,.]/g, ""),
        currency: detectCurrency(record.price),
        exchangeRate: "",
        paymentStatus: parsePaymentStatus(record.paymentStatus || record.orderNote || record.customerNote),
        shippingStatus: parseShippingStatus(record.shippingStatus || record.orderNote || record.customerNote),
        paymentReminderDate: "",
        shippingReminderDate: "",
        deliveryMethod: normalizeDeliveryMethod(record.deliveryMethod, [record.orderNote, record.customerNote, customerAddress(customer)].join(" ")),
        packetaPointId: "",
        codAmount: "",
        shippingFee: "",
        packingFee: "",
        codFee: "",
        trackingNumber: "",
        packetaPacketId: "",
        note: clean(record.orderNote),
        createdAt: now,
        updatedAt: now,
      });
      upsertVarietiesFromText(clean(record.varieties));
      ordersAdded += 1;
    }
  });

  saveData();
  renderAll();
  toast(`Import hotový: ${customersAdded} nových, ${customersUpdated} upravených, ${ordersAdded} objednávek.`);
}

function findOrCreateCustomer(input, now) {
  const email = normalize(extractEmailFromText(input.email) || input.email);
  const phone = digits(extractPhoneFromText(input.phone) || input.phone);
  const fullName = nameKey(`${input.firstName} ${input.lastName}`);
  let customer = state.data.customers.find((item) => {
    if (email && normalize(item.email) === email) return true;
    if (phone && digits(item.phone) === phone) return true;
    return fullName && fullName.split(" ").length > 1 && nameKey(customerName(item)) === fullName;
  });

  if (!customer) {
    customer = sanitizeCustomer({
      id: uid(),
      firstName: input.firstName || "Bez jména",
      lastName: input.lastName || "",
      phone: input.phone || "",
      email: input.email || "",
      street: "",
      postalCode: "",
      city: "",
      address: "",
      country: "",
      tags: [],
      note: "",
      createdAt: now,
      updatedAt: now,
    });
    state.data.customers.push(customer);
  }

  return customer;
}

function guessMappings(rows) {
  const columns = maxColumns(rows);
  return Array.from({ length: columns }, (_, index) => {
    const samples = rows.map((row) => clean(row[index])).filter(Boolean);
    const joined = samples.join(" ").toLowerCase();
    if (samples.some((sample) => sample.includes("@"))) return "email";
    if (joined.match(/\b(fb|fcb|facebook)\b/)) return "fbName";
    if (joined.match(/\b(tel|telefon|phone|mobil)\b/)) return "phone";
    if (joined.match(/\b(psč|psc|zip|postal)\b/)) return "postalCode";
    if (samples.length && samples.every((sample) => sample.match(/^\d{3}\s?\d{2}$/))) return "postalCode";
    if (joined.match(/\b(město|mesto|city|obec)\b/)) return "city";
    if (joined.match(/\b(ulice|street)\b/)) return "street";
    if (joined.match(/\b(země|krajina|country|česko|cesko|slovensko|slovakia)\b/)) return "country";
    if (joined.match(/\b(adresa|address)\b/)) return "address";
    if (joined.match(/\b(zapl|neplat|dobír|dobir)\b/)) return "paymentStatus";
    if (joined.match(/\b(doprava|doruceni|doručení|delivery|osobní odběr|osobni odber|osobny odber|vyzved|packeta|zásilkovna|zasilkovna)\b/)) return "deliveryMethod";
    if (joined.match(/\b(odesl|poslat|zásilkovna|zasilkovna|packeta|osobně|osobne|vyzved)\b/)) return "orderNote";
    if (joined.match(/\b(piňata|pinata|kaleidoskop|bandit|coleus|koleus|odrůd|odrod)\b/)) return "varieties";
    if (samples.every((sample) => sample.match(/^[\d\s,.]+(kč|czk|eur|€)?$/i))) return "price";
    if (index === 0) return "fullName";
    if (index === 1) return "email";
    if (index === 2) return "varieties";
    return "ignore";
  });
}

function parseDelimited(text) {
  const normalized = String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];
  const delimiter = normalized.includes("\t") ? "\t" : normalized.includes(";") ? ";" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" && !quoted) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

async function backupData() {
  toast("Připravuji zálohu dat...");
  const snapshot = {
    app: "Africké kopřivy",
    version: STORE_KEY,
    exportedAt: new Date().toISOString(),
    photoMode: "refs-only",
    data: JSON.parse(JSON.stringify(state.data || {})),
  };
  downloadJson(`africke-koprivy-zaloha-${toDateInput(new Date())}.json`, snapshot);
  toast("Záloha dat stažena.");
}

function exportCustomers() {
  const rows = [
    ["Jméno a příjmení", "FB jméno", "Telefon", "Email", "Ulice", "PSČ", "Město", "Země", "Interně", "Štítky", "Poznámka"],
    ...state.data.customers.map((customer) => [
      customerName(customer),
      customer.fbName,
      customer.phone,
      customer.email,
      customer.street,
      customer.postalCode,
      customer.city,
      customer.country,
      customer.customerRating,
      (customer.tags || []).join(", "),
      customer.note,
    ]),
  ];
  downloadCsv("africke-koprivy-zakaznici.csv", rows);
}

function exportOrders() {
  const rows = [
    ["Datum", "Zákazník", "Odrůdy", "Cena", "Měna", "Zásilkovna", "Balné", "Extra poplatky", "Platba", "Stav", "Předání", "Poznámka"],
    ...state.data.orders.map((order) => {
      const customer = findCustomer(order.customerId);
      const currency = normalizeCurrency(order.currency);
      return [
        order.orderDate,
        customerName(customer),
        order.varietiesText,
        order.price,
        currency,
        order.shippingFee,
        order.packingFee,
        normalizeNamedFees(order.extraFees).map((fee) => `${fee.name} ${fee.amount}`).join(" · "),
        paymentLabels[order.paymentStatus] || order.paymentStatus,
        shippingLabels[order.shippingStatus] || order.shippingStatus,
        deliveryLabels[order.deliveryMethod] || order.deliveryMethod,
        order.note,
      ];
    }),
  ];
  downloadCsv("africke-koprivy-objednavky.csv", rows);
}

function exportVarieties() {
  const rows = [
    ["Odrůda", "Prodejní cena", "Měna", "Historie cen", "Náhledová fotka", "Galerie", "Poznámka", "Aktivní", "V objednávkách"],
    ...state.data.varieties
      .sort((a, b) => naturalCompare(a.name, b.name))
      .map((variety) => [
        variety.name,
        variety.salePrice,
        normalizeCurrency(variety.saleCurrency),
        normalizePriceHistory(variety.priceHistory)
          .map((item) => `${item.date}: ${item.price ? formatMoney(item.price, item.currency) : "bez ceny"}`)
          .join("\n"),
        variety.photoUrl,
        (variety.gallery || []).join("\n"),
        variety.note,
        variety.active === false ? "ne" : "ano",
        varietyUsageCount(variety.name),
      ]),
  ];
  downloadCsv("africke-koprivy-odrudy.csv", rows);
}

async function exportMobilePhotoCatalog() {
  toast("Připravuji katalog pro mobil bez zákazníků...");
  const payload = await buildMobilePhotoPayload(MOBILE_PHOTO_CATALOG_TYPE);
  downloadJson(`africke-koprivy-katalog-pro-mobil-${toDateInput(new Date())}.json`, payload);
  toast("Katalog pro mobil stažen. Neobsahuje zákazníky ani objednávky.");
}

async function exportMobilePhotos() {
  toast("Připravuji fotky...");
  const payload = await buildMobilePhotoPayload(MOBILE_PHOTO_EXPORT_TYPE);
  downloadJson(`africke-koprivy-fotky-z-mobilu-${toDateInput(new Date())}.json`, payload);
  toast("Foto balíček stažen.");
}

async function importMobilePhotosFromFile(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const payload = JSON.parse(await readTextFile(file));
    const result = await importMobilePhotoPayload(payload);
    saveData();
    renderAll();
    toast(`Import hotový: ${result.photos} fotek, ${result.varieties} odrůd, ${result.crosses} křížení.`);
  } catch (error) {
    console.error(error);
    toast("Import fotek se nepodařil. Vyber JSON z této appky.");
  }
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(file, "utf-8");
  });
}

async function buildPortableData(data) {
  const portable = JSON.parse(JSON.stringify(data || {}));
  return materializeDataPhotos(portable);
}

async function materializeDataPhotos(data) {
  for (const variety of data.varieties || []) {
    const images = await materializePhotoList(varietyImages(variety));
    variety.photoUrl = images[0] || "";
    variety.gallery = images.slice(1);
  }
  for (const cross of data.crosses || []) {
    const images = await materializePhotoList(crossSeedlingImages(cross));
    cross.seedlingPhotoUrl = images[0] || "";
    cross.seedlingGallery = images.slice(1);
  }
  for (const offer of data.offers || []) {
    for (const item of offer.items || []) {
      item.photoUrl = await materializePhoto(item.photoUrl);
    }
  }
  return data;
}

async function buildMobilePhotoPayload(type) {
  const varieties = [];
  for (const variety of state.data.varieties || []) {
    varieties.push({
      id: variety.id,
      name: variety.name,
      active: variety.active !== false,
      photos: await materializePhotoList(varietyImages(variety)),
      updatedAt: variety.updatedAt || "",
    });
  }

  const crosses = [];
  for (const cross of state.data.crosses || []) {
    crosses.push({
      id: cross.id,
      motherVarietyId: cross.motherVarietyId,
      pollenVarietyId: cross.pollenVarietyId,
      stage: cross.stage,
      resultRating: cross.resultRating,
      seedlingName: cross.seedlingName,
      linkedVarietyId: cross.linkedVarietyId,
      seedlingPhotos: await materializePhotoList(crossSeedlingImages(cross)),
      updatedAt: cross.updatedAt || "",
    });
  }

  return {
    app: "Africké kopřivy",
    type,
    version: 1,
    exportedAt: new Date().toISOString(),
    quality: "original",
    privacy: "Obsahuje jen katalog, křížení a fotky. Neobsahuje zákazníky ani objednávky.",
    varieties,
    crosses,
  };
}

async function materializePhotoList(images) {
  const result = [];
  for (const image of unique((images || []).map(clean).filter(Boolean))) {
    const portable = await materializePhoto(image);
    if (portable) result.push(portable);
  }
  return unique(result);
}

async function materializePhoto(image) {
  const value = clean(image);
  if (!value) return "";
  if (isDataImage(value)) return value;
  try {
    if (isLocalPhotoRef(value)) {
      const file = await resolveLocalPhotoFile(value, true);
      return file ? await readFileAsDataUrl(file) : value;
    }
    if (isIndexedPhotoRef(value)) {
      const file = await resolveIndexedPhotoFile(value);
      return file ? await readFileAsDataUrl(file) : value;
    }
    if (isSupabasePhotoRef(value)) {
      const file = await resolveSupabasePhotoFile(value);
      return file ? await readFileAsDataUrl(file) : value;
    }
  } catch {
    return value;
  }
  return value;
}

async function importMobilePhotoPayload(payload) {
  const type = clean(payload?.type);
  if (![MOBILE_PHOTO_CATALOG_TYPE, MOBILE_PHOTO_EXPORT_TYPE].includes(type)) {
    throw new Error("Unsupported photo package");
  }

  const result = { photos: 0, varieties: 0, crosses: 0 };
  for (const item of payload.varieties || []) {
    const name = clean(item.name);
    if (!name) continue;
    let variety = findVariety(clean(item.id)) || findVarietyByName(name);
    if (!variety) {
      variety = {
        id: clean(item.id) || uid(),
        name,
        photoUrl: "",
        gallery: [],
        salePrice: "",
        saleCurrency: "CZK",
        priceHistory: [],
        stockAvailable: "",
        stockReserved: "",
        note: "",
        active: item.active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.data.varieties.push(variety);
      result.varieties += 1;
    }
    const saved = await savePortablePhotoList(name, item.photos || []);
    result.photos += mergeImagesIntoVariety(variety, saved);
  }
  invalidateDerivedCache();

  for (const item of payload.crosses || []) {
    const seedlingName = clean(item.seedlingName);
    let cross = findCross(clean(item.id)) || findCrossForMobileImport(item);
    if (!cross && (clean(item.motherVarietyId) || clean(item.pollenVarietyId) || seedlingName)) {
      cross = normalizeCross({
        id: clean(item.id) || uid(),
        motherVarietyId: clean(item.motherVarietyId),
        pollenVarietyId: clean(item.pollenVarietyId),
        stage: item.stage,
        resultRating: item.resultRating,
        seedlingName,
        linkedVarietyId: clean(item.linkedVarietyId),
      });
      state.data.crosses.push(cross);
      invalidateDerivedCache();
      result.crosses += 1;
    }
    if (!cross) continue;
    const saved = await savePortablePhotoList(seedlingName || crossLineageLabel(cross), item.seedlingPhotos || []);
    result.photos += mergeImagesIntoCross(cross, saved);
    const linked = findVariety(clean(cross.linkedVarietyId)) || (seedlingName ? findVarietyByName(seedlingName) : null);
    if (linked) mergeImagesIntoVariety(linked, saved);
  }

  state.data.varieties = mergeVarieties(state.data.varieties);
  state.data.crosses = state.data.crosses.map(normalizeCross);
  return result;
}

function findCrossForMobileImport(item) {
  const linkedVarietyId = clean(item.linkedVarietyId);
  const seedlingName = normalize(clean(item.seedlingName));
  return (state.data.crosses || []).find((cross) =>
    (linkedVarietyId && clean(cross.linkedVarietyId) === linkedVarietyId) ||
    (seedlingName && normalize(cross.seedlingName) === seedlingName),
  );
}

async function savePortablePhotoList(ownerName, photos) {
  const directRefs = [];
  const files = [];
  unique((photos || []).map(clean).filter(Boolean)).forEach((photo, index) => {
    if (isDataImage(photo)) {
      files.push(dataUrlToFile(photo, `${safeFileName(ownerName, "fotka")}-${index + 1}${photoExtension(photo)}`));
    } else {
      directRefs.push(photo);
    }
  });
  const saved = files.length ? await saveVarietyPhotoFiles(ownerName || "fotky", files) : [];
  return unique([...directRefs, ...saved]);
}

function dataUrlToFile(dataUrl, fileName) {
  const match = clean(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) return new File([""], fileName || "fotka.jpg", { type: "image/jpeg" });
  const mimeType = match[1] || "image/jpeg";
  const isBase64 = Boolean(match[2]);
  const body = match[3] || "";
  const binary = isBase64 ? atob(body) : decodeURIComponent(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], fileName || `fotka${photoExtension(dataUrl)}`, { type: mimeType });
}

function mergeImagesIntoVariety(variety, images) {
  if (!variety || !images?.length) return 0;
  const before = varietyImages(variety);
  const merged = unique([...before, ...images]);
  variety.photoUrl = merged[0] || "";
  variety.gallery = merged.slice(1);
  variety.updatedAt = new Date().toISOString();
  return Math.max(0, merged.length - before.length);
}

function mergeImagesIntoCross(cross, images) {
  if (!cross || !images?.length) return 0;
  const before = crossSeedlingImages(cross);
  const merged = unique([...before, ...images]);
  cross.seedlingPhotoUrl = merged[0] || "";
  cross.seedlingGallery = merged.slice(1);
  cross.updatedAt = new Date().toISOString();
  return Math.max(0, merged.length - before.length);
}

function loadSupabaseSyncConfig() {
  try {
    return normalizeSupabaseSyncConfig(JSON.parse(localStorage.getItem(SUPABASE_SYNC_CONFIG_KEY) || "{}"));
  } catch {
    return normalizeSupabaseSyncConfig();
  }
}

function normalizeSupabaseSyncConfig(parsed = {}) {
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
    lastKnownCloudSummary: normalizeSupabaseSyncSummary(parsed.lastKnownCloudSummary),
  };
}

function migrateSupabaseSyncClientConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUPABASE_SYNC_CONFIG_KEY) || "{}");
    const normalized = normalizeSupabaseSyncConfig(parsed);
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
      || JSON.stringify(normalizeSupabaseSyncSummary(parsed.lastKnownCloudSummary)) !== JSON.stringify(normalized.lastKnownCloudSummary);
    if (!changed) return;
    localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(normalized));
    if (storedUrl && (storedUrl !== normalized.url || storedAnonKey !== normalized.anonKey)) {
      localStorage.removeItem(SUPABASE_SYNC_SESSION_KEY);
    }
  } catch {
    localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(normalizeSupabaseSyncConfig()));
  }
}

function loadSupabaseSyncSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SUPABASE_SYNC_SESSION_KEY) || "{}");
    return {
      accessToken: clean(parsed.accessToken),
      refreshToken: clean(parsed.refreshToken),
      expiresAt: Number(parsed.expiresAt) || 0,
      user: parsed.user || null,
    };
  } catch {
    return { accessToken: "", refreshToken: "", expiresAt: 0, user: null };
  }
}

function isSupabaseSyncLoggedIn() {
  const session = loadSupabaseSyncSession();
  return Boolean(session.accessToken || session.refreshToken);
}

function updatePrivateAppMode() {
  const loggedIn = isSupabaseSyncLoggedIn();
  document.body.classList.toggle("private-locked", !loggedIn);
  updateSupabaseSyncPanelMode();
}

function saveSupabaseSyncSession(session) {
  if (!session?.access_token) return;
  const expiresIn = Number(session.expires_in) || 3600;
  updateSupabaseSyncConfig({ autoSync: true });
  localStorage.setItem(
    SUPABASE_SYNC_SESSION_KEY,
    JSON.stringify({
      accessToken: session.access_token,
      refreshToken: session.refresh_token || "",
      expiresAt: Date.now() + Math.max(60, expiresIn - 30) * 1000,
      user: session.user || null,
    }),
  );
  updatePrivateAppMode();
  updateSupabaseSyncStatus("Přihlášeno. Sync je připravený.");
}

function loadSupabaseSyncConfigIntoPanel() {
  const config = loadSupabaseSyncConfig();
  if (els.syncSupabaseUrl) els.syncSupabaseUrl.value = config.url;
  if (els.syncSupabaseAnonKey) els.syncSupabaseAnonKey.value = config.anonKey;
  if (els.syncEmail) els.syncEmail.value = config.email;
  if (els.syncEncryptionKey) els.syncEncryptionKey.value = currentSupabaseEncryptionPassword();
  if (els.syncAutoEnabled) els.syncAutoEnabled.checked = Boolean(config.autoSync);
  updateSupabaseSyncStatus();
}

function saveSupabaseSyncConfigFromPanel(options = {}) {
  const previous = loadSupabaseSyncConfig();
  const config = normalizeSupabaseSyncConfig({
    url: clean(els.syncSupabaseUrl?.value) || DEFAULT_SUPABASE_URL,
    anonKey: clean(els.syncSupabaseAnonKey?.value) || DEFAULT_SUPABASE_ANON_KEY,
    email: clean(els.syncEmail?.value),
    autoSync: true,
    lastPulledAt: previous.lastPulledAt || "",
    lastPushedAt: previous.lastPushedAt || "",
    lastSyncedAt: previous.lastSyncedAt || "",
    lastKnownCloudAt: previous.lastKnownCloudAt || "",
    lastKnownCloudSummary: previous.lastKnownCloudSummary || normalizeSupabaseSyncSummary(),
  });
  localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(config));
  if (els.syncAutoEnabled) els.syncAutoEnabled.checked = true;
  updateSupabaseSyncStatus("Nastavení syncu uložené.");
  if (!options.quiet) toast("Nastavení syncu uložené.");
}

function updateSupabaseSyncStatus(message = "") {
  updatePrivateAppMode();
  if (!els.syncStatus) {
    updateSupabaseSyncFloat(message);
    return;
  }
  if (message) {
    els.syncStatus.textContent = message;
    updateSupabaseSyncFloat(message);
    return;
  }
  const config = loadSupabaseSyncConfig();
  const session = loadSupabaseSyncSession();
  if (!config.url || !config.anonKey) {
    els.syncStatus.textContent = "Doplň Supabase URL a anon key.";
    return;
  }
  if (!session.accessToken) {
    els.syncStatus.textContent = "Nastavení uložené, ještě se přihlas.";
    return;
  }
  if (hasPendingSupabaseSync()) {
    els.syncStatus.textContent = "Čeká na odeslání lokální změny.";
    updateSupabaseSyncFloat(els.syncStatus.textContent);
    updateSupabaseSyncPanelMode();
    return;
  }
  const auto = config.autoSync ? " Automatický sync je zapnutý." : "";
  const key = currentSupabaseEncryptionPassword() ? "" : " Pro automatický sync zadej šifrovací heslo.";
  els.syncStatus.textContent = `Přihlášeno. Sync je připravený.${auto}${key}`;
  updateSupabaseSyncFloat(els.syncStatus.textContent);
  updateSupabaseSyncPanelMode();
}

function updateSupabaseSyncFloat(text = "") {
  if (!els.syncFloat) return;
  const config = loadSupabaseSyncConfig();
  const session = loadSupabaseSyncSession();
  const visible = Boolean(session.accessToken || config.autoSync || text);
  els.syncFloat.hidden = !visible;
  if (!visible) return;
  const normalizedSource = normalize(text);
  const last = latestSyncTimestamp(config.lastSyncedAt, config.lastPulledAt, config.lastPushedAt);
  let shortText = last ? `Syncnuto ${formatTime(last)}` : `Syncnuto ${formatTime(new Date())}`;
  if (/selhalo|nepoda|chybi|chyba/.test(normalizedSource)) shortText = "Sync chyba";
  else if (/odesil|nahrav|stah|kontrol|sifruj|desifruj|prihlasuj|vytvarim/.test(normalizedSource)) shortText = "Syncuji...";
  else if (hasPendingSupabaseSync()) shortText = "Čeká na sync";
  else if (!session.accessToken) shortText = "Sync vypnutý";
  els.syncFloat.textContent = shortText;
  const normalized = normalize(shortText);
  els.syncFloat.classList.toggle("is-error", /selhalo|nepoda|chybi|chyba/.test(normalized));
  els.syncFloat.classList.toggle("is-working", /syncuji|ceka/.test(normalized));
  els.syncFloat.classList.toggle("is-off", /vypnuty/.test(normalized));
}

function latestSyncTimestamp(...values) {
  return values
    .map(clean)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || "";
}

function normalizeSupabaseSyncSummary(parsed = {}) {
  return {
    customers: Math.max(0, Number(parsed?.customers) || 0),
    orders: Math.max(0, Number(parsed?.orders) || 0),
    varieties: Math.max(0, Number(parsed?.varieties) || 0),
    crosses: Math.max(0, Number(parsed?.crosses) || 0),
    offers: Math.max(0, Number(parsed?.offers) || 0),
  };
}

function summarizeSupabaseSyncData(data) {
  return normalizeSupabaseSyncSummary({
    customers: Array.isArray(data?.customers) ? data.customers.length : 0,
    orders: Array.isArray(data?.orders) ? data.orders.length : 0,
    varieties: Array.isArray(data?.varieties) ? data.varieties.length : 0,
    crosses: Array.isArray(data?.crosses) ? data.crosses.length : 0,
    offers: Array.isArray(data?.offers) ? data.offers.length : 0,
  });
}

function supabaseSyncSummaryHasData(summary) {
  const normalized = normalizeSupabaseSyncSummary(summary);
  return Boolean(normalized.customers || normalized.orders || normalized.varieties || normalized.crosses || normalized.offers);
}

function isSupabaseSyncSummarySmaller(localSummary, cloudSummary) {
  const local = normalizeSupabaseSyncSummary(localSummary);
  const cloud = normalizeSupabaseSyncSummary(cloudSummary);
  return local.varieties + 2 < cloud.varieties
    || local.crosses + 1 < cloud.crosses
    || local.orders + 1 < cloud.orders
    || local.offers < cloud.offers
    || local.customers + 3 < cloud.customers;
}

function formatSupabaseSyncSummary(summary) {
  const normalized = normalizeSupabaseSyncSummary(summary);
  return `${normalized.varieties} odrud, ${normalized.crosses} krizeni, ${normalized.orders} objednavek, ${normalized.offers} nabidek`;
}

function rememberSupabaseSyncSnapshot(storageKey, kind, data, updatedAt = "") {
  try {
    const normalized = normalizeLoadedData(JSON.parse(JSON.stringify(data || fallbackData())));
    localStorage.setItem(storageKey, JSON.stringify({
      kind,
      savedAt: new Date().toISOString(),
      updatedAt: clean(updatedAt),
      summary: summarizeSupabaseSyncData(normalized),
      data: normalized,
    }));
  } catch {
    // Snapshot is only a safety extra. Sync must keep working even without storage room.
  }
}

async function readSupabaseCloudState(session, encryptionPassword) {
  const rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=encrypted_data,updated_at`, {
    method: "GET",
  });
  const updatedAt = clean(rows?.[0]?.updated_at);
  const encrypted = rows?.[0]?.encrypted_data;
  if (!encrypted) {
    return { updatedAt, data: null, summary: normalizeSupabaseSyncSummary() };
  }
  const decrypted = normalizeLoadedData(await decryptSyncPayload(encrypted, encryptionPassword));
  return {
    updatedAt,
    data: decrypted,
    summary: summarizeSupabaseSyncData(decrypted),
  };
}

function getSupabaseSyncPushBlockMessage(localSummary, cloudSummary, knownCloudSummary, knownCloudAt = "", liveCloudAt = "", options = {}) {
  const local = normalizeSupabaseSyncSummary(localSummary);
  const liveCloud = normalizeSupabaseSyncSummary(cloudSummary);
  const knownCloud = normalizeSupabaseSyncSummary(knownCloudSummary);
  const smallerThanLiveCloud = supabaseSyncSummaryHasData(liveCloud) && isSupabaseSyncSummarySmaller(local, liveCloud);
  const smallerThanKnownCloud = supabaseSyncSummaryHasData(knownCloud) && isSupabaseSyncSummarySmaller(local, knownCloud);
  const sameKnownCloud = Boolean(clean(knownCloudAt) && clean(liveCloudAt) && clean(knownCloudAt) === clean(liveCloudAt));
  if (smallerThanLiveCloud && (!clean(knownCloudAt) || !sameKnownCloud)) {
    return `Cloud ma vic dat nez toto zarizeni (${formatSupabaseSyncSummary(liveCloud)} vs ${formatSupabaseSyncSummary(local)}). Odeslani jsem radsi zastavila, aby se nic nesmazalo. Nejdriv stahni cloud nebo udelej zalohu.`;
  }
  if (sameKnownCloud && smallerThanKnownCloud) {
    const confirmAllowed = Boolean(options.allowConfirm);
    const question = `Tohle zarizeni ma ted min dat nez posledni znamy dobry cloud (${formatSupabaseSyncSummary(knownCloud)} vs ${formatSupabaseSyncSummary(local)}). Pokud jsi vedome mazala vic veci, muzes pokracovat. Opravdu prepsat cloud timto zarizenim?`;
    if (confirmAllowed && window.confirm(question)) return "";
    return `Tohle zarizeni ma ted min dat nez posledni znamy dobry cloud (${formatSupabaseSyncSummary(knownCloud)} vs ${formatSupabaseSyncSummary(local)}). Odeslani jsem radsi zastavila, aby se nic nesmazalo.`;
  }
  return "";
}

function currentSupabaseSyncDirtyAt() {
  try {
    return clean(localStorage.getItem(SUPABASE_SYNC_DIRTY_KEY));
  } catch {
    return "";
  }
}

function hasPendingSupabaseSync() {
  return Boolean(state.supabaseSyncDirty || currentSupabaseSyncDirtyAt());
}

function markSupabaseSyncDirty() {
  state.supabaseSyncDirty = true;
  try {
    localStorage.setItem(SUPABASE_SYNC_DIRTY_KEY, new Date().toISOString());
  } catch {
    // In-memory dirty state still protects this tab if storage is unavailable.
  }
}

function clearSupabaseSyncDirtyIfUnchanged(startedDirtyAt = "") {
  const currentDirtyAt = currentSupabaseSyncDirtyAt();
  if (currentDirtyAt && currentDirtyAt !== startedDirtyAt) {
    state.supabaseSyncDirty = true;
    return false;
  }
  state.supabaseSyncDirty = false;
  try {
    localStorage.removeItem(SUPABASE_SYNC_DIRTY_KEY);
  } catch {
    // ignore localStorage availability issues
  }
  return true;
}

function updateSupabaseSyncPanelMode() {
  const loggedIn = isSupabaseSyncLoggedIn();
  document.querySelector(".sync-panel")?.classList.toggle("is-logged-in", loggedIn);
  document.querySelector("#syncLoginBtn")?.toggleAttribute("hidden", loggedIn);
  document.querySelector("#syncLogoutBtn")?.toggleAttribute("hidden", !loggedIn);
}

function updateSupabaseSyncConfig(patch) {
  const config = normalizeSupabaseSyncConfig({ ...loadSupabaseSyncConfig(), ...(patch || {}) });
  localStorage.setItem(SUPABASE_SYNC_CONFIG_KEY, JSON.stringify(config));
  if (els.syncAutoEnabled) els.syncAutoEnabled.checked = Boolean(config.autoSync);
}

function currentSupabaseEncryptionPassword() {
  const value = clean(els.syncEncryptionKey?.value);
  if (value) {
    state.syncEncryptionPassword = value;
    localStorage.setItem(SUPABASE_SYNC_PASSWORD_KEY, value);
    return value;
  }
  const stored = clean(state.syncEncryptionPassword || localStorage.getItem(SUPABASE_SYNC_PASSWORD_KEY));
  state.syncEncryptionPassword = stored;
  return stored;
}

function canAutoSupabaseSync() {
  const config = loadSupabaseSyncConfig();
  const session = loadSupabaseSyncSession();
  return Boolean(config.autoSync && config.url && config.anonKey && (session.accessToken || session.refreshToken) && currentSupabaseEncryptionPassword());
}

function scheduleAutoSupabaseSync(reason = "") {
  const config = loadSupabaseSyncConfig();
  if (!config.autoSync || state.supabaseSyncMuted) return;
  markSupabaseSyncDirty();
  window.clearTimeout(state.supabaseSyncTimer);
  if (!canAutoSupabaseSync()) {
    if (reason === "save") updateSupabaseSyncStatus("Změna je uložená lokálně. Pro automatický sync se přihlas a zadej šifrovací heslo.");
    return;
  }
  updateSupabaseSyncStatus("Změna uložená. Automatický sync za chvíli odešle data do cloudu.");
  state.supabaseSyncTimer = window.setTimeout(runAutoSupabaseSync, 9000);
}

async function runAutoSupabaseSync() {
  state.supabaseSyncTimer = null;
  if (!hasPendingSupabaseSync() || state.supabaseSyncRunning || state.supabasePullRunning || !canAutoSupabaseSync()) return;
  await pushSupabaseSync({ auto: true, silent: true });
}

async function maybeAutoPullSupabaseSync(options = {}) {
  if (state.supabasePullRunning || state.supabaseSyncRunning || !canAutoSupabaseSync() || document.visibilityState === "hidden") return;
  const now = Date.now();
  if (!options.force && now - Number(state.lastSupabaseAutoPullAt || 0) < SUPABASE_SYNC_PULL_MIN_GAP_MS) return;
  if (hasPendingSupabaseSync()) {
    if (!state.supabaseSyncTimer) scheduleAutoSupabaseSync("retry");
    return;
  }
  state.lastSupabaseAutoPullAt = now;
  await pullSupabaseSync({ auto: true, silent: true });
}

function supabaseBaseUrl() {
  return clean(loadSupabaseSyncConfig().url).replace(/\/+$/, "");
}

function supabaseAnonKey() {
  return clean(loadSupabaseSyncConfig().anonKey);
}

function requireSupabaseConfig() {
  const config = loadSupabaseSyncConfig();
  if (!config.url || !config.anonKey) throw new Error("Chybí Supabase URL nebo anon key.");
  return config;
}

async function signUpSupabaseSync() {
  saveSupabaseSyncConfigFromPanel();
  const email = clean(els.syncEmail?.value);
  const password = clean(els.syncPassword?.value);
  if (!email || !password) {
    toast("Doplň email a heslo.");
    return;
  }
  try {
    updateSupabaseSyncStatus("Vytvářím účet...");
    const result = await supabaseAuthRequest("/auth/v1/signup", { email, password });
    if (result?.access_token) saveSupabaseSyncSession(result);
    else updateSupabaseSyncStatus("Účet vytvořený. Pokud Supabase vyžaduje potvrzení emailu, potvrď ho a pak se přihlas.");
    toast("Účet vytvořený.");
  } catch (error) {
    console.error(error);
    updateSupabaseSyncStatus("Účet se nepodařilo vytvořit.");
    toast("Účet se nepodařilo vytvořit.");
  }
}

async function loginSupabaseSync() {
  saveSupabaseSyncConfigFromPanel();
  const email = clean(els.syncEmail?.value);
  const password = clean(els.syncPassword?.value);
  if (!email || !password) {
    toast("Doplň email a heslo.");
    return;
  }
  try {
    updateSupabaseSyncStatus("Přihlašuji...");
    const result = await supabaseAuthRequest("/auth/v1/token?grant_type=password", { email, password });
    saveSupabaseSyncSession(result);
    const verified = await pullSupabaseSync({ silent: true, verify: true });
    if (verified === false) {
      if (hasLocalSyncData() && window.confirm("Cloud nejde přečíst tímto šifrovacím heslem. Pokud jsou data v tomto PC správná, můžu cloud přepsat lokálními daty a znovu ho zašifrovat tímto heslem. Přepsat cloud?")) {
        state.syncEncryptionVerifiedPassword = currentSupabaseEncryptionPassword();
        const repaired = await pushSupabaseSync({ silent: true, force: true });
        if (repaired) {
          openMainView("offers");
          toast("Cloud opravený z tohoto PC.");
          return;
        }
      }
      openMainView("settings");
      toast("Přihlášeno, ale cloud nejde dešifrovat.");
      return;
    }
    openMainView("offers");
    toast("Přihlášeno.");
  } catch (error) {
    console.error(error);
    updateSupabaseSyncStatus("Přihlášení se nepodařilo.");
    toast("Přihlášení se nepodařilo.");
  }
}

function logoutSupabaseSync() {
  localStorage.removeItem(SUPABASE_SYNC_SESSION_KEY);
  photoRuntime.supabaseSignedUrls.clear();
  updatePrivateAppMode();
  openMainView("settings");
  updateSupabaseSyncStatus("Odhlášeno.");
  toast("Odhlášeno.");
}

async function pushSupabaseSync(options = {}) {
  const startedDirtyAt = currentSupabaseSyncDirtyAt();
  try {
    const encryptionPassword = currentSupabaseEncryptionPassword();
    if (!encryptionPassword) {
      if (!options.silent) toast("Doplň šifrovací heslo.");
      return false;
    }
    const syncedAt = new Date().toISOString();
    state.supabaseSyncRunning = true;
    const session = await ensureSupabaseSession();
    if (!options.force && state.syncEncryptionVerifiedPassword !== encryptionPassword) {
      const verified = await verifySupabaseEncryptionPassword(encryptionPassword, session);
      if (verified !== true) {
        updateSupabaseSyncStatus(verified === false ? "Šifrovací heslo nesedí. Cloud jsem raději nepřepsala." : "Cloud teď nejde ověřit. Sync jsem raději zastavila.");
        if (!options.silent) toast(verified === false ? "Šifrovací heslo nesedí." : "Cloud nejde ověřit.");
        return false;
      }
      state.syncEncryptionVerifiedPassword = encryptionPassword;
    }
    const configBeforePush = loadSupabaseSyncConfig();
    let cloudState = { updatedAt: "", data: null, summary: normalizeSupabaseSyncSummary() };
    if (!options.force) {
      cloudState = await readSupabaseCloudState(session, encryptionPassword);
      if (cloudState.data) rememberSupabaseSyncSnapshot(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY, "cloud-before-push", cloudState.data, cloudState.updatedAt);
    }
    const localSummary = summarizeSupabaseSyncData(state.data);
    const blockMessage = options.force ? "" : getSupabaseSyncPushBlockMessage(
      localSummary,
      cloudState.summary,
      configBeforePush.lastKnownCloudSummary,
      configBeforePush.lastKnownCloudAt,
      cloudState.updatedAt,
      { allowConfirm: !options.auto && !options.silent },
    );
    if (blockMessage) {
      updateSupabaseSyncStatus(blockMessage);
      if (!options.silent) toast(blockMessage);
      return false;
    }
    rememberSupabaseSyncSnapshot(SUPABASE_SYNC_LAST_LOCAL_SNAPSHOT_KEY, "local-before-push", state.data);
    updateSupabaseSyncStatus(options.auto ? "Automaticky odesílám změny do cloudu..." : "Nahrávám fotky a šifruji data...");
    const syncData = await buildSupabaseSyncData(session.user?.id || "user");
    const pushedSummary = summarizeSupabaseSyncData(syncData);
    const encrypted = await encryptSyncPayload(syncData, encryptionPassword);
    const updatedAt = new Date().toISOString();
    await supabaseRequest("/rest/v1/app_sync?on_conflict=user_id", {
      method: "POST",
      body: {
        user_id: session.user?.id,
        encrypted_data: encrypted,
        updated_at: updatedAt,
      },
      headers: { Prefer: "resolution=merge-duplicates" },
    });
    state.syncEncryptionVerifiedPassword = encryptionPassword;
    cleanupSupabaseStorage(session.user?.id || "user", collectSupabasePhotoPaths(syncData)).catch((error) => console.warn("Supabase storage cleanup skipped", error));
    updateSupabaseSyncConfig({ lastPushedAt: updatedAt, lastSyncedAt: syncedAt, lastKnownCloudAt: updatedAt, lastKnownCloudSummary: pushedSummary });
    rememberSupabaseSyncSnapshot(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY, "cloud-after-push", syncData, updatedAt);
    const cleanAfterPush = clearSupabaseSyncDirtyIfUnchanged(startedDirtyAt);
    updateSupabaseSyncStatus(options.auto ? `Automatický sync hotový: ${formatTime(new Date())}.` : "Hotovo. Celá appka je v cloudu.");
    if (!options.silent) toast("Sync odeslán do cloudu.");
    if (!cleanAfterPush && loadSupabaseSyncConfig().autoSync) scheduleAutoSupabaseSync("retry");
    return true;
  } catch (error) {
    console.error(error);
    const message = friendlySupabaseError(error);
    updateSupabaseSyncStatus(`Odeslání syncu selhalo: ${message}`);
    if (!options.silent) toast(`Odeslání syncu selhalo: ${message}`);
    return false;
  } finally {
    state.supabaseSyncRunning = false;
    if (hasPendingSupabaseSync() && loadSupabaseSyncConfig().autoSync) scheduleAutoSupabaseSync("retry");
  }
}

async function pullSupabaseSync(options = {}) {
  try {
    const encryptionPassword = currentSupabaseEncryptionPassword();
    if (!encryptionPassword) {
      if (!options.silent) toast("Doplň šifrovací heslo.");
      return;
    }
    if (!options.verify && hasPendingSupabaseSync()) {
      updateSupabaseSyncStatus("Čeká na odeslání lokální změny. Cloud zatím nestahuji.");
      if (loadSupabaseSyncConfig().autoSync && !state.supabaseSyncTimer) scheduleAutoSupabaseSync("retry");
      if (!options.silent) toast("Nejdřív odešli lokální změny do cloudu.");
      return false;
    }
    state.supabasePullRunning = true;
    const session = await ensureSupabaseSession();
    const syncedAt = new Date().toISOString();
    updateSupabaseSyncStatus(options.auto ? "Kontroluji cloud..." : "Stahuji a dešifruji data...");
    const metadataOnly = Boolean(options.auto && !options.verify);
    let rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=${metadataOnly ? "updated_at" : "encrypted_data,updated_at"}`, {
      method: "GET",
    });
    let cloudUpdatedAt = clean(rows?.[0]?.updated_at);
    const passwordAlreadyVerified = state.syncEncryptionVerifiedPassword === encryptionPassword;
    if (metadataOnly && passwordAlreadyVerified && cloudUpdatedAt && cloudUpdatedAt === loadSupabaseSyncConfig().lastPulledAt) {
      updateSupabaseSyncConfig({ lastSyncedAt: syncedAt });
      updateSupabaseSyncStatus();
      return true;
    }
    if (metadataOnly && cloudUpdatedAt) {
      rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(session.user?.id)}&select=encrypted_data,updated_at`, {
        method: "GET",
      });
      cloudUpdatedAt = clean(rows?.[0]?.updated_at);
    }
    const encrypted = rows?.[0]?.encrypted_data;
    if (!encrypted) {
      updateSupabaseSyncConfig({ lastSyncedAt: syncedAt });
      if (!options.silent) toast("V cloudu zatím nejsou žádná data.");
      updateSupabaseSyncStatus("V cloudu zatím nejsou žádná data.");
      state.syncEncryptionVerifiedPassword = encryptionPassword;
      return true;
    }
    const decrypted = await decryptSyncPayload(encrypted, encryptionPassword);
    if (hasLocalSyncData()) rememberSupabaseSyncSnapshot(SUPABASE_SYNC_LAST_LOCAL_SNAPSHOT_KEY, "local-before-pull", state.data);
    state.syncEncryptionVerifiedPassword = encryptionPassword;
    state.data = normalizeLoadedData(decrypted);
    syncFinishedCrossVarieties();
    saveData({ skipAutoSync: true });
    const pulledSummary = summarizeSupabaseSyncData(state.data);
    rememberSupabaseSyncSnapshot(SUPABASE_SYNC_LAST_CLOUD_SNAPSHOT_KEY, "cloud-after-pull", state.data, cloudUpdatedAt);
    renderAll();
    updateSupabaseSyncConfig({ lastPulledAt: cloudUpdatedAt, lastSyncedAt: syncedAt, lastKnownCloudAt: cloudUpdatedAt, lastKnownCloudSummary: pulledSummary });
    updateSupabaseSyncStatus(options.auto ? `Cloud stažen: ${formatTime(new Date())}.` : `Staženo z cloudu: ${formatCloudDateTime(cloudUpdatedAt)}.`);
    if (!options.silent) toast("Sync stažen z cloudu.");
    return true;
  } catch (error) {
    console.error(error);
    state.syncEncryptionVerifiedPassword = "";
    const message = isSyncDecryptError(error) ? "cloud je zašifrovaný jiným heslem" : friendlySupabaseError(error);
    updateSupabaseSyncStatus(`Stažení syncu selhalo: ${message}`);
    if (!options.silent) toast(`Stažení syncu selhalo: ${message}`);
    return false;
  } finally {
    state.supabasePullRunning = false;
  }
}

function hasLocalSyncData() {
  return Boolean(
    (state.data?.customers || []).length ||
      (state.data?.orders || []).length ||
      (state.data?.varieties || []).length ||
      (state.data?.offers || []).length ||
      (state.data?.crosses || []).length,
  );
}

async function verifySupabaseEncryptionPassword(password, session = null) {
  try {
    const activeSession = session || await ensureSupabaseSession();
    const rows = await supabaseRequest(`/rest/v1/app_sync?user_id=eq.${encodeURIComponent(activeSession.user?.id)}&select=encrypted_data`, {
      method: "GET",
    });
    const encrypted = rows?.[0]?.encrypted_data;
    if (!encrypted) return true;
    await decryptSyncPayload(encrypted, password);
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

async function supabaseAuthRequest(path, body) {
  requireSupabaseConfig();
  const response = await fetch(`${supabaseBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey(),
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
  return response.json();
}

async function ensureSupabaseSession() {
  requireSupabaseConfig();
  const session = loadSupabaseSyncSession();
  if (session.accessToken && session.expiresAt > Date.now() && session.user?.id) return session;
  if (!session.refreshToken) throw new Error("Chybí přihlášení.");
  const refreshed = await supabaseAuthRequest("/auth/v1/token?grant_type=refresh_token", {
    refresh_token: session.refreshToken,
  });
  saveSupabaseSyncSession(refreshed);
  return loadSupabaseSyncSession();
}

async function supabaseRequest(path, options = {}) {
  const session = await ensureSupabaseSession();
  const headers = {
    apikey: supabaseAnonKey(),
    Authorization: `Bearer ${session.accessToken}`,
    ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${supabaseBaseUrl()}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function buildSupabaseSyncData(userId) {
  const data = JSON.parse(JSON.stringify(state.data || {}));
  for (const variety of data.varieties || []) {
    const images = varietyImages(variety);
    const refs = await uploadPhotoListForSync(userId, variety.name, images);
    ensureSupabasePhotoRefsForSync(images, refs, variety.name || "odrůda");
    variety.photoUrl = refs[0] || "";
    variety.gallery = refs.slice(1);
  }
  for (const cross of data.crosses || []) {
    const images = crossSeedlingImages(cross);
    const refs = await uploadPhotoListForSync(userId, cross.seedlingName || "semenac", images);
    ensureSupabasePhotoRefsForSync(images, refs, cross.seedlingName || "semenáč");
    cross.seedlingPhotoUrl = refs[0] || "";
    cross.seedlingGallery = refs.slice(1);
  }
  for (const offer of data.offers || []) {
    for (const item of offer.items || []) {
      const originalPhoto = clean(item.photoUrl);
      item.photoUrl = await uploadPhotoForSync(userId, offerItemNameSafe(item) || "nabidka", item.photoUrl);
      ensureSupabasePhotoRefsForSync(originalPhoto ? [originalPhoto] : [], item.photoUrl ? [item.photoUrl] : [], offerItemNameSafe(item) || "nabídka");
    }
  }
  return data;
}

function ensureSupabasePhotoRefsForSync(originalRefs, uploadedRefs, ownerName = "fotka") {
  const originals = unique((originalRefs || []).map(clean).filter(Boolean));
  const uploaded = unique((uploadedRefs || []).map(clean).filter(Boolean));
  const allUploaded = originals.every((ref) => isSupabasePhotoRef(ref))
    || (uploaded.length >= originals.length && uploaded.every((ref) => isSupabasePhotoRef(ref)));
  if (!allUploaded) {
    throw new Error(`Fotku u „${ownerName}“ se nepodařilo nahrát do cloudu. Cloud jsem raději nepřepsala.`);
  }
}

function collectSupabasePhotoPaths(data) {
  const paths = new Set();
  const add = (value) => {
    const ref = clean(value);
    if (isSupabasePhotoRef(ref)) {
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

async function cleanupSupabaseStorage(userId, usedPaths) {
  const prefix = `${encodeURIComponent(userId)}/`;
  const existing = await listSupabaseStoragePaths(prefix);
  const unused = existing.filter((path) => !usedPaths.has(path));
  if (!unused.length) return;
  await deleteSupabaseStoragePaths(unused);
}

async function listSupabaseStoragePaths(prefix) {
  const result = [];
  const walk = async (folder) => {
    const entries = await supabaseStorageRequest(`/storage/v1/object/list/${SUPABASE_SYNC_BUCKET}`, {
      method: "POST",
      body: { prefix: folder, limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } },
    });
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

async function deleteSupabaseStoragePaths(paths) {
  for (let index = 0; index < paths.length; index += 100) {
    await supabaseStorageRequest(`/storage/v1/object/${SUPABASE_SYNC_BUCKET}`, {
      method: "DELETE",
      body: { prefixes: paths.slice(index, index + 100) },
    });
  }
}

async function uploadPhotoListForSync(userId, ownerName, images) {
  const refs = [];
  for (const image of unique((images || []).map(clean).filter(Boolean))) {
    const ref = await uploadPhotoForSync(userId, ownerName, image);
    if (ref) refs.push(ref);
  }
  return unique(refs);
}

async function uploadPhotoForSync(userId, ownerName, image) {
  const value = clean(image);
  if (!value) return "";
  if (isSupabasePhotoRef(value)) return value;
  const file = await photoToOriginalFile(value, ownerName);
  if (!file) throw new Error(`Fotku u „${ownerName}“ se nepodařilo přečíst pro cloud.`);
  const uploadFile = await preparePhotoFileForStorage(file);
  const path = await supabaseStoragePathForPhoto(userId, ownerName, uploadFile);
  await uploadSupabaseStorageFile(path, uploadFile);
  const thumb = await createPhotoThumbnailFile(uploadFile);
  if (thumb) await uploadSupabaseStorageFile(supabaseThumbnailPath(path), thumb);
  return supabasePhotoRef(path);
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
  const baseName = safeFileName(clean(originalFile?.name || "fotka").replace(/\.[^.]+$/, ""), "fotka");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

async function createPhotoThumbnailFile(file) {
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
    return blob ? new File([blob], `${safeFileName(file.name || "nahled", "nahled")}.jpg`, { type: "image/jpeg" }) : null;
  } catch {
    return null;
  }
}

async function supabaseStoragePathForPhoto(userId, ownerName, file) {
  const hash = await fileSha256Id(file);
  return `${encodeURIComponent(userId)}/${safeFileName(ownerName, "fotka")}/${hash}${photoExtension(file)}`;
}

async function fileSha256Id(file) {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 28);
}

async function photoToOriginalFile(image, ownerName = "fotka") {
  const value = clean(image);
  try {
    if (isLocalPhotoRef(value)) return await resolveLocalPhotoFile(value, true);
    if (isIndexedPhotoRef(value)) return await resolveIndexedPhotoFile(value);
    if (isSupabasePhotoRef(value)) return await resolveSupabasePhotoFile(value);
    if (isDataImage(value)) return dataUrlToFile(value, `${safeFileName(ownerName, "fotka")}${photoExtension(value)}`);
  } catch {
    return null;
  }
  return null;
}

async function resolveSupabasePhotoUrl(ref) {
  if (photoRuntime.supabaseSignedUrls.has(ref)) return photoRuntime.supabaseSignedUrls.get(ref);
  const path = parseSupabasePhotoRef(ref);
  if (!path) return "";
  const file = await resolveSupabasePhotoFile(ref);
  if (file) {
    const url = URL.createObjectURL(file);
    photoRuntime.supabaseSignedUrls.set(ref, url);
    return url;
  }
  if (isSupabaseThumbnailPath(path)) return "";
  const signed = await createSupabaseSignedPhotoUrl(path);
  if (!signed) return "";
  photoRuntime.supabaseSignedUrls.set(ref, signed);
  return signed;
}

async function resolveSupabasePhotoFile(ref) {
  const path = parseSupabasePhotoRef(ref);
  if (!path) return null;
  const cached = await getCachedSupabasePhotoFile(ref);
  if (cached) return cached;
  const session = await ensureSupabaseSession();
  const response = await fetch(`${supabaseBaseUrl()}/storage/v1/object/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, {
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  if (!response.ok) return null;
  const blob = await response.blob();
  const file = new File([blob], path.split("/").pop() || "fotka.jpg", { type: blob.type || "image/jpeg" });
  cacheSupabasePhotoFile(ref, file).catch(() => {});
  return file;
}

async function getCachedSupabasePhotoFile(ref) {
  const key = supabasePhotoCacheKey(ref);
  if (!key) return null;
  try {
    const db = await openPhotoDb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const transaction = db.transaction(PHOTO_BLOB_STORE, "readonly");
      const request = transaction.objectStore(PHOTO_BLOB_STORE).get(key);
      request.addEventListener("success", () => {
        const record = request.result;
        const blob = record?.file || record?.blob;
        resolve(blob ? new File([blob], record.name || "fotka.jpg", { type: record.type || blob.type || "image/jpeg" }) : null);
      });
      request.addEventListener("error", () => resolve(null));
      transaction.addEventListener("complete", () => db.close());
      transaction.addEventListener("abort", () => db.close());
    });
  } catch {
    return null;
  }
}

async function cacheSupabasePhotoFile(ref, file) {
  const key = supabasePhotoCacheKey(ref);
  if (!key || !file) return;
  const db = await openPhotoDb();
  if (!db) return;
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_BLOB_STORE, "readwrite");
    transaction.objectStore(PHOTO_BLOB_STORE).put(
      { file, blob: file, name: file.name, type: file.type, cachedAt: new Date().toISOString() },
      key
    );
    transaction.addEventListener("complete", () => {
      db.close();
      resolve();
    });
    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error);
    });
    transaction.addEventListener("abort", () => {
      db.close();
      reject(transaction.error);
    });
  });
}

function supabasePhotoCacheKey(ref) {
  const value = clean(ref);
  return value && isSupabasePhotoRef(value) ? `supabase-cache:${value}` : "";
}

async function createSupabaseSignedPhotoUrl(path) {
  const result = await supabaseStorageRequest(`/storage/v1/object/sign/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, {
    method: "POST",
    body: { expiresIn: 3600 },
  });
  const signedPath = clean(result?.signedURL || result?.signedUrl);
  if (!signedPath) return "";
  return signedPath.startsWith("http") ? signedPath : `${supabaseBaseUrl()}${signedPath}`;
}

async function supabaseStorageRequest(path, options = {}) {
  const session = await ensureSupabaseSession();
  const response = await fetch(`${supabaseBaseUrl()}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${session.accessToken}`,
      ...(options.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function uploadSupabaseStorageFile(path, file) {
  const session = await ensureSupabaseSession();
  const response = await fetch(`${supabaseBaseUrl()}/storage/v1/object/${SUPABASE_SYNC_BUCKET}/${encodeStoragePath(path)}`, {
    method: "PUT",
    headers: {
      apikey: supabaseAnonKey(),
      Authorization: `Bearer ${session.accessToken}`,
      "content-type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });
  if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
}

function friendlySupabaseError(error) {
  const raw = clean(error?.message || String(error || ""));
  if (!raw) return "neznámá chyba";
  try {
    const parsed = JSON.parse(raw);
    const message = clean(parsed.message || parsed.msg || parsed.error_description || parsed.error);
    if (message) return message;
  } catch {
    // Supabase někdy vrací čistý text, někdy JSON.
  }
  if (/row-level security|violates row-level security/i.test(raw)) return "RLS nepovolilo zápis pro tohoto uživatele";
  if (/bucket.*not.*found|not found/i.test(raw)) return "nenašel se bucket na fotky";
  if (/duplicate key/i.test(raw)) return "duplicitní záznam";
  if (/jwt|token|unauthorized|401/i.test(raw)) return "přihlášení vypršelo nebo nesedí klíč projektu";
  if (/permission|403/i.test(raw)) return "chybí oprávnění v Supabase";
  return raw.slice(0, 180);
}

async function encryptSyncPayload(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 180000;
  const key = await deriveSyncCryptoKey(password, salt, iterations);
  const plainText = new TextEncoder().encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plainText);
  return {
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(cipher)),
  };
}

async function decryptSyncPayload(payload, password) {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const cipher = base64ToBytes(payload.ciphertext);
  const key = await deriveSyncCryptoKey(password, salt, Number(payload.iterations) || 180000);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain));
}

async function deriveSyncCryptoKey(password, salt, iterations) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(clean(value));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function supabasePhotoRef(path) {
  return `${SUPABASE_PHOTO_PREFIX}${encodeURIComponent(clean(path))}`;
}

function parseSupabasePhotoRef(ref) {
  return decodeURIComponent(clean(ref).slice(SUPABASE_PHOTO_PREFIX.length));
}

function supabaseThumbnailRef(ref) {
  const path = parseSupabasePhotoRef(ref);
  const thumbPath = supabaseThumbnailPath(path);
  return thumbPath ? supabasePhotoRef(thumbPath) : ref;
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

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(";")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function triggerDownload(href, filename) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function filteredCustomers() {
  const query = normalize(state.customerSearch);
  return state.data.customers
    .filter((customer) => {
      if (state.customerQuickFilter === "attention" && !isAttentionCustomer(customer)) return false;
      if (state.countryFilter && customer.country !== state.countryFilter) return false;
      if (state.tagFilter && !customer.tags?.includes(state.tagFilter)) return false;
      if (!query) return true;
      return normalize([
        customer.firstName,
        customer.lastName,
        customer.fbName,
        customer.email,
        customer.phone,
        customer.street,
        customer.postalCode,
        customer.city,
        customer.address,
        customer.country,
        customer.customerRating,
        customer.note,
      ].join(" ")).includes(query);
    })
    .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
}

function filteredOrders() {
  const query = normalize(state.orderSearch);
  return state.data.orders
    .filter((order) => {
      if (state.orderQuickFilter && !orderMatchesQuickFilter(order, state.orderQuickFilter)) return false;
      if (state.paymentFilter && order.paymentStatus !== state.paymentFilter) return false;
      if (state.shippingFilter && order.shippingStatus !== state.shippingFilter) return false;
      if (state.deliveryFilter && normalizeDeliveryMethod(order.deliveryMethod) !== state.deliveryFilter) return false;
      if (state.orderVarietyFilter && !orderMatchesVariety(order, state.orderVarietyFilter)) return false;
      if (state.seasonFilter && order.season !== state.seasonFilter) return false;
      if (!query) return true;
      const customer = findCustomer(order.customerId);
      return matchesSearchText([
        customerName(customer),
        customer?.country,
        order.varietiesText,
        order.note,
        order.shippingFee,
        order.packingFee,
        ...normalizeNamedFees(order.extraFees).map((fee) => `${fee.name} ${fee.amount}`),
        deliverySummary(order),
      ].join(" "), query);
    })
    .sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1));
}

function orderMatchesQuickFilter(order, filter) {
  const delivery = normalizeDeliveryMethod(order.deliveryMethod);
  const customer = findCustomer(order.customerId);
  const country = normalize(customer?.country || "");
  if (filter === "payment-due") return order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno";
  if (filter === "paid-profit") return order.paymentStatus === "zaplaceno";
  if (filter === "ready") return order.shippingStatus === "připraveno";
  if (filter === "no-price") return !hasSavedOrderPrice(order);
  if (filter === "pickup") return delivery === "personal_pickup";
  if (filter === "country-sk") return country.includes("slovensko");
  if (filter === "country-cz") return country.includes("cesko") || country.includes("česko");
  if (filter === "todo") {
    if (delivery === "personal_pickup") return order.shippingStatus !== "zaplaceno";
    return !["odesláno", "zaplaceno"].includes(order.shippingStatus);
  }
  return true;
}

function syncOrderQuickFilterButtons() {
  els.orderQuickFilters?.querySelectorAll("[data-order-quick-filter]").forEach((button) => {
    const isActive = (button.dataset.orderQuickFilter || "") === state.orderQuickFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function varietyComparablePriceCzk(variety) {
  const amount = parseDecimal(variety?.salePrice);
  if (!Number.isFinite(amount)) return Number.NaN;
  const currency = normalizeCurrency(variety?.saleCurrency);
  if (currency === "CZK") return amount;
  const rate = exchangeRateForDate(toDateInput(new Date()));
  return rate?.rateCzkPerEur ? convertAmount(amount, currency, "CZK", rate.rateCzkPerEur) : Number.NaN;
}

function filteredVarieties() {
  const query = normalize(state.varietySearch);
  return state.data.varieties
    .filter((variety) => {
      const used = varietyUsageCount(variety.name);
      if (state.varietyUsageFilter === "used" && used === 0) return false;
      if (state.varietyUsageFilter === "unused" && used > 0) return false;
      if (state.varietyUsageFilter === "active" && variety.active === false) return false;
      if (state.varietyUsageFilter === "photo" && !varietyImages(variety).length) return false;
      if (state.varietyUsageFilter === "inactive" && variety.active !== false) return false;
      if (!query) return true;
      return normalize([variety.name, variety.note, variety.salePrice, variety.saleCurrency, varietyPriceText(variety)].join(" ")).includes(query);
    })
    .sort((a, b) => {
      if (state.varietySort === "updated") return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
      if (state.varietySort === "name") return naturalCompare(a.name, b.name);
      if (state.varietySort === "price-asc" || state.varietySort === "price-desc") {
        const aPrice = varietyComparablePriceCzk(a);
        const bPrice = varietyComparablePriceCzk(b);
        const aFinite = Number.isFinite(aPrice);
        const bFinite = Number.isFinite(bPrice);
        if (aFinite && bFinite) {
          const delta = state.varietySort === "price-asc" ? aPrice - bPrice : bPrice - aPrice;
          return delta || naturalCompare(a.name, b.name);
        }
        if (aFinite) return -1;
        if (bFinite) return 1;
        return naturalCompare(a.name, b.name);
      }
      const usageDelta = varietyUsageCount(b.name) - varietyUsageCount(a.name);
      return usageDelta || naturalCompare(a.name, b.name);
    });
}

function filteredOffers() {
  const query = normalize(state.offerSearch);
  return state.data.offers
    .filter((offer) => {
      if (!query) return true;
      const items = Array.isArray(offer.items) ? offer.items : [];
      const reservationNames = items.flatMap((item) =>
        item.reservations.map((reservation) => customerName(findCustomer(reservation.customerId))),
      );
      return matchesSearchText([
        offer.title,
        offerTypeLabel(offer),
        offer.status,
        offer.note,
        ...items.map((item) => offerItemNameSafe(item)),
        ...reservationNames,
      ].join(" "), query);
    })
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

function metric(label, value, filter = "", options = {}) {
  const meta = {
    "payment-due": { icon: "Kč", hint: "čeká na úhradu" },
    "paid-profit": { icon: "💰", hint: "jen odrůdy po úhradě" },
    ready: { icon: "✓", hint: "lze balit" },
    todo: { icon: "→", hint: "klikni a řeš" },
    "warning-customers": { icon: "!", hint: "zákazníci pozor" },
  }[filter] || { icon: "•", hint: "" };
  const finalMeta = {
    icon: options.icon || meta.icon,
    hint: options.hint || meta.hint,
  };
  const content = `
    <span class="metric-icon" aria-hidden="true">${escapeHtml(finalMeta.icon)}</span>
    <span class="metric-copy">
      <span>${escapeHtml(label)}</span>
      ${finalMeta.hint ? `<em>${escapeHtml(finalMeta.hint)}</em>` : ""}
    </span>
    <strong>${escapeHtml(String(value ?? ""))}</strong>`;
  const className = ["metric", filter ? `metric-${filter}` : ""].filter(Boolean).join(" ");
  if (filter) return `<button class="${className}" type="button" data-dashboard-filter="${escapeHtml(filter)}">${content}</button>`;
  return `<article class="${className}">${content}</article>`;
}

function detailLine(label, value) {
  return `<div class="detail-line"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}

function customerAddress(customer) {
  if (!customer) return "";
  const structured = [customer.street, customer.postalCode, customer.city].map(clean).filter(Boolean).join(", ");
  return structured || removeContactParts(customer.address);
}

function customerHasAddress(customer) {
  return Boolean(clean(customer?.street) || clean(customer?.postalCode) || clean(customer?.city) || clean(customer?.address));
}

function customerRatingLabel(customer) {
  return clean(customer?.customerRating);
}

function seasonFromDate(date) {
  const value = clean(date);
  const year = value.match(/^\d{4}/)?.[0] || String(new Date().getFullYear());
  return `Sezóna ${year}`;
}

function defaultSeason() {
  return seasonFromDate(toDateInput(new Date()));
}

function seasonOptions() {
  const currentYear = new Date().getFullYear();
  return unique([
    defaultSeason(),
    `Sezóna ${currentYear - 1}`,
    ...state.data.orders.map((order) => clean(order.season)).filter(Boolean),
  ]).sort((a, b) => b.localeCompare(a, "cs"));
}

function totalByCurrencyText(orders) {
  const totals = orders.reduce((map, order) => {
    const amount = orderResolvedTotal(order);
    if (!Number.isFinite(amount)) return map;
    const currency = normalizeCurrency(order.currency);
    map.set(currency, (map.get(currency) || 0) + amount);
    return map;
  }, new Map());
  const text = [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency));
  return text.length ? text.join(" + ") : "Bez částky";
}

function paidVarietyProfitText(orders) {
  const totals = orders.reduce((map, order) => {
    if (order.paymentStatus !== "zaplaceno") return map;
    const amount = paidVarietyProfitAmount(order);
    if (!Number.isFinite(amount) || amount <= 0) return map;
    const currency = normalizeCurrency(order.currency);
    map.set(currency, (map.get(currency) || 0) + amount);
    return map;
  }, new Map());
  const text = [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency));
  return text.length ? text.join(" + ") : "0 Kč";
}

function paidVarietyProfitAmount(order) {
  const total = orderResolvedTotal(order);
  if (!Number.isFinite(total)) return Number.NaN;
  return Math.max(total - orderFeeTotal(order), 0);
}

function orderFeeTotal(order) {
  const shippingFee = parseDecimal(order?.shippingFee);
  const packingFee = parseDecimal(order?.packingFee);
  const codFee = parseDecimal(order?.codFee);
  return (Number.isFinite(shippingFee) && shippingFee > 0 ? shippingFee : 0)
    + (Number.isFinite(packingFee) && packingFee > 0 ? packingFee : 0)
    + (Number.isFinite(codFee) && codFee > 0 ? codFee : 0)
    + sumNamedFees(order?.extraFees);
}

function renderProfitOverview(orders) {
  if (!els.profitYearFilter || !els.profitChart || !els.profitChartSummary) {
    return {
      selectedYear: String(new Date().getFullYear()),
      paidOrders: [],
      pricedPaidOrderCount: 0,
      missingAmountCount: 0,
      missingRateCount: 0,
      total: 0,
      bestMonth: null,
      months: [],
    };
  }
  const years = unique(
    orders
      .map((order) => clean(order.orderDate).slice(0, 4))
      .filter((year) => /^\d{4}$/.test(year)),
  ).sort((a, b) => b.localeCompare(a, "cs"));
  const fallbackYear = years[0] || String(new Date().getFullYear());
  const selectedYear = years.includes(state.dashboardProfitYear) ? state.dashboardProfitYear : fallbackYear;
  state.dashboardProfitYear = selectedYear;

  els.profitYearFilter.innerHTML = years.length
    ? years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("")
    : `<option value="${escapeHtml(fallbackYear)}">${escapeHtml(fallbackYear)}</option>`;
  els.profitYearFilter.value = selectedYear;

  const months = Array.from({ length: 12 }, (_, index) => ({
    label: new Intl.DateTimeFormat("cs-CZ", { month: "long" }).format(new Date(Number(selectedYear), index, 1)),
    total: 0,
    orderCount: 0,
  }));

  const paidOrders = orders.filter((order) => order.paymentStatus === "zaplaceno" && clean(order.orderDate).startsWith(selectedYear));
  let missingAmountCount = 0;
  let missingRateCount = 0;
  paidOrders.forEach((order) => {
      const monthIndex = Number(clean(order.orderDate).slice(5, 7)) - 1;
      if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
      const amount = paidVarietyProfitAmount(order);
      if (!Number.isFinite(amount)) {
        missingAmountCount += 1;
        return;
      }
      const converted = convertOrderProfitToCzk(amount, order);
      if (!Number.isFinite(converted)) {
        missingRateCount += 1;
        return;
      }
      months[monthIndex].total += converted;
      months[monthIndex].orderCount += 1;
    });

  const total = months.reduce((sum, month) => sum + month.total, 0);
  const pricedPaidOrderCount = months.reduce((sum, month) => sum + month.orderCount, 0);
  const bestMonth = months.reduce((best, month) => (month.total > (best?.total || 0) ? month : best), null);
  const summaryParts = [
    `Za ${selectedYear}: ${formatMoney(total, "CZK")}`,
    `${paidOrders.length} zaplacených objednávek`,
    "bez poštovného, balného a dobírky",
  ];
  if (pricedPaidOrderCount && pricedPaidOrderCount !== paidOrders.length) summaryParts.push(`${pricedPaidOrderCount} se započteným ziskem`);
  if (bestMonth?.total > 0) summaryParts.push(`nejsilnější měsíc ${bestMonth.label} (${formatMoney(bestMonth.total, "CZK")})`);
  if (missingAmountCount) summaryParts.push(`${missingAmountCount} bez vyplněné ceny`);
  if (missingRateCount) summaryParts.push(`${missingRateCount} objednávek bez kurzu v grafu`);
  els.profitChartSummary.textContent = summaryParts.join(" · ");

  const max = Math.max(...months.map((month) => month.total), 0);
  els.profitChart.innerHTML = total > 0
    ? `<div class="profit-bar-list">${months
        .map((month) => {
          const width = max > 0 && month.total > 0 ? Math.max((month.total / max) * 100, 6) : 0;
          return `<article class="profit-bar-row">
              <span class="profit-bar-label">${escapeHtml(month.label)}</span>
              <div class="profit-bar-track" aria-hidden="true">
                <span class="profit-bar-fill" style="width:${width}%"></span>
              </div>
              <div class="profit-bar-value">
                <strong>${escapeHtml(formatMoney(month.total, "CZK"))}</strong>
                <small>${month.orderCount ? `${month.orderCount}× zaplaceno` : "0"}</small>
              </div>
            </article>`;
        })
        .join("")}</div>`
    : emptyState(
        paidOrders.length
          ? `V roce ${selectedYear} zatím není zaplacená objednávka s vyplněnou cenou pro výpočet zisku.`
          : `V roce ${selectedYear} zatím není zaplacená objednávka se započitatelným ziskem.`,
      );

  return {
    selectedYear,
    paidOrders,
    pricedPaidOrderCount,
    missingAmountCount,
    missingRateCount,
    total,
    bestMonth,
    months,
  };
}

function convertOrderProfitToCzk(amount, order) {
  if (!Number.isFinite(amount)) return Number.NaN;
  const currency = normalizeCurrency(order?.currency);
  if (currency === "CZK") return amount;
  const rate = exchangeRateForOrder(order);
  return rate?.rate ? convertAmount(amount, currency, "CZK", rate.rate) : Number.NaN;
}

function feeSettings() {
  if (!state.data.settings) state.data.settings = normalizeFeeSettings();
  return state.data.settings;
}

function normalizeFeeSettings(settings = {}) {
  return {
    shippingFeeCz: normalizeAmount(settings?.shippingFeeCz ?? settings?.shippingFee),
    shippingFeeSk: normalizeAmount(settings?.shippingFeeSk),
    postalFee: normalizeAmount(settings?.postalFee ?? settings?.postageFee),
    shippingFeeAddressCz: normalizeAmount(settings?.shippingFeeAddressCz ?? settings?.shippingFeeAddress ?? settings?.shippingFeeHome ?? settings?.shippingFeeAddressHome),
    shippingFeeAddressSk: normalizeAmount(settings?.shippingFeeAddressSk ?? settings?.shippingFeeAddress ?? settings?.shippingFeeHome ?? settings?.shippingFeeAddressHome),
    packingFee: normalizeAmount(settings?.packingFee),
    codFeeCz: normalizeAmount(settings?.codFeeCz ?? settings?.codFee),
    codFeeSk: normalizeAmount(settings?.codFeeSk),
    currency: normalizeCurrency(settings?.currency),
    paymentAccountName: clean(settings?.paymentAccountName),
    paymentAccountNumber: clean(settings?.paymentAccountNumber),
    paymentIban: clean(settings?.paymentIban),
    paymentSwift: clean(settings?.paymentSwift ?? settings?.paymentBic ?? settings?.paymentSwiftBic),
    extraFees: configuredExtraFees(settings?.extraFees),
    facebookOfferTemplate: clean(settings?.facebookOfferTemplate),
  };
}

function feeSettingsSummary(settings = feeSettings()) {
  const currency = normalizeCurrency(settings.currency);
  const parts = [];
  if (clean(settings.shippingFeeCz)) parts.push(`Zásilkovna ČR ${formatMoney(settings.shippingFeeCz, currency)}`);
  if (clean(settings.shippingFeeSk)) parts.push(`Zásilkovna Slovensko ${formatMoney(settings.shippingFeeSk, currency)}`);
  if (clean(settings.postalFee)) parts.push(`Balíkovna ${formatMoney(settings.postalFee, currency)}`);
  if (clean(settings.shippingFeeAddressCz)) parts.push(`Zásilkovna na adresu ČR ${formatMoney(settings.shippingFeeAddressCz, currency)}`);
  if (clean(settings.shippingFeeAddressSk)) parts.push(`Zásilkovna na adresu Slovensko ${formatMoney(settings.shippingFeeAddressSk, currency)}`);
  if (clean(settings.packingFee)) parts.push(`Balné ${formatMoney(settings.packingFee, currency)}`);
  if (clean(settings.codFeeCz)) parts.push(`Dobírka ČR ${formatMoney(settings.codFeeCz, currency)}`);
  if (clean(settings.codFeeSk)) parts.push(`Dobírka Slovensko ${formatMoney(settings.codFeeSk, currency)}`);
  configuredExtraFees(settings.extraFees).forEach((fee) => {
    if (clean(fee.name) && clean(fee.amount)) parts.push(`${fee.name} ${formatMoney(fee.amount, currency)}`);
  });
  if (clean(settings.paymentAccountNumber) || clean(settings.paymentIban)) parts.push("platební údaje nastavené");
  return parts.length ? parts.join(" · ") : "Nové objednávky se zatím nepředvyplňují.";
}

function defaultOrderFees(currency, customerId = "") {
  const settings = feeSettings();
  if (normalizeCurrency(settings.currency) !== normalizeCurrency(currency)) return { shippingFee: "", packingFee: "", codFee: "", extraFees: [] };
  const customer = customerId ? findCustomer(customerId) : null;
  return {
    shippingFee: defaultShippingFeeForCustomer(settings, customer),
    packingFee: settings.packingFee,
    codFee: defaultCodFeeForCustomer(settings, customer),
    extraFees: configuredExtraFees(settings.extraFees),
  };
}

function applyDefaultCodFeeIfNeeded() {
  const form = els.orderForm;
  if (!form) return;
  form.elements.codAmount.value = "";
  updateOrderAdvancedSummary();
}

function applyOrderFeesToPrice() {
  const form = els.orderForm;
  const currency = normalizeCurrency(form.elements.currency.value);
  const currentPrice = parseDecimal(form.elements.price.value);
  const storedBase = parseDecimal(form.dataset.feesBasePrice);
  const basePrice = Number.isFinite(storedBase) ? storedBase : Number.isFinite(currentPrice) ? currentPrice : 0;
  const shippingFee = parseDecimal(form.elements.shippingFee.value);
  const packingFee = parseDecimal(form.elements.packingFee.value);
  const codFee = parseDecimal(form.elements.codFee.value);
  const extraFeeTotal = sumNamedFees(collectOrderExtraFeesFromForm());
  const feeTotal = (Number.isFinite(shippingFee) ? shippingFee : 0) + (Number.isFinite(packingFee) ? packingFee : 0) + (Number.isFinite(codFee) ? codFee : 0) + extraFeeTotal;

  if (feeTotal <= 0) {
    toast("Není nastavená doprava, balné, dobírka ani extra poplatek.");
    return;
  }

  const nextPrice = basePrice + feeTotal;
  form.dataset.feesBasePrice = String(basePrice);
  form.elements.price.value = formatEditableAmount(nextPrice, currency);
  form.dataset.priceManual = "";
  updateOrderAdvancedSummary();
  refreshOrderPricingPreview();
  syncOrderDialogState();
  toast("Poplatky přičtené do ceny.");
}

function normalizeNamedFees(fees = []) {
  if (!Array.isArray(fees)) return [];
  return fees
    .map((fee) => ({
      id: clean(fee?.id) || uid(),
      name: clean(fee?.name),
      amount: normalizeAmount(fee?.amount),
    }))
    .filter((fee) => fee.name || fee.amount);
}

function configuredExtraFees(fees = []) {
  return normalizeNamedFees(fees).filter((fee) => clean(fee.name) && clean(fee.amount));
}

function sumNamedFees(fees = []) {
  return normalizeNamedFees(fees).reduce((sum, fee) => {
    const amount = parseDecimal(fee.amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

function defaultShippingFeeForCustomer(settings, customer) {
  const normalizedCountry = normalize(normalizeCountry(customer?.country, customerAddress(customer)));
  if (normalizedCountry.includes("slovensko")) return settings.shippingFeeSk;
  if (normalizedCountry.includes("cesko") || normalizedCountry.includes("česko")) return settings.shippingFeeCz;
  return "";
}

function defaultShippingAddressFeeForCustomer(settings, customer) {
  const normalizedCountry = normalize(normalizeCountry(customer?.country, customerAddress(customer)));
  if (normalizedCountry.includes("slovensko")) return settings.shippingFeeAddressSk || settings.shippingFeeAddressCz || "";
  if (normalizedCountry.includes("cesko") || normalizedCountry.includes("česko")) return settings.shippingFeeAddressCz || settings.shippingFeeAddressSk || "";
  return settings.shippingFeeAddressCz || settings.shippingFeeAddressSk || "";
}

function isCountryDefaultShippingLabel(label) {
  const normalizedLabel = normalize(clean(label));
  return [
    normalize("Zásilkovna"),
    normalize("Zásilkovna ČR"),
    normalize("Zásilkovna SK"),
    normalize("Zásilkovna Slovensko"),
    normalize("Zásilkovna na adresu"),
    normalize("Zásilkovna na adresu ČR"),
    normalize("Zásilkovna na adresu Slovensko"),
  ].includes(normalizedLabel);
}

function isShippingAddressLabel(label) {
  const normalizedLabel = normalize(clean(label));
  return [
    normalize("Zásilkovna na adresu"),
    normalize("Zásilkovna na adresu ČR"),
    normalize("Zásilkovna na adresu Slovensko"),
  ].includes(normalizedLabel);
}

function defaultCodFeeForCustomer(settings, customer) {
  const normalizedCountry = normalize(normalizeCountry(customer?.country, customerAddress(customer)));
  if (normalizedCountry.includes("slovensko")) return settings.codFeeSk;
  if (normalizedCountry.includes("cesko") || normalizedCountry.includes("česko")) return settings.codFeeCz;
  return settings.codFeeCz || "";
}

function collectOrderExtraFeesFromForm() {
  return [...(els.orderExtraFeeFields?.querySelectorAll("[data-order-extra-fee-row]") || [])].map((row) => ({
    id: clean(row.dataset.orderExtraFeeRow),
    name: clean(row.dataset.orderExtraFeeName),
    amount: row.querySelector("[data-order-extra-fee]")?.value,
  }));
}

function renderOrderExtraFeeFields(extraFees, options = {}) {
  if (!els.orderExtraFeeFields) return;
  const feeBlock = els.orderExtraFeeFields.closest(".fee-extra-order-block");
  const preserve = options.preserveValues !== false ? collectOrderExtraFeesFromForm() : [];
  const preservedMap = new Map(preserve.map((fee) => [fee.id, fee]));
  const sourceFees = Array.isArray(extraFees)
    ? normalizeNamedFees(extraFees).filter((fee) => clean(fee.name))
    : configuredExtraFees(defaultOrderFees(els.orderForm.elements.currency.value, els.orderForm.elements.customerId.value).extraFees);
  const rows = sourceFees.map((fee) => {
    const preserved = preservedMap.get(fee.id);
    const defaultAmount = clean(fee.amount);
    const amount = preserved
      ? clean(preserved.amount)
      : options.activateValues === true
        ? defaultAmount
        : "";
    return { ...fee, amount, defaultAmount };
  });
  if (feeBlock) feeBlock.hidden = rows.length === 0;
  els.orderExtraFeeFields.innerHTML = rows.length
    ? rows
        .map((fee) => `<div class="fee-extra-order-row" data-order-extra-fee-row="${escapeHtml(fee.id)}" data-order-extra-fee-name="${escapeHtml(fee.name)}" data-order-extra-fee-default="${escapeHtml(fee.defaultAmount)}">
            <button class="button ghost" type="button" data-order-extra-fee-toggle="${escapeHtml(fee.id)}"></button>
            <input data-order-extra-fee type="hidden" value="${escapeHtml(fee.amount)}" />
          </div>`)
        .join("")
    : "";
  updateOrderAdvancedSummary();
  els.orderExtraFeeFields.querySelectorAll("[data-order-extra-fee-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleOrderExtraFee(button.dataset.orderExtraFeeToggle));
  });
  refreshOrderExtraFeeButtons();
}

function clearOrderExtraFees() {
  els.orderExtraFeeFields?.querySelectorAll("[data-order-extra-fee]").forEach((input) => {
    input.value = "";
  });
  refreshOrderExtraFeeButtons();
}

function clearOrderFeesForPersonalPickup() {
  const form = els.orderForm;
  if (!form) return;
  form.elements.shippingFee.value = "";
  delete form.elements.shippingFee.dataset.shippingLabel;
  form.elements.packingFee.value = "";
  form.elements.codFee.value = "";
  form.elements.codAmount.value = "";
  clearOrderExtraFees();
}

function handleOrderDeliveryMethodChange() {
  const form = els.orderForm;
  if (!form) return;
  const previousDelivery = normalizeDeliveryMethod(form.dataset.lastDeliveryMethod || "ship");
  const delivery = normalizeDeliveryMethod(form.elements.deliveryMethod.value);
  if (delivery === "personal_pickup") {
    if (previousDelivery !== "personal_pickup") rememberOrderDeliveryFeeRestoreSnapshot();
    clearOrderFeesForPersonalPickup();
  } else {
    const restored = previousDelivery === "personal_pickup" && restoreOrderDeliveryFeeRestoreSnapshot();
    if (!restored) {
      applyDefaultShippingFeeForSelectedCustomer();
      if (!clean(form.elements.id.value)) {
        renderOrderExtraFeeFields(undefined, { preserveValues: true });
      } else {
        refreshOrderExtraFeeButtons();
      }
    } else {
      refreshOrderExtraFeeButtons();
    }
  }
  form.dataset.lastDeliveryMethod = delivery;
  syncOrderDeliveryToggle();
  updateOrderAdvancedSummary();
  refreshOrderPricingPreview();
  syncOrderDialogState();
}

function applyDefaultShippingFeeForSelectedCustomer() {
  const form = els.orderForm;
  if (normalizeDeliveryMethod(form.elements.deliveryMethod.value) === "personal_pickup") {
    clearOrderFeesForPersonalPickup();
    updateOrderAdvancedSummary();
    return;
  }
  const currentShippingFee = clean(form.elements.shippingFee.value);
  const currentLabel = clean(form.elements.shippingFee.dataset.shippingLabel) || currentOrderShippingLabel();
  if (currentShippingFee && currentLabel && !isCountryDefaultShippingLabel(currentLabel)) {
    updateOrderAdvancedSummary();
    return;
  }
  const defaults = defaultOrderFees(form.elements.currency.value, form.elements.customerId.value);
  delete form.elements.shippingFee.dataset.shippingLabel;
  if (isShippingAddressLabel(currentLabel)) {
    form.elements.shippingFee.value = defaultShippingAddressFeeForCustomer(feeSettings(), currentOrderCustomer()) || "";
    if (clean(form.elements.shippingFee.value)) {
      form.elements.shippingFee.dataset.shippingLabel = shippingAddressLabelForCustomer(currentOrderCustomer());
    }
  } else {
    if (!clean(form.elements.id.value) || currentShippingFee) {
      form.elements.shippingFee.value = defaults.shippingFee || "";
    }
    if (clean(form.elements.shippingFee.value)) {
      form.elements.shippingFee.dataset.shippingLabel = shippingLabelForCustomer(currentOrderCustomer());
    }
  }
  if (!clean(form.elements.packingFee.value) && defaults.packingFee) form.elements.packingFee.value = defaults.packingFee;
  updateOrderAdvancedSummary();
}

function varietyImages(variety) {
  return unique([variety?.photoUrl, ...(Array.isArray(variety?.gallery) ? variety.gallery : normalizeGallery(variety?.gallery))].map(clean).filter(Boolean));
}

function varietyPriceText(variety) {
  if (!clean(variety?.salePrice)) return "Bez ceny";
  return formatMoney(variety.salePrice, normalizeCurrency(variety.saleCurrency));
}

function priceHistoryText(variety) {
  const history = normalizePriceHistory(variety?.priceHistory);
  if (history.length > 1) return `${history.length} změny`;
  if (history.length === 1) return "1 záznam";
  return "Bez historie";
}

function varietyPhotoCountText(count) {
  if (!count) return "Bez fotky";
  if (count === 1) return "1 fotka";
  if (count < 5) return `${count} fotky`;
  return `${count} fotek`;
}

function varietyUsageText(count) {
  if (!count) return "Zatím neprodaná";
  if (count === 1) return "1× v objednávce";
  return `${count}× v objednávkách`;
}

function varietyNotePreview(variety, images) {
  const note = cleanBusinessNote(variety?.note || "");
  if (note) return "";
  if (images?.length) return "Otevři detail pro galerii a historii ceny.";
  return "Zatím bez fotky a bez poznámky.";
}

function normalizeWholeNumber(value) {
  const amount = parseDecimal(value);
  if (!Number.isFinite(amount) || amount < 0) return "";
  return String(Math.floor(amount));
}

function renderPriceHistoryItem(item) {
  return `<div class="price-history-item">
    <span>${escapeHtml(formatDate(item.date))}</span>
    <strong>${escapeHtml(item.price ? formatMoney(item.price, item.currency) : "Bez ceny")}</strong>
  </div>`;
}

function isDataImage(value) {
  return clean(value).startsWith("data:image/");
}

function isLocalPhotoRef(value) {
  return clean(value).startsWith(LOCAL_PHOTO_PREFIX);
}

function isIndexedPhotoRef(value) {
  return clean(value).startsWith(INDEXED_PHOTO_PREFIX);
}

function isSupabasePhotoRef(value) {
  return clean(value).startsWith(SUPABASE_PHOTO_PREFIX);
}

function isStoredPhoto(value) {
  return isDataImage(value) || isLocalPhotoRef(value) || isIndexedPhotoRef(value) || isSupabasePhotoRef(value);
}

function photoImageMarkup(image, alt, extraClass = "", extraAttrs = "") {
  const classAttr = extraClass ? ` class="${escapeHtml(extraClass)}"` : "";
  const asyncAttr = clean(extraAttrs).includes("decoding=") ? "" : ' decoding="async"';
  const attrs = `${asyncAttr}${clean(extraAttrs) ? ` ${extraAttrs}` : ""}`;
  if (isLocalPhotoRef(image)) {
    return `<img${classAttr} data-local-photo-ref="${escapeHtml(image)}" alt="${escapeHtml(alt)}"${attrs} />`;
  }
  if (isIndexedPhotoRef(image)) {
    return `<img${classAttr} data-indexed-photo-ref="${escapeHtml(image)}" alt="${escapeHtml(alt)}"${attrs} />`;
  }
  if (isSupabasePhotoRef(image)) {
    const previewRef = clean(extraAttrs).includes("data-photo-full") ? image : supabaseThumbnailRef(image);
    const allowFallback = clean(extraAttrs).includes("data-supabase-photo-allow-fallback");
    const fallbackAttr = allowFallback && previewRef !== image ? ` data-supabase-photo-fallback="${escapeHtml(image)}"` : "";
    return `<img${classAttr} data-supabase-photo-ref="${escapeHtml(previewRef)}"${fallbackAttr} alt="${escapeHtml(alt)}"${attrs} />`;
  }
  return `<img${classAttr} src="${escapeHtml(image)}" alt="${escapeHtml(alt)}"${attrs} />`;
}

function varietyThumb(variety) {
  const image = varietyImages(variety)[0];
  if (image) {
    return `<span class="variety-thumb">${photoImageMarkup(image, variety.name, "", 'loading="lazy"')}</span>`;
  }
  return `<span class="variety-thumb empty">${escapeHtml(varietyInitials(variety.name))}</span>`;
}

function varietyInitials(name) {
  const parts = clean(name).split(/\s+/).filter(Boolean);
  return (parts[0]?.slice(0, 1) || "K") + (parts[1]?.slice(0, 1) || "");
}

function openVarietyDetailDialog(id) {
  const variety = findVariety(id);
  if (!variety) return;
  const images = varietyImages(variety);
  const orders = ordersForVariety(variety.name);
  const priceHistory = normalizePriceHistory(variety.priceHistory);
  els.galleryTitle.textContent = variety.name;
  const gallery = images.length
    ? `<section class="variety-detail-section">
        <div class="gallery-actions">
          <button class="button secondary" type="button" data-download-photo>Stáhnout fotku</button>
        </div>
        <div class="gallery-viewer" data-gallery-section data-current-photo-index="0">
          <div class="gallery-main" data-gallery-main tabindex="0">
            ${galleryMainContent(images, variety.name, 0)}
          </div>
        </div>
        <div class="gallery-strip">
          ${images
            .map(
              (image, index) => `<button class="gallery-thumb-button ${index === 0 ? "active" : ""}" type="button" data-gallery-select="${index}" title="Fotka ${index + 1}">
                ${photoImageMarkup(image, `${variety.name} ${index + 1}`, "", 'loading="lazy"')}
              </button>`,
            )
            .join("")}
        </div>
      </section>`
    : `<section class="variety-detail-section"><div class="gallery-empty">${varietyThumb(variety)}<span>Bez fotek</span></div></section>`;

  const buyers = orders.length
    ? orders
        .map((order) => {
          const customer = findCustomer(order.customerId);
          return `<article class="stack-item">
            <div>
              <strong>${escapeHtml(customerName(customer))}</strong>
              <small>${formatDate(order.orderDate)} · ${escapeHtml(formatOrderPrice(order))} · ${escapeHtml([paymentLabels[order.paymentStatus], shippingLabels[order.shippingStatus]].filter(Boolean).join(" / "))}</small>
              <small>${escapeHtml(order.varietiesText || "Bez odrůd")}</small>
            </div>
            <span class="row-actions">
              <button class="mini-button" type="button" title="Zákazník" data-focus-variety-customer="${order.customerId}">↗</button>
              <button class="mini-button" type="button" title="Objednávka" data-open-variety-order="${order.id}">✎</button>
            </span>
          </article>`;
        })
        .join("")
    : emptyState("Zatím není v žádné objednávce.");

  els.galleryContent.innerHTML = `
    <div class="variety-dialog-actions">
      <button class="button secondary" type="button" data-order-variety="${variety.id}">Nová objednávka s odrůdou</button>
      <button class="button secondary" type="button" data-focus-variety-orders="${escapeHtml(variety.name)}">Zobrazit objednávky</button>
      <button class="button ghost" type="button" data-edit-variety="${variety.id}">Upravit odrůdu</button>
    </div>
    <section class="variety-detail-section">
      <div class="price-summary">
        <span>Prodejní cena</span>
        <strong>${escapeHtml(varietyPriceText(variety))}</strong>
      </div>
      <div class="panel-heading">
        <h2>Historie ceny</h2>
        <strong>${priceHistory.length}</strong>
      </div>
      <div class="price-history">
        ${priceHistory.length ? priceHistory.map(renderPriceHistoryItem).join("") : `<span class="cell-sub">Zatím bez historie ceny</span>`}
      </div>
    </section>
    ${gallery}
    <section class="variety-detail-section">
      <div class="panel-heading">
        <h2>Kdo koupil</h2>
        <strong>${orders.length}</strong>
      </div>
      <div class="stack-list">${buyers}</div>
    </section>
  `;
  els.galleryContent.querySelector("[data-order-variety]").addEventListener("click", () => {
    els.galleryDialog.close();
    openOrderDialog(null, state.selectedCustomerId, {
      varietiesText: `${variety.name} 1x`,
      price: variety.salePrice || "",
      currency: normalizeCurrency(variety.saleCurrency),
      season: defaultSeason(),
    });
  });
  els.galleryContent.querySelector("[data-focus-variety-orders]").addEventListener("click", () => {
    els.galleryDialog.close();
    focusOrdersForVariety(variety.name);
  });
  els.galleryContent.querySelector("[data-edit-variety]").addEventListener("click", () => {
    els.galleryDialog.close();
    openVarietyDialog(variety.id);
  });
  els.galleryContent.querySelectorAll("[data-open-variety-order]").forEach((button) => {
    button.addEventListener("click", () => {
      els.galleryDialog.close();
      openOrderDialog(button.dataset.openVarietyOrder);
    });
  });
  els.galleryContent.querySelectorAll("[data-focus-variety-customer]").forEach((button) => {
    button.addEventListener("click", () => {
      els.galleryDialog.close();
      focusCustomer(button.dataset.focusVarietyCustomer);
    });
  });
  els.galleryContent.querySelectorAll("[data-gallery-select]").forEach((button) => {
    button.addEventListener("click", () => selectGalleryImage(images, variety.name, Number(button.dataset.gallerySelect)));
  });
  els.galleryContent.querySelector("[data-download-photo]")?.addEventListener("click", () => {
    const section = els.galleryContent.querySelector("[data-gallery-section]");
    const index = Number(section?.dataset.currentPhotoIndex || 0);
    downloadPhoto(images[index], variety.name, index);
  });
  els.galleryContent.querySelector("[data-gallery-main]")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-gallery-step]")) return;
    openGalleryFullscreen();
  });
  els.galleryContent.querySelectorAll("[data-gallery-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stepGalleryImage(images, variety.name, Number(button.dataset.galleryStep));
    });
  });
  els.galleryDialog.onkeydown = (event) => handleGalleryKeys(event, images, variety.name);
  hydrateLocalPhotoImages(els.galleryContent);
  showDialog(els.galleryDialog);
}

function selectGalleryImage(images, varietyName, index) {
  const image = images[index];
  const section = els.galleryContent.querySelector("[data-gallery-section]");
  const main = els.galleryContent.querySelector("[data-gallery-main]");
  if (!image || !section || !main) return;

  section.dataset.currentPhotoIndex = String(index);
  main.innerHTML = galleryMainContent(images, varietyName, index);
  els.galleryContent.querySelectorAll("[data-gallery-select]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.gallerySelect) === index);
  });
  main.querySelectorAll("[data-gallery-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      stepGalleryImage(images, varietyName, Number(button.dataset.galleryStep));
    });
  });
  hydrateLocalPhotoImages(main);
}

function galleryMainContent(images, varietyName, index) {
  const arrows = images.length > 1;
  return `
    ${arrows ? '<button class="gallery-arrow gallery-arrow-prev" type="button" data-gallery-step="-1" aria-label="Předchozí fotka">‹</button>' : ""}
    ${photoImageMarkup(images[index], varietyName, "", 'loading="eager"')}
    ${arrows ? '<button class="gallery-arrow gallery-arrow-next" type="button" data-gallery-step="1" aria-label="Další fotka">›</button>' : ""}
  `;
}

function stepGalleryImage(images, varietyName, delta) {
  if (!images.length) return;
  const section = els.galleryContent.querySelector("[data-gallery-section]");
  const current = Number(section?.dataset.currentPhotoIndex || 0);
  const next = (current + delta + images.length) % images.length;
  selectGalleryImage(images, varietyName, next);
}

function openGalleryFullscreen() {
  const target = els.galleryContent.querySelector("[data-gallery-main]");
  if (target && typeof target.requestFullscreen === "function") {
    target.requestFullscreen();
    target.focus();
  }
}

function handleGalleryKeys(event, images, varietyName) {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepGalleryImage(images, varietyName, -1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    stepGalleryImage(images, varietyName, 1);
  }
}

async function downloadPhoto(image, varietyName, index = 0) {
  if (!image) return;
  try {
    let href = image;
    let file = null;
    if (isLocalPhotoRef(image)) {
      file = await resolveLocalPhotoFile(image, true);
      if (file) href = URL.createObjectURL(file);
    } else if (isIndexedPhotoRef(image)) {
      file = await resolveIndexedPhotoFile(image);
      if (file) href = URL.createObjectURL(file);
    } else if (isSupabasePhotoRef(image)) {
      file = await resolveSupabasePhotoFile(image);
      if (file) href = URL.createObjectURL(file);
    }
    triggerDownload(href, photoDownloadName(varietyName, image, index, file));
    if (file) window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  } catch {
    toast("Fotku se nepodařilo stáhnout.");
  }
}

function focusOrdersForVariety(name) {
  state.selectedOrderIds.clear();
  state.orderQuickFilter = "";
  state.orderSearch = clean(name);
  state.orderVarietyFilter = clean(name);
  state.seasonFilter = "";
  els.orderSearch.value = state.orderSearch;
  els.orderVarietyFilter.value = state.orderVarietyFilter;
  els.seasonFilter.value = "";
  renderOrders();
  setView("orders");
}

function focusCustomer(id) {
  state.selectedCustomerId = id;
  state.customerQuickFilter = "";
  state.customerSearch = "";
  els.customerSearch.value = "";
  renderCustomers();
  setView("customers");
}

function openVarietyDetailByName(name) {
  const variety = findVarietyByName(name);
  if (variety) {
    openVarietyDetailDialog(variety.id);
    return;
  }
  upsertVarietiesFromText(name);
  saveData();
  renderAll();
  const created = findVarietyByName(name);
  if (created) openVarietyDetailDialog(created.id);
  else toast("Odrůda zatím není v seznamu.");
}

function customerAlerts(customer, orders) {
  const alerts = [];
  const unpaid = orders.filter((order) => order.paymentStatus === "čeká" || order.paymentStatus === "nezaplaceno").length;
  const ready = orders.filter((order) => order.shippingStatus === "připraveno").length;

  if (!customer.phone && !customer.email) alerts.push({ label: "Chybí kontakt", type: "danger" });
  if (!customerHasAddress(customer)) alerts.push({ label: "Chybí adresa", type: "warning" });
  if (hasWarningTag(customer)) alerts.push({ label: "Pozor zákazník", type: "danger" });
  if (customer.customerRating) alerts.push({ label: customerRatingLabel(customer), type: customer.customerRating.includes("neposílat") ? "danger" : "warning" });
  if (unpaid) alerts.push({ label: `${unpaid} čeká na platbu`, type: "warning" });
  if (ready) alerts.push({ label: `${ready} připraveno`, type: "info" });
  return alerts;
}

function renderAlert(alert) {
  return `<span class="alert-chip ${alert.type || ""}">${escapeHtml(alert.label)}</span>`;
}

function renderTags(tags) {
  return `<span class="pills">${normalizeTags(tags)
    .map((tag) => `<span class="pill ${tagClass(tag)}">${escapeHtml(tag)}</span>`)
    .join("")}</span>`;
}

function statusPill(value, label) {
  const classes = {
    zaplaceno: "paid",
    čeká: "pending",
    nezaplaceno: "overdue",
  };
  return `<span class="pill ${classes[value] || ""}">${escapeHtml(label || value || "—")}</span>`;
}

function shippingPill(value, label) {
  const classes = {
    nová: "",
    připraveno: "ready",
    odesláno: "sent",
    zaplaceno: "paid",
  };
  return `<span class="pill ${classes[value] || ""}">${escapeHtml(label || value || "—")}</span>`;
}

function orderPaymentTextPill(order = {}) {
  return clean(order.paymentTextSentAt) ? `<span class="pill sent">Text odeslán</span>` : "";
}

function orderAlternateReservationsPill(order = {}) {
  return orderOfferAlternateEntries(order).length ? `<span class="pill warning">Má náhradníky</span>` : "";
}

function tagClass(tag) {
  const lower = normalize(tag);
  if (lower.includes("pozor")) return "warning";
  if (lower.includes("vip")) return "vip";
  return "";
}

function normalizeTags(tags) {
  return unique(
    (Array.isArray(tags) ? tags : clean(tags).split(/[,;\n]+/))
      .map((tag) => {
        const value = clean(tag);
        const normalized = normalize(value);
        if (!value || normalized === "facebook") return "";
        if (normalized.includes("neplatic") || normalized.includes("neplati") || normalized.includes("pozor")) return "pozor";
        if (normalized === "vip") return "VIP";
        return value;
      })
      .filter(Boolean),
  );
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function findCustomer(id) {
  return customersById().get(id);
}

function findOrder(id) {
  return ordersById().get(id);
}

function findVariety(id) {
  return varietiesById().get(id);
}

function findOffer(id) {
  return offersById().get(id);
}

function findCross(id) {
  return crossesById().get(id);
}

function varietyNameLooseKey(name) {
  return normalize(cleanVarietyNameFromOrderLine(name)).replace(/\s+/g, " ").trim();
}

function varietyNameMatchKey(name) {
  return varietyNameLooseKey(name).replace(/[^a-z0-9]+/g, "");
}

function findExactVarietyByName(name) {
  const key = varietyNameMatchKey(name);
  return key ? state.data.varieties.find((variety) => varietyNameMatchKey(variety.name) === key) || null : null;
}

function findVarietyByName(name) {
  const key = varietyNameMatchKey(name);
  const looseKey = varietyNameLooseKey(name);
  if (!key && !looseKey) return null;
  const varieties = [...state.data.varieties].sort((a, b) => b.name.length - a.name.length);
  const canFuzzyMatch = key.length >= 4 && !/\d/.test(key);
  return (
    varieties.find((variety) => varietyNameMatchKey(variety.name) === key) ||
    varieties.find((variety) => varietyNameLooseKey(variety.name) === looseKey) ||
    varieties.find((variety) => {
      const varietyKey = varietyNameMatchKey(variety.name);
      return canFuzzyMatch && varietyKey.length >= 4 && !/\d/.test(varietyKey) && (key.includes(varietyKey) || varietyKey.includes(key));
    }) ||
    varieties.find((variety) => {
      const varietyLooseKey = varietyNameLooseKey(variety.name);
      return canFuzzyMatch && varietyLooseKey.length >= 4 && !/\d/.test(varietyLooseKey) && looseKey && (looseKey.includes(varietyLooseKey) || varietyLooseKey.includes(looseKey));
    }) ||
    null
  );
}

function latestOrderForCustomer(customerId) {
  return latestOrderByCustomerId().get(customerId);
}

function varietyUsageCount(name) {
  return varietyUsageByName().get(varietyNameMatchKey(name)) || 0;
}

function ordersForVariety(name) {
  return state.data.orders
    .filter((order) => orderMatchesVariety(order, name))
    .sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1));
}

function orderMatchesVariety(order, name) {
  const needle = varietyNameMatchKey(name);
  const looseNeedle = varietyNameLooseKey(name);
  if (!needle) return false;
  const names = orderVarietyNames(order).map(varietyNameMatchKey);
  const textNeedle = normalize(clean(order.varietiesText)).replace(/[^a-z0-9]+/g, "");
  const canFuzzyMatch = needle.length >= 4 && !/\d/.test(needle);
  return (
    names.some((item) => item === needle || (canFuzzyMatch && item.length >= 4 && !/\d/.test(item) && (item.includes(needle) || needle.includes(item)))) ||
    (canFuzzyMatch && looseNeedle && normalize(cleanVarietyNameFromOrderLine(order.varietiesText)).includes(looseNeedle)) ||
    (canFuzzyMatch && textNeedle.includes(needle))
  );
}

function orderVarietyNames(order) {
  return varietyNamesFromText(order?.varietiesText).map((name) => findVarietyByName(name)?.name || name);
}

function orderVarietyPreviewItems(order = {}) {
  const grouped = new Map();
  parseVarietyOrderLines(order?.varietiesText || "").forEach((line) => {
    const name = findVarietyByName(line.name)?.name || line.name;
    const key = varietyNameMatchKey(name) || name;
    if (!key) return;
    const existing = grouped.get(key) || { name, quantity: 0 };
    existing.quantity += Math.max(line.quantity || 1, 1);
    grouped.set(key, existing);
  });
  return [...grouped.values()];
}

function customerName(customer) {
  if (!customer) return "Neznámý zákazník";
  return collapseRepeatedName([customer.firstName, customer.lastName].filter(Boolean).join(" ")) || "Bez jména";
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

function hasWarningTag(customer) {
  return normalizeTags(customer.tags).includes("pozor");
}

function isAttentionCustomer(customer) {
  if (hasWarningTag(customer)) return true;
  return state.data.orders.some((order) => order.customerId === customer.id && (order.paymentStatus === "nezaplaceno" || orderHasStorno(order)));
}

function parsePaymentStatus(text) {
  const value = normalize(text);
  if (value.includes("nezap") || value.includes("neplat") || value.includes("pozor")) return "nezaplaceno";
  if (value.includes("zapl")) return "zaplaceno";
  return "čeká";
}

function normalizeOrderPaymentFormValue(text) {
  return parsePaymentStatus(text);
}

function parseShippingStatus(text) {
  const value = normalize(text);
  if (value.includes("vyriz") || value.includes("vyres") || value.includes("zapl")) return "zaplaceno";
  if (value.includes("odesl") || value.includes("poslan")) return "odesláno";
  if (value.includes("priprav")) return "připraveno";
  return "nová";
}

function normalizeShippingStatus(value) {
  const normalized = clean(value);
  if (normalized === "vyřízeno") return "zaplaceno";
  return shippingLabels[normalized] ? normalized : "nová";
}

function parseTags(text) {
  return normalizeTags(
    clean(text)
      .split(/[,;\n]+/)
      .map((item) => clean(item)),
  );
}

function tagsFromRecord(record) {
  const text = normalize([record.paymentStatus, record.orderNote, record.customerNote].filter(Boolean).join(" "));
  const tags = [];
  if (text.includes("pozor")) tags.push("pozor");
  if (text.includes("neplatic") || text.includes("neplati")) tags.push("pozor");
  return tags;
}

function guessCountry(text) {
  const value = normalize(text);
  const phone = digits(text);
  const email = extractEmailFromText(text).toLowerCase();

  if (value.match(/\b(sk|sr)\b/) || value.includes("slovensko") || value.includes("slovakia") || email.endsWith(".sk")) return "Slovensko";
  if (value.match(/\b(pl)\b/) || value.includes("polsko") || value.includes("poland") || value.includes("zielona gora") || email.endsWith(".pl")) return "Polsko";
  if (value.match(/\b(ro)\b/) || value.includes("rumunsko") || value.includes("romania") || value.includes("constanta") || email.endsWith(".ro")) return "Rumunsko";
  if (value.match(/\b(cz|cr|csr)\b/) || value.includes("cesko") || value.includes("czech") || value.includes("ceska republika") || email.endsWith(".cz")) return "Česko";
  if (value.match(/\b(bratislava|kosice|trencin|nitra|presov|zilina|poprad|zvolen|martin|skalica|stupava|drietoma|kalonda|tisovec|trebisov|nitrianske|lucenec|hlohovec|dunajska|banska)\b/)) return "Slovensko";
  if (value.match(/\b(praha|brno|ostrava|plzen|olomouc|liberec|pardubice|hradec|zlin|jihlava|karvina|holysov|tabor|ceske|ceska)\b/)) return "Česko";
  if (phone.startsWith("421") || (phone.length === 10 && phone.startsWith("09"))) return "Slovensko";
  if (phone.startsWith("420") || (phone.length === 9 && phone.match(/^[67]/))) return "Česko";
  if (phone.startsWith("48")) return "Polsko";
  if (phone.startsWith("40")) return "Rumunsko";
  return "";
}

function sanitizeCustomer(customer) {
  const combined = [
    customer.firstName,
    customer.lastName,
    customer.fbName,
    customer.phone,
    customer.email,
    customer.street,
    customer.postalCode,
    customer.city,
    customer.address,
    customer.note,
  ].map((value) => clean(value)).join("\n");
  const email = extractEmailFromText(customer.email) || extractEmailFromText(combined) || clean(customer.email);
  const phone = extractPhoneFromText(customer.phone) || clean(customer.phone) || extractPhoneFromText(combined);
  const parsedAddress = parseAddressParts(customer.address);
  const normalizedCustomer = {
    ...customer,
    street: clean(customer.street) || parsedAddress.street,
    postalCode: normalizePostalCode(customer.postalCode || parsedAddress.postalCode),
    city: clean(customer.city) || parsedAddress.city,
  };
  const firstName = cleanCustomerName(customer.firstName) || "Bez jména";
  const lastName = cleanCustomerName(customer.lastName);
  const lastNameAlreadyInFirstName = lastName && normalize(firstName).includes(normalize(lastName));

  return {
    ...normalizedCustomer,
    firstName,
    lastName: lastNameAlreadyInFirstName ? "" : lastName,
    fbName: clean(customer.fbName),
    phone,
    email,
    address: customerAddress(normalizedCustomer) || removeContactParts(customer.address),
    country: normalizeCountry(customer.country, combined),
    customerRating: clean(customer.customerRating),
    tags: normalizeTags(customer.tags || []),
    note: cleanBusinessNote(customer.note),
  };
}

function normalizeCountry(country, context = "") {
  const text = clean(country);
  if (!text || normalize(text) === "object object") return guessCountry(context) || "";
  const guessed = guessCountry(text);
  if (guessed) return guessed;
  if (text) return text;
  const guessedFromContext = guessCountry(context);
  if (guessedFromContext) return guessedFromContext;
  return text;
}

function mergeDuplicateCustomers(customers, orders) {
  const keyMap = new Map();
  const idMap = new Map();
  const merged = [];

  customers.forEach((customer) => {
    const keys = customerMergeKeys(customer);
    const existing = keys.map((key) => keyMap.get(key)).find(Boolean);
    if (!existing) {
      merged.push(customer);
      keys.forEach((key) => keyMap.set(key, customer));
      return;
    }

    idMap.set(customer.id, existing.id);
    mergeCustomerInto(existing, customer);
    customerMergeKeys(existing).forEach((key) => keyMap.set(key, existing));
  });

  orders.forEach((order) => {
    if (idMap.has(order.customerId)) order.customerId = idMap.get(order.customerId);
  });

  return merged.sort((a, b) => customerName(a).localeCompare(customerName(b), "cs"));
}

function customerMergeKeys(customer) {
  const keys = [];
  const email = normalize(extractEmailFromText(customer.email) || customer.email);
  const phone = digits(extractPhoneFromText(customer.phone) || customer.phone);
  const name = nameKey(customerName(customer));
  const address = normalize([customer.street, customer.postalCode, customer.city, customer.country].filter(Boolean).join(" "));

  if (email) keys.push(`email:${email}`);
  if (phone && phone.length >= 7) keys.push(`phone:${phone}`);
  if (name && name.split(" ").length > 1 && address) keys.push(`name-address:${name}|${address}`);
  return keys;
}

function mergeCustomerInto(target, source) {
  ["firstName", "lastName", "fbName", "phone", "email", "street", "postalCode", "city", "address", "country", "customerRating"].forEach((field) => {
    if (!clean(target[field]) && clean(source[field])) target[field] = source[field];
  });
  target.tags = normalizeTags([...(target.tags || []), ...(source.tags || [])]);
  target.note = unique([...clean(target.note).split(/\n+/), ...clean(source.note).split(/\n+/)].map(clean).filter(Boolean)).join("\n");
  target.createdAt = [target.createdAt, source.createdAt].filter(Boolean).sort()[0] || target.createdAt || source.createdAt;
  target.updatedAt = [target.updatedAt, source.updatedAt].filter(Boolean).sort().slice(-1)[0] || target.updatedAt || source.updatedAt;
}

function normalizeCrossLineageComparable(text = "") {
  return normalize(clean(text))
    .replace(/\s*[×x]\s*/g, " x ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCrossLineageNoteLine(line = "") {
  const text = clean(line);
  if (!text) return null;
  const seedlingPrefix = "Semenáč z křížení ";
  const lineagePrefix = "Kříženec: ";
  if (text.startsWith(seedlingPrefix)) {
    return { kind: "seedling", body: normalizeCrossLineageComparable(text.slice(seedlingPrefix.length)) };
  }
  if (text.startsWith(lineagePrefix)) {
    return { kind: "lineage", body: normalizeCrossLineageComparable(text.slice(lineagePrefix.length)) };
  }
  return null;
}

function dedupeGeneratedCrossLineageNote(note = "") {
  const lines = clean(note).split(/\n+/).map((line) => clean(line)).filter(Boolean);
  if (!lines.length) return "";
  const genericBodies = new Set([
    normalizeCrossLineageComparable("matka x pyl"),
    normalizeCrossLineageComparable("bez matky x bez pylu"),
  ]);
  const hasSeedlingLine = lines.some((line) => parseCrossLineageNoteLine(line)?.kind === "seedling");
  const filtered = [];
  lines.forEach((line) => {
    const parsed = parseCrossLineageNoteLine(line);
    if (parsed?.kind === "seedling") {
      filtered.push(line);
      return;
    }
    if (parsed?.kind === "lineage") {
      if (genericBodies.has(parsed.body)) return;
      if (hasSeedlingLine) return;
    }
    filtered.push(line);
  });
  return unique(filtered).join("\n");
}

function noteAlreadyContainsCrossLineage(note = "", motherName = "", pollenName = "") {
  const expectedBody = normalizeCrossLineageComparable(`${motherName || "matka"} x ${pollenName || "pyl"}`);
  if (!expectedBody) return false;
  return clean(note)
    .split(/\n+/)
    .map((line) => parseCrossLineageNoteLine(line))
    .filter(Boolean)
    .some((line) => line.body === expectedBody);
}

function cleanBusinessNote(note) {
  return dedupeGeneratedCrossLineageNote(clean(note)
    .split(/\n+/)
    .map((line) => clean(line))
    .filter(Boolean)
    .filter((line) => !normalize(line).match(/^(import z excelu|puvodni bunky|slouceno z|datum objednavky v excelu|importovane z objednavek)/))
    .join("\n"));
}

function extractEmailFromText(text) {
  const prepared = clean(text)
    .replace(/\s*@\s*/g, "@")
    .replace(/\s*\.\s*([a-z]{2,6})(\b|\s|,|;)/gi, ".$1 ");
  const matches = prepared.match(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi) || [];
  for (const match of matches) {
    const email = stripEmailLocalPrefix(match);
    if (/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i.test(email)) return email.toLowerCase();
  }
  return "";
}

function stripEmailLocalPrefix(email) {
  const [rawLocal, domain] = clean(email).toLowerCase().split("@");
  if (!rawLocal || !domain) return "";
  const local = rawLocal
    .replace(/^[+\d]{9,15}/, "")
    .replace(/^(e-?mail|mail|telefon|tel)/, "")
    .replace(/^[._\-\s]+|[._\-\s]+$/g, "");
  return `${local || rawLocal}@${domain}`;
}

function extractPhoneFromText(text) {
  const matches = clean(text).match(/(?<!\d)\+?\d(?:[\s.\-]?\d){8,}(?!\d)/g) || [];
  for (const match of matches) {
    const digitsOnly = match.replace(/\D/g, "");
    if (digitsOnly.length >= 9 && digitsOnly.length <= 13) {
      return match.trim().startsWith("+") ? `+${digitsOnly}` : digitsOnly;
    }
  }
  return "";
}

function removeContactParts(text) {
  return clean(text)
    .replace(/\s*@\s*/g, "@")
    .replace(/\s*\.\s*([a-z]{2,6})(\b|\s|,|;)/gi, ".$1 ")
    .replace(/[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/gi, "")
    .replace(/(?<!\d)\+?\d(?:[\s.\-]?\d){8,}(?!\d)/g, "")
    .replace(/\b(mail|e-mail|email|telefon|tel\.?|mobil|tf\.?)\b[:.]?/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^"+|"+$/g, "")
    .trim();
}

function parseAddressParts(address) {
  const text = removeContactParts(address)
    .replace(/\b(česko|cesko|čr|cr|slovensko|sr|sk)\b/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, ", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,+/g, ",")
    .trim();
  if (!text) return { street: "", postalCode: "", city: "" };

  const postalMatch = text.match(/(^|[^\d])(\d{3}\s?\d{2})(?!\d)/);
  const postalCode = normalizePostalCode(postalMatch?.[2] || "");
  if (!postalMatch) {
    const parts = text.split(",").map(clean).filter(Boolean);
    if (parts.length === 1 && !parts[0].match(/\d/)) return { street: "", postalCode: "", city: parts[0] };
    return { street: parts[0] || text, postalCode: "", city: parts[1] || "" };
  }

  const before = text.slice(0, postalMatch.index + postalMatch[1].length).replace(/[,\s]+$/g, "").trim();
  const after = text.slice(postalMatch.index + postalMatch[0].length).replace(/^[,\s.]+/g, "").trim();
  const afterCity = after
    .split(",")
    .map(clean)
    .find((part) => part && !normalize(part).match(/z-box|zbox|box|coop|jednota|alza|packeta|zasilkovna/));
  const beforeParts = before.split(",").map(clean).filter(Boolean);
  const street = beforeParts[beforeParts.length - 1] || "";
  const cityFromStreet = street.match(/^(.+?)\s+\d+[a-zA-Z/]*/)?.[1] || "";
  const city = afterCity || cityFromStreet || beforeParts[beforeParts.length - 2] || "";

  return {
    street,
    postalCode,
    city,
  };
}

function normalizePostalCode(value) {
  const numbers = digits(value);
  if (numbers.length === 5) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
  return clean(value);
}

function cleanCustomerName(name) {
  return collapseRepeatedName(clean(name)
    .replace(/\s*\/\s*(cukroví|cukrovi|fcb|fb).*$/i, "")
    .replace(/\s+(ok|platba ok)$/i, "")
    .replace(/\s+(informace|připočíst|pripocist|poslat foto|poslat unor|je to zahradnice).*$/i, "")
    .replace(/\s*\/\s*\d+.*$/, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s/\-]+|[\s/\-]+$/g, ""));
}

function nameKey(name) {
  return normalize(name)
    .replace(/\b(ok|poslat|foto|informace|cena|celkem|pripocist|postovne|fcb|fc|fb)\b.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOrder(order = {}) {
  return {
    deliveryMethod: "ship",
    packetaPointId: "",
    codAmount: "",
    shippingFee: "",
    shippingFeeLabel: "",
    packingFee: "",
    codFee: "",
    extraFees: [],
    trackingNumber: "",
    packetaPacketId: "",
    currency: "CZK",
    exchangeRate: "",
    priceManualOverride: false,
    feesIncludedInTotal: false,
    stornoLines: [],
    cancelledAt: "",
    cancelledNote: "",
    season: defaultSeason(),
    ...order,
    id: clean(order.id) || uid(),
    offerId: clean(order.offerId),
    customerId: clean(order.customerId),
    orderDate: clean(order.orderDate) || toDateInput(new Date()),
    season: clean(order.season) || seasonFromDate(order.orderDate),
    varietiesText: clean(order.varietiesText),
    price: clean(order.price),
    paymentStatus: paymentLabels[clean(order.paymentStatus)] ? clean(order.paymentStatus) : parsePaymentStatus(order.paymentStatus),
    currency: normalizeCurrency(order.currency || detectCurrency(order.price)),
    exchangeRate: clean(order.exchangeRate),
    priceManualOverride: Boolean(order.priceManualOverride),
    feesIncludedInTotal: Boolean(order.feesIncludedInTotal),
    paymentTextSentAt: clean(order.paymentTextSentAt),
    shippingStatus: normalizeShippingStatus(order.shippingStatus),
    paymentReminderDate: "",
    shippingReminderDate: "",
    deliveryMethod: normalizeDeliveryMethod(order.deliveryMethod, order.note),
    packetaPointId: "",
    codAmount: "",
    shippingFee: normalizeAmount(order.shippingFee),
    shippingFeeLabel: clean(order.shippingFeeLabel || order.shippingLabel),
    packingFee: normalizeAmount(order.packingFee),
    codFee: normalizeAmount(order.codFee),
    extraFees: configuredExtraFees(order.extraFees),
    stornoLines: normalizeOrderStornoLines(order.stornoLines),
    cancelledAt: clean(order.cancelledAt),
    cancelledNote: clean(order.cancelledNote),
    trackingNumber: "",
    packetaPacketId: "",
    note: cleanBusinessNote(order.note),
  };
}

function normalizeOrderStornoEntry(entry = {}) {
  const quantity = Number.parseInt(clean(entry.quantity), 10);
  return {
    id: clean(entry.id) || uid(),
    name: clean(entry.name),
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unitPrice: normalizeAmount(entry.unitPrice || entry.explicitPrice),
    currency: normalizeCurrency(entry.currency || detectCurrency(entry.unitPrice || entry.explicitPrice)),
    note: clean(entry.note),
    createdAt: clean(entry.createdAt) || new Date().toISOString(),
  };
}

function normalizeOrderStornoLines(lines = []) {
  const source = Array.isArray(lines) ? lines : parseOrderStornoLinesValue(lines);
  return source
    .map((entry) => normalizeOrderStornoEntry(entry))
    .filter((entry) => clean(entry.name));
}

function parseOrderStornoLinesValue(value = "") {
  if (Array.isArray(value)) return value;
  const text = clean(value);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function orderStornoLines(order = {}) {
  return normalizeOrderStornoLines(order?.stornoLines);
}

function orderHasStorno(order = {}) {
  return Boolean(orderStornoLines(order).length || clean(order?.cancelledAt));
}

function customerStornoOrders(customerId = "") {
  return (state.data.orders || []).filter((order) => clean(order.customerId) === clean(customerId) && orderHasStorno(order));
}

function customerStornoMeta(customerId = "") {
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

function normalizeCross(cross = {}) {
  const now = new Date().toISOString();
  return {
    id: clean(cross.id) || uid(),
    motherVarietyId: clean(cross.motherVarietyId),
    pollenVarietyId: clean(cross.pollenVarietyId),
    pollinatedAt: clean(cross.pollinatedAt || cross.date) || toDateInput(new Date()),
    stage: normalizeCrossStage(cross.stage),
    seedlingName: clean(cross.seedlingName || cross.name),
    seedlingPhotoUrl: clean(cross.seedlingPhotoUrl || cross.photoUrl),
    seedlingGallery: unique(normalizeGallery(cross.seedlingGallery || cross.gallery).filter(Boolean)),
    resultRating: normalizeCrossResult(cross.resultRating || cross.rating),
    linkedVarietyId: clean(cross.linkedVarietyId || cross.varietyId),
    note: cleanBusinessNote(cross.note),
    createdAt: cross.createdAt || now,
    updatedAt: cross.updatedAt || now,
  };
}

function normalizeOffer(offer = {}) {
  const now = new Date().toISOString();
  return {
    id: clean(offer.id) || uid(),
    title: clean(offer.title) || `Nabídka ${formatDate(offer.date || toDateInput(new Date()))}`,
    date: clean(offer.date) || toDateInput(new Date()),
    facebookPublishDate: clean(offer.facebookPublishDate || offer.date) || toDateInput(new Date()),
    facebookPublishTime: clean(offer.facebookPublishTime) || "20:00",
    type: normalizeOfferType(offer.type),
    status: ["připravená", "zveřejněná", "uzavřená"].includes(clean(offer.status)) ? clean(offer.status) : "připravená",
    note: clean(offer.note),
    items: Array.isArray(offer.items) ? offer.items.map(normalizeOfferItem) : [],
    createdAt: offer.createdAt || now,
    updatedAt: offer.updatedAt || now,
  };
}

function normalizeOfferItem(item = {}) {
  return {
    id: clean(item.id) || uid(),
    varietyId: clean(item.varietyId),
    varietyName: clean(item.varietyName || item.name),
    quantity: normalizeWholeNumber(item.quantity) || "1",
    price: normalizeAmount(item.price),
    currency: normalizeCurrency(item.currency),
    photoUrl: clean(item.photoUrl),
    note: clean(item.note),
    reservations: Array.isArray(item.reservations) ? item.reservations.map(normalizeReservation) : [],
  };
}

function offerItemImage(item = {}) {
  const variety = findVariety(clean(item.varietyId)) || findVarietyByName(item.varietyName);
  return clean(item.photoUrl) || varietyImages(variety)[0] || "";
}

function normalizeReservation(reservation = {}) {
  return {
    id: clean(reservation.id) || uid(),
    customerId: clean(reservation.customerId),
    quantity: normalizeWholeNumber(reservation.quantity) || "1",
    status: reservationStatusValue(reservation.status),
    note: clean(reservation.note),
    orderId: clean(reservation.orderId),
    orderCreatedAt: clean(reservation.orderCreatedAt),
  };
}

function normalizeExchangeRate(rate = {}) {
  const date = clean(rate.date || rate.validFor);
  const rateCzkPerEur = parseDecimal(rate.rateCzkPerEur || rate.rate || rate.value);
  if (!date || !Number.isFinite(rateCzkPerEur) || rateCzkPerEur <= 0) return null;
  return {
    date,
    pair: "CZK_EUR",
    rateCzkPerEur,
    source: clean(rate.source) || "ručně",
    updatedAt: rate.updatedAt || new Date().toISOString(),
  };
}

function mergeExchangeRates(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    const rate = normalizeExchangeRate(item);
    if (!rate) return;
    map.set(rate.date, rate);
  });
  return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function upsertExchangeRate(input) {
  const rate = normalizeExchangeRate({ ...input, updatedAt: new Date().toISOString() });
  if (!rate) return;
  const index = state.data.exchangeRates.findIndex((item) => item.date === rate.date);
  if (index >= 0) state.data.exchangeRates[index] = rate;
  else state.data.exchangeRates.push(rate);
  state.data.exchangeRates = mergeExchangeRates(state.data.exchangeRates);
}

function ensureRateForDate(date) {
  const target = clean(date);
  if (!target || exactExchangeRateForDate(target)) return;
  getOrFetchExchangeRateForDate(target)
    .then(() => {
      renderDashboard();
      renderCustomers();
      renderOrders();
    })
    .catch(() => {});
}

async function prefetchMissingExchangeRates() {
  if (state.rateLoading) return;
  const dates = missingExchangeRateDates();
  if (!dates.length) return;

  state.rateLoading = true;
  setRateButtonLoading(true);
  let loaded = 0;

  for (const date of dates) {
    try {
      await getOrFetchExchangeRateForDate(date);
      loaded += 1;
    } catch {
      // Kurzy zůstávají záložně dohledatelné při ručním přepnutí měny.
    }
  }

  state.rateLoading = false;
  setRateButtonLoading(false);
  if (loaded) {
    renderDashboard();
    renderCustomers();
    renderOrders();
  }
}

function missingExchangeRateDates() {
  const dates = new Set([toDateInput(new Date())]);
  state.data.orders.forEach((order) => {
    const date = clean(order.orderDate);
    if (date && clean(order.price)) dates.add(date);
  });
  return [...dates]
    .filter((date) => !exactExchangeRateForDate(date))
    .sort();
}

async function getOrFetchExchangeRateForDate(date) {
  const target = clean(date) || toDateInput(new Date());
  const stored = exactExchangeRateForDate(target);
  if (stored) {
    return { rate: stored.rateCzkPerEur, source: stored.source, date: stored.date };
  }

  try {
    const rate = await fetchEurCzkRate(target);
    upsertExchangeRate({
      date: rate.date || target,
      rateCzkPerEur: rate.rate,
      source: rate.source,
    });
    saveData();
    return rate;
  } catch (error) {
    const fallback = exchangeRateForDate(target);
    if (fallback) return { rate: fallback.rateCzkPerEur, source: `${fallback.source}, záložní`, date: fallback.date };
    throw error;
  }
}

async function fetchEurCzkRate(date) {
  const target = clean(date) || toDateInput(new Date());
  const providers = [
    () => fetchCnbEurRate(target).then((rate) => ({ rate, source: "ČNB", date: target })),
    () => fetchFrankfurterEurCzkRate(target),
    () => fetchEcbDailyEurCzkRate(),
  ];
  let lastError = null;

  for (const provider of providers) {
    try {
      const result = await provider();
      if (Number.isFinite(result?.rate) && result.rate > 0) return result;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Kurz se nepodařilo načíst.");
}

async function fetchCnbEurRate(date) {
  const endpoints = [
    `https://api.cnb.cz/cnbapi/exrates/daily?date=${encodeURIComponent(date)}&lang=CZ`,
    `https://api.cnb.cz/cnbapi/exrates/daily?date=${encodeURIComponent(date)}&lang=CS`,
    `https://api.cnb.cz/cnbapi/exrates/daily?date=${encodeURIComponent(formatCnbDate(date))}&lang=CZ`,
    `https://api.cnb.cz/cnbapi/exrates/daily?date=${encodeURIComponent(formatCnbDate(date))}&lang=CS`,
    `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date=${encodeURIComponent(formatCnbDate(date))}`,
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: "application/json,text/plain,*/*" } });
      if (!response.ok) throw new Error(`ČNB odpověděla ${response.status}`);
      const type = response.headers.get("content-type") || "";
      if (type.includes("json")) {
        const data = await response.json();
        return parseCnbJsonRate(data);
      }
      return parseCnbTextRate(await response.text());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Kurz se nepodařilo načíst.");
}

async function fetchFrankfurterEurCzkRate(date) {
  const target = clean(date) || toDateInput(new Date());
  const endpoints = [
    `https://api.frankfurter.dev/v1/${encodeURIComponent(target)}?base=EUR&symbols=CZK`,
    `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=CZK`,
    `https://api.frankfurter.app/${encodeURIComponent(target)}?from=EUR&to=CZK`,
    `https://api.frankfurter.app/latest?from=EUR&to=CZK`,
  ];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { headers: { Accept: "application/json,*/*" }, cache: "no-store" });
      if (!response.ok) throw new Error(`Frankfurter odpověděl ${response.status}`);
      const data = await response.json();
      const rate = parseDecimal(data?.rates?.CZK || data?.rate);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error("Kurz CZK ve Frankfurter odpovědi chybí.");
      return {
        rate,
        source: "ECB/Frankfurter",
        date: clean(data?.date) || target,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Frankfurter kurz se nepodařilo načíst.");
}

async function fetchEcbDailyEurCzkRate() {
  const response = await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", {
    headers: { Accept: "application/xml,text/xml,text/plain,*/*" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`ECB odpověděla ${response.status}`);
  const text = await response.text();
  const date = clean(text.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1]) || toDateInput(new Date());
  const rate = parseDecimal(text.match(/currency=['"]CZK['"][^>]*rate=['"]([^'"]+)['"]/)?.[1]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Kurz CZK v ECB XML chybí.");
  return { rate, source: "ECB", date };
}

function parseCnbJsonRate(data) {
  const rows = Array.isArray(data.rates)
    ? data.rates
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.exchangeRates)
        ? data.exchangeRates
        : Array.isArray(data)
          ? data
          : [];
  const eur = rows.find((row) => clean(row.currencyCode || row.code || row.currency_code).toUpperCase() === "EUR");
  const rate = parseDecimal(eur?.rate || eur?.exchangeRate || eur?.value);
  const amount = parseDecimal(eur?.amount || eur?.quantity || 1) || 1;
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Kurz EUR v odpovědi ČNB chybí.");
  return rate / amount;
}

function parseCnbTextRate(text) {
  const row = String(text || "")
    .split(/\r?\n/)
    .find((line) => line.includes("|EUR|"));
  const parts = row ? row.split("|") : [];
  const amount = parseDecimal(parts[2]) || 1;
  const rate = parseDecimal(parts[4]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Kurz EUR v textu ČNB chybí.");
  return rate / amount;
}

function exchangeRateForOrder(order) {
  const override = parseDecimal(order.exchangeRate);
  if (Number.isFinite(override) && override > 0) {
    return { rate: override, source: "objednávka" };
  }
  const stored = exchangeRateForDate(order.orderDate);
  return stored ? { rate: stored.rateCzkPerEur, source: stored.source, date: stored.date } : null;
}

function exchangeRateForDate(date) {
  const target = clean(date) || toDateInput(new Date());
  const rates = [...state.data.exchangeRates].sort((a, b) => (a.date < b.date ? 1 : -1));
  return rates.find((rate) => rate.date <= target) || null;
}

function exactExchangeRateForDate(date) {
  const target = clean(date) || toDateInput(new Date());
  return state.data.exchangeRates.find((rate) => rate.date === target) || null;
}

function storedExchangeRateForDate(date) {
  const exact = exactExchangeRateForDate(date);
  if (exact) return { rate: exact.rateCzkPerEur, source: exact.source, date: exact.date };
  const fallback = exchangeRateForDate(date);
  if (!fallback) return null;
  const target = clean(date) || toDateInput(new Date());
  const source = fallback.date && fallback.date !== target ? `${fallback.source}, záložní` : fallback.source;
  return { rate: fallback.rateCzkPerEur, source, date: fallback.date };
}

async function resolveOrderExchangeRate(date) {
  const stored = storedExchangeRateForDate(date);
  if (stored?.rate) return stored;
  return getOrFetchExchangeRateForDate(date);
}

function orderPriceEur(order) {
  const amount = orderResolvedTotal(order);
  if (!Number.isFinite(amount)) return "";
  if (normalizeCurrency(order.currency) === "EUR") return amount;
  const rate = exchangeRateForOrder(order);
  return rate?.rate ? amount / rate.rate : "";
}

function orderConversionText(order) {
  const amount = orderResolvedTotal(order);
  const rate = exchangeRateForOrder(order);
  if (!Number.isFinite(amount) || !rate?.rate) return "";
  const currency = normalizeCurrency(order.currency);
  if (currency === "EUR") return `≈ ${formatMoney(amount * rate.rate, "CZK")}`;
  return `≈ ${formatMoney(amount / rate.rate, "EUR")}`;
}

function orderResolvedTotal(order = {}) {
  const stored = parseDecimal(order?.price);
  const derived = orderTotalFromText(order?.varietiesText || "") + orderFeeTotal(order);
  if (Number.isFinite(derived) && derived > 0) {
    if (!Number.isFinite(stored)) return derived;
    if (orderHasStorno(order) && Math.abs(stored - derived) > 0.0001) return derived;
  }
  if (Number.isFinite(stored)) return stored;
  return Number.isFinite(derived) ? derived : Number.NaN;
}

function convertAmount(amount, fromCurrency, toCurrency, rate) {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === "CZK" && toCurrency === "EUR") return amount / rate;
  return amount * rate;
}

function formatEditableAmount(value, currency = "CZK") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  const decimals = normalizeCurrency(currency) === "EUR" || Math.abs(amount % 1) > 0 ? 2 : 0;
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  }).format(amount);
}

function rateHintText(rate) {
  if (!rate?.rate) return "Kurz zatím není načtený.";
  const date = rate.date ? ` k ${formatDate(rate.date)}` : "";
  const source = rate.source ? ` (${rate.source})` : "";
  return `Kurz${date}: 1 EUR = ${formatRate(rate.rate)} Kč${source}`;
}

function formatOrderPrice(order) {
  const total = orderResolvedTotal(order);
  return formatMoney(Number.isFinite(total) ? total : 0, normalizeCurrency(order.currency));
}

function orderFeesText(order) {
  return orderFeeSummaryItemsForOrder(order).join(" · ");
}

function orderFeeSummaryItemsForOrder(order) {
  const currency = normalizeCurrency(order.currency);
  const shippingFee = parseDecimal(order.shippingFee);
  const packingFee = parseDecimal(order.packingFee);
  const codFee = parseDecimal(order.codFee);
  const parts = [];
  if (Number.isFinite(shippingFee) && shippingFee > 0) {
    parts.push(`${shippingLabelForOrder(order) || "Doprava"} ${formatMoney(shippingFee, currency)}`);
  }
  if (Number.isFinite(packingFee) && packingFee > 0) parts.push(`Balné ${formatMoney(packingFee, currency)}`);
  if (Number.isFinite(codFee) && codFee > 0) parts.push(`Dobírka ${formatMoney(codFee, currency)}`);
  normalizeNamedFees(order.extraFees).forEach((fee) => {
    const amount = parseDecimal(fee.amount);
    if (clean(fee.name) && Number.isFinite(amount) && amount > 0) parts.push(`${fee.name} ${formatMoney(amount, currency)}`);
  });
  return parts;
}

function reservationStatusValue(value) {
  return clean(value) === "alternate" ? "alternate" : "confirmed";
}

function offerItemReservationQuantityByStatus(item, status, excludeReservationId = "") {
  return (item.reservations || []).reduce((sum, reservation) => {
    if (excludeReservationId && reservation.id === excludeReservationId) return sum;
    if (reservationStatusValue(reservation.status) !== status) return sum;
    return sum + (Number(normalizeWholeNumber(reservation.quantity)) || 0);
  }, 0);
}

function offerItemConfirmedCount(item, excludeReservationId = "") {
  return offerItemReservationQuantityByStatus(item, "confirmed", excludeReservationId);
}

function offerItemAlternateCount(item, excludeReservationId = "") {
  return offerItemReservationQuantityByStatus(item, "alternate", excludeReservationId);
}

function reservationAvailableQuantity(item, excludeReservationId = "") {
  return Math.max(0, (Number(item.quantity || 0) || 0) - offerItemConfirmedCount(item, excludeReservationId));
}

function offerItemOrderKeys(item = {}) {
  const variety = findVariety(clean(item.varietyId)) || findVarietyByName(item.varietyName);
  return unique([offerItemNameSafe(item), item.varietyName, item.name, variety?.name].map(varietyNameMatchKey).filter(Boolean));
}

function orderContainsOfferItem(order = {}, item = {}) {
  const keys = offerItemOrderKeys(item);
  if (!keys.length) return false;
  const orderKeys = orderVarietyNames(order).map(varietyNameMatchKey).filter(Boolean);
  return keys.some((key) => orderKeys.includes(key));
}

function orderQuantityForOfferItem(order = {}, item = {}) {
  const keys = offerItemOrderKeys(item);
  if (!keys.length) return 0;
  return parseVarietyOrderLines(order?.varietiesText || "").reduce((sum, line) => {
    const key = varietyNameMatchKey(line.name);
    return sum + (keys.includes(key) ? Math.max(line.quantity || 1, 1) : 0);
  }, 0);
}

function reservationQuantityForCustomer(item = {}, customerId = "", status = "") {
  return (item.reservations || []).reduce((sum, reservation) => {
    if (clean(reservation.customerId) !== customerId) return sum;
    if (status && reservationStatusValue(reservation.status) !== status) return sum;
    return sum + (Number(normalizeWholeNumber(reservation.quantity)) || 0);
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

function orderOfferAlternateEntries(order = {}) {
  const offerId = clean(order.offerId);
  const customerId = clean(order.customerId);
  if (!offerId || !customerId) return [];
  const offer = findOffer(offerId);
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
        name: offerItemNameSafe(item),
        quantity: pendingQuantity,
      });
    }
    return entries;
  }, []);
}

function syncOrderAlternateBlock() {
  const block = els.orderAlternateBlock;
  const form = els.orderForm;
  if (!block || !form) return;
  const entries = orderOfferAlternateEntries({
    offerId: clean(form.elements.offerId?.value),
    customerId: clean(form.elements.customerId?.value),
    varietiesText: clean(form.elements.varietiesText?.value),
  });
  if (!entries.length) {
    block.hidden = true;
    block.innerHTML = "";
    return;
  }
  block.hidden = false;
  block.innerHTML = `
    <div class="order-alternate-heading">
      <strong>Náhradníci z nabídky</strong>
      <small>Toto se nepočítá do ceny.</small>
    </div>
    <div class="order-alternate-list">
      ${entries.map((entry) => `<div class="order-alternate-item"><span>⚠ Náhradník: ${escapeHtml(entry.name)} · ${escapeHtml(quantityText(entry.quantity))} ks</span><button class="mini-button order-alternate-add-button" type="button" data-add-order-alternate="${escapeHtml(entry.itemId)}">+</button></div>`).join("")}
    </div>
  `;
  block.querySelectorAll("[data-add-order-alternate]").forEach((button) => {
    button.addEventListener("click", () => addAlternateReservationToOrder(button.dataset.addOrderAlternate));
  });
}

function addAlternateReservationToOrder(itemId) {
  const form = els.orderForm;
  const offer = findOffer(clean(form?.elements?.offerId?.value));
  const item = (offer?.items || []).find((entry) => clean(entry.id) === clean(itemId));
  if (!form || !offer || !item) return;
  const orderState = {
    offerId: clean(form.elements.offerId?.value),
    customerId: clean(form.elements.customerId?.value),
    varietiesText: clean(form.elements.varietiesText?.value),
  };
  const entry = orderOfferAlternateEntries(orderState).find((current) => clean(current.itemId) === clean(itemId));
  if (!entry?.quantity) return;

  const lines = parseVarietyOrderLines(orderState.varietiesText);
  const keys = offerItemOrderKeys(item);
  const index = lines.findIndex((line) => keys.includes(varietyNameMatchKey(line.name)));
  const itemCurrency = normalizeCurrency(item.currency || currentOrderCurrency());

  if (index >= 0) {
    const target = lines[index];
    const explicitPrice = parseDecimal(target.explicitPrice);
    lines[index] = {
      ...target,
      quantity: Math.max(target.quantity || 1, 1) + entry.quantity,
      explicitPrice: Number.isFinite(explicitPrice) ? target.explicitPrice : item.price,
      explicitCurrency: target.explicitCurrency || itemCurrency,
    };
  } else {
    lines.push({
      raw: "",
      name: offerItemNameSafe(item),
      quantity: entry.quantity,
      explicitPrice: item.price,
      explicitCurrency: itemCurrency,
    });
  }

  form.elements.varietiesText.value = lines
    .map((line) => {
      const price = parseDecimal(line.explicitPrice);
      return Number.isFinite(price)
        ? buildOrderLineText(line.name, line.quantity, line.explicitPrice, normalizeCurrency(line.explicitCurrency || itemCurrency))
        : `${line.name} ${line.quantity}x`;
    })
    .join("\n");
  form.dataset.feesBasePrice = "";
  syncOrderAlternateBlock();
  refreshOrderPricingPreview();
  syncOrderDialogState();
  toast("Náhradník přidán do objednávky.");
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
      const reservationQuantity = Number(normalizeWholeNumber(entry.quantity)) || 0;
      return orderedQuantity >= quantityBefore + reservationQuantity;
    }
    quantityBefore += Number(normalizeWholeNumber(entry.quantity)) || 0;
  }
  return false;
}

function offerItemOrderProgress(offer = {}, item = {}) {
  const confirmed = (item.reservations || []).filter((reservation) => reservationStatusValue(reservation.status) === "confirmed");
  const confirmedQuantity = confirmed.reduce((sum, reservation) => sum + (Number(normalizeWholeNumber(reservation.quantity)) || 0), 0);
  const orderedQuantity = offerItemOrderedQuantity(offer, item);
  if (!confirmedQuantity || !orderedQuantity) return { state: "", label: "" };
  if (orderedQuantity >= confirmedQuantity) return { state: "done", label: "V objednávce" };
  return { state: "partial", label: "Částečně v objednávce" };
}

function sortedReservationsForItem(item) {
  return [...(item.reservations || [])].sort((a, b) => {
    const statusDelta = Number(reservationStatusValue(a.status) === "alternate") - Number(reservationStatusValue(b.status) === "alternate");
    if (statusDelta) return statusDelta;
    return 0;
  });
}

function offerConfirmedCount(offer) {
  return (offer.items || []).reduce((sum, item) => sum + offerItemConfirmedCount(item), 0);
}

function offerAlternateCount(offer) {
  return (offer.items || []).reduce((sum, item) => sum + offerItemAlternateCount(item), 0);
}

function offerAvailableCount(offer) {
  return (offer.items || []).reduce((sum, item) => sum + reservationAvailableQuantity(item), 0);
}

function offerTotalText(offer) {
  const totals = new Map();
  (offer.items || []).forEach((item) => {
    const amount = parseDecimal(item.price);
    const quantity = Number(normalizeWholeNumber(item.quantity)) || 0;
    if (!Number.isFinite(amount) || quantity <= 0) return;
    const currency = normalizeCurrency(item.currency);
    totals.set(currency, (totals.get(currency) || 0) + amount * quantity);
  });
  return [...totals.entries()].map(([currency, amount]) => formatMoney(amount, currency)).join(" · ") || "0 Kč";
}

function offerStatusClass(status) {
  if (status === "uzavřená") return "done";
  if (status === "zveřejněná") return "ready";
  return "";
}

function normalizeOfferType(value) {
  return clean(value) === "rests" ? "rests" : "offer";
}

function adjustedOfferTitleForType(title, currentType, nextType, date = toDateInput(new Date())) {
  const normalizedCurrentType = normalizeOfferType(currentType);
  const normalizedNextType = normalizeOfferType(nextType);
  const cleanTitle = clean(title);
  if (!cleanTitle) return defaultOfferTitle(normalizedNextType, date);
  return cleanTitle === defaultOfferTitle(normalizedCurrentType, date)
    ? defaultOfferTitle(normalizedNextType, date)
    : cleanTitle;
}

function isRestOffer(offer) {
  return normalizeOfferType(offer?.type) === "rests";
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty/poznámky"
    : "Nabídka";
}

function splitOffersByType(offers = []) {
  return offers.reduce((groups, offer) => {
    if (isRestOffer(offer)) groups.rests.push(offer);
    else groups.offers.push(offer);
    return groups;
  }, { offers: [], rests: [] });
}

function defaultOfferTitle(type = "offer", date = toDateInput(new Date())) {
  return normalizeOfferType(type) === "rests"
    ? `Resty/poznámky ${formatDate(date)}`
    : `Nabídka ${formatDate(date)}`;
}

function openOfferDialog(id = null, defaults = {}) {
  const offer = id ? findOffer(id) : null;
  const initialType = offer ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer?.date || clean(defaults.date) || toDateInput(new Date());
  els.offerDialogTitle.textContent = offer
    ? (initialType === "rests" ? "Upravit resty/poznámky" : "Upravit nabĂ­dku")
    : (initialType === "rests" ? "NovĂ© resty/poznámky" : "NovĂˇ nabĂ­dka");
  els.offerForm.reset();
  els.offerForm.elements.id.value = offer?.id || "";
  els.offerForm.elements.title.value = offer?.title || defaultOfferTitle(initialType, initialDate);
  els.offerForm.elements.date.value = initialDate;
  els.offerForm.elements.facebookPublishDate.value = offer?.facebookPublishDate || initialDate;
  els.offerForm.elements.facebookPublishTime.value = offer?.facebookPublishTime || "20:00";
  els.offerForm.elements.type.value = initialType;
  els.offerForm.elements.status.value = offer?.status || "pĹ™ipravenĂˇ";
  els.offerForm.elements.note.value = offer?.note || "";
  syncOfferStatusToggle();
  showDialog(els.offerDialog);
}

function setOfferType(id, nextType, options = {}) {
  const offer = findOffer(id);
  if (!offer) return;
  const normalizedCurrentType = normalizeOfferType(offer.type);
  const normalizedNextType = normalizeOfferType(nextType);
  if (normalizedCurrentType === normalizedNextType) return;
  const offerDate = clean(offer.date) || toDateInput(new Date());
  offer.title = adjustedOfferTitleForType(offer.title, normalizedCurrentType, normalizedNextType, offerDate);
  offer.type = normalizedNextType;
  offer.updatedAt = new Date().toISOString();
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  if (!options.quiet) {
    toast(normalizedNextType === "rests" ? "Nabídka přesunuta do restů/poznámek." : "Resty/poznámky přesunuty do nabídek.");
  }
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty/pozn\u00e1mky"
    : "Nab\u00eddka";
}

function defaultOfferTitle(type = "offer", date = toDateInput(new Date())) {
  return normalizeOfferType(type) === "rests"
    ? `Resty/pozn\u00e1mky ${formatDate(date)}`
    : `Nab\u00eddka ${formatDate(date)}`;
}

function openOfferDialog(id = null, defaults = {}) {
  const offer = id ? findOffer(id) : null;
  const initialType = offer ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer?.date || clean(defaults.date) || toDateInput(new Date());
  els.offerDialogTitle.textContent = offer
    ? (initialType === "rests" ? "Upravit resty/pozn\u00e1mky" : "Upravit nab\u00eddku")
    : (initialType === "rests" ? "Nov\u00e9 resty/pozn\u00e1mky" : "Nov\u00e1 nab\u00eddka");
  els.offerForm.reset();
  els.offerForm.elements.id.value = offer?.id || "";
  els.offerForm.elements.title.value = offer?.title || defaultOfferTitle(initialType, initialDate);
  els.offerForm.elements.date.value = initialDate;
  els.offerForm.elements.facebookPublishDate.value = offer?.facebookPublishDate || initialDate;
  els.offerForm.elements.facebookPublishTime.value = offer?.facebookPublishTime || "20:00";
  els.offerForm.elements.type.value = initialType;
  els.offerForm.elements.status.value = offer?.status || "p\u0159ipraven\u00e1";
  els.offerForm.elements.note.value = offer?.note || "";
  syncOfferStatusToggle();
  showDialog(els.offerDialog);
}

function setOfferType(id, nextType, options = {}) {
  const offer = findOffer(id);
  if (!offer) return;
  const normalizedCurrentType = normalizeOfferType(offer.type);
  const normalizedNextType = normalizeOfferType(nextType);
  if (normalizedCurrentType === normalizedNextType) return;
  const offerDate = clean(offer.date) || toDateInput(new Date());
  offer.title = adjustedOfferTitleForType(offer.title, normalizedCurrentType, normalizedNextType, offerDate);
  offer.type = normalizedNextType;
  offer.updatedAt = new Date().toISOString();
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  if (!options.quiet) {
    toast(normalizedNextType === "rests" ? "Nab\u00eddka p\u0159esunuta do rest\u016f/pozn\u00e1mek." : "Resty/pozn\u00e1mky p\u0159esunuty do nab\u00eddek.");
  }
}

function uniqueOfferTitle(baseTitle, excludeId = "") {
  const originalTitle = clean(baseTitle) || defaultOfferTitle("offer", toDateInput(new Date()));
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
    const totalQuantity = Number(normalizeWholeNumber(item.quantity)) || 0;
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
  const offer = findOffer(id);
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
  const nextDate = clean(options.date) || toDateInput(new Date());
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
    if ((Number(normalizeWholeNumber(item.quantity)) || 0) > 0 || (item.reservations || []).length) {
      items.push(item);
    }
    return items;
  }, []);
  offer.updatedAt = now;
  sortOfferItemsInPlace(offer);

  state.data.offers.push(nextOffer);
  state.selectedOfferId = nextOffer.id;
  saveData();
  renderAll();
  if (!options.quiet) toast("Vytvo\u0159ena nov\u00e1 nab\u00eddka z neprodan\u00fdch zbytk\u016f.");
  return nextOffer;
}

function renderOfferDetail() {
  const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
  if (!offer) {
    els.offerDetail.innerHTML = emptyState("Vyber nab\u00eddku nebo zalo\u017e novou.");
    return;
  }
  state.selectedOfferId = offer.id;
  const items = sortedOfferItems(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty/pozn\u00e1mky" : "Upravit nab\u00eddku";
  const toggleTypeLabel = isRestOffer(offer) ? "P\u0159esunout do nab\u00eddek" : "P\u0159esunout do rest\u016f/pozn\u00e1mek";
  const moveLeftoversButton = !isRestOffer(offer)
    ? `<button class="button ghost" type="button" data-move-offer-leftovers="${offer.id}">P\u0159esunout neprodan\u00e9 do nov\u00e9 nab\u00eddky</button>`
    : "";

  els.offerDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${escapeHtml(offer.title)}</h2>
        <div class="pills">
          <span class="pill">${escapeHtml(offerTypeLabel(offer))}</span>
          <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
        </div>
        <p class="fb-name">${formatDate(offer.date)}</p>
        ${offer.note ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : ""}
      </div>
      <div class="detail-actions">
        <button class="button ghost" type="button" data-edit-offer="${offer.id}">${editLabel}</button>
        <button class="button ghost" type="button" data-toggle-offer-type="${offer.id}">${toggleTypeLabel}</button>
        ${moveLeftoversButton}
        <button class="button primary" type="button" data-add-offer-item="${offer.id}">P\u0159idat od\u0159ezek</button>
        <button class="button ghost" type="button" data-facebook-offer="${offer.id}">Facebook</button>
        <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvo\u0159it objedn\u00e1vky</button>
      </div>
    </div>
    <section class="detail-section">
      <div class="history-summary">
        <article><span>Polo\u017eky</span><strong>${items.length}</strong></article>
        <article><span>Potvrzeno</span><strong>${offerConfirmedCount(offer)}</strong></article>
        <article><span>N\u00e1hradn\u00edci</span><strong>${offerAlternateCount(offer)}</strong></article>
        <article><span>Hodnota</span><strong>${escapeHtml(offerTotalText(offer))}</strong></article>
      </div>
    </section>
    <section class="detail-section">
      <div class="stack-list">
        ${items.length ? items.map((item) => renderOfferItem(offer, item)).join("") : emptyState("Zat\u00edm bez od\u0159ezk\u016f.")}
      </div>
    </section>
  `;

  els.offerDetail.querySelector("[data-edit-offer]")?.addEventListener("click", () => openOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-toggle-offer-type]")?.addEventListener("click", () => {
    setOfferType(offer.id, isRestOffer(offer) ? "offer" : "rests");
  });
  els.offerDetail.querySelector("[data-move-offer-leftovers]")?.addEventListener("click", () => {
    moveOfferLeftoversToNewOffer(offer.id);
  });
  els.offerDetail.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemDialog(offer.id));
  els.offerDetail.querySelector("[data-facebook-offer]")?.addEventListener("click", () => openFacebookOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(offer.id));
  els.offerDetail.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemDialog(offer.id, button.dataset.editOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(offer.id, button.dataset.deleteOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-add-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationDialog(offer.id, button.dataset.addReservation, null, {
      status: button.dataset.addReservationStatus || "",
    }));
  });
  els.offerDetail.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationDialog(offer.id, button.dataset.itemId, button.dataset.editReservation));
  });
  els.offerDetail.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(offer.id, button.dataset.itemId, button.dataset.deleteReservation));
  });
  hydrateLocalPhotoImages(els.offerDetail);
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

async function createOrdersFromOffer(id) {
  const offer = findOffer(id);
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
    toast("Nabídka nemá žádné potvrzené rezervace.");
    return;
  }
  if (state.data.orders.some((order) => order.offerId === offer.id) && !confirm("Z této nabídky už nějaké objednávky vznikly. Vytvořit další?")) {
    return;
  }
  if (!confirm(`Vytvořit objednávky z rezervací v nabídce ${offer.title}?`)) return;

  const grouped = new Map();
  reservations.forEach(({ item, reservation }) => {
    const currency = normalizeCurrency(item.currency);
    const key = `${reservation.customerId}::${currency}`;
    if (!grouped.has(key)) grouped.set(key, { customerId: reservation.customerId, currency, lineItems: new Map(), total: 0, entries: [] });
    const group = grouped.get(key);
    const quantity = Number(normalizeWholeNumber(reservation.quantity)) || 1;
    const price = parseDecimal(item.price);
    const lineKey = clean(item.id) || offerItemNameSafe(item);
    const lineItem = group.lineItems.get(lineKey) || {
      name: offerItemNameSafe(item),
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
    const defaults = defaultOrderFees(group.currency, group.customerId);
    const shippingFee = parseDecimal(defaults.shippingFee);
    const packingFee = parseDecimal(defaults.packingFee);
    const feeTotal = (Number.isFinite(shippingFee) ? shippingFee : 0) + (Number.isFinite(packingFee) ? packingFee : 0);
    const orderId = uid();
    const lines = [...group.lineItems.values()].map((line) => {
      const unitPrice = parseDecimal(line.unitPrice);
      return Number.isFinite(unitPrice)
        ? buildOrderLineText(line.name, line.quantity, line.unitPrice, group.currency)
        : `${line.name} ${line.quantity}x`;
    });
    state.data.orders.push(normalizeOrder({
      id: orderId,
      offerId: offer.id,
      customerId: group.customerId,
      orderDate: offer.date || toDateInput(new Date()),
      season: seasonFromDate(offer.date),
      varietiesText: lines.join("\n"),
      price: formatEditableAmount(group.total + feeTotal, group.currency),
      currency: group.currency,
      paymentStatus: "čeká",
      shippingStatus: "nová",
      deliveryMethod: "ship",
      shippingFee: Number.isFinite(shippingFee) ? defaults.shippingFee : "",
      shippingFeeLabel: Number.isFinite(shippingFee) ? shippingLabelForCustomer(findCustomer(group.customerId)) : "",
      packingFee: Number.isFinite(packingFee) ? defaults.packingFee : "",
      codFee: "",
      extraFees: [],
      codAmount: "",
      feesIncludedInTotal: feeTotal > 0,
      note: `Z nabídky: ${offer.title}`,
      createdAt: now,
      updatedAt: now,
    }));
    group.entries.forEach(({ reservation }) => {
      reservation.orderId = orderId;
      reservation.orderCreatedAt = now;
    });
    count += 1;
  });

  offer.status = "uzavřená";
  offer.updatedAt = now;
  saveData();
  renderAll();
  toast(`Vytvořeno ${count} objednávek.`);
}

function formatMoney(value, currency = "CZK") {
  const amount = parseDecimal(value);
  const normalizedCurrency = normalizeCurrency(currency);
  const label = currencyLabels[normalizedCurrency] || normalizedCurrency;
  if (!Number.isFinite(amount)) return `0 ${label}`;
  const fractionDigits = normalizedCurrency === "EUR" || Math.abs(amount % 1) > 0 ? 2 : 0;
  return `${new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)} ${label}`;
}

function formatCsvNumber(value) {
  const amount = parseDecimal(value);
  if (!Number.isFinite(amount)) return "";
  return String(Math.round(amount * 100) / 100).replace(".", ",");
}

function formatRate(value) {
  const rate = parseDecimal(value);
  if (!Number.isFinite(rate)) return "";
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  }).format(rate);
}

function normalizeCurrency(value) {
  const currency = clean(value).toUpperCase();
  if (currency === "EUR" || currency.includes("€")) return "EUR";
  return "CZK";
}

function detectCurrency(value) {
  const text = clean(value).toLowerCase();
  if (text.includes("eur") || text.includes("€")) return "EUR";
  return "CZK";
}

function parseDecimal(value) {
  if (typeof value === "number") return value;
  const text = clean(value)
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");
  if (!text) return Number.NaN;
  return Number(text);
}

function formatCnbDate(date) {
  const [year, month, day] = clean(date).split("-");
  return year && month && day ? `${day}.${month}.${year}` : clean(date);
}

function guessDeliveryMethod(text) {
  const value = normalize(text);
  if (value.match(/osobni odber|osobny odber|osobne|vyzved|vyzdvih|predani|predanie|osobak/)) return "personal_pickup";
  if (value.match(/zasilkovna|z-box|zbox|packeta|vydejni misto|dorucovaci misto|na adresu|adresa slovensko|home delivery|kuryr|poslat|odeslat/)) return "ship";
  return "";
}

function normalizeDeliveryMethod(value, context = "") {
  const raw = clean(value);
  if (deliveryLabels[raw]) return raw;
  if (["packeta_pickup", "packeta_home", "other"].includes(raw)) return "ship";
  const guessed = guessDeliveryMethod([raw, context].join(" "));
  if (guessed) return guessed;
  if (normalize(raw).match(/jina doprava|other/)) return "ship";
  return raw || "ship";
}

function deliverySummary(order) {
  const method = normalizeDeliveryMethod(order.deliveryMethod);
  return method === "personal_pickup" ? deliveryLabels.personal_pickup : "";
}

function orderNumber(order) {
  return `AK-${String(state.data.orders.indexOf(order) + 1).padStart(5, "0")}`;
}

async function copyCustomerMessage(customerId, type) {
  const customer = findCustomer(customerId);
  if (!customer) return;
  const orders = state.data.orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1));
  const paymentOrder = orders.find((item) => item.paymentStatus === "čeká" || item.paymentStatus === "nezaplaceno") || orders[0];
  const shippingOrder = orders.find((item) => item.shippingStatus === "připraveno") || orders[0];
  const pickupOrder = orders.find((item) => item.deliveryMethod === "personal_pickup") || shippingOrder;
  const messages = {
    confirmation: confirmationMessage(customer, orders[0]),
    payment: await paymentMessage(customer, paymentOrder),
    overdue: overdueMessage(customer, paymentOrder),
    shipping: shippingMessage(customer, shippingOrder),
    pickup: pickupMessage(customer, pickupOrder),
  };
  if (type === "payment" && !paymentDetailsLines().length) {
    toast("V Nastavení chybí platební údaje.");
    return;
  }
  const text = messages[type] || messages.confirmation;
  copyText(text, "Text zkopírován.");
}

function confirmationMessage(customer, order) {
  const varieties = order?.varietiesText ? ` Odrůdy: ${order.varietiesText}.` : "";
  const amount = order ? ` Částka: ${formatOrderPrice(order)}.` : "";
  return `Dobrý den, potvrzuji objednávku afrických kopřiv.${varieties}${amount} Děkuji.`;
}

async function paymentMessage(customer, order) {
  if (!order) return "Dobrý den, posílám přehled objednávky afrických kopřiv. Děkuji.";
  const lines = clean(order.varietiesText).split(/\n+/).map(clean).filter(Boolean);
  const feeLines = orderFeeSummaryItemsForOrder(order);
  if (feeLines.length) lines.push(...feeLines);

  const payment = await buildOrderPaymentDescriptor({ order, customer, promptIfMissingCountry: false });
  const context = {
    lines,
    total: orderResolvedTotal(order),
    order,
    paymentStatus: parsePaymentStatus(order.paymentStatus),
    payment,
    paymentDetails: paymentDetailsLines(),
  };
  return buildCustomerPaymentTextFromContext(context);
}

function overdueMessage(customer, order) {
  const amount = order ? ` Částka k úhradě je ${formatOrderPrice(order)}.` : "";
  return `Dobrý den, eviduji u objednávky afrických kopřiv neuhrazenou platbu.${amount} Prosím o informaci, jestli objednávka stále platí. Děkuji.`;
}

function shippingMessage(customer, order) {
  return "Dobrý den, objednávka afrických kopřiv je připravena k odeslání. Děkuji.";
}

function pickupMessage(customer, order) {
  return "Dobrý den, objednávka afrických kopřiv je připravena k osobnímu odběru. Děkuji.";
}

async function calculateOrderPriceFromVarieties() {
  await autoCalculateOrderPrice({ force: true, silent: false });
}

async function autoCalculateOrderPrice(options = {}) {
  const form = els.orderForm;
  const token = String(Date.now() + Math.random());
  form.dataset.priceCalcToken = token;
  const force = Boolean(options.force);
  const manual = form.dataset.priceManual === "1";
  const feeSummary = getOrderFeeSummary();

  try {
    let estimate = await estimateOrderPriceFromVarieties();
    if (form.dataset.priceCalcToken !== token) return;
    syncOrderTextareaWithEstimate(estimate);
    renderOrderLineSummary(estimate);

    renderOrderPricePreview(estimate, manual && !force);

    if (!estimate.hasLines) {
      if (!options.silent) toast("Nejdřív napiš odrůdy do objednávky.");
      syncOrderDialogState();
      return;
    }
    if (!estimate.priced && !estimate.manualPriced) {
      if (!options.silent) toast("U těchto odrůd zatím není nastavená cena.");
      syncOrderDialogState();
      return;
    }
    if (manual && !force) {
      syncOrderDialogState();
      return;
    }

    setOrderFormPrice(estimate.total + feeSummary.total, estimate.currency);
    form.dataset.feesBasePrice = feeSummary.total > 0 ? String(estimate.total) : "";
    form.dataset.priceManual = "";
    renderOrderPricePreview(estimate, false);
    syncOrderDialogState();
    if (!options.silent) {
      toast(estimate.missing ? `Cena spočítána z ${estimate.priced} položek, ${estimate.missing} bez ceny.` : `Cena spočítána z ${estimate.priced} položek.`);
    }
  } catch {
    if (form.dataset.priceCalcToken !== token) return;
    renderOrderPricePreview({ error: true });
    syncOrderDialogState();
    if (!options.silent) toast("Kurz se nepodařilo načíst.");
  }
}

async function estimateOrderPriceFromVarieties() {
  const lines = parseVarietyOrderLines(els.orderForm.elements.varietiesText.value);
  const targetCurrency = currentOrderCurrency();
  let total = 0;
  let priced = 0;
  let manualPriced = 0;
  let missing = 0;
  let rate = null;
  const details = [];

  for (const line of lines) {
    const variety = findVarietyForOrderLine(line.name);
    const catalogPrice = parseDecimal(variety?.salePrice);
    const catalogCurrency = normalizeCurrency(variety?.saleCurrency || targetCurrency);
    const manualPrice = parseDecimal(line.explicitPrice);
    const manualCurrency = normalizeCurrency(line.explicitCurrency || targetCurrency);
    const needsRateForCompare =
      variety
      && Number.isFinite(manualPrice)
      && Number.isFinite(catalogPrice)
      && (manualCurrency !== targetCurrency || catalogCurrency !== targetCurrency);
    if (needsRateForCompare) {
      rate = rate || await resolveOrderExchangeRate(els.orderForm.elements.orderDate.value);
    }
    const manualUnitInTarget = priceInCurrency(manualPrice, manualCurrency, targetCurrency, rate?.rate);
    const catalogUnitInTarget = priceInCurrency(catalogPrice, catalogCurrency, targetCurrency, rate?.rate);
    const matchesCatalogPrice = variety
      && Number.isFinite(manualPrice)
      && Number.isFinite(catalogPrice)
      && Number.isFinite(manualUnitInTarget)
      && Number.isFinite(catalogUnitInTarget)
      && amountsMatch(manualUnitInTarget, catalogUnitInTarget);

    if (Number.isFinite(manualPrice) && !matchesCatalogPrice) {
      let lineTotal = manualPrice * line.quantity;
      if (manualCurrency !== targetCurrency) {
        rate = rate || await resolveOrderExchangeRate(els.orderForm.elements.orderDate.value);
        lineTotal = convertAmount(lineTotal, manualCurrency, targetCurrency, rate.rate);
      }
      total += lineTotal;
      manualPriced += 1;
      details.push({
        ...line,
        source: "manual",
        lineTotal,
        currency: targetCurrency,
        variety,
        unitPrice: manualPrice,
        unitCurrency: manualCurrency,
        displayUnitPrice: Number.isFinite(manualUnitInTarget) ? manualUnitInTarget : lineTotal / Math.max(line.quantity, 1),
        displayCurrency: targetCurrency,
        catalogUnitPrice: catalogPrice,
        catalogUnitCurrency: catalogCurrency,
        catalogDisplayUnitPrice: Number.isFinite(catalogUnitInTarget) ? catalogUnitInTarget : catalogPrice,
        catalogDisplayCurrency: Number.isFinite(catalogUnitInTarget) ? targetCurrency : catalogCurrency,
      });
      continue;
    }

    if (!variety || !Number.isFinite(catalogPrice)) {
      missing += 1;
      details.push({
        ...line,
        source: "missing",
        lineTotal: Number.NaN,
        currency: targetCurrency,
        variety,
        catalogUnitPrice: catalogPrice,
        catalogUnitCurrency: catalogCurrency,
        catalogDisplayUnitPrice: Number.isFinite(catalogUnitInTarget) ? catalogUnitInTarget : catalogPrice,
        catalogDisplayCurrency: Number.isFinite(catalogUnitInTarget) ? targetCurrency : catalogCurrency,
      });
      continue;
    }

    let lineTotal = catalogPrice * line.quantity;
    if (catalogCurrency !== targetCurrency) {
      rate = rate || await resolveOrderExchangeRate(els.orderForm.elements.orderDate.value);
      lineTotal = convertAmount(lineTotal, catalogCurrency, targetCurrency, rate.rate);
    }
    total += lineTotal;
    priced += 1;
    details.push({
      ...line,
      source: "catalog",
      lineTotal,
      currency: targetCurrency,
      variety,
      unitPrice: catalogPrice,
      unitCurrency: catalogCurrency,
      displayUnitPrice: Number.isFinite(catalogUnitInTarget) ? catalogUnitInTarget : lineTotal / Math.max(line.quantity, 1),
      displayCurrency: targetCurrency,
      catalogUnitPrice: catalogPrice,
      catalogUnitCurrency: catalogCurrency,
      catalogDisplayUnitPrice: Number.isFinite(catalogUnitInTarget) ? catalogUnitInTarget : catalogPrice,
      catalogDisplayCurrency: Number.isFinite(catalogUnitInTarget) ? targetCurrency : catalogCurrency,
    });
  }

  return {
    hasLines: Boolean(lines.length),
    lineCount: lines.length,
    total,
    currency: targetCurrency,
    priced,
    manualPriced,
    missing,
    lines: details,
  };
}

function setOrderFormPrice(amount, currency) {
  els.orderForm.dataset.programmaticPrice = "1";
  els.orderForm.elements.price.value = formatEditableAmount(amount, currency);
  els.orderForm.dataset.programmaticPrice = "";
}

function renderOrderPricePreview(estimate = {}, isManual = false) {
  if (!els.orderPricePreview) return;
  if (estimate.error) {
    els.orderPricePreview.textContent = "Kurz se nepodařilo načíst, automatická cena je pozastavená.";
    renderOrderFeeInlinePreview();
    return;
  }
  if (!estimate.hasLines) {
    els.orderPricePreview.textContent = "";
    renderOrderFeeInlinePreview(estimate, isManual);
    return;
  }
  if (!estimate.priced && !estimate.manualPriced) {
    els.orderPricePreview.textContent = "Ceník zatím nenašel cenu pro zadané odrůdy.";
    renderOrderFeeInlinePreview(estimate, isManual);
    return;
  }
  const parts = [];
  if (estimate.missing) parts.push(`${estimate.missing} položek je zatím bez ceny.`);
  els.orderPricePreview.textContent = parts.join(" · ");
  renderOrderFeeInlinePreview(estimate, isManual);
}

function syncOrderTextareaWithEstimate(estimate = {}) {
  if (!estimate?.hasLines || !estimate.lines?.length || !els.orderForm?.elements?.varietiesText) return;
  const nextText = estimate.lines
    .map((line) => {
      const storedAmount = Number.isFinite(line.unitPrice) ? line.unitPrice : line.displayUnitPrice;
      const storedCurrency = normalizeCurrency(line.unitCurrency || line.displayCurrency || estimate.currency);
      if ((line.source === "catalog" || line.source === "manual") && Number.isFinite(storedAmount)) {
        return buildOrderLineText(line.name, line.quantity, storedAmount, storedCurrency);
      }
      return line.raw;
    })
    .filter(Boolean)
    .join("\n");

  if (clean(els.orderForm.elements.varietiesText.value) !== clean(nextText)) {
    els.orderForm.elements.varietiesText.value = nextText;
  }
}

function parseVarietyOrderLines(text) {
  return clean(text)
    .split(/[,;\n]+/)
    .map((raw) => {
      const line = clean(raw);
      const variety = findVarietyForOrderLineText(line);
      const name = variety?.name || cleanVarietyNameFromOrderLine(line);
      const explicit = explicitPriceFromOrderLine(line, variety?.name || "");
      return {
        raw: line,
        name,
        quantity: quantityFromVarietyLine(line),
        explicitPrice: explicit.amount,
        explicitCurrency: explicit.currency,
      };
    })
    .filter((line) => line.name);
}

function orderTotalFromText(text) {
  return parseVarietyOrderLines(text).reduce((sum, line) => {
    const amount = parseDecimal(line.explicitPrice);
    return sum + (Number.isFinite(amount) ? amount * Math.max(line.quantity, 1) : 0);
  }, 0);
}

const ORDER_LINE_CURRENCY_TOKEN = "(?:kč|kÄŤ|kc|czk|eur|€|â‚¬)";
const ORDER_LINE_QUANTITY_TOKEN = "(?:ks|kus|kusy|řízků|Ĺ™Ă­zkĹŻ|rizku|sazenic)";
const ORDER_LINE_FILLER_TOKEN = "(?:celkem|bonus|kusy|sazenice|řízky|Ĺ™Ă­zky|rizky|kč|kÄŤ|kc|eur|euro|kopřivy|kopĹ™ivy|koprivy)";

function rawLineWithoutQuantity(line) {
  return clean(line)
    .replace(/\b\d+\s*x\b/gi, " ")
    .replace(/\bx\s*\d+\b/gi, " ")
    .replace(/\b\d+\s*(ks|kus|kusy|řízků|rizku|sazenic)\b/gi, " ")
    .replace(/\b(ks|kus|kusy|řízků|rizku|sazenic)\s*\d+\b/gi, " ");
}

function quantityFromVarietyLine(line) {
  const value = clean(line);
  const match =
    value.match(/\b(\d+)\s*x\b/i) ||
    value.match(/\bx\s*(\d+)\b/i) ||
    value.match(/\b(\d+)\s*(ks|kus|kusy|řízků|rizku|sazenic)\b/i);
  const quantity = match ? Number(match[1]) : 1;
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function cleanVarietyNameFromOrderLine(line) {
  return rawLineWithoutQuantity(line)
    .replace(/(?:@|=)\s*\d+([,.]\d+)?\s*(kč|kc|czk|eur|€)?/gi, " ")
    .replace(/-\s*\d+([,.]\d+)?\s*(kč|kc|czk|eur|€)?/gi, " ")
    .replace(/\b\d+([,.]\d+)?\s*(kč|kc|czk|eur|€)\b/gi, " ")
    .replace(/[@=]/g, " ")
    .replace(/\b(celkem|bonus|kusy|sazenice|řízky|rizky|kč|kc|eur|euro|kopřivy|koprivy)\b/gi, " ")
    .replace(/^[\s\-/?.,]+|[\s\-/?.,]+$/g, "");
}

function findVarietyForOrderLine(name) {
  return findVarietyByName(name);
}

function findVarietyForOrderLineText(line) {
  const exact = findVarietyForOrderLine(cleanVarietyNameFromOrderLine(line));
  if (exact) return exact;
  const raw = normalize(rawLineWithoutQuantity(line).replace(/[=:@-]/g, " "));
  return [...state.data.varieties]
    .sort((a, b) => b.name.length - a.name.length)
    .find((variety) => {
      const key = normalize(variety.name);
      return raw === key || raw.startsWith(`${key} `);
    }) || null;
}

function explicitPriceFromOrderLine(line, matchedName = "") {
  const text = clean(line);
  const marked = text.match(/(?:@|=)\s*(-?\d+(?:[.,]\d+)?)\s*(kč|kc|czk|eur|€)?/i);
  if (marked) {
    return {
      amount: marked[1],
      currency: detectCurrency(marked[0]),
    };
  }
  const dashed = text.match(/(?:-|–|—)\s*(\d+(?:[.,]\d+)?)\s*(kč|kc|czk|eur|€)?$/i);
  if (dashed) {
    return {
      amount: dashed[1],
      currency: detectCurrency(dashed[0]),
    };
  }

  const withoutName = matchedName ? stripMatchedVarietyName(text, matchedName) : text;
  const remainder = clean(rawLineWithoutQuantity(withoutName))
    .replace(/\b(celkem|bonus|zdarma|navic|navíc|plus|později|pokud|bude)\b/gi, " ")
    .replace(/[=:@]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const plain = remainder.match(/^[-+]?\s*(\d+(?:[.,]\d+)?)(?:\s*(kč|kc|czk|eur|€))?$/i);
  if (plain) {
    return {
      amount: plain[1],
      currency: detectCurrency(plain[0]),
    };
  }

  return { amount: "", currency: detectCurrency(text) };
}

function stripMatchedVarietyName(text, matchedName) {
  const escapedName = escapeRegExp(clean(matchedName)).replace(/\s+/g, "\\s+");
  if (!escapedName) return text;
  return clean(text).replace(new RegExp(escapedName, "i"), " ");
}

var ORDER_LINE_CURRENCY_TOKEN_V2 = "(?:k\\u010d|k\\u00c4\\u0164|kc|czk|eur|\\u20ac|\\u00e2\\u201a\\u00ac)";
var ORDER_LINE_QUANTITY_TOKEN_V2 = "(?:ks|kus|kusy|\\u0159\\u00edzk\\u016f|\\u0139\\u2122\\u0102\\u00adzk\\u0139\\u017b|rizku|sazenic)";
var ORDER_LINE_FILLER_TOKEN_V2 = "(?:celkem|bonus|kusy|sazenice|\\u0159\\u00edzky|\\u0139\\u2122\\u0102\\u00adzky|rizky|k\\u010d|k\\u00c4\\u0164|kc|eur|euro|kop\\u0159ivy|kop\\u0139\\u2122ivy|koprivy)";

function rawLineWithoutQuantity(line) {
  const quantityToken = "(?:ks|kus|kusy|\\u0159\\u00edzk\\u016f|\\u0139\\u2122\\u0102\\u00adzk\\u0139\\u017b|rizku|sazenic)";
  return clean(line)
    .replace(/\b\d+\s*x\b/gi, " ")
    .replace(/\bx\s*\d+\b/gi, " ")
    .replace(new RegExp(`\\b\\d+\\s*${quantityToken}\\b`, "giu"), " ")
    .replace(new RegExp(`\\b${quantityToken}\\s*\\d+\\b`, "giu"), " ");
}

function quantityFromVarietyLine(line) {
  const quantityToken = "(?:ks|kus|kusy|\\u0159\\u00edzk\\u016f|\\u0139\\u2122\\u0102\\u00adzk\\u0139\\u017b|rizku|sazenic)";
  const value = clean(line);
  const match =
    value.match(/\b(\d+)\s*x\b/i) ||
    value.match(/\bx\s*(\d+)\b/i) ||
    value.match(new RegExp(`\\b(\\d+)\\s*${quantityToken}\\b`, "iu"));
  const quantity = match ? Number(match[1]) : 1;
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function cleanVarietyNameFromOrderLine(line) {
  const currencyToken = "(?:k\\u010d|k\\u00c4\\u0164|kc|czk|eur|\\u20ac|\\u00e2\\u201a\\u00ac)";
  const fillerToken = "(?:celkem|bonus|kusy|sazenice|\\u0159\\u00edzky|\\u0139\\u2122\\u0102\\u00adzky|rizky|k\\u010d|k\\u00c4\\u0164|kc|eur|euro|kop\\u0159ivy|kop\\u0139\\u2122ivy|koprivy)";
  return rawLineWithoutQuantity(line)
    .replace(new RegExp(`(?:@|=)\\s*\\d+([,.]\\d+)?\\s*${currencyToken}?`, "giu"), " ")
    .replace(new RegExp(`-\\s*\\d+([,.]\\d+)?\\s*${currencyToken}?`, "giu"), " ")
    .replace(new RegExp(`\\b\\d+([,.]\\d+)?\\s*${currencyToken}\\b`, "giu"), " ")
    .replace(/[@=]/g, " ")
    .replace(new RegExp(`\\b${fillerToken}\\b`, "giu"), " ")
    .replace(/^[\s\-/?.,]+|[\s\-/?.,]+$/g, "");
}

function explicitPriceFromOrderLine(line, matchedName = "") {
  const text = clean(line);
  const marked = text.match(new RegExp(`(?:@|=)\\s*(-?\\d+(?:[.,]\\d+)?)\\s*${ORDER_LINE_CURRENCY_TOKEN_V2}?`, "iu"));
  if (marked) {
    return {
      amount: marked[1],
      currency: detectCurrency(marked[0]),
    };
  }
  const dashed = text.match(new RegExp(`(?:-|â€“|â€”|–|—)\\s*(\\d+(?:[.,]\\d+)?)\\s*${ORDER_LINE_CURRENCY_TOKEN_V2}?$`, "iu"));
  if (dashed) {
    return {
      amount: dashed[1],
      currency: detectCurrency(dashed[0]),
    };
  }

  const withoutName = matchedName ? stripMatchedVarietyName(text, matchedName) : text;
  const remainder = clean(rawLineWithoutQuantity(withoutName))
    .replace(/\b(celkem|bonus|zdarma|navic|navĂ­c|plus|pozdÄ›ji|pokud|bude)\b/gi, " ")
    .replace(/[=:@]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const plain = remainder.match(new RegExp(`^[-+]?\\s*(\\d+(?:[.,]\\d+)?)(?:\\s*${ORDER_LINE_CURRENCY_TOKEN_V2})?$`, "iu"));
  if (plain) {
    return {
      amount: plain[1],
      currency: detectCurrency(plain[0]),
    };
  }

  return { amount: "", currency: detectCurrency(text) };
}

function escapeRegExp(value) {
  return clean(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function copyText(text, successMessage) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => toast(successMessage)).catch(() => fallbackCopyText(text, successMessage));
    return;
  }
  fallbackCopyText(text, successMessage);
}

function fallbackCopyText(text, successMessage) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  toast(successMessage);
}

function normalizeAmount(value) {
  return clean(value).replace(/\s/g, "").replace(",", ".");
}

function countryCode(country) {
  const value = normalize(country);
  if (value.includes("slovensko") || value === "sr") return "SK";
  if (value.includes("rumunsko")) return "RO";
  if (value.includes("cesko") || value === "cr" || value === "cz") return "CZ";
  return value ? value.slice(0, 2).toUpperCase() : "CZ";
}

function upsertVarietiesFromText(text) {
  const names = varietyNamesFromText(text);
  if (!names.length) return;
  state.data.varieties = mergeVarieties([...state.data.varieties, ...names]);
}

function normalizeGallery(value) {
  if (Array.isArray(value)) return unique(value.map(clean).filter(Boolean));
  return unique(
    clean(value)
      .split(/\n+/)
      .map(clean)
      .filter(Boolean),
  );
}

function normalizePriceHistory(value) {
  const items = Array.isArray(value) ? value : [];
  const normalized = items
    .map((item) => ({
      date: clean(item?.date || item?.createdAt || item?.updatedAt).slice(0, 10),
      price: normalizeAmount(item?.price),
      currency: normalizeCurrency(item?.currency),
    }))
    .filter((item) => item.date);
  return normalized.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function updateVarietyPriceHistory(existing, price, currency, now) {
  const date = clean(now).slice(0, 10) || toDateInput(new Date());
  const nextPrice = normalizeAmount(price);
  const nextCurrency = normalizeCurrency(currency);
  const history = normalizePriceHistory(existing?.priceHistory);
  const previousPrice = normalizeAmount(existing?.salePrice);
  const previousCurrency = normalizeCurrency(existing?.saleCurrency);

  if (!existing) {
    return nextPrice ? [{ date, price: nextPrice, currency: nextCurrency }] : [];
  }

  const changed = previousPrice !== nextPrice || previousCurrency !== nextCurrency;
  if (!changed) return history;

  const seededHistory = history.length || !previousPrice
    ? history
    : [...history, { date: clean(existing.updatedAt || existing.createdAt).slice(0, 10) || date, price: previousPrice, currency: previousCurrency }];

  return normalizePriceHistory([...seededHistory, { date, price: nextPrice, currency: nextCurrency }]);
}

function initialPriceHistoryForVariety(variety, now) {
  const history = normalizePriceHistory(variety.priceHistory);
  const price = normalizeAmount(variety.salePrice);
  if (history.length || !price) return history;
  return [
    {
      date: clean(variety.updatedAt || variety.createdAt).slice(0, 10) || clean(now).slice(0, 10) || toDateInput(new Date()),
      price,
      currency: normalizeCurrency(variety.saleCurrency),
    },
  ];
}

function hasPhotoFolderSupport() {
  return typeof window.showDirectoryPicker === "function" && Boolean(window.indexedDB);
}

async function choosePhotoFolder() {
  if (!hasPhotoFolderSupport()) {
    toast("Složku fotek umí vybrat Edge nebo Chrome.");
    updatePhotoFolderStatus();
    return;
  }

  try {
    const handle = await window.showDirectoryPicker({ id: "africke-koprivy-fotky", mode: "readwrite" });
    photoRuntime.rootHandle = handle;
    await savePhotoRootHandle(handle);
    updatePhotoFolderStatus();
    hydrateLocalPhotoImages(document);
    toast("Složka fotek vybrána.");
  } catch (error) {
    if (error?.name !== "AbortError") toast("Složku se nepodařilo vybrat.");
  }
}

async function restorePhotoFolder() {
  updatePhotoFolderStatus();
  if (!hasPhotoFolderSupport()) return;
  const handle = await loadPhotoRootHandle();
  if (!handle) return;
  photoRuntime.rootHandle = handle;
  updatePhotoFolderStatus();
  hydrateLocalPhotoImages(document);
}

function updatePhotoFolderStatus() {
  if (!els.photoFolderStatus) return;
  if (!hasPhotoFolderSupport()) {
    els.photoFolderStatus.textContent = "Vyber složky funguje v Edge nebo Chrome.";
    if (els.choosePhotoFolderBtn) els.choosePhotoFolderBtn.disabled = true;
    return;
  }
  if (els.choosePhotoFolderBtn) els.choosePhotoFolderBtn.disabled = false;
  els.photoFolderStatus.textContent = photoRuntime.rootHandle ? `Vybraná: ${photoRuntime.rootHandle.name}` : "Zatím nevybraná";
}

async function openPhotoDb() {
  if (!window.indexedDB) return null;
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(PHOTO_DB_NAME, PHOTO_DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_DB_STORE)) db.createObjectStore(PHOTO_DB_STORE);
      if (!db.objectStoreNames.contains(PHOTO_BLOB_STORE)) db.createObjectStore(PHOTO_BLOB_STORE);
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function loadPhotoRootHandle() {
  try {
    const db = await openPhotoDb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const transaction = db.transaction(PHOTO_DB_STORE, "readonly");
      const request = transaction.objectStore(PHOTO_DB_STORE).get(PHOTO_HANDLE_KEY);
      request.addEventListener("success", () => resolve(request.result || null));
      request.addEventListener("error", () => resolve(null));
      transaction.addEventListener("complete", () => db.close());
      transaction.addEventListener("abort", () => db.close());
    });
  } catch {
    return null;
  }
}

async function savePhotoRootHandle(handle) {
  try {
    const db = await openPhotoDb();
    if (!db) return;
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_DB_STORE, "readwrite");
      transaction.objectStore(PHOTO_DB_STORE).put(handle, PHOTO_HANDLE_KEY);
      transaction.addEventListener("complete", () => {
        db.close();
        resolve();
      });
      transaction.addEventListener("error", () => {
        db.close();
        reject(transaction.error);
      });
      transaction.addEventListener("abort", () => {
        db.close();
        reject(transaction.error);
      });
    });
  } catch {
    // Když prohlížeč handle neuloží, appka dál funguje s aktuálně vybranou složkou.
  }
}

async function ensurePhotoRootHandle({ write = false, request = false } = {}) {
  if (!hasPhotoFolderSupport()) return null;
  const handle = photoRuntime.rootHandle || (await loadPhotoRootHandle());
  if (!handle) return null;

  const options = { mode: write ? "readwrite" : "read" };
  const query = typeof handle.queryPermission === "function" ? await handle.queryPermission(options) : "granted";
  if (query === "granted") {
    photoRuntime.rootHandle = handle;
    updatePhotoFolderStatus();
    return handle;
  }
  if (!request || typeof handle.requestPermission !== "function") return null;

  const permission = await handle.requestPermission(options);
  if (permission !== "granted") return null;
  photoRuntime.rootHandle = handle;
  updatePhotoFolderStatus();
  return handle;
}

async function saveVarietyPhotoFiles(varietyName, files) {
  const images = Array.from(files || []).filter((file) => file.type?.startsWith("image/"));
  if (!images.length) return [];
  const preparedImages = [];
  for (const file of images) preparedImages.push(await preparePhotoFileForStorage(file));

  const saved = await saveIndexedPhotoFiles(preparedImages);
  if (photoRuntime.rootHandle) {
    saveOriginalPhotoFiles(varietyName, preparedImages).catch((error) => console.warn("Local photo backup skipped", error));
  }
  if (saved.length !== preparedImages.length) {
    throw new Error("Fotky se nepodařilo uložit do appky.");
  }
  return saved;
}

async function saveIndexedPhotoFiles(files) {
  const images = Array.from(files || []).filter((file) => file.type?.startsWith("image/"));
  if (!images.length) return [];
  const preparedImages = [];
  for (const file of images) preparedImages.push(await preparePhotoFileForStorage(file));
  const saved = [];
  for (const file of preparedImages) {
    const ref = await saveIndexedPhotoFile(file);
    if (ref) saved.push(ref);
  }
  if (saved.length === preparedImages.length) return saved;

  const fallbackFiles = preparedImages.slice(saved.length);
  const fallback = fallbackFiles.length ? await readImageFiles(fallbackFiles, { original: true }) : [];
  return [...saved, ...fallback];
}

async function saveIndexedPhotoFile(file) {
  try {
    const db = await openPhotoDb();
    if (!db) return "";
    const id = uid();
    const storedFile = await preparePhotoFileForStorage(file);
    const preview = await imageFileToDataUrl(storedFile, { maxSize: 1100, quality: 0.82 });
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_BLOB_STORE, "readwrite");
      transaction.objectStore(PHOTO_BLOB_STORE).put(
        {
          id,
          name: clean(storedFile.name) || `${id}${photoExtension(storedFile)}`,
          type: clean(storedFile.type) || "image/jpeg",
          file: storedFile,
          preview,
          createdAt: new Date().toISOString(),
        },
        id,
      );
      transaction.addEventListener("complete", () => {
        db.close();
        resolve();
      });
      transaction.addEventListener("error", () => {
        db.close();
        reject(transaction.error);
      });
      transaction.addEventListener("abort", () => {
        db.close();
        reject(transaction.error);
      });
    });
    return indexedPhotoRef(id);
  } catch {
    return "";
  }
}

async function saveOriginalPhotoFiles(varietyName, files) {
  if (!hasPhotoFolderSupport()) return [];
  const root = await ensurePhotoRootHandle({ write: true, request: true });
  if (!root) return [];

  const saved = [];
  const folderName = safeFileName(varietyName);
  try {
    const varietiesDir = await root.getDirectoryHandle(PHOTO_VARIETIES_DIR, { create: true });
    const varietyDir = await varietiesDir.getDirectoryHandle(folderName, { create: true });
    for (const file of files) {
      const fileName = await nextPhotoFileName(varietyDir, folderName, photoExtension(file));
      const fileHandle = await varietyDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      saved.push(localPhotoRef(folderName, fileName));
    }
  } catch {
    if (!saved.length) toast("Fotky se nepodařilo uložit do složky, zůstanou jen v appce.");
  }
  return saved;
}

async function nextPhotoFileName(directoryHandle, baseName, extension) {
  for (let index = 1; index < 1000; index += 1) {
    const suffix = index === 1 ? "" : `-${index}`;
    const fileName = `${baseName}${suffix}${extension}`;
    try {
      await directoryHandle.getFileHandle(fileName);
    } catch {
      return fileName;
    }
  }
  return `${baseName}-${Date.now()}${extension}`;
}

function localPhotoRef(folderName, fileName) {
  return `${LOCAL_PHOTO_PREFIX}${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`;
}

function indexedPhotoRef(id) {
  return `${INDEXED_PHOTO_PREFIX}${encodeURIComponent(id)}`;
}

function parseLocalPhotoRef(ref) {
  const value = clean(ref).slice(LOCAL_PHOTO_PREFIX.length);
  const [folderName, fileName] = value.split("/").map((part) => decodeURIComponent(part || ""));
  if (!folderName || !fileName) return null;
  return { folderName, fileName };
}

function parseIndexedPhotoRef(ref) {
  const id = decodeURIComponent(clean(ref).slice(INDEXED_PHOTO_PREFIX.length));
  return id || "";
}

async function resolveLocalPhotoFile(ref, requestPermission = false) {
  const parsed = parseLocalPhotoRef(ref);
  if (!parsed) return null;
  const root = await ensurePhotoRootHandle({ write: false, request: requestPermission });
  if (!root) return null;
  const varietiesDir = await root.getDirectoryHandle(PHOTO_VARIETIES_DIR);
  const varietyDir = await varietiesDir.getDirectoryHandle(parsed.folderName);
  const fileHandle = await varietyDir.getFileHandle(parsed.fileName);
  return fileHandle.getFile();
}

async function resolveLocalPhotoUrl(ref) {
  if (photoRuntime.objectUrls.has(ref)) return photoRuntime.objectUrls.get(ref);
  const file = await resolveLocalPhotoFile(ref);
  if (!file) return "";
  const url = URL.createObjectURL(file);
  photoRuntime.objectUrls.set(ref, url);
  return url;
}

async function getIndexedPhotoRecord(ref) {
  const id = parseIndexedPhotoRef(ref);
  if (!id) return null;
  try {
    const db = await openPhotoDb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const transaction = db.transaction(PHOTO_BLOB_STORE, "readonly");
      const request = transaction.objectStore(PHOTO_BLOB_STORE).get(id);
      request.addEventListener("success", () => resolve(request.result || null));
      request.addEventListener("error", () => resolve(null));
      transaction.addEventListener("complete", () => db.close());
      transaction.addEventListener("abort", () => db.close());
    });
  } catch {
    return null;
  }
}

async function resolveIndexedPhotoFile(ref) {
  const record = await getIndexedPhotoRecord(ref);
  return record?.file || null;
}

async function resolveIndexedPhotoUrl(ref, { original = false } = {}) {
  if (!original && photoRuntime.indexedPreviewUrls.has(ref)) return photoRuntime.indexedPreviewUrls.get(ref);
  if (original && photoRuntime.indexedObjectUrls.has(ref)) return photoRuntime.indexedObjectUrls.get(ref);
  const record = await getIndexedPhotoRecord(ref);
  if (!record) return "";
  if (!original && record.preview) {
    photoRuntime.indexedPreviewUrls.set(ref, record.preview);
    return record.preview;
  }
  if (!record.file) return "";
  const url = URL.createObjectURL(record.file);
  photoRuntime.indexedObjectUrls.set(ref, url);
  return url;
}

function isSupabasePhotoNearViewport(image) {
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

function ensureSupabasePhotoObserver() {
  if (photoRuntime.supabaseObserver || typeof IntersectionObserver !== "function") return photoRuntime.supabaseObserver;
  photoRuntime.supabaseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && entry.intersectionRatio <= 0) return;
      runDeferredSupabasePhotoLoad(entry.target);
    });
  }, { rootMargin: SUPABASE_PHOTO_OBSERVER_ROOT_MARGIN });
  return photoRuntime.supabaseObserver;
}

function queueDeferredSupabasePhotoLoad(image, load) {
  const observer = ensureSupabasePhotoObserver();
  if (!observer || image.dataset.photoQueued === "1" || image.dataset.photoLoaded === "1") return false;
  photoRuntime.deferredSupabaseLoads.set(image, load);
  image.dataset.photoQueued = "1";
  observer.observe(image);
  return true;
}

function runDeferredSupabasePhotoLoad(image) {
  const observer = photoRuntime.supabaseObserver;
  if (observer) observer.unobserve(image);
  const load = photoRuntime.deferredSupabaseLoads.get(image);
  if (!load) return;
  photoRuntime.deferredSupabaseLoads.delete(image);
  Promise.resolve(load()).catch(() => {
    markPhotoMissing(image);
  });
}

function hydrateLocalPhotoImages(root = document) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("[data-local-photo-ref]").forEach(async (image) => {
    if (image.dataset.photoLoaded === "1") return;
    const ref = image.dataset.localPhotoRef;
    const url = await resolveLocalPhotoUrl(ref);
    if (!url) {
      markPhotoMissing(image);
      return;
    }
    image.src = url;
    image.dataset.photoLoaded = "1";
    clearPhotoMissing(image);
  });
  root.querySelectorAll("[data-indexed-photo-ref]").forEach(async (image) => {
    if (image.dataset.photoLoaded === "1") return;
    const ref = image.dataset.indexedPhotoRef;
    const url = await resolveIndexedPhotoUrl(ref);
    if (!url) {
      markPhotoMissing(image);
      return;
    }
    image.src = url;
    image.dataset.photoLoaded = "1";
    clearPhotoMissing(image);
  });
  root.querySelectorAll("[data-supabase-photo-ref]").forEach(async (image) => {
    if (image.dataset.photoLoaded === "1") return;
    const ref = image.dataset.supabasePhotoRef;
    const fallbackRef = image.dataset.supabasePhotoFallback || "";
    const fallbackAllowed = image.dataset.supabasePhotoAllowFallback === "1";
    const load = async () => {
      image.dataset.photoQueued = "";
      image.onerror = async () => {
        if (!fallbackAllowed || !fallbackRef || image.dataset.photoFallbackLoaded === "1") {
          markPhotoMissing(image);
          return;
        }
        image.dataset.photoFallbackLoaded = "1";
        const fallbackUrl = await resolveSupabasePhotoUrl(fallbackRef);
        if (fallbackUrl) {
          image.src = fallbackUrl;
          image.dataset.photoLoaded = "1";
          clearPhotoMissing(image);
        } else {
          markPhotoMissing(image);
        }
      };
      try {
        let url = await resolveSupabasePhotoUrl(ref);
        if (!url && fallbackAllowed && fallbackRef) {
          url = await resolveSupabasePhotoUrl(fallbackRef);
        }
        if (!url) {
          markPhotoMissing(image);
          return;
        }
        image.src = url;
        image.dataset.photoLoaded = "1";
        clearPhotoMissing(image);
      } catch {
        markPhotoMissing(image);
      }
    };
    const lazyEligible = clean(ref).startsWith(SUPABASE_PHOTO_PREFIX)
      || clean(fallbackRef).startsWith(SUPABASE_PHOTO_PREFIX);
    if (lazyEligible && !isSupabasePhotoNearViewport(image) && queueDeferredSupabasePhotoLoad(image, load)) return;
    await load();
  });
}

function markPhotoMissing(image) {
  if (!image) return;
  image.classList.add("photo-missing");
  image.hidden = true;
  const parent = image.parentElement;
  if (!parent || parent.querySelector(".photo-missing-label")) return;
  const label = document.createElement("span");
  label.className = "photo-missing-label";
  label.textContent = varietyInitials(image.getAttribute("alt") || "AK");
  parent.append(label);
}

function clearPhotoMissing(image) {
  if (!image) return;
  image.hidden = false;
  image.classList.remove("photo-missing");
  image.parentElement?.querySelector(".photo-missing-label")?.remove();
}

function safeFileName(value, fallback = "odruda") {
  const safe = clean(value)
    .replace(/[<>:"/\\|?*\x00-\x1f]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\.+|\.+$/g, "")
    .trim()
    .slice(0, 80);
  return safe || fallback;
}

function photoExtension(source) {
  const name = typeof source === "string" ? source : source?.name || "";
  const mime = typeof source === "string" ? clean(source.match(/^data:image\/([^;,]+)/)?.[1]) : clean(source?.type);
  const fromName = clean(name).match(/\.(jpe?g|png|webp|gif|avif|heic|heif)$/i)?.[1];
  const type = clean(fromName || mime).toLowerCase();
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  if (type.includes("gif")) return ".gif";
  if (type.includes("avif")) return ".avif";
  if (type.includes("heic")) return ".heic";
  if (type.includes("heif")) return ".heif";
  return ".jpg";
}

function photoDownloadName(varietyName, image, index = 0, file = null) {
  const suffix = index ? `-${index + 1}` : "";
  return `${safeFileName(varietyName)}${suffix}${photoExtension(file || image)}`;
}

function readImageFiles(files, options = {}) {
  const images = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
  const reader = options.original ? readFileAsDataUrl : (file) => imageFileToDataUrl(file, options);
  return Promise.all(images.map((file) => reader(file))).then((items) => items.filter(Boolean));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => resolve(""));
    reader.addEventListener("load", () => resolve(clean(reader.result)));
    reader.readAsDataURL(file);
  });
}

function imageFileToDataUrl(file, options = {}) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => resolve(""));
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("error", () => resolve(clean(reader.result)));
      image.addEventListener("load", () => {
        const maxSize = Number(options.maxSize) || 900;
        const quality = Number(options.quality) || 0.82;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function mergeVarieties(items) {
  const now = new Date().toISOString();
  const map = new Map();

  (items || []).forEach((item) => {
    const variety = typeof item === "string" ? { name: item } : item || {};
    const name = clean(variety.name);
    const key = normalize(name).replace(/[^a-z0-9]+/g, " ").trim();
    if (!key) return;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        id: variety.id || uid(),
        name,
        photoUrl: clean(variety.photoUrl),
        gallery: normalizeGallery(variety.gallery),
        salePrice: normalizeAmount(variety.salePrice),
        saleCurrency: normalizeCurrency(variety.saleCurrency),
        priceHistory: initialPriceHistoryForVariety(variety, now),
        stockAvailable: normalizeWholeNumber(variety.stockAvailable),
        stockReserved: normalizeWholeNumber(variety.stockReserved),
        note: clean(variety.note),
        active: variety.active !== false,
        createdAt: variety.createdAt || now,
        updatedAt: variety.updatedAt || now,
      });
      return;
    }

    if (!existing.note && variety.note) existing.note = clean(variety.note);
    if (!existing.photoUrl && variety.photoUrl) existing.photoUrl = clean(variety.photoUrl);
    existing.gallery = unique([...(existing.gallery || []), ...normalizeGallery(variety.gallery)]);
    if (!existing.salePrice && variety.salePrice) existing.salePrice = normalizeAmount(variety.salePrice);
    if (!existing.saleCurrency && variety.saleCurrency) existing.saleCurrency = normalizeCurrency(variety.saleCurrency);
    if (!existing.stockAvailable && variety.stockAvailable) existing.stockAvailable = normalizeWholeNumber(variety.stockAvailable);
    if (!existing.stockReserved && variety.stockReserved) existing.stockReserved = normalizeWholeNumber(variety.stockReserved);
    existing.priceHistory = normalizePriceHistory([...(initialPriceHistoryForVariety(existing, now) || []), ...initialPriceHistoryForVariety(variety, now)]);
    existing.active = existing.active !== false || variety.active !== false;
    existing.updatedAt = variety.updatedAt || existing.updatedAt;
  });

  return [...map.values()].sort((a, b) => naturalCompare(a.name, b.name));
}

function varietyNamesFromText(text) {
  return unique(
    clean(text)
      .split(/[,;\n]+/)
      .map((part) =>
        clean(part)
          .replace(/(?:@|=)\s*\d+([,.]\d+)?\s*(kč|kc|czk|eur|€)?/gi, " ")
          .replace(/-\s*\d+([,.]\d+)?\s*(kč|kc|czk|eur|€)/gi, " ")
          .replace(/\b\d+([,.]\d+)?\s*(kč|kc|czk|eur|€)\b/gi, " ")
          .replace(/\b\d+\s*x\b/gi, " ")
          .replace(/\b\d+\s*(ks|kus|kusy|řízků|rizku|sazenic)\b/gi, " ")
          .replace(/\b(ks|kus|kusy|řízků|rizku|sazenic)\s*\d+\b/gi, " ")
          .replace(/[@=]/g, " ")
          .replace(/\b(celkem|bonus|kusy|sazenice|řízky|rizky|kč|kc|eur|euro|další|dalsi|kopřivy|koprivy)\b/gi, " ")
          .replace(/^[\s\-/?.,]+|[\s\-/?.,]+$/g, ""),
      )
      .filter((name) => {
        const value = normalize(name);
        return (
          name.length >= 2 &&
          !["ok", "ano", "ne", "mix"].includes(value) &&
          !value.match(/zasilkovna|balikovna|platba|zaplaceno|adresa|telefon|email|doruc/)
        );
      }),
  );
}

function splitName(fullName) {
  const parts = clean(fullName).split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function showDialog(dialog) {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeParentDialog(button) {
  const dialog = button.closest("dialog");
  if (!dialog) return;
  if (dialog === els.orderDialog) {
    attemptCloseOrderDialog();
    return;
  }
  if (typeof dialog.close === "function") dialog.close("cancel");
  else dialog.removeAttribute("open");
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(`${value}T00:00:00`))
    .replace(/\s+/g, "");
}

function formatTime(value) {
  return new Intl.DateTimeFormat("cs-CZ", { hour: "2-digit", minute: "2-digit" }).format(value instanceof Date ? value : new Date(value));
}

function formatCloudDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatTime(new Date());
  return new Intl.DateTimeFormat("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function clean(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.replace(/\[object Object\]/gi, "").trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  if (Array.isArray(value)) return unique(value.map((item) => clean(item)).filter(Boolean)).join("\n").trim();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const preferredKeys = ["text", "value", "result", "formattedText", "richText", "email", "phone", "country", "address", "name"];
    const preferred = preferredKeys.map((key) => clean(value[key])).filter(Boolean);
    if (preferred.length) return unique(preferred).join("\n").trim();
    return unique(Object.values(value).map((item) => clean(item)).filter(Boolean)).join("\n").trim();
  }
  return String(value).trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function naturalCompare(a, b) {
  return clean(a).localeCompare(clean(b), "cs", { sensitivity: "base", numeric: true });
}

function stripDiacritics(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesSearchText(text, query) {
  const haystack = normalize(text);
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

function digits(value) {
  return clean(value).replace(/\D/g, "");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function maxColumns(rows) {
  return rows.reduce((max, row) => Math.max(max, row.length), 0);
}

function csvCell(value) {
  const text = clean(value).replace(/"/g, '""');
  return `"${text}"`;
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPaymentQrCode(value) {
  const qr = new PaymentQrCodeModel(null, PaymentQrErrorCorrectLevel.M);
  qr.addData(value);
  qr.make();
  return qr;
}

function encodePaymentQrBytes(value) {
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(String(value)));
  }
  return Array.from(unescape(encodeURIComponent(String(value))), (char) => char.charCodeAt(0));
}

class PaymentQrByteData {
  constructor(data) {
    this.mode = 0x4;
    this.data = encodePaymentQrBytes(data);
  }

  getLength() {
    return this.data.length;
  }

  getLengthBits(version) {
    if (version > 0 && version < 10) return 8;
    if (version < 41) return 16;
    throw new Error(`Unknown QR version: ${version}`);
  }

  write(buffer, version) {
    buffer.put(this.mode, 4);
    buffer.put(this.getLength(), this.getLengthBits(version));
    this.data.forEach((byte) => buffer.put(byte, 8));
  }
}

class PaymentQrCodeModel {
  constructor(version, errorCorrectLevel) {
    this.version = version;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  addData(data) {
    this.dataList.push(new PaymentQrByteData(data));
    this.dataCache = null;
  }

  isDark(row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(`${row},${col}`);
    }
    return this.modules[row][col];
  }

  getModuleCount() {
    return this.moduleCount;
  }

  calculateVersion() {
    for (let version = 1; version <= 40; version += 1) {
      const rsBlocks = PaymentQrRsBlock.getRSBlocks(version, this.errorCorrectLevel);
      const totalDataCount = rsBlocks.reduce((sum, block) => sum + block.dataCount, 0);
      let length = 0;
      this.dataList.forEach((data) => {
        length += 4;
        length += data.getLengthBits(version);
        length += data.getLength() * 8;
      });
      if (length <= totalDataCount * 8) return version;
    }
    throw new Error("QR data is too long.");
  }

  make() {
    if (this.version == null) this.version = this.calculateVersion();
    this.makeImpl(false, this.getBestMaskPattern());
  }

  makeImpl(test, maskPattern) {
    this.moduleCount = this.version * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () => Array(this.moduleCount).fill(null));

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);

    if (this.version >= 7) {
      this.setupTypeNumber(test);
    }

    if (this.dataCache == null) {
      this.dataCache = PaymentQrCodeModel.createData(this.version, this.errorCorrectLevel, this.dataList);
    }

    this.mapData(this.dataCache, maskPattern);
  }

  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r += 1) {
      if (row + r < 0 || this.moduleCount <= row + r) continue;

      for (let c = -1; c <= 7; c += 1) {
        if (col + c < 0 || this.moduleCount <= col + c) continue;

        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6))
          || (c >= 0 && c <= 6 && (r === 0 || r === 6))
          || (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  getBestMaskPattern() {
    let minLostPoint = 0;
    let pattern = 0;

    for (let i = 0; i < 8; i += 1) {
      this.makeImpl(true, i);
      const lostPoint = PaymentQrUtil.getLostPoint(this);
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }

    return pattern;
  }

  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r += 1) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = r % 2 === 0;
    }

    for (let c = 8; c < this.moduleCount - 8; c += 1) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = c % 2 === 0;
    }
  }

  setupPositionAdjustPattern() {
    const pos = PaymentQrUtil.getPatternPosition(this.version);

    for (let i = 0; i < pos.length; i += 1) {
      for (let j = 0; j < pos.length; j += 1) {
        const row = pos[i];
        const col = pos[j];

        if (this.modules[row][col] != null) continue;

        for (let r = -2; r <= 2; r += 1) {
          for (let c = -2; c <= 2; c += 1) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  setupTypeNumber(test) {
    const bits = PaymentQrUtil.getBCHTypeNumber(this.version);

    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[Math.floor(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = mod;
    }

    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[(i % 3) + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  setupTypeInfo(test, maskPattern) {
    const data = (this.errorCorrectLevel << 3) | maskPattern;
    const bits = PaymentQrUtil.getBCHTypeInfo(data);

    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;

      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;

      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    this.modules[this.moduleCount - 8][8] = !test;
  }

  mapData(data, maskPattern) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const mask = PaymentQrUtil.getMask(maskPattern);

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col -= 1;

      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (this.modules[row][col - c] != null) continue;

          let dark = false;
          if (byteIndex < data.length) {
            dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
          }

          if (mask(row, col - c)) dark = !dark;
          this.modules[row][col - c] = dark;
          bitIndex -= 1;

          if (bitIndex === -1) {
            byteIndex += 1;
            bitIndex = 7;
          }
        }

        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  static createData(version, errorCorrectLevel, dataList) {
    const rsBlocks = PaymentQrRsBlock.getRSBlocks(version, errorCorrectLevel);
    const buffer = new PaymentQrBitBuffer();

    dataList.forEach((data) => data.write(buffer, version));

    const totalDataCount = rsBlocks.reduce((sum, block) => sum + block.dataCount, 0);
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error(`QR code length overflow. (${buffer.getLengthInBits()} > ${totalDataCount * 8})`);
    }

    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }

    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xEC, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }

    return PaymentQrCodeModel.createBytes(buffer, rsBlocks);
  }

  static createBytes(buffer, rsBlocks) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    let totalCodeCount = 0;
    const dcdata = [];
    const ecdata = [];

    rsBlocks.forEach((block) => {
      totalCodeCount += block.totalCount;
      const dcCount = block.dataCount;
      const ecCount = block.totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      const currentDcData = [];
      for (let i = 0; i < dcCount; i += 1) {
        currentDcData.push(buffer.buffer[i + offset]);
      }
      dcdata.push(currentDcData);
      offset += dcCount;

      const rsPoly = PaymentQrUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new PaymentQrPolynomial(currentDcData, rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      const currentEcData = Array(ecCount).fill(0);

      for (let i = 0; i < currentEcData.length; i += 1) {
        const modIndex = i + modPoly.getLength() - currentEcData.length;
        currentEcData[i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }

      ecdata.push(currentEcData);
    });

    const data = Array(totalCodeCount).fill(0);
    let index = 0;

    for (let i = 0; i < maxDcCount; i += 1) {
      for (let r = 0; r < dcdata.length; r += 1) {
        if (i < dcdata[r].length) data[index++] = dcdata[r][i];
      }
    }

    for (let i = 0; i < maxEcCount; i += 1) {
      for (let r = 0; r < ecdata.length; r += 1) {
        if (i < ecdata[r].length) data[index++] = ecdata[r][i];
      }
    }

    return data;
  }
}

const PaymentQrErrorCorrectLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

const PaymentQrUtil = {
  PATTERN_POSITION_TABLE: [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
  ],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
  getBCHTypeInfo(data) {
    let d = data << 10;
    while (this.getBCHDigit(d) - this.getBCHDigit(this.G15) >= 0) {
      d ^= this.G15 << (this.getBCHDigit(d) - this.getBCHDigit(this.G15));
    }
    return ((data << 10) | d) ^ this.G15_MASK;
  },
  getBCHTypeNumber(data) {
    let d = data << 12;
    while (this.getBCHDigit(d) - this.getBCHDigit(this.G18) >= 0) {
      d ^= this.G18 << (this.getBCHDigit(d) - this.getBCHDigit(this.G18));
    }
    return (data << 12) | d;
  },
  getBCHDigit(data) {
    let digit = 0;
    let value = data;
    while (value !== 0) {
      digit += 1;
      value >>>= 1;
    }
    return digit;
  },
  getPatternPosition(version) {
    return this.PATTERN_POSITION_TABLE[version - 1];
  },
  getMask(maskPattern) {
    const maskMap = {
      0: (i, j) => (i + j) % 2 === 0,
      1: (i) => i % 2 === 0,
      2: (_, j) => j % 3 === 0,
      3: (i, j) => (i + j) % 3 === 0,
      4: (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
      5: (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
      6: (i, j) => ((((i * j) % 2) + ((i * j) % 3)) % 2) === 0,
      7: (i, j) => ((((i * j) % 3) + ((i + j) % 2)) % 2) === 0,
    };
    return maskMap[maskPattern];
  },
  getErrorCorrectPolynomial(errorCorrectLength) {
    let polynomial = new PaymentQrPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i += 1) {
      polynomial = polynomial.multiply(new PaymentQrPolynomial([1, PaymentQrMath.gexp(i)], 0));
    }
    return polynomial;
  },
  getLostPoint(qrCode) {
    const moduleCount = qrCode.getModuleCount();
    let lostPoint = 0;

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        let sameCount = 0;
        const dark = qrCode.isDark(row, col);

        for (let r = -1; r <= 1; r += 1) {
          if (row + r < 0 || moduleCount <= row + r) continue;

          for (let c = -1; c <= 1; c += 1) {
            if (col + c < 0 || moduleCount <= col + c || (r === 0 && c === 0)) continue;
            if (dark === qrCode.isDark(row + r, col + c)) sameCount += 1;
          }
        }

        if (sameCount > 5) {
          lostPoint += 3 + sameCount - 5;
        }
      }
    }

    for (let row = 0; row < moduleCount - 1; row += 1) {
      for (let col = 0; col < moduleCount - 1; col += 1) {
        let count = 0;
        if (qrCode.isDark(row, col)) count += 1;
        if (qrCode.isDark(row + 1, col)) count += 1;
        if (qrCode.isDark(row, col + 1)) count += 1;
        if (qrCode.isDark(row + 1, col + 1)) count += 1;
        if (count === 0 || count === 4) lostPoint += 3;
      }
    }

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount - 6; col += 1) {
        if (
          qrCode.isDark(row, col)
          && !qrCode.isDark(row, col + 1)
          && qrCode.isDark(row, col + 2)
          && qrCode.isDark(row, col + 3)
          && qrCode.isDark(row, col + 4)
          && !qrCode.isDark(row, col + 5)
          && qrCode.isDark(row, col + 6)
          && (
            (col >= 4
              && !qrCode.isDark(row, col - 1)
              && !qrCode.isDark(row, col - 2)
              && !qrCode.isDark(row, col - 3)
              && !qrCode.isDark(row, col - 4))
            || (col + 10 < moduleCount
              && !qrCode.isDark(row, col + 7)
              && !qrCode.isDark(row, col + 8)
              && !qrCode.isDark(row, col + 9)
              && !qrCode.isDark(row, col + 10))
          )
        ) {
          lostPoint += 40;
        }
      }
    }

    for (let col = 0; col < moduleCount; col += 1) {
      for (let row = 0; row < moduleCount - 6; row += 1) {
        if (
          qrCode.isDark(row, col)
          && !qrCode.isDark(row + 1, col)
          && qrCode.isDark(row + 2, col)
          && qrCode.isDark(row + 3, col)
          && qrCode.isDark(row + 4, col)
          && !qrCode.isDark(row + 5, col)
          && qrCode.isDark(row + 6, col)
          && (
            (row >= 4
              && !qrCode.isDark(row - 1, col)
              && !qrCode.isDark(row - 2, col)
              && !qrCode.isDark(row - 3, col)
              && !qrCode.isDark(row - 4, col))
            || (row + 10 < moduleCount
              && !qrCode.isDark(row + 7, col)
              && !qrCode.isDark(row + 8, col)
              && !qrCode.isDark(row + 9, col)
              && !qrCode.isDark(row + 10, col))
          )
        ) {
          lostPoint += 40;
        }
      }
    }

    let darkCount = 0;
    for (let col = 0; col < moduleCount; col += 1) {
      for (let row = 0; row < moduleCount; row += 1) {
        if (qrCode.isDark(row, col)) darkCount += 1;
      }
    }

    const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  },
};

const PAYMENT_QR_EXP_TABLE = Array(256).fill(0);
const PAYMENT_QR_LOG_TABLE = Array(256).fill(0);
for (let i = 0; i < 8; i += 1) {
  PAYMENT_QR_EXP_TABLE[i] = 1 << i;
}
for (let i = 8; i < 256; i += 1) {
  PAYMENT_QR_EXP_TABLE[i] = PAYMENT_QR_EXP_TABLE[i - 4] ^ PAYMENT_QR_EXP_TABLE[i - 5] ^ PAYMENT_QR_EXP_TABLE[i - 6] ^ PAYMENT_QR_EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i += 1) {
  PAYMENT_QR_LOG_TABLE[PAYMENT_QR_EXP_TABLE[i]] = i;
}

const PaymentQrMath = {
  glog(n) {
    if (n < 1) throw new Error(`glog(${n})`);
    return PAYMENT_QR_LOG_TABLE[n];
  },
  gexp(n) {
    let value = n;
    while (value < 0) value += 255;
    while (value >= 256) value -= 255;
    return PAYMENT_QR_EXP_TABLE[value];
  },
};

class PaymentQrPolynomial {
  constructor(num, shift) {
    if (!num.length) throw new Error("Invalid polynomial.");
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset += 1;
    }
    this.num = num.slice(offset).concat(Array(shift).fill(0));
  }

  get(index) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(other) {
    const num = Array(this.getLength() + other.getLength() - 1).fill(0);

    for (let i = 0; i < this.getLength(); i += 1) {
      for (let j = 0; j < other.getLength(); j += 1) {
        num[i + j] ^= PaymentQrMath.gexp(PaymentQrMath.glog(this.get(i)) + PaymentQrMath.glog(other.get(j)));
      }
    }

    return new PaymentQrPolynomial(num, 0);
  }

  mod(other) {
    if (this.getLength() < other.getLength()) return this;

    const ratio = PaymentQrMath.glog(this.num[0]) - PaymentQrMath.glog(other.num[0]);
    const num = this.num.slice();

    for (let i = 0; i < other.getLength(); i += 1) {
      num[i] ^= PaymentQrMath.gexp(PaymentQrMath.glog(other.get(i)) + ratio);
    }

    return new PaymentQrPolynomial(num, 0).mod(other);
  }
}

class PaymentQrRsBlock {
  constructor(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  static getRSBlocks(version, errorCorrectLevel) {
    const rsBlock = this.getRsBlockTable(version, errorCorrectLevel);
    if (!rsBlock) {
      throw new Error(`Bad rs block @ version:${version}/errorCorrectLevel:${errorCorrectLevel}`);
    }

    const list = [];
    const length = rsBlock.length / 3;

    for (let i = 0; i < length; i += 1) {
      const count = rsBlock[i * 3];
      const totalCount = rsBlock[i * 3 + 1];
      const dataCount = rsBlock[i * 3 + 2];
      for (let j = 0; j < count; j += 1) {
        list.push(new PaymentQrRsBlock(totalCount, dataCount));
      }
    }

    return list;
  }

  static getRsBlockTable(version, errorCorrectLevel) {
    const offset = (version - 1) * 4;
    if (errorCorrectLevel === PaymentQrErrorCorrectLevel.L) return PAYMENT_QR_RS_BLOCK_TABLE[offset];
    if (errorCorrectLevel === PaymentQrErrorCorrectLevel.M) return PAYMENT_QR_RS_BLOCK_TABLE[offset + 1];
    if (errorCorrectLevel === PaymentQrErrorCorrectLevel.Q) return PAYMENT_QR_RS_BLOCK_TABLE[offset + 2];
    if (errorCorrectLevel === PaymentQrErrorCorrectLevel.H) return PAYMENT_QR_RS_BLOCK_TABLE[offset + 3];
    return null;
  }
}

class PaymentQrBitBuffer {
  constructor() {
    this.buffer = [];
    this.length = 0;
  }

  put(num, length) {
    for (let i = 0; i < length; i += 1) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  getLengthInBits() {
    return this.length;
  }

  putBit(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length += 1;
  }
}

const PAYMENT_QR_RS_BLOCK_TABLE = [
  [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
  [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
  [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
  [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
  [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
  [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
  [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
  [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
  [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
  [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
  [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],
  [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],
  [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],
  [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],
  [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12],
  [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],
  [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],
  [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],
  [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],
  [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],
  [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],
  [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],
  [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],
  [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],
  [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],
  [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],
  [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],
  [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],
  [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],
  [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],
  [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],
  [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],
  [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],
  [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],
  [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],
  [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],
  [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],
  [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],
  [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],
  [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16],
];

function restFormVarietyNames(value = "") {
  return unique(clean(value).split(/\r?\n|[,;]+/).map(clean).filter(Boolean));
}

function restOfferVarietyLabel(offer = {}) {
  const values = restFormVarietyNames(offer.restVarietyName);
  if (values.length) return values.join(", ");
  const linked = findVariety(clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
  return clean(linked?.name || offer.restVarietyName);
}

function restOfferSummaryText(offer = {}) {
  const parts = [];
  const customer = restOfferCustomer(offer);
  const variety = restOfferVarietyLabel(offer);
  const itemLines = sortedOfferItems(offer)
    .slice(0, 2)
    .map((item) => `${offerItemNameSafe(item)} · ${quantityText(item.quantity)} ks`);
  if (customer) parts.push(customerName(customer));
  if (variety) parts.push(variety);
  else if (itemLines.length) parts.push(itemLines.join(", "));
  return parts.filter(Boolean).join(" · ");
}

function ensureRestVarietyPickerScaffold(form) {
  if (!form) return null;
  let picker = form.elements.restVarietyPicker || form.querySelector('[name="restVarietyPicker"]');
  let hidden = form.elements.restVarietyName;
  let list = form.querySelector("[data-rest-variety-list]");
  let addButton = form.querySelector("[data-rest-variety-add]");
  let suggestions = form.querySelector("[data-rest-variety-suggestions]");
  if (!picker) {
    const original = form.querySelector('[name="restVarietyName"]');
    if (!original) return null;
    original.name = "restVarietyPicker";
    original.placeholder = "začni psát a přidej";
    const label = original.closest("label");
    const heading = label?.querySelector("span");
    if (heading) heading.textContent = "Odrůdy";
    hidden = document.createElement("textarea");
    hidden.name = "restVarietyName";
    hidden.hidden = true;
    hidden.setAttribute("aria-hidden", "true");
    label?.after(hidden);
    const actions = document.createElement("div");
    actions.className = "wide rest-variety-picker-row";
    actions.innerHTML = '<button class="button ghost" type="button" data-rest-variety-add>Přidat odrůdu</button>';
    hidden.after(actions);
    list = document.createElement("div");
    list.className = "wide rest-variety-selection";
    list.setAttribute("data-rest-variety-list", "");
    actions.after(list);
    suggestions = document.createElement("div");
    suggestions.className = "wide rest-variety-suggestions";
    suggestions.setAttribute("data-rest-variety-suggestions", "");
    suggestions.hidden = true;
    label?.after(suggestions);
    picker = original;
    addButton = actions.querySelector("[data-rest-variety-add]");
  }
  if (!suggestions) {
    suggestions = document.createElement("div");
    suggestions.className = "wide rest-variety-suggestions";
    suggestions.setAttribute("data-rest-variety-suggestions", "");
    suggestions.hidden = true;
    picker?.closest("label")?.after(suggestions);
  }
  return { picker, hidden, list, addButton, suggestions };
}

function renderRestVarietySelection(container, names = []) {
  if (!container) return;
  container.innerHTML = names.length
    ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>×</span></button>`).join("")
    : '<div class="rest-variety-empty">Zatím bez odrůd.</div>';
}

function setupRestVarietyPickerForOfferForm(form, initialValue = "") {
  const scaffold = ensureRestVarietyPickerScaffold(form);
  if (!scaffold) return;
  form.__restVarietyNames = restFormVarietyNames(initialValue || scaffold.hidden.value);
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
    if (!scaffold.suggestions) return;
    const names = suggestionNames(scaffold.picker.value);
    scaffold.suggestions.hidden = !names.length;
    scaffold.suggestions.innerHTML = names
      .map((name) => `<button class="rest-variety-suggestion" type="button" data-rest-variety-pick="${escapeHtml(name)}">${escapeHtml(name)}</button>`)
      .join("");
  };
  const sync = () => {
    scaffold.hidden.value = form.__restVarietyNames.join("\n");
    renderRestVarietySelection(scaffold.list, form.__restVarietyNames);
    renderSuggestions();
  };
  const addCurrent = () => {
    const raw = clean(scaffold.picker.value);
    if (!raw) return;
    const exact = findVarietyByName(raw);
    const nextName = clean(exact?.name || raw);
    if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(nextName))) {
      form.__restVarietyNames.push(nextName);
    }
    scaffold.picker.value = "";
    sync();
    scaffold.picker.focus();
  };
  scaffold.addButton.onclick = addCurrent;
  scaffold.picker.oninput = renderSuggestions;
  scaffold.picker.onkeydown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addCurrent();
  };
  scaffold.list.onclick = (event) => {
    const button = event.target.closest("[data-rest-variety-remove]");
    if (!button) return;
    form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
    sync();
  };
  if (scaffold.suggestions) {
    scaffold.suggestions.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-pick]");
      if (!button) return;
      scaffold.picker.value = button.dataset.restVarietyPick || "";
      addCurrent();
    };
  }
  sync();
}

function syncOfferRestFieldsVisibility() {
  const form = els.offerForm;
  if (!form) return;
  const isRest = normalizeOfferType(form.elements.type?.value) === "rests";
  const restBlock = form.querySelector("[data-rest-offer-fields]");
  const titleField = form.elements.title?.closest("label");
  const dateField = form.elements.date?.closest("label");
  const facebookDateField = form.elements.facebookPublishDate?.closest("label");
  const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
  const statusField = form.querySelector(".offer-status-field");
  const optionalDivider = form.querySelector(".form-divider");
  const noteField = form.elements.note?.closest("label");
  const setVisible = (node, visible) => {
    if (!node) return;
    node.hidden = false;
    node.style.display = visible ? "" : "none";
  };
  setVisible(titleField, !isRest);
  setVisible(dateField, true);
  setVisible(facebookDateField, !isRest);
  setVisible(facebookTimeField, !isRest);
  setVisible(statusField, !isRest);
  setVisible(optionalDivider, !isRest);
  setVisible(noteField, true);
  if (restBlock) {
    restBlock.hidden = !isRest;
    restBlock.style.display = isRest ? "" : "none";
  }
  if (isRest) {
    const nextDate = clean(form.elements.date?.value) || toDateInput(new Date());
    form.elements.title.value = defaultOfferTitle("rests", nextDate);
    form.elements.facebookPublishDate.value = nextDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "připravená";
  }
}

function openOfferDialog(id = null, defaults = {}) {
  const offer = id ? findOffer(id) : null;
  const initialType = offer ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer?.date || clean(defaults.date) || toDateInput(new Date());
  els.offerDialogTitle.textContent = offer
    ? (initialType === "rests" ? "Upravit resty" : "Upravit nabídku")
    : (initialType === "rests" ? "Nové resty" : "Nová nabídka");
  els.offerForm.reset();
  els.offerForm.elements.id.value = offer?.id || "";
  els.offerForm.elements.title.value = offer?.title || defaultOfferTitle(initialType, initialDate);
  els.offerForm.elements.date.value = initialDate;
  els.offerForm.elements.facebookPublishDate.value = offer?.facebookPublishDate || initialDate;
  els.offerForm.elements.facebookPublishTime.value = offer?.facebookPublishTime || "20:00";
  els.offerForm.elements.type.value = initialType;
  els.offerForm.elements.status.value = offer?.status || "připravená";
  els.offerForm.elements.note.value = offer?.note || "";
  renderOfferRestCustomerOptions(offer?.restCustomerId || defaults.restCustomerId || "");
  els.offerForm.elements.restVarietyId.value = "";
  els.offerForm.elements.date.oninput = syncOfferRestFieldsVisibility;
  els.offerForm.elements.date.onchange = syncOfferRestFieldsVisibility;
  syncOfferStatusToggle();
  syncOfferRestFieldsVisibility();
  setupRestVarietyPickerForOfferForm(els.offerForm, offer?.restVarietyName || "");
  showDialog(els.offerDialog);
}

function saveOfferFromForm() {
  if (!els.offerForm.reportValidity()) return;
  const form = new FormData(els.offerForm);
  const id = form.get("id") || uid();
  const existing = findOffer(id);
  const now = new Date().toISOString();
  const nextDate = clean(form.get("date")) || toDateInput(new Date());
  const nextType = normalizeOfferType(form.get("type") || existing?.type);
  const sourceType = existing ? normalizeOfferType(existing.type) : nextType;
  const isRest = nextType === "rests";
  const names = isRest ? restFormVarietyNames(form.get("restVarietyName")) : [];
  const offer = normalizeOffer({
    ...existing,
    id,
    title: isRest ? defaultOfferTitle("rests", nextDate) : adjustedOfferTitleForType(clean(form.get("title")), sourceType, nextType, nextDate),
    date: nextDate,
    facebookPublishDate: isRest ? nextDate : (clean(form.get("facebookPublishDate")) || nextDate),
    facebookPublishTime: isRest ? "20:00" : (clean(form.get("facebookPublishTime")) || "20:00"),
    type: nextType,
    status: isRest ? "připravená" : (clean(form.get("status")) || "připravená"),
    note: clean(form.get("note")),
    restCustomerId: isRest ? clean(form.get("restCustomerId")) : "",
    restVarietyId: "",
    restVarietyName: isRest ? names.join("\n") : "",
    items: existing?.items || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  if (existing) Object.assign(existing, offer);
  else state.data.offers.push(offer);
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  els.offerDialog.close();
  toast(isRest ? "Resty uloženy." : "Nabídka uložena.");
}

function restOfferOrderLines(offer = {}) {
  const lines = [];
  sortedOfferItems(offer).forEach((item) => {
    const quantity = Math.max(Number(normalizeWholeNumber(item.quantity)) || 0, 0);
    if (!quantity) return;
    const variety = findVariety(clean(item.varietyId)) || findVarietyByName(item.varietyName);
    const explicitPrice = parseDecimal(item.price);
    const fallbackPrice = parseDecimal(variety?.salePrice);
    const unitPrice = Number.isFinite(explicitPrice) ? item.price : (Number.isFinite(fallbackPrice) ? variety.salePrice : "");
    lines.push(unitPrice ? buildOrderLineText(offerItemNameSafe(item), quantity, unitPrice, normalizeCurrency(item.currency || variety?.saleCurrency || "CZK")) : `${offerItemNameSafe(item)} ${quantity}x`);
  });
  if (lines.length) return lines;
  return restFormVarietyNames(offer.restVarietyName).map((name) => {
    const variety = findVarietyByName(name);
    const fallbackPrice = parseDecimal(variety?.salePrice);
    return Number.isFinite(fallbackPrice) ? buildOrderLineText(name, 1, variety.salePrice, normalizeCurrency(variety?.saleCurrency || "CZK")) : `${name} 1x`;
  });
}

function restOfferSummaryText(offer = {}) {
  const parts = [];
  const customer = restOfferCustomer(offer);
  const variety = restOfferVarietyLabel(offer);
  const itemLines = sortedOfferItems(offer)
    .slice(0, 2)
    .map((item) => `${offerItemNameSafe(item)} · ${quantityText(item.quantity)} ks`);
  if (customer) parts.push(customerName(customer));
  if (variety) parts.push(variety);
  else if (itemLines.length) parts.push(itemLines.join(", "));
  return parts.filter(Boolean).join(" · ");
}

function syncOfferRestFieldsVisibility() {
  const form = els.offerForm;
  if (!form) return;
  const isRest = normalizeOfferType(form.elements.type?.value) === "rests";
  const restBlock = form.querySelector("[data-rest-offer-fields]");
  const titleField = form.elements.title?.closest("label");
  const dateField = form.elements.date?.closest("label");
  const facebookDateField = form.elements.facebookPublishDate?.closest("label");
  const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
  const statusField = form.querySelector(".offer-status-field");
  const optionalDivider = form.querySelector(".form-divider");
  const noteField = form.elements.note?.closest("label");
  const setVisible = (node, visible) => {
    if (!node) return;
    node.hidden = false;
    node.style.display = visible ? "" : "none";
  };

  setVisible(titleField, !isRest);
  setVisible(dateField, true);
  setVisible(facebookDateField, !isRest);
  setVisible(facebookTimeField, !isRest);
  setVisible(statusField, !isRest);
  setVisible(optionalDivider, !isRest);
  setVisible(noteField, true);
  if (restBlock) {
    restBlock.hidden = !isRest;
    restBlock.style.display = isRest ? "" : "none";
  }

  if (isRest) {
    const nextDate = clean(form.elements.date?.value) || toDateInput(new Date());
    form.elements.title.value = defaultOfferTitle("rests", nextDate);
    form.elements.facebookPublishDate.value = nextDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "připravená";
  } else if (restBlock) {
    form.elements.restCustomerId.value = "";
    form.elements.restVarietyId.value = "";
    form.elements.restVarietyName.value = "";
  }
}

function openOfferDialog(id = null, defaults = {}) {
  const offer = id ? findOffer(id) : null;
  const initialType = offer ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer?.date || clean(defaults.date) || toDateInput(new Date());
  const linkedVariety = findVariety(clean(offer?.restVarietyId)) || findVarietyByName(clean(offer?.restVarietyName));

  els.offerDialogTitle.textContent = offer
    ? (initialType === "rests" ? "Upravit resty" : "Upravit nabídku")
    : (initialType === "rests" ? "Nové resty" : "Nová nabídka");
  els.offerForm.reset();
  els.offerForm.elements.id.value = offer?.id || "";
  els.offerForm.elements.title.value = offer?.title || defaultOfferTitle(initialType, initialDate);
  els.offerForm.elements.date.value = initialDate;
  els.offerForm.elements.facebookPublishDate.value = offer?.facebookPublishDate || initialDate;
  els.offerForm.elements.facebookPublishTime.value = offer?.facebookPublishTime || "20:00";
  els.offerForm.elements.type.value = initialType;
  els.offerForm.elements.status.value = offer?.status || "připravená";
  els.offerForm.elements.note.value = offer?.note || "";
  renderOfferRestCustomerOptions(offer?.restCustomerId || defaults.restCustomerId || "");
  els.offerForm.elements.restVarietyId.value = clean(offer?.restVarietyId || linkedVariety?.id);
  els.offerForm.elements.restVarietyName.value = clean(offer?.restVarietyName || linkedVariety?.name);
  els.offerForm.elements.restVarietyName.oninput = syncOfferRestVarietySelection;
  els.offerForm.elements.restVarietyName.onchange = syncOfferRestVarietySelection;
  els.offerForm.elements.date.oninput = syncOfferRestFieldsVisibility;
  els.offerForm.elements.date.onchange = syncOfferRestFieldsVisibility;
  syncOfferStatusToggle();
  syncOfferRestFieldsVisibility();
  showDialog(els.offerDialog);
}

function saveOfferFromForm() {
  if (!els.offerForm.reportValidity()) return;
  const form = new FormData(els.offerForm);
  const id = form.get("id") || uid();
  const existing = findOffer(id);
  const now = new Date().toISOString();
  const nextDate = clean(form.get("date")) || toDateInput(new Date());
  const nextType = normalizeOfferType(form.get("type") || existing?.type);
  const sourceType = existing ? normalizeOfferType(existing.type) : nextType;
  const isRest = nextType === "rests";
  const rawRestVarietyName = isRest ? clean(form.get("restVarietyName")) : "";
  const matchedRestVariety = rawRestVarietyName ? findVarietyByName(rawRestVarietyName) : null;
  const nextRestVarietyId = isRest ? clean(form.get("restVarietyId")) || clean(matchedRestVariety?.id) : "";
  const nextRestVarietyName = isRest ? clean(matchedRestVariety?.name || rawRestVarietyName || findVariety(nextRestVarietyId)?.name) : "";
  const offer = normalizeOffer({
    ...existing,
    id,
    title: isRest ? defaultOfferTitle("rests", nextDate) : adjustedOfferTitleForType(clean(form.get("title")), sourceType, nextType, nextDate),
    date: nextDate,
    facebookPublishDate: isRest ? nextDate : (clean(form.get("facebookPublishDate")) || nextDate),
    facebookPublishTime: isRest ? "20:00" : (clean(form.get("facebookPublishTime")) || "20:00"),
    type: nextType,
    status: isRest ? "připravená" : (clean(form.get("status")) || "připravená"),
    note: clean(form.get("note")),
    restCustomerId: isRest ? clean(form.get("restCustomerId")) : "",
    restVarietyId: isRest ? nextRestVarietyId : "",
    restVarietyName: isRest ? nextRestVarietyName : "",
    items: existing?.items || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  if (existing) Object.assign(existing, offer);
  else state.data.offers.push(offer);
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  els.offerDialog.close();
  toast(isRest ? "Resty uloženy." : "Nabídka uložena.");
}

function renderOffers() {
  const offers = filteredOffers();
  if (!state.selectedOfferId && offers[0]) state.selectedOfferId = offers[0].id;
  if (state.selectedOfferId && !offers.some((offer) => offer.id === state.selectedOfferId)) {
    state.selectedOfferId = offers[0]?.id || null;
  }

  const groups = splitOffersByType(offers);
  const renderOfferRows = (items, heading) => {
    if (!items.length) return "";
    return `
      <tr class="table-section-row"><td colspan="5">${escapeHtml(heading)}</td></tr>
      ${items.map((offer) => {
        const isRest = isRestOffer(offer);
        if (isRest) {
          const summary = restOfferSummaryText(offer);
          const notePreview = clean(offer.note) ? `<small>${escapeHtml(shortRestText(offer.note, 88))}</small>` : "";
          return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
            <td class="offer-main-cell">
              <div class="offer-mobile-card">
                <strong>${escapeHtml(offer.title)}</strong>
                <small>${escapeHtml([formatDate(offer.date), summary].filter(Boolean).join(" · "))}</small>
                <span class="pill warning">Resty</span>
                ${notePreview}
              </div>
              <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)} <span class="pill warning">Resty</span></span>
              <span class="cell-sub offer-desktop-sub">${escapeHtml([formatDate(offer.date), summary].filter(Boolean).join(" · "))}</span>
              ${notePreview}
            </td>
            <td><span class="pill warning">Resty</span></td>
            <td>—</td>
            <td>
              <span class="cell-main">—</span>
              <span class="cell-sub">Jen poznámka / dluh</span>
            </td>
            <td>
              <span class="row-actions">
                <button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">✎</button>
                <button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">×</button>
              </span>
            </td>
          </tr>`;
        }

        const confirmed = offerConfirmedCount(offer);
        const alternates = offerAlternateCount(offer);
        const available = offerAvailableCount(offer);
        const itemCount = Array.isArray(offer.items) ? offer.items.length : 0;
        const statLine = [`Volné ${available}`, alternates ? `Náhradníci ${alternates}` : ""].filter(Boolean).join(" · ");
        return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
          <td class="offer-main-cell">
            <div class="offer-mobile-card">
              <strong>${escapeHtml(offer.title)}</strong>
              <small>${formatDate(offer.date)} · ${escapeHtml(offerTypeLabel(offer))}</small>
              <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
              <div class="offer-mobile-stats">
                <span><small>Položky</small><b>${itemCount}</b></span>
                <span><small>Volné</small><b>${available}</b></span>
                <span><small>Rezervace</small><b>${confirmed}</b></span>
              </div>
            </div>
            <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)}</span>
            <span class="cell-sub offer-desktop-sub">${formatDate(offer.date)} · ${escapeHtml(offerTypeLabel(offer))}</span>
          </td>
          <td><span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span></td>
          <td>${itemCount}</td>
          <td>
            <span class="cell-main">${confirmed}</span>
            <span class="cell-sub">${escapeHtml(statLine)}</span>
          </td>
          <td>
            <span class="row-actions">
              <button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">✎</button>
              <button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">×</button>
            </span>
          </td>
        </tr>`;
      }).join("")}
    `;
  };

  els.offersTable.innerHTML = offers.length
    ? [
        renderOfferRows(groups.offers, "Nabídky"),
        renderOfferRows(groups.rests, "Resty"),
      ].filter(Boolean).join("")
    : `<tr><td colspan="5">${emptyState("Žádná nabídka.")}</td></tr>`;

  els.offersTable.querySelectorAll("[data-offer-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.selectedOfferId = row.dataset.offerRow;
      renderOffers();
    });
  });
  els.offersTable.querySelectorAll("[data-edit-offer]").forEach((button) => {
    button.addEventListener("click", () => openOfferDialog(button.dataset.editOffer));
  });
  els.offersTable.querySelectorAll("[data-delete-offer]").forEach((button) => {
    button.addEventListener("click", () => deleteOffer(button.dataset.deleteOffer));
  });
  renderOfferDetail();
}

function restOfferOrderLines(offer = {}) {
  const lines = [];
  sortedOfferItems(offer).forEach((item) => {
    const quantity = Math.max(Number(normalizeWholeNumber(item.quantity)) || 0, 0);
    if (!quantity) return;
    const variety = findVariety(clean(item.varietyId)) || findVarietyByName(item.varietyName);
    const explicitPrice = parseDecimal(item.price);
    const fallbackPrice = parseDecimal(variety?.salePrice);
    const unitPrice = Number.isFinite(explicitPrice) ? item.price : (Number.isFinite(fallbackPrice) ? variety.salePrice : "");
    lines.push(unitPrice ? buildOrderLineText(offerItemNameSafe(item), quantity, unitPrice, normalizeCurrency(item.currency || variety?.saleCurrency || "CZK")) : `${offerItemNameSafe(item)} ${quantity}x`);
  });
  if (lines.length) return lines;
  const restVariety = restOfferVarietyLabel(offer);
  if (!restVariety) return [];
  const variety = findVariety(clean(offer.restVarietyId)) || findVarietyByName(restVariety);
  const fallbackPrice = parseDecimal(variety?.salePrice);
  return [Number.isFinite(fallbackPrice) ? buildOrderLineText(restVariety, 1, variety.salePrice, normalizeCurrency(variety?.saleCurrency || "CZK")) : `${restVariety} 1x`];
}

function restOfferOrderNote(offer = {}) {
  return [`Z restů: ${offer.title}`, clean(offer.note)].filter(Boolean).join("\n");
}

var __akPrevSyncOfferRestFieldsVisibility = syncOfferRestFieldsVisibility;
syncOfferRestFieldsVisibility = function syncOfferRestFieldsVisibilityOverride() {
  if (typeof __akPrevSyncOfferRestFieldsVisibility === "function") __akPrevSyncOfferRestFieldsVisibility();
  const form = els.offerForm;
  if (!form) return;
  const isRest = normalizeOfferType(form.elements.type?.value) === "rests";
  const titleField = form.elements.title?.closest("label");
  const facebookDateField = form.elements.facebookPublishDate?.closest("label");
  const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
  const statusField = form.querySelector(".offer-status-field");
  const optionalDivider = form.querySelector(".form-divider");
  if (titleField) titleField.hidden = isRest;
  if (facebookDateField) facebookDateField.hidden = isRest;
  if (facebookTimeField) facebookTimeField.hidden = isRest;
  if (statusField) statusField.hidden = isRest;
  if (optionalDivider) optionalDivider.hidden = isRest;
  if (isRest) {
    const nextDate = clean(form.elements.date?.value) || toDateInput(new Date());
    form.elements.title.value = defaultOfferTitle("rests", nextDate);
    form.elements.facebookPublishDate.value = nextDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "připravená";
  }
};

var __akPrevOpenOfferDialog = openOfferDialog;
openOfferDialog = function openOfferDialogOverride(id = null, defaults = {}) {
  __akPrevOpenOfferDialog(id, defaults);
  const form = els.offerForm;
  if (!form) return;
  form.elements.date.oninput = syncOfferRestFieldsVisibility;
  form.elements.date.onchange = syncOfferRestFieldsVisibility;
  syncOfferRestFieldsVisibility();
};

var __akPrevSaveOfferFromForm = saveOfferFromForm;
saveOfferFromForm = function saveOfferFromFormOverride() {
  if (normalizeOfferType(els.offerForm?.elements?.type?.value) !== "rests") {
    return __akPrevSaveOfferFromForm();
  }
  if (!els.offerForm.reportValidity()) return;
  const form = new FormData(els.offerForm);
  const id = form.get("id") || uid();
  const existing = findOffer(id);
  const now = new Date().toISOString();
  const nextDate = clean(form.get("date")) || toDateInput(new Date());
  const rawRestVarietyName = clean(form.get("restVarietyName"));
  const matchedRestVariety = rawRestVarietyName ? findVarietyByName(rawRestVarietyName) : null;
  const nextRestVarietyId = clean(form.get("restVarietyId")) || clean(matchedRestVariety?.id);
  const nextRestVarietyName = clean(matchedRestVariety?.name || rawRestVarietyName || findVariety(nextRestVarietyId)?.name);
  const offer = normalizeOffer({
    ...existing,
    id,
    title: defaultOfferTitle("rests", nextDate),
    date: nextDate,
    facebookPublishDate: nextDate,
    facebookPublishTime: "20:00",
    type: "rests",
    status: "připravená",
    note: clean(form.get("note")),
    restCustomerId: clean(form.get("restCustomerId")),
    restVarietyId: nextRestVarietyId,
    restVarietyName: nextRestVarietyName,
    items: existing?.items || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });
  if (existing) Object.assign(existing, offer);
  else state.data.offers.push(offer);
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  els.offerDialog.close();
  toast("Resty uloženy.");
};

var __akPrevCreateOrdersFromOffer = createOrdersFromOffer;
createOrdersFromOffer = async function createOrdersFromOfferOverride(id) {
  const offer = findOffer(id);
  if (!offer) return;
  if (!isRestOffer(offer)) return __akPrevCreateOrdersFromOffer(id);
  const customerId = clean(offer.restCustomerId);
  if (!customerId) {
    toast("U restů nejdřív vyber zákazníka.");
    return;
  }
  const lines = restOfferOrderLines(offer);
  const note = restOfferOrderNote(offer);
  if (!lines.length && !note) {
    toast("Rest nemá co převést do objednávky.");
    return;
  }
  if (state.data.orders.some((order) => clean(order.offerId) === clean(offer.id)) && !confirm("Z těchto restů už objednávka vznikla. Vytvořit další?")) {
    return;
  }
  const order = normalizeOrder({
    id: uid(),
    offerId: offer.id,
    customerId,
    orderDate: offer.date || toDateInput(new Date()),
    season: seasonFromDate(offer.date),
    varietiesText: lines.join("\n"),
    price: "",
    paymentStatus: "čeká",
    shippingStatus: "nová",
    deliveryMethod: "ship",
    shippingFee: "",
    shippingFeeLabel: "",
    packingFee: "",
    codFee: "",
    extraFees: [],
    note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  state.data.orders.push(order);
  saveData();
  renderAll();
  openOrderDialog(order.id);
  toast("Vytvořena objednávka z restů.");
};

var __akPrevRenderOfferDetail = renderOfferDetail;
renderOfferDetail = function renderOfferDetailOverride() {
  const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
  if (!offer || !isRestOffer(offer)) return __akPrevRenderOfferDetail();
  state.selectedOfferId = offer.id;
  const items = sortedOfferItems(offer);
  const detailCards = [
    { label: "Zákazník", value: customerName(restOfferCustomer(offer)) },
    { label: "Odrůda", value: restOfferVarietyLabel(offer) },
  ].filter((entry) => clean(entry.value));

  els.offerDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${escapeHtml(offer.title)}</h2>
        <div class="pills">
          <span class="pill warning">Resty</span>
        </div>
        <p class="fb-name">${formatDate(offer.date)}</p>
        ${detailCards.length ? `<section class="rest-meta-panel"><div class="rest-meta-grid">${detailCards.map((entry) => `<div class="rest-meta-item"><span>${escapeHtml(entry.label)}</span><strong>${escapeHtml(entry.value)}</strong></div>`).join("")}</div></section>` : ""}
        ${offer.note ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : ""}
      </div>
      <div class="detail-actions">
        <button class="button ghost" type="button" data-edit-offer="${offer.id}">Upravit resty</button>
        <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvořit objednávku</button>
      </div>
    </div>
    ${items.length ? `
      <section class="detail-section">
        <div class="stack-list">
          ${items.map((item) => renderOfferItem(offer, item)).join("")}
        </div>
      </section>
    ` : `
      <section class="detail-section">
        <p class="detail-note-text">Bez odřezků. Rest může být jen poznámka nebo připomínka.</p>
      </section>
    `}
  `;

  els.offerDetail.querySelector("[data-edit-offer]")?.addEventListener("click", () => openOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(offer.id));
  els.offerDetail.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemDialog(offer.id, button.dataset.editOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(offer.id, button.dataset.deleteOfferItem));
  });
  hydrateLocalPhotoImages(els.offerDetail);
};

function normalizeOffer(offer = {}) {
  const now = new Date().toISOString();
  const nextDate = clean(offer.date) || toDateInput(new Date());
  const nextType = normalizeOfferType(offer.type);
  const title = clean(offer.title);
  const legacyRestTitle = `Resty/poznámky ${formatDate(nextDate)}`;
  const defaultTitle = defaultOfferTitle(nextType, nextDate);
  const normalizedTitle = nextType === "rests" && title === legacyRestTitle
    ? defaultTitle
    : (title || defaultTitle);

  return {
    ...offer,
    id: clean(offer.id) || uid(),
    title: normalizedTitle,
    date: nextDate,
    facebookPublishDate: clean(offer.facebookPublishDate || offer.date) || nextDate,
    facebookPublishTime: clean(offer.facebookPublishTime) || "20:00",
    type: nextType,
    status: ["připravená", "zveřejněná", "uzavřená"].includes(clean(offer.status)) ? clean(offer.status) : "připravená",
    note: clean(offer.note),
    restCustomerId: nextType === "rests" ? clean(offer.restCustomerId) : "",
    restVarietyId: nextType === "rests" ? clean(offer.restVarietyId) : "",
    restVarietyName: nextType === "rests" ? clean(offer.restVarietyName) : "",
    items: Array.isArray(offer.items) ? offer.items.map(normalizeOfferItem) : [],
    createdAt: offer.createdAt || now,
    updatedAt: offer.updatedAt || now,
  };
}

function offerStatusClass(status) {
  if (status === "uzavřená") return "done";
  if (status === "zveřejněná") return "ready";
  return "";
}

function offerTypeLabel(offerOrType) {
  return normalizeOfferType(typeof offerOrType === "string" ? offerOrType : offerOrType?.type) === "rests"
    ? "Resty"
    : "Nabídka";
}

function defaultOfferTitle(type = "offer", date = toDateInput(new Date())) {
  return normalizeOfferType(type) === "rests"
    ? `Resty ${formatDate(date)}`
    : `Nabídka ${formatDate(date)}`;
}

function restOfferCustomer(offer = {}) {
  return findCustomer(clean(offer.restCustomerId));
}

function restOfferVarietyLabel(offer = {}) {
  const linked = findVariety(clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
  return clean(linked?.name || offer.restVarietyName);
}

function shortRestText(value = "", max = 96) {
  const text = clean(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function restOfferSummaryText(offer = {}) {
  const parts = [];
  const customer = restOfferCustomer(offer);
  const variety = restOfferVarietyLabel(offer);
  const itemLines = sortedOfferItems(offer)
    .slice(0, 2)
    .map((item) => `${offerItemNameSafe(item)} · ${quantityText(item.quantity)} ks`);

  if (customer) parts.push(customerName(customer));
  if (variety) parts.push(variety);
  else if (itemLines.length) parts.push(itemLines.join(", "));
  if (offer.note) parts.push(shortRestText(offer.note, 68));
  return parts.filter(Boolean).join(" · ");
}

function renderRestMetaPanel(offer = {}) {
  if (!isRestOffer(offer)) return "";
  const meta = [
    { label: "Zákazník", value: customerName(restOfferCustomer(offer)) },
    { label: "Odrůda", value: restOfferVarietyLabel(offer) },
  ].filter((entry) => clean(entry.value));
  if (!meta.length) return "";
  return `<section class="rest-meta-panel">
    <div class="rest-meta-grid">
      ${meta.map((entry) => `<div class="rest-meta-item"><span>${escapeHtml(entry.label)}</span><strong>${escapeHtml(entry.value)}</strong></div>`).join("")}
    </div>
  </section>`;
}

function restOffersForCustomer(customerId = "") {
  const id = clean(customerId);
  if (!id) return [];
  return (state.data.offers || [])
    .filter((offer) => isRestOffer(offer) && clean(offer.restCustomerId) === id && offer.status !== "uzavřená")
    .sort((a, b) => String(b.date || b.updatedAt || "").localeCompare(String(a.date || a.updatedAt || "")));
}

function restOfferAlertLines(offer = {}) {
  const lines = [];
  const variety = restOfferVarietyLabel(offer);
  const itemSummary = sortedOfferItems(offer)
    .slice(0, 3)
    .map((item) => `${offerItemNameSafe(item)} · ${quantityText(item.quantity)} ks`)
    .join(", ");
  if (variety) lines.push(variety);
  if (!variety && itemSummary) lines.push(itemSummary);
  if (offer.note) lines.push(shortRestText(offer.note, 90));
  return lines.length ? lines : [shortRestText(offer.title, 90)];
}

function syncOrderRestWarningBlock() {
  const block = document.querySelector("#orderRestBlock");
  const form = els.orderForm;
  if (!block || !form) return;
  const customerId = form.elements.customerId?.value;
  const offers = restOffersForCustomer(customerId);
  const stornoOrders = customerStornoOrders(customerId);
  if (!offers.length && !stornoOrders.length) {
    block.hidden = true;
    block.innerHTML = "";
    return;
  }
  block.hidden = false;
  block.innerHTML = `
    ${offers.length ? `
      <div class="order-rest-heading">
        <strong>Má resty</strong>
        <small>Zkontroluj, jestli je potřeba něco doplnit nebo připomenout.</small>
      </div>
      <div class="order-rest-list">
        ${offers.map((offer) => `
          <article class="order-rest-item">
            <strong>${escapeHtml(offer.title)}</strong>
            <small>${escapeHtml(restOfferAlertLines(offer).join(" · "))}</small>
          </article>
        `).join("")}
      </div>
    ` : ""}
    ${stornoOrders.length ? `
      <div class="order-rest-heading">
        <strong>Stornuje</strong>
        <small>Pozor, tenhle zákazník už má v historii storna.</small>
      </div>
      <div class="order-rest-list">
        ${stornoOrders.map((order) => `
          <article class="order-rest-item">
            <strong>${escapeHtml(formatDate(order.orderDate) || "Bez data")}</strong>
            <small>${escapeHtml(orderStornoLines(order).map((entry) => `${entry.name} · ${quantityText(entry.quantity)} ks`).join(" · ") || "Stornovaná objednávka")}</small>
          </article>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function renderOfferRestCustomerOptions(selectedId = "") {
  const select = els.offerForm?.elements?.restCustomerId;
  if (!select) return;
  const options = [`<option value="">Bez zákazníka</option>`]
    .concat(
      [...state.data.customers]
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }))
        .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customerName(customer))}</option>`),
    );
  select.innerHTML = options.join("");
  select.value = state.data.customers.some((customer) => customer.id === clean(selectedId)) ? clean(selectedId) : "";
}

function syncOfferRestVarietySelection() {
  const form = els.offerForm;
  if (!form) return;
  const name = clean(form.elements.restVarietyName?.value);
  const exact = name ? findVarietyByName(name) : null;
  form.elements.restVarietyId.value = exact?.id || "";
}

function syncOfferRestFieldsVisibility() {
  const form = els.offerForm;
  const block = form?.querySelector("[data-rest-offer-fields]");
  if (!form || !block) return;
  const isRest = normalizeOfferType(form.elements.type?.value) === "rests";
  block.hidden = !isRest;
  if (!isRest) {
    form.elements.restCustomerId.value = "";
    form.elements.restVarietyId.value = "";
    form.elements.restVarietyName.value = "";
  }
}

function openOfferDialog(id = null, defaults = {}) {
  const offer = id ? findOffer(id) : null;
  const initialType = offer ? normalizeOfferType(offer.type) : normalizeOfferType(defaults.type);
  const initialDate = offer?.date || clean(defaults.date) || toDateInput(new Date());
  const linkedVariety = findVariety(clean(offer?.restVarietyId)) || findVarietyByName(clean(offer?.restVarietyName));

  els.offerDialogTitle.textContent = offer
    ? (initialType === "rests" ? "Upravit resty" : "Upravit nabídku")
    : (initialType === "rests" ? "Nové resty" : "Nová nabídka");
  els.offerForm.reset();
  els.offerForm.elements.id.value = offer?.id || "";
  els.offerForm.elements.title.value = offer?.title || defaultOfferTitle(initialType, initialDate);
  els.offerForm.elements.date.value = initialDate;
  els.offerForm.elements.facebookPublishDate.value = offer?.facebookPublishDate || initialDate;
  els.offerForm.elements.facebookPublishTime.value = offer?.facebookPublishTime || "20:00";
  els.offerForm.elements.type.value = initialType;
  els.offerForm.elements.status.value = offer?.status || "připravená";
  els.offerForm.elements.note.value = offer?.note || "";
  renderOfferRestCustomerOptions(offer?.restCustomerId || defaults.restCustomerId || "");
  els.offerForm.elements.restVarietyId.value = clean(offer?.restVarietyId || linkedVariety?.id);
  els.offerForm.elements.restVarietyName.value = clean(offer?.restVarietyName || linkedVariety?.name);
  els.offerForm.elements.restVarietyName.oninput = syncOfferRestVarietySelection;
  els.offerForm.elements.restVarietyName.onchange = syncOfferRestVarietySelection;
  syncOfferStatusToggle();
  syncOfferRestFieldsVisibility();
  showDialog(els.offerDialog);
}

function saveOfferFromForm() {
  if (!els.offerForm.reportValidity()) return;
  const form = new FormData(els.offerForm);
  const id = form.get("id") || uid();
  const existing = findOffer(id);
  const now = new Date().toISOString();
  const nextDate = clean(form.get("date")) || toDateInput(new Date());
  const nextType = normalizeOfferType(form.get("type") || existing?.type);
  const sourceType = existing ? normalizeOfferType(existing.type) : nextType;
  const rawRestVarietyName = nextType === "rests" ? clean(form.get("restVarietyName")) : "";
  const matchedRestVariety = rawRestVarietyName ? findVarietyByName(rawRestVarietyName) : null;
  const nextRestVarietyId = nextType === "rests" ? clean(form.get("restVarietyId")) || clean(matchedRestVariety?.id) : "";
  const nextRestVarietyName = nextType === "rests"
    ? clean(matchedRestVariety?.name || rawRestVarietyName || findVariety(nextRestVarietyId)?.name)
    : "";
  const offer = normalizeOffer({
    ...existing,
    id,
    title: adjustedOfferTitleForType(clean(form.get("title")), sourceType, nextType, nextDate),
    date: nextDate,
    facebookPublishDate: clean(form.get("facebookPublishDate")) || nextDate,
    facebookPublishTime: clean(form.get("facebookPublishTime")) || "20:00",
    type: nextType,
    status: clean(form.get("status")) || "připravená",
    note: clean(form.get("note")),
    restCustomerId: nextType === "rests" ? clean(form.get("restCustomerId")) : "",
    restVarietyId: nextRestVarietyId,
    restVarietyName: nextRestVarietyName,
    items: existing?.items || [],
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });

  if (existing) Object.assign(existing, offer);
  else state.data.offers.push(offer);
  state.selectedOfferId = offer.id;
  saveData();
  renderAll();
  els.offerDialog.close();
  toast(nextType === "rests" ? "Resty uloženy." : "Nabídka uložena.");
}

function customerNonPaymentOrders(customerId = "") {
  return (state.data.orders || []).filter((order) => clean(order.customerId) === clean(customerId) && parsePaymentStatus(order.paymentStatus) === "nezaplaceno");
}

function customerNonPaymentMeta(customerId = "") {
  const orders = customerNonPaymentOrders(customerId)
    .slice()
    .sort((a, b) => String(b.updatedAt || b.orderDate || "").localeCompare(String(a.updatedAt || a.orderDate || "")));
  const latest = orders[0] || null;
  return {
    count: orders.length,
    latest,
    note: clean(latest?.note),
  };
}

function customerAlerts(customer, orders) {
  const alerts = [];
  const waiting = orders.filter((order) => parsePaymentStatus(order.paymentStatus) === "čeká").length;
  const overdue = orders.filter((order) => parsePaymentStatus(order.paymentStatus) === "nezaplaceno").length;
  const ready = orders.filter((order) => order.shippingStatus === "připraveno").length;
  const rests = restOffersForCustomer(customer?.id);
  const stornos = orders.filter((order) => orderHasStorno(order)).length;

  if (!customer.phone && !customer.email) alerts.push({ label: "Chybí kontakt", type: "danger" });
  if (!customerHasAddress(customer)) alerts.push({ label: "Chybí adresa", type: "warning" });
  if (hasWarningTag(customer)) alerts.push({ label: "Pozor zákazník", type: "danger" });
  if (customer.customerRating) alerts.push({ label: customerRatingLabel(customer), type: customer.customerRating.includes("neposílat") ? "danger" : "warning" });
  if (overdue) alerts.push({ label: overdue === 1 ? "Neplatí" : `Neplatí (${overdue})`, type: "danger" });
  if (waiting) alerts.push({ label: `${waiting} čeká na platbu`, type: "warning" });
  if (ready) alerts.push({ label: `${ready} připraveno`, type: "info" });
  if (rests.length) alerts.push({ label: rests.length === 1 ? "Má resty" : `Má resty (${rests.length})`, type: "danger" });
  if (stornos) alerts.push({ label: stornos === 1 ? "Stornuje" : `Stornuje (${stornos})`, type: "danger" });
  return alerts;
}

function renderOffers() {
  const offers = filteredOffers();
  if (!state.selectedOfferId && offers[0]) state.selectedOfferId = offers[0].id;
  if (state.selectedOfferId && !offers.some((offer) => offer.id === state.selectedOfferId)) {
    state.selectedOfferId = offers[0]?.id || null;
  }

  const groups = splitOffersByType(offers);
  const renderOfferRows = (items, heading) => {
    if (!items.length) return "";
    return `
      <tr class="table-section-row"><td colspan="5">${escapeHtml(heading)}</td></tr>
      ${items.map((offer) => {
        const confirmed = offerConfirmedCount(offer);
        const alternates = offerAlternateCount(offer);
        const available = offerAvailableCount(offer);
        const itemCount = Array.isArray(offer.items) ? offer.items.length : 0;
        const restSummary = isRestOffer(offer) ? restOfferSummaryText(offer) : "";
        const notePreview = isRestOffer(offer) && clean(offer.note) ? `<small>${escapeHtml(shortRestText(offer.note, 88))}</small>` : "";
        const metaLine = [formatDate(offer.date), offerTypeLabel(offer), restSummary].filter(Boolean).join(" · ");
        const statLine = [`Volné ${available}`, alternates ? `Náhradníci ${alternates}` : ""].filter(Boolean).join(" · ");
        return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
          <td class="offer-main-cell">
            <div class="offer-mobile-card">
              <strong>${escapeHtml(offer.title)}</strong>
              <small>${escapeHtml(metaLine)}</small>
              ${isRestOffer(offer) ? '<span class="pill warning">Resty</span>' : ""}
              <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
              ${notePreview}
              <div class="offer-mobile-stats">
                <span><small>Položky</small><b>${itemCount}</b></span>
                <span><small>Volné</small><b>${available}</b></span>
                <span><small>Rezervace</small><b>${confirmed}</b></span>
              </div>
            </div>
            <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)}${isRestOffer(offer) ? ' <span class="pill warning">Resty</span>' : ""}</span>
            <span class="cell-sub offer-desktop-sub">${escapeHtml(metaLine)}</span>
            ${notePreview}
          </td>
          <td><span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span></td>
          <td>${itemCount}</td>
          <td>
            <span class="cell-main">${confirmed}</span>
            <span class="cell-sub">${escapeHtml(statLine)}</span>
          </td>
          <td>
            <span class="row-actions">
              <button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">✎</button>
              <button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">×</button>
            </span>
          </td>
        </tr>`;
      }).join("")}
    `;
  };

  els.offersTable.innerHTML = offers.length
    ? [
        renderOfferRows(groups.offers, "Nabídky"),
        renderOfferRows(groups.rests, "Resty"),
      ].filter(Boolean).join("")
    : `<tr><td colspan="5">${emptyState("Žádná nabídka.")}</td></tr>`;

  els.offersTable.querySelectorAll("[data-offer-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.selectedOfferId = row.dataset.offerRow;
      renderOffers();
    });
  });
  els.offersTable.querySelectorAll("[data-edit-offer]").forEach((button) => {
    button.addEventListener("click", () => openOfferDialog(button.dataset.editOffer));
  });
  els.offersTable.querySelectorAll("[data-delete-offer]").forEach((button) => {
    button.addEventListener("click", () => deleteOffer(button.dataset.deleteOffer));
  });
  renderOfferDetail();
}

function renderOfferDetail() {
  const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
  if (!offer) {
    els.offerDetail.innerHTML = emptyState("Vyber nabídku nebo založ novou.");
    return;
  }
  state.selectedOfferId = offer.id;
  const items = sortedOfferItems(offer);
  const editLabel = isRestOffer(offer) ? "Upravit resty" : "Upravit nabídku";
  const moveLeftoversButton = !isRestOffer(offer)
    ? `<button class="button ghost" type="button" data-move-offer-leftovers="${offer.id}">Přesunout neprodané do nové nabídky</button>`
    : "";
  const facebookButtons = !isRestOffer(offer)
    ? `
        <button class="button ghost" type="button" data-facebook-offer="${offer.id}">Facebook</button>
      `
    : "";

  els.offerDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${escapeHtml(offer.title)}</h2>
        <div class="pills">
          <span class="pill ${isRestOffer(offer) ? "warning" : ""}">${escapeHtml(offerTypeLabel(offer))}</span>
          <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
        </div>
        <p class="fb-name">${formatDate(offer.date)}</p>
        ${renderRestMetaPanel(offer)}
        ${offer.note ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : ""}
      </div>
      <div class="detail-actions">
        <button class="button ghost" type="button" data-edit-offer="${offer.id}">${editLabel}</button>
        ${moveLeftoversButton}
        <button class="button primary" type="button" data-add-offer-item="${offer.id}">Přidat odřezek</button>
        ${facebookButtons}
        <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvořit objednávky</button>
      </div>
    </div>
    <section class="detail-section">
      <div class="history-summary">
        <article><span>Položky</span><strong>${items.length}</strong></article>
        <article><span>Potvrzeno</span><strong>${offerConfirmedCount(offer)}</strong></article>
        <article><span>Náhradníci</span><strong>${offerAlternateCount(offer)}</strong></article>
        <article><span>Hodnota</span><strong>${escapeHtml(offerTotalText(offer))}</strong></article>
      </div>
    </section>
    <section class="detail-section">
      <div class="stack-list">
        ${items.length ? items.map((item) => renderOfferItem(offer, item)).join("") : emptyState("Zatím bez odřezků.")}
      </div>
    </section>
  `;

  els.offerDetail.querySelector("[data-edit-offer]")?.addEventListener("click", () => openOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-move-offer-leftovers]")?.addEventListener("click", () => {
    moveOfferLeftoversToNewOffer(offer.id);
  });
  els.offerDetail.querySelector("[data-add-offer-item]")?.addEventListener("click", () => openOfferItemDialog(offer.id));
  els.offerDetail.querySelector("[data-facebook-offer]")?.addEventListener("click", () => openFacebookOfferDialog(offer.id));
  els.offerDetail.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(offer.id));
  els.offerDetail.querySelectorAll("[data-edit-offer-item]").forEach((button) => {
    button.addEventListener("click", () => openOfferItemDialog(offer.id, button.dataset.editOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-delete-offer-item]").forEach((button) => {
    button.addEventListener("click", () => deleteOfferItem(offer.id, button.dataset.deleteOfferItem));
  });
  els.offerDetail.querySelectorAll("[data-add-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationDialog(offer.id, button.dataset.addReservation, null, {
      status: button.dataset.addReservationStatus || "",
    }));
  });
  els.offerDetail.querySelectorAll("[data-edit-reservation]").forEach((button) => {
    button.addEventListener("click", () => openReservationDialog(offer.id, button.dataset.itemId, button.dataset.editReservation));
  });
  els.offerDetail.querySelectorAll("[data-delete-reservation]").forEach((button) => {
    button.addEventListener("click", () => deleteReservation(offer.id, button.dataset.itemId, button.dataset.deleteReservation));
  });
  hydrateLocalPhotoImages(els.offerDetail);
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
    const linked = findVariety(clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function eofRestCustomer(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez z\u00e1kazn\u00edka";
  }

  function eofRestOptions(selectedId = "") {
    return [`<option value="">Bez z\u00e1kazn\u00edka</option>`].concat(
      [...state.data.customers]
        .sort((a, b) => customerName(a).localeCompare(customerName(b), "cs", { sensitivity: "base" }))
        .map((customer) => `<option value="${escapeHtml(customer.id)}" ${clean(selectedId) === clean(customer.id) ? "selected" : ""}>${escapeHtml(customerName(customer))}</option>`)
    ).join("");
  }

  const baseOpenOfferDialog = openOfferDialog;
  const baseSaveOfferFromForm = saveOfferFromForm;
  const baseRenderOfferDetail = renderOfferDetail;

  isRestOffer = function isRestOfferEof(offer) {
    return normalizeOfferType(offer?.type) === "rests" || eofLegacyRest(offer);
  };

  offerTypeLabel = function offerTypeLabelEof(offerOrType) {
    if (typeof offerOrType === "string") return normalizeOfferType(offerOrType) === "rests" ? "Resty" : "Nab\u00eddka";
    return isRestOffer(offerOrType) ? "Resty" : "Nab\u00eddka";
  };

  restOfferVarietyLabel = function restOfferVarietyLabelEof(offer = {}) {
    return eofRestNames(offer).join(", ");
  };

  restOfferSummaryText = function restOfferSummaryTextEof(offer = {}) {
    return [eofRestCustomer(offer), restOfferVarietyLabel(offer)].filter(Boolean).join(" \u00b7 ");
  };

  renderRestMetaPanel = function renderRestMetaPanelEof(offer = {}) {
    if (!isRestOffer(offer)) return "";
    const names = eofRestNames(offer);
    const meta = [
      { label: "Z\u00e1kazn\u00edk", value: eofRestCustomer(offer) },
      { label: names.length > 1 ? "Odr\u016fdy" : "Odr\u016fda", value: names.join(", ") },
    ].filter((entry) => clean(entry.value));
    if (!meta.length) return "";
    return `<section class="rest-meta-panel"><div class="rest-meta-grid">${meta.map((entry) => `<div class="rest-meta-item"><span>${escapeHtml(entry.label)}</span><strong>${escapeHtml(entry.value)}</strong></div>`).join("")}</div></section>`;
  };

  syncOfferRestFieldsVisibility = function syncOfferRestFieldsVisibilityEof() {
    const form = els.offerForm;
    if (!form) return;
    const isRest = isRestOffer({ type: form.elements.type?.value, title: form.elements.title?.value, note: form.elements.note?.value });
    const nodes = [
      form.elements.title?.closest("label"),
      form.elements.facebookPublishDate?.closest("label"),
      form.elements.facebookPublishTime?.closest("label"),
      form.querySelector(".offer-status-field"),
      form.querySelector(".form-divider"),
    ];
    nodes.forEach((node) => {
      if (!node) return;
      node.hidden = false;
      node.style.display = isRest ? "none" : "";
    });
    const restBlock = form.querySelector("[data-rest-offer-fields]");
    if (restBlock) {
      restBlock.hidden = !isRest;
      restBlock.style.display = isRest ? "" : "none";
    }
    if (isRest) {
      const nextDate = clean(form.elements.date?.value) || toDateInput(new Date());
      form.elements.title.value = defaultOfferTitle("rests", nextDate);
      form.elements.facebookPublishDate.value = nextDate;
      form.elements.facebookPublishTime.value = "20:00";
      form.elements.status.value = "p\u0159ipraven\u00e1";
      setupRestVarietyPickerForOfferForm(form, form.elements.restVarietyName?.value || "");
    }
  };

  function setupRestSelectPicker(form, initialValue = "") {
    if (!form) return;
    const label = form.querySelector('[name="restVarietyName"]')?.closest("label");
    if (!label) return;
    let hidden = form.querySelector('textarea[name="restVarietyName"]');
    if (!hidden) {
      hidden = document.createElement("textarea");
      hidden.name = "restVarietyName";
      hidden.hidden = true;
      hidden.setAttribute("aria-hidden", "true");
      label.after(hidden);
    }
    let picker = form.querySelector('[name="restVarietyPicker"]');
    if (!picker || picker.tagName !== "SELECT") {
      const source = label.querySelector('[name="restVarietyName"], [name="restVarietyPicker"]');
      const select = document.createElement("select");
      select.name = "restVarietyPicker";
      source?.replaceWith(select);
      picker = select;
      const heading = label.querySelector("span");
      if (heading) heading.textContent = "Odrůda";
    }
    let addRow = form.querySelector(".rest-variety-picker-row");
    if (!addRow) {
      addRow = document.createElement("div");
      addRow.className = "wide rest-variety-picker-row";
      addRow.innerHTML = '<button class="button ghost" type="button" data-rest-variety-add>Přidat odrůdu</button>';
      label.after(addRow);
    }
    let list = form.querySelector("[data-rest-variety-list]");
    if (!list) {
      list = document.createElement("div");
      list.className = "wide rest-variety-selection";
      list.setAttribute("data-rest-variety-list", "");
      addRow.after(list);
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
      picker.innerHTML = ['<option value="">Vyber odrůdu</option>']
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
    addRow.querySelector("[data-rest-variety-add]").onclick = addCurrent;
    list.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-remove]");
      if (!button) return;
      form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
      sync();
    };
    sync();
  }
  setupRestVarietyPickerForOfferForm = setupRestSelectPicker;

  openOfferDialog = function openOfferDialogEof(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const initialIsRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults.type) === "rests";
    if (!initialIsRest) return baseOpenOfferDialog(id, defaults);
    const form = els.offerForm;
    const initialDate = clean(offer?.date || defaults.date) || toDateInput(new Date());
    const names = eofRestNames(offer);
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    els.offerDialogTitle.textContent = offer ? "Upravit resty" : "Nov\u00e9 resty";
    form.reset();
    form.elements.id.value = offer?.id || "";
    form.elements.type.value = "rests";
    form.elements.title.value = defaultOfferTitle("rests", initialDate);
    form.elements.date.value = initialDate;
    form.elements.facebookPublishDate.value = initialDate;
    form.elements.facebookPublishTime.value = "20:00";
    form.elements.status.value = "p\u0159ipraven\u00e1";
    form.elements.note.value = offer?.note || "";
    form.elements.restCustomerId.innerHTML = eofRestOptions(offer?.restCustomerId || defaults.restCustomerId || "");
    form.elements.restCustomerId.value = clean(offer?.restCustomerId || defaults.restCustomerId);
    form.elements.restVarietyId.value = clean(matchedVariety?.id || offer?.restVarietyId);
    form.elements.restVarietyName.value = names.join("\n");
    syncOfferStatusToggle();
    setupRestSelectPicker(form, names.join("\n"));
    syncOfferRestFieldsVisibility();
    const onDateChange = () => syncOfferRestFieldsVisibility();
    form.elements.date.oninput = onDateChange;
    form.elements.date.onchange = onDateChange;
    showDialog(els.offerDialog);
  };

  saveOfferFromForm = function saveOfferFromFormEof() {
    const formEl = els.offerForm;
    const shouldSaveAsRest = isRestOffer({
      type: formEl?.elements?.type?.value,
      title: formEl?.elements?.title?.value,
      restCustomerId: formEl?.elements?.restCustomerId?.value,
      restVarietyName: formEl?.elements?.restVarietyName?.value,
      note: formEl?.elements?.note?.value,
    });
    if (!shouldSaveAsRest) return baseSaveOfferFromForm();
    if (!formEl.reportValidity()) return;
    const form = new FormData(formEl);
    const id = form.get("id") || uid();
    const existing = findOffer(id);
    const now = new Date().toISOString();
    const nextDate = clean(form.get("date")) || toDateInput(new Date());
    const names = restFormVarietyNames(form.get("restVarietyName"));
    const matchedVariety = names.length === 1 ? findVarietyByName(names[0]) : null;
    const offer = normalizeOffer({
      ...existing,
      id,
      title: defaultOfferTitle("rests", nextDate),
      date: nextDate,
      facebookPublishDate: nextDate,
      facebookPublishTime: "20:00",
      type: "rests",
      status: "p\u0159ipraven\u00e1",
      note: clean(form.get("note")),
      restCustomerId: clean(form.get("restCustomerId")),
      restVarietyId: clean(matchedVariety?.id),
      restVarietyName: names.join("\n"),
      items: existing?.items || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, offer);
    else state.data.offers.push(offer);
    state.selectedOfferId = offer.id;
    saveData();
    renderAll();
    els.offerDialog.close();
    toast("Resty ulo\u017eeny.");
  };

  renderOffers = function renderOffersEof() {
    const offers = filteredOffers();
    if (!state.selectedOfferId && offers[0]) state.selectedOfferId = offers[0].id;
    if (state.selectedOfferId && !offers.some((offer) => offer.id === state.selectedOfferId)) {
      state.selectedOfferId = offers[0]?.id || null;
    }
    const groups = splitOffersByType(offers);
    const renderOfferRows = (items, heading, isRestGroup = false) => {
      if (!items.length) return "";
      return `
        <tr class="table-section-row"><td colspan="5">${escapeHtml(heading)}</td></tr>
        ${items.map((offer) => {
          if (isRestGroup) {
            const names = eofRestNames(offer);
            const customerText = eofRestCustomer(offer);
            const restLabel = names.length ? shortRestText(names.join(", "), 72) : "";
            const notePreview = clean(offer.note) ? `<small>${escapeHtml(shortRestText(offer.note, 88))}</small>` : "";
            return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
              <td class="offer-main-cell">
                <div class="offer-mobile-card">
                  <strong>${escapeHtml(offer.title)}</strong>
                  <small>${escapeHtml([formatDate(offer.date), customerText].join(" \u00b7 "))}</small>
                  <span class="pill warning">Resty</span>
                  ${restLabel ? `<small>${escapeHtml(restLabel)}</small>` : ""}
                  ${notePreview}
                </div>
                <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)} <span class="pill warning">Resty</span></span>
                <span class="cell-sub offer-desktop-sub">${escapeHtml([formatDate(offer.date), customerText].join(" \u00b7 "))}</span>
                ${restLabel ? `<span class="cell-sub">${escapeHtml(restLabel)}</span>` : ""}
                ${notePreview}
              </td>
              <td><span class="cell-sub">-</span></td>
              <td><span class="cell-main">${names.length || "\u2014"}</span>${names.length ? `<span class="cell-sub">odrůd</span>` : ""}</td>
              <td><span class="cell-main">${escapeHtml(customerText)}</span><span class="cell-sub">${escapeHtml(clean(offer.note) ? shortRestText(offer.note, 48) : "Bez rezervac\u00ed")}</span></td>
              <td><span class="row-actions"><button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">\u270e</button><button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">\u00d7</button></span></td>
            </tr>`;
          }

          const confirmed = offerConfirmedCount(offer);
          const alternates = offerAlternateCount(offer);
          const available = offerAvailableCount(offer);
          const itemCount = Array.isArray(offer.items) ? offer.items.length : 0;
          const metaLine = [formatDate(offer.date), offerTypeLabel(offer)].filter(Boolean).join(" \u00b7 ");
          const statLine = [`Voln\u00e9 ${available}`, alternates ? `N\u00e1hradn\u00edci ${alternates}` : ""].filter(Boolean).join(" \u00b7 ");
          return `<tr class="${offer.id === state.selectedOfferId ? "selected" : ""}" data-offer-row="${offer.id}">
            <td class="offer-main-cell">
              <div class="offer-mobile-card">
                <strong>${escapeHtml(offer.title)}</strong>
                <small>${escapeHtml(metaLine)}</small>
                <span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span>
                <div class="offer-mobile-stats">
                  <span><small>Polo\u017eky</small><b>${itemCount}</b></span>
                  <span><small>Voln\u00e9</small><b>${available}</b></span>
                  <span><small>Rezervace</small><b>${confirmed}</b></span>
                </div>
              </div>
              <span class="cell-main offer-desktop-main">${escapeHtml(offer.title)}</span>
              <span class="cell-sub offer-desktop-sub">${escapeHtml(metaLine)}</span>
            </td>
            <td><span class="pill ${offerStatusClass(offer.status)}">${escapeHtml(offer.status)}</span></td>
            <td>${itemCount}</td>
            <td><span class="cell-main">${confirmed}</span><span class="cell-sub">${escapeHtml(statLine)}</span></td>
            <td><span class="row-actions"><button class="mini-button" type="button" title="Upravit" data-edit-offer="${offer.id}">\u270e</button><button class="mini-button" type="button" title="Smazat" data-delete-offer="${offer.id}">\u00d7</button></span></td>
          </tr>`;
        }).join("")}
      `;
    };
    els.offersTable.innerHTML = offers.length
      ? [renderOfferRows(groups.offers, "Nab\u00eddky"), renderOfferRows(groups.rests, "Resty", true)].filter(Boolean).join("")
      : `<tr><td colspan="5">${emptyState("\u017d\u00e1dn\u00e1 nab\u00eddka.")}</td></tr>`;
    els.offersTable.querySelectorAll("[data-offer-row]").forEach((row) => {
      row.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        state.selectedOfferId = row.dataset.offerRow;
        renderOffers();
      });
    });
    els.offersTable.querySelectorAll("[data-edit-offer]").forEach((button) => {
      button.addEventListener("click", () => openOfferDialog(button.dataset.editOffer));
    });
    els.offersTable.querySelectorAll("[data-delete-offer]").forEach((button) => {
      button.addEventListener("click", () => deleteOffer(button.dataset.deleteOffer));
    });
    renderOfferDetail();
  };

  renderOfferDetail = function renderOfferDetailEof() {
    const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
    if (!offer || !isRestOffer(offer)) return baseRenderOfferDetail();
    state.selectedOfferId = offer.id;
    const names = eofRestNames(offer);
    els.offerDetail.innerHTML = `
      <div class="detail-header">
        <div>
          <h2>${escapeHtml(offer.title)}</h2>
          <div class="pills"><span class="pill warning">Resty</span></div>
          <p class="fb-name">${formatDate(offer.date)}</p>
          ${renderRestMetaPanel(offer)}
          ${names.length ? `<div class="pills">${names.map((name) => `<span class="pill">${escapeHtml(name)}</span>`).join("")}</div>` : ""}
          ${clean(offer.note) ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : `<p class="detail-note-text">Bez pozn\u00e1mky.</p>`}
        </div>
        <div class="detail-actions">
          <button class="button ghost" type="button" data-edit-offer="${offer.id}">Upravit resty</button>
          <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvo\u0159it objedn\u00e1vku</button>
        </div>
      </div>
    `;
    els.offerDetail.querySelector("[data-edit-offer]")?.addEventListener("click", () => openOfferDialog(offer.id));
    els.offerDetail.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(offer.id));
  };

  const bindRestCreateButtons = () => {
    [document.querySelector("#addRestOfferTopBtn"), document.querySelector("#addRestOfferBtn")].forEach((button) => {
      if (!button) return;
      button.onclick = (event) => {
        event.preventDefault();
        openOfferDialog(null, { type: "rests" });
      };
    });
  };

  bindRestCreateButtons();
})();
(() => {
  const previousRenderOfferDetail = renderOfferDetail;

  function finalRestNames(offer = {}) {
    const names = restFormVarietyNames(offer.restVarietyName);
    if (names.length) return names;
    const linked = findVariety(clean(offer.restVarietyId)) || findVarietyByName(clean(offer.restVarietyName));
    return clean(linked?.name || offer.restVarietyName) ? [clean(linked?.name || offer.restVarietyName)] : [];
  }

  function finalRestCustomerText(offer = {}) {
    return customerName(findCustomer(clean(offer.restCustomerId))) || "Bez zákazníka";
  }

  ensureRestVarietyPickerScaffold = function ensureRestVarietyPickerScaffoldFinal(form) {
    if (!form) return null;
    let picker = form.elements.restVarietyPicker || form.querySelector('[name="restVarietyPicker"]');
    let hidden = form.querySelector('textarea[name="restVarietyName"]');
    let list = form.querySelector("[data-rest-variety-list]");
    let addButton = form.querySelector("[data-rest-variety-add]");
    if (!picker || picker.tagName !== "SELECT") {
      const original = picker || form.querySelector('[name="restVarietyName"]');
      if (!original) return null;
      const label = original.closest("label");
      const heading = label?.querySelector("span");
      if (heading) heading.textContent = "Odrůda";
      const select = document.createElement("select");
      select.name = "restVarietyPicker";
      original.replaceWith(select);
      picker = select;
      if (!hidden) {
        hidden = document.createElement("textarea");
        hidden.name = "restVarietyName";
        hidden.hidden = true;
        hidden.setAttribute("aria-hidden", "true");
        label?.after(hidden);
      }
      if (!addButton) {
        const actions = document.createElement("div");
        actions.className = "wide rest-variety-picker-row";
        actions.innerHTML = '<button class="button ghost" type="button" data-rest-variety-add>Přidat odrůdu</button>';
        hidden.after(actions);
        addButton = actions.querySelector("[data-rest-variety-add]");
      }
      if (!list) {
        list = document.createElement("div");
        list.className = "wide rest-variety-selection";
        list.setAttribute("data-rest-variety-list", "");
        addButton.closest(".rest-variety-picker-row")?.after(list);
      }
    }
    return { picker, hidden, list, addButton };
  };

  renderRestVarietySelection = function renderRestVarietySelectionFinal(container, names = []) {
    if (!container) return;
    container.innerHTML = names.length
      ? names.map((name, index) => `<button class="rest-variety-chip" type="button" data-rest-variety-remove="${index}">${escapeHtml(name)} <span>×</span></button>`).join("")
      : '<div class="rest-variety-empty">Zatím bez odrůd.</div>';
  };

  setupRestVarietyPickerForOfferForm = function setupRestVarietyPickerForOfferFormFinal(form, initialValue = "") {
    const scaffold = ensureRestVarietyPickerScaffold(form);
    if (!scaffold) return;
    form.__restVarietyNames = restFormVarietyNames(initialValue || scaffold.hidden?.value);
    const renderPickerOptions = () => {
      const selected = new Set(form.__restVarietyNames.map((name) => normalize(name)));
      const previousValue = clean(scaffold.picker.value);
      const options = [...(state.data.varieties || [])]
        .map((variety) => clean(variety.name))
        .filter(Boolean)
        .filter((name) => !selected.has(normalize(name)))
        .sort((a, b) => a.localeCompare(b, "cs", { sensitivity: "base" }));
      scaffold.picker.innerHTML = ['<option value="">Vyber odrůdu</option>']
        .concat(options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`))
        .join("");
      if (options.some((name) => name === previousValue)) scaffold.picker.value = previousValue;
    };
    const sync = () => {
      scaffold.hidden.value = form.__restVarietyNames.join("\n");
      renderRestVarietySelection(scaffold.list, form.__restVarietyNames);
      renderPickerOptions();
    };
    const addCurrent = () => {
      const raw = clean(scaffold.picker.value);
      if (!raw) return;
      const exact = findVarietyByName(raw);
      const nextName = clean(exact?.name || raw);
      if (!form.__restVarietyNames.some((name) => normalize(name) === normalize(nextName))) {
        form.__restVarietyNames.push(nextName);
      }
      scaffold.picker.value = "";
      sync();
      scaffold.picker.focus();
    };
    scaffold.addButton.onclick = addCurrent;
    scaffold.list.onclick = (event) => {
      const button = event.target.closest("[data-rest-variety-remove]");
      if (!button) return;
      form.__restVarietyNames.splice(Number(button.dataset.restVarietyRemove), 1);
      sync();
    };
    sync();
  };

  renderOfferDetail = function renderOfferDetailNoDuplicateRest() {
    const offer = findOffer(state.selectedOfferId) || filteredOffers()[0];
    if (!offer || !isRestOffer(offer)) return previousRenderOfferDetail();
    state.selectedOfferId = offer.id;
    els.offerDetail.innerHTML = `
      <div class="detail-header">
        <div>
          <h2>${escapeHtml(offer.title)}</h2>
          <div class="pills"><span class="pill warning">Resty</span></div>
          <p class="fb-name">${formatDate(offer.date)}</p>
          ${renderRestMetaPanel(offer)}
          ${clean(offer.note) ? `<p class="detail-note-text">${escapeHtml(offer.note)}</p>` : `<p class="detail-note-text">Bez poznámky.</p>`}
        </div>
        <div class="detail-actions">
          <button class="button ghost" type="button" data-edit-offer="${offer.id}">Upravit resty</button>
          <button class="button ghost" type="button" data-create-offer-orders="${offer.id}">Vytvořit objednávku</button>
        </div>
      </div>
    `;
    els.offerDetail.querySelector("[data-edit-offer]")?.addEventListener("click", () => openOfferDialog(offer.id));
    els.offerDetail.querySelector("[data-create-offer-orders]")?.addEventListener("click", () => createOrdersFromOffer(offer.id));
  };

  [document.querySelector("#addRestOfferTopBtn"), document.querySelector("#addRestOfferBtn")].forEach((button) => {
    if (!button) return;
    button.onclick = (event) => {
      event.preventDefault();
      openOfferDialog(null, { type: "rests" });
    };
  });
})();
(() => {
  function setImportantDisplay(node, value) {
    if (!node) return;
    node.style.setProperty("display", value, "important");
  }

  function setImportantGridColumn(node, value) {
    if (!node) return;
    node.style.setProperty("grid-column", value, "important");
  }

  function normalizeDesktopRestDialogLayout() {
    const form = els.offerForm;
    if (!form) return;
    const isRest = normalizeOfferType(form.elements.type?.value) === "rests" || form.dataset.restMode === "true";
    if (!isRest) return;

    const titleField = form.elements.title?.closest("label");
    const dateField = form.elements.date?.closest("label");
    const facebookDateField = form.elements.facebookPublishDate?.closest("label");
    const facebookTimeField = form.elements.facebookPublishTime?.closest("label");
    const statusField = form.querySelector(".offer-status-field");
    const divider = form.querySelector(".form-divider");
    const noteField = form.elements.note?.closest("label");
    const restGrid = form.querySelector("[data-rest-offer-fields]");
    const restCustomerField = form.elements.restCustomerId?.closest("label");
    const restVarietyField = form.querySelector('[name="restVarietyPicker"]')?.closest("label")
      || form.querySelector('[name="restVarietyName"]')?.closest("label");
    const addRow = form.querySelector(".rest-variety-picker-row");
    const list = form.querySelector("[data-rest-variety-list]");

    form.dataset.restMode = "true";
    form.style.setProperty("grid-template-columns", "minmax(0, 1fr)", "important");

    [titleField, facebookDateField, facebookTimeField, statusField, divider].forEach((node) => {
      if (!node) return;
      node.hidden = true;
      setImportantDisplay(node, "none");
    });

    if (restGrid) {
      restGrid.hidden = false;
      restGrid.style.setProperty("display", "grid", "important");
      restGrid.style.setProperty("grid-template-columns", "minmax(0, 1fr)", "important");
      setImportantGridColumn(restGrid, "1 / -1");
    }

    [dateField, restCustomerField, restVarietyField, noteField, addRow, list].forEach((node) => {
      if (!node) return;
      node.hidden = false;
      node.style.removeProperty("display");
      setImportantGridColumn(node, "1 / -1");
    });

    if (restCustomerField) {
      const label = restCustomerField.querySelector("span");
      if (label) label.textContent = "Zákazník";
    }
    if (restVarietyField) {
      const label = restVarietyField.querySelector("span");
      if (label) label.textContent = "Odrůdy";
    }
  }

  function forceDesktopRestDialogLayout() {
    normalizeDesktopRestDialogLayout();
    setTimeout(normalizeDesktopRestDialogLayout, 0);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        normalizeDesktopRestDialogLayout();
        requestAnimationFrame(normalizeDesktopRestDialogLayout);
      });
    }
  }

  const previousOpenOfferDialogEofFinal = openOfferDialog;
  openOfferDialog = function openOfferDialogDesktopRestFinal(id = null, defaults = {}) {
    const offer = id ? findOffer(id) : null;
    const isRest = offer ? isRestOffer(offer) : normalizeOfferType(defaults?.type) === "rests";
    const result = previousOpenOfferDialogEofFinal(id, defaults);
    if (isRest) forceDesktopRestDialogLayout();
    return result;
  };

  if (typeof window.openDesktopRestOfferDialog === "function") {
    const previousDesktopRestOpen = window.openDesktopRestOfferDialog;
    window.openDesktopRestOfferDialog = function openDesktopRestOfferDialogReallyFinal(...args) {
      const result = previousDesktopRestOpen(...args);
      forceDesktopRestDialogLayout();
      return result;
    };
  }

  [document.querySelector("#addRestOfferTopBtn"), document.querySelector("#addRestOfferBtn")].forEach((button) => {
    if (!button) return;
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openOfferDialog(null, { type: "rests" });
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
    if (typeof invalidateDerivedCache === "function") invalidateDerivedCache();
  }

  const rerender = () => {
    if (typeof renderAll === "function") renderAll();
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
