#!/usr/bin/env bash
# growth-hub smoke tests — quick sanity checks
set -u
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
check() { # $1 = description, $2 = command...
  if eval "$2" >/dev/null 2>&1; then PASS=$((PASS+1)); echo "PASS: $1";
  else FAIL=$((FAIL+1)); echo "FAIL: $1"; fi
}

check "index.html exists"            "[ -f index.html ]"
check "css/style.css exists"         "[ -f css/style.css ]"
check "js/data.js exists"            "[ -f js/data.js ]"
check "js/app.js exists"             "[ -f js/app.js ]"
check "README.md exists"             "[ -f README.md ]"
check "data.js syntax valid"         "node --check js/data.js"
check "app.js syntax valid"          "node --check js/app.js"
check "index.html loads data.js"     "grep -q 'js/data.js' index.html"
check "index.html loads app.js"      "grep -q 'js/app.js' index.html"
check "finder section present"       "grep -q 'id=\"finder\"' index.html"
check "search + lane filter present" "grep -q 'id=\"search\"' index.html && grep -q 'id=\"lane-filter\"' index.html"
check "bundle builder present"       "grep -q 'id=\"builder\"' index.html && grep -q 'id=\"pick-list\"' index.html && grep -q 'id=\"quote\"' index.html"
check "act pipeline present"         "grep -q 'id=\"pipeline\"' index.html"
check "estimator present"            "grep -q 'id=\"est-lapsed\"' index.html && grep -q 'id=\"est-rate\"' index.html && grep -q 'id=\"est-result\"' index.html"
check "README documents bundle"      "grep -q 'Growth Kit' README.md"
check "no menucraft-ai references"   "! grep -rq 'menucraft' index.html js README.md"
check "compare section present"      "grep -q 'id=\"compare\"' index.html && grep -q 'id=\"compare-table\"' index.html"
check "billing toggle present"        "grep -q 'id=\"billing-toggle\"' index.html"
check "share link button present"     "grep -q 'id=\"share-bundle\"' index.html && grep -q 'id=\"share-note\"' index.html"
check "no border-radius styling"      "! grep -q 'border-radius: *[1-9]' css/style.css"

node -e '
var h = require("./js/data.js");
var assert = require("assert");
assert.strictEqual(h.PRODUCTS.length, 9, "9 products");
var slugs = h.PRODUCTS.map(function(p){return p.slug;}).sort();
assert.deepStrictEqual(slugs, ["adcopy-ai","leadqualify-ai","loyaltyloop-ai","pricingpilot-ai","referralpilot-ai","reviewpilot-ai","seocheck-ai","socialspark-ai","winback-ai"], "slugs");
h.PRODUCTS.forEach(function(p){
  assert.ok(/^https:\/\/github\.com\/alexwboles\/[a-z-]+$/.test(p.repo), "repo link well-formed: "+p.slug);
  assert.ok(Number.isInteger(p.price) && p.price > 0, "price valid: "+p.slug);
  assert.strictEqual(p.features.length, 3, "3 features: "+p.slug);
});
assert.strictEqual(h.totalSeparate(), 216, "216 separate");
assert.strictEqual(h.BUNDLE.price, 149, "149 bundle");
assert.strictEqual(h.bundleSavings(), 67, "216-149=67 savings");
assert.strictEqual(h.priceFor(h.getProduct("seocheck-ai"),"monthly"), 19, "monthly price");
assert.strictEqual(h.priceFor(h.getProduct("seocheck-ai"),"annual"), 190, "annual = 10x");
assert.strictEqual(h.bundlePrice("annual"), 1490, "annual bundle 1490");
assert.strictEqual(h.periodUnit("annual"), "/yr", "yr unit");
assert.strictEqual(h.normalizePeriod("bogus"), "monthly", "bad period -> monthly");
assert.strictEqual(h.ACTS.length, 3, "3 acts");
assert.strictEqual(h.actOf("Fill the funnel"), 2, "lane -> act 2");
assert.strictEqual(h.actOf("Revive old customers"), 3, "lane -> act 3");
assert.strictEqual(h.actOf("nope"), 0, "unknown lane -> 0");
var er = h.estimateRecovery(200, 150, 0.05);
assert.strictEqual(er.recovered, 1500, "recovery math");
assert.strictEqual(er.cost, 149, "kit cost in estimate");
assert.strictEqual(er.net, 1351, "net");
var er0 = h.estimateRecovery(-5, "abc", 9);
assert.strictEqual(er0.recovered, 0, "bad inputs clamp to 0");
assert.strictEqual(er0.rate, 1, "rate clamps to 1");
console.log("data assertions OK");
' && { PASS=$((PASS+1)); echo "PASS: data.js catalogue assertions"; } \
  || { FAIL=$((FAIL+1)); echo "FAIL: data.js catalogue assertions"; }

echo "---"
echo "smoke: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
