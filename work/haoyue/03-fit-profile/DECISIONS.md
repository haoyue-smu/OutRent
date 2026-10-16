# Fit Profile (03-fit-profile)

Designer: Haoyue

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show |
|---|---|
| A, B: Rider figure on the explainer plate (353 × 40 now; full plate when it arrives) | Daniel as a grey rider on the bike, so the wrong frame size shows on his body |

## Notes

A/B experiment candidate. A and B differ only in the input control for height and inside leg. Everything else (copy, order, figure, size swap, buttons, states, rules) is rendered by one shared file, `_shared/fit-page.js`, and each direction's `index.html` only plugs in its control. Both controls ask for height first, then inside leg, and use the same ranges (height 150–200 cm, inside leg 60–95 cm).

### The page

- **Idea in one line:** Two typed fields (height, inside leg) above the figure; the figure and every result update as he types.
- **Key decisions and why:**
  - Fields are the fastest input for someone who already knows his numbers.
  - A value applies once it is in range; an out-of-range number shows a fix-it message once it is long enough to judge.
  - First time through, a valid height moves the cursor to inside leg.

### Direction B

- **Idea in one line:** A switch above the figure picks height or inside leg, and the ruler on the figure's top edge sets it.
- **Key decisions and why:**
  - Ruler edge (`.explainer.has-ruler`): the length he sets is drawn on the thing it changes. Drag inside leg and the saddle moves; drag height past 180 cm and the frame swaps to L.
  - First time through, letting go of the height ruler moves the switch on to inside leg.
  - Snaps to whole cm, arrow keys step 1 cm (Page Up / Down 5 cm), light haptic per cm where supported.

### How A and B differ

Interaction pattern only: A types the two lengths into fields above the figure; B drags them on a ruler built into the figure.

Differences that come with the control and cannot be removed:
- B's ruler takes the place of the figure's top corners ("Fig 1", "Saddle height"), as the ruler-edge component requires; A shows them.
- A can hold an incomplete or out-of-range number and shows an error under the fields; B cannot go out of range, so it has no field error.
- While A's field holds an incomplete number (e.g. "17"), that value counts as empty and the results show "—" until it is complete; B always holds a whole number.
- The line under the figure starts with the control's own instruction ("Type your height and inside leg." / "Drag the ruler or use the arrow keys."); the measuring tip after it is shared.
- B's switch repeats the two values ("Height 176 cm"); A's fields show them.
- First time through: A moves on to inside leg when a valid height is typed; B moves on when the height ruler is let go (not on arrow keys, which step one cm at a time). B's first arrow key on an empty ruler sets the middle of the scale.
- B gives a light haptic per cm; A has none.

Checked by driving the same nine steps through each control (default, height 185, leg 70, try S, Regular, Save, `#empty`, Save while empty, height 170): every shared readout, button and figure scale matched.

### Off-system

- `_shared/lead.css` linked as an extra stylesheet: shared lead-page styles (figure colours, fixed frame, hero number). Checker warning "(lead exception) extra stylesheet".
- GSAP 3.15 (`_shared/gsap.min.js`, local copy, no CDN) drives the size swap. Approved lead exception to "no libraries".
- The page is rendered by script (`_shared/fit-page.js`) so A and B cannot drift apart.
- Bike explainer figure (`_shared/bike-figure.js`, one copy for both directions) instead of an explainer placeholder: supplied by the lead. Coloured only through CSS variables set to the explainer greys and `--sage`; the soft shadow under the stand is a blurred `--muted` at 28%.
- Hero number 64 px (`.t-hero`) for saddle height; the type scale tops out at 44.
- Size swap (hero moment 1): the bike scales S 0.92 / M 1 / L 1.08 from the rear-tyre contact point (≈ 720 ms: scale 0–320 ms with a slight overshoot, readouts settle 200–520 ms, "Fits you" chip pops 520–720 ms). The size it left stays as a dashed `--fig-lo` outline while it fades.
- `.screen.is-frame` + `.scroll`: the 393 × 852 frame scrolls inside, so the Save bar stays on screen.
- `.placeholder.is-slim`: a one-line dashed stand-in, "Rider figure (coming)", inside the plate.
- `.verdict`: icon + one line, for the size check and the "Fit saved" note.
- Layout-only classes: `.group`, `.head`, `.stack`, `.verdicts` (shared); `.pair` (A's two fields); `.segmented.is-measure` (B's two-line switch).
- The plate's bottom-right readout shows "Frame M" rather than a length, because saddle height has the 64 px number below.
- Favicon: `<link rel="icon" href="../../../../design/brand/favicon.svg">` (DESIGN.md 5a). The checker reads any `<link>` as a stylesheet, so it warns "(lead exception) extra stylesheet … favicon.svg".

### Suggestions

- Add a hero type size (64 / 64) to the scale if the lead pages keep it.

### Assumptions and open questions

- States: `#empty` (first time: nothing entered, Save explains what is missing), `#saved` (after Save: confirmation, button becomes "Done" and goes back, values kept). Default (no hash) is his saved profile being edited. Editing after saving returns to "not saved yet".
- Step progress (Pick → Fit …) shows only when he arrives from search or a listing: add `?from=04-search-results` or `?from=05-listing-detail`.
- "Done" goes back to where he came from (`data-goes-to="previous"`), per the spec.
- Saddle = inside leg × 0.883, rounded (81 cm → 72 cm).
- Working values, not in DESIGN.md §8 (please confirm or replace):
  - Frame from height: S under 167 cm, M 167–180 cm, L over 180 cm.
  - Highest saddle each frame takes: S 70 cm, M 78 cm, L 84 cm. Reach: S 40 cm, M 43 cm, L 46 cm.
  - Trail experience: First time = fork sag 25%, bars +1 cm; A few rides = 22%, bars 0; Regular = 20%, bars 0.
- Reduced motion: the size swap and number rolls become a 160 ms cross-fade; the saddle jumps instead of springing. Not yet checked with the OS setting turned on.

### AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: both directions' input controls, `_shared/lead.css`, `_shared/lead.js`, `_shared/fit-page.js` (page, fit rules, size-swap timeline, saddle spring), the A/B parity check, and this file except "My choice".
- What I decided or changed myself:
