# OutRent product requirements (Iter2 prototype)

Version 2.1 · 3 Nov 2026 · Product owner window. Consumed by the UX design window and the implementation window.

## 0. How to use this document

Read in this order: this section, then DESIGN.md (visual law, locked), then MOCK-DATA.md (every value and starting state), then the epic you are working on.

**What this document is.** The product requirements for OutRent, written as if for a real app, verified against a clickable prototype. It says what the user must be able to do and what they must see. It never says how a screen looks, which components express a requirement, or how information is arranged. That is the designer's call, within DESIGN.md.

**The one boundary rule.** A requirement states an outcome or required information. A design decision states a presentation. Example of the line: "Daniel can confirm that no charges exist beyond those listed" is a requirement. "Fees that do not apply are shown as S$0 rows" is a design decision and does not belong here. When an AC in this file reads like the second kind, treat it as a defect and raise it.

**Labels are copy.** Lowercase names in this file (trips, my gear, the storage map) name concepts, not surface labels. What a tab, page or value is called on screen is copy and therefore the designer's call under DESIGN.md section 10 ("Trips" may be labelled "Bookings"; "fork sag 25%" may be labelled in plain words). The named information itself must still be present, and one surface uses one label consistently.

**Simulated behaviour convention.** All system behaviour is simulated. A requirement on system behaviour is met when the prototype presents a consistent, believable account of it happening. ACs therefore use observable verbs only: shows, displays, leads to, updates to, reflects. "The deposit is released" is met when the screens after return show the deposit released, with the same amount everywhere.

**Verification tags.** Every AC carries one:
- `[D]`: checkable on the design comp (information present, states drawn).
- `[B]`: checkable only on the built prototype (navigation, state change over time).
- `[D+B]`: the behaviour is `[B]`, but it implies states the designer must draw.

**States to design.** Each story lists the distinct states that must exist. The list names states only; what each looks like is the designer's call. Every listed state must appear in the comps and in the build (see E10-1).

**MoSCoW.**
- **Must**: the floor is the demo route (decided by Haoyue, 24 Oct). A story is Must when it sits on a page of the demo route (01 02 03 04 05 06 07 08 10 11 12 13, the order in team/sitemap.html) or when a route story depends on it to show its AC. Cross-cutting rules (E10) are Must.
- **Should**: everything on 09, 14, 15, 16, 17, 18 and anything else off the route, unless a route story depends on it; plus what is standard in benchmark rental apps (Turo, Hygglo, Airbnb) and whose absence makes OutRent feel incomplete.
- **Could**: adds polish or depth; cut first under time pressure.
- **Won't**: section 3. Do not build, do not partially build.

**Tags.** `B1` transport, `B2` fit, `B3` storage (the three breakdowns). `Idea n` = the 9 ideas. `HE #n` = Iter1 heuristic-evaluation findings; numbers are copied from team/sitemap.html and must be verified against the HE document before they are cited in course deliverables.

**Story IDs are permanent.** New stories append to an epic's numbering. A removed story keeps its ID marked `(withdrawn)`. The design window names comps by story ID; the implementation window reports against story ID.

## 1. Product and persona capsule

OutRent is a one-stop platform for renting bulky outdoor sports equipment and for storing your own. The user indicates what, where and when; the platform arranges transport, preparation and collection. Payment can run externally via PayNow.

Daniel Lim, 29, marketing executive, Singapore. Four-room HDB flat, one car. Rides 3–4 times a week. Owns a road bike, an older bike and a bike box that all compete for space at home. First-time renter. "I've got the bike I want, everything around it is the problem." The prototype opens as Daniel, signed in, the evening before his first Chestnut Nature Park trail ride (MOCK-DATA.md, mock clock).

**The easy scenario, as walked (v2.1).** Wed 22 Oct: from Coach Aisyah's kit, Daniel saves his fit, finds the Trek Marlin 7 at Timah Cycles, books delivery to the Chestnut trailhead carpark for Sat 7:40 with collection at 13:30, reads the charges and the liability terms, pays S$50 by PayNow with S$150 held on his card (OR-10482, confirmed 9:12). Sat 25 Oct, 7:40: Hafiz hands over the bike set to Daniel's fit. Daniel photographs the three parts the shop photographed. His drivetrain photo (7:41) shows a small fresh scratch on the chainstay that is not in the shop's 18 Oct photos. The scratch is cosmetic only; the chain is on and the bike is fine to ride. He reports it from the record before he rides (R-10482-1, sent 7:46), saves the record at 7:47, and the shop replies at 7:49 that it is on their record, not his. No repair or action by Hafiz is needed. Daniel rides 8:00–12:30 as planned. Collection at the carpark 13:30; the return check against the record finds the two known marks and the scratch reported at hand-over (R-10482-1), trail dirt only, nothing chargeable; the deposit is released 14:05; he sets up the weekly ride (14:07). Every value is in MOCK-DATA §4.

## 2. Change protocol

The design and implementation windows do not add features and do not change requirements. A gap, a contradiction or a needed value goes back to the PO window with the story ID. The PO updates this file, bumps the version and lists the changed stories below. Both windows align to the newest version.

