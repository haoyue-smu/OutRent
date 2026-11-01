# Inbox · Build-2 (A/B test site)

Written only by the management chat. Read with `git show origin/ops:inbox/build-abtest.md`.

## UPDATE 11 (1 Nov 11:15): a more obvious drivetrain pair · urgent, recruiting waits for this

Haoyue and a teammate, both knowing the test, missed the chain on the ground in the current photo. New pair, **portrait 3:4 (1086 × 1448)**, on ops: `inbox/assets/ab/shop-drive-v2.webp` and `inbox/assets/ab/mine-drive-v2.webp`. The chain heap fills the lower third of Daniel's photo.

1. Replace the drivetrain pair (shop and Daniel's) with these two, everywhere: camera preview, slot, viewer, report thumbnails. Crank and saddle pairs stay.
2. **Camera preview:** the portrait photo fills the screen (`object-fit: cover`, `object-position: 50% 70%` so the chain heap stays in view on short and tall phones). Crank and saddle previews keep their current fit.
3. **Slot (7:5) and report thumbnail:** `object-fit: cover; object-position: 50% 60%`. Management checked this crop at 160 × 114: the shop photo shows the chain on the bike, Daniel's shows the chain hanging and the heap on the ground.
4. **Viewer (tap to enlarge):** whole photo, contained.
5. No ring on either drive photo. Tags stay where they are now (top right).
6. Remake the two preference pictures (Q4).
7. Rerun the flows, A/B pixel check, deploy. Hand back the commit and three 390 × 844 screenshots: the drivetrain preview, the record card after the three photos (A), and the same in B.

Do this before anything else in this file.

## UPDATE 10 (1 Nov 10:45): one-line fix on the scenario task card · do it right after the agent report

Haoyue on his iPhone: "Do the hand-over check before you ride." breaks as "Do the hand-over / check before you ride.", while the next line fits on one line. Cause: `.t-h2` in `design/components.css` has `text-wrap: balance`, which evens out the two lines. Fix in the test only, do not touch `design/components.css` (the live app uses it):

- `app/src/abtest/abtest.css`: `.ab-task .t-h2 { text-wrap: pretty; }`
- In the copy, keep "hand-over" from breaking at the hyphen: use a non-breaking hyphen (U+2011) in that one word on S1.

Expected at 390 px: "Do the hand-over check before / you ride." or one line, never "Do the hand-over / check before you ride." Screenshot S1 at 390 × 844 and 375 × 667, deploy, hand back the commit. Real participants may already be using the site; the change is identical for A and B, so deploy as soon as it passes.

## After UPDATE 9: next task

When UPDATE 9 is deployed, read `git show origin/ops:inbox/build-agent-pilot.md` and do it. It is a separate runner next to the test site; it does not change the site.

## Data table (rule changed 1 Nov 10:45, replaces the 31 Oct 23:58 rule)

**No truncate.** Real participants are the rows with `pilot = false and forced = false`; the analysis uses only those. Pilot and forced rows keep their own block sequence (your `block_seq` design), so they never take a real participant's place in the pairs. You may therefore keep using `?v=` and `?pilot=1` links, including for Run D and the usual flows, while real participants are on the site. Never open the plain link (no `v`, no `pilot`) in a test: that creates a real row.

## UPDATE 9 (31 Oct 23:15): the task line, agreed with the team

One copy change on S1, the scenario screen, and the task card must be the most prominent thing on the sheet (Haoyue 23:09). The card now reads:
- eyebrow `Your task`
- line 1, at the app's h2 size, weight 600: `Do the hand-over check before you ride.`
- line 2, the same size and weight, not a caption: `If anything's wrong, let the shop know.`

Make it stand out: the card keeps its white background and radius, gets a 2 px forest left border or a forest eyebrow, 20 px padding, and a 24 px gap from the paragraphs above. The three scenario paragraphs above it stay in the body style. Anyone glancing at the screen must read the task first and the story second. Still no scrolling at 375 × 667: shorten the photo before anything else.

Remove `Do what you'd normally do with a rental before riding off.` and `Just do what feels natural.` from the bundle. Nothing else changes: no card after the third photo, no new columns.

Also check UPDATE 8 on the live site: at 390 × 664 (iPhone 13 in Safari with its bars) the S0 photo is 322 px, 48 % of the viewport. The spec says at most 40 %. If the live site is not yet bf809d0, deploy it; if it is, bring the photo down to 40 % and give the room to the sheet.

Rerun the flows, deploy, hand back the commit and S1 at 390 × 844.

## Note (31 Oct 21:15): teammates are trying the pilot links tonight

Haoyue's team is opening `?v=a&pilot=1` and `?v=b&pilot=1` on their own phones from about 21:15. Deploy UPDATE 8 as soon as it passes; do not deploy anything half-done in between. All their rows are `pilot = true`.

## UPDATE 8 (31 Oct 21:10): the sheet is too small on S0, S1 and S9

Haoyue's screenshot (a tall viewport): the photo takes two thirds of the screen and the sheet is squeezed at the bottom. Fix on all three photo-sheet screens:
- The photo takes **at most 40 % of the viewport height** (never less than 220 px); the sheet gets the rest, at least 55 %.
- Inside the sheet: title at the app's h1 size, body line height 1.55, 16 px between paragraphs and rows, 24 px above the button, 24 px side padding.
- The sheet's content is vertically distributed, not stacked at the top with a gap before the button: put the gap between the rows and the button, so the button always sits at the bottom of the sheet.
- Still no scrolling at 375 × 667 and 390 × 844; check 430 × 932 and a desktop window 1440 × 900 (column centred, 430 px wide) too.

No copy changes. Deploy, hand back the commit and S0 at 390 × 844 and 1440 × 900.

## UPDATE 7 (31 Oct 20:45, replaces the 20:40 version): the test's own screens, redesigned

Haoyue's standard for every screen outside the app: **a stranger who opens the link must want to continue.** Short lines, one idea per line, air between things, something pleasant to look at. If a screen reads like a form or a consent notice, it is wrong. Treat these screens as a small product of their own, built with the app's tokens, type and photos, following the conventions of research tools (Maze, Lyssna): one question per screen, big full-width option rows, a fixed primary button at the bottom, a small progress line at the top.

Delete the current entry, questions and preference screens and build the flow below. The hand-over page, camera, report form and sent screen stay as they are.

### S0 · Welcome (speaks to the participant)
Photo sheet layout (the one you built in UPDATE 4): the Marlin 7 photo on top, the paper sheet below.
- Title: `Thanks for helping us out!`
- One paragraph: `We're SMU students building OutRent, an app for renting bikes and outdoor gear. You'll try one screen of it.`
- Three rows, each an icon from the app's set plus one line (icon left, text right, like the app's list rows):
  - clock icon · `About 3 minutes`
  - camera icon · `You'll take a few photos. The camera is a mock-up, your real camera stays off.`
  - lock icon · `We only record taps and timings. Nothing personal.`
