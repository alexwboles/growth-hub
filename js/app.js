/* growth-hub UI — renders product cards from the shared catalogue,
   plus the finder quiz, search/lane filter, billing-period toggle,
   side-by-side product comparison, and build-your-bundle quote with
   shareable links. */
(function () {
  var hub = window.GrowthHub;
  var profile = window.GrowthHubProfile;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  var recommended = null; /* array of slugs highlighted by the finder, or null */
  var period = "monthly"; /* "monthly" | "annual" */
  var compareSlugs = []; /* up to 3 slugs in the comparison table */

  function cardMatchesFilter(p) {
    var q = document.getElementById("search").value;
    var lane = document.getElementById("lane-filter").value;
    var list = hub.searchProducts(q, lane);
    return list.indexOf(p) !== -1;
  }

  /* --- product cards ---------------------------------------------------- */
  function renderCards() {
    var grid = document.getElementById("cards");
    grid.innerHTML = "";
    var shown = 0;
    hub.PRODUCTS.forEach(function (p) {
      if (!cardMatchesFilter(p)) return;
      shown++;
      var card = el("article", "card");
      card.id = "card-" + p.slug;
      if (recommended && recommended.indexOf(p.slug) !== -1) card.className += " recommended";
      var actN = hub.actOf(p.lane);
      var act = actN ? hub.ACTS[actN - 1] : null;
      if (act) card.appendChild(el("div", "act-chip", "Act 0" + actN + " — " + act.name));
      card.appendChild(el("div", "lane", p.lane));
      card.appendChild(el("h2", null, p.name));
      card.appendChild(el("p", "tagline", p.tagline));
      var ul = el("ul", "features");
      p.features.forEach(function (f) { ul.appendChild(el("li", null, f)); });
      card.appendChild(ul);
      var foot = el("div", "cardfoot");
      foot.appendChild(el("span", "price", "$" + hub.priceFor(p, period) + hub.periodUnit(period)));
      var row = el("div", "card-actions");
      var cmp = el("button", "btn ghost" + (compareSlugs.indexOf(p.slug) !== -1 ? " on" : ""),
        compareSlugs.indexOf(p.slug) !== -1 ? "In compare ✓" : "+ Compare");
      cmp.type = "button";
      cmp.setAttribute("aria-pressed", compareSlugs.indexOf(p.slug) !== -1 ? "true" : "false");
      (function (slug) {
        cmp.addEventListener("click", function () { toggleCompare(slug); });
      })(p.slug);
      row.appendChild(cmp);
      var a = el("a", "btn", "View on GitHub");
      a.href = p.repo;
      a.target = "_blank";
      a.rel = "noopener";
      row.appendChild(a);
      foot.appendChild(row);
      card.appendChild(foot);
      grid.appendChild(card);
    });
    document.getElementById("result-count").textContent =
      shown === hub.PRODUCTS.length
        ? "Showing all " + shown + " products."
        : "Showing " + shown + " of " + hub.PRODUCTS.length + " products.";
  }

  /* --- billing-period toggle -------------------------------------------- */
  function renderBilling() {
    var wrap = document.getElementById("billing-toggle");
    wrap.innerHTML = "";
    [["monthly", "Monthly"], ["annual", "Annual — " + hub.BILLING.annualLabel]].forEach(function (pair) {
      var b = el("button", "toggle-btn" + (period === pair[0] ? " active" : ""), pair[1]);
      b.type = "button";
      b.setAttribute("aria-pressed", period === pair[0] ? "true" : "false");
      (function (per) {
        b.addEventListener("click", function () { setPeriod(per); });
      })(pair[0]);
      wrap.appendChild(b);
    });
  }

  function setPeriod(per) {
    period = hub.normalizePeriod(per);
    renderBilling();
    renderCards();
    renderBundle();
    renderQuote();
  }

  /* --- finder quiz ------------------------------------------------------ */
  function renderFinder() {
    var wrap = document.getElementById("goal-picks");
    hub.GOALS.forEach(function (g) {
      var b = el("button", "goal-btn", g.label);
      b.type = "button";
      b.title = g.blurb;
      b.addEventListener("click", function () { pickGoal(g.key); });
      wrap.appendChild(b);
    });
  }

  function pickGoal(key) {
    var res = hub.recommendFor(key);
    recommended = res.products.map(function (p) { return p.slug; });
    var btns = document.querySelectorAll("#goal-picks .goal-btn");
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle("active", b.textContent === res.goal.label);
    });
    document.getElementById("goal-result").textContent =
      res.goal.label + ": " + res.goal.blurb + " — " +
      res.products.map(function (p) { return p.name; }).join(", ") + ".";
    renderCards();
  }

  /* --- search + lane filter --------------------------------------------- */
  function renderFilters() {
    var sel = document.getElementById("lane-filter");
    hub.allLanes().forEach(function (lane) {
      var o = document.createElement("option");
      o.value = lane;
      o.textContent = lane;
      sel.appendChild(o);
    });
    document.getElementById("search").addEventListener("input", renderCards);
    sel.addEventListener("change", renderCards);
  }

  /* --- side-by-side comparison ------------------------------------------ */
  function toggleCompare(slug) {
    var i = compareSlugs.indexOf(slug);
    if (i !== -1) {
      compareSlugs.splice(i, 1);
    } else if (compareSlugs.length < 3) {
      compareSlugs.push(slug);
    } else {
      document.getElementById("compare-note").textContent =
        "Compare holds 3 products at a time — remove one to add another.";
      return;
    }
    renderCards();
    renderCompare();
  }

  function renderCompare() {
    var sec = document.getElementById("compare");
    var box = document.getElementById("compare-table");
    var note = document.getElementById("compare-note");
    box.innerHTML = "";
    if (compareSlugs.length < 2) {
      sec.className = "hidden";
      return;
    }
    sec.className = "";
    note.textContent = "";
    var m = hub.compareMatrix(compareSlugs);
    var table = document.createElement("table");
    var head = document.createElement("tr");
    head.appendChild(document.createElement("th"));
    m.products.forEach(function (slug) {
      var p = hub.getProduct(slug);
      var th = document.createElement("th");
      th.textContent = p.name;
      var rm = el("button", "linkbtn", "remove");
      rm.type = "button";
      (function (s) { rm.addEventListener("click", function () { toggleCompare(s); }); })(slug);
      th.appendChild(document.createElement("br"));
      th.appendChild(rm);
      head.appendChild(th);
    });
    table.appendChild(head);
    m.rows.forEach(function (r) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.textContent = r.label;
      th.scope = "row";
      tr.appendChild(th);
      r.values.forEach(function (v) {
        var td = document.createElement("td");
        td.textContent = v;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    box.appendChild(table);
  }

  /* --- build-your-bundle quote ------------------------------------------ */
  function renderBuilder() {
    var list = document.getElementById("pick-list");
    list.innerHTML = "";
    hub.PRODUCTS.forEach(function (p) {
      var label = el("label", "pick");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.value = p.slug;
      box.checked = true;
      box.addEventListener("change", renderQuote);
      label.appendChild(box);
      label.appendChild(el("span", "pick-name", p.name));
      label.appendChild(el("span", "pick-price", "$" + hub.priceFor(p, period) + hub.periodUnit(period)));
      list.appendChild(label);
    });
    document.getElementById("share-bundle").addEventListener("click", shareBundle);
    renderQuote();
  }

  function selectedSlugs() {
    var boxes = document.querySelectorAll("#pick-list input[type=checkbox]:checked");
    return Array.prototype.map.call(boxes, function (b) { return b.value; });
  }

  function renderQuote() {
    var q = hub.quotePlan(selectedSlugs(), period);
    var box = document.getElementById("quote");
    box.innerHTML = "";
    box.appendChild(el("div", "quote-line",
      q.count + " picked · separately $" + q.separate + hub.periodUnit(period)));
    if (q.count > 0) {
      box.appendChild(el("div", "quote-line",
        "Growth Kit (all nine): $" + hub.bundlePrice(period) + hub.periodUnit(period)));
      var verdict = el("p", "quote-verdict" + (q.bundleApplies ? " bundle-wins" : ""), q.verdict);
      box.appendChild(verdict);
    } else {
      box.appendChild(el("p", "quote-verdict", q.verdict));
    }
  }

  /* --- shareable bundle link -------------------------------------------- */
  function shareBundle() {
    var link = location.href.split("#")[0] + "#" + hub.encodeShare(selectedSlugs(), period);
    var note = document.getElementById("share-note");
    function done(msg) { note.textContent = msg; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(
        function () { done("Link copied — it opens this exact quote and billing choice."); },
        function () { done("Copy this link: " + link); });
    } else {
      done("Copy this link: " + link);
    }
  }

  function applySharedLink() {
    if (!location.hash) return;
    var d = hub.decodeShare(location.hash);
    if (!d.slugs.length) return;
    period = d.period;
    var boxes = document.querySelectorAll("#pick-list input[type=checkbox]");
    Array.prototype.forEach.call(boxes, function (b) {
      b.checked = d.slugs.indexOf(b.value) !== -1;
    });
  }

  function renderBundle() {
    document.getElementById("separate-price").textContent =
      "$" + hub.totalSeparate() * (period === "annual" ? hub.BILLING.annualMonths : 1) + hub.periodUnit(period);
    document.getElementById("bundle-price").textContent =
      "$" + hub.bundlePrice(period) + hub.periodUnit(period);
    document.getElementById("bundle-name").textContent = hub.BUNDLE.name;
    document.getElementById("bundle-save").textContent =
      "Save $" + (hub.bundleSavings() * (period === "annual" ? hub.BILLING.annualMonths : 1)) + hub.periodUnit(period) + " vs buying separately";
  }

  /* --- three-act pipeline ------------------------------------------------ */
  function renderPipeline() {
    var pipe = document.getElementById("pipeline");
    if (!pipe) return;
    pipe.innerHTML = "";
    hub.ACTS.forEach(function (act, i) {
      var names = hub.PRODUCTS
        .filter(function (p) { return hub.actOf(p.lane) === act.n; })
        .map(function (p) { return p.name; });
      var box = el("div", "act");
      box.appendChild(el("div", "act-num", "Act 0" + act.n));
      box.appendChild(el("h3", null, act.name));
      box.appendChild(el("p", null, act.blurb));
      var tools = el("div", "act-tools");
      tools.innerHTML = "<b>Tools:</b> " + names.join(" · ");
      box.appendChild(tools);
      pipe.appendChild(box);
      if (i < hub.ACTS.length - 1) {
        var arrow = el("div", "pipe-arrow", "→");
        arrow.setAttribute("aria-hidden", "true");
        pipe.appendChild(arrow);
      }
    });
    var fly = document.createElement("div");
    fly.className = "flywheel";
    fly.innerHTML = "<b>↺ The flywheel:</b> every win in Act 3 feeds Act 1 — more reviews lift local search, more customers mean more referrals.";
    pipe.parentNode.insertBefore(fly, pipe.nextSibling);
  }

  /* --- lapsed-revenue estimator -------------------------------------------- */
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function renderEstimator() {
    var lapsedEl = document.getElementById("est-lapsed");
    var dealEl = document.getElementById("est-deal");
    var rateEl = document.getElementById("est-rate");
    var out = document.getElementById("est-result");
    if (!lapsedEl || !dealEl || !rateEl || !out) return;
    function draw() {
      var r = hub.estimateRecovery(lapsedEl.value, dealEl.value, rateEl.value / 100);
      document.getElementById("est-rate-val").textContent = Math.round(r.rate * 100) + "%";
      var netCls = r.net >= 0 ? "est-net-good" : "est-net-bad";
      var netTxt = (r.net >= 0 ? "+$" : "−$") + fmt(Math.abs(r.net));
      out.innerHTML =
        "Winning back <b>" + r.rate * 100 + "%</b> of <b>" + fmt(r.lapsed) + "</b> lapsed customers " +
        "at <b>$" + fmt(r.dealValue) + "</b> a deal recovers about <b>$" + fmt(r.recovered) + "/mo</b>. " +
        "The Growth Kit costs <b>$" + fmt(r.cost) + "/mo</b> — net <b class=\"" + netCls + "\">" + netTxt + "/mo</b>. " +
        (r.net >= 0
          ? "The kit pays for itself on win-back alone."
          : "Tight — but the kit also covers acquisition and retention, not just win-back.");
    }
    [lapsedEl, dealEl, rateEl].forEach(function (elm) {
      elm.addEventListener("input", draw);
    });
    draw();
  }

  /* --- shared business profile -------------------------------------------- */
  function renderBusinessProfile() {
    var form = document.getElementById("profile-form");
    if (!form || !profile) return;
    var textFields = ["businessName", "trade", "phone", "socialHandle", "cta"];

    function renderStatus(p) {
      var s = document.getElementById("profile-status");
      if (!s) return;
      if (profile.hasBusinessProfile(p)) {
        var bits = [];
        if (p.businessName) bits.push(p.businessName);
        if (p.trade) bits.push(p.trade);
        if (p.phone) bits.push(p.phone);
        if (p.brandSafetyWords.length) bits.push(p.brandSafetyWords.length + " brand-safety word" + (p.brandSafetyWords.length === 1 ? "" : "s"));
        s.textContent = "Saved: " + bits.join(" · ");
      } else {
        s.textContent = "No profile saved yet — member products will read it as soon as you save.";
      }
    }

    function fill() {
      var p = profile.getBusinessProfile();
      textFields.forEach(function (k) {
        var input = document.getElementById("pf-" + k);
        if (input) input.value = p[k] || "";
      });
      var words = document.getElementById("pf-brandSafetyWords");
      if (words) words.value = profile.formatWords(p.brandSafetyWords);
      renderStatus(p);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var patch = {};
      textFields.forEach(function (k) {
        var input = document.getElementById("pf-" + k);
        patch[k] = input ? input.value : "";
      });
      var words = document.getElementById("pf-brandSafetyWords");
      patch.brandSafetyWords = words ? words.value : "";
      var saved = profile.setBusinessProfile(patch);
      fill();
      var s = document.getElementById("profile-status");
      if (s) s.textContent = "Profile saved — Growth Kit products now read: " + (saved.businessName || saved.trade || "your details") + ".";
    });

    var clearBtn = document.getElementById("profile-clear");
    if (clearBtn) clearBtn.addEventListener("click", function () {
      profile.clearBusinessProfile();
      fill();
    });

    fill();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPipeline();
    renderBilling();
    renderFinder();
    renderFilters();
    renderCards();
    renderBuilder();
    applySharedLink();
    renderBilling();
    renderCards();
    renderBundle();
    renderQuote();
    renderCompare();
    renderEstimator();
    renderBusinessProfile();
  });
})();
