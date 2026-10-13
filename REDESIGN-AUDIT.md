# Redesign Audit — growth-hub ("The Growth Floor")
Date: 2026-10-13 · Worker: batch-hubs

## Competitors researched
1. **HubSpot free-tools page** — tool grid with icon cards, one-line value props, bold orange accent on white; each card is scannable in 3 seconds.
2. **G2 category pages** — dense product rows with star ratings, segment filters, side-by-side comparison tables, "compare" checkboxes on every card.
3. **AppSumo marketing collections** — category rails, deal cards with pricing + rating + social proof, sticky filter bar.

## Visual gaps (current state)
- Blue gradient hero — banned; identical in tone to every other hub (no identity).
- Generic white card grid: lane label + name + tagline + ✓ feature list + price + buttons. Reads like a Bootstrap template, not a marketer's tool.
- The three-act story (the hub's core narrative) is three equal white boxes with a left border — no pipeline/funnel feel, no step numbering, no forward momentum.
- Typography is default system sans with no display voice; prices are plain text, not tabular data.
- "Honest note" card is styled as just another box with a yellow tint — it should read as an editorial aside.

## Functional gaps (vs competitors)
- **No ROI/revenue math.** HubSpot and every growth tool sells on numbers; the hub quotes prices but never connects tools to revenue. A lapsed-customer recovery estimator (WinBack's whole pitch) is the missing competitor-grade widget.
- Finder quiz ("Where's your bottleneck?") works but looks like a row of plain buttons — no diagnostic-console feel, no visual payoff when a goal is picked beyond card highlighting.
- Compare tray exists but has no empty-state design and the table is unstyled.
- Bundle builder is a long checkbox list — functional but flat; no "stack total" readout with visual weight.

## Flow gaps
- Act 1 → 2 → 3 reads as three paragraphs; a marketer thinks in funnels. The flywheel ("every win in Act 3 feeds Act 1") is text, not a visual.
- No clear "start here" path: quiz → recommended cards exists but the recommended state is a subtle highlight.

## Plan (this redesign)
1. **Identity: "The Growth Floor"** — dark mission-control. Deep charcoal (#141619) shell, paper-white content panels, one electric-lime accent (#a3e635), mono uppercase micro-labels, condensed heavy headlines, tabular figures for all prices. Sharp corners.
2. **Act pipeline:** three numbered steps (01 GET FOUND / 02 WIN THE CUSTOMER / 03 KEEP & MULTIPLY) with connector arrows and a flywheel return arrow; each product card carries its act number.
3. **Recovery estimator (new):** "How many lapsed customers?" + "Average deal value" + recovery-rate slider → estimated recovered revenue/mo vs the Growth Kit price. Pure function `estimateRecovery(lapsed, deal, rate)` in data.js, tested.
4. **Finder quiz as diagnostic console:** dark panel, goal buttons as big switches, result readout with product names; recommended cards get a lime "RECOMMENDED" corner tag.
5. **Compare table** restyled as a spec sheet; compare buttons become "+ Compare / In compare ✓" toggles (kept).
6. **Bundle builder** with a sticky quote readout: picked count, separate total, bundle verdict, savings — honest when the bundle loses (kept).

## Preserved (must not regress)
- Finder quiz goals + recommendFor; search + lane filter; 9 product cards (lane, name, tagline, features, price, compare toggle, GitHub link); compare table (max 3); billing toggle monthly/annual; bundle builder + quotePlan verdicts + shareable links (encodeShare/decodeShare); bundle card math ($216 → $149, save $67).