| Version | Date | Changed |
|---|---|---|
| 1.0 | 23 Oct 2026 | First issue |
| 1.1 | 23 Oct 2026 | Answers DESIGN-GAPS-v1.0 (per-item responses: project doc product/PO-ANSWERS-v1.1.md). Changed stories: E0-2, E1-3, E5-8, E6-1, E6-2. §0 gains the "Labels are copy" rule. MOCK-DATA.md is also at 1.1: supplier corrected to Timah Cycles per DESIGN.md §8, plus the values the gaps asked for. |
| 1.2 | 23 Oct 2026 | Answers DESIGN-GAPS-v1.1 (per-item responses: project doc product/PO-ANSWERS-v1.2.md). Changed stories: E2-3, E2-4, E3-3, E3-4, E6-1, E6-3, E8-7, E8-8, E9-3, E9-5. VS-5 now returns the rental, not the old bike. MOCK-DATA.md is also at 1.2. |
| 1.3 | 23 Oct 2026 | Answers inbox tasks of 23 Oct 20:05 (product/PO-ANSWERS-v1.3.md). Changed story: E5-1. Daniel is a first-time renter; SEED-TRIPS removed from MOCK-DATA.md, also at 1.3. |
| 1.4 | 24 Oct 2026 | Closes open questions 7–9 on Haoyue's decisions of 24 Oct (product/PO-ANSWERS-v1.4.md). §0 MoSCoW definition rewritten around the demo route; 12 stories move Must → Should: E0-3, E7-1, E7-3, E7-4, E8-1, E8-2, E8-3, E8-4, E8-5, E8-6, E8-7, E8-8 (now 41 Must, 25 Should, 1 Could). E8-8 notes the departure from the Iter1 hard scenario. E9-3 scopes its idle-item and new-message types. No value changed; MOCK-DATA.md stays at 1.3. |
| 1.5 | 24 Oct 2026 | Answers the 06 Delivery & Return gaps (product/PO-ANSWERS-v1.5.md). Changed stories: E4-2 (collection place chosen separately; may differ from delivery), E5-5 (hand-over views rule), E5-6 (submitted state is timed). MOCK-DATA.md at 1.4: home address, hand-over spot, shop record time, hand-over views and report time added, set by PO (open questions 11–12); house date format "25 Oct · 7:40" applied throughout (tasks A, B, C of 24 Oct). |
| 1.6 | 25 Oct 2026 | Answers the Creative Director's gaps 3, 4, 5, 6, 9, 14, 15 and the batch-5 value check (product/PO-ANSWERS-v1.6.md). No story text changed. MOCK-DATA.md at 1.5: demo-route clock, courier, mark time, item types and sizes, rack nearest home, intake record detail, §12 catalogue and pricing rules; coach's note shortened. Open questions 11, 13 updated. |
| 1.7 | 25 Oct 2026 | Haoyue's answers of 25 Oct 02:39 (product/PO-ANSWERS-v1.7.md): open question 11 closed, all PO-set values accepted; open question 13 closed, Home keeps four categories. No story text changed. MOCK-DATA.md at 1.6: §12 seeds Paddleboards and Camping with one item each. |
| 1.8 | 25 Oct 2026 | Answers the persona-review deposit question and FIXES 19–22 (product/PO-ANSWERS-v1.8.md). Changed stories: E4-9 (PayNow deposit fallback), E6-1 (setup also from an upcoming booking). MOCK-DATA.md at 1.7. |
| 1.9 | 31 Oct 2026 | The A/B test scenario (product/PO-ANSWERS-v1.9.md). §1 gains the easy-scenario walk with the hand-over report. Changed stories: E5-5 (AC2 rewritten: no marking by Daniel, record complete with three photos, new problems via E5-6; AC4; states), E5-6 (AC1 evidence, new AC3 reply and outcome, states), E9-3 (report-reply notification). MOCK-DATA.md at 1.8. Outcome proposal in open question 14. |
| 2.0 | 1 Nov 2026 | The hand-over damage is the chain off the chainring, not a derailleur (product/PO-ANSWERS-v1.10.md). §1 scenario walk reworded; no AC changed. Open question 14 closed: outcome accepted by Haoyue. MOCK-DATA.md at 1.9. |
| 2.1 | 3 Nov 2026 | The prototype uses a small fresh cosmetic scratch on the chainstay (product/PO-ANSWERS-v1.11.md). §1 and open question 14 updated: chain on, no repair or action by Hafiz; report, record, reply, ride, collection and release times unchanged. No AC changed. MOCK-DATA.md at 1.10. |

## 3. Won't build

Listed so no window adds them:

- Real payment processing, real money movement.
- Sign-up or sign-in flows. The prototype opens signed in (SEED-ACCOUNT).
- An owner flow for creating a rental listing from scratch. Owner-side supply enters only through rent-out while stored (E8-6).
- Identity or document verification.
- Live human support chat.
- Desktop or tablet layouts.
- Social features beyond reviews and messaging.

## 4. Out of prototype scope

Real-app requirements with no demonstrable counterpart in a prototype, excluded as a class: performance, security, data persistence across sessions, concurrency, offline behaviour, screen-reader support, localisation. Note the boundary: exception states are **not** in this list. They are demonstrable, the course requires them, and each must be reachable through a real in-product entry (E10-6), never a demo-only button.

---

## E0 · Entry and navigation

### E0-1 The main surface orients Daniel · Must
`B1` `B3` `HE #6` · Seed: SEED-BOOKING, SEED-NOTIFS
As a returning user, Daniel wants the app to open on what matters now, so he does not hunt for his own booking.
1. The main surface shows that a rental is upcoming, with enough identity to recognise it (item, day, time), and leads to its detail. `[D+B]`
2. Search is reachable from the main surface. `[D]`
3. Unseen notifications are discoverable from the main surface. `[D+B]`
States: default (upcoming booking present), no-bookings variant (nothing upcoming, surface still works).

### E0-2 Root navigation · Must
Seed: none
As a user, Daniel wants the app's main areas reachable from anywhere at root level, so he always knows where he is.
1. The root areas are the ones DESIGN.md section 6 fixes for the tab bar (currently home, trips, my gear, profile); each is reachable from any other root area in one action. `[B]`
2. The current area is identifiable. `[D]`
3. Flow pages (booking, payment, tracking) leave root navigation behind and provide a way back. `[D+B]`
4. Conversations (E9-2) and the notification centre (E9-4) are each reachable from a root area; which one is the designer's call. `[B]`
States: each root area selected.

### E0-3 Storage is discoverable without renting · Should
`B3` `Idea 8` `HE #6` · Seed: SEED-STORAGE
As an owner with a space problem, Daniel wants to find storage without first going through a rental, so the second half of the product exists for him.
1. From the main surface, Daniel reaches what storage is and costs (E8-1) without entering any rental flow. `[D+B]`
2. From my gear, any owned item leads to its storage option. `[B]`
States: covered by E8-1.

