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
check "README documents bundle"      "grep -q 'Growth Kit' README.md"

node -e '
var h = require("./js/data.js");
var assert = require("assert");
assert.strictEqual(h.PRODUCTS.length, 3, "3 products");
var slugs = h.PRODUCTS.map(function(p){return p.slug;}).sort();
assert.deepStrictEqual(slugs, ["leadqualify-ai","menucraft-ai","winback-ai"], "slugs");
h.PRODUCTS.forEach(function(p){
  assert.ok(/^https:\/\/github\.com\/alexwboles\/[a-z-]+$/.test(p.repo), "repo link well-formed: "+p.slug);
  assert.ok(Number.isInteger(p.price) && p.price > 0, "price valid: "+p.slug);
  assert.strictEqual(p.features.length, 3, "3 features: "+p.slug);
});
assert.strictEqual(h.totalSeparate(), 82, "29+29+24=82");
assert.strictEqual(h.bundleSavings(), 23, "82-59=23 savings");
console.log("data assertions OK");
' && { PASS=$((PASS+1)); echo "PASS: data.js catalogue assertions"; } \
  || { FAIL=$((FAIL+1)); echo "FAIL: data.js catalogue assertions"; }

echo "---"
echo "smoke: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
