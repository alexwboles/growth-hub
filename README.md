# Growth Hub — Customer Growth Kit

Three independent AI micro-products that answer the same question: **how do I get more customers?**

| Product | What it does | Price |
|---------|--------------|-------|
| [LeadQualify AI](https://github.com/alexwboles/leadqualify-ai) | Embeddable chat widget that scores website leads hot/warm/cold | $29/mo |
| [WinBack AI](https://github.com/alexwboles/winback-ai) | Win-back campaigns for dead customer lists (RFM segmentation + ROI estimator) | $29/mo |
| [MenuCraft AI](https://github.com/alexwboles/menucraft-ai) | Menu copywriter + food-cost/margin calculator for restaurants | $24/mo |

**Growth Kit bundle:** all three for **$59/mo** (vs $82/mo separately — save $23/mo).

## How they connect

- **LeadQualify → WinBack:** LeadQualify catches the lead on your website. WinBack revives the ones that went quiet — including leads that never converted. Same customer list, two ends of the funnel.
- **MenuCraft × either:** MenuCraft is restaurant-specific. For restaurants it pairs naturally: WinBack campaigns can feature new menu items, and LeadQualify can capture catering and event inquiries.

Honest note: these are independent products, not one platform. Buy one, or bundle where it genuinely makes sense. No forced connections.

## Run it

No build step. Just open `index.html` in a browser, or serve the folder:

```bash
cd growth-hub && python3 -m http.server 8080
# → http://localhost:8080
```

## Tests

```bash
bash test/smoke.sh   # 8+ checks
bash test/e2e.sh     # 5+ flows
```

## Principles

- Free to run — zero dependencies, no paid services
- Local-first — the catalogue logic (`js/data.js`) is shared between browser and node tests
- Tested — smoke + e2e green before every release
