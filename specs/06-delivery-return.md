# 06 Delivery & Return

**Designer:** Amanda  ·  **Where:** Booking flow, step after Listing Detail

## Purpose
Daniel chooses how the bike reaches him and, before booking, sees exactly how it goes back.

## Links
- Comes from: 05-listing-detail
- Goes to: 07-fees-liability

Link with `data-goes-to="<page-id>"`.

## Must show
- Step progress: Pick → Fit → **Deliver** → Ride → Return
- Drop-off: Chestnut Nature Park trailhead, Sat 25 Oct, 7:40, assembled and set to his fit
- Return: collected at the trailhead after the ride (time window, e.g. 11:30–12:00*)
- What happens if he is late for collection
- Cost of delivery and collection, included in the all-in total*

## States
- Default
- Time slot not available
- Collection time not chosen yet (block the next step with a clear message)

## Iter1 problem this page fixes
HE #5 (return was only shown after confirming), HE #9. Make the fix obvious: a tester should notice it without being told.

## Room for your design
Everything above must be on the page. How it is ordered, grouped and interacted with is yours. A second version is optional; if you build one, it must differ in structure, information order or interaction pattern.
