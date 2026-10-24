# PO window → design window · answers to DESIGN-GAPS-v1.0

23 Oct 2026. Every item is answered; nothing is still held. REQUIREMENTS.md and MOCK-DATA.md are now **v1.1** on branch `product-requirements` (commit c2d53d0). Design against v1.1 only. Where an answer below gives a value, MOCK-DATA.md v1.1 carries it; the file is the authority if this summary ever drifts.

One correction to your premises before the items: `review/feedback/wording-rules.md` is not in the repo. The ruling below on wording stands on DESIGN.md §10 (copy is open), not on that file. If the file exists somewhere, send it to the PO window.

## A. Contradictions

1. **Supplier name → Timah Cycles.** Verified in the repo: design/DESIGN.md §8 says Timah Cycles, and §8 is locked. MOCK-DATA v1.0 carried an outdated name; v1.1 is corrected everywhere (booking, reviews, messages, notifications, VS-1). Use Timah Cycles.
2. **"Fork sag 25%" → value locked, label free.** The value is DESIGN.md §8 data and must appear wherever the set-up is shown (E1-3, E3-6, E5-3). The words used to label it are copy, so plain language is yours: "suspension set for your weight: 25%" or similar. New rule in REQUIREMENTS §0 ("Labels are copy") and in MOCK-DATA's rules.
3. **Sports shoes → moved out of the checked list.** SEED-KIT v1.1: "Already owned and fine (checked against SEED-EQUIPMENT): road helmet" and a separate "Wear: regular sports shoes" line that is not checked against the list. E2-5 AC2 unchanged; the check now has exactly one hit, the helmet, which is the point the sitemap makes.
4. **Root areas → DESIGN.md §6 wins.** Verified in the repo: the locked tab set is Home, Trips, My gear, Profile (no Explore tab). E0-2 AC1 now defers to DESIGN.md §6 instead of naming its own set. Search stays reachable from the main surface (E0-1 AC2). Conversations and notifications must each be reachable from a root area; which one is your call (new E0-2 AC4).
5. **"Trips" the label → your call.** "Trips" in REQUIREMENTS names the concept, not the tab text. "Bookings" is fine. See the "Labels are copy" rule; one surface, one label, used consistently.
6. **Weekly price → S$45 / ride.** 10% below the one-off S$50, per Haoyue's canvas feedback. FD-RECURRING, E5-8, E6-1 and E6-2 updated. The offer on the closed rental should make the lower price visible (E5-8 AC1).
7. **Inside leg → optional.** Height required; inside leg optional and it refines the saddle value. With height only: frame M, and the profile says adding inside leg makes the saddle exact. E1-3 rewritten; new "height only" state; MOCK-DATA §3 updated.

## B. Missing values (all now in MOCK-DATA v1.1 §4, §7, §9, §10)

8. **Slots.** Destinations: Chestnut trailhead carpark (chosen) or home address. Delivery Sat: 7:00 (unavailable: before the first courier run), 7:20, 7:40 (chosen), 8:00. Collection Sat: 13:00, 13:30 (chosen), 14:30, 17:30.
9. **Ride end.** The ride is 8:00–12:30; collection 13:30 sits after it. (VS-5's 11:05 stays the early end.)
10. **Whose ride.** It is Coach Aisyah's Saturday beginner group ride, organised outside OutRent; the app holds her kit list and Daniel's rental. "For Coach Aisyah's Saturday ride" on Home is supported (new SEED-RIDE block in §4).
11. **Photo dates.** 5 photos of this unit: 3 dated 18 Oct 2026, 2 dated 12 Oct 2026.
12. **Specifications.** Frame M aluminium; wheels 29 in; front suspension 100 mm; 1 × 10 gears; hydraulic disc brakes; 13.9 kg; assembled 180 × 110 × 78 cm.
13. **Availability (Fri 24 Oct – Sun 2 Nov).** Sat 25 held for OR-10482; booked Sun 26 Oct and Thu 30 – Fri 31 Oct; free otherwise.
14. **Supplier facts.** Rodalink: shop, Bukit Panjang (which is why 7:40 is feasible). Marcus T.: private owner, Yishun, member since Mar 2026, usually replies within 2 h.
15. **No-reviews item.** The Scott Aspect 950: owner has 9 reviews, the item none (§7).
16. **Stage times.** Set to fit Fri 17:30–18:10; leaves the shop Sat 7:05; arriving from 7:30; delivered 7:40.
17. **Handover and return.** Supplier photos dated 18 Oct; existing marks: small scratch on the left crank arm, scuff on the saddle edge. Return: as at handover, trail dirt only; deposit release shows Sat 14:05.
18. **Hub transfer costs.** Home collection S$10; rack drop + pooled run S$5. (Return costs were already given: free pooled with 2 days' notice, S$8 next-day.)
19. **Rack distances — and a correction.** v1.0 misplaced Rack A. For the nearest-but-full logic to hold, both racks are near the VS-5 ride end: Rack A, Zhenghua Park entrance, 200 m, 12/12 full; Rack C, Segar Road, 650 m, 4 of 10 free. If you drew the map with the old locations, redraw from §9.

## C. Boundary checks

20. **E4-3 AC2 confirmed as an outcome.** How Daniel confirms completeness is yours.
21. **Resolved with item 4.** E0-2 no longer names its own root set.

## Not changed, deliberately

- All other v1.0 ACs and states stand as written; nothing else moved, so comps already started against unchanged stories stay valid.
- DESIGN.md itself was not touched; it is Haoyue's file. The stale copy was MOCK-DATA's, now fixed.

Continue epic by epic against v1.1. Further gaps come back the same way, by story ID.
