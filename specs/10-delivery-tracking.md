# 10 Delivery Tracking

**Designer:** Team lead  ·  **Where:** Trips → today's trip, or Booking Confirmation

## Purpose
Daniel follows the bike from set-up to the trailhead.

## Links
- Comes from: 09-trips · 08-booking-confirmation
- Goes to: 11-handover-check ("Bike has arrived")

Link with `data-goes-to="<page-id>"`.

## Must show
- Set-up photo: bike set to his fit (placeholder)
- Status: being set up → on its way → arriving 7:40
- Delay state: "Running 15 min late · now 7:55"*; he can wait, change the drop-off time, or cancel free of charge

## States
- On time
- Delayed

## Iter1 problem this page fixes
HE #7. Make the fix obvious: a tester should notice it without being told.
