# Inbox · Build (Claude Code)

Last updated 25 Oct 2026 16:05 by the management chat. **This replaces every earlier task in this file.**

## NOW (31 Oct 00:35) · Build-1: rebuild /components as a two-layer style guide (replaces the 00:05 trim notes, the plain-English notes and the colour-name notes below)

Management reviewed the live library (6c1babb, ~16,700 px) end to end with Haoyue. Verdict: it is written for engineers, not for the teaching team or a general reader. Worst part: the colour section lists ~50 tokens (`--tag-paper-3`, `--on-forest-ink` …) with page numbers and contrast — a grader looking for "a limited palette" sees 50 colours. Haoyue approved this structure (00:31):

### Layer 1 · Style guide (open by default, about 4–5 screens at 1440 × 900, plain English throughout)
Write for someone who did not build the app and whose English is a second language: short sentences, everyday words, no metaphors, no code names, no page numbers, no CSS values.
1. **Header**: "OutRent style guide" + one plain paragraph: "This page shows the colours, text styles, icons and building blocks used across the OutRent app, and the rules that keep every screen consistent. Everything here is taken from the app's own code, so it always matches the app."
2. **Principles**: six short lines — "Two main colours: an off-white background and forest green." / "Green means the next thing to tap, or good news." / "Colour is never the only signal: a selected option is also filled, a finished step has a tick." / "All text is easy to read (contrast at least 4.5:1)." / "Every button is big enough for a thumb (at least 44 px)." / "Animation only shows that something changed."
3. **Colours**: 7–8 large swatches only (off-white background, forest green, ink for text, grey for secondary text, white for cards, light green, tag paper — or whatever the true main families are). Each: a plain name ("Forest green"), the hex, one line "Used for …". Shades of the same colour are shown as a small strip under their parent swatch, not as separate entries. No token names, no page lists.
4. **Text styles**: 5 levels shown as real samples from the app (big number, page title, section title, body, small label), each with a plain name and size in px only.
5. **Icons**: one grid, icon + plain name. No page numbers.
6. **Building blocks**: one live specimen per kind with one plain sentence of what it is for: buttons (main, secondary, text link, back), options (time chips, day chips), the measuring tape and fit values, cards (one result card, one post), bottom bar and tab bar, sheet / drawer and toast, photo with date caption, done marks (stamp, slip, ring, intake dot, dial token). Show states only where they matter (main button: normal / pressed / disabled). Short labels instead of "USE IT FOR / DON'T USE IT FOR" columns.
7. **Writing**: keep the current "Write this / Not this" table (it is the clearest section).

### Layer 2 · Developer reference (collapsed by default, a single "Full reference for developers" toggle at the end)
Everything else that exists today moves here unchanged in substance: every colour token with hex, used-for, pages and contrast (contrast only for colours used as text, checked against the backgrounds they are actually used on; others "not used as text"), type metrics, spacing, corners, lines, shadows, motion tokens and key motions. This keeps "every colour is recorded" without putting 50 swatches in front of the grader.

