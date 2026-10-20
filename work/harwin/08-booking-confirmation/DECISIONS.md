# Booking Confirmation (08-booking-confirmation)

Designer: Harwin

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show | Rough size |
|---|---|---|
| Direction A, Your trail day card | This Trek Marlin 7, size M, side view; the actual rental bike from Timah Cycles | 64 × 64 px |

## Notes

- Policy supplied by Harwin: changes and cancellations must happen before equipment transport starts. Implemented “around 20 percent” as 20% of the rental fee: S$38 × 20% = S$7.60. The fee applies to cancellation; no change fee or refund timing has been specified. The policy disclosure starts open so the deadline and fee are visible.
- Inspiration: INSPIRATION.md’s Airbnb reference informed the payment-first receipt and grouped trip details; its Grab reference informed the ordered delivery sequence. These are structural cues from the local notes; no external screens or images were copied.
- Default is the only specified state. Payment details and change/cancel details use the native disclosure recipe, with keyboard support and no JavaScript. Links use page IDs for Haoyue to connect later.
- Component audit: both disclosures follow RECIPES.md §2 (`details.card`, `summary`, Phosphor caret). The page reuses `.topbar`, `.icon-btn`, `.card`, `.row`, `.thumb`, `.chip`, `.divider`, `.img-ph.is-thumb`, `.actionbar.is-single`, `.btn.is-block`, `.btn.is-text`, and the shared type classes. Removed custom View trip link styling and the Trips thumbnail size override; the paid unit now inherits the shared display styling. The local reduced-motion rule disables disclosure-caret transitions. Other recipes address interactions this default-only confirmation does not need.
- Proposal: the read-only numbered timeline combines library chips and type styles with a line-token connector, because the explainer controls imply an interactive figure. Other page classes arrange existing components. The fixed action bar retains the shared capsule, with solid white and a line border because there is no photo beneath it.
- Payment breakdown uses the S$38 rental, S$12 delivery and collection, and S$3 service line items supplied by specs/07-fees-liability.md.
- Preview at 393 × 852 and 360 px: confirm the paid amount and deposit are distinct, both disclosures expand, and the last link scrolls above the fixed action bar. Browser visual QA is pending because no browser was connected to the automation tools in this session.
- Only Direction A is built. Direction B remains the untouched starter; no direction choice is needed.
