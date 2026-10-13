/* growth-hub UI — renders product cards from the shared catalogue,
   plus the finder quiz, search/lane filter, billing-period toggle,
   side-by-side product comparison, and build-your-bundle quote with
   shareable links. */
(function () {
  var hub = window.GrowthHub;

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

  document.addEventListener("DOMContentLoaded", function () {
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
  });
})();
