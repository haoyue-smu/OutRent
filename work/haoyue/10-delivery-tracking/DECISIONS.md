# Delivery Tracking (10-delivery-tracking)

Designer: Haoyue

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show |
|---|---|
| Set-up photo (hero) (393 × 360) | This Trek Marlin 7 on the Loop Cycles stand this morning, saddle set to 72 cm, a tape measure on the seat post |

## Notes

Lead hero page: one finished direction (A). Direction B is not built.

### The page

- **Idea in one line:** The set-up photo proves the bike was set to his fit; below it, the arrival time is the one big number, then where the bike is on the route, then a timed status list. A delay replaces the calm view with what happened and three clear choices.
- **Key decisions and why:**
  - Photo first, with glass chips "Set to your fit · saddle 72 cm" and the time it was taken (6:52), so he can see the set-up was done before the bike left.
  - Arrival time in Display size (7:40) with an "On time" chip, so the most-asked question is answered at a glance → HE #7.
  - Route strip from Loop Cycles to the Chestnut Nature Park trailhead, with a sage line up to where the bike is now.
  - Status list with times: Set to your fit (6:52) → On its way (7:05) → Arriving 7:40, with what to do on arrival (check the bike with the courier).
  - Delayed (`#delayed`): a card at the top, "Running 15 min late · now 7:55", says what happened and that nothing changes for him (bike still set up, no extra charge). The three choices from the spec are buttons, not hidden in a menu: "Wait, meet at 7:55", "Change drop-off time" (sheet with times) and "Cancel free of charge" (sheet showing S$53 paid back and the S$150 deposit hold released) → HE #7.
  - "Bike has arrived" (→ 11) is the one primary button in every state.
  - Step progress Pick → Fit → **Deliver** → Ride → Return (flow page); no tab bar.

### Off-system

- `_shared/lead.css` linked as an extra stylesheet (fixed frame and helpers). Checker warning "(lead exception) extra stylesheet".
- Route strip (`.route`): an inline SVG line drawn in tokens (`--line` dashed for the rest of the way, `--sage` for the part done, white stops). Small moment "route draws on" (clip-path, 560 ms).
- Status timeline (`.timeline`): dots and a connecting line from tokens (done: sage fill with check; current: sage ring with a dot).
- The step progress draws on when the page opens (transform scaleX, 560 ms, 80 ms stagger); reduced motion skips it.
- The arrival time rolls to its new value when the state changes (as minutes, so 7:55 → 8:15 passes real times); 160 ms cross-fade with reduced motion.
- Drop-off time buttons (`.slots`), a pill toggle built from the field and chip tokens.
- Bottom sheets from RECIPES §1 for "Change drop-off time" and "Cancel".
- Page classes: `.eta`, `.delay`, `.lines`, `.hero-photo`, `.on-photo`.
- No `direction-b/`: lead pages ship one direction (checker warning "direction-b/index.html is not there yet").

### Assumptions and open questions

- States: default (on time), `#delayed`, `#waiting` (he chose to wait), `#moved` (he picked a new drop-off time).
- Working values, not in the spec: set-up photo at 6:52, left Loop Cycles at 7:05, new drop-off times 8:15 / 8:30 / 9:00 at the same price.
- The delay reason ("held up on the way") is generic on purpose; a real app would show the actual reason.
- Cancel shows the S$53 paid back and the S$150 deposit hold released; "Cancel booking" goes to 09-trips.
- Back goes to 09-trips (he can also come from 08).

### AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: the page, the delay choices and sheets, the route strip and timeline, and this file except "My choice".
- What I decided or changed myself:
