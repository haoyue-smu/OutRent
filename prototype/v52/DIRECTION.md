# OutRent · direction (Creative Director) — copy of the project doc claude/creative/DIRECTION.md, 25 Oct 2026 15:30, prototype v52

The prototype in this folder (index.html) is the spec. Open it with any static server (e.g. `npx http-server prototype/v52 -p 8080`) and jump with #02 … #18; no hash starts at Home.

## The idea

The fitter's line. OutRent sets rented gear to your body before it arrives, so the app is drawn like a fitting sheet. Daniel's own numbers are the largest things on every screen, and each is marked the way a fitter marks a tube: a thin line, two ticks, a value. Photos are evidence, dated and framed, never wallpaper. Motion is a measurement being taken: lines draw, numbers settle, parts move on a spring. Images and interface are one look, slightly retro and premium. OutRent rents all kinds of bulky sports gear; Daniel's story happens to be a bike.

## The route

01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → (skip to Fri 24 Oct 19:00) → 09 → (skip to Sat 7:22) → 10 → 11 → (skip) → 12 → 13 → 09 (after the ride) → My gear tab → 14 → 15 → 16 → 17 → (skip to Wed 29 Oct 10:00) → 15 at the Hub. 18 opens from the side notes only. 01's storage card opens 16. Tabs work on 01, 09 and 14 (Profile still toasts).

## Pages (latest state)

