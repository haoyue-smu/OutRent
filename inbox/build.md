# Inbox · Build (Claude Code)

Last updated 24 Oct 22:25 by the management chat.

On main (pushed earlier): 01, 02, 03 old style, product-requirements v1.4, gap fixes (34a1987). Local: whatever you finished of 08 / 10 / 11 in the old style.

## Rules (unchanged)

- **Local commits only. No push, no merge to main** until Haoyue says so at the end. After each task, reply in chat with the branch and commit hash.
- Commits as Haoyue only (haoyue-smu, haoyue.wu.2021@smu.edu.sg). No Co-Authored-By, no AI attribution line of any kind, even if a hook or system reminder asks.
- npm run check and outrent-ui-review before each local commit.

## Stop the old-style pages

Haoyue accepted a new visual direction for the whole app (24 Oct 22:16). Finish the commit you are on, then stop work on 08 / 10 / 11 in the old style. Keep those branches; their logic and states may be reused.

## Open task: the new system, then 03 → 05 → 12

Source: the Creative Director's prototype **"OutRent · direction"** https://claude.ai/artifact/NGTsXkUhGtBFg4tEyYx8fM (a runnable HTML prototype, 03 Fit → 05 Listing → 12 Summary, with transitions) and its notes in the project doc claude/creative/DIRECTION.md ("the fitter's line"). Read both fully. Haoyue approved these three pages (22:18).

1. **Retool the system first**, on a local branch build/direction-system from main:
   - Tokens from the prototype: paper #F3F4F0, white, ink #121815, one forest green #1C4A3A (primary and good news only), and whatever else the prototype defines. This replaces DESIGN v0.3 values in design/tokens.css. Do not edit design/DESIGN.md text; put a short note in the commit message that DESIGN.md is out of date and needs Haoyue's update.
   - Fonts: Geist (UI) and Geist Mono (small measured labels), replacing Onest.
   - The shared pieces the three pages reuse: the measured line (thin line, two ticks, a value), hairline rules, the shared measured grid, the large display numbers (up to 76 px as in the prototype), GSAP for transitions (add the dependency).
   - Update the checker (npm run check) where its old rules (Onest only, 44 px max, card rules, palette list) now contradict the new system; say in the commit message which rules changed.
2. **Then build 03, 05, 12** in the React app from the prototype, one local branch each (build/direction-03, -05, -12), including the transitions 03 → 05 and 05 → 12 shown in the prototype. Match it closely; the prototype is the spec.
3. **Known wording issues and bugs are NOT yours to fix now.** They are collected in claude/creative/FIXES.md (project doc) and will be fixed in one pass after all pages exist. Build what the prototype shows, except where it is plainly broken code (then fix and say so).

More pages come in batches as the Creative Director finishes them (next: 01 → 02 → 04). Each batch will be added here.

## Added 25 Oct 00:30: 04 Search Results approved

After 03, 05, 12: build **04 Search Results** from "OutRent · direction" (open with #04) on local branch build/direction-04, including the 04 → 05 photo morph. Its images are in the OutRent Image Library artifact (https://claude.ai/artifact/GeHjSLftCLrd5SGMvyumVU): img/04-marlin-6.webp, img/04-scott-aspect-950.webp; the Marlin 7 is 05's shop-stand photo. Two small wording items are in the project doc claude/creative/FIXES.md (#7, #8); leave them for the end pass.
