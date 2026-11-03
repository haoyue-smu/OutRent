# Inbox · PO task (copy on ops for the orchestrator; the PO chat window has the same text)

## Task (3 Nov): PO-ANSWERS-v1.11 · the prototype's hand-over problem is a small scratch, not the chain

The A/B test is finished. Its test site used a chain lying on the ground so that strangers would notice it; that stays in the test only. **In the prototype, Daniel finds a small problem that does not stop the ride** (Haoyue, 3 Nov): a chain that is off would cancel the ride, which breaks the rest of the route.

**The new value:** a **fresh scratch on the chainstay** (the frame tube beside the chain), visible in Daniel's drivetrain photo (25 Oct · 7:41) and not in Timah Cycles' 18 Oct photos. Cosmetic only; the bike is fine to ride.

Change, with values:

1. **REQUIREMENTS §1, the easy scenario as walked:** the chain step becomes "his drivetrain photo shows a fresh scratch on the chainstay that is not in the shop's photos; he reports it before riding (7:46) and rides at 8:00 as planned".
2. **MOCK-DATA §4, condition items:** the third item becomes "Reported at hand-over: a fresh scratch on the chainstay", seen 25 Oct · 7:41, not in the shop's 18 Oct photos; after the report it is on the shop's side of the record, like the known marks, and not chargeable to Daniel.
3. **E5-6 reply and outcome:** keep R-10482-1, sender "Timah Cycles", 25 Oct · 7:49. New reply text, their voice, short: "Thanks for the photo. The scratch is on our record for this bike now, not yours. Enjoy the ride." Outcome: on the shop's record, not chargeable, **no fix and no action by Hafiz** (delete the 7:52 fix line). Daniel rides at 8:00.
4. **12 return check and the MOCK-DATA return line:** "the reported chain" -> "the scratch reported at hand-over (R-10482-1)"; everything else unchanged.
5. **Sent-screen line** stays "Timah Cycles replies to your booking" (v1.9).
6. Search both files for "chain" in this sense afterwards; only history lines may keep it.

Nothing else moves: report 7:46, record saved 7:47, reply 7:49, ride 8:00-12:30, collection 13:30, deposit released 14:05.

Answer in product/PO-ANSWERS-v1.11.md (short). Bump MOCK-DATA.md and REQUIREMENTS.md with change-log lines. Commit and push on `product-requirements` as Haoyue only, no AI attribution. Do not merge to main.
