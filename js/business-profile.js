/* Growth Hub — shared business profile (schema v1)
 *
 * One localStorage key every Growth Kit product reads and writes, so the user
 * fills in business details ONCE instead of re-typing them in every product.
 *
 * Key:    "growthhub.businessProfile"
 * Stored: { version: 1, updatedAt: "<iso>", profile: { ... } }
 *
 * Fields: businessName, trade, phone, socialHandle, cta, brandSafetyWords[]
 *
 * The hub page (index.html) is the canonical editor. Member products should
 * copy this file (or the snippet in the hub README) and:
 *   1. prefill their business fields from getBusinessProfile() on load,
 *   2. write back with setBusinessProfile(patch) when the user edits them.
 *
 * Node-safe: in a browser it uses real localStorage; in node (tests) it falls
 * back to an in-memory store so the same module runs in the test suite.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.GrowthHubProfile = factory();
  }
}(typeof self !== "undefined" ? self : this, function () {

  var STORAGE_KEY = "growthhub.businessProfile";
  var SCHEMA_VERSION = 1;

  /* Field metadata — the hub page builds its editor from this. */
  var FIELDS = [
    { key: "businessName",     label: "Business name",          type: "text",  placeholder: "e.g. Riverbend Roofing" },
    { key: "trade",            label: "Trade / industry",       type: "text",  placeholder: "e.g. Roofing contractor" },
    { key: "phone",            label: "Phone",                  type: "tel",   placeholder: "(555) 123-4567" },
    { key: "socialHandle",     label: "Social handle",          type: "text",  placeholder: "@riverbendroofing" },
    { key: "cta",              label: "Primary call to action", type: "text",  placeholder: "e.g. Book a free estimate" },
    { key: "brandSafetyWords", label: "Brand-safety words",     type: "words", placeholder: "Words to avoid in generated copy — one per line or comma-separated" }
  ];

  function defaultProfile() {
    return {
      businessName: "",
      trade: "",
      phone: "",
      socialHandle: "",
      cta: "",
      brandSafetyWords: []
    };
  }

  /* --- storage ------------------------------------------------------------ */
  var memStore = null;
  function store() {
    try {
      if (typeof localStorage !== "undefined" && localStorage) return localStorage;
    } catch (e) { /* blocked (private mode etc.) -> fall through to memory */ }
    if (!memStore) {
      var data = {};
      memStore = {
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
        setItem: function (k, v) { data[k] = String(v); },
        removeItem: function (k) { delete data[k]; }
      };
    }
    return memStore;
  }

  function readRaw() {
    try {
      var raw = store().getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.profile || typeof parsed.profile !== "object") return null;
      return parsed.profile;
    } catch (e) {
      return null; /* corrupted value -> treat as empty; never crash a product */
    }
  }

  /* Accept an array or a comma/newline/semicolon-separated string;
   * return a de-duplicated array of trimmed, non-empty words. */
  function sanitizeWords(value) {
    var parts = Array.isArray(value)
      ? value
      : String(value == null ? "" : value).split(/[\n,;]+/);
    var seen = {};
    var out = [];
    parts.forEach(function (w) {
      var word = String(w).trim();
      var lower = word.toLowerCase();
      if (word && !seen[lower]) { seen[lower] = 1; out.push(word); }
    });
    return out;
  }

  function sanitizeProfile(raw) {
    var clean = defaultProfile();
    if (!raw || typeof raw !== "object") return clean;
    ["businessName", "trade", "phone", "socialHandle", "cta"].forEach(function (k) {
      clean[k] = (raw[k] == null ? "" : String(raw[k])).trim().slice(0, 200);
    });
    clean.brandSafetyWords = sanitizeWords(raw.brandSafetyWords).slice(0, 100);
    return clean;
  }

  function getBusinessProfile() {
    return sanitizeProfile(readRaw());
  }

  function setBusinessProfile(patch) {
    var merged = {};
    var current = readRaw() || {};
    Object.keys(current).forEach(function (k) { merged[k] = current[k]; });
    Object.keys(patch || {}).forEach(function (k) { merged[k] = patch[k]; });
    var next = sanitizeProfile(merged);
    try {
      store().setItem(STORAGE_KEY, JSON.stringify({
        version: SCHEMA_VERSION,
        updatedAt: new Date().toISOString(),
        profile: next
      }));
    } catch (e) { /* storage full/blocked: caller still gets the clean profile */ }
    return next;
  }

  function clearBusinessProfile() {
    try { store().removeItem(STORAGE_KEY); } catch (e) {}
    return defaultProfile();
  }

  function hasBusinessProfile(profile) {
    var p = profile || getBusinessProfile();
    if (p.brandSafetyWords.length > 0) return true;
    return ["businessName", "trade", "phone", "socialHandle", "cta"]
      .some(function (k) { return !!p[k]; });
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    SCHEMA_VERSION: SCHEMA_VERSION,
    FIELDS: FIELDS,
    defaultProfile: defaultProfile,
    getBusinessProfile: getBusinessProfile,
    setBusinessProfile: setBusinessProfile,
    clearBusinessProfile: clearBusinessProfile,
    hasBusinessProfile: hasBusinessProfile,
    parseWords: sanitizeWords,
    formatWords: function (words) { return sanitizeWords(words).join("\n"); }
  };
}));
