# Review task · round 1, overnight · 25 Oct 2026

Written by the management chat, 25 Oct 04:00. Full plan: **PERSONA-REVIEW-PLAN.md** (v0.2). Read it first; this file adds the emphasis and the local run details. Rules: CLAUDE.md.

## What you review

The Creative Director's prototype, snapshot in **prototype/** (from the artifact "OutRent · direction", version 1792871584-3dff, the Director's v27, taken 25 Oct 03:58). Serve it locally (e.g. `npx http-server prototype -p 8080`) and drive it with Playwright at 393 × 852 (Chromium; also check WebKit if it installs). It loads GSAP from cdnjs and Geist from Google Fonts, so it needs the network. Open pages with `#01` … `#18`; the full route is in docs/DIRECTION.md ("The route"). Review every page and state that exists; list pages and states that do not exist yet (docs/FIXES.md, "States not yet built") as gaps, not as failures of the design.

Write at the top of the report: the snapshot version, the date/time you ran, which browsers ran.

## Sources of truth

- product/MOCK-DATA.md (v1.6) and product/REQUIREMENTS.md (v1.7), plus product/PO-ANSWERS-v1.6.md and -v1.7.md. Where they disagree, MOCK-DATA wins.
- docs/: SITEMAP.md, COURSE-BRIEF.md (IS211 rules), WORDING-RULES.md, BASELINE-CHECKLIST.md (A–D and F; E is replaced by the Director's own system in DIRECTION.md), DIRECTION.md, FIXES.md.
- Already known problems are in docs/FIXES.md: mark a finding "known, FIXES n" instead of re-reporting it.
- Locked: the Creative Director's direction ("the fitter's line"). Disagreement goes in as "needs a decision" with the argument, never as a new direction.

## The emphasis tonight: wording and consistency (Haoyue, 25 Oct 03:36)

Haoyue has already seen many small wording and consistency problems. The bar: **every word must read like a real, shipped app**, not a prototype. So, on top of the cards in the plan:

1. **Build a string table first**, before any card runs: every visible string on every page and state (open every sheet, drawer, toast, notification and after-action state), with page, state, element and role (title, label, value, button, helper, toast, notification). All cards use it.
2. **C5 Copy runs as two cards:**
   - **C5a · line editor:** every string against WORDING-RULES.md, MOCK-DATA, the date form "25 Oct · 7:40", capitalisation, punctuation, units (S$, cm, min), plural/singular, truncation at 393 px, typos, grammar, tone (never "we", no chatty instructions, no promotional tone), jargon a beginner would not know.
   - **C5b · real-app copywriter:** compares the copy with how real shipped apps word the same moment (for example Airbnb, Grab, Strava, Apple Wallet, Uber, Klook, a bike-shop booking app). For each page: where it already sounds real, where it sounds like a prototype or like AI, and the exact replacement string.
3. **C2 consistency** produces the **term table**: every thing that has more than one name across pages (booking / trip / rental, collect / pick up / return, hand-over / handover, deposit wording, shop names, item names, IDs, times, prices), each variant with its pages, and the one form to use everywhere.
4. Every wording finding gives **the exact old string and the exact new string**.

## Output (all inside review/)

- `review/REPORT.md` and `review/report.html`: as in the plan, section 7. report.html is one self-contained page, readable on a phone, screenshots inline (or relative to review/shots/), **explanations in Chinese with English terms and app strings kept in English**. Order: scorecard (incl. a separate **wording score** per page and overall) and journey pass/fail → Top 15 → **Wording** (term table, then all wording findings by page, old → new) → bugs → per page → needs a decision → C7 timing table and feel checklist.
- `review/copy/strings.csv` (the string table) and `review/copy/terms.md` (the term table).
- `review/findings.json` (every finding, plan section 4 fields) and `review/letters/<card>.md`.
- `review/FIXES-append.md`: the findings for the fix pass, by page, in the FIXES.md format (page · state · what is wrong · old → new or the change). The management chat merges it into the project's FIXES.md.
- `review/shots/<card>/…` screenshots.

## Run details

- Cards run in parallel as separate agents that have not seen each other's work; then one merge step.
- If a tool is missing (axe, Playwright trace), install it in this folder; if something still cannot be checked, say what and move on.
- When finished: `git checkout -b review/persona-1` (if not already), add review/, commit as Haoyue (CLAUDE.md), `git push origin review/persona-1`. Reply one line: "done, see review/report.html, pushed review/persona-1 <hash>", and stop.
