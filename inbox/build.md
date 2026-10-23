# Inbox · Build (Claude Code)

Last updated 23 Oct 20:16 by the management chat.

## Open task: 02 Coach's Kit baseline

Same method as 01 Home (build/01-home, 0a84bd6). Branch from build/01-home so the shared icons, Photo component and checker change come with it.

Source: the Design artifact https://claude.ai/artifact/8h22yujNoYT7h9mVumf6De (round 2, 23 Oct 18:32). Read project/canvas.json, then every project/*.dc.html board including Notes.dc.html. Ignore any older "02 Coach's Kit" artifact.

- app/src/pages/02-coach-kit/, registered in app/src/pages/index.ts.
- Every frame on the Frames page is a real state behind one mock-state const at the top of the file.
- Classes from design/components.css, tokens from design/tokens.css; the board's proposed components go in a page CSS file, tokens only.
- Links between pages with <GoTo page="…">. Both photos on this page reuse 01 Home images through the Photo component: "Coach Aisyah, portrait" → work/haoyue/01-home/assets/01-home-coach-aisyah.webp; "a mountain bike with front suspension, side view" → work/haoyue/01-home/assets/01-home-bike.webp. No new images for 02.
- npm run check: 0 errors.

Commit on branch build/02-coach-kit and push. Do not merge. No AI attribution. In the commit message: what was built, and any board element you could not build.

## Next task (after 02): bring in the 04 and 05 photos

Eight Midjourney images are in my Downloads folder (added 23 Oct 20:15). Same treatment as the 01 Home photos (masters + 1600 px WebP, Photo component):

| File | Goes to | Replaces the placeholder labelled |
|---|---|---|
| 04-search-marlin-6.jpg | work/haoyue/04-search-results/assets/ | "this Trek Marlin 6, side view" (04) |
| 04-search-scott-aspect-950.jpg | work/haoyue/04-search-results/assets/ | "this Scott Aspect 950, side view" (04 and 05) |
| 05-listing-hero-shop-stand.png | work/haoyue/05-listing-detail/assets/ | "this Trek Marlin 7 on the Timah Cycles stand, 18 Oct 2026" |
| 05-listing-photo1-drivetrain.png | same | "Photo 1 of this Trek Marlin 7, 18 Oct 2026" |
| 05-listing-photo2-cockpit.png | same | "Photo 2 …" |
| 05-listing-photo3-fork.png | same | "Photo 3 …" |
| 05-listing-photo4-crank-scratch.png | same | "Photo 4 …, 12 Oct 2026" |
| 05-listing-photo5-saddle-scuff.png | same | "Photo 5 …, 12 Oct 2026" |

05 also uses existing 01 Home photos: "Timah Cycles shopfront, Bukit Timah" → 01-home-timah-cycles.webp; "this Trek Marlin 7, side view" on 04 → 01-home-bike.webp.

Copy the masters into the repo now on a branch build/photos-04-05 (from build/01-home). Wire them into 04 and 05 only when those pages are built. Commit and push; say in the commit message which files were copied.
