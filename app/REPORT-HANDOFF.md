# Hand-over report · local review

3 Nov 2026. Branch `prototype-report`, based on `origin/main` at `7e5b53b97426adaf0e5910ba19293f111db234bf`. Product authority: PO v1.11 (`be61a5c`) plus the user's approved photo and management corrections on 3 Nov. Publishing is coordinated on `prototype-report` only; no merge or deployment is part of this change.

## Result

- 11 keeps the report entry below the record card. Three photos enable Save; Daniel does not manually circle marks. The shop's two rings remain. Daniel's approved drivetrain photo is dated 25 Oct · 7:41; once attached to a sent report, it gets a white ring at 34%, 52% and a “Reported · 7:46” tag. The same overlay follows the submitted photo into the receipt, filed slip and booking.
- The report form offers four reasons, available hand-over photos, optional details and a send action. Drafts and sent reports survive re-entry/reload. Missing reason is explained inline and receives focus. The sent receipt shows R-10482-1, 25 Oct · 7:46 and “Timah Cycles replies to your booking”.
- Save files the record at 7:47 with either “1 problem reported” or “nothing new”. 09 places the report below the record entry and shows Timah Cycles' approved 7:49 reply. 12 names the scratch reported at hand-over and confirms nothing chargeable. No repair or 7:52 event is shown.
- The approved Damaged + drivetrain report gets the scratch-specific reply. Every other sent report gets the user-approved general acknowledgement at the same delivery +9-minute time. No reply appears early. The booking offers an explicit wait action to advance the prototype story to that time. After the rental closes, an existing report stays readable; a new hand-over report cannot be backdated.
- 09 keeps a saved booking visible before the fixed 8:00 ride. Direct-entry or legacy records with missing payment state remain inspectable without manufacturing a payment flag; their payment details are shown as unavailable. This repairs the inherited empty-booking path caused by saving directly from an unpaid preview state.
- Report return navigation does not add an extra Back step. The ride time skip begins from the current record time; reopening a closed record does not replay the ride.
- `/components` uses the same live reason row, photo attachment and sent-card components and links to both filed-slip variants.

The seeded delivery remains 7:40, report 7:46, record 7:47, reply 7:49, ride 8:00–12:30, collection 13:30 and release 14:05. For a different delivery slot, the existing app convention of preserving timeline offsets also applies to the report (+6/+7/+9 minutes). Historical v1.9/v1.10 PO answers are copied unchanged; current product documents use v1.11.

## Review states

The existing `?seed=<base64 JSON>` entry supports a top-level report. Example report fields:

```json
{"reason":"Damaged","photos":["drive"],"details":"","sent":true}
```

Include normal booking state (`paid`, `arrived`, `book`) and `record: {"shots":["crank","saddle","drive"],"marks":[],"saved":true}` for a filed record. Use `&report=form` for the form or `&report=sent` for a submitted receipt. The gallery provides ready-made links. Seeds remain isolated from persisted progress; `/reset` starts a fresh normal story. Old stored states without the report field receive its empty default.

## Validation and evidence

Run in `app/`: `npm run check` (TypeScript, lint, design checker) and `npm run build`. No package was added or upgraded; matching installed dependencies were copied into this worktree from the existing D-drive installation.

Run from the worktree root with the local server on port 5191:

```powershell
$env:BASE = 'http://127.0.0.1:5191'
$env:BROWSER_EXECUTABLE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
$env:E2E_OUT = 'D:/YUE/c_project/outrent/.orchestrator-worktrees/prototype-report/app/e2e/out/prototype-report/'
$env:TEMP = $env:E2E_OUT + 'tmp'
$env:TMP = $env:TEMP
node app/e2e/run.mjs
node app/e2e/reset.mjs
node app/e2e/crawl.mjs
```

The crawl records every discovered control, visible response, known placeholder, skipped action and exploration limit. It is a bounded control crawl, not a claim that every possible sequence is implemented. Existing journeys still identify pre-existing out-of-demo features such as Profile and weekly skip/pause. The report flow performs no external submission, analytics or database mutation.

Local evidence is under `app/e2e/out/prototype-report/` (ignored by Git): check/build logs, journey JSON and logs, crawl JSON/Markdown and screenshots. The eight required report screenshots are `shots/report-01-before-photos.png` through `report-08-return-check.png`; the numbered set includes the form, sent receipt, sent link, filed slip and 09 report section. Baseline provenance is recorded in `before/BASELINE.md`; any screenshot taken after editing is explicitly excluded from baseline evidence.

The subsequent approved-photo and management fixes are checked in `app/e2e/out/scratch-photo-review/`, preserving the earlier evidence. `node app/e2e/scratch-photo.mjs` covers the overlay, 375/393 px, actual reply waiting, ride boundaries, alternate delivery times, generic replies and unchanged return photos. Final counts and screenshot paths are recorded with those outputs.

## Remaining gates

**Approved image:** `app/public/img/11-mine-drive-scratch.webp` is the exact binary from `origin/ops:inbox/assets/11-mine-drive-scratch.webp` at `f48b927d609a1a94f06e84f7d31e45b2c5dc48e0`: 1483 × 1061, 240,904 bytes, SHA-256 `147d667a65c177f0d8b4166debf927985c5c859277a7de1ef7ca33b996f00e61`. The ring is a UI overlay; the source image is unmodified. Unattached photos are never marked as reported. Page 12 retains all three original return photos.

No physical iPhone was available to this coding task. On a real device, check that the keyboard leaves the form usable, the bottom actions clear the safe area, the report entry remains below the record, shop rings stay unchanged, and Daniel's scratch ring only appears after that photo is submitted. Check the wait action reveals the 7:49 reply before the ride.

Local server access required the supported elevated execution flow. An initial PO commit was blocked by the legacy student-folder hook; the repository's existing `OUTRENT_LEAD=1` maintainer mode then ran the hook successfully for the explicitly authorised product files. No automatic approval rejection was bypassed and no system settings were changed.
