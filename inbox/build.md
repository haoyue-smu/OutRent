# Inbox · Build (Claude Code)

Last updated 24 Oct 13:20 by the management chat.

Done (verified in git): 02 Coach's Kit baseline (build/02-coach-kit 2f02504); 04/05 photo masters + WebP (build/photos-04-05 ca9b727).

## Open task: merge the 01 and 02 baselines to main

Merge rule (24 Oct): a page baseline merges to main once it passes `npm run check` and the outrent-ui-review skill. The Inspiration layer comes later as its own commit and is not a blocker.

1. On build/01-home: run `npm run check` and outrent-ui-review on 01 Home. Fix what they flag, commit, push.
2. Merge build/01-home into main (merge commit), push main.
3. Rebase or merge build/02-coach-kit onto the new main, run check + outrent-ui-review on 02, fix, then merge into main and push.
4. Leave build/photos-04-05 unmerged until 04 and 05 are built; rebase it onto main so it stays current.
5. Merge branch `product-requirements` (tip 585a539 or later; the PO window may push v1.4 today — fetch first) into main with a merge commit, push main. Haoyue approved this on 24 Oct 13:12. If it conflicts with anything outside product/, stop and say so in the commit message.
6. Do not run /design-sync; Haoyue runs it himself when needed.

No AI attribution in commit messages. Put what was fixed and anything not done in the commit messages.
