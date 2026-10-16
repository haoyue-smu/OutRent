# 09 Trips

**Designer:** Kai Jun  ·  **Where:** Trips tab

## Purpose
Everything Daniel has booked: today's trip, the weekly ride, and past trips.

## Links
- Comes from: tab bar · 08-booking-confirmation
- Goes to: 10-delivery-tracking (today) · 13-weekly-ride · 12-rental-summary (past trip)

Link with `data-goes-to="<page-id>"`.

## Must show
- Upcoming / today: Trek Marlin 7, Sat 25 Oct, live status (e.g. "Being set to your fit")
- Weekly ride (once set up): every Saturday, next date, with skip/pause easy to reach
- Past trips with date, bike and total

## States
- Empty (no trips yet)
- Day of the ride
- After the weekly ride exists

## Iter1 problem this page fixes
HE #4 (recurring couldn't be stopped). Make the fix obvious: a tester should notice it without being told.

## Room for A and B
Everything above must be on the page. How it is ordered, grouped and interacted with is yours. A and B must differ in structure, information order or interaction pattern.
