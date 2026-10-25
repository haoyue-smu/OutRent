# End-to-end test brief (round 1b, 25 Oct 2026)

You test the OutRent prototype ("OutRent · direction" v27) END TO END as a real user would: start at Home and get everywhere by tapping only — never jump with a #NN hash after the start, never call page functions. A scripted run with assertions, not a screenshot review.

## Setup
- Live prototype: http://localhost:8081/index.html (opens on 01 Home, Wed 22 Oct). Viewport 393×852, hasTouch, Chromium. Playwright: run node with cwd /home/claude/review-tools (`require('playwright')`). Also try WebKit (`require('playwright').webkit`) once for the main path; if it isn't installed, say so and skip — do not spend time installing.
- Wait for animations between steps (the app uses GSAP; time skips take ~3.2 s, the 10 van ride ~8 s). Prefer waiting for the target screen (`.screen.on` id, e.g. s06) over fixed sleeps.
- Sources of truth: /home/claude/review-input/product/MOCK-DATA.md (wins), REQUIREMENTS.md, PO-ANSWERS-v1.6/-v1.7.md; route in /home/claude/review-input/docs/DIRECTION.md; already-known problems in /home/claude/review-input/docs/FIXES.md (mark "known, FIXES n"; states listed as not built are gaps, not failures).
- OUT OF SCOPE (Haoyue): page 18 and everything only on 18. Wording/style nits are out of scope too — the persona review already covered them. You test BEHAVIOUR: does every choice the user makes carry through correctly to every later page, does every control do what it says, can the user always get back, does state survive back/tab/re-entry, do numbers stay right.

## What every journey checks (assert, don't eyeball)
- After each step: which screen is on (`.screen.on` id), the key values shown (date, time, place, price, IDs, fit numbers, payment method), compared with (a) what the user chose and (b) MOCK-DATA.
- Carry-through: every choice (fit numbers, delivery place, times, payment method, weekly, storage option, return date) must appear correctly on every later page that shows it (05, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17). A value that silently falls back to the default is a bug.
- Navigation: back from each page lands where its label says; tabs work mid-flow and coming back keeps state; no dead ends; no way to get stuck or loop.
- Console errors and page errors.
Save a screenshot for every failure in /home/claude/review-out/e2e/shots/<JOURNEY>-<n>.png.

## Output (only these files)
- /home/claude/review-out/e2e/<JOURNEY>.json — array of results: {"journey","persona","step","action","expected","actual","pass":true|false,"severity":0-4 (for failures: 4 blocks the demo, 3 wrong data shown / dead end, 2 confusing but recoverable, 1 polish),"known":"FIXES n"|null,"shot":"e2e/shots/…"|null,"fix":"concrete change for the Creative Director"}. Include passing steps too (short), so the run is auditable.
- /home/claude/review-out/e2e/<JOURNEY>.js — the script you ran (so it can be re-run after the fix pass).
- /home/claude/review-out/e2e/<JOURNEY>.md — 5–15 lines: steps run, passed/failed, the failures ranked, and as the persona: one line on how the journey felt end to end.
Finish with one line: "done <JOURNEY> <passed>/<total>, <failures> failures".
