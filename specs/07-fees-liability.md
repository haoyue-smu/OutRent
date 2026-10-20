# 07 Fees & Liability

**Designer:** Amanda  ·  **Where:** Booking flow, after Delivery & Return

## Purpose
Daniel sees every charge and what he is responsible for, and agrees himself before paying.

## Links
- Comes from: 06-delivery-return
- Goes to: 08-booking-confirmation ("Pay S$53")

Link with `data-goes-to="<page-id>"`.

## Must show
- Line items: rental S$38, delivery and collection S$12*, service S$3* → total S$53*
- S$150 deposit: held, not charged; when it is refunded
- Damage terms in plain words: what counts as normal wear, what he pays for
- Cancellation: free until when, then how much
- Agreement checkbox **not** pre-ticked; Pay button disabled until he ticks it

## States
- Default
- Pay tapped without agreeing (error with how to fix)

## Iter1 problem this page fixes
HE #1, HE #3 (pre-ticked agreement), HE #9. Make the fix obvious: a tester should notice it without being told.

## Room for your design
Everything above must be on the page. How it is ordered, grouped and interacted with is yours. A second version is optional; if you build one, it must differ in structure, information order or interaction pattern.
