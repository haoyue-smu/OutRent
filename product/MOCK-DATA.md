# OutRent mock data and seeded world

Version 1.0 · 23 Oct 2026 · Owner: Haoyue. Status: **approved 23 Oct 2026 as the extension to DESIGN.md section 8** (consistency is the standard: a value may change, but it must change everywhere at once, through the PO window). This file is the single source for every value, name, date and starting state in the prototype. DESIGN.md section 8 values are repeated here unchanged and stay locked.

Rules:

- Pages show only values from this file. A value that appears on two pages must match exactly.
- Nobody invents data. A page that needs a value this file lacks raises it in REQUIREMENTS.md "Open questions" instead of making one up.
- Write numbers with their unit, in the DESIGN.md format: "S$38 / day", "72 cm", "Sat 7:40".
- App copy never says "we" and never gives conversational instructions. Content attributed to a person (a coach note, a review, a message) may speak in that person's voice.

## 1. Mock clock

"Now" inside the prototype is fixed:

> **Fri 24 Oct 2026, 19:00** (Singapore time)

Every relative label derives from it. Do not compute from the real date.

| Derived fact | Value |
|---|---|
| The booked ride | Tomorrow, Sat 25 Oct. Delivery 7:40, ride starts 8:00, collection 13:30 |
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

- Height 176 cm, inside leg 81 cm
- Derived: saddle 72 cm, frame M, fork sag 25%, bars +1 cm
- Skill level: rides weekly on park connectors, first time on trails
- Saved under Profile, reused by search, listings and delivery preparation

## 4. SEED-BOOKING · The upcoming rental

Booking **OR-10482**, confirmed Thu 22 Oct 09:12.

| Field | Value |
|---|---|
| Item | Trek Marlin 7, size M |
| Supplier | Loop Cycles, Bukit Timah (shop) |
| Ride | Chestnut Nature Park, Sat 25 Oct |
| Delivery | Chestnut trailhead, Sat 7:40, assembled, set to Daniel's fit |
| Collection | Chestnut trailhead, Sat 13:30 |
| Day rate | S$38 / day × 1 day |
| Delivery and collection | S$12 |
| Set-up to rider's fit | S$0, included |
| **All-in total paid** | **S$50** |
| Deposit | S$150, held, released after return check |

Cancellation terms for this booking: Daniel cancels free until Fri 20:00; after that the day rate S$38 is kept and the deposit is always released. If the supplier cancels, everything is refunded and the deposit hold is released at once.

Liability terms (shown before payment, acknowledged by Daniel):
- Damage recorded at handover is not chargeable.
- New damage is assessed against the S$150 deposit, using the handover record.
- Acknowledgement label: "I have read the damage and liability terms."

## 5. SEED-KIT · Coach Aisyah's kit: "First ride at Chestnut"

Curated by Coach Aisyah (third-party coach, idea 4). Checked against SEED-EQUIPMENT.

- Rent: a hardtail mountain bike, sized to the rider → opens search pre-filtered (hardtail, frame M, Sat 25 Oct, delivers to Chestnut)
- Already owned and fine: road helmet, sports shoes
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
| Loop Cycles (shop) | 4.8 | 126 | 104 · 16 · 4 · 1 · 1 |
| This Trek Marlin 7 (item) | 4.9 | 23 | 21 · 2 · 0 · 0 · 0 |
| Rodalink (shop) | 4.7 | 58 | 44 · 11 · 2 · 1 · 0 |
| Marcus T. (private owner) | 4.6 | 9 | 7 · 1 · 1 · 0 · 0 |

Sample review texts (attributed, dated):
- Wei Lin, Sep 2026, on the Marlin 7: "Saddle was already at my height when it arrived. Rode straight off."
- Priya, Aug 2026, on Loop Cycles: "Collection was on time and the deposit came back the same evening."
- Jun Hao, Jul 2026, on Marcus T.: "Bike as described, handover took a while."

## 8. SEED-MESSAGES and SEED-NOTIFS

