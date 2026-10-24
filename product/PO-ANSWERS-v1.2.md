# PO window → design window · answers to DESIGN-GAPS-v1.1

23 Oct 2026. All 14 "values or rules needed" items are answered and all 5 confirmations are ruled on. Nothing is held. REQUIREMENTS.md and MOCK-DATA.md are now **v1.2** on branch `product-requirements` (commit **f65717d**). Design against v1.2 only. MOCK-DATA.md is the authority if this summary ever drifts. DESIGN.md was not touched.

Note added 24 Oct: confirmation B3 below is superseded by PO-ANSWERS-v1.3 (Daniel is a first-time renter; SEED-TRIPS removed).

Each answer gives only the values the item asked for.

## A. Values or rules needed

1. **E2-3 · Price refinement.** The form of the control (steps or range) is your call. The rule: price narrows on the **all-in total**, not the day rate (E2-3 AC1, updated). No new values. The control works over the totals already in the data (S$45, S$46, S$50).
2. **E2-4 · Scott Aspect 950 and fit.** It **cannot** be set to fit. Marcus T. offers no set-up, and the result says so. This is now a named state in E2-4: "cannot be set to fit". MOCK-DATA VS-1.
3. **E3-3, E3-4 · The private-owner listing.** Draw these two states as **the supplier block and the review block only**, not as a full listing. Listing-level ACs (E3-1, E3-2, E3-5, E3-6, E3-7) bind to the seeded unit, the Trek Marlin 7. Any other unit's listing shows only the values MOCK-DATA gives it, and sections with no values are **left out, not drawn as placeholders**. Remove the labelled placeholders from those comps. E3-3 and E3-4 states updated.
4. **E3-4 · Review texts.** Draw the review-list state on the **Trek Marlin 7**. It now has three texts: Farhan (Oct, 5 stars), Wei Lin (Sep, 5 stars), Mei Ling (Sep, 4 stars). Every seeded review now has a star value (Priya 5, Jun Hao 4). A list shows the seeded texts and need not show as many texts as the count. MOCK-DATA §7.
5. **E5-4 · Stage times after the delay.** Set to fit and leaving the shop stay the same (Fri 17:30–18:10, Sat 7:05). Arriving from **7:55**; delivered **8:05**. MOCK-DATA VS-2.
6. **E6-1 · Charging and deposit.** Nothing is charged at setup. Each ride is charged **S$45 at its Thu 20:00 skip deadline**. A **S$150 deposit is held for each ride** at that same point and released after that ride's return check. New E6-1 AC2. MOCK-DATA FD-RECURRING.
7. **E6-3 · Pause and stop.** Both apply from the next Saturday whose deadline has not passed (at setup, Sat 1 Nov) and charge nothing. If that deadline has passed, that ride goes ahead and is charged S$45, and the pause or stop starts the Saturday after. **A pause lasts until Daniel resumes.** It does not end on its own. Your comps (1 Nov, nothing charged) are correct for the setup-time case. E6-3 AC1 updated. MOCK-DATA FD-RECURRING.
8. **E7-2 · The example item.** A **track pump**, type accessory, kept in the corridor, with no last-used date yet. MOCK-DATA FD-NEW-ITEM.
9. **E8-7, E8-8 · Which bike in VS-5.** The **rental (Trek Marlin 7, OR-10482)**. The literal reading does not work: on Sat 25 Oct the Giant Escape 3 is still at home, because its Hub intake is Tue 28 Oct (VS-6). **Redraw these comps.** The S$5 rack drop and the Tue 28 Oct home collection are not part of VS-5, and FD-STORAGE-BOOKING is unchanged. Rack-return terms:
   - No extra charge. The S$12 delivery and collection already covers it.
   - It replaces the 13:30 trailhead collection.
   - Dropped at Rack C at 11:20. The spot holds until 13:20, and Timah Cycles' courier collects at 12:30.
   - The return check happens at that collection, against the handover record. The deposit release still shows at Sat 14:05.
   E8-7 and E8-8 are rewritten (the user is a rider, not an owner; new state: "rack-return terms"). MOCK-DATA VS-5.
10. **E8-9 · Return slots.** Your derivation is confirmed: the earliest pooled run is **Fri 31 Oct morning** (free). Next-day home return is **Thu 30 Oct, 5–7 pm** (S$8). MOCK-DATA VS-6.
11. **E8-6 · Earnings at opt-in.** **S$0** is confirmed. Nothing has been rented yet. MOCK-DATA FD-RENT-OUT.
12. **E9-1 · Composing and sent text.** Sat 7:14, in VS-2, Daniel to Timah Cycles: "The ride starts at 8:00. Can the bike still make it by then?" MOCK-DATA FD-MESSAGE.
13. **E9-3 · Collection and deposit notification.** **One notification, at Sat 14:05**, when the deposit release shows: "Rental closed, S$150 deposit released". It leads to the closed summary. The 13:30 collection does not send its own notification; the booking shows it as collected. Your comp at 14:05 is correct. E9-3 AC1 and MOCK-DATA §8 updated.
14. **E9-5 · Scope.** Confirmed: it stays in scope as a reuse of the E5-6 report form and its submitted state. It has no separate comps. REQUIREMENTS open question 1 is resolved.

## B. For confirmation

1. **Labels: confirmed.** "Suspension 25%", "front suspension", and "Bookings" for trips are all within "Labels are copy". "Hardtail" may stay inside the coach's quoted note because it is her voice (E10-4).
2. **E4-6 / E5-2 cancellation amounts: confirmed.** At Fri 19:00 the full S$50 comes back. After 20:00, S$12 comes back and S$38 is kept. The deposit is released in both cases.
3. **E5-1 past trips: confirmed.** (Superseded by PO-ANSWERS-v1.3.)
4. **E8-8 after the rack drop: corrected.** The VS-5 bike is the rental, so there is no pooled run. The status shows Timah Cycles' courier collecting from Rack C at 12:30 (item 9). Redraw with item 9.
5. **wording-rules.md vs MOCK-DATA: confirmed, MOCK-DATA wins.** The rules govern form; their examples are not values. Two more examples also predate the data, beyond the two you listed. Rule 1's "Adjusted on Fri, 7:15 pm" should follow MOCK-DATA (done at 18:10). Rule 5's "Photos from Timah Cycles, Wed 22 Oct" should also follow MOCK-DATA (photos dated 18 and 12 Oct). This is now written into both product files.

## Comps to change

- E2-4: add the "cannot be set to fit" state for the Scott Aspect 950.
- E3-3, E3-4: remove the placeholders. Show the supplier block and the review block only. Draw the review list on the Marlin 7 with the three texts.
- E5-4: add the stage times (7:05 unchanged, arriving from 7:55, delivered 8:05).
- E6-1: add the charging and deposit line. E6-3: add the pause-until-resumed effect.
- E7-2: replace the placeholder row with the track pump.
- E8-7, E8-8: **redraw** for the rental return, including the new rack-return terms state.
- E8-9, E8-6, E9-1, E9-3: fill in values from items 10–13.

Every other comp stands as drawn.
