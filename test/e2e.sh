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

flow "lookup reviewpilot-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("reviewpilot-ai");
if(!p||p.price!==29||!/review/i.test(p.tagline))process.exit(1);'

flow "lookup socialspark-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("socialspark-ai");
if(!p||p.price!==19||!/job photo/i.test(p.tagline))process.exit(1);'

flow "lookup seocheck-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("seocheck-ai");
if(!p||p.price!==19||!/SEO/i.test(p.tagline))process.exit(1);'

flow "lookup adcopy-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("adcopy-ai");
if(!p||p.price!==19||!/ready-to-run ads/i.test(p.tagline))process.exit(1);'

flow "lookup pricingpilot-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("pricingpilot-ai");
if(!p||p.price!==24||!/pricing/i.test(p.tagline))process.exit(1);'

flow "lookup loyaltyloop-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("loyaltyloop-ai");
if(!p||p.price!==24||!/loyalty/i.test(p.tagline))process.exit(1);'

flow "lookup referralpilot-ai returns correct product" '
var h=require("./js/data.js"),p=h.getProduct("referralpilot-ai");
if(!p||p.price!==24||!/referral/i.test(p.tagline))process.exit(1);'

flow "menucraft-ai removed from catalogue" '
var h=require("./js/data.js");
if(h.getProduct("menucraft-ai")!==null)process.exit(1);
if(h.PRODUCTS.length!==9)process.exit(1);'

flow "unknown slug returns null" '
var h=require("./js/data.js");
if(h.getProduct("nope-not-real")!==null)process.exit(1);'

flow "bundle math: 216 separate, 149 bundle, 67 saved" '
var h=require("./js/data.js");
if(h.totalSeparate()!==216)process.exit(1);
if(h.BUNDLE.price!==149)process.exit(1);
if(h.bundleSavings()!==67)process.exit(1);'

flow "every product complete: name, lane, tagline, 3 features, repo matches slug" '
var h=require("./js/data.js");
h.PRODUCTS.forEach(function(p){
  if(!p.name||!p.lane||!p.tagline)process.exit(1);
  if(p.features.length!==3)process.exit(1);
  if(p.repo!=="https://github.com/alexwboles/"+p.slug)process.exit(1);
});'

flow "no duplicate slugs; expected price multiset 19x3, 24x3, 29x3" '
var h=require("./js/data.js");
var seen={};
h.PRODUCTS.forEach(function(p){if(seen[p.slug])process.exit(1);seen[p.slug]=1;});
var prices=h.PRODUCTS.map(function(p){return p.price;}).sort().join(",");
if(prices!=="19,19,19,24,24,24,29,29,29")process.exit(1);'

flow "expected price per product" '
var h=require("./js/data.js");
var expect={"leadqualify-ai":29,"winback-ai":29,"reviewpilot-ai":29,
"socialspark-ai":19,"adcopy-ai":19,"seocheck-ai":19,
"loyaltyloop-ai":24,"referralpilot-ai":24,"pricingpilot-ai":24};
h.PRODUCTS.forEach(function(p){
  if(p.price!==expect[p.slug])process.exit(1);
});'

flow "quotePlan: all nine picks => bundle wins, savings 67" '
var h=require("./js/data.js");
var q=h.quotePlan(["seocheck-ai","socialspark-ai","leadqualify-ai","adcopy-ai","pricingpilot-ai","reviewpilot-ai","loyaltyloop-ai","referralpilot-ai","winback-ai"]);
if(q.count!==9)process.exit(1);
if(q.separate!==216)process.exit(1);
if(q.bundleApplies!==true)process.exit(1);
if(q.effective!==149)process.exit(1);
if(q.savings!==67)process.exit(1);'

flow "quotePlan: two cheap picks => separate wins, no bundle" '
var h=require("./js/data.js");
var q=h.quotePlan(["seocheck-ai","adcopy-ai"]);
if(q.count!==2)process.exit(1);
if(q.separate!==38)process.exit(1);
if(q.bundleApplies!==false)process.exit(1);
if(q.effective!==38||q.savings!==0)process.exit(1);'

flow "quotePlan: dedupes, ignores unknown slugs, empty verdict" '
var h=require("./js/data.js");
var q=h.quotePlan(["seocheck-ai","seocheck-ai","nope"]);
if(q.count!==1||q.separate!==19)process.exit(1);
var e=h.quotePlan([]);
if(e.count!==0||!/at least one/.test(e.verdict))process.exit(1);'

flow "recommendFor: 3 goals map to 2+3+4 products" '
var h=require("./js/data.js");
var f=h.recommendFor("found");
if(f.goal.key!=="found"||f.products.length!==2)process.exit(1);
var w=h.recommendFor("win");
if(w.products.length!==3)process.exit(1);
var k=h.recommendFor("keep");
if(k.products.length!==4)process.exit(1);
var all=f.products.concat(w.products,k.products).map(function(p){return p.slug;}).sort();
var want=h.PRODUCTS.map(function(p){return p.slug;}).sort();
if(all.join(",")!==want.join(","))process.exit(1);
if(h.recommendFor("nope").products.length!==0)process.exit(1);'

flow "searchProducts: text + lane filtering" '
var h=require("./js/data.js");
if(h.searchProducts("review","all").length!==2)process.exit(1);
if(h.searchProducts("", "Earn reviews").length!==1)process.exit(1);
if(h.searchProducts("", "all").length!==9)process.exit(1);
if(h.searchProducts("offline","all").length!==2)process.exit(1);
if(h.allLanes().length!==9)process.exit(1);'

echo "---"
echo "e2e: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