Messages, one thread:
- To Loop Cycles, Thu 22 Oct 17:05 (Daniel): "Does the Marlin come with flat pedals?"
- From Loop Cycles, Thu 22 Oct 17:22: "Flat pedals are fitted. Clipless available on request."

Notifications at "now":

| When | Notification | Leads to | Seen |
|---|---|---|---|
| Thu 22 Oct 09:12 | Booking OR-10482 confirmed | Booking detail | Seen |
| Thu 22 Oct 17:22 | New message from Loop Cycles | Thread | Seen |
| Mon 19 Oct 10:00 | Giant Escape 3 not used since 24 May | Equipment detail | **Unseen** |

## 9. SEED-STORAGE and SEED-TRIPS

OutRent Hub (Sungei Kadut):
- Bike storage S$18 / month, includes intake condition record and basic upkeep
- Getting it there: home collection, daily 5–7 pm only; or drop at a nearby public rack, picked up on a pooled courier run (runs Tue and Fri mornings)
- Getting it back: free on a pooled run with 2 days' notice; next-day return to home S$8
- Rent-out while stored: owner opts in, owner receives 70% of each rental, item condition re-checked after every rental

Storage map (updated times shown on the map):
- Rack A, Chestnut trailhead: 12 / 12 full, updated Sat 10:50
- Rack C, Zhenghua Park: 4 of 10 free, 650 m away, updated Sat 10:55; choosing it reserves a spot for 2 h

Past trips (SEED-TRIPS):
- 12–13 Sep 2026: car bike rack, delivered and collected, S$24, closed, deposit returned
- 2 Aug 2026: hardtail day rental, Pulau Ubin, S$42, closed, deposit returned

## 10. Variant states (VS)

Each variant is the seeded world plus the change below. A story that depends on one names it.

- **VS-1 Supplier cancellation** (hard-scenario entry). Fri 24 Oct 20:10: Loop Cycles cancels OR-10482, reason "bike damaged in the shop today". S$50 refunded, deposit hold released at once. Replacement search within the remaining time, ride starts Sat 8:00:
  - Rodalink, Trek Marlin 6, size M: S$34 / day + S$12 delivery = **S$46 all-in**, can deliver Sat 7:40, set to fit included.
  - Marcus T. (private), Scott Aspect 950, size M: S$30 / day + S$15 pooled delivery = **S$45 all-in**, earliest delivery Sat 8:30, after the ride starts.
- **VS-2 Delivery delay.** Sat 7:12: courier held up, new arrival 8:05 (+25 min). Collection unchanged. Daniel can see the new time, message the shop, or cancel under the booking's terms.
- **VS-3 Payment declined.** The Visa payment fails with "Card declined by the bank". PayNow remains available. No charge was made.
- **VS-4 Empty search.** Query: kayak, Sat 25 Oct, delivery to Chestnut. Zero results. True alternatives in the data: 3 kayaks free on Sun 26 Oct; 2 kayaks available Sat as pickup-only.
- **VS-5 Early end, rack return** (rain variant of the hard scenario). The ride ends 11:05 at the Zhenghua Park side. The old bike goes back via the storage map: Rack A full, Rack C has space (section 9 data).
- **VS-6 Old bike stored.** Alternate "now": Wed 29 Oct 10:00. Giant Escape 3 at the Hub since Tue 28 Oct, intake record complete (dated photos, condition "good, chain worn"), storage S$18 / month running, rent-out: not yet opted in.

## 11. Flow-created data (FD)

Values a flow produces, so later screens agree:

- **FD-RECURRING**: weekly ride created from the closed OR-10482. Every Sat, delivery 7:40 Chestnut trailhead, collection 13:30, S$50 / ride, skip or pause until Thu 20:00 each week. First occurrence Sat 1 Nov.
- **FD-STORAGE-BOOKING**: storage pickup for the Giant Escape 3, home collection Tue 28 Oct 5–7 pm, leads to VS-6.
