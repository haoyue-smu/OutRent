# Coach's Kit (02-coach-kit)

Designer: Haoyue

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show |
|---|---|
| Coach thumbnail (48 × 48) | Coach Aisyah, head and shoulders, outdoors |
| Road helmet thumbnail (40 × 40) | Daniel's own road helmet, as in My gear |
| Gloves thumbnail (40 × 40) | Daniel's own cycling gloves, as in My gear |
| Rider kit figure (353 × 200) | Rider figure with each kit piece; the selected piece in sage (to come) |

## Notes

Lead hero page: one finished direction (A). Direction B is not built.

### The page

- **Idea in one line:** Coach Aisyah's kit for the first Chestnut ride as one numbered list in three groups (To rent · Already have · Not needed) under a rider kit figure; the rows are also the figure's controls.
- **Key decisions and why:**
  - Coach first, with one line saying she recommends kit and does not rent anything out, so nobody reads the list as her shop.
  - The one thing to rent leads, with its frame size from his fit ("Frame M") and "See your sizes" (→ 03). The single primary button names the result: "Find a bike in frame M" (→ 04, pre-filtered).
  - "Already have" shows his own road helmet and gloves with photo thumbnails from My gear and a check, plus "See My gear" (→ 14). The list visibly checks what he owns, so he doesn't rent twice.
  - "Not needed" (full-face helmet) is a dashed, muted row with one line on why.
  - Numbering 1–4 runs across the groups so the figure can label each piece once it arrives. For now picking a row names it on the plate.
  - No fit saved (`#nofit`): the frame chip is replaced by "Which frame fits you?" with height and inside-leg fields (same ranges and frame rule as 03, from `_shared/lead.js`). The primary button becomes "Show my frame size"; it explains what is missing, or saves and shows "Frame M" with "Saved to your fit".

### Off-system

- `_shared/lead.css` linked as an extra stylesheet (fixed frame and helpers). Checker warning "(lead exception) extra stylesheet".
- `_shared/lead.js` gives the fit rules (frame from height, accepted ranges), shared with 03 so the two pages always agree.
- Kit rows reuse `.explain-steps` on a mist page, so they are white (selected: `--sage-tint`); the "Not needed" row is white with a dashed `--line` border and muted title.
- Explainer plate with the placeholder "Rider kit figure (3D, coming)", 200 px tall.
- Page layout classes: `.coach`, `.kit`, `.txt`, `.links`, `.pair`, `.ask`, `.have`.
- The frame chip pops in after saving (200 ms glide; 160 ms cross-fade with reduced motion).
- No `direction-b/`: lead pages ship one direction (checker warning "direction-b/index.html is not there yet").
- Favicon: `<link rel="icon" href="../../../../design/brand/favicon.svg">` (DESIGN.md 5a). The checker reads any `<link>` as a stylesheet, so it warns "(lead exception) extra stylesheet … favicon.svg".

### Assumptions and open questions

- States: default (fit saved, frame M), `#nofit` (ask for height and inside leg first), `#saved` (fit just added here; shows frame and "Saved to your fit").
- Back goes to 01-home.
- Copy for why each item is (or isn't) needed is mine; please check it matches what Aisyah would say.
- The figure readout shows "1 to rent · 2 you have" until a row is picked.

### AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: the page, the no-fit flow, the shared fit ranges, and this file except "My choice".
- What I decided or changed myself:
