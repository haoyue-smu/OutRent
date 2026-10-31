# OutRent mock data and seeded world

Version 1.8 · 31 Oct 2026 · Owner: Haoyue. Status: **approved as the extension to DESIGN.md section 8** (consistency is the standard: a value may change, but it must change everywhere at once, through the PO window). This file is the single source for every value, name, date and starting state in the prototype. DESIGN.md section 8 values are repeated here unchanged and stay locked.

v1.1 answers DESIGN-GAPS-v1.0 from the design window. Changed: supplier corrected to Timah Cycles per DESIGN.md §8 (v1.0 had an outdated name); SEED-RIDE added to §4; slots, listing facts and fulfilment timeline added to §4; §3 notes on inside leg and plain-language labels; §5 kit wear line; §7 no-reviews item; §9 transfer costs and corrected rack locations; VS-1 supplier facts; FD-RECURRING weekly price.

v1.2 answers DESIGN-GAPS-v1.1. Changed: §7 star values and two more Marlin 7 reviews; §8 deposit-release notification; VS-1 Scott Aspect 950 not set to fit; VS-2 stage times; VS-5 rewritten (the rental is returned at the rack, with its terms); VS-6 return slots; FD-RECURRING charging, deposit, pause and stop; new FD-NEW-ITEM, FD-RENT-OUT, FD-MESSAGE. Where an example in review/feedback/wording-rules.md quotes a value, this file wins.

v1.3 (product/PO-ANSWERS-v1.3.md): SEED-TRIPS removed. Daniel is a first-time renter; OR-10482 is his first rental. No other value changed.

v1.4 (product/PO-ANSWERS-v1.5.md): answers the 06 Delivery & Return gaps. Added: §2 Daniel's home address; §4 the hand-over spot at the Chestnut trailhead carpark, and the rule that delivery and collection places are chosen separately (the seeded booking uses the carpark for both). Also (same version, tasks B and C of 24 Oct 16:05): house date format "25 Oct · 7:40" applied to every date-and-time shown to Daniel (values unchanged); §4 adds the shop's record time (18 Oct · 16:20), the hand-over views for the listing, and the E5-6 submitted time (25 Oct · 7:46). All new values are set by the PO and listed in REQUIREMENTS.md open questions 11–12 until Haoyue accepts them. No existing value changed.

v1.5 (product/PO-ANSWERS-v1.6.md): answers the Creative Director's gaps 3, 4, 5, 6, 9, 14, 15 and the batch-5 value check. Added: §1 demo-route clock; §4 mark time and the courier's name; §6 item types and sizes; §9 the rack nearest home and the pooled-run window; VS-6 intake record detail; new §12 catalogue and pricing rules (categories, weekly and multi-day prices). Changed: §5 coach's note shortened (Haoyue, 25 Oct). New values are set by the PO and listed in REQUIREMENTS.md open question 11 until Haoyue accepts them.

v1.6 (product/PO-ANSWERS-v1.7.md): Haoyue accepted every PO-set value of v1.4–v1.5 (open question 11 closed) and chose four Home categories (open question 13 closed). §12 now lists Bikes, Kayaks, Paddleboards, Camping, with one seeded item each for Paddleboards and Camping.

v1.7 (product/PO-ANSWERS-v1.8.md): deposit rule (held on the card on file; PayNow pays the amount due), payment lines for 07 and 08, VS-3 deposit fallback; §9 home-collection slots and pooled runs by date; FD-RECURRING set up from an upcoming or closed booking, created 25 Oct · 14:07, first charge 30 Oct · 20:00; §1 relative-label rule. No existing value changed.

v1.8 (product/PO-ANSWERS-v1.9.md, the A/B test scenario): the easy scenario gains a step. §4: a third condition item on the Trek Marlin 7 (bent rear derailleur, seen in Daniel's drivetrain photo 25 Oct · 7:41, not in the shop's photos), Daniel marks nothing, the E5-6 report gets its reference, reply and outcome, the fulfilment timeline and the return line change; §8 one more notification. Proposal for the outcome awaits Haoyue (REQUIREMENTS open question 14).

Rules:

