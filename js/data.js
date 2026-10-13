/* growth-hub catalogue — UMD so browsers and node tests share one source of truth */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GrowthHub = factory();
}(typeof self !== "undefined" ? self : this, function () {

  var PRODUCTS = [
    /* Act 1 — Get found */
    {
      slug: "seocheck-ai",
      name: "SEOCheck AI",
      price: 19,
      lane: "Get found",
      tagline: "Audit your local SEO in 10 minutes. Fix what matters first.",
      features: [
        "Guided 28-point local audit: Google profile, citations, reviews, website",
        "Weighted 0–100 score with a fix list prioritized by impact",
        "Audit history and progress saved locally in your browser"
      ],
      repo: "https://github.com/alexwboles/seocheck-ai"
    },
    {
      slug: "socialspark-ai",
      name: "SocialSpark AI",
      price: 19,
      lane: "Stay visible",
      tagline: "One job photo → a week of social posts.",
      features: [
        "7 themed posts from one job description: The Reveal to Before & After",
        "Captions in 3 tones, trade-specific hashtags, best time to post",
        "Content bank of saved favorites — runs 100% offline in the browser"
      ],
      repo: "https://github.com/alexwboles/socialspark-ai"
    },
    /* Act 2 — Win the customer */
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
      slug: "adcopy-ai",
      name: "AdCopy AI",
      price: 19,
      lane: "Fill the funnel",
      tagline: "Describe your business. Get ready-to-run ads in seconds.",
      features: [
        "Google Search ads: 3 headlines + 2 descriptions with live character counters",
        "Facebook ads: primary text, headline and link description in 3 tones",
        "Best-practice checklist, CTA picker, copy-to-clipboard per ad"
      ],
      repo: "https://github.com/alexwboles/adcopy-ai"
    },
    {
      slug: "pricingpilot-ai",
      name: "PricingPilot AI",
      price: 24,
      lane: "Quote it right",
      tagline: "Pricing calculator: costs, margins and price recommendations.",
      features: [
        "Recommended price from labor, materials, overhead and target margin",
        "3-tier pricing (budget / standard / premium) with margin breakdown",
        "Competitor positioning check + printable price-presentation one-pager"
      ],
      repo: "https://github.com/alexwboles/pricingpilot-ai"
    },
    /* Act 3 — Keep them & multiply */
    {
      slug: "reviewpilot-ai",
      name: "ReviewPilot AI",
      price: 29,
      lane: "Earn reviews",
      tagline: "Get more 5-star reviews, reply in seconds.",
      features: [
        "Mobile-friendly review ask page + printable QR code for your counter",
        "AI reply drafter: 3 reply options for any review, works offline",
        "Anti-nag protection: never ask the same customer twice"
      ],
      repo: "https://github.com/alexwboles/reviewpilot-ai"
    },
    {
      slug: "loyaltyloop-ai",
      name: "LoyaltyLoop AI",
      price: 24,
      lane: "Build loyalty",
      tagline: "Loyalty program builder: points, perks and repeat buyers.",
      features: [
        "Program recommender: punch card, points or tiers, in plain English",
        "Reward economics calculator: cost per member, break-even, verdict",
        "Printable punch cards, signup sheet and one-click visit tracker"
      ],
      repo: "https://github.com/alexwboles/loyaltyloop-ai"
    },
    {
      slug: "referralpilot-ai",
      name: "ReferralPilot AI",
      price: 24,
      lane: "Win referrals",
      tagline: "Referral program builder: rewards that bring new customers.",
      features: [
        "Referral code generator with batch generation and copy-to-clipboard",
        "Reward rule builder with a plain-English summary and cost estimates",
        "Referral pipeline tracker, referrer leaderboard and share templates"
      ],
      repo: "https://github.com/alexwboles/referralpilot-ai"
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
    }
  ];

  var BUNDLE = { name: "Growth Kit", price: 149 };

  /* --- Billing periods ----------------------------------------------------
   * Monthly is pay-as-you-go; annual is 10x the monthly price (2 months free).
   */
  var BILLING = { annualMonths: 10, annualLabel: "2 months free" };

  function normalizePeriod(period) {
    return period === "annual" ? "annual" : "monthly";
  }

  function priceFor(p, period) {
    return normalizePeriod(period) === "annual" ? p.price * BILLING.annualMonths : p.price;
  }

  function bundlePrice(period) {
    return normalizePeriod(period) === "annual" ? BUNDLE.price * BILLING.annualMonths : BUNDLE.price;
  }

  function periodUnit(period) {
    return normalizePeriod(period) === "annual" ? "/yr" : "/mo";
  }

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

  /* --- Build-your-bundle quote -------------------------------------------
   * Pick any subset of products; the quote tells you whether the Growth Kit
   * bundle (all nine for BUNDLE.price) beats buying your picks separately.
   */
  function quotePlan(slugs, period) {
    period = normalizePeriod(period);
    var picks = [];
    var seen = {};
    (slugs || []).forEach(function (slug) {
      var p = getProduct(slug);
      if (p && !seen[slug]) { seen[slug] = true; picks.push(p); }
    });
    var separate = picks.reduce(function (sum, p) { return sum + priceFor(p, period); }, 0);
    var bp = bundlePrice(period);
    var unit = periodUnit(period);
    var bundleCheaper = separate > bp;
    var perNote = period === "annual" ? " (annual, " + BILLING.annualLabel + ")" : "";
    return {
      picks: picks.map(function (p) { return p.slug; }),
      count: picks.length,
      period: period,
      separate: separate,
      effective: bundleCheaper ? bp : separate,
      bundleApplies: bundleCheaper,
      savings: bundleCheaper ? separate - bp : 0,
      verdict: picks.length === 0
        ? "Pick at least one product to see your quote."
        : bundleCheaper
          ? "Take the Growth Kit — all nine for $" + bp + unit + perNote + " beats your picks by $" + (separate - bp) + unit + "."
          : "Buy your picks separately for $" + separate + unit + perNote + " — the bundle isn't worth it unless you want all nine."
    };
  }

  /* --- Shareable bundle quotes ---------------------------------------------
   * encodeShare turns the builder's picks + billing period into a URL hash;
   * decodeShare validates it back (unknown slugs and bad periods are dropped).
   */
  function encodeShare(slugs, period) {
    var picks = [];
    var seen = {};
    (slugs || []).forEach(function (slug) {
      var p = getProduct(slug);
      if (p && !seen[slug]) { seen[slug] = true; picks.push(slug); }
    });
    return "bundle=" + picks.join(",") + "&period=" + normalizePeriod(period);
  }

  function decodeShare(hash) {
    var out = { slugs: [], period: "monthly" };
    var s = String(hash || "").replace(/^#/, "");
    s.split("&").forEach(function (part) {
      var kv = part.split("=");
      if (kv[0] === "bundle" && kv[1]) {
        kv[1].split(",").forEach(function (slug) {
          if (getProduct(slug) && out.slugs.indexOf(slug) === -1) out.slugs.push(slug);
        });
      }
      if (kv[0] === "period" && kv[1] === "annual") out.period = "annual";
    });
    return out;
  }

  /* --- Side-by-side comparison ---------------------------------------------
   * compareMatrix validates up to 3 slugs and returns rows for a table:
   * lane, monthly/annual price, tagline, then each feature line.
   */
  function compareMatrix(slugs) {
    var prods = [];
    (slugs || []).forEach(function (slug) {
      var p = getProduct(slug);
      if (p && prods.indexOf(p) === -1 && prods.length < 3) prods.push(p);
    });
    var maxF = 0;
    prods.forEach(function (p) { maxF = Math.max(maxF, p.features.length); });
    var rows = [
      { label: "Lane", values: prods.map(function (p) { return p.lane; }) },
      { label: "Monthly price", values: prods.map(function (p) { return "$" + p.price + "/mo"; }) },
      { label: "Annual price", values: prods.map(function (p) { return "$" + priceFor(p, "annual") + "/yr (" + BILLING.annualLabel + ")"; }) },
      { label: "Tagline", values: prods.map(function (p) { return p.tagline; }) }
    ];
    for (var i = 0; i < maxF; i++) {
      rows.push({
        label: "Feature " + (i + 1),
        values: prods.map(function (p) { return p.features[i] || "—"; })
      });
    }
    return { products: prods.map(function (p) { return p.slug; }), rows: rows };
  }

  /* --- Product finder -----------------------------------------------------
   * Three plain-English goals map onto the three acts of the growth story.
   */
  var GOALS = [
    {
      key: "found",
      label: "Get found",
      blurb: "Nobody can find your business yet.",
      lanes: ["Get found", "Stay visible"]
    },
    {
      key: "win",
      label: "Win the customer",
      blurb: "You're visible — now you need to convert.",
      lanes: ["Catch new leads", "Fill the funnel", "Quote it right"]
    },
    {
      key: "keep",
      label: "Keep & multiply",
      blurb: "You have customers — grow them and their friends.",
      lanes: ["Earn reviews", "Build loyalty", "Win referrals", "Revive old customers"]
    }
  ];

  function recommendFor(goalKey) {
    var goal = null;
    GOALS.forEach(function (g) { if (g.key === goalKey) goal = g; });
    if (!goal) return { goal: null, products: [] };
    return {
      goal: goal,
      products: PRODUCTS.filter(function (p) { return goal.lanes.indexOf(p.lane) !== -1; })
    };
  }

  /* --- Search / filter ---------------------------------------------------- */
  function searchProducts(query, lane) {
    var q = (query || "").trim().toLowerCase();
    return PRODUCTS.filter(function (p) {
      if (lane && lane !== "all" && p.lane !== lane) return false;
      if (!q) return true;
      var hay = (p.name + " " + p.tagline + " " + p.lane + " " + p.features.join(" ")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  var ACTS = [
    { n: 1, name: "Get found",
      blurb: "Nobody buys what they can't find. SEOCheck audits your local presence and tells you what to fix first; SocialSpark keeps you visible week after week." },
    { n: 2, name: "Win the customer",
      blurb: "Traffic is only worth what you convert. LeadQualify catches the visitor and scores them; AdCopy fills the funnel with paid traffic that reads like you; PricingPilot prices every quote to win the job and protect your margin." },
    { n: 3, name: "Keep them & multiply",
      blurb: "A won customer is an asset. ReviewPilot turns them into public 5-star proof, LoyaltyLoop into repeat visits, ReferralPilot into new customers — and WinBack pulls the lapsed ones back into the loop." }
  ];

  var LANE_ACT = {
    "Get found": 1, "Stay visible": 1,
    "Catch new leads": 2, "Fill the funnel": 2, "Quote it right": 2,
    "Earn reviews": 3, "Build loyalty": 3, "Win referrals": 3, "Revive old customers": 3
  };

  /** Which act (1-3) a lane belongs to. Pure. */
  function actOf(lane) { return LANE_ACT[lane] || 0; }

  /** Lapsed-revenue recovery estimate (the WinBack pitch, as honest math).
   *  lapsed: dormant customers on your list; deal: avg deal value ($);
   *  rate: fraction you expect to win back (0-1). Pure. */
  function estimateRecovery(lapsed, deal, rate) {
    var l = Math.max(0, Math.floor(Number(lapsed) || 0));
    var d = Math.max(0, Number(deal) || 0);
    var r = Math.min(1, Math.max(0, Number(rate) || 0));
    var recovered = Math.round(l * r * d);
    var cost = BUNDLE.price; // monthly Growth Kit price
    return { lapsed: l, dealValue: d, rate: r, recovered: recovered,
             cost: cost, net: recovered - cost };
  }

  function allLanes() {
    var lanes = [];
    PRODUCTS.forEach(function (p) {
      if (lanes.indexOf(p.lane) === -1) lanes.push(p.lane);
    });
    return lanes;
  }

  return {
    PRODUCTS: PRODUCTS,
    BUNDLE: BUNDLE,
    BILLING: BILLING,
    GOALS: GOALS,
    totalSeparate: totalSeparate,
    bundleSavings: bundleSavings,
    getProduct: getProduct,
    normalizePeriod: normalizePeriod,
    priceFor: priceFor,
    bundlePrice: bundlePrice,
    periodUnit: periodUnit,
    quotePlan: quotePlan,
    encodeShare: encodeShare,
    decodeShare: decodeShare,
    compareMatrix: compareMatrix,
    recommendFor: recommendFor,
    searchProducts: searchProducts,
    allLanes: allLanes,
    ACTS: ACTS,
    actOf: actOf,
    estimateRecovery: estimateRecovery
  };
}));