## E1 · Identity and fit profile

### E1-1 Signed-in start · Must
Seed: SEED-ACCOUNT
As Daniel, I want the app to know me from the first screen, so the walkthrough starts in a believable account.
1. The prototype opens signed in as Daniel Lim; his identity is visible in the profile area. `[D]`
2. Payment methods on file (PayNow default, Visa ·4821) appear where payment is chosen. `[D]`
States: profile area default.

### E1-2 Profile area · Should
Seed: SEED-ACCOUNT, SEED-FIT
As a user, Daniel wants one place for things about him, so the app feels complete.
1. The profile area shows account basics, the fit profile entry and the notification entry. `[D]`
2. Items beyond scope (settings depth) may be present as non-functional surface, but nothing in the walkthrough depends on them. `[D]`
States: default.

### E1-3 Create and edit the fit profile · Must
`B2` `Idea 6` · Seed: SEED-FIT
As a renter who has been given ill-fitting gear before, Daniel wants to record his measurements once, so every rental is prepared for his body.
1. Daniel enters height (176 cm, required); inside leg (81 cm) is optional. With both, the profile shows the full derived set-up: saddle 72 cm, frame M, fork sag 25%, bars +1 cm. `[D+B]`
2. With height only, the profile shows frame M and states that adding inside leg makes the saddle value exact (MOCK-DATA.md section 3). `[D]`
3. Skill level is part of the profile (MOCK-DATA.md section 3). `[D]`
4. Editing a measurement updates the derived values. `[B]`
5. The profile states, in plain terms, what suppliers do with it: equipment is set to these values before delivery. `[D]`
States: empty (first entry), height only, filled, editing.

### E1-4 One profile, reused everywhere · Must
`B2` `Idea 6` · Seed: SEED-FIT
As Daniel, I want my fit to follow me, so I never re-enter it.
1. Search results, listing detail and delivery preparation all reflect the same profile values; no screen asks for them again. `[D]`
2. Wherever fit is shown (results, listing), Daniel can reach the profile to edit it and returns to where he was. `[B]`
States: covered by host screens.

## E2 · Search and discovery

### E2-1 Search with date and place · Must
`B1` `Idea 1` · Seed: SEED-BOOKING context
As a renter with a fixed plan, Daniel wants to search by equipment, date and destination, so results fit the ride he is actually doing.
1. A search accepts at least: equipment type, the date (Sat 25 Oct), the delivery destination (Chestnut Nature Park). `[D+B]`
2. Submitting leads to results scoped to those inputs. `[B]`
States: empty inputs, filled inputs.

### E2-2 Results that can be compared · Must
`B1` `Idea 5` `HE #1 #8` · Seed: SEED-REVIEWS, VS-1 candidates
As a first-time renter, Daniel wants each result to carry the full picture, so he compares like with like.
1. Each result identifies the item, the supplier and whether the supplier is a shop or a private owner. `[D]`
2. Each result shows its **all-in total** for the searched dates, not only a day rate. `[D]`
3. Each result shows whether delivery to the searched destination and time is possible. `[D]`
4. Ratings appear per result where review data exists. `[D]`
States: results list, single result anatomy.

### E2-3 Refine · Should
Seed: none
As Daniel, I want to narrow results, so a long list becomes a choice.
1. Results can be narrowed by at least: equipment subtype, size or fit match, supplier type, price. Price narrows on the all-in total, not the day rate; the form of the price control is the designer's call. `[D+B]`
2. Active refinements are visible and removable. `[D+B]`
States: refinements active, refinements cleared.

### E2-4 Fit match on results · Must
`B2` `Idea 6` · Seed: SEED-FIT
As a renter with a saved fit, Daniel wants to see which results fit him, so fit is a filter, not a surprise.
1. When a fit profile exists, each result indicates whether this item can be set to Daniel's fit. `[D]`
2. The indication leads to what it means (frame M, set to saddle 72 cm). `[B]`
States: fit match present, cannot be set to fit (the Scott Aspect 950, MOCK-DATA VS-1), no-profile variant (results still work, invite to add fit exists).

### E2-5 Coach's kit as a curated entry · Must
`B2` `Idea 4` · Seed: SEED-KIT, SEED-EQUIPMENT
As a beginner, Daniel wants a trusted list for his first trail ride, so he rents only what he actually needs.
1. Coach Aisyah's kit "First ride at Chestnut" is reachable from the main surface and shows: what to rent, what Daniel already owns that works, what to bring, what not to buy (MOCK-DATA.md section 5). `[D]`
2. "Already owned" is checked against Daniel's equipment list, and says so. `[D]`
3. The rent item leads to search pre-filtered: hardtail, frame M, Sat 25 Oct, delivers to Chestnut. `[B]`
4. The kit asks for Daniel's fit when none exists, and shows his sizes when one does. `[D+B]`
States: kit with fit profile, kit without fit profile.

### E2-6 Nothing found · Must
Seed: VS-4
As a renter whose search fails, Daniel wants to know why and what would work, so an empty list is not a dead end.
1. Zero results state why nothing matched (the searched constraints are visible). `[D]`
2. True alternatives from the data are offered: the same equipment on another date, or without delivery (VS-4). Each leads to that adjusted search. `[D+B]`
States: empty results.

## E3 · Listing and trust

### E3-1 This exact item · Must
`B1` `HE #11 #17` · Seed: SEED-BOOKING item
As a renter, Daniel wants to see the actual unit he would receive, so the thing that arrives matches the thing he saw.
1. The listing shows photos of this unit, each dated. `[D]`
2. The listing states that photos show this unit, not a catalogue model. `[D]`
States: listing default.

### E3-2 Specifications and dimensions · Must
`B2` `Idea 5` · Seed: SEED-BOOKING item
As a renter, Daniel wants the numbers, so he can judge suitability himself.
1. The listing carries the item's specifications, including frame size and the dimensions that matter for transport and fit. `[D]`
States: within listing default.