- Pages show only values from this file. A value that appears on two pages must match exactly.
- Nobody invents data. A page that needs a value this file lacks raises it in REQUIREMENTS.md "Open questions" instead of making one up.
- Write numbers with their unit, in the DESIGN.md format: "S$38 / day", "72 cm". House date format (Haoyue, 24 Oct): a date with a time is written "25 Oct · 7:40" (short date, middle dot, time, no leading zero); records shown side by side use the same form on both sides. A date without a time may keep its weekday ("Sat 25 Oct"); a recurring deadline is weekday · time ("Thu · 20:00"). This form wins over the "Sat 7:40" example in DESIGN.md §10.
- App copy never says "we" and never gives conversational instructions. Content attributed to a person (a coach note, a review, a message) may speak in that person's voice.
- Values are requirements; labels are copy. Any value here may be labelled in plain words of the designer's choosing ("fork sag 25%" may appear as "suspension set for your weight: 25%"), as long as the value itself is shown unchanged.

## 1. Mock clock

"Now" inside the prototype is fixed:

> **Fri 24 Oct 2026, 19:00** (Singapore time)

Every relative label derives from it. Do not compute from the real date. Relative day labels count calendar days from the current "now" (22 Oct seen from 24 Oct is "2 days ago"; 28 Oct seen from 29 Oct is "1 day ago"); hours within a day are written as a countdown only where a story asks for one ("in 12 h 40 min"). Calling "1 day ago" "yesterday" is copy.

| Derived fact | Value |
|---|---|
| The booked ride | Tomorrow, Sat 25 Oct. Delivery 25 Oct · 7:40, ride 8:00–12:30, collection 25 Oct · 13:30 |
| Time to delivery | 12 h 40 min |
| Old bike last used | 24 May 2026, shown as "5 months ago" |
| Bike box last used | Mar 2025, shown as "1 year ago" |
| Road bike and helmet last used | Wed 22 Oct 2026, shown as "2 days ago" |

Variant states (section 10) may declare their own "now"; otherwise the clock above applies.

**Demo-route clock** (confirmed 25 Oct, PO-ANSWERS-v1.6 item 6). The demo route walks the booking as it happened, so pages 01–08 run at **Wed 22 Oct, 9:01–9:12**: Home opens in its no-bookings variant (E0-1), the fit profile is entered on 03, and 08 is the confirmation at 22 Oct · 9:12 (section 4). The status clock on 01–05 runs 9:01–9:06 and ends at 9:12 on 08. At that moment the notification centre holds only the idle prompt (19 Oct · 10:00, unseen) and no message thread exists yet. The route then skips to Sat 25 Oct for 10–13. Every page off the route (09, 14–18, Home with the upcoming booking, the notification centre at "now") uses the Fri 24 Oct 19:00 clock above. Consequence on 05 at 22 Oct: the availability window starts Wed 22 Oct; 22–24 Oct are free (section 4, "free on the other days").

## 2. SEED-ACCOUNT · Daniel, signed in

