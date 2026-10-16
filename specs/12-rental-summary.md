# 12 Rental Summary

**Designer:** Minh Tuan  ·  **Where:** Trips → past trip (after collection)

## Purpose
The ride is done: the bike is back, condition on return is recorded, the deposit is coming back.

## Links
- Comes from: 09-trips · 11-handover-check
- Goes to: 13-weekly-ride ("Repeat every Saturday") · 09-trips

Link with `data-goes-to="<page-id>"`.

## Must show
- Collected at Chestnut trailhead, time
- Condition on return vs at handover (no new damage)
- Deposit S$150: refunded, when it reaches his card
- Total paid S$53*
- Offer: "Repeat every Saturday"

## States
- Default
- Deposit pending
- Damage found on return (what he owes, how to dispute)

## Iter1 problem this page fixes
HE #13. Make the fix obvious: a tester should notice it without being told.

## Room for A and B
Everything above must be on the page. How it is ordered, grouped and interacted with is yours. A and B must differ in structure, information order or interaction pattern.