### E3-3 Who supplies it · Must
`Idea 5` · Seed: SEED-REVIEWS
As a renter, Daniel wants to know who stands behind the item, so trust has an object.
1. The supplier is named, typed (shop or private owner) and located. `[D]`
2. The supplier's rating and review count are visible and lead to their reviews. `[D+B]`
States: shop supplier, private-owner supplier. The private-owner state is the supplier identity block for Marcus T., not a full listing. Listing-level ACs (E3-1, E3-2, E3-5, E3-6, E3-7) bind to the seeded unit, the Trek Marlin 7; any other unit's listing shows only the values MOCK-DATA gives for it, and sections without values are left out, not drawn as placeholders.

### E3-4 Reviews and ratings · Should
Seed: SEED-REVIEWS
As a first-time renter, Daniel wants other renters' experience, so he is not the first to find out.
1. Item and supplier each show a rating, a count and a distribution, not only an average. `[D]`
2. Individual reviews are readable: text, reviewer, date (MOCK-DATA.md section 7). `[D]`
3. Reviews are reachable from results, listing and supplier identity. `[B]`
States: review list (drawn on the Trek Marlin 7, MOCK-DATA §7), item with no reviews yet (the review block for the Scott Aspect 950, not a full listing). A review list shows the seeded texts; it need not show as many texts as the count.

### E3-5 The price before the flow · Must
`HE #1 #11 #17` · Seed: SEED-BOOKING
As a renter, Daniel wants the all-in price on the listing itself, so the number he starts with is the number he pays.
1. The listing shows the all-in total for the searched dates with its parts: day rate, delivery and collection, set-up (MOCK-DATA.md section 4). `[D]`
2. The deposit (S$150) is stated on the listing as held, separate from the total. `[D]`
States: within listing default.

### E3-6 Prepared for Daniel · Must
`B2` `Idea 6` · Seed: SEED-FIT
As a renter with a saved fit, Daniel wants to see what will be adjusted before delivery, so fit is a promise, not a hope.
1. The listing shows the set-up that will be applied for Daniel: saddle 72 cm, frame M, fork sag 25%, bars +1 cm. `[D]`
2. The set-up values trace to the fit profile and can be edited from here (E1-4). `[B]`
States: with fit profile, without (listing invites adding one).

### E3-7 Availability · Should
Seed: SEED-BOOKING
As a renter, Daniel wants to see when this item is free, so date conflicts surface before booking.
1. The item's availability around the searched date is visible; the searched date reads as available. `[D]`
States: within listing default.

### E3-8 Ask the supplier · Should
Seed: SEED-MESSAGES
As a renter with a question, Daniel wants to ask before booking, so uncertainty does not block the booking.
1. The listing leads to a message thread with this supplier (E9-1). `[B]`
States: covered by E9.

## E4 · Booking and payment

### E4-1 Choose delivery · Must
`B1` `Idea 1` · Seed: SEED-BOOKING
As a renter without transport, Daniel wants the platform to bring the bike to the ride, so the rental solves the actual problem.
1. Daniel chooses a delivery destination (Chestnut trailhead), a time slot (Sat 7:40) and assembled hand-over. `[D+B]`
2. The choices' cost consequence is visible as it is made (S$12 delivery and collection). `[D]`
States: choosing, chosen.

### E4-2 The return is part of the decision · Must
`B1` `Idea 1` `HE #5 #9` · Seed: SEED-BOOKING
As a renter, Daniel wants to see how the bike goes back before he commits, so the booking covers the whole loop.
1. Before anything is paid, the after-ride collection (place, Sat 13:30) is shown and chosen alongside delivery; the collection place is its own choice and may differ from the delivery destination (MOCK-DATA §4). `[D]`
2. The confirmation (E4-5) reflects the same collection. `[D]`
States: within booking flow.

### E4-3 See the full cost before committing · Must
`HE #1 #3 #9` · Seed: SEED-BOOKING
As a first-time renter, Daniel wants every charge visible before he pays, so nothing surprises him at or after checkout.
1. Before the action that commits payment, the screen shows: day rate, each further charge as its own line, the S$150 deposit as held not charged, and the all-in total (S$50). None of these sits only behind optional navigation. `[D]`
2. Daniel can confirm that no charges exist beyond those listed. `[D]`
3. The total before payment equals the total on the confirmation. `[D]`
States: cost review.

### E4-4 Liability, acknowledged by Daniel · Must
`HE #3 #9` · Seed: SEED-BOOKING terms
As a renter leaving a S$150 deposit, Daniel wants to know what he is liable for and to accept it himself, so consent is his act, not a default.
1. The damage and liability terms (MOCK-DATA.md section 4) are readable in full before payment. `[D]`
2. Daniel actively acknowledges them; both the unacknowledged and acknowledged states exist; payment cannot be committed without acknowledgement. `[D+B]`
3. What the deposit is, when it is released and how disputes use the handover record are stated in plain terms. `[D]`
States: terms unread/unacknowledged, acknowledged.

### E4-5 Confirmation that answers the next question · Must
`HE #18` · Seed: SEED-BOOKING
As someone who just paid, Daniel wants to see what was taken and what happens next, so paying ends in certainty.
1. The confirmation leads with the amount paid (S$50) and the deposit held (S$150). `[D]`
2. It shows what happens next in order: delivery Sat 7:40 at the trailhead, set to his fit, collection 13:30. `[D]`
3. It leads to the booking detail and tracking (E5-2, E5-3). `[B]`
States: confirmation.

### E4-6 Daniel cancels · Should
Seed: SEED-BOOKING terms
As a renter whose plans change, Daniel wants to cancel and know the money outcome first, so cancelling is a decision, not a gamble.
1. Cancellation is reachable from the booking detail. `[B]`
2. Before confirming, the outcome under the booking's terms is shown for the current time: what is refunded, what is kept, that the deposit is always released. `[D]`
3. After confirming, the booking reads as cancelled everywhere it appears, with matching amounts. `[D+B]`
States: outcome preview, cancelled booking.

