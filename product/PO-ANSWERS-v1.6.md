# PO window · answers to the Creative Director's gaps (inbox 25 Oct 02:25)

25 Oct 2026. Source: claude/creative/FIXES.md, "Gaps for the PO", items 3, 4, 5, 6, 9, 14, 15, plus the batch-5 value check. REQUIREMENTS.md is at **v1.6** (no story text changed), MOCK-DATA.md at **v1.5**, branch `product-requirements`. One existing value changed, on Haoyue's instruction (item 9); everything else is added. All added values are set by the PO and sit in REQUIREMENTS.md open question 11 until Haoyue accepts them.

Searched first, per item: what existed is marked "already exists".

## 3 · 01 Home categories

**Paddleboards and Camping do not exist.** The data has two categories: **Bikes** (Marlin 7, Marlin 6, Scott Aspect 950) and **Kayaks** (VS-4, with counts). Home shows these two and nothing else; no per-category count or price is shown, because none is seeded. New MOCK-DATA §12.

Adding categories is Haoyue's call (REQUIREMENTS open question 13): if Home needs more tiles, he names them and the PO seeds each with at least one item. The PO does not add categories to fill a layout.

## 4 · 01 Home weekly promo

**Yes, as a platform rule:** a weekly ride costs 10% less per ride than the one-off all-in for the same item, delivery and collection. FD-RECURRING is the instance (S$45 against S$50), and the 10% came from Haoyue's canvas note, so the rule generalises what he set. The promo may state the rule; it may not quote a figure other than 10%, and E10-4 applies (no "we"). MOCK-DATA §12.

## 5 · 01 Home "rent more days" promo

**Rule set:** a rental of 3 days or more takes 10% off the day rate for every day; delivery, collection and set-up are unchanged; the deposit is held once. Same 10% as the weekly rule, so the product has one discount language. Worked instance in §12: Marlin 7 for 3 days = 3 × S$34.20 + S$12 = S$114.60 all-in (against S$126). OR-10482 is one day, so no demo page shows the discount; it appears only as the Home promo. If Haoyue would rather have no multi-day promo, §12's third bullet is deleted and nothing else moves.

## 6 · 01 Home date

**Confirmed.** Pages 01–08 run at Wed 22 Oct, 9:01–9:12: Home in its no-bookings variant, fit entered on 03, confirmation on 08 at 22 Oct · 9:12 (already exists, §4). The status clock runs 9:01–9:06 on 01–05 and ends at 9:12 on 08; the times in between are the Creative Director's, as long as they are monotonic. At that moment the notification centre holds only the idle prompt (19 Oct · 10:00) and no message thread exists yet (the thread starts 22 Oct · 17:05). The route skips to Sat 25 Oct for 10–13. Every page off the route keeps the Fri 24 Oct 19:00 clock. One consequence: on 05 at 22 Oct, the availability window starts Wed 22 Oct and 22–24 Oct are free (follows from §4). Recorded in MOCK-DATA §1 as "Demo-route clock".

## 9 · 02 Coach's post caption

**Yes.** Attributed content may speak in its author's voice (E10-4), and E2-5 AC1 binds the content, not the sentences: what to rent, what he already owns, what to bring, what not to buy must appear with their §5 values unchanged. The caption is copy and stays with the design or creative window; the PO does not write it. Two bounds, now in §5: she makes no claim about OutRent's prices or service, and her note's second sentence ("Spend money on fit, not on the bike") is **withdrawn** on Haoyue's instruction of 25 Oct 00:30. Her first sentence ("Chestnut's easy loop is fine on any hardtail that fits you") remains available. This is the one existing value changed in v1.5.

## 14 · 11 Hand-over mark time

**Confirmed, already implied:** the record is one act at the hand-over, so Daniel's marks carry the record's time, 25 Oct · 7:40, and the author "Daniel Lim" (E5-5 AC2: date and author). Made explicit in §4. No separate mark time.

## 15 · 10 Tracking courier

**Named:** **Hafiz**, Timah Cycles' courier, shown as "Hafiz · Timah Cycles". **No photo**: an initial or a van mark stands in. Reasons: a courier portrait would be a new image for the Images window to make and Haoyue to pick, and a real-looking face on a mock person adds nothing the name does not. The same Hafiz delivers at 7:40, is the courier held up in VS-2, and collects from Rack C at 12:30 in VS-5, so one person follows the booking. §4. If Haoyue wants a photo, that is an Images-window request against the same name.

## Batch 5 value check · 09 Trips, 14–18

Checked each story on these pages against MOCK-DATA. Already exists: everything on 09 (E5-1, E5-2, E4-6 preview at the mock clock, VS-1 cancelled state), 16 (E8-1, §9), 18 (E8-7, E8-8, §9 and VS-5), E8-6 rent-out (§6, FD-RENT-OUT), E8-9 return slots (VS-6). Missing and now filled (set by PO, §6, §9, VS-6):

| Page · story | Gap | Value set |
|---|---|---|
| 14 · E7-2 | Item types for the four seeded items (the add flow asks for a type) | Bike, Bike, Bike box, Helmet; FD-NEW-ITEM's Accessory is the fifth |
| 15 · E7-3 AC1 | "Space taken" for the two bikes (only the box had a size) | Canyon Endurace 170 × 95 × 42 cm; Giant Escape 3 175 × 105 × 60 cm |
| 15 · E8-4, E8-5 | Intake record: time, photos, author | 28 Oct · 19:45, author "OutRent Hub"; 3 close-ups: drivetrain (note "chain worn"), frame left, frame right; last-used updated to 28 Oct (E7-5) |
| 17 · E8-2 | Dates and window of the next pooled runs; the rack for the drop path | Tue 28 Oct and Fri 31 Oct, 7:00–10:00, drop before 7:00; Rack S, Sengkang East Way, Blk 325C void deck, 60 m |

Not a gap: 17's home-collection slots (daily 5–7 pm, chosen 28 Oct · 17:00–19:00, FD-STORAGE-BOOKING) and the return options (§9, VS-6) exist.

## Open for Haoyue

All in REQUIREMENTS open question 11 (accept or change): Hafiz and no photo; the weekly 10% as a platform rule; the multi-day rule; the two bike sizes; Rack S and the 7:00–10:00 run window; the intake record time and views. Open question 13: whether Home gets categories beyond Bikes and Kayaks.

## Not done, by instruction

- Open question 6 (Rodalink replacement deposit): untouched.
- Open question 12 (12 Oct photo time): untouched, not raised.
- Merge into main: Build does it.
