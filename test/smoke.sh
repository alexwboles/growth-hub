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
check "js/business-profile.js exists" "[ -f js/business-profile.js ]"
check "js/app.js exists"             "[ -f js/app.js ]"
check "README.md exists"             "[ -f README.md ]"
check "data.js syntax valid"         "node --check js/data.js"
check "business-profile.js syntax valid" "node --check js/business-profile.js"
check "app.js syntax valid"          "node --check js/app.js"
check "index.html loads data.js"     "grep -q 'js/data.js' index.html"
check "index.html loads business-profile.js" "grep -q 'js/business-profile.js' index.html"
check "index.html loads app.js"      "grep -q 'js/app.js' index.html"
check "profile editor present"       "grep -q 'id=\"profile-form\"' index.html && grep -q 'id=\"profile-save\"' index.html && grep -q 'id=\"profile-status\"' index.html"
check "README documents shared profile key" "grep -q 'growthhub.businessProfile' README.md"
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

node -e '
var bp = require("./js/business-profile.js");
var assert = require("assert");
assert.strictEqual(bp.STORAGE_KEY, "growthhub.businessProfile", "storage key convention");
assert.strictEqual(bp.SCHEMA_VERSION, 1, "schema version");
assert.strictEqual(bp.FIELDS.length, 6, "6 documented fields");
assert.deepStrictEqual(bp.FIELDS.map(function(f){return f.key;}),
  ["businessName","trade","phone","socialHandle","cta","brandSafetyWords"], "field keys");
var d = bp.defaultProfile();
assert.deepStrictEqual(Object.keys(d).sort(),
  ["brandSafetyWords","businessName","cta","phone","socialHandle","trade"], "default keys");
assert.strictEqual(bp.hasBusinessProfile(), false, "empty by default");
var saved = bp.setBusinessProfile({ businessName: "  Riverbend Roofing ", brandSafetyWords: "cheap, cheap\nBEST!!" });
assert.strictEqual(saved.businessName, "Riverbend Roofing", "trims on write");
assert.deepStrictEqual(saved.brandSafetyWords, ["cheap", "BEST!!"], "words parsed + deduped");
assert.strictEqual(bp.hasBusinessProfile(), true, "non-empty -> has profile");
var got = bp.getBusinessProfile();
assert.strictEqual(got.businessName, "Riverbend Roofing", "roundtrip read");
var merged = bp.setBusinessProfile({ phone: "(555) 123-4567" });
assert.strictEqual(merged.businessName, "Riverbend Roofing", "merge keeps untouched fields");
assert.strictEqual(merged.phone, "(555) 123-4567", "merge adds new field");
var capped = bp.setBusinessProfile({ businessName: new Array(301).join("x") });
assert.strictEqual(capped.businessName.length, 200, "long values capped");
bp.clearBusinessProfile();
assert.strictEqual(bp.hasBusinessProfile(), false, "clear empties profile");
assert.strictEqual(bp.getBusinessProfile().phone, "", "clear removes values");
assert.deepStrictEqual(bp.parseWords("a, b; c\nd"), ["a", "b", "c", "d"], "word separators");
assert.strictEqual(bp.formatWords(["a", "b"]), "a\nb", "word formatting");
global.localStorage = { getItem: function(){ return "{corrupt json"; }, setItem: function(){}, removeItem: function(){} };
assert.strictEqual(bp.getBusinessProfile().businessName, "", "corrupt JSON -> defaults");
assert.strictEqual(bp.hasBusinessProfile(), false, "corrupt JSON -> no profile");
console.log("business-profile assertions OK");
' && { PASS=$((PASS+1)); echo "PASS: business-profile module assertions"; } \
  || { FAIL=$((FAIL+1)); echo "FAIL: business-profile module assertions"; }

echo "---"
echo "smoke: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