### E4-7 The supplier cancels · Must
`B1` `HE #7` · Seed: VS-1
As a renter cancelled on the night before, Daniel wants the app to tell him, settle the money and start the recovery, so the plan survives the cancellation. This is the hard-scenario entry.
1. A notification announces the cancellation and leads to a cancellation notice. `[D+B]`
2. The notice states: who cancelled, why, that S$50 is refunded and the deposit hold released, with amounts matching the booking. `[D]`
3. The notice leads directly into a replacement search scoped to the original need and the remaining time (E4-8). `[B]`
4. The cancelled booking reads as cancelled in trips; nothing still shows it as upcoming. `[D]`
States: cancellation notification, cancellation notice, trips with cancelled booking.

### E4-8 Replace it in time · Must
`B1` `HE #1` · Seed: VS-1 candidates
As a renter with a ride at 8:00 tomorrow, Daniel wants replacements judged against the clock, so he picks with the real constraint visible.
1. Replacement results show, per candidate, the earliest delivery time against the ride start (Rodalink 7:40: in time; Marcus 8:30: after the start). `[D]`
2. Each candidate shows its all-in total, comparable with the original (VS-1 data). `[D]`
3. A candidate that cannot arrive in time is still shown with its constraint visible; choosing anyway is Daniel's call. `[D]`
4. Booking a replacement runs through E4-1..E4-5 with the new data. `[B]`
States: replacement results.

### E4-9 Payment fails · Must
Seed: VS-3
As a payer, Daniel wants a failed payment to say what happened and what works, so failure is a step, not a wall.
1. The declined state says what failed, that no charge was made, and in plain language what Daniel can do: retry or switch to PayNow. `[D]`
2. Switching method and completing leads to the normal confirmation; with PayNow and no card to hold it, the deposit is paid and later refunded, and the confirmation and every later page of the booking say so (MOCK-DATA §2 deposit rule, VS-3). `[B]`
States: payment declined.

## E5 · Rental management and fulfilment

### E5-1 Trips in one place · Must
`HE #4` · Seed: SEED-BOOKING
As a user, Daniel wants current, upcoming and past rentals together, so the rental has a home after booking.
1. Trips shows the upcoming booking, any active rental, the weekly ride when it exists (FD-RECURRING) and past trips. `[D]`
2. Each entry leads to its detail. `[B]`
3. Past trips show their closed outcome: amount, deposit returned. Daniel has no past trips at the mock clock (first-time renter); the first past trip is OR-10482 once it closes (E5-7 AC3). `[D]`
States: default (upcoming OR-10482, no past trips), with past trip (OR-10482 closed), with recurring present, empty (no trips ever).

### E5-2 Booking detail · Must
Seed: SEED-BOOKING
As a renter, Daniel wants everything about one rental on one page, so he never reconstructs it from fragments.
1. The detail shows: item, supplier, delivery and collection as booked, all amounts, the deposit state, the fit set-up to be applied, and the liability terms he acknowledged. `[D]`
2. It leads to tracking, messaging the supplier and cancellation. `[B]`
States: upcoming, active (day of), closed.

### E5-3 Delivery tracking · Must
`B1` `B2` `Idea 1` `Idea 6` `HE #7` · Seed: SEED-BOOKING
As a renter waiting at a trailhead, Daniel wants to see progress, so waiting has information in it.
1. Tracking shows the stages: being set to Daniel's fit, on the way, arriving, with the current stage identifiable. `[D]`
2. The fit stage names the set-up applied (saddle 72 cm, frame M), closing the loop on idea 6. `[D]`
3. The expected time (7:40) is visible throughout and updates if it changes. `[D+B]`
States: each stage, plus delayed (E5-4).

### E5-4 Delay · Must
`HE #7` · Seed: VS-2
As a renter with a group waiting, Daniel wants a delay to say the new time and his options, so he can decide instead of refresh.
1. The delayed state shows what changed (new arrival 8:05, +25 min) and that collection is unchanged. `[D]`
2. Daniel's options are present: message the supplier, review the booking's cancellation terms. `[D+B]`
3. A notification carries the delay and leads here. `[B]`
States: delayed tracking, delay notification.

### E5-5 Handover record · Must
`HE #11 #12 #13 #16` · Seed: SEED-BOOKING
As a renter liable for damage, Daniel wants the condition fixed in evidence at handover, so the deposit is judged on record, not memory.
1. At handover, the supplier's dated photos and Daniel's own photos of the same unit sit side by side for comparison, both timed in the same form. The hand-over views are close-ups of one part each: every known mark of the unit plus the part most at risk for its category; the set is defined per listing by the supplier, and Daniel's photos take the same views (MOCK-DATA §4). `[D]`
2. The record is complete when Daniel's photos of the listed views are taken; he marks nothing on them. The supplier's known marks are part of the record from the supplier's side, with their date and author, and so is anything Daniel reports (E5-6) once reported. A problem Daniel sees goes through E5-6, never through a marking step on the record. `[D+B]`
3. The completed record is reachable later from the booking detail and can be reopened to view. `[B]`
4. The record states its consequence: what is on the record at hand-over, known marks and reported problems alike, is not chargeable. `[D]`
States: recording, completed record (with a report, and the no-report variant), reopened view.

### E5-6 Report a problem at handover · Must
Seed: SEED-BOOKING
As a renter facing a wrong or damaged item, Daniel wants a way to object at the door, so acceptance is a choice.
1. From the handover record, Daniel can report a problem; the report names the booking and offers the photos just taken as evidence (MOCK-DATA §4, R-10482-1). `[D+B]`
2. The report's submitted state is visible, timed and numbered (MOCK-DATA §4) and reachable later. `[D]`
3. The supplier's reply and the report's outcome are visible later with the report, in the booking detail and on the close; a notification carries the reply (E9-3). No messages screen is required for this. `[D+B]`
States: report form, submitted, replied (in the booking detail).

