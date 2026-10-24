# PO window · answers to inbox task of 24 Oct 13:15

24 Oct 2026. Haoyue's decisions of 24 Oct 13:12 close REQUIREMENTS.md open questions 7–9. REQUIREMENTS.md is at **v1.4** on branch `product-requirements`. **No value changed**, so MOCK-DATA.md stays at v1.3. Open question 6 (Rodalink replacement deposit) is untouched.

## Q7 · VS-5 returns the rental (E8-7, E8-8)

Decision kept: the bike returned at the rack on Sat 25 Oct is the rental, **Trek Marlin 7 (OR-10482)**. The Giant Escape 3 stays at home until the Hub intake on Tue 28 Oct. VS-5 does not move.

Changes:

- **E8-8:** one line added noting that this departs from the Iter1 hard scenario, where the old bike came back via a rack, settled by Haoyue 24 Oct.
- **Open question 7:** resolved.
- MOCK-DATA VS-5 already said this since v1.2; nothing to change there.

## Q8 · MoSCoW floor = demo route

Rule (now in §0): a story is **Must** when it sits on a page of the demo route (01 02 03 04 05 06 07 08 10 11 12 13, per team/sitemap.html) or when a route story depends on it to show its AC. Everything on 09, 14, 15, 16, 17, 18 and anything else off the route is **Should** unless a route story depends on it. No Coulds were added; E9-5 stays the one Could.

Result: **41 Must, 25 Should, 1 Could** (was 53 / 13 / 1).

### Moved Must → Should (12)

| Story | Page | Why |
|---|---|---|
| E0-3 Storage is discoverable without renting | 01 → 16, 14 | Judgement call, see below |
| E7-1 What I own | 14 | Off route. E2-5 AC2 ("already owned" check) reads from SEED-EQUIPMENT data, not from page 14, so it is not a dependency |
| E7-3 Item detail, at home | 15 | Off route |
| E7-4 The idle prompt | notification → 15 | Off route (destination 15) |
| E8-1 What storage is and costs | 16 | Off route |
| E8-2 Send a bike to the Hub | 17 | Off route |
| E8-3 The way back, shown first | 17 | Off route |
| E8-4 Intake record | 15 (Hub state) | Off route |
| E8-5 Item detail, at the Hub | 15 (Hub state) | Off route |
| E8-6 Earn while stored | 15 (Hub state) | Off route |
| E8-7 The storage map | 18 | Off route |
| E8-8 The full rack is not the end | 18 | Off route. E8-8 depends on E5-7, not the other way round, so VS-5 is Should |

### Stayed Must off the route, by dependency

| Story | Page | Depended on by |
|---|---|---|
| E0-2 Root navigation | all | Every route page (tab bar, way back from flow pages) |
| E4-7 The supplier cancels | notification → notice → 04 (AC4 on 09) | E4-8 on 04 is entered only through E4-7 AC3 |
| E5-1 Trips in one place | 09 | E5-7 AC3 (closed rental under past trips), E6-1 AC3 (weekly ride appears in trips), E6-3 AC2, E4-7 AC4 |
| E5-2 Booking detail | reached from 08, 09 | E4-5 AC3 (confirmation leads to booking detail), E5-5 AC3, E5-6 |
| E9-3 The notification catalogue | cross-cutting | The route's variant states VS-1 and VS-2 enter through it (E4-7 AC1, E5-4 AC3), the deposit-release notification leads to 12, and E10-6 forbids demo-only entries |
| E10-1 … E10-6 | cross-cutting | Apply to whatever is built |

**E9-3 scoped**, one line added: the idle-item and new-message notification types carry the priority of their destinations (E7-4, E9-1: Should); the other four types (booking confirmed, supplier cancellation, delivery delay, collection done and deposit released) are Must.

### Unchanged

The 13 stories already Should (E1-2, E2-3, E3-4, E3-7, E3-8, E4-6, E6-4, E7-2, E7-5, E8-9, E9-1, E9-2, E9-4) stay Should. E9-5 stays Could. All other Must stories sit on route pages.

### One judgement call for Haoyue · E0-3

E0-3's entry (the Home storage card) is drawn on 01, which is on the route, but its only destination is E8-1 on page 16, which is off the route. It is now **Should**, with E8-1, because a Must card leading to a Should page is not a walkable Must. Two options, one line each:

- Keep as is: E0-3 and E8-1 Should; the card may still appear on 01, and is cut with 16 if 16 is cut.
- Protect the Home storage card (HE #6 is a top-3 Iter1 fix): say so, and E0-3 and E8-1 return to Must in v1.5; 16 then has one Must story.

Nothing else waits on this; the v1.4 counts stand either way until he answers.

## Q9 · the three PO-set values

Accepted by Haoyue 24 Oct as they stand: **S$45 per weekly ride** (FD-RECURRING), **S$10 Hub home collection** and **S$5 rack drop** (MOCK-DATA §9). Open question 9 now reads "set by PO, accepted by Haoyue 24 Oct" and is resolved. The values themselves are unchanged, so MOCK-DATA.md is not bumped.

## Not done, by instruction

- Open question 6 (deposit for the Rodalink replacement booking): not raised by a window, no value set.
- Merge into main: the Build window merges `product-requirements`; this branch only pushes to itself.
