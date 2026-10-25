# Inbox · Build (Claude Code)

Last updated 25 Oct 2026 16:05 by the management chat. **This replaces every earlier task in this file.**

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
