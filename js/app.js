/* growth-hub UI — renders product cards from the shared catalogue,
   plus the finder quiz, search/lane filter, and build-your-bundle quote. */
(function () {
  var hub = window.GrowthHub;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  var recommended = null; /* array of slugs highlighted by the finder, or null */

  function cardMatchesFilter(p) {
    var q = document.getElementById("search").value;
    var lane = document.getElementById("lane-filter").value;
    var list = hub.searchProducts(q, lane);
    return list.indexOf(p) !== -1;
  }

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
      foot.appendChild(el("span", "price", "$" + p.price + "/mo"));
      var a = el("a", "btn", "View on GitHub");
      a.href = p.repo;
      a.target = "_blank";
      a.rel = "noopener";
      foot.appendChild(a);
      card.appendChild(foot);
      grid.appendChild(card);
    });
    document.getElementById("result-count").textContent =
      shown === hub.PRODUCTS.length
        ? "Showing all " + shown + " products."
        : "Showing " + shown + " of " + hub.PRODUCTS.length + " products.";
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

  /* --- build-your-bundle quote ------------------------------------------ */
  function renderBuilder() {
    var list = document.getElementById("pick-list");
    hub.PRODUCTS.forEach(function (p) {
      var label = el("label", "pick");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.value = p.slug;
      box.checked = true;
      box.addEventListener("change", renderQuote);
      label.appendChild(box);
      label.appendChild(el("span", "pick-name", p.name));
      label.appendChild(el("span", "pick-price", "$" + p.price + "/mo"));
      list.appendChild(label);
    });
    renderQuote();
  }

  function selectedSlugs() {
    var boxes = document.querySelectorAll("#pick-list input[type=checkbox]:checked");
    return Array.prototype.map.call(boxes, function (b) { return b.value; });
  }

  function renderQuote() {
    var q = hub.quotePlan(selectedSlugs());
    var box = document.getElementById("quote");
    box.innerHTML = "";
    box.appendChild(el("div", "quote-line",
      q.count + " picked · separately $" + q.separate + "/mo"));
    if (q.count > 0) {
      box.appendChild(el("div", "quote-line",
        "Growth Kit (all nine): $" + hub.BUNDLE.price + "/mo"));
      var verdict = el("p", "quote-verdict" + (q.bundleApplies ? " bundle-wins" : ""), q.verdict);
      box.appendChild(verdict);
    } else {
      box.appendChild(el("p", "quote-verdict", q.verdict));
    }
  }

  function renderBundle() {
    var separate = hub.totalSeparate();
    var save = hub.bundleSavings();
    document.getElementById("separate-price").textContent = "$" + separate + "/mo";
    document.getElementById("bundle-price").textContent = "$" + hub.BUNDLE.price + "/mo";
    document.getElementById("bundle-name").textContent = hub.BUNDLE.name;
    document.getElementById("bundle-save").textContent =
      "Save $" + save + "/mo vs buying separately";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderFinder();
    renderFilters();
    renderCards();
    renderBuilder();
    renderBundle();
  });
})();
