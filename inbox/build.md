# Inbox · Build (Claude Code)

Last updated 23 Oct 20:05 by the management chat.

## Open task: 02 Coach's Kit baseline

Same method as 01 Home (build/01-home, 0a84bd6). Branch from build/01-home so the shared icons, Photo component and checker change come with it.

Source: the Design artifact https://claude.ai/artifact/8h22yujNoYT7h9mVumf6De (round 2, 23 Oct 18:32). Read project/canvas.json, then every project/*.dc.html board including Notes.dc.html. Ignore any older "02 Coach's Kit" artifact.

- app/src/pages/02-coach-kit/, registered in app/src/pages/index.ts.
- Every frame on the Frames page is a real state behind one mock-state const at the top of the file.
- Classes from design/components.css, tokens from design/tokens.css; the board's proposed components go in a page CSS file, tokens only.
- Links between pages with <GoTo page="…">. Both photos on this page reuse 01 Home images through the Photo component: "Coach Aisyah, portrait" → work/haoyue/01-home/assets/01-home-coach-aisyah.webp; "a mountain bike with front suspension, side view" → work/haoyue/01-home/assets/01-home-bike.webp. No new images for 02.
- npm run check: 0 errors.

Commit on branch build/02-coach-kit and push. Do not merge. No AI attribution. In the commit message: what was built, and any board element you could not build.