### E5-7 Return, close, deposit back · Must
`B1` `Idea 1` `HE #13` · Seed: SEED-BOOKING
As a renter, Daniel wants the end of the rental to be as explicit as the start, so "done" is a screen, not an assumption.
1. The collection (place, 13:30) is visible on the day; after collection, the rental reads as returned. `[D+B]`
2. The close shows: condition on return against the handover record, the deposit released, amounts matching the booking. `[D]`
3. The closed rental appears under past trips with the same outcome. `[D]`
States: awaiting collection, collected, closed summary.

### E5-8 From one ride to every Saturday · Must
`B1` `Idea 3` · Seed: SEED-BOOKING, FD-RECURRING
As a rider who liked it, Daniel wants to repeat the exact arrangement weekly, so the second time costs one decision.
1. The closed rental offers repeating it every Saturday with the same delivery and collection, at the weekly price (S$45 / ride, below the one-off S$50). `[D]`
2. Accepting leads into E6-1 with everything pre-filled from this rental. `[B]`
States: offer within closed summary.

## E6 · Recurring rental

### E6-1 Set up the weekly ride · Must
`B1` `Idea 3` · Seed: FD-RECURRING
As a weekly rider, Daniel wants a standing arrangement, so logistics stop being a weekly task.
1. Setup shows what will recur: every Sat, delivery 7:40 Chestnut trailhead, collection 13:30, S$45 / ride (below the one-off S$50), first occurrence Sat 1 Nov. Setup is reachable from the closed rental (E5-8) and from the upcoming booking in trips; the first occurrence is the Saturday after the booked ride either way (MOCK-DATA FD-RECURRING). `[D]`
2. Setup states when money moves: nothing is charged at setup; each ride is charged S$45 at its skip deadline (Thu 20:00), and the S$150 deposit is held for each ride at that point and released after that ride's return check (MOCK-DATA FD-RECURRING). `[D]`
3. Confirming creates the weekly ride; it appears in trips. `[B]`
States: setup review, created.

### E6-2 The weekly ride, visible · Must
`Idea 3` `HE #4` · Seed: FD-RECURRING
As a subscriber, Daniel wants the standing arrangement inspectable, so recurring never means opaque.
1. The weekly ride's page shows: day, drop-off time and place, collection, cost per ride (S$45 / ride), the next occurrence, and the skip deadline (Thu 20:00). `[D]`
States: default.

### E6-3 Skip, pause, stop · Must
`Idea 3` · Seed: FD-RECURRING
As a person with a life, Daniel wants out for a week or forever, without a call, so commitment stays reversible.
1. Daniel can skip the next occurrence, pause the series, or stop it; each states its effect before confirming: which Saturday it applies from, what is charged, and for a pause, that it lasts until Daniel resumes (effects in MOCK-DATA FD-RECURRING). `[D+B]`
2. After each action, the weekly ride's page and trips reflect it. `[D]`
States: skip confirm, paused series, stopped series.

### E6-4 The next occurrence behaves like a booking · Should
`Idea 3` · Seed: FD-RECURRING
As a subscriber, Daniel wants each occurrence to be trackable like any rental, so recurring rentals lose nothing.
1. The next occurrence appears in trips and leads to a booking detail with the standing values. `[D+B]`
States: occurrence in trips.

## E7 · Owner: equipment log

### E7-1 What I own · Should
`B3` `Idea 9` `HE #22` · Seed: SEED-EQUIPMENT
As an owner, Daniel wants his gear listed with the facts that matter for space, so the flat's problem is visible in the app.
1. My gear lists Daniel's items with, per item: where it lives, when it was last used (mock-clock relative), and a space note where one exists. `[D]`
2. Each item leads to its detail. `[B]`
3. The coach kit's "already owned" check (E2-5) reads from this list. `[D]`
States: list default, empty list.

### E7-2 Add an item · Should
`B3` `Idea 9` · Seed: SEED-EQUIPMENT
As an owner, Daniel wants to log a new item, so the list stays true.
1. Daniel adds an item with at least a name, a type and where it lives; it appears in the list. `[D+B]`
States: add flow, list updated.

### E7-3 Item detail, at home · Should
`B3` `Idea 9` `HE #10` · Seed: SEED-EQUIPMENT
As an owner, Daniel wants one item's situation in full, so "store it" becomes an informed option.
1. The detail shows: the item, where it lives, space taken, last used (24 May 2026, "5 months ago"). `[D]`
2. Storing it is offered from here and leads to E8-2. `[B]`
States: at home. (At the Hub is E8-5.)

### E7-4 The idle prompt · Should
`B3` `Idea 9` · Seed: SEED-NOTIFS
As an owner who stops noticing his own clutter, Daniel wants the platform to ask about untouched gear, so idle things resurface on their own.
1. The seeded notification about the Giant Escape 3 leads to that item's detail. `[B]`
2. The prompt states the fact it rests on (not used since 24 May) and does not demand; the decision stays Daniel's. `[D]`
States: idle notification.

### E7-5 Usage updates itself · Should
`B3` `Idea 9` · Seed: SEED-EQUIPMENT, VS-6
As an owner, Daniel wants last-used dates maintained by the platform when items pass through it, so the log stays honest without bookkeeping.
1. The item detail states that dates update automatically when the item moves through the platform; the stored bike's record (VS-6) demonstrates it with the intake date. `[D]`
States: shown within item detail.

## E8 · Storage

### E8-1 What storage is and costs · Should
`B3` `Idea 8` `HE #6` · Seed: SEED-STORAGE
As an owner short of space, Daniel wants storage explained before any commitment, so the Hub is a choice he can evaluate.
1. The storage surface states: what the Hub handles, S$18 / month per bike, what the intake includes, and that a stored bike can earn rent. `[D]`
2. It leads to sending an item (E8-2) and to the rent-out terms (E8-6). `[B]`
States: default.

