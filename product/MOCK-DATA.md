# OutRent mock data and seeded world

Version 1.3 · 23 Oct 2026 · Owner: Haoyue. Status: **approved as the extension to DESIGN.md section 8** (consistency is the standard: a value may change, but it must change everywhere at once, through the PO window). This file is the single source for every value, name, date and starting state in the prototype. DESIGN.md section 8 values are repeated here unchanged and stay locked.

v1.1 answers DESIGN-GAPS-v1.0 from the design window. Changed: supplier corrected to Timah Cycles per DESIGN.md §8 (v1.0 had an outdated name); SEED-RIDE added to §4; slots, listing facts and fulfilment timeline added to §4; §3 notes on inside leg and plain-language labels; §5 kit wear line; §7 no-reviews item; §9 transfer costs and corrected rack locations; VS-1 supplier facts; FD-RECURRING weekly price.

v1.2 answers DESIGN-GAPS-v1.1. Changed: §7 star values and two more Marlin 7 reviews; §8 deposit-release notification; VS-1 Scott Aspect 950 not set to fit; VS-2 stage times; VS-5 rewritten (the rental is returned at the rack, with its terms); VS-6 return slots; FD-RECURRING charging, deposit, pause and stop; new FD-NEW-ITEM, FD-RENT-OUT, FD-MESSAGE. Where an example in review/feedback/wording-rules.md quotes a value, this file wins.

v1.3 (product/PO-ANSWERS-v1.3.md): SEED-TRIPS removed. Daniel is a first-time renter; OR-10482 is his first rental. No other value changed.

Rules:

- Pages show only values from this file. A value that appears on two pages must match exactly.
- Nobody invents data. A page that needs a value this file lacks raises it in REQUIREMENTS.md "Open questions" instead of making one up.
- Write numbers with their unit, in the DESIGN.md format: "S$38 / day", "72 cm", "Sat 7:40".
- App copy never says "we" and never gives conversational instructions. Content attributed to a person (a coach note, a review, a message) may speak in that person's voice.
- Values are requirements; labels are copy. Any value here may be labelled in plain words of the designer's choosing ("fork sag 25%" may appear as "suspension set for your weight: 25%"), as long as the value itself is shown unchanged.

## 1. Mock clock

"Now" inside the prototype is fixed:

> **Fri 24 Oct 2026, 19:00** (Singapore time)

Every relative label derives from it. Do not compute from the real date.

| Derived fact | Value |
|---|---|
| The booked ride | Tomorrow, Sat 25 Oct. Delivery 7:40, ride 8:00–12:30, collection 13:30 |
| Time to delivery | 12 h 40 min |
| Old bike last used | 24 May 2026, shown as "5 months ago" |
| Bike box last used | Mar 2025, shown as "1 year ago" |
| Road bike and helmet last used | Wed 22 Oct 2026, shown as "2 days ago" |

Variant states (section 10) may declare their own "now"; otherwise the clock above applies.

## 2. SEED-ACCOUNT · Daniel, signed in