- Button: `Continue`

### S1 · Scenario (puts them in the role)
Full-bleed photo `work/haoyue/06-delivery-return/assets/06-direction-handover-spot.webp` (the trailhead carpark) with the paper sheet below, same construction as S0.
- Eyebrow: `Your scenario`
- Title: `You're Daniel`
- Three one-line paragraphs, body style, line height 1.5, a gap between them:
  1. `You rented a mountain bike for a Saturday morning ride.`
  2. `The shop just dropped it off here, at the trailhead.`
  3. `There's a S$150 deposit on your card until you return it.`
- A small card (white, the app's card radius) with eyebrow `Your task` and one line at weight 600: `Do what you'd normally do with a rental before riding off.` Under it, caption style: `Just do what feels natural.`
- Button: `Start`. This tap is `t0` and creates the row (what Start did before).

### Task · the hand-over page, A or B · unchanged

### Q1 to Q5 · one question per screen
Shared layout: paper background; top line in the mono caption style `1 of 5` … `5 of 5`; the question as the page title (the app's h1 size); options as full-width white rows with a radio on the left, 56 px tall, 8 px apart; selecting one fills the radio forest; the `Next` button is fixed at the bottom and disabled until the required answer exists. Optional text fields sit under the options, one line tall, growing as they type. Each screen also logs its own `t_q<n>_done`.

- **Q1 · 1 of 5.** `Did you notice anything wrong with the bike?` Rows: `Yes` / `No` / `Not sure`. Required. Column `noticed`.
- **Q2 · 2 of 5.** `Overall, how difficult or easy was the task?` A 1 to 7 row of seven square tiles, ends labelled `Very difficult` and `Very easy` under the tiles. Required. Column `seq`. (Standard SEQ wording; do not change.)
- **Q3 · 3 of 5.** `How easy was it to find where to report a problem with the bike?` The same 1 to 7 tiles, ends `Very hard` and `Very easy`, plus one full-width row under them: `I didn't look for it`. Required (a tile or the row). Columns `find_ease` (1 to 7 or null), `find_not_looked` (boolean). Under it an optional field, placeholder `Where did you look first? (optional)`. Column `find_where`.
- **Q4 · 4 of 5.** `Which layout would you rather use?` Caption under the title: `Two versions of the page you just used. Tap a picture to see it full size.` Then the two full-page pictures side by side with the yellow outline on the link block (from UPDATE 5), each with a radio row under it: `Report link at the top` / `Report link at the bottom`. Random left/right, `preference_left` logged. Required. Under them an optional field `Why? (optional)`. Columns `preference`, `preference_why`.
- **Q5 · 5 of 5.** Title `About you`. Caption: `So we can describe who took part.` Three short groups on one screen, each a small heading in the eyebrow style and its rows:
  - `How often do you cycle?` · `Never` / `A few times a year` / `Monthly or more` · column `cycling`
  - `Rented sports or outdoor gear before?` · `Yes` / `No` · column `rented_before`
  - `Your age` · `18 to 24` / `25 to 34` / `35 to 44` / `45 or older` / `Prefer not to say` · column `age_band`
  All three required. Button `Finish`.

### S9 · Thank you
Photo sheet (the S0 photo). Title `Done, thank you!` One line: `You can close this tab now.` Nothing else.

### Removed
The open question "If something was wrong with the bike, where would you go to tell the shop?" (`open_text`), the three-row card on the old entry, and every sentence of the old entry copy. Keep the `open_text` column in the table (null from now on) so old pilot rows still load.

### Data
- New columns: `find_ease`, `find_not_looked`, `find_where`, `cycling`, `rented_before`, `age_band`, `t_q1_done` … `t_q5_done`. Put them in `schema.sql` and in `migration-3.sql` (which also rebuilds `ab_results`). `t_questions_done` = `t_q3_done`; `t_finish` = `t_q5_done`.
- `order`, `record_saved`, `t_end`, the report fields and the events are unchanged.

### Look
Use the app's tokens only. Photos: the two named above, fitted, never stretched. The sheet corners, buttons, rows and radios are the app's own components (reuse them from `app/src`), so the test looks like the same family as the hand-over page. No new colours. No emoji.

### Acceptance
- Fits without scrolling at 390 × 844 and 375 × 667 on S0, S1, Q1, Q2, Q3 and S9; Q4 and Q5 may scroll.
- Flows rerun (both versions, both browsers): report path, save-only path, "I didn't look" path.
- Bundle grep: none of the removed sentences.
- Screenshots at 390 × 844 of S0, S1, Q1, Q3, Q4, Q5 in the hand-back, plus the commit and `migration-3.sql`.

## UPDATE 6 is GO (31 Oct 19:55): the six photos are on ops, plus one copy line

`inbox/assets/ab/{shop,mine}-{crank,saddle,drive}.webp`, 1536 × 1024 each (3:2), checked by Management at slot size.

**Cropping to 7:5:** crank and saddle pairs: centre crop. **Drive pair: anchor the crop to the bottom** of the image (keep the bottom edge), so the chain lying on the ground stays in Daniel's photo; use the same crop on the shop's photo so the pair matches.

**Ring positions, measured by Management on the 7:5 centre crops (percent of width, height); check by eye and adjust:**
- shop crank, the scratch on the crank arm: about (55, 51).
- shop saddle, the scuff on the saddle's edge: about (15, 39).
- No ring on the drive pair, and no ring on any of Daniel's photos.

**One more line on the entry, Haoyue 19:44.** Add to the entry sheet, as a third caption line under the Start button: `Tapping "Take photo" won't open your camera. The photos are already taken for you, it's a prototype.` Same in both versions.

Then everything in UPDATE 6 as written: `Use photo` tap, the compare line, remake the preference pictures, flows, deploy. Hand back the commit, the ring positions you used, and a 390 × 844 screenshot of the record card after the three photos.

## UPDATE 6 (31 Oct 15:15): photos a general audience can read, and two small flow changes

Haoyue's decision: the test site gets **its own six photos**, made for clarity, not for the app's film look. The live app keeps its images. Reason: the current photos are grainy and shallow, and a bent derailleur is damage only a cyclist recognises. Participants are a general audience.

**The photos** arrive on ops under `inbox/assets/ab/` as six files: `shop-crank`, `shop-saddle`, `shop-drive`, `mine-crank`, `mine-saddle`, `mine-drive` (.webp or .png). They are 3:2; crop each to 7:5 around the subject. Put them under `work/haoyue/_abtest/assets/` and use them in the test site only.
- The shop's crank and saddle photos still carry one scratch and one scuff: **re-place the two white rings** over the marks on the new photos (find the coordinates by eye, report them).
- The shop's drivetrain photo shows the chain in place. **Daniel's drivetrain photo shows the chain off and lying on the ground.** That is the damage now. Nothing in the copy names it.
- Remake the preference-screen pictures (UPDATE 5) after the swap.

**Flow change 1: "Use photo" must be tapped.** The simulated camera shows the preview (no 1 s timer any more); the participant taps `Use photo` to put it in the slot. `Retake` shows the same preview again (log the tap). `t_damage_visible` is still the moment the drivetrain preview appears. Log `photo_use_tap` with the time.

**Flow change 2: one line on the entry.** After "Use the app like you normally would before you ride off." add the sentence `Compare what you see with the shop's photos.` Same paragraph.

Do UPDATE 4 and 5 now and deploy. Do UPDATE 6 when the photos are on ops (Management will say so in this file), and deploy again.

## UPDATE 5 (31 Oct 15:05): the preference screen does not show the difference

Haoyue's screenshot shows three problems:
- The two pictures are tiny.
- In "Link at the bottom" **the link is not in the picture at all**: it is below the fold of a before-photos screenshot.
- The participant cannot see what they are choosing between.

This was a fault in Management's brief, which asked for before-photos screenshots. Fix it as follows.

- **New pictures:** each version is shown as the **whole page, top to bottom**, after the three photos are taken (the state the participant just decided in), scaled down to fit the column.
  - The link block in each is marked with the same outline: 3 px `#E6B800`, offset 3 px, as in the flow artifact.
  - Even at this size, the participant sees at a glance "link at the top of the page" against "link at the bottom of the page".
  - Make them with `?v=a` / `?v=b` at 390 px wide, full-page.
- **Size:** the two pictures side by side, as tall as the screen allows above the Why field. Do not crop them.
- **Tap to enlarge:** tapping a picture opens it full size in the same viewer as the hand-over photos (scrollable when taller than the screen; close with ×). Log the event `pref_view_open` with `data: { version }`.
- **Choosing:** a tap on the caption or on the radio under each picture selects it. The selected one gets a forest border, as now. Keep the random left/right order, and `preference_left`.
- Nothing else changes, and no new column is needed (the views are only events).

Do UPDATE 4 and UPDATE 5 together and deploy once. Add a screenshot of this screen at 390 × 844 to the hand-back.

## UPDATE 4 (31 Oct 15:00): the entry screen looks like a form, not like OutRent

Haoyue saw it on his iPhone and finds it ugly: a wall of grey text at the top, half the screen empty, then a button. It must look like a screen from the app.

**Layout: the same idea as page 07** (a sheet over the Marlin 7 photo).
- **The photo** `work/haoyue/07-fees-liability/assets/07-direction-backdrop-marlin7.webp` (portrait, the Marlin 7 on the grass at the trailhead in morning light) fills the screen behind everything. Crop so the whole bike sits in the upper half.
- **A paper sheet** (`--paper`, the app's large top radius) rises from the bottom and holds, in this order:
  1. the eyebrow `SMU IS211 · OutRent`;
  2. the title `Your bike's here`;
  3. the Daniel paragraph and the "Use the app…" paragraph, in the app's body style (ink, not grey);
  4. the Start button;
  5. under the button, in the small caption style, two short lines: `Hi! We're SMU students building OutRent for our IS211 project. Thanks for helping us test it.` and `We don't collect names or any personal info.`
- The sheet takes only the height it needs. No empty band.
- The safe areas are respected: the photo runs under the status bar, and the button clears the home indicator and Safari's bottom bar.
- **Motion:** at most the sheet rising once on load (about 300 ms). Reduced motion shows the end state.

**The thank-you screen:** the same photo and sheet, holding only `Done, thanks a lot! You can close this tab.`

The words are unchanged; only their order and look change. The questions and preference screens stay as they are.

Then:
- rerun the flows;
- screenshot the entry at 390 × 844 and at 375 × 667 (small phone: the whole sheet, button included, must fit without scrolling);
- commit, push `abtest` and redeploy.

Hand back the commit and the two screenshots.

## UPDATE 3 (31 Oct 14:00): Haoyue's test run, two changes. Do them together with UPDATE 2, then deploy once.

### 1. New copy for everything the participant reads outside the app (rewritten 14:00, this version replaces any earlier one)

Use these words exactly. Do not touch the app's own copy: the hand-over page, the report form, the sent screen.

**0 · Entry**
- Eyebrow: `SMU IS211 · OutRent`
- Intro, above the title, in the body style: `Hi! We're SMU students building OutRent, an app for renting bikes and outdoor gear, for our IS211 project. Thanks for helping us test it.`
- Title: `Your bike's here`
- Paragraph 1: `You're Daniel. You booked a mountain bike on OutRent for a Saturday morning ride, and it's just been dropped off at the trailhead. There's a S$150 deposit on your card until you return it.`
- Paragraph 2: `Use the app like you normally would before you ride off. Takes about 3 minutes.`
- Small text, in place of the three-row card: `We don't collect names or any personal info.`
- Button: `Start`

**6 · Questions**
- Eyebrow: `3 quick questions`
- Q1: `Did you notice anything wrong with the bike?`. Options: `Yes` / `No` / `Not sure`.
- Q2: `Overall, how difficult or easy was the task?`. This is the standard SEQ wording; keep it. Ends: `Very difficult` and `Very easy`.
- Field under Q2: `Why? (optional)`
- Q3: `If something was wrong with the bike, where would you go to tell the shop?`
- Field under Q3: `Optional`
- Button: `Next`
- The log fields stay the same.

**7 · Preference**
- Eyebrow: `Last one`
- Line: `Which version of that page do you prefer?`
- Captions: `Link at the top` (A) and `Link at the bottom` (B).
- Field: `Why? (optional)`
- Button: `Submit`

**Thank-you line:** `Done, thanks a lot! You can close this tab.`

### 2. Tap a photo to see it full size

On the hand-over page, every photo can be tapped to open it full size: both the shop's photos and Daniel's taken ones, in both versions, identically.
- **Viewer:** the photo fitted to the screen on `--ink`, with its tag underneath (for example `Drivetrain · 25 Oct · 7:41 · you`), and one close button (×, 44 px, top right). Tapping outside the photo also closes it.
- **The page behind:** stays exactly where it was. No scroll jump on close.
- **Logging:**
  - add events `photo_view_open` and `photo_view_close`, with `data: { part, who: 'shop' | 'you' }`;
  - add a column `photo_views` (integer, a count);
  - `first_tap_after_photos` gets the value `photo_view` when the first tap after the third photo opens one.
  - The column needs a schema change (`alter table ... add column photo_views integer not null default 0` and one line in `ab_log`). Put it in `schema.sql` **and** in a separate `app/src/abtest/migration-2.sql` that Haoyue can paste into the SQL editor. Say so in the hand-back.
- **Metric:** the primary metric does not change. A participant who opens the photo first just takes longer, the same in both groups.

### Acceptance for UPDATE 3

- Rerun the flows in both versions and both browsers, with one extra path: open Daniel's drivetrain photo, close it, then report.
- The A/B pixel check still holds with the viewer closed.
- Grep the bundle: no "PLACEHOLDER", and no old entry copy ("There are no right answers", "testing the app, not you").

## UPDATE 2 (31 Oct 13:55): the damaged photo has arrived

The photo is on ops at `inbox/assets/11-mine-drive-bent.webp`: 1600 × 1143, sha256 9d27d85a…, the same file as `img/11-mine-drive-bent.webp` in OutRent Image Library. Haoyue picked it at 11:45. The cage is bent forward, almost horizontal, into the spokes.

1. Put it where the other test images live, for example `work/haoyue/_abtest/assets/11-mine-drive-bent.webp`, and use it as Daniel's drivetrain photo everywhere in the test: the camera preview, the slot and the report thumbnail. Remove the PLACEHOLDER tag.
2. **Remake the two preference screenshots (`layout-a`, `layout-b`) only if they show the drivetrain photo.**
3. Rerun the flows (both versions, both browsers) and the bundle grep: no "PLACEHOLDER" left.
4. Commit and push `abtest`, then redeploy `outrent-abtest`. Check the live site with `?v=a&pilot=1&new=1`.
5. Hand back: the commit, and one screenshot of the slot right after the drivetrain photo drops in, at 390 × 844.

The UPDATE 1 checks you already passed stand. The CSV is no longer yours to produce: Haoyue exports it from Supabase.

## UPDATE (31 Oct 12:50), read first

Your 5e917b2 hand-back was read. Supabase now exists, and **your schema.sql is applied to it** (details under "Where it lives"). Next:
1. Put the URL and key in `app/.env.local`.
2. Rerun acceptance checks 3–6 and 9 against the real Supabase. Include the `keepalive` final write on `pagehide`.
3. Deploy the separate Vercel project and alias it, as under Ship.
4. Hand back the links and the CSV.

The damaged photo is still on its way. Deploy now with the PLACEHOLDER tag so the pilot setup can be checked; swap the photo in and redeploy when Haoyue passes it to you.

Accepted from your report:
- the pixel residual on check 1 (your control test shows it is offset painting);
- `block_seq` with a separate pilot sequence;
- `keepalive` instead of `sendBeacon`;
- fitting the preview photo instead of cropping it;
- `?new=1` for testers.

One thing to avoid: never push before the flows pass (07d9aca).

## NOW (31 Oct 11:15): A/B test site · a standalone app from the same code, separate deploy

**Time.** Recruiting closes **Sun 2 Nov, 23:59**. The site must be live for a pilot **tonight (31 Oct)**, with the real run on 1–2 Nov. Speed over polish, but every acceptance check below must pass. If something cannot be done by tonight, say so early.

This is a new task and does not touch the live demo. Do not change `app/`, the `outrent` Vercel project or the `outrent-g14t3.vercel.app` alias.

**Source of truth, read both before you start:**
- Plan: https://claude.ai/artifact/B2FFTv7juhbiach29EmXGX (a Claude Doc; if your window cannot open it, the facts you need are all below)
- Participant flow, screen by screen, with the fields we log: https://claude.ai/artifact/4fbW49HWhQL9eypvMNhEoP (a Claude artifact; `index.html` plus 6 images under `img/`)

### What the test is

The design is between-subjects. Each participant sees one version of page 11 (hand-over record), on their own phone and with no one helping. We are aiming for **at least 42 participants, at least 21 per group; the final number is not fixed**, so nothing in the site may assume a total. The only difference between the versions is where the "Something wrong with the bike?" link sits:
- **A**: above the record card, under the intro text.
- **B**: below the record card, above the main button. This is the current live layout.

Participants are not told about any damage. Their third photo (drivetrain) shows a bent rear derailleur that is not in the shop's photo. The primary metric is the time from that photo appearing to the first tap on the report link.

### Where it lives

- **Same repo, same code.** Work on branch `abtest`, cut from `origin/main`, in your worktree `D:\YUE\c_project\outrent-abtest`. The test is a second entry point of the existing app (for example `app/abtest.html` → `app/src/abtest/main.tsx`), built and deployed on its own. It is not a fork.
  - Import page 11's components, CSS, tokens, fonts and icons from `app/src` as they are. Do not copy them.
  - If a piece of page 11 needs a prop to be reusable (for example the link position, or hiding the circle step and "No marks to record" in the test), add the prop. The live app's default behaviour must stay exactly as it is today. List every such change in the hand-back.
  - The test does not use the main app's store or router; give it its own small state.
  - The report form (E5-6) does **not exist** in the main app yet; the live link only shows a toast. Build the form and the sent screen from the flow artifact (screens 4 and 5).
- The pictures:
  - shop photos: `work/haoyue/11-handover-check/assets/11-direction-s-*.webp`;
  - Daniel's crank and saddle: `work/haoyue/12-rental-summary/assets/12-direction-r-{crank,saddle}.webp`;
  - Daniel's drivetrain: **the new damaged image** from the Images window (`img/11-mine-drive-bent.webp` in OutRent Image Library). Until it arrives, use the current `12-direction-r-drive.webp` with a visible "PLACEHOLDER" tag, so it can never go live by accident.
- Participants are screened when they are recruited, so the site asks no screening question.
- Mobile only. Design for a 390 × 844 viewport. On a wide screen, centre a 430 px column; draw no phone frame.

### Screens, in order (copy exactly as in the flow artifact)

The page uses one fixed story clock: Daniel's photos are taken at 25 Oct · 7:40 (crank, saddle) and 7:41 (drivetrain), and the report is sent at 25 Oct · 7:46. Do not use the real time anywhere on screen.

**0 · Entry (same for both)**
- Eyebrow "OutRent · 3-minute test" (Haoyue's decision; the artifact said 5). Title "Your rental bike just arrived".
- Two paragraphs:
  - "You're Daniel. A Trek Marlin 7 was delivered to the Chestnut trailhead for your Saturday ride. A S$150 deposit is on hold until the bike goes back."
  - "Do what you'd normally do in the app before you ride off. There are no right answers; we're testing the app, not you."
- A card with three rows:
  - Takes · about 3 minutes
  - Your phone · use it as you normally would
  - Data · taps and timings, no names
- Button "Start". The tap on Start creates the row and assigns the version (see Assignment).

**1 · Hand-over (A or B)**
- Top bar: a back button and the eyebrow "Hand-over". The back button is visible but does nothing; log its taps.
- Title "Check it before you ride". Under it: "Photograph the same three parts the shop did. What you record here is never charged to you."
- The record card:
  - header "HAND-OVER RECORD · OR-10482";
  - "TIMAH CYCLES · 18 Oct · 16:20" and "YOU · Not taken yet" (after the first photo: "25 Oct · 7:40");
  - three slots:
    - Crank arm · Known scratch;
    - Saddle edge · Known scuff;
    - Drivetrain · Part most at risk.
- Each slot pairs the shop's photo with a dashed "Take photo" tile.
  - The shop's crank and saddle photos keep their white ring at the existing positions. The shop's drivetrain photo has no ring.
  - Tags: the shop's photos "18 Oct · Timah"; Daniel's "25 Oct · 7:40 · you" (drivetrain "25 Oct · 7:41 · you"). Daniel's photos have no ring.
  - **No "No marks to record" line. No "Circle the … on your photo" step. Nothing under any slot judges condition.** The record is complete once three photos are taken.
- The link block: flag icon, "Something wrong with the bike?", "Report a problem before you ride", chevron. It sits in the A or B position. After a report is sent its second line reads "Report sent · 7:46", in the same position.
- Main button:
  - "Take 3 photos" (disabled), then "Take 2 more photos" and "Take 1 more photo" (disabled);
  - after three photos, "Save record" (enabled), with "Both records are kept with booking OR-10482" above it.
- Photos can be taken in any order. Tapping a taken photo does nothing; log the tap.

**2 · Simulated camera (same for both)**
- "Take photo" never opens the real camera. It shows that slot's preset photo full screen on black for **1.0 s**.
  - A caption at the top: "CRANK ARM · 25 OCT · 7:40", "SADDLE EDGE · 25 OCT · 7:40" or "DRIVETRAIN · 25 OCT · 7:41".
  - The bottom bar shows "Retake", a shutter ring and "Use photo"; none of them can be tapped.
- Then the photo drops into its slot. Use the same short move the live app uses; if you add one, also give it a reduced-motion version.
- `t_damage_visible` is the moment the drivetrain preview appears.

**3 · After the three photos**
- Same page, no new screen. In A the link has scrolled off the top; in B it sits under the photos.
- Do not scroll the page for the participant.

**4 · Report form (same for both; opens from the link at any time)**
- Back button (returns to the hand-over page, nothing sent) and eyebrow "Report a problem". Title "What's wrong?".
- A card with two rows:
  - Booking · OR-10482 · Trek Marlin 7
  - Evidence · "Hand-over record, 25 Oct · 7:41" once all three photos exist; before that, "Hand-over record, in progress"
- Four reasons as radio rows: Wrong item / Damaged / Not adjusted to my fit / Something else. **None is preselected.**
- "Photos from your hand-over record": thumbnails of Daniel's photos taken so far, none selected; tap to toggle. Then a "+" tile that does nothing; log its taps.
- "Details (optional)", a text field.
- Button "Send to Timah Cycles". It is enabled once a reason is picked.

**5 · Report sent (same for both)**
- A tick badge, "Report sent", and "To Timah Cycles · kept with OR-10482".
- Rows:
  - Problem · <the reason>
  - Photos · "<n> from your record" (or "None")
  - Sent · 25 Oct · 7:46
  - Next · Timah Cycles replies in Messages
- Button "Back to hand-over". After a report is sent, the link cannot be used to send a second report; log any tap on it.

**6 · Three questions (after Save record, same for both)**
- Eyebrow "3 quick questions".
- 1 · "Did you notice anything wrong with the bike?" Yes / No / Not sure. Required.
- 2 · "Overall, how easy was it to do what you wanted?"
  - A 1–7 scale, ends labelled "Very difficult" and "Very easy". Required.
  - Then "Why did you give this rating? (optional)".
- 3 · "If you wanted to tell the shop about a problem, where did you look first? Why?" A free-text field, optional.
- Button "Done".

**7 · Pick A or B (last)**
- Eyebrow "Last one". "Two layouts of the page you just used. Which would you rather have?"
- Two real screenshots of the hand-over page before any photo is taken, A and B, captioned "Report link on top" and "Report link below the photos". Make them with `?v=a` and `?v=b` at 390 × 844 and save them as images in the site.
- Left/right order is random for each participant; log it as `preference_left`. Captions travel with their screenshot.
- "Why?" free text. Button "Finish", enabled once one is picked. Then "Thanks. You can close this page."

Reopening the link after Finish shows only the thank-you line, with no new row.

### Variant switch

- One hand-over layout component takes `variant: 'a' | 'b'`. The only thing the variant changes is where the single link block element renders. The element, its gap above and below, every word, size, colour, photo and button are the same in both.
- URL override `?v=a` / `?v=b` for the pilot and for screenshots. An override still creates a row, marked `forced = true`, so we can drop it from the analysis.
- `?pilot=1` marks the row `pilot = true`.

### Assignment (server-side, at Start)

- Supabase table with an auto-increment `id`. On Start, the database function creates the row and decides the variant in the same transaction:
  - odd `id`: a random coin flip;
  - even `id`: the opposite of row `id − 1`.
  - Forced rows are outside the block scheme: they take the forced variant and do not count as the partner of the next row.
- The function returns `id`, `variant` and a random session token. Store all three in a cookie (30 days, SameSite=Lax), so a reload keeps the same version and the same row. A reload resumes on the screen the participant left. It never creates a second row.

**Security:**
- Turn row level security on. The public (anon) key cannot select, insert, update or delete the table directly.
- All writes go through two security-definer functions:
  - `ab_start(...)`, which creates and assigns the row;
  - `ab_log(token, patch)`, which appends events and sets fields only on the row that owns that token.
- Never put the service-role key in the site or in git.
- **Supabase (31 Oct 12:50).**
  - Project `outrent-abtest` (Haoyue's org haoyue-smu, Singapore), URL `https://mswjwsmszuhutuqzguwi.supabase.co`.
  - Publishable key: `sb_publishable_eScKVPBbQFUxJyWgeAROIg_BUlKtlKM`. Put it in `app/.env.local` under the variable names your code already reads; it stays gitignored.
  - **Your `app/src/abtest/schema.sql` (5e917b2) is the one now applied**, replacing Management's first draft, so your `ab_start` / `ab_log` signatures are live. If you change the schema again, say so in your hand-back; Haoyue applies it in the SQL editor.
  - Neither you nor Management can reach this project through the Supabase connector (it only sees the FYP org), so all checks go through the REST API with the publishable key.

### Logging

One row per participant. Timestamps are integers in ms: `t0` is epoch ms at the Start tap, and every other time is ms since `t0`. Write as the participant goes, not only at the end: each event should be on the server within a second, and use `sendBeacon` on `pagehide`. Then a dropout still leaves a row we can read.

Columns (the artifact's table, plus what we need to replay a session and apply the exclusion rules):
- **Identity and setup:**
  - `id`, `token`, `variant`, `forced`, `pilot`, `t0`, `created_at`;
  - `viewport_h`, `viewport_w`, `dpr` (all at page open);
  - `device` (short, e.g. "iPhone · Safari"), `user_agent`.
- **Hand-over:**
  - `page_open`;
  - `link_visible_on_load` (from an IntersectionObserver at page open);
  - `link_in_view_at_damage` (was the link on screen when the drivetrain photo dropped into its slot);
  - `scroll_depth` (events: time, scrollY, max so far; at most one per 250 ms).
- **Photos:** `photo_taken` (part and time, × 3), `t_damage_visible`.
- **After the photos:**
  - `first_tap_after_photos` (link / save / a photo / back / other), `scroll_up_after_photos`;
  - `t_report_tap`: the **first tap on the link after `t_damage_visible`**;
  - `report_taps_before_damage`: a count of earlier taps on the link. They do not count towards the primary metric (Haoyue's decision).
- **Report:** `report_opened`, `report_reason`, `report_photos` (which parts), `report_details_len` (length only, no text needed), `report_sent`.
- **End of the task:**
  - `record_saved`;
  - `order` (report then save / save only / report only / neither);
  - `t_end` (the Save tap).
- **Questions:** `noticed`, `seq`, `seq_why`, `open_text`, `t_questions_done`.
- **Preference:** `preference` (A/B), `preference_why`, `preference_left` (which version was shown on the left), `t_finish`.
- **Away time:** `hidden` (events: time the page was hidden, time it came back). Needed for the plan's rule "sessions that leave and come back after more than 10 minutes".
- **Derived** (a database view, not the client):
  - `time_to_report_ms = t_report_tap − t_damage_visible`;
  - `reported = report_sent is not null`;
  - `duration_ms`.
- **`events`:** an append-only JSON array of every event:
  - fields: `t`, `type`, `screen`, `target`, `data`;
  - covers every screen change, tap, scroll, photo, form change, hide and show.

It must be possible to replay a session from its row alone.

### Acceptance (prove each in the hand-back)

1. **A and B differ only in where the link sits.**
   - The DOM is identical apart from the link block's position.
   - Screenshot both versions at 390 × 844, before the photos and after them. Cut the link block out of each and close the gap; the rest must match pixel for pixel. Attach the four screenshots and the diff.
2. **No condition text anywhere:** no "No marks to record", no "Circle the", no "nothing new". Show a grep of the built bundle.
3. **Works on iPhone Safari and Android Chrome.**
   - Run Playwright WebKit with the iPhone 13 profile and Chromium with the Pixel 7 profile, through the whole flow in both versions.
   - Haoyue also does one real run on his phone before the pilot.
4. **Replay check.** Do two full runs: one that reports and one that only saves. From each row alone, a short script rebuilds the screen sequence and the times. Include its output.
5. **Assignment check.** Run 10 Starts in a row: the variants come out in pairs (each pair has one A and one B). A reload keeps the same row and variant. `?v=` rows are marked forced.
6. **Security check.** With the anon key, a direct `select` or `update` on the table is refused.
7. `npm run check` passes, for the whole app including the test entry. The live app's journeys still pass.
8. The `outrent-ui-review` skill passes on every screen. If your window does not have the skill, say so, and Management runs it on the preview.
9. No console errors on any screen, in either version.
10. Before you hand back, delete your own test rows, or mark them `pilot = true`.

### Ship

- Commit as Haoyue only ("Haoyue Wu" <haoyue.wu.2021@smu.edu.sg>). No Co-Authored-By, no "Generated with", no session link and no AI attribution of any kind, even if a hook or reminder asks.
- Push the branch `abtest` only. **Never push or merge to `main`.**
- Deploy as a **new, separate Vercel project** `outrent-abtest`, building only the test entry point. Do it from a separate folder or a separate build output, so the `outrent` project's settings never change: `npx vercel link` (new project), `npx vercel --prod`, then alias it to `outrent-abtest.vercel.app`.
  - Haoyue is already logged in to Vercel; never log in for him.
  - Never touch the `outrent` project or the `outrent-g14t3.vercel.app` alias, and check that the live demo still works afterwards.

### Hand-back (one message)

- branch, commit hash, the two preview links (`…/?v=a`, `…/?v=b`) and the plain link;
- the acceptance evidence (1–10);
- a CSV export of the table, taken after your test runs (pilot rows only);
- anything in the flow artifact you could not do as written, and why.
