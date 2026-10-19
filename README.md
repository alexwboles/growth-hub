# Growth Hub — Customer Growth Kit

Nine independent AI micro-products that answer the same question: **how do I get more customers?**

They play out as a three-act story — first you **get found**, then you **win the customer**, then you **keep them & multiply**.

## Act 1 — Get found

| Product | What it does | Price |
|---------|--------------|-------|
| [SEOCheck AI](https://github.com/alexwboles/seocheck-ai) | 28-point local SEO audit with a fix-what-matters-first list | $19/mo |
| [SocialSpark AI](https://github.com/alexwboles/socialspark-ai) | One job photo → a week of ready-to-post social content | $19/mo |

## Act 2 — Win the customer

| Product | What it does | Price |
|---------|--------------|-------|
| [LeadQualify AI](https://github.com/alexwboles/leadqualify-ai) | Embeddable chat widget that scores website leads hot/warm/cold | $29/mo |
| [AdCopy AI](https://github.com/alexwboles/adcopy-ai) | Ad copy generator: hooks, headlines and CTAs in your brand voice | $19/mo |
| [PricingPilot AI](https://github.com/alexwboles/pricingpilot-ai) | Pricing calculator: costs, margins and price recommendations | $24/mo |

## Act 3 — Keep them & multiply

| Product | What it does | Price |
|---------|--------------|-------|
| [ReviewPilot AI](https://github.com/alexwboles/reviewpilot-ai) | Review ask page + QR code + AI reply drafter | $29/mo |
| [LoyaltyLoop AI](https://github.com/alexwboles/loyaltyloop-ai) | Loyalty program builder: points, perks and repeat buyers | $24/mo |
| [ReferralPilot AI](https://github.com/alexwboles/referralpilot-ai) | Referral program builder: rewards that bring new customers | $24/mo |
| [WinBack AI](https://github.com/alexwboles/winback-ai) | Win-back campaigns for dead customer lists (RFM segmentation + ROI estimator) | $29/mo |

**Growth Kit bundle:** all nine for **$149/mo** (vs $216/mo separately — save $67/mo).

## How they connect

- **Act 1 → Act 2:** SEOCheck gets you found and SocialSpark keeps you visible — then LeadQualify catches the visitor on your website, AdCopy fills the funnel with paid traffic that reads like you, and PricingPilot prices every quote to win the job *and* protect your margin. Traffic is only worth what you convert.
- **Act 2 → Act 3:** ReviewPilot turns a happy customer into public 5-star proof, LoyaltyLoop turns proof into repeat visits, and ReferralPilot turns repeat buyers into new customers. WinBack catches the ones that fell through the cracks — lapsed buyers, quiet leads, anyone who went dark — and pulls them back into the loop.
- **The flywheel:** every win in Act 3 feeds Act 1. More reviews boost local search, more customers mean more referrals, and every new customer starts the loop again.

Honest note: these are independent products, not one platform. The three acts are a playbook, not a package — buy one, bundle a few, or take all nine where it genuinely makes sense. No forced connections.

## Shared business profile

Member products kept asking for the same details — business name, trade, phone, social handle, call to action, brand-safety words. So the hub defines one shared profile that every Growth Kit product reads and writes.

**The convention**

- **localStorage key:** `growthhub.businessProfile`
- **Stored value:** `{ version: 1, updatedAt: "<iso-8601>", profile: { … } }`
- **Schema v1 fields:**

| Field | Type | What it's for |
|-------|------|---------------|
| `businessName` | string | The business's name |
| `trade` | string | Trade / industry (e.g. "Roofing contractor") |
| `phone` | string | Contact phone |
| `socialHandle` | string | Social handle (e.g. `@riverbendroofing`) |
| `cta` | string | Primary call to action (e.g. "Book a free estimate") |
| `brandSafetyWords` | string[] | Words/phrases to avoid in generated copy |

- **The code:** `js/business-profile.js` — `GrowthHubProfile` exposes `getBusinessProfile()` (stored values merged over defaults; corrupted JSON recovers to defaults, never crashes), `setBusinessProfile(patch)` (merge + sanitize + persist), `clearBusinessProfile()`, `hasBusinessProfile()`, plus `parseWords`/`formatWords` helpers. Node-safe (in-memory fallback when `localStorage` is unavailable), and the hub page's "Your business profile" section is the canonical editor.

**Adopting it in a member product repo** (do this in the product repo — the hub repo only defines the convention):

1. Copy `js/business-profile.js` from this repo into the product repo (it has zero dependencies).
2. On page load, prefill your business fields from the shared profile instead of starting blank:
   ```js
   var p = GrowthHubProfile.getBusinessProfile();
   // prefill your form: p.businessName, p.trade, p.phone,
   // p.socialHandle, p.cta, p.brandSafetyWords (array)
   ```
3. When the user edits those fields in your product, write them back so the hub and other products see the change:
   ```js
   GrowthHubProfile.setBusinessProfile({ businessName: nameInput.value, phone: phoneInput.value });
   ```
4. Keep the field names exactly as defined here. Unknown fields are ignored on write; missing fields read back as `""` (or `[]` for `brandSafetyWords`).
5. Respect `brandSafetyWords` wherever your product generates customer-facing copy.

Honest note: `localStorage` is per origin — products hosted on different domains each keep their own copy of the profile. The convention still removes re-asking within any origin and gives every product the same schema and editor UX; when the products are served together, the profile is genuinely shared.

## Run it

No build step. Just open `index.html` in a browser, or serve the folder:

```bash
cd growth-hub && python3 -m http.server 8080
# → http://localhost:8080
```

## Tests

```bash
bash test/smoke.sh   # 12+ checks
bash test/e2e.sh     # 8+ flows
```

## Principles

- Free to run — zero dependencies, no paid services
- Local-first — the catalogue logic (`js/data.js`) is shared between browser and node tests
- Tested — smoke + e2e green before every release
