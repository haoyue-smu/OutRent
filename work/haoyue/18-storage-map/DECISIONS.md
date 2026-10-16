# Storage Map (18-storage-map)

Designer: Haoyue

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show |
|---|---|
| Map (393 × 400) | Calm street map of Daniel's area in Bukit Timah (no labels needed); pins are drawn on top by the page at A (west, close to home), B (north-east) and C (south-east) |

## Notes

Lead hero page: one finished direction (A). Direction B is not built.

### The page

- **Idea in one line:** Map on top with a glass pin per rack showing its spaces; below, the hold rule, then the same racks as a list with counts. Picking a full rack says so and offers the nearest rack with space.
- **Key decisions and why:**
  - Each pin shows its count ("Full", "1 left", "4 left"), so availability can be read from the map before reading any list → HE #15.
  - "Updated 2 min ago" sits on the map (glass chip) and under the title, so he knows how fresh the counts are.
  - The hold rule is the first thing in the sheet, above the racks: choosing a rack holds one space for 24 hours, and the hold ends if the bike isn't dropped by then → HE #15.
  - The list repeats the racks with distance and walk time; Rack A is labelled "Closest" but shown as full (0/8) in muted grey.
  - The nearest rack with space (B) is chosen by default; the one primary button names the result: "Hold a space at Rack B" (→ 17).
  - Rack full (`#full`, or tapping Rack A): the button turns off and reads "Rack A is full"; a card explains it (0 of 8 spaces, can't hold one now) with "Choose Rack B, 1 space left".

### Off-system

- `_shared/lead.css` linked as an extra stylesheet (fixed frame and helpers). Checker warning "(lead exception) extra stylesheet".
- Map pins (`.pin`): glass capsules over the map placeholder with a lettered circle; the chosen pin turns `--sage`; a full rack's pin is muted. "You" marker: a sage dot with a white ring and the float shadow.
- Rack rows (`.rack`): list rows with a lettered circle instead of a thumbnail and a count column (Title size number, Label size caption).
- Page classes: `.map`, `.racks`, `.head`, `.full-note`.
- No `direction-b/`: lead pages ship one direction (checker warning "direction-b/index.html is not there yet").

### Assumptions and open questions

- States: default (Rack B chosen) and `#full` (Rack A chosen).
- Working values, not in the spec: distances 200 m / 450 m / 700 m and walk times 3 / 6 / 9 min.
- Picking a rack only chooses it here; the 24-hour hold starts when he confirms on 17. Please confirm that's the intended moment.
- Back and "Hold a space" both go to 17-hub-pickup.
- A real map would come from a map provider; here it is an image placeholder with pins on top.

### AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: the page, the rack choice and full state, and this file except "My choice".
- What I decided or changed myself:
