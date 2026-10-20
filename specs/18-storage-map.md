# 18 Storage Map

**Designer:** Haoyue  ·  **Where:** Hub Pickup → "Choose a rack"

## Purpose
Daniel picks a public rack near him that has space.

## Links
- Comes from: 17-hub-pickup
- Goes to: 17-hub-pickup (rack chosen)

Link with `data-goes-to="<page-id>"`.

## Must show
- Map with three racks*: Rack A (closest) full 0/8 · Rack B 1 space left · Rack C 4 spaces left
- Counts "Updated 2 min ago"*
- Choosing a rack holds one space for 24 hours*; drop the bike before then or the hold ends

## States
- Default
- Rack full

## Iter1 problem this page fixes
HE #15. Make the fix obvious: a tester should notice it without being told.