### E8-2 Send a bike to the Hub · Should
`B1` `B3` `Idea 2` `Idea 8` `HE #5` · Seed: SEED-STORAGE, FD-STORAGE-BOOKING
As an owner without a van, Daniel wants the platform to collect the bike, so storing it does not require moving it himself.
1. Daniel chooses between home collection (daily 5–7 pm only) and dropping at a nearby rack for a pooled courier run (next runs shown: Tue and Fri mornings). The constraint of each path is visible as he chooses. `[D]`
2. The cost of the chosen path and the running storage cost are shown before confirming. `[D]`
States: choosing path, path chosen.

### E8-3 The way back, shown first · Should
`B3` `HE #5` · Seed: SEED-STORAGE
As an owner, Daniel wants to know how the bike comes home before it leaves, so storage never feels like surrender.
1. Before confirming storage, the return options and their costs are shown: free on a pooled run with 2 days' notice, next-day home return S$8. `[D]`
2. The confirmation restates the return terms. `[D]`
States: within E8-2 flow.

### E8-4 Intake record · Should
`B3` `Idea 8` · Seed: VS-6
As an owner handing his property to a warehouse, Daniel wants its condition fixed at intake, so storage is safe for the owner, not only convenient.
1. The intake produces a dated condition record with photos; Daniel can read it from the item's detail. `[D+B]`
2. The record states its consequence: condition at intake is the baseline for anything later, including rentals of the stored bike. `[D]`
States: intake record view.

