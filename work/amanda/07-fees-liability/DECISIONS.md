# Fees & Liability (07-fees-liability)

Designer: Amanda

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->
I choose A, the layout is simpler and easier to read. Important charges are not greyed out like in B.

## Image requests

<!-- Filled in by your AI: one row per .img-ph placeholder in the version you chose. -->

| Where | What it should show |
|---|---|
| None | Review and payment screen uses structured review cards, stat readouts and Phosphor icons |

## Notes

<!-- Optional. Anything off-system, questions about the spec, ideas for the team lead. -->

- Layout structure preserved from the HE evaluation (FIX P4 · review and edit first), populated with project mock data from DESIGN.md §8:
  - Screen title: "Before you pay"
  - Your booking: Bike (Trek Marlin 7 Size M, Sat 25 Oct) [Edit], Delivery (Chestnut Nature Park Carpark, Sat 25 Oct 7:40 am) [Edit], Collection (Same spot Carpark, Sat 25 Oct 11:30 am–12:00 pm) [Edit]. "Editing keeps your place and other details".
  - Charges: Bike rental, 1 day S$38.00; Delivery and collection S$12.00; Platform service fee S$3.00; Rental total S$53.00; Refundable deposit (held) S$150.00; Pay now S$53.00 ("S$150.00 deposit held, not charged. Returned after the bike is inspected.")
  - If something is damaged: Scratches and scuffs (No charge), Bent or broken part (S$30.00 – S$80.00), Lost or cracked frame (S$850.00 replacement)
  - Cancellation: "Free cancellation up to 24 hours before delivery (Fri 24 Oct, 7:40 am), with a full refund. Later than that, S$25.00 is kept (one day base rate)."
  - Agreement checkbox: not pre-ticked (fixes HE #3). Pay button disabled until agreed.
  - Pay tapped without agreeing shows clear error feedback (fixes HE #9).
  - Primary button: "Confirm and pay S$53.00".
- Direction A uses the sequential grouped table card structure matching the review document layout.
- Direction B presents the financial Pay now summary hero card upfront, offers an in-place edit modal bottom sheet, and organizes damage vs cancellation terms into an interactive segmented switch.
- Both directions include state handling for `#default` and `#unagreed` per RECIPES.md §8.
- Button links directly to `08-booking-confirmation`.
