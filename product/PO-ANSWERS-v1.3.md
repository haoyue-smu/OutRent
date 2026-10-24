# PO window · answers to inbox tasks of 23 Oct 20:05

23 Oct 2026. Both tasks are answered. REQUIREMENTS.md and MOCK-DATA.md are at **v1.3** on branch `product-requirements`. Only the first-time-renter fix changed the files; nothing else moved.

## 1. E8-7 (18 Storage Map) · "counts updated" time

**No new value. It already exists**, one time per rack, in MOCK-DATA §9 (unchanged since v1.0):

- Rack A, Zhenghua Park entrance: 200 m away, 12 / 12 full, updated Sat 10:50
- Rack C, Segar Road: 650 m away, 4 of 10 free, updated Sat 10:55

These times fit the mock clock and the scenario. Daniel reaches the map after rain ends the ride at Sat 11:05 (VS-5), and he drops the bike at Rack C at 11:20. When he opens the map, the counts are 10–15 minutes old, so they read as current. Show each rack with its own updated time. A single page-wide time would be a change, not a missing value.

Story ID: the storage map is **E8-7** (Epic 8, Storage). Epic 7 is the equipment log.

## 2. E1-1 / E5-1 · "first-time renter" vs SEED-TRIPS

**First-time renter is true.** The settled persona deliberately makes Daniel a regular rider and a first-time renter, and §1, SEED-ACCOUNT ("Renter rating: none yet") and three story framings (E2-2, E3-4, E4-3) depend on it. SEED-TRIPS contradicted that persona, so SEED-TRIPS goes.

Changes:

- **MOCK-DATA §9:** SEED-TRIPS removed. At the mock clock, Daniel has no past trips. OR-10482 is his first rental. Past trips first shows an entry when OR-10482 closes at Sat 14:05 (S$50 paid, S$150 deposit released). These values already exist in §4 and §8; none is new.
- **REQUIREMENTS E5-1:** the SEED-TRIPS seed is removed, and AC3 states that the first past trip is OR-10482 once it closes (this is E5-7 AC3, unchanged). The states are now: default (upcoming OR-10482, no past trips), with past trip (OR-10482 closed), with recurring present, and empty (no trips ever).
- **Superseded:** PO-ANSWERS-v1.2, confirmation B3 ("E5-1 past trips: confirmed", with titles from SEED-TRIPS). The car-rack trip (12–13 Sep) and the Pulau Ubin trip (2 Aug) must not appear anywhere.

Unchanged and consistent: "Member since Aug 2026" (he was a member before he rented). "Renter rating: none yet." The seeded notifications and messages all concern OR-10482.