### Before the style guide: consolidate the palette (Haoyue 00:33)
design/tokens.css has 128 colour-related entries and 67 distinct solid hex values, mostly near-duplicates made by different pages (e.g. #E4E7E1, #E2E5E1, #E3E5E0, #E5E8E1). Merge colours a person cannot tell apart into one token, so the app keeps the same look with far fewer colours:
- Target about 20 solid colours: greys 4–5 steps (ink, secondary text, tertiary text, line, light line / fill), greens 3–4 (forest, forest-2, mint, light mint), paper / white, tag paper 2–3, one error red (+ its tint). Map and bike-figure colours reuse these steps wherever possible; keep a separate token only where a merge would visibly change a drawing. 18's blue "you" dot may stay (18 is outside the demo).
- Transparent overlays (white or ink at an alpha) stay as overlays of these base colours; shadows stay as they are but should reference the base colours.
- After merging: every page must look the same as before (screenshot 01–17 before and after at 393 × 852 and compare; any visible change must be intended), contrast still passes, npm run check passes.
- Report in the commit message: colour count before → after.

### Ship
Layer 1 checked at 1440 × 900 and 393 px wide (no overflow, no console errors). npm run check; commit as Haoyue; push main; `npx vercel --prod`; `vercel alias set <deployment> outrent-g14t3.vercel.app`. Reply "done, main <hash>".

## NOW (31 Oct 00:05) · Build-1: trim /components to what the grader needs (do together with the drag fix below, one deploy)

Haoyue (31 Oct 00:00): /components is far too long (~30,000 px, ~35 screens) and holds things nobody grading it needs. The grader looks for: a limited palette (two main colours + few accents) with every UI colour recorded, the type scale, a consistent component library, and overall consistency. Aim for about half the length.

**Colour**
- Remove these sections entirely: "Photo overlays", "Map pieces", "Drawings" (illustration / generated-image colours are not the UI palette), "Outside the tokens", "Defined, not used by the app".
- Remove the long "Text on its real ground" table. Instead, in the colour tables, contrast is checked **against the backgrounds each colour is actually used on as text** (e.g. white on forest 10.05 Pass; forest on paper, white, mint and the tag). Colours never used as text (paper, sheet, rules, ticks, fills) show "— not used as text", never Pass/Fail. One line above the tables: "Contrast is checked against the backgrounds each colour is used on as text; WCAG AA 4.5:1."
- Fold "The job tag" and "Text and lines on forest" into the accents group. Keep: the two main colours, neutrals, accents, feedback.

**Typography**: keep "Roles" (the type scale with samples); remove "Every size in use".

**Radii, rules and elevation**: keep radii and rules; elevation shows only shadows the app actually uses, compact (one row of small specimens).

**Components**: keep all groups, but White cards shows 2 representative cards (not 5); remove the "Map pieces" component group; the specimen heading "Pay with" must not appear as a section heading (use a non-heading element); keep Photos (photo frame, dated caption, "Image to come" stand-in), Done marks, Scrolling rows.

**Motion**: keep the tokens; replace "Every motion" with ~5 key motions (page change, sheet, time skip, done mark, fit set-up) in one short table.

**Plain English everywhere (Haoyue 00:27: he cannot understand the intro, the principles or the content itself).** Write for a reader who did not build the app and whose English is a second language: short sentences, everyday words, no metaphors, no jargon.
- Rename sections plainly: "Radii, rules and elevation" → "Corners, lines and shadows"; "Iconography" → "Icons"; "Spacing, layout and grid" → "Spacing and layout". Table column "Role" → "Used for".
- Every section and sub-section opens with one sentence saying what it shows and why it matters (e.g. "Colours: every colour in the app and what each one is for.").
- Intro, replacing the current paragraph: "OutRent's design library. It lists every colour, font size, component and animation used in the app. Two colours lead: an off-white background and a forest green for the main action. Everything on this page is taken directly from the app's code, so it always matches the app."
- Principles, one plain line each: "Two main colours: off-white and forest green. Everything else is grey or a light accent." / "Green means the next thing to tap or good news, nowhere else." / "Colour is never the only signal: a selected option is also filled, a finished step has a tick." / "All text is easy to read: contrast is at least 4.5:1." / "Every button is at least 44 px, big enough for a thumb." / "Animation only shows that something changed or explains what happened. With reduced motion turned on, it jumps straight to the end."
- Colour group names in plain words (Haoyue 00:29: "neutral" and "accent" read as silly jargon): "The two main colours" → "Main colours"; "Neutrals" → "Text, greys and white"; "Green accents" → "Light greens"; "Feedback" → "Warning and error colours" (or name what they are actually used for); in the tables, the "Used for" value says the use in plain words (e.g. "Headings and numbers", "Background of cards"), never "Main / Neutral / Accent". Apply the same rule to every other heading on the page: name things by what they are or do.
- Remove words like "the fitter's line", "marks a tube", "spatial continuity", "reduced-motion end state", "elevation", "affordance" from the page text; component notes say plainly what the piece is and when it is used.

Keep the contents list and Principles. The page must still read everything from the app's own files. Then do the drag task below, check both, and ship once: npm run check; commit as Haoyue; push main; `npx vercel --prod`; `vercel alias set <deployment> outrent-g14t3.vercel.app`. Reply "done, main <hash>".

## NOW (30 Oct 21:10) · Build-1: sideways rows cannot be dragged with a mouse

Haoyue (20:59): on his laptop the 05 photos do not slide. Management's sweep of every live page (desktop 1536 × 864 and phone 393 × 852): no console errors and no broken images anywhere, but **every horizontal row ignores a mouse drag**: 01 the "Rent gear for" medallions (`.meds`), 05 the photo strip (`.rail`), 06 both time-chip rows (`.chips6 .row6`). They move only with a trackpad two-finger swipe or touch. The demo is shown on a laptop inside the iPhone frame, so a click-and-drag must work.

1. One shared helper for every horizontal scroller in the app (these four and any added later): with a mouse (pointerType "mouse"), press and drag scrolls it sideways; on release it settles on the nearest snap point (05 photo by photo, as scroll-snap does for touch). Touch and trackpad keep their native behaviour.
2. A drag must not count as a tap: after a drag of more than ~6 px, swallow the click (no chip gets selected, no photo opens). A plain click still works.
3. Images inside these rows must not start the browser's own image drag (`draggable=false` / `-webkit-user-drag:none`), and text must not get selected while dragging. Cursor: `grab`, `grabbing` while dragging, only on desktop.
4. 05: the five photo ticks also become tappable (jump to that photo), 44 px tall hit area, no visual change.
5. Add the helper to /components (Components → scrolling rows) with a note.
6. Test with a real mouse drag in Playwright on desktop for all four rows, plus touch at 393 × 852; check 06 chip selection still works by click. npm run check; commit as Haoyue; push main; `npx vercel --prod`; `vercel alias set <deployment> outrent-g14t3.vercel.app`. Reply "done, main <hash>".

## NOW (30 Oct 19:10) · Build-1: port prototype v60, make /components the full design library, push main, deploy

Haoyue approved the Creative Director's answer to the team feedback (prototype v60). Also: the components page is graded — the teaching team will look at it — so it must be a complete, formal design library.

### 1 · Port v60 (prototype/v60/, see prototype/v60/CHANGES.md)
Bring 02, 04, 05, 06, 14 and 17 in the app to v60 exactly (open prototype/v60/index.html #02, #04 … to compare), keeping the app's real state. Nothing else changes. npm run check and outrent-ui-review on each changed page.

### 2 · /components = the OutRent design library (IS211 grading)
What the course grades (team/COURSE-BRIEF §1, §7): "detail and polish, consistent look"; a design system with a limited palette (about two main colours, the rest accents); a component library; every colour used is recorded in the colour scheme (the grader's own rule); contrast ≥ 4.5:1; one dominant colour + accents; never colour alone; 44 px targets; motion only as feedback.
Make https://outrent-g14t3.vercel.app/components one long, well-organised page, built from the app's own tokens and components (so it cannot drift), in the app's own look, readable on desktop:
- **Header**: OutRent design library, version and date, one paragraph on the idea (the fitter's line), a contents list linking to each section.
- **Colour**: **every** colour the app uses (search the CSS for every literal colour, gradient and rgba; anything not a token becomes a token or is listed). For each: swatch, token name, hex, role (main / accent / neutral / feedback / photo overlay), where it is used, and its contrast ratio against paper and white with AA pass/fail. Show the two main colours first (paper + forest) and say which are accents.
- **Typography**: Geist and Geist Mono; the full type scale with size / line height / weight / tracking for each role (display numbers, titles, body, small, mono labels), shown as real samples.
- **Spacing, layout and grid**: 393 × 852 frame, gutters, the spacing steps, safe areas.
- **Radii, rules and elevation**: every radius, hairline and shadow, with where each is used.
- **Iconography**: every icon the app uses, at size, with its name.
- **Components**, each as a live specimen with its states (default, pressed, selected, disabled, focus) and a one-line "use it for / don't use it for": buttons (primary pill, secondary, text link), the dock, back button (plain and on-photo), top bar, tab bar, white cards (result, post, docket, record, booking), chips (incl. v60's scrolling time chips), the tape (ruler input), the measured line and measured grid, sheets and drawers (incl. 02's drawer), toast, photo frame + dated caption + "Image to come" stand-in, list rows, the done marks (08 stamp, 11 slip, 13 ring, 17 dial token, 15 intake dot), map pieces.
- **Motion**: the motion tokens (durations, easings), what each motion explains, reduced-motion behaviour.
- **Writing**: the wording rules (no "we", labels over sentences, say when it happens, money says what it is, date form "25 Oct · 7:40").
- Keep the existing live-preview idea (`?seed=`) where it helps.
Also keep `design/components.html`, `components.css`, `tokens.css` and `recipes.html` in step with it. Do not edit design/DESIGN.md text; say in the commit that it is out of date.

### 3 · Ship
npm run check; commit as Haoyue (no AI attribution); push **main**; `npx vercel --prod`; `vercel alias set <deployment> outrent-g14t3.vercel.app`; open https://outrent-g14t3.vercel.app/components and /02-coach-kit to confirm. Reply one line: "done, main <hash>, /components".

## NOW (25 Oct 20:55) · Build-1: make the hidden reset work for Haoyue

Haoyue (20:52) cannot trigger the 3-second hold on the Home logo on his laptop, although Management's Playwright mouse hold on the live site works (toast shown, storage cleared). Likely cause: he uses touchpad tap-to-click, which sends a short click, never a held button; a held press also gives no sign it is counting.

1. Keep the 3-second hold, and add a second trigger on the same logo: **3 taps in a row, each within 1 second of the previous one** (Haoyue 21:13: 5 taps in 2 s is too strict; count pointerup; works with touchpad taps, mouse clicks and fingers). Either one resets.
2. While a hold is running, fade the logo to 40% opacity over the 3 seconds (a quiet sign it is counting; back to 100% if cancelled). No other hint.
3. Make the logo's hit area at least 44 px tall (padding, not a bigger image) so a finger or touchpad tap lands on it.
4. Test on the live site after deploy: 3 clicks about half a second apart → reset; 2 clicks do nothing + "Demo restarted"; 3-second mouse hold → reset; a single click does nothing; emulated touch at 393 × 852 both ways.
5. npm run check; commit as Haoyue (no AI attribution); push main; `npx vercel --prod`; `vercel alias set <deployment> outrent-g14t3.vercel.app`. Reply one line: "done, main <hash>".

## NOW (25 Oct 20:35) · Build-1: keep progress until a reset link, then redeploy

Bug Haoyue found on the deployed app (outrent-g14t3.vercel.app): after he saves anything (fit, delivery times, …) there is no way back to the starting state. `app/src/shell/store.ts` keeps the story in sessionStorage and `reset()` is never called. Haoyue (20:28): **no visible button or tab for this.** Progress should stay until he deliberately resets it with a link.

1. **Progress is kept for good:** move the store from sessionStorage to localStorage (same key). Closing the tab, reopening the link, a new tab and the iPhone home-screen app all continue where he left off.
2. **Reset by link:** opening `https://outrent-g14t3.vercel.app/reset` (and `/?reset` as an alias) clears the stored state and any saved navigation, then replaces the URL with `/` and opens 01 Home in the seed state (Wed 22 Oct, no fit, no booking), with first-visit intros as on a fresh open. Add the `/reset` route to the Vercel SPA rewrite so it does not 404. Nothing on screen links to it.
3. **Hidden press-and-hold (Haoyue 20:31: keep it; it must work on his laptop too):** pressing and holding the OutRent logo at the top of 01 Home for 3 seconds does the same reset, on every device: mouse or trackpad (hold the click), finger on the iPhone (Safari and the home-screen app), pen. Build it with **pointer events** (`pointerdown` starts a 3 s timer; `pointerup`, `pointercancel`, `pointerleave` or moving more than ~10 px cancels it), not touch or click events. Stop the browser's own long-press behaviour on the logo so it cannot steal the hold: `-webkit-touch-callout:none`, `user-select:none`, `-webkit-user-drag:none` / `draggable=false` on the image, `touch-action:none` on the logo only, and `preventDefault` on `contextmenu` there. A normal short tap on the logo does what it does today (nothing). No visual hint during the hold; after the reset a short toast "Demo restarted". The Profile tab stays as it is.
4. Check: save a fit and book, close and reopen → still there; open /reset → Home in the seed state, 03 empty on step 01, 06 no times, 09 and 14 in the seed state; a 3-second hold on the logo does the same, tested with the mouse on desktop (iPhone frame) and with touch emulation at 393 × 852.
5. npm run check; commit as Haoyue (no AI attribution); push main; `npx vercel --prod`. Reply one line: "done, main <hash>, <URL>".

## NOW (25 Oct 18:00) · Build-1 only: finish, put it on GitHub main, deploy

Haoyue (17:56): after the PO v1.8 change, push to GitHub **main**, with the README, then deploy. No E1–E7 run needed this time. **This lifts the no-push-to-main rule for this task only.**

1. On build/v52-app (18f127d): apply the PO-ANSWERS-v1.8 facts listed under "The spec" below (07/08 deposit held on Visa ···4821 with S$50 by PayNow; 17 slots; 09 dates without weekday). npm run check; commit.
2. Rewrite `README.md` at the repo root as a formal public project README (the repo may be made public as a showcase): what OutRent is (SMU IS211 Interaction Design and Prototyping, Iter2 high-fidelity prototype: peer-to-peer rental and storage of bulky outdoor gear in Singapore, persona Daniel), the live demo link (fill in after step 4), a screenshot, how to run it (`npm --prefix app install`, `npm run app:dev`), how it is built (React + Vite, GSAP, the design system, the components page at /components, the mock data in product/), the folder map, and the team: Haoyue Wu (lead, as "haoyue"), Amanda Kong, Harwin Halim, Joshua Sau, Nguyen Minh Tuan, Shanise John David, Leong Kai Jun. Plain, short English. No AI attribution.
3. Merge into main: `git fetch origin`, then merge build/v52-app into main, and also merge origin/product-requirements (REQUIREMENTS v1.8, MOCK-DATA v1.7) so product/ on main is current. Resolve conflicts in favour of build/v52-app for app/ and design/, and product-requirements for product/. npm run check must pass. Commit as Haoyue (no AI attribution), then `git push origin main`.
4. Deploy with the Vercel CLI from the app folder: `npx vercel` once to link the project (framework Vite, root the app folder, build `npm run build`, output `dist`), then `npx vercel --prod`. On the first run Vercel opens a browser for Haoyue to log in: tell him in one line and wait; he logs in himself (never create an account or type a password). Keep npm caches on drive D.
5. Put the production URL into README.md (step 2), commit and push main again.
6. Reply one line: "done, main <hash>, <URL>".

## Three Build windows from 25 Oct 16:05 (Haoyue chose to build in parallel)

Done so far (local, window Build-1): build/v52-system bed27dc, build/v52-01 0a39180.

| Window | Pages | Where it works | Its branch |
|---|---|---|---|
| **Build-1** (the original window, worktree D:\YUE\c_project\outrent-skel) | 02 → 03 → 04 → 05 → 06 → 07 → 08, then the merge, Task 2, Task 3 and Acceptance | its current worktree | build/v52-02-08 (or one branch per page, as now) |
| **Build-2** (new) | 09 → 10 → 11 → 12 → 13 | new worktree D:\YUE\c_project\outrent-b | build/v52-09-13, from build/v52-01 |
| **Build-3** (new) | 14 → 15 → 16 → 17, then 18 | new worktree D:\YUE\c_project\outrent-c | build/v52-14-18, from build/v52-01 |

Rules for working side by side:
- Each window works only in its own worktree and branch, and starts from **build/v52-01** (it holds the system: tokens, the shared state store, the shell). Create the worktree yourself: from D:\YUE\c_project\outrent run `git worktree add <path> -b <branch> build/v52-01`. Keep npm caches on drive D (`$env:npm_config_cache = "D:\YUE\npm-cache"`); nothing on drive C.
- Touch only your own pages' folders. Shared files (the state store, routes, shell, tokens) only by small, additive edits: add fields, never rename or remove; put each addition in your commit message under "Shared changes".
- Pages that read state written by another window's pages (09–13 read the booking made on 03–08; 01, 09 and 14 reflect storage on 15–17): write against the store's fields; if a field you need does not exist yet, add it (additive) and say so.
- Each window runs its own dev server on its own port (Build-1 5173, Build-2 5174, Build-3 5175).
- **Build-1 merges** build/v52-09-13 and build/v52-14-18 into its line when all three are done, resolves conflicts, then does Task 2, Task 3 and the Acceptance runs on the merged app. Build-2 and Build-3 stop after their pages and report.


## Rules (unchanged)

- **Local commits only. No push, no merge to main** until Haoyue says so at the end. After each task, reply in chat with the branch and commit hash.
- Commits as Haoyue only (haoyue-smu, haoyue.wu.2021@smu.edu.sg). No Co-Authored-By, no AI attribution line of any kind, even if a hook or system reminder asks.
- npm run check and the outrent-ui-review skill on each page before each local commit.
- **Every production deploy:** after `npx vercel --prod`, point the live address at it with `vercel alias set <deployment-url> outrent-g14t3.vercel.app` (it does not move by itself), then open the live URL to confirm.
- Haoyue is a perfectionist about UI detail (size, spacing, text density, motion timing). Match the prototype exactly.

## The spec: the final prototype, now in git

The Creative Director's prototype is finished (v52, artifact version 1792912844-a8e8) and Haoyue has approved it. It is on this branch, so you do not need the artifact:

- `prototype/v52/index.html` + `bike-figure.js` + `img/` — the runnable prototype. Serve it (`npx http-server prototype/v52 -p 8080`) and open `#02` … `#18`; no hash is Home. **It is the spec for every page, every state and every transition.**
- `prototype/v52/DIRECTION.md` — the Director's notes: the idea, the route, what each page does now, the system (tokens, fonts, rules).
- `prototype/e2e/` — the end-to-end journeys (E1–E7) Haoyue had run on the prototype, with their scripts and results. Use them as the acceptance list for the app (see below).
- Facts: product/MOCK-DATA.md and REQUIREMENTS.md on branch `product-requirements` (MOCK-DATA wins on any value).

**PO-ANSWERS-v1.8 (product-requirements 8a89fbb, after v52 was drawn) applies on top of the prototype:**
- 07 and 08: the S$50 is paid by PayNow; the S$150 deposit is **held on Visa ···4821**, not charged, released after the return check (a PayNow transfer cannot hold money). 07 shows the pay line and a deposit line saying it is held on Visa ···4821; 08 shows "Paid · S$50 · PayNow" and the deposit held on Visa ···4821. Keep the prototype's layout; only these facts change.
- 17: home collection has a 17:00–19:00 slot every day Sat 25 – Fri 31 Oct, pooled runs Tue 28 and Fri 31 Oct; Tue 28 is Daniel's choice.
- 09: dates with a time drop the weekday ("30 Oct · 20:00").

Any page you built from an older prototype version must be brought up to v52 (03, 06, 12, 16, 17 changed a lot after 24 Oct).

## Task 1 · the whole app from v52

Build all pages in the React app (split across three windows, see the table above), in route order: system → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17, then 18 last (out of the demo scope; lowest priority). One local branch per page or batch, as before.

**One difference from the prototype: real state.** The prototype is a fixed demo route (other choices only show a note). The app must carry every choice through to every later page that shows it: the fit numbers from 03, the hand-over place, delivery and collection times, payment method, the weekly ride, the storage way (door / Rack S), rent-out on/off, the return booking. Home, Bookings and My gear must reflect what has happened (booking made, ride closed, weekly ride set up, bike at the Hub). Values not seeded in MOCK-DATA: do not invent them; write the gap in your commit message.

## Task 2 · the components page

Bring `design/components.html` (with `components.css`, `tokens.css`, `recipes.html`) up to the new system, so it shows every shared piece of the app as it is now: tokens (colours, type scale, Geist / Geist Mono), the measured line and measured grid, hairline rules, display numbers, buttons and the dock, back buttons (plain and on-photo), tab bar, white cards, chips, the tape (ruler input), sheets and drawers, toast, photo frames and the "Image to come" stand-in, the done marks (stamp, slip, ring, dial token, intake dot), plus each component's states (default, pressed, disabled, selected) and its motion. Build it from the same CSS / React components the app uses, so the page cannot drift from the app. DESIGN.md text is out of date: do not edit it; say so in the commit message.

## Task 3 · runs on a phone, and shows in an iPhone frame on a computer

- **Phone:** the app works as a home-screen web app: web app manifest (name OutRent, icons from design/brand, display standalone, theme colour #F3F4F0), apple-touch-icon, `viewport-fit=cover`, safe-area insets, no browser bounce. Opened on an iPhone it fills the screen like a native app.
- **Computer:** the same URL on a wide screen shows **only an iPhone 16 frame (393 × 852) centred on a plain page, with the app inside and fully clickable. Nothing else on the page** (no side notes, no labels, no page list). The prototype's own desk view is not this: drop its side notes.
- **Deploy with the Vercel CLI from this machine** (Haoyue 25 Oct 15:26), so nothing is pushed to GitHub: add an SPA rewrite (`vercel.json`) and make `npm run build` produce the static site; then, when Haoyue says go, run `npx vercel` (preview) / `npx vercel --prod` from the app folder. The first run asks Haoyue to log in to Vercel in the browser (he does that step himself; never create an account or type a password for him). Report the URL. No GitHub integration, no push.
- **Not drawn, not built (Haoyue 25 Oct 15:26):** 10 delay, 11 report a problem, 13 skip / pause / stop, 09 booking detail, 14 other items. Keep them as the prototype has them (a short "not in this demo yet" note).

## Acceptance

Before you report a batch done: walk its journeys from `prototype/e2e/` (E1 default rental, E2 different choices, E3 beginner from Home, E4 back and forth, E5 weekly regular, E6 owner and storage, E7 chaos: tab switches, double taps, reloads, reduced motion) on the app with Playwright at 393 × 852, adapting the selectors to the app. Everything that failed on the prototype only because it was a fixed route must pass on the app. Report pass / fail counts in the commit message.

## How to report

One line in chat per finished task: "done, <branch> <hash>".