### E8-5 Item detail, at the Hub · Should
`B3` `Idea 8` `HE #10` · Seed: VS-6
As an owner of a stored bike, Daniel wants its status at a glance, so out of sight is not out of knowledge.
1. The stored state of the detail shows: at the Hub since 28 Oct, the intake record, the running cost, and the rent-out state (not yet opted in). `[D]`
2. Retrieval is offered from here (E8-9). `[B]`
States: at the Hub. (Pairs with E7-3's at-home state: one page, two states.)

### E8-6 Earn while stored · Should
`B3` `Idea 8` · Seed: VS-6, SEED-EQUIPMENT rent-out values
As an owner who would list "if the money covered the trouble", Daniel wants rent-out to be opt-in with the terms first, so his liability worry is answered before his bike earns.
1. Opting in shows, before confirming: the suggested rate (S$12 / day), the owner share (70%, S$8.40 / day rented), and that condition is re-checked after every rental against the intake record. `[D]`
2. Daniel confirms himself; the item then reads as available to rent, and earnings to date are visible on its detail. `[D+B]`
States: terms review, opted in.

### E8-7 The storage map · Should
`B1` `B3` `Idea 7` `HE #15` · Seed: SEED-STORAGE map, VS-5
As a rider returning a bike in the field, Daniel wants nearby public racks with live facts, so a rack is a plan, not a hope.
1. The map shows racks with: spaces (12 / 12 full at Rack A, 4 of 10 free at Rack C), distance, and when each count was updated. `[D]`
2. Whether choosing a rack reserves a spot, and for how long (2 h), is stated. `[D]`
States: map default.

### E8-8 The full rack is not the end · Should
`B1` `B3` `Idea 7` · Seed: VS-5
As a rider caught by rain far from the booked collection point, Daniel wants to return the rented bike at the next nearest rack when the first is full, so idea 7 works precisely when it is needed. The bike in VS-5 is the rental (Trek Marlin 7, OR-10482), not the Giant Escape 3; the Giant stays at home until the Hub intake on Tue 28 Oct. This departs from the Iter1 hard scenario, where the old bike came back via a rack (settled by Haoyue, 24 Oct).
1. With Rack A full, the map offers Rack C (650 m, 4 free) as the alternative; choosing it reserves the spot. `[D+B]`
2. Before the drop is confirmed, the rack-return terms are shown: no extra charge, the 13:30 trailhead collection is replaced, and the return check happens when the supplier's courier collects from the rack (MOCK-DATA VS-5). `[D]`
3. After the drop, the booking shows the bike at Rack C awaiting collection, and the 13:30 trailhead collection reads as replaced. The close (E5-7) follows from the courier's check. `[D]`
States: full-rack with alternative, rack-return terms, dropped-at-rack status.

### E8-9 Bring it back · Should
`B3` · Seed: VS-6
As an owner, Daniel wants retrieval to be one action, so the second transaction is lighter than the first.
1. From the stored item, scheduling a return needs only the time choice: the platform already shows which item, from where, to where. `[D+B]`
2. The chosen path's cost (free pooled run, or S$8 next-day) is confirmed before committing. `[D]`
States: schedule return, return scheduled.

## E9 · Communication and notifications

### E9-1 Message a supplier · Should
Seed: SEED-MESSAGES
As a renter with a question, Daniel wants to message the supplier from the listing or the booking, so questions have a channel inside the product.
1. From a listing or a booking detail, Daniel opens a thread with that supplier; one thread per counterpart. `[B]`
2. Sending shows the message in the thread; the conversation list's preview and time update to match. `[D+B]`
States: thread, composing, sent.

### E9-2 Conversations in one place · Should
Seed: SEED-MESSAGES
As a user, Daniel wants his conversations listed with what is new, so messages are findable after the moment passes.
1. A conversation list shows each thread with counterpart, latest preview, time and unread state. `[D]`
2. A reply (seeded) updates the thread and the list consistently. `[D]`
States: list with unread, list all read, empty list, thread with reply.

### E9-3 The notification catalogue · Must
Seed: SEED-NOTIFS, VS-1, VS-2
As a user, Daniel wants events to reach him and lead somewhere, so the app can start conversations, not only answer them.
1. These events produce notifications, each leading to its subject: booking confirmed → booking detail; supplier cancellation → cancellation notice (E4-7); delivery delay → tracking (E5-4); collection done and deposit released → closed summary (one notification, sent when the deposit release shows; the collection itself does not notify separately); report reply → the booking detail's report section (E5-6); idle item → item detail (E7-4); new message → thread. `[D+B]`
2. No notification is a dead end; every one opens the thing it is about. `[B]`
The idle-item and new-message types carry the priority of their destination stories (E7-4, E9-1: Should); the other four are Must.
States: one drawn example per notification type.

### E9-4 The notification centre · Should
Seed: SEED-NOTIFS
As a user, Daniel wants past notifications kept and marked, so missing a moment is recoverable.
1. A notification centre lists notifications with time and seen state; opening one marks it seen and leads to its subject. `[D+B]`
States: with unseen, all seen, empty.

### E9-5 Report a problem · Could
Seed: none
As a user outside the handover moment, Daniel wants a general way to report a problem with a booking or an item, so trouble has a door anywhere.
1. From a booking or item detail, a report names its subject and reaches a submitted state. `[D+B]`
States: report form, submitted. Both reuse the E5-6 states; no separate comps. In scope for the final build as this reuse.

## E10 · Cross-cutting

### E10-1 Every listed state exists · Must
1. Every state named in a story's "States" line appears in the design comps and in the build. A missing state fails that story. `[D+B]`

### E10-2 Library consistency · Must
1. Every component on every page comes from the design library (design/components.css, tokens, icons); no per-page restyling of shared components. DESIGN.md section 10's locked list applies in full. `[D]`

### E10-3 One world of data · Must
1. Every value on every page comes from MOCK-DATA.md; the same fact never appears with two values. A contradiction fails both pages. `[D]`

### E10-4 Copy rules · Must
1. The app never speaks as "we" and never gives conversational instructions; labels are plain and neutral. Attributed content (coach notes, reviews, messages) may speak in its author's voice. Sentence case per DESIGN.md. `[D]`

### E10-5 Reach and contrast · Must
1. DESIGN.md's minimums pass everywhere: 44 px touch targets, 4.5:1 text contrast, 3:1 for icons and borders, 393 frame. `[D]`

### E10-6 Real entries only · Must
1. Every variant state (VS-1..VS-6) is reachable through an in-product entry defined in its story (a notification, a map, an item detail). No demo-only buttons exist. `[B]`

---

## Open questions

Raised here, answered by the PO window, folded into the next version:

1. Resolved in v1.2: E9-5 stays in scope as a reuse of the E5-6 report form and submitted state.
2. Resolved 23 Oct 2026: MOCK-DATA.md is approved. Consistency is the standard; value changes go through the PO window.
3. HE tag numbers are copied from team/sitemap.html; verify against the Iter1 HE document before they appear in any course deliverable.
4. v1.1: the design window's DESIGN-GAPS-v1.0 items are all answered; the per-item responses are in the project doc product/PO-ANSWERS-v1.1.md. The gaps doc cited a file review/feedback/wording-rules.md that is not in the repo; its substance is covered by the "Labels are copy" rule in section 0. (It is now in the project; see 5.)
5. v1.2: DESIGN-GAPS-v1.1 is answered in product/PO-ANSWERS-v1.2.md. Where an example in review/feedback/wording-rules.md quotes a value, MOCK-DATA.md wins; the rules govern form, not values.
6. Not yet raised by the design window, no value set: the deposit for the Rodalink replacement booking (E4-8 AC4 runs it through E4-3). Raise by story ID if the replacement's cost review is drawn.
7. Resolved 24 Oct 2026 (Haoyue): VS-5 returns the rental, Trek Marlin 7 (OR-10482), at the rack on Sat 25 Oct; the Giant Escape 3 stays at home until the Hub intake on Tue 28 Oct. The departure from the Iter1 hard scenario is noted in E8-8. VS-5 does not move.
8. Resolved 24 Oct 2026 (Haoyue): the MoSCoW floor is the demo route (§0). Now 41 Must, 25 Should, 1 Could. One judgement call in product/PO-ANSWERS-v1.4.md: E0-3 (storage entry on Home) moved to Should because its only destination, E8-1 on page 16, is off the route; say so if the Home storage card is to be protected, and E0-3 and E8-1 return to Must.
9. Resolved 24 Oct 2026: the three values set by the PO are accepted by Haoyue as they stand (set by PO, accepted by Haoyue 24 Oct): weekly price S$45 / ride, Hub transfer S$10 home collection, S$5 rack drop. They are no longer open. Any change goes through the PO window and changes everywhere at once.
10. The PO-ANSWERS files for v1.1 and v1.2 were first written as project docs; from 24 Oct copies sit in product/ next to v1.3. The repo copies are the reference.
11. Resolved 25 Oct 2026 (Haoyue, "all ok"): every PO-set value of v1.5 and v1.6 is accepted as it stands. Set by PO, v1.5: Daniel's home address (Blk 325C Sengkang East Way #11-42, Singapore 543325); the hand-over spot at the Chestnut trailhead carpark ("By the park entrance sign"); the shop's handover record time (18 Oct · 16:20); the E5-6 report submitted time (25 Oct · 7:46). Added v1.6: the courier's name (Hafiz, no photo); the weekly 10% rule as a platform rule; the multi-day rule (10% off the day rate from 3 days); the two bike sizes in SEED-EQUIPMENT; Rack S near home and the pooled-run window 7:00–10:00; the intake record time (28 Oct · 19:45) and views. Any change goes through the PO window and changes everywhere at once.
12. Not asked for, no value set: the 12 Oct photos (2 of the 5 on the Trek Marlin 7 listing) carry a date but no time. If they appear beside a timed record, raise by story ID (E3-1 or E5-5) and the PO sets a time.
13. Resolved 25 Oct 2026 (Haoyue, option A): Home shows four categories, Bikes, Kayaks, Paddleboards, Camping. Paddleboards and Camping are each seeded with one item (MOCK-DATA §12) so the tiles lead to real data.
14. Resolved 3 Nov 2026 (Haoyue, superseding the 1 Nov outcome for the prototype): a small fresh cosmetic scratch on the chainstay, with the chain on. The shop's 7:49 reply puts the scratch on its record, not Daniel's; no repair or action by Hafiz is needed. Daniel rides at 8:00; nothing chargeable; collection 13:30 and deposit release 14:05 unchanged. Reference R-10482-1 and the reply text in MOCK-DATA §4 apply (product/PO-ANSWERS-v1.11.md).
