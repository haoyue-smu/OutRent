# Prototype v60 (30 Oct 2026) · what changed since v52

The Creative Director's answer to the team's feedback round (problems only, solved its own way); Haoyue approved it on 30 Oct 19:03. Open `prototype/v60/index.html` the same way as v52. Only index.html changed; images and bike-figure.js are the same files.

Final state per page (later versions supersede earlier ones):

- **02 Coach's post (v56).** The coach's list is plain, every row the same height (56 px photo, 72 px row). Each item OutRent knows carries one icon on its thumbnail: a forest-ringed "+" on the bike (not in your gear; tapping it opens the drawer to the bike) and a forest tick on the helmet (in your gear). One quiet key line under the caption explains both icons. OutRent's drawer pops up on arrival as in v52 and tucks away when the post is touched, but now offers only the bike ("Mountain bike · Rent one, set to your fit and delivered to Chestnut"); the helmet is no longer in it.
- **04 Search results (v57/v59).** Each card's set-up status sits on its own photo as a small dark-glass mono caption, like 05's photo labels (Scott: grey "No set-up for your fit"); card bodies no longer repeat it. The per-card scale reads as the rider lives it: top line "DELIVERY FROM 7:40 · BEFORE YOUR RIDE" (Scott: "DELIVERY FROM 8:30 · AFTER YOUR RIDE STARTS"); the ride band is labelled "YOUR RIDE 8:00"; the 8:00 and 9:00 tick labels are gone.
- **05 Listing (v53).** The fit values sit in one white block with "Your fit · Edit fit" on top and the source line ("From your height … and inside leg …") at its foot.
- **06 Delivery and collection (v60).** Each leg is one row of time chips that scrolls sideways, opening on the suggested time: delivery 7:00–12:00 every 20 min (7:00 greyed, before the first courier run), collection 12:30–20:00 every 30 min. No "Other" chip and no wheel sheet. The place line is just "By the park entrance sign".
- **14 My gear (v53).** Other items show their type only (no location words); the Giant Escape 3 keeps "blocks the corridor".
- **17 Hub pickup (v53).** "Getting it there" and "Getting it back" use the same form (same heading, same row and price sizes); the there-row names the choice made above.

In the app these keep the app's real state (fit, chosen times, etc.), as before.
