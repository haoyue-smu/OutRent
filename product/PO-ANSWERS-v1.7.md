# PO window · Haoyue's answers to open questions 11 and 13 (inbox 25 Oct 02:40)

25 Oct 2026. REQUIREMENTS.md is at **v1.7** (no story text changed), MOCK-DATA.md at **v1.6**, branch `product-requirements`.

## Open question 11 · closed

Haoyue (02:39, "all ok") accepted every PO-set value of v1.5 and v1.6 as it stands: home address, hand-over spot, shop record time, report time, Hafiz with no photo, the weekly 10% as a platform rule, the multi-day rule (10% off the day rate from 3 days), the two bike sizes, Rack S and the 7:00–10:00 run window, the Hub intake record. Nothing changed in the values; the "set by PO, awaiting Haoyue" markers in MOCK-DATA §12 now read as accepted. Question 11 is marked resolved.

## Open question 13 · closed, option A

Home keeps **four categories: Bikes, Kayaks, Paddleboards, Camping**, in that order. Paddleboards and Camping now have one seeded item each in MOCK-DATA §12, in the form of the existing listings (item, supplier with type and location, rating, day rate, delivery, all-in, deposit, where it delivers, fit, packed size):

| Category | Item | Supplier | Day rate | Delivery | All-in (1 day) | Deposit |
|---|---|---|---|---|---|---|
| Paddleboards | Red Paddle Co Ride 10'6" inflatable SUP, with pump, paddle, leash | Seabreeze Watersports, East Coast (shop), 4.7 · 41 | S$28 / day | S$10 to East Coast Park | **S$38** | S$100 |
| Camping | Decathlon MH100 2-person tent, 2 sleeping mats | Marcus T. (private owner, Yishun), 4.6 · 9, as in VS-1 | S$12 / day | S$8 pooled, to Pasir Ris Park or East Coast Park | **S$20** | S$50 |

Choices made, so they are visible:

- Reusing Marcus T. keeps the private-owner count at one and gives him a second listing, which is how a private owner reads in the benchmark apps; his rating and count are the existing §7 values.
- A new shop, Seabreeze Watersports, was needed because no seeded shop rents water gear; its rating is new and sits in §12, not §7, since no review texts are seeded for it.
- Neither item has set-up to fit; the field reads "not applicable", which is what E2-4's no-fit indication should show for them if a results list ever includes them.
- The Kayaks tile has counts (VS-4) but no itemised listing; none was asked for and none is drawn.

No demo-route page opens either item. If a page draws one, any value not in §12 is raised by story ID.

## Not done, by instruction

- Open question 6 (Rodalink replacement deposit) and 12 (12 Oct photo time): untouched.
- Merge into main: Build does it.
