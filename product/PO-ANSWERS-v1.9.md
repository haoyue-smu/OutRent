# PO window · the A/B test scenario (inbox 31 Oct)

31 Oct 2026. Sources: the A/B test plan (Claude Doc), the participant flow artifact, claude/notes/2026-10-31-ab-impact.md. REQUIREMENTS.md at **v1.9**, MOCK-DATA.md at **v1.8**, branch `product-requirements`. One decision is a proposal awaiting Haoyue (point 4, REQUIREMENTS open question 14); everything else is applied.

## 1 · Scenario text

REQUIREMENTS §1 gains one paragraph, "The easy scenario, as walked", from Wed 22 Oct's booking to Sat 14:07's weekly-ride setup, with the new step: at 7:40 Daniel photographs the three parts, his drivetrain photo (7:41) shows a bent rear derailleur not in the shop's 18 Oct photos, he reports it before riding (7:46). Everything else in his Saturday stands: ride 8:00–12:30, collection 13:30, deposit released 14:05, weekly ride 14:07. The seed (MOCK-DATA §4 fulfilment timeline) carries the same minutes. Harwin's requirements doc can take the paragraph as written.

## 2 · The new damage item (MOCK-DATA §4)

"Existing marks" is now "Condition items on this unit, three": the two known marks unchanged (crank scratch, saddle scuff, shop photos 18 Oct · 16:20), and **reported at hand-over: a bent rear derailleur**, seen in Daniel's drivetrain photo 25 Oct · 7:41, not in the shop's 18 Oct photos. After the report it sits on the shop's side of the record like the known marks and is not chargeable to Daniel.

## 3 · E5-6 values

- **Reference:** format `R-<booking number>-<sequence>`; value **R-10482-1**.
- **Reply:** sender "Timah Cycles", **25 Oct · 7:49**, text (their voice): "Thanks for the photo. The derailleur is now on our record for this bike, not yours. Hafiz is still at the carpark and will straighten the hanger before he leaves. If it skips gears on the ride, message us and we'll swap the bike at collection."
- **Where Daniel sees it:** Messages is out of scope (E9-1, E9-2 are Should and unbuilt; no thread screen exists). The sent report and the reply live **with the booking**: 09 booking detail under the hand-over record (reference, reason, sent time, reply, outcome); 11 reopened record carries the same status line; 12 shows the outcome in the return check. A notification "Timah Cycles replied to your report R-10482-1" at 7:49 leads to the booking detail's report section (E9-3 gains this type). **Sent-screen line changes** from "Timah Cycles replies in Messages" to **"Timah Cycles replies to your booking"**. E5-6 gains AC3 and a "replied" state.

## 4 · What happens after the report · proposal

**Hafiz acts, on the spot.** He delivered at 7:40 and is still at the carpark while the record is being made. The shop's 7:49 reply puts the derailleur on their record and tells Daniel Hafiz will straighten the hanger; Hafiz does so at **7:52** and leaves at 7:55. **Daniel rides at 8:00.** **Nothing is chargeable:** the item is on the shop's side of the record, with the known marks. Collection 13:30 and deposit release 14:05 are unchanged; the record saved at 7:47. The alternative, a swap, would need a second bike and a second delivery before 8:00 and breaks the rest of the route, so it is offered only as the shop's fallback in the reply text ("if it skips gears, message us and we'll swap the bike at collection").

New lines (values; labels are copy):

- **11 filed slip:** "3 parts checked · 2 known marks · 1 problem reported". The old line, "3 parts checked · 2 known marks · nothing new", stays as the **no-report variant** (the test site shows it to people who do not report; the main app's demo route does not).
- **12 return check:** "Checked at the carpark, 25 Oct · 13:30, against the hand-over record: 2 known marks and the reported derailleur (R-10482-1, fixed at hand-over), all on the shop's record. Trail dirt only. Nothing new, nothing chargeable. Deposit S$150 released 14:05."
- **MOCK-DATA return line:** "Return: collected at the carpark 25 Oct · 13:30. Condition as at hand-over: two known marks and the derailleur reported at 7:46, all on the shop's record; trail dirt only; nothing new, nothing chargeable. Deposit release shows 25 Oct · 14:05."

Haoyue accepts or changes this (open question 14). If he prefers the shop to act by message only (no fix at the carpark), the 7:52 line is deleted and the reply text loses its second sentence; nothing else moves.

## 5 · E5-5 AC2

Rewritten: "The record is complete when Daniel's photos of the listed views are taken; he marks nothing on them. The supplier's known marks are part of the record from the supplier's side, with their date and author, and so is anything Daniel reports (E5-6) once reported. A problem Daniel sees goes through E5-6, never through a marking step on the record."

Dependencies checked: E5-5 AC4 reworded to "what is on the record at hand-over, known marks and reported problems alike, is not chargeable"; the liability terms in MOCK-DATA §4 ("Damage recorded at handover is not chargeable") already cover both and are unchanged; E4-4 AC3, E5-7 AC2 and E5-6 AC1 refer to the record, not to marking, and stand. E5-5 states gain "completed record (with a report, and the no-report variant)". The MOCK-DATA line that gave Daniel's marks a time is replaced by his three photo times (7:40, 7:40, 7:41) and "Daniel marks nothing". For Creative: the "No marks to record" line under the drivetrain slot has no value behind it any more and goes.

## 6 · 07 deposit wording

**Unchanged.** The report changes what is on the record, not the deposit rule: S$150 held on Visa ···4821, not charged, released after the return check (MOCK-DATA §2, §4 payment lines). 07 and 08 stay as in v1.8.

## Not done

- The new drivetrain image (`11-mine-drive-bent.webp`) is the Images window's; MOCK-DATA names the photo by view and time only.
- Open questions 6 and 12 untouched. Merge into main: Build does it.