The prototype opens signed in. There is no sign-up or sign-in flow (REQUIREMENTS.md, Won't build).

- Name: Daniel Lim, 29, Singapore
- Member since Aug 2026
- Payment on file: PayNow (default), Visa ending 4821
- Deposit rule (v1.7): the amount due is paid by the chosen method (PayNow by default); the deposit is **held on the card on file, Visa ···4821, not charged**, and released after the return check. A PayNow transfer cannot hold money, so a deposit is never held on PayNow. If no card can take the hold (VS-3), the deposit is paid by PayNow and **refunded** after the return check; the word changes from "released" to "refunded" on every page of that booking.
- Renter rating: none yet (first-time renter); this is shown as the absence of history, in whatever way the designer chooses
- Home address (set by PO, v1.4): Blk 325C Sengkang East Way #11-42, Singapore 543325. One-line form: "Blk 325C Sengkang East Way #11-42". This is the "home address" option at booking (§4) and the home-collection address for storage (FD-STORAGE-BOOKING).

## 3. SEED-FIT · Fit profile (DESIGN.md section 8, locked)

- Height 176 cm (required input), inside leg 81 cm (optional input; refines the saddle value)
- Derived with both: saddle 72 cm, frame M, fork sag 25%, bars +1 cm
- Derived with height only: frame M; the saddle value appears once inside leg is added, and the profile says adding it makes the saddle exact
- Skill level: rides weekly on park connectors, first time on trails
- Saved under Profile, reused by search, listings and delivery preparation

## 4. SEED-BOOKING · The ride and the upcoming rental

**SEED-RIDE · The ride itself.** Coach Aisyah's Saturday beginner group ride at Chestnut Nature Park, Sat 25 Oct, 8:00–12:30. The ride is organised outside OutRent; what lives in the app is her kit list (section 5) and Daniel's rental for it. Surfaces may name the ride ("For Coach Aisyah's Saturday ride").

Booking **OR-10482**, confirmed 22 Oct · 9:12.

| Field | Value |
|---|---|
| Item | Trek Marlin 7, size M |
| Supplier | Timah Cycles, Bukit Timah (shop) |
| Ride | Chestnut Nature Park, Sat 25 Oct, 8:00–12:30 |
| Delivery | Chestnut trailhead carpark, by the park entrance sign, 25 Oct · 7:40, assembled, set to Daniel's fit |
| Collection | Chestnut trailhead carpark, by the park entrance sign, 25 Oct · 13:30 |
| Day rate | S$38 / day × 1 day |
| Delivery and collection | S$12 |
| Set-up to rider's fit | S$0, included |
| **All-in total paid** | **S$50** |
| Deposit | S$150, held on Visa ···4821, not charged, released after return check |

**Payment lines** (07 before paying, 08 after; values, labels are copy):
- 07: "Pay now · S$50 · PayNow" and "Deposit · S$150 · held on Visa ···4821, not charged · released after the return check".
- 08: "Paid · S$50 · PayNow" and "Deposit · S$150 · held on Visa ···4821 · released after the return check".

**Slot options at booking** (the "choosing" states):
- Delivery place: Chestnut trailhead carpark (chosen) or home address (§2). Hand-over spot at the carpark (set by PO, v1.4): "By the park entrance sign"; it is part of the carpark value wherever the carpark is the hand-over point, including FD-RECURRING.
- Collection place: the same two options, chosen separately from the delivery place; the two may differ. The seeded booking uses the carpark for both, and no scenario needs them to differ.
- Delivery slots, 25 Oct: 7:00 (unavailable: before the first courier run), 7:20, 7:40 (chosen), 8:00.
- Collection slots, 25 Oct: 13:00, 13:30 (chosen), 14:30, 17:30.

**Listing facts for this unit:**
- Photos: 5 of this unit, dated 18 Oct 2026 (3) and 12 Oct 2026 (2). The supplier's handover record (E5-5) is the 18 Oct set, timed 18 Oct · 16:20 (set by PO, v1.4); Daniel's record is 25 Oct · 7:40. The 12 Oct photos carry no time yet (REQUIREMENTS open question 12).
- Condition items on this unit, three (v1.8):
  - Known marks, in the supplier's 18 Oct photos (18 Oct · 16:20): a small scratch on the left crank arm; a scuff on the saddle edge. Unchanged.
  - **Reported at hand-over: a bent rear derailleur**, seen in Daniel's drivetrain photo (25 Oct · 7:41), **not in the shop's 18 Oct photos**. Reported by Daniel (E5-6, below); after the report it is on the shop's side of the record, like the known marks, and not chargeable to Daniel.
- Hand-over views for this listing (set in the supplier's listing, rule in REQUIREMENTS E5-5): three close-ups, one part each: left crank arm (scratch), saddle edge (scuff), drivetrain (the part most at risk for a bike). Daniel's photos take the same three views.
- Daniel's record (v1.8): three photos, crank arm and saddle edge at 25 Oct · 7:40, drivetrain at 25 Oct · 7:41, author "Daniel Lim". Daniel marks nothing on the photos; the record is complete with the three photos (E5-5 AC2). The shop's known marks sit on the shop's side with their own time and author ("Timah Cycles"). Saved at 25 Oct · 7:47, after the report.
- Record summary lines (values; labels are copy): with the report, "3 parts checked · 2 known marks · 1 problem reported"; without a report (the no-report variant, used by the test site for people who do not report), "3 parts checked · 2 known marks · nothing new".
- Report a problem at hand-over (E5-6), on the demo route (v1.8):
  - Reference **R-10482-1** (booking number, then the report's sequence number for that booking).
  - Reason: Damaged. Evidence: the hand-over record, Daniel's drivetrain photo 25 Oct · 7:41 (1 photo attached). Details: none. Sent to Timah Cycles **25 Oct · 7:46**.
  - Reply from Timah Cycles, **25 Oct · 7:49** (sender shown as "Timah Cycles"; attributed content, their voice): "Thanks for the photo. The derailleur is now on our record for this bike, not yours. Hafiz is still at the carpark and will straighten the hanger before he leaves. If it skips gears on the ride, message us and we'll swap the bike at collection."
  - Outcome, on the record and the booking: **fixed at hand-over · on the shop's record · not chargeable to Daniel**. Hafiz straightens the derailleur hanger at 25 Oct · 7:52; Daniel rides at 8:00.
  - Where the sent report and the reply appear: the booking detail (09) under the hand-over record (reference, reason, sent time, reply, outcome); the reopened record (11) with the same status line; the close (12) in the return check. No messages screen exists in the prototype (E9-1, E9-2 are Should and unbuilt); the reply is not shown in a thread. Sent-screen "Next" line: "Timah Cycles replies to your booking".
- Courier (set by PO, v1.5): **Hafiz**, Timah Cycles' courier, shown by first name with the shop ("Hafiz · Timah Cycles"). No photo: an initial or a van mark stands in. The same courier delivers (7:40), is the one held up in VS-2, and collects from Rack C in VS-5.
- Specifications: frame M, aluminium; wheels 29 in; front suspension, 100 mm travel; 1 × 10 gears; hydraulic disc brakes; weight 13.9 kg.
- Assembled dimensions: 180 × 110 × 78 cm.
- Availability, Fri 24 Oct – Sun 2 Nov: Sat 25 Oct held for OR-10482; booked Sun 26 Oct and Thu 30 – Fri 31 Oct; free on the other days.

**Fulfilment timeline** (tracking stage times):
- Set to Daniel's fit: 24 Oct · 17:30, done 24 Oct · 18:10.
- Leaves the shop: 25 Oct · 7:05. On the way from 7:05; arriving from 7:30; delivered 25 Oct · 7:40.
- Hand-over: Daniel's photos 7:40–7:41; report R-10482-1 sent 7:46; record saved 7:47; shop reply 7:49; hanger straightened by Hafiz 7:52; Hafiz leaves 7:55; ride 8:00–12:30.
- Return: collected at the carpark 25 Oct · 13:30. Condition as at hand-over: two known marks and the derailleur reported at 7:46, all on the shop's record; trail dirt only; nothing new, nothing chargeable. Deposit release shows 25 Oct · 14:05.

Cancellation terms for this booking: Daniel cancels free until 24 Oct · 20:00; after that the day rate S$38 is kept and the deposit is always released. If the supplier cancels, everything is refunded and the deposit hold is released at once.

Liability terms (shown before payment, acknowledged by Daniel):
- Damage recorded at handover is not chargeable.
- New damage is assessed against the S$150 deposit, using the handover record.
- Acknowledgement label: "I have read the damage and liability terms."

## 5. SEED-KIT · Coach Aisyah's kit: "First ride at Chestnut"

Curated by Coach Aisyah (third-party coach, idea 4), for her Saturday ride (section 4).

- Rent: a hardtail mountain bike, sized to the rider → opens search pre-filtered (hardtail, frame M, Sat 25 Oct, delivers to Chestnut)
- Already owned and fine (checked against SEED-EQUIPMENT): road helmet
- Wear: regular sports shoes (not checked against the equipment list)
- Bring: 2 water bottles, sunscreen
- Not needed on a first ride: clipless pedals
- Coach's note (her voice): "Chestnut's easy loop is fine on any hardtail that fits you." (The second sentence, "Spend money on fit, not on the bike", was withdrawn by Haoyue on 25 Oct: it read as the platform's slogan in her mouth. Do not show it.)
- Her post caption on 02 is copy in her voice (E10-4), written by the design or creative window around these items; the item values appear unchanged, and she makes no claim about OutRent's prices or service.

## 6. SEED-EQUIPMENT · What Daniel owns

| Item | Type | Where | Size (space taken) | Last used | Space note |
|---|---|---|---|---|---|
| Canyon Endurace (road bike) | Bike | Living-room wall bracket | 170 × 95 × 42 cm | Wed 22 Oct 2026 | — |
| Giant Escape 3, 2021 (older bike) | Bike | Corridor | 175 × 105 × 60 cm | 24 May 2026 | Blocks the corridor |
| Hard-shell bike box | Bike box | Hallway, no fixed place | 115 × 95 × 30 cm | Mar 2025 | Largest single item |
| Road helmet | Helmet | Shelf | — | Wed 22 Oct 2026 | — |

Type and the two bike sizes were added in v1.5 (set by PO) for E7-2 and E7-3 AC1; the box size existed since v1.0. FD-NEW-ITEM adds a fifth type, Accessory.

The idle prompt (idea 9) targets the Giant Escape 3. Rent-out suggestion if stored: S$12 / day, owner share 70% = S$8.40 / day rented.

## 7. SEED-REVIEWS · Ratings and reviews

| Subject | Rating | Count | Distribution (5→1) |
|---|---|---|---|
| Timah Cycles (shop) | 4.8 | 126 | 104 · 16 · 4 · 1 · 1 |
| This Trek Marlin 7 (item) | 4.9 | 23 | 21 · 2 · 0 · 0 · 0 |
| Rodalink (shop) | 4.7 | 58 | 44 · 11 · 2 · 1 · 0 |
| Marcus T. (private owner) | 4.6 | 9 | 7 · 1 · 1 · 0 · 0 |

The "item with no reviews yet" state uses Marcus T.'s Scott Aspect 950: the owner has 9 reviews, the item has none.

Sample review texts (attributed, dated, with stars). A review list shows these; it need not show as many as the count.
- On the Marlin 7 (the review-list state):
  - Farhan, Oct 2026, 5 stars: "Delivered to the carpark on time and set up for my height."
  - Wei Lin, Sep 2026, 5 stars: "Saddle was already at my height when it arrived. Rode straight off."
  - Mei Ling, Sep 2026, 4 stars: "Good bike. The brakes needed a small adjustment at handover."
- Priya, Aug 2026, 5 stars, on Timah Cycles: "Collection was on time and the deposit came back the same evening."
- Jun Hao, Jul 2026, 4 stars, on Marcus T.: "Bike as described, handover took a while."

## 8. SEED-MESSAGES and SEED-NOTIFS

Messages, one thread:
- To Timah Cycles, 22 Oct · 17:05 (Daniel): "Does the Marlin come with flat pedals?"
- From Timah Cycles, 22 Oct · 17:22: "Flat pedals are fitted. Clipless available on request."

Notifications at "now":

| When | Notification | Leads to | Seen |
|---|---|---|---|
| 22 Oct · 9:12 | Booking OR-10482 confirmed | Booking detail | Seen |
| 22 Oct · 17:22 | New message from Timah Cycles | Thread | Seen |
| 19 Oct · 10:00 | Giant Escape 3 not used since 24 May | Equipment detail | **Unseen** |

Later in the flow: "Timah Cycles replied to your report R-10482-1" at 25 Oct · 7:49, leading to the booking detail's report section (E9-3); and one "Rental closed, S$150 deposit released" notification at 25 Oct · 14:05, when the deposit release shows; it leads to the closed summary. The 13:30 collection does not notify separately (the booking shows it as collected).

## 9. SEED-STORAGE

OutRent Hub (Sungei Kadut):
- Bike storage S$18 / month, includes intake condition record and basic upkeep
- Getting it there: home collection S$10, daily 5–7 pm only; or drop at a nearby public rack S$5, picked up on a pooled courier run (runs Tue and Fri mornings, 7:00–10:00; the bike is dropped before 7:00 that day). Slots shown from the mock clock, seven days ahead: home collection Sat 25, Sun 26, Mon 27, **Tue 28 (chosen)**, Wed 29, Thu 30, Fri 31 Oct, each 17:00–19:00; pooled runs Tue 28 Oct and Fri 31 Oct. Daniel's choice of Tue 28 is his; the other dates are selectable. Rack nearest Daniel's home (set by PO, v1.5): Rack S, Sengkang East Way, Blk 325C void deck, 60 m away.
- Getting it back: free on a pooled run with 2 days' notice; next-day return to home S$8
- Rent-out while stored: owner opts in, owner receives 70% of each rental, item condition re-checked after every rental

Storage map, as seen from the VS-5 ride end at the Zhenghua Park side (updated times shown on the map):
- Rack A, Zhenghua Park entrance: 200 m away, 12 / 12 full, updated 25 Oct · 10:50
- Rack C, Segar Road: 650 m away, 4 of 10 free, updated 25 Oct · 10:55; choosing it reserves a spot for 2 h

Past trips: none at the mock clock. Daniel is a first-time renter (section 2); OR-10482 is his first rental. Past trips first shows an entry when OR-10482 closes at 25 Oct · 14:05 (S$50 paid, S$150 deposit released).

## 10. Variant states (VS)

Each variant is the seeded world plus the change below. A story that depends on one names it.

- **VS-1 Supplier cancellation** (hard-scenario entry). 24 Oct · 20:10: Timah Cycles cancels OR-10482, reason "bike damaged in the shop today". S$50 refunded, deposit hold released at once. Replacement search within the remaining time, ride starts 25 Oct · 8:00:
  - Rodalink (shop, Bukit Panjang), Trek Marlin 6, size M: S$34 / day + S$12 delivery = **S$46 all-in**, can deliver 25 Oct · 7:40, set to fit included.
  - Marcus T. (private owner, Yishun; member since Mar 2026, usually replies within 2 h), Scott Aspect 950, size M: S$30 / day + S$15 pooled delivery = **S$45 all-in**, earliest delivery 25 Oct · 8:30, after the ride starts. Not set to fit: Marcus T. offers no set-up, and the result says so (this is the "cannot be set to fit" case for E2-4).
- **VS-2 Delivery delay.** 25 Oct · 7:12: courier held up, new arrival 25 Oct · 8:05 (+25 min). Stage times: set to fit and leaves the shop unchanged (24 Oct · 17:30–18:10, 25 Oct · 7:05); arriving from 7:55; delivered 25 Oct · 8:05. Collection unchanged. Daniel can see the new time, message the shop, or cancel under the booking's terms.
- **VS-3 Payment declined.** Daniel pays the S$50 by Visa ···4821; the bank declines the card ("Card declined by the bank"), so neither the S$50 charge nor the S$150 hold was made. Options: retry the card, or switch to PayNow. On PayNow the S$50 is paid and, with no card to hold it, the S$150 deposit is also paid by PayNow and refunded after the return check: 08 then shows "Paid · S$200 · PayNow" with the lines "Rental S$50" and "Deposit S$150 · refunded after the return check", and every later page of this booking says "refunded", not "released".
- **VS-4 Empty search.** Query: kayak, Sat 25 Oct, delivery to Chestnut. Zero results. True alternatives in the data: 3 kayaks free on Sun 26 Oct; 2 kayaks available Sat as pickup-only.
- **VS-5 Early end, rack return** (rain variant). Sat 25 Oct: rain ends the ride at 25 Oct · 11:05 at the Zhenghua Park side, far from the 13:30 trailhead collection. The bike returned is the **rental, Trek Marlin 7 (OR-10482)**; the Giant Escape 3 is at home that day. Rack A (200 m) is full, Rack C (650 m) has space (section 9 data). Rack-return terms:
  - No extra charge; the S$12 delivery and collection already covers it.
  - It replaces the 13:30 trailhead collection.
  - Dropped at Rack C 25 Oct · 11:20; the reserved spot holds until 13:20; Timah Cycles' courier collects from the rack at 25 Oct · 12:30.
  - The return check happens at that collection, against the handover record. The deposit release still shows at 25 Oct · 14:05.
- **VS-6 Old bike stored.** Alternate "now": 29 Oct · 10:00. Giant Escape 3 at the Hub since Tue 28 Oct, intake record complete (3 close-up photos timed 28 Oct · 19:45, author "OutRent Hub": drivetrain, carrying the note "chain worn"; frame, left side; frame, right side; overall condition "good, chain worn"; last-used date updated to 28 Oct by the intake, E7-5), storage S$18 / month running, rent-out: not yet opted in. Return slots from this "now": earliest pooled run Fri 31 Oct morning (free, 2 days' notice); next-day home return 30 Oct · 17:00–19:00 (S$8).

## 11. Flow-created data (FD)

Values a flow produces, so later screens agree:

- **FD-RECURRING**: weekly ride set up from OR-10482, offered both on the closed rental (E5-8) and on the upcoming booking in trips; either way the series starts the Saturday after the booked ride. In the demo it is created at 25 Oct · 14:07 from the closed rental. Derived from the mock clock before the ride: "First ride in 7 days 12 h" (Fri 24 Oct 19:00 → Sat 1 Nov 7:40); after setup: "Next ride, Sat 1 Nov, in 6 days 17 h" (from 25 Oct 14:07); first charge "30 Oct · 20:00 · S$45". Every Sat, delivery 7:40 Chestnut trailhead carpark, collection 13:30 (on a dated occurrence: "1 Nov · 7:40"), **S$45 / ride** (10% below the one-off S$50), skip or pause until Thu · 20:00 each week. First occurrence Sat 1 Nov.
  - Money: nothing is charged at setup. Each ride is charged S$45 at its skip deadline (Thu · 20:00), and the S$150 deposit is held for that ride at the same point and released after that ride's return check.
  - Skip: the next ride only; free before its Thu · 20:00 deadline.
  - Pause and stop: apply from the next Saturday whose deadline has not passed (at setup, Sat 1 Nov) and charge nothing. If that Saturday's deadline has passed, that ride goes ahead and is charged S$45, and the pause or stop applies from the Saturday after. A pause lasts until Daniel resumes; it does not end on its own.
- **FD-STORAGE-BOOKING**: storage pickup for the Giant Escape 3, home collection S$10, 28 Oct · 17:00–19:00, leads to VS-6.
- **FD-NEW-ITEM** (E7-2): Daniel adds a track pump, type accessory, kept in the corridor. Last used: none recorded yet.
- **FD-RENT-OUT** (E8-6): on opting in, earnings to date S$0; nothing has been rented yet.
- **FD-MESSAGE** (E9-1, in VS-2): 25 Oct · 7:14, Daniel to Timah Cycles: "The ride starts at 8:00. Can the bike still make it by then?"

## 12. Catalogue and pricing rules

Added in v1.5 (PO-ANSWERS-v1.6, items 3–5); accepted by Haoyue 25 Oct (PO-ANSWERS-v1.7). Categories settled by Haoyue 25 Oct.

- **Categories** (Haoyue, 25 Oct): Home shows four: **Bikes**, **Kayaks**, **Paddleboards**, **Camping**, in that order. No per-category count or price is shown. Data behind each:
  - Bikes: the Trek Marlin 7, Trek Marlin 6 and Scott Aspect 950 (sections 4 and 10).
  - Kayaks: VS-4 (3 free Sun 26 Oct, 2 pickup-only Sat 25 Oct); no kayak listing is drawn, so none is itemised.
  - Paddleboards, one seeded item: **Red Paddle Co Ride 10'6" inflatable SUP**, with pump, paddle and leash. Supplier: **Seabreeze Watersports, East Coast (shop)**, rating 4.7, 41 reviews. Day rate S$28 / day; delivery and collection to East Coast Park S$10; all-in for one day **S$38**; deposit S$100, held. Delivers to East Coast Park and Pasir Ris Park only; no set-up to rider's fit (not applicable). Dimensions packed: 90 × 40 × 30 cm.
  - Camping, one seeded item: **Decathlon MH100 2-person tent** with 2 sleeping mats. Supplier: **Marcus T. (private owner, Yishun)**, the same owner as in VS-1 (rating 4.6, 9 reviews). Day rate S$12 / day; pooled delivery to Pasir Ris Park or East Coast Park S$8; all-in for one day **S$20**; deposit S$50, held. Not set to fit (not applicable). Dimensions packed: 60 × 20 × 20 cm.
  - These two items exist so the Home tiles lead to real data (a category search shows them). No story on the demo route opens them; if a page draws either, raise the story ID for any value not listed here.
- **Weekly price.** Platform rule: a weekly ride costs 10% less per ride than the one-off all-in total for the same item, delivery and collection. FD-RECURRING is its instance (S$45 against S$50). A Home promo may state the rule; it may not state a figure other than 10%.
- **Multi-day price.** Platform rule: a rental of 3 days or more takes 10% off the day rate for every day; delivery, collection and set-up are unchanged, and the deposit is held once. Worked instance for the Marlin 7: 3 days = 3 × S$34.20 + S$12 = S$114.60 all-in (one-off 3 × S$38 + S$12 = S$126). OR-10482 is one day and is not discounted; the rule appears in the demo only as the Home promo.

