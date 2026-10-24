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

## Added 25 Oct 00:56: 01 Home approved

After 04: build **01 Home** from "OutRent · direction" (open with no hash) on local branch build/direction-01, replacing the old 01 on main. Its images are in the OutRent Image Library artifact (https://claude.ai/artifact/GeHjSLftCLrd5SGMvyumVU): img/02-coach-post.webp (the "This weekend" card), img/aisyah-avatar.webp, img/01-cat-bikes.webp, img/01-cat-kayaks.webp, img/01-cat-paddleboards.webp, img/01-cat-camping.webp, img/01-storage-promo.webp. Category and promo values that have no MOCK-DATA behind them are gaps in the project doc claude/creative/FIXES.md (#3–#6); build them as the prototype shows (no invented numbers).

## Added 25 Oct 01:42: 06, 07, 08 approved

After 01: build **06 Delivery & Return → 07 Fees & Liability → 08 Booking Confirmation** from "OutRent · direction" (latest version; use the page links in the prototype), one local branch each (build/direction-06, -07, -08), with the transitions between them and from 05. Any images they use are in OutRent Image Library (https://claude.ai/artifact/GeHjSLftCLrd5SGMvyumVU) or listed in the project doc claude/creative/IMAGES.md. Your old-style 08 branch may hold reusable logic; the look comes from the prototype.

## Added 25 Oct 02:25: 10, 11, 13 approved

After 08: build **10 Delivery Tracking → 11 Handover Check → 13 Weekly Ride** from "OutRent · direction" (v20 or later), one local branch each (build/direction-10, -11, -13), with the transitions 08 → 10 → 11 → 12 → 13. 10's map, moving van and drawer, and 11's record card that folds into a slip, are the key motions; match the prototype's timing. Note from the prototype: never use scrollIntoView (it scrolled the phone frame); scroll only the page's own list.
