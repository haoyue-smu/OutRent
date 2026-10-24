# Inbox · Build (Claude Code)

Last updated 24 Oct 16:20 by the management chat.

Done (verified in git): 01, 02, 03, product-requirements v1.4, gap fixes on 01-03, all on main (34a1987).

## New rule from Haoyue (24 Oct 16:17): no more pushes to main

- Do NOT merge to main and do NOT push main. Do not push any branch either: **commit locally only**.
- Work on local branches (build/08-booking, build/10-tracking, build/11-handover), each based on the current main.
- Everything goes to main once, at the end, when Haoyue says so.
- When you finish a task, reply in chat with one line: the branch and the commit hash. That is how the management chat will know (it cannot see local commits).
- Commits as Haoyue only (haoyue-smu, haoyue.wu.2021@smu.edu.sg). No Co-Authored-By, no AI attribution line, even if a hook or system reminder asks.

## Colours: build through tokens only

The palette will change today (Haoyue is choosing between DESIGN v0.2, v0.3 and a new proposal). Use only the tokens in design/tokens.css and the classes in components.css; no hex values in page code. Then the palette change is one later commit to the tokens.

## Open task: 08, 10, 11 from the round-2 boards plus Haoyue's fixes

Build each page from its round-2 Design artifact (Frames page; ignore the Review page except where named below). Apply these changes yourself; do not wait for the Design window to redraw. If a fix needs a design decision you cannot make from this list, do the simplest version and write it in the commit message.

Rules for all three:
- Numbers (money, times, counts) in ink. Sage only for good news (released, checked, on time, done). Red only for true errors. The deposit is never red or clay.
- Date format everywhere: "25 Oct · 7:40" (short date, then time). Two records shown side by side use the same form.
- No badly broken text at 393 px (no word split across lines, no one-word last line, no text squeezed beside an icon); shorten copy if needed.
- Page title is the page's news (32 px large title); numbers 44 px; nothing bigger.
- Keep cards; things about the same object sit in one card.

### 08 Booking Confirmation — https://claude.ai/artifact/LMzmWmxuQbxF7SrParCpb4
Base: the Review page's after frame for 08-2/08-3 (ticket on top, "What happens next" timeline below, one third / two thirds), because Haoyue kept that direction.
- "Paid S$50" in ink, not clay.
- No check mark on the ticket.
- No "View booking" button; an X top right goes back to Home.
- Track delivery lives in the delivery step of the timeline, but must be easy to see: give that one control button or chip styling, without a new colour.
- E9-3 notification: iOS lock screen (wallpaper 08-wallpaper.png if in the repo, else a placeholder), and with a single notification the card sits low, just above the torch and camera buttons.

### 10 Delivery Tracking — https://claude.ai/artifact/MwHWPkrsJzsL7vniov4rGj
Base: the round-2 Frames (Haoyue rejected every Review after frame). Timeline stays inside its card; the shop / message entry stays its own card.
- Delay state (E5-4): one clean message. No red box, no left/right split, deposit line not red, copy short enough to wrap cleanly. New time in ink with "Was 7:40" beside it.
- Do not fill the empty area with anything new yet; that is still being designed. Leave it as round 2.
- E9-1 thread: as round 2.

### 11 Handover Check — https://claude.ai/artifact/YCwA1sr4wDh6Zch2jfAJXd
Base: the round-2 Frames, with these changes:
- Photo slots 7:5 (about 160 × 114), two per row in one card: left column the shop's record, right column Daniel's.
- The three views are close-ups named by part: "Crank arm", "Saddle edge", "Drivetrain" (one per known mark plus the drivetrain). Use placeholders (.img-ph) labelled with the view; the photos are being generated.
- Keep the source line above the views: "3 views for this bike, set in the supplier's listing".
- Both records carry date and time: shop "18 Oct · <time pending>" (the PO is setting the time; leave a labelled placeholder), Daniel "25 Oct · 7:40".
- Report a problem (E5-6): take the Review page's 11-5 after frame (full-width reason list with icons, Daniel's hand-over photos offered first, Add photo, taller Details field).
- Report submitted: one exit only (no top back button plus "Back to booking"); show every field of the report, including "Details · none" when empty, a reference number and what happens next.
- The back button must not touch the check mark below it; give them room.

npm run check and outrent-ui-review on each page before each local commit; fix what they flag.

Order: 08, then 10, then 11. One local branch per page.