The prototype opens signed in. There is no sign-up or sign-in flow (REQUIREMENTS.md, Won't build).

- Name: Daniel Lim, 29, Singapore
- Member since Aug 2026
- Payment on file: PayNow (default), Visa ending 4821
- Renter rating: none yet (first-time renter); this is shown as the absence of history, in whatever way the designer chooses

## 3. SEED-FIT · Fit profile (DESIGN.md section 8, locked)

- Height 176 cm (required input), inside leg 81 cm (optional input; refines the saddle value)
- Derived with both: saddle 72 cm, frame M, fork sag 25%, bars +1 cm
- Derived with height only: frame M; the saddle value appears once inside leg is added, and the profile says adding it makes the saddle exact
- Skill level: rides weekly on park connectors, first time on trails
- Saved under Profile, reused by search, listings and delivery preparation

## 4. SEED-BOOKING · The ride and the upcoming rental

**SEED-RIDE · The ride itself.** Coach Aisyah's Saturday beginner group ride at Chestnut Nature Park, Sat 25 Oct, 8:00–12:30. The ride is organised outside OutRent; what lives in the app is her kit list (section 5) and Daniel's rental for it. Surfaces may name the ride ("For Coach Aisyah's Saturday ride").

Booking **OR-10482**, confirmed Thu 22 Oct 09:12.

| Field | Value |
|---|---|
| Item | Trek Marlin 7, size M |
| Supplier | Timah Cycles, Bukit Timah (shop) |
| Ride | Chestnut Nature Park, Sat 25 Oct, 8:00–12:30 |
| Delivery | Chestnut trailhead carpark, Sat 7:40, assembled, set to Daniel's fit |
| Collection | Chestnut trailhead carpark, Sat 13:30 |
| Day rate | S$38 / day × 1 day |
| Delivery and collection | S$12 |
| Set-up to rider's fit | S$0, included |
| **All-in total paid** | **S$50** |
| Deposit | S$150, held, released after return check |

**Slot options at booking** (the "choosing" states):
- Destination: Chestnut trailhead carpark (chosen) or home address. 
- Delivery slots, Sat: 7:00 (unavailable: before the first courier run), 7:20, 7:40 (chosen), 8:00.
- Collection slots, Sat: 13:00, 13:30 (chosen), 14:30, 17:30.

**Listing facts for this unit:**
- Photos: 5 of this unit, dated 18 Oct 2026 (3) and 12 Oct 2026 (2).
- Existing marks on this unit, in the supplier's dated photos: a small scratch on the left crank arm; a scuff on the saddle edge.
- Specifications: frame M, aluminium; wheels 29 in; front suspension, 100 mm travel; 1 × 10 gears; hydraulic disc brakes; weight 13.9 kg.
- Assembled dimensions: 180 × 110 × 78 cm.
- Availability, Fri 24 Oct – Sun 2 Nov: Sat 25 Oct held for OR-10482; booked Sun 26 Oct and Thu 30 – Fri 31 Oct; free on the other days.

**Fulfilment timeline** (tracking stage times):
- Set to Daniel's fit: Fri 17:30, done 18:10.
- Leaves the shop: Sat 7:05. On the way from 7:05; arriving from 7:30; delivered 7:40.
- Return: condition as at handover, trail dirt only. Deposit release shows Sat 14:05.

Cancellation terms for this booking: Daniel cancels free until Fri 20:00; after that the day rate S$38 is kept and the deposit is always released. If the supplier cancels, everything is refunded and the deposit hold is released at once.

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
- Coach's note (her voice): "Chestnut's easy loop is fine on any hardtail that fits you. Spend money on fit, not on the bike."

## 6. SEED-EQUIPMENT · What Daniel owns

| Item | Where | Last used | Space note |
|---|---|---|---|
| Canyon Endurace (road bike) | Living-room wall bracket | Wed 22 Oct 2026 | — |
| Giant Escape 3, 2021 (older bike) | Corridor | 24 May 2026 | Blocks the corridor |
| Hard-shell bike box, 115 × 95 × 30 cm | Hallway, no fixed place | Mar 2025 | Largest single item |
| Road helmet | Shelf | Wed 22 Oct 2026 | — |

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
- To Timah Cycles, Thu 22 Oct 17:05 (Daniel): "Does the Marlin come with flat pedals?"
- From Timah Cycles, Thu 22 Oct 17:22: "Flat pedals are fitted. Clipless available on request."

Notifications at "now":

| When | Notification | Leads to | Seen |
|---|---|---|---|
| Thu 22 Oct 09:12 | Booking OR-10482 confirmed | Booking detail | Seen |
| Thu 22 Oct 17:22 | New message from Timah Cycles | Thread | Seen |
| Mon 19 Oct 10:00 | Giant Escape 3 not used since 24 May | Equipment detail | **Unseen** |

Later in the flow: one "Rental closed, S$150 deposit released" notification at Sat 14:05, when the deposit release shows; it leads to the closed summary. The 13:30 collection does not notify separately (the booking shows it as collected).

## 9. SEED-STORAGE

OutRent Hub (Sungei Kadut):
- Bike storage S$18 / month, includes intake condition record and basic upkeep
- Getting it there: home collection S$10, daily 5–7 pm only; or drop at a nearby public rack S$5, picked up on a pooled courier run (runs Tue and Fri mornings)
- Getting it back: free on a pooled run with 2 days' notice; next-day return to home S$8
- Rent-out while stored: owner opts in, owner receives 70% of each rental, item condition re-checked after every rental

Storage map, as seen from the VS-5 ride end at the Zhenghua Park side (updated times shown on the map):
- Rack A, Zhenghua Park entrance: 200 m away, 12 / 12 full, updated Sat 10:50
- Rack C, Segar Road: 650 m away, 4 of 10 free, updated Sat 10:55; choosing it reserves a spot for 2 h

Past trips: none at the mock clock. Daniel is a first-time renter (section 2); OR-10482 is his first rental. Past trips first shows an entry when OR-10482 closes at Sat 14:05 (S$50 paid, S$150 deposit released).

## 10. Variant states (VS)

Each variant is the seeded world plus the change below. A story that depends on one names it.

- **VS-1 Supplier cancellation** (hard-scenario entry). Fri 24 Oct 20:10: Timah Cycles cancels OR-10482, reason "bike damaged in the shop today". S$50 refunded, deposit hold released at once. Replacement search within the remaining time, ride starts Sat 8:00:
  - Rodalink (shop, Bukit Panjang), Trek Marlin 6, size M: S$34 / day + S$12 delivery = **S$46 all-in**, can deliver Sat 7:40, set to fit included.
  - Marcus T. (private owner, Yishun; member since Mar 2026, usually replies within 2 h), Scott Aspect 950, size M: S$30 / day + S$15 pooled delivery = **S$45 all-in**, earliest delivery Sat 8:30, after the ride starts. Not set to fit: Marcus T. offers no set-up, and the result says so (this is the "cannot be set to fit" case for E2-4).
- **VS-2 Delivery delay.** Sat 7:12: courier held up, new arrival 8:05 (+25 min). Stage times: set to fit and leaves the shop unchanged (Fri 17:30–18:10, Sat 7:05); arriving from 7:55; delivered 8:05. Collection unchanged. Daniel can see the new time, message the shop, or cancel under the booking's terms.
- **VS-3 Payment declined.** The Visa payment fails with "Card declined by the bank". PayNow remains available. No charge was made.
- **VS-4 Empty search.** Query: kayak, Sat 25 Oct, delivery to Chestnut. Zero results. True alternatives in the data: 3 kayaks free on Sun 26 Oct; 2 kayaks available Sat as pickup-only.
- **VS-5 Early end, rack return** (rain variant). Sat 25 Oct: rain ends the ride at 11:05 at the Zhenghua Park side, far from the 13:30 trailhead collection. The bike returned is the **rental, Trek Marlin 7 (OR-10482)**; the Giant Escape 3 is at home that day. Rack A (200 m) is full, Rack C (650 m) has space (section 9 data). Rack-return terms:
  - No extra charge; the S$12 delivery and collection already covers it.
  - It replaces the 13:30 trailhead collection.
  - Dropped at Rack C 11:20; the reserved spot holds until 13:20; Timah Cycles' courier collects from the rack at 12:30.
  - The return check happens at that collection, against the handover record. The deposit release still shows at Sat 14:05.
- **VS-6 Old bike stored.** Alternate "now": Wed 29 Oct 10:00. Giant Escape 3 at the Hub since Tue 28 Oct, intake record complete (dated photos, condition "good, chain worn"), storage S$18 / month running, rent-out: not yet opted in. Return slots from this "now": earliest pooled run Fri 31 Oct morning (free, 2 days' notice); next-day home return Thu 30 Oct, 5–7 pm (S$8).

## 11. Flow-created data (FD)

Values a flow produces, so later screens agree:

- **FD-RECURRING**: weekly ride created from the closed OR-10482. Every Sat, delivery 7:40 Chestnut trailhead carpark, collection 13:30, **S$45 / ride** (10% below the one-off S$50), skip or pause until Thu 20:00 each week. First occurrence Sat 1 Nov.
  - Money: nothing is charged at setup. Each ride is charged S$45 at its skip deadline (Thu 20:00), and the S$150 deposit is held for that ride at the same point and released after that ride's return check.
  - Skip: the next ride only; free before its Thu 20:00 deadline.
  - Pause and stop: apply from the next Saturday whose deadline has not passed (at setup, Sat 1 Nov) and charge nothing. If that Saturday's deadline has passed, that ride goes ahead and is charged S$45, and the pause or stop applies from the Saturday after. A pause lasts until Daniel resumes; it does not end on its own.
- **FD-STORAGE-BOOKING**: storage pickup for the Giant Escape 3, home collection S$10, Tue 28 Oct 5–7 pm, leads to VS-6.
- **FD-NEW-ITEM** (E7-2): Daniel adds a track pump, type accessory, kept in the corridor. Last used: none recorded yet.
- **FD-RENT-OUT** (E8-6): on opting in, earnings to date S$0; nothing has been rented yet.
- **FD-MESSAGE** (E9-1, in VS-2): Sat 7:14, Daniel to Timah Cycles: "The ride starts at 8:00. Can the bike still make it by then?"
