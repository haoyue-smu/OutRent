# PO window · answers to the 06 Delivery & Return gaps (inbox 24 Oct 15:46)

24 Oct 2026. Source: the 06 Delivery & Return Design artifact, page "Review", grey note. REQUIREMENTS.md is at **v1.5**, MOCK-DATA.md at **v1.4**, branch `product-requirements`. No existing value changed; two values were added and one rule was stated.

Searched first: neither the hand-over spot nor a home address existed anywhere in MOCK-DATA.md, REQUIREMENTS.md or DESIGN.md §8. "Home address" appeared only as an unvalued option in MOCK-DATA §4 ("Chestnut trailhead carpark (chosen) or home address"). The different-places question had no rule.

## 1. E4-1 / E4-2 · hand-over spot at the Chestnut trailhead carpark

**New value, set by PO:** "By the park entrance sign".

- MOCK-DATA §4: the Delivery and Collection rows now read "Chestnut trailhead carpark, by the park entrance sign". The slot options name the spot and state that it is part of the carpark value wherever the carpark is the hand-over point (SEED-BOOKING, FD-RECURRING, VS-2), so one spot everywhere.
- Short enough for one line at 393 px: "Spot: by the park entrance sign". Whether the spot is shown as its own row or folded into the place line is Design's call (labels are copy).

## 2. E4-1 · home address

**New value, set by PO:** Blk 325C Sengkang East Way #11-42, Singapore 543325. One-line form: "Blk 325C Sengkang East Way #11-42".

- MOCK-DATA §2 (SEED-ACCOUNT) carries it. It is the "home address" option at booking (§4) and the home-collection address for storage (FD-STORAGE-BOOKING, Tue 28 Oct 5–7 pm), so the same address appears on 06 and 17.
- Why this address and not one near Chestnut: the persona has a four-room HDB flat and a car that fits one bike; a home across the island from Bukit Timah (Timah Cycles) and Chestnut keeps delivery to the trailhead the sensible choice in the demo. Any other address works equally if Haoyue prefers one; it changes in one place.

## 3. E4-2 · may delivery and collection use different places?

**Rule: yes.** The collection place is chosen separately from the delivery place, from the same two options (trailhead carpark or home address), and the two may differ. This was already implied by E4-2 AC1 ("the after-ride collection (place, Sat 13:30) is shown and chosen") and by VS-5, where the collection place is replaced by a rack; v1.5 states it plainly.

**Demo scenario: same place both ways.** OR-10482 uses the carpark for delivery and collection, and no scenario (VS-1..6, FD-*) needs them to differ. Design draws the Deliver / Collect tabs with the carpark selected on both; the "home address" option exists on each tab as the unselected choice. No comp needs a different-places state.

Changes:

- REQUIREMENTS E4-2 AC1: one clause added ("the collection place is its own choice and may differ from the delivery destination").
- MOCK-DATA §4 slot options: "Collection place" line added.

## Open for Haoyue

The two new values are set by the PO, not sourced from him, and sit in REQUIREMENTS.md open question 11 until he accepts or changes them (same handling as the S$45 / S$10 / S$5 values, accepted 24 Oct).

## Not done, by instruction

- E5 hand-over close-up views per item category: not yet raised; waiting.
- Open question 6 (Rodalink replacement deposit): untouched.
- Merge into main: Build does it.