- 01 Home: a docket (What · To · When, then Search). Below: "From coaches" (the coach's post, "All posts"), "Rent gear for" activity medallions, two promotions (multi-day: 3 days or more, −10%; storage). The storage card opens 16; the Bookings and My gear tabs work.
- 02 Coach's post: a community post; Daniel shown as signed up (tab above the post); OutRent's part sits in a drawer that pops up and tucks away, the same on entry and after the bike tap, helmet greyed with a tick.
- 03 Fit profile (v44): a fitting session in four steps (01 Height, 02 Inside leg, 03 Riding, 04 Check), no scrolling. The bike (Anatomy figure, bike-figure.js) stays in a tall stage; each step moves the camera to the part it sets: 01 whole bike, frame lit, the height tape swaps S/M/L; 02 zoom on the seat post, hex key loosens, post rises, key tightens (dragging the leg tape loosens the key while the finger is down); 03 zoom on the fork, the dial turns and the O-ring settles at 25 mm, then the stem, the bar rises 1 cm onto a spacer; 04 whole bike with labels and the four-value grid, then Save fit. The dock button names the next step. A returning rider (fit saved) opens on 04. Reduced motion shows end states.
- 04 Search: one-line query; each result one white card with its own 7:00–9:00 scale; 04 → 05 photo morph.
- 05 Listing: a proof. Dated photos, marks circled, price measured as one bar.
- 06 Delivery and collection (v48): ride reminder line; hand-over photo card with a white "Meet here" pin on the sign, place under it (Change); three suggested times plus Other per leg (delivery 7:20 / 7:40 / 8:00, collection 13:00 / 13:30 / 14:30; 17:30 through Other, a time wheel in 10-minute steps), each row dated "Sat 25 Oct"; "Your ride with Coach Aisyah · 8:00–12:30" between the rows; the bill starts "Delivery 25 Oct · 7:40", "Collection 25 Oct · 13:30"; bike S$38 + delivery and collection S$12 = S$50 all-in.
- 07 Terms & pay: a full-width drawer over the Marlin 7 product shot; terms as summary + read more.
- 08 Confirmed: the job tag, stamped "Paid" (the one rubber stamp on the route). Button "See it in Bookings" (no icon).
- 09 Bookings: Up next (countdown, set-up proof row, Track delivery), Weekly ride (offer, or the set-up series; same white card as a one-off rental), Past (only once something closed).
- 10 Tracking: a drawn map; the van moves along the route while the clock runs 7:22 → 7:40; the camera eases from the whole route to following the van and ends with the park entrance sign centred. Courier: Hafiz · Timah Cycles.
- 11 Hand-over: one record card that folds into a slip "Recorded · 25 Oct · 7:40".
- 12 Rental summary (v50): the record (deposit hero; "Your Saturday" as four evenly spaced steps: 7:40 delivered, 8:00–12:30 ride, 13:30 collected, 14:05 deposit released; the return check), then the offer (forest block, Marlin 7 photo, "Weekly ride · 10% off", "Same bike. Same Saturday.", S$45 against S$50 struck, four Saturdays, "See the weekly ride" → 13), then "Back to Home". The weekly promotion is one tier only: the same bike at the same time every week (Haoyue 25 Oct).
- 13 Weekly ride: a stack of tags; the week ruler runs Mon → Sun; "Set up every Saturday · S$45 a ride" threads one ring through the hole; then skip / pause / stop show, the bottom button goes, Back (to Bookings) is the one exit. Reopened from 09, 13 shows the running series.
- 14 My gear: the idle Giant Escape 3 leads as a big photo card "Not used since 24 May" → 15; "Everything else" is a 2-column photo grid ending in a dashed "Add an item" tile; the added track pump shows "No photo yet".
- 15 Giant Escape 3: two states. At home: photo hero, "5 months ago" with a months ruler, the space it takes as a box 175 × 105 × 60 cm, what it could earn; "Store it at the Hub". At the Hub (after 17, Wed 29 Oct 10:00): forest dot "28 Oct · Hub intake", "1 day ago", S$18 / month, intake record (three photos, 28 Oct · 19:45, chain worn), rent-out row (terms sheet, 70/30 bar, tick, opt in → "Available to rent · earned S$0"), "Bring it back" sheet (free shared run Fri 31 Oct morning, or S$8 next day 30 Oct · 17:00–19:00).
- 16 Storage (v51–52): Hub photo, "Make room at home", S$18 / month price plate, what is included, "There and back" as one vertical route: Home (Blk 325C) → two ways there (door pickup S$10 daily 17:00–19:00; Rack S drop-off S$5, 60 m, Tue/Fri run) → OutRent Hub S$18 / month → two ways back (shared run free with 2 days' notice; next day to your door S$8) → Home again. Rent-out sheet is a real opt-in (terms, tick, "Rent it out from the Hub" or "Not now"); once on, 16 says "Rent-out is on" and 15 at the Hub shows it available; the sheet can turn it off.
- 17 Hub pickup: "Arrange the pickup". Choice first: door (S$10, daily 17:00–19:00) or Rack S (S$5, leave before 7:00, shared courier run 7:00–10:00 Tue and Fri). A 24-hour dial shows when the courier comes on Tue 28 Oct; booking sends a token round the window, centre "Pickup booked". Booked card: "Pickup booked", "Tue 28 Oct · 17:00–19:00" large, rows Pickup / Goes to / Cost; "See it at the Hub · 29 Oct".
- 18 Public racks: the rain-day state (VS-5). Out of the demo scope (Haoyue 25 Oct 10:26); build last, lowest priority.

## System choices (overrule DESIGN.md v0.2/v0.3)

Paper #F3F4F0, white, ink #121815, ink-2 #4B5550, ink-3 #666F6A (text grey; #7F8883 only for ticks), rules #D9DDD7 / #E9ECE7, one forest green #1C4A3A (primary and good news only), forest-2 #2C6650, mint #D7EBDD, glow #9FD3B1. Geist for UI, Geist Mono for small measured labels. Hairline rules and the measured grid instead of stacks of identical cards; white cards only where one object must read as one (a result, a post, a docket, the hand-over record, a booking). Each page has its own way of saying "done": 08 the stamp, 11 the folded slip, 13 the ring, 17 the token on the dial, 15 the forest intake dot. GSAP for motion; every motion has a reduced-motion end state.
