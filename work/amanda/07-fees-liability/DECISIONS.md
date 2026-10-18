# Fees & Liability (07-fees-liability)

Designer: Amanda

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->
I choose A, the layout is simpler and easier to read.

## Image requests

<!-- Filled in by your AI: one row per .img-ph placeholder in the version you chose. -->

| Where | What it should show |
|---|---|
| None | Review and payment screen uses structured review cards, stat readouts and Phosphor icons |

## Notes

<!-- Optional. Anything off-system, questions about the spec, ideas for the team lead. -->

- Adheres strictly to the exact text and content in PDF 2 (FIX P4 · review and edit first):
  - Screen title: "Before you pay"
  - Your booking: Rack (Thule Tow Bar Rack, Fri 11–Sun 13 Sep) [Edit], Delivery (Blk 118 Pasir Ris St 11, Fri 11 Sep, 8–9 pm) [Edit], Collection (Same address, Sun 13 Sep, 5–7 pm) [Edit]. "Editing keeps your place and other details".
  - Charges: Rental, 3 days $86.00; Delivery and collection $18.00; Cleaning fee $8.00; Booking fee $3.00; Rental total $95.00; Refundable deposit $50.00; Pay now $145.00 ("$50.00 deposit returned after the rack is collected.")
  - If something is damaged: Scratches and scuffs (No charge), Bent or broken part ($40.00 – $90.00), Lost or not returned ($220.00 replacement)
  - Cancellation: "Free cancellation up to 24 hours before delivery, with a full refund including the deposit. Later than that, $25.00 is kept (one day's rental and the booking fee)."
  - Agreement checkbox: not pre-ticked (fixes HE #3). Pay button disabled until agreed.
  - Pay tapped without agreeing shows clear error feedback (fixes HE #9).
  - Primary button: "Confirm and pay $145.00".
- Direction A uses the sequential grouped table card structure matching PDF 2 layout.
- Direction B presents the financial Pay now summary hero card upfront, offers an in-place edit modal bottom sheet, and organizes damage vs cancellation terms into an interactive segmented switch.
- Both directions include state handling for `#default` and `#unagreed` per RECIPES.md §8.
- Button links directly to `08-booking-confirmation`.
