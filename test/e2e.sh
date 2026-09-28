#!/usr/bin/env bash
# growth-hub e2e tests — exercise catalogue logic end to end in node
set -u
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
flow() { # $1 = name, $2 = node script
  if node -e "$2" >/dev/null 2>&1; then PASS=$((PASS+1)); echo "PASS: $1";
  else FAIL=$((FAIL+1)); echo "FAIL: $1"; fi
}

flow "lookup leadqualify-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("leadqualify-ai");
if(!p||p.price!==29||p.lane!=="Catch new leads")process.exit(1);'

flow "lookup winback-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("winback-ai");
if(!p||p.price!==29||!/dead customer/i.test(p.tagline))process.exit(1);'

flow "lookup menucraft-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("menucraft-ai");
if(!p||p.price!==24||p.lane!=="Make your menu sell")process.exit(1);'

flow "unknown slug returns null" '
var h=require("./js/data.js");
if(h.getProduct("nope-not-real")!==null)process.exit(1);'

flow "bundle math: 82 separate, 59 bundle, 23 saved" '
var h=require("./js/data.js");
if(h.totalSeparate()!==82)process.exit(1);
if(h.BUNDLE.price!==59)process.exit(1);
if(h.bundleSavings()!==23)process.exit(1);'

flow "every product complete: name, lane, tagline, 3 features, repo matches slug" '
var h=require("./js/data.js");
h.PRODUCTS.forEach(function(p){
  if(!p.name||!p.lane||!p.tagline)process.exit(1);
  if(p.features.length!==3)process.exit(1);
  if(p.repo!=="https://github.com/alexwboles/"+p.slug)process.exit(1);
});'

flow "no duplicate slugs or prices leaking between products" '
var h=require("./js/data.js");
var seen={};
h.PRODUCTS.forEach(function(p){if(seen[p.slug])process.exit(1);seen[p.slug]=1;});
var prices=h.PRODUCTS.map(function(p){return p.price;}).sort().join(",");
if(prices!=="24,29,29")process.exit(1);'

echo "---"
echo "e2e: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
