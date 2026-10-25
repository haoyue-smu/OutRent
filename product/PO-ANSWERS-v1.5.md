# PO window · answers to inbox tasks A, B, C of 24 Oct (15:46 and 16:05)

24 Oct 2026. REQUIREMENTS.md is at **v1.5**, MOCK-DATA.md at **v1.4**, branch `product-requirements`, in two commits: task A (974ac6f), then tasks B and C completing the same version. No existing value changed; values were added, one rule and one house format were stated.

# Task A · 06 Delivery & Return gaps

Source: the 06 Delivery & Return Design artifact, page "Review", grey note.

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

# Task B · house date format

**House rule (Haoyue, 24 Oct 16:02):** a date with a time is written **"25 Oct · 7:40"**: short date, middle dot, time, no leading zero. Records shown side by side use the same form on both sides. Recorded in MOCK-DATA.md rules (top of file) and applied to every date-and-time shown to Daniel: SEED-BOOKING (confirmed, delivery, collection, slots, fulfilment timeline, cancellation deadline), messages, notifications, rack updated times, VS-1, VS-2, VS-5, VS-6, FD-STORAGE-BOOKING, FD-MESSAGE. **Values unchanged**; only the writing changed.

Two PO readings of the rule, since the decision covered the date-plus-time case only:

- A date without a time keeps its weekday ("Sat 25 Oct", "Every Sat", "Sat 1 Nov"); it is not a date-and-time.
- A recurring deadline has no date, so it is weekday · time: "Thu · 20:00" (FD-RECURRING).
- Time windows: "28 Oct · 17:00–19:00" (was "Tue 28 Oct 5–7 pm"); the "daily 5–7 pm" constraint in §9 is a rule, not a shown date, and stays.

Two places are not changed, and why:

- **DESIGN.md §10** still gives "Sat 7:40" as its format example. DESIGN.md is Haoyue's file; MOCK-DATA states that the house form wins over that example. Haoyue may want to update the example himself.
- **REQUIREMENTS.md** cites values in ACs as identity ("a time slot (Sat 7:40)"). These are references, not copy; MOCK-DATA's form governs what is shown. Left as they are to keep the diff to the task.

# Task C · 11 Handover Check gaps

Searched first: no time existed for the shop's 18 Oct photos (MOCK-DATA §4 gave dates only); no hand-over views existed anywhere; no E5-6 submitted time existed.

## 1. E5-5 · time of the shop's record

**New value, set by PO:** the shop's handover record is the 18 Oct photo set, timed **18 Oct · 16:20**. Daniel's record is 25 Oct · 7:40 (the hand-over). MOCK-DATA §4, listing facts.

Not asked for, no value set: the two 12 Oct photos carry a date but no time (REQUIREMENTS open question 12). They are listing photos, not the handover record; if Design shows them beside a timed record, raise E3-1 or E5-5.

## 2. E5-5 · hand-over views

**Rule: per listing, chosen by the supplier**, which is what the Design board already says. Reason: the known marks are per unit, so no category list could carry them; the category only contributes the one at-risk part. REQUIREMENTS E5-5 AC1 now states: close-ups of one part each, every known mark of the unit plus the part most at risk for its category, set per listing, Daniel's photos take the same views. No category list is defined; "bike → drivetrain" is the only category fact, stated inside the Marlin 7's views.

Views for the seeded unit (MOCK-DATA §4): **left crank arm** (scratch), **saddle edge** (scuff), **drivetrain** (at-risk part). Three views, each with a shop photo (18 Oct · 16:20) and a Daniel photo (25 Oct · 7:40) side by side.

## 3. E5-6 · submitted time

**New value, set by PO:** **25 Oct · 7:46**, six minutes after the hand-over. Design's stand-in is adopted as the value. MOCK-DATA §4; REQUIREMENTS E5-6 AC2 now says the submitted state is timed.

# Open for Haoyue

All new values are set by the PO, not sourced from him, and sit in REQUIREMENTS.md open question 11 until he accepts or changes them (same handling as the S$45 / S$10 / S$5 values, accepted 24 Oct): home address, hand-over spot, shop record time 18 Oct · 16:20, report time 25 Oct · 7:46. Open question 12 holds the untimed 12 Oct photos.

## Not done, by instruction

- Open question 6 (Rodalink replacement deposit): untouched.
- Merge into main: Build does it.
