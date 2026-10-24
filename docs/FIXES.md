# OutRent · direction · fix list (snapshot 25 Oct 03:58)

Known problems, collected for one fix pass. A review finding that repeats one of these is marked "known, FIXES n".

## Open

1. **12 Rental Summary · bottom actions** · The "ride again next Saturday" invitation is already on the page, so the secondary action at the bottom should not be "Book a different bike"; it should be the way out, e.g. "Back to Home". One primary, one exit.
2. Slice 1 (03, 05, 12): Haoyue saw other small wording issues and small bugs, not yet listed one by one. Let the persona review find them.
7. **04 Search · delivery line** · "Arrives 7:40 · before the 8:00 start" should say it is the earliest arrival, e.g. "Earliest 7:40 · before the 8:00 start".
8. **04 Search · top bar** · The back button and the search bar feel stuck together; give them room.

## States not yet built

10. **10 Tracking · delay (E5-4, VS-2)** · Only the on-time run is drawn.
11. **11 Hand-over · report a problem (E5-6)** · The row shows a toast; the report form and its submitted state are not drawn.
12. **13 Weekly ride · skip, pause, stop (E6-3)** · The three controls only toast.
16. **09 Bookings · booking detail (E5-2)** · No separate detail page with liability terms and message / cancel actions.
17. **14 My gear · item detail for the other three items** · Only the Giant Escape 3 opens (15); the others toast.

## PO answers not yet applied to approved pages (fix pass)

3. **01 Home · categories** · Paddleboards and Camping now seeded (PO-ANSWERS v1.7).
4. **01 Home · weekly promo** · 10% is a platform rule (v1.6).
5. **01 Home · "rent more days" promo** · 3 days or more, 10% off the day rate (v1.6); not drawn yet.
6. **01 Home · date** · 01–08 run Wed 22 Oct 9:01–9:12 (confirmed).
9. **02 Coach's post · caption** · Her voice allowed; "Spend money on fit, not on the bike" withdrawn.
14. **11 Hand-over · mark time** · Marks share the record time 25 Oct · 7:40.
15. **10 Tracking · the courier** · Named Hafiz ("Hafiz · Timah Cycles"), no photo; 10 still says "Timah Cycles' courier".

## Gaps sent to the PO (batch 5, not answered yet)

18. **18 Storage map · which racks** · Only VS-5 (rain day) is seeded; Rack S has no space count. After the drop, Rack C reads "3 FREE" (derived).
19. **17 Hub pickup · the date** · Both ways resolve to Tue 28 Oct; no other date can be picked.
20. **09 Bookings · weekly offer before a first ride** · Offered before the ride; first ride Sat 1 Nov; "First ride in 7 days 12 h" from Fri 24 Oct 19:00.
21. **09 Bookings · derived values** · "Arrives in 12 h 40 min"; after setup "Next ride, Sat 1 Nov, in 6 days 17 h"; first charge "Thu 30 Oct · 20:00 · S$45".
22. **15 at the Hub · last used "1 day ago"** · Derived.

## Fixed

- All pages · page scrolled past its content (scrollIntoView on the phone frame). Fixed.
- 09 Bookings built; 13's stamp removed (replaced by the ring).
