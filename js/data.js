/* growth-hub catalogue — UMD so browsers and node tests share one source of truth */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GrowthHub = factory();
}(typeof self !== "undefined" ? self : this, function () {

  var PRODUCTS = [
    {
      slug: "leadqualify-ai",
      name: "LeadQualify AI",
      price: 29,
      lane: "Catch new leads",
      tagline: "Catch every website visitor and score them hot, warm, or cold.",
      features: [
        "Embeddable chat widget — one script tag on any site",
        "Local AI scoring with plain-language reasons",
        "Spam filtering + after-hours auto-responder"
      ],
      repo: "https://github.com/alexwboles/leadqualify-ai"
    },
    {
      slug: "winback-ai",
      name: "WinBack AI",
      price: 29,
      lane: "Revive old customers",
      tagline: "Revive your dead customer list with campaigns that pay for themselves.",
      features: [
        "RFM-lite segmentation: champions, lapsed, dormant VIPs",
        "Per-segment email + SMS drafts with margin-smart offers",
        "ROI estimator and send-tracking sheet"
      ],
      repo: "https://github.com/alexwboles/winback-ai"
    },
    {
      slug: "menucraft-ai",
      name: "MenuCraft AI",
      price: 24,
      lane: "Make your menu sell",
      tagline: "Menu descriptions that make mouths water, with food-cost math that protects margins.",
      features: [
        "Three description styles: upscale, casual, fun",
        "Food-cost calculator with margin health flags",
        "Printable menu + weekend specials generator"
      ],
      repo: "https://github.com/alexwboles/menucraft-ai"
    }
  ];

  var BUNDLE = { name: "Growth Kit", price: 59 };

  function totalSeparate() {
    return PRODUCTS.reduce(function (sum, p) { return sum + p.price; }, 0);
  }

  function bundleSavings() {
    return totalSeparate() - BUNDLE.price;
  }

  function getProduct(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    }
    return null;
  }

  return {
    PRODUCTS: PRODUCTS,
    BUNDLE: BUNDLE,
    totalSeparate: totalSeparate,
    bundleSavings: bundleSavings,
    getProduct: getProduct
  };
}));
