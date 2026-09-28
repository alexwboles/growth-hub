/* growth-hub UI — renders product cards from the shared catalogue */
(function () {
  var hub = window.GrowthHub;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function renderCards() {
    var grid = document.getElementById("cards");
    hub.PRODUCTS.forEach(function (p, i) {
      var card = el("article", "card");
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
    renderCards();
    renderBundle();
  });
})();
