# Inbox · Build-2 · bring the hand-over report into the live app (3 Nov)

Written by the management chat. Haoyue approved this on 3 Nov 12:45. The A/B test is closed; do not change the test site or its database. This task changes the **live app** (`app/`, deployed to outrent-g14t3.vercel.app).

## Result of the test, in one line

Keep the "Something wrong with the bike?" link **below the record card, next to Save record** (the current layout). Results: claude/experiment/RESULTS-analysis.md (project doc).

## The prototype's story (not the test's)

The test used a chain on the ground. **The prototype does not.** In the app, Daniel's drivetrain photo (25 Oct · 7:41) shows a **fresh scratch on the chainstay**, not in the shop's 18 Oct photos. It does not stop the ride. He reports it at 7:46, saves the record at 7:47, the shop replies at 7:49 ("on our record, not yours"), he rides at 8:00. Values come from PO-ANSWERS-v1.11 on branch `product-requirements` (being written now; use v1.10's times and the text above until it lands, and recheck before you finish). **The app keeps its own film-look photos**; the six clear test photos stay in the test site only.

## Work

Branch `prototype-report` from `origin/main`. Reuse what you built for the test where it fits (`app/src/pages/11-handover-check/pieces.tsx`, the report form and sent screen on branch `abtest`), but in the app's story, state and route.

1. **11 · report flow.** The link opens the real report form (reason radios Wrong item / Damaged / Not adjusted to my fit / Something else, Daniel's hand-over photos to attach, optional details, "Send to Timah Cycles") and the "Report sent" screen (reference R-10482-1, sent 25 Oct · 7:46, line "Timah Cycles replies to your booking"). Back on 11 the link reads "Report sent · 7:46". The toast "not in this demo yet" goes.
2. **11 · the record.** No "No marks to record" line, no "Circle the … on your photo" step; the record is complete with three photos (PO v1.9, E5-5 AC2). Shop photos keep their rings; Daniel's photos carry a date tag only. Save is enabled after three photos.
3. **11 · filed slip:** "3 parts checked · 2 known marks · 1 problem reported" when a report was sent; the old "nothing new" line when not.
4. **Downstream:** the sent report and the shop's reply (7:49) show on **09 booking detail** under the hand-over record, and **12's return check** names the scratch reported at hand-over as on the shop's record. Take the exact lines from PO v1.11 when it lands.
5. **Photo:** Daniel's drivetrain photo on 11 becomes `img/11-mine-drive-scratch.webp` from OutRent Image Library when the Images window delivers it (Haoyue will pass it to you or Management puts it on ops). Until then keep the current photo; do not use any test-site photo.
6. **Demo route and seed:** the store and `?seed=` cover "report sent" so a reviewer can open 11, 09 and 12 in that state.
7. **/components:** add the report form's new pieces (reason radio row, photo attach thumb, sent card) as specimens if the library lists components by kind.

## Acceptance

- `npm run check` passes; the live journeys pass, plus a new one: 10 → 11 three photos → report → sent → save → 12 → 09 shows the report.
- No console errors; no horizontal overflow at 375 and 393.
- Screenshots at 393 × 852 of: 11 before photos, 11 after photos, report form, report sent, 11 with "Report sent · 7:46", filed slip, 09 report section, 12 return check.

## Ship

Commit as Haoyue only ("Haoyue Wu" <haoyue.wu.2021@smu.edu.sg>), no AI attribution. Push the branch, then merge to `main`, push, `npx vercel --prod` from the main app, then `vercel alias set <deployment> outrent-g14t3.vercel.app`. Check the live demo loads. Hand back the commit, the screenshots and anything you could not do.
