# Search Results (04-search-results)

Designer: Amanda

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->
I choose A. A is less cluttered and more comfortable to look at. The reader's attention is naturally directed to the bike options further down the screen.

## Image requests

<!-- Filled in by your AI: one row per .img-ph placeholder in the version you chose. -->

| Where | What it should show |
|---|---|
| Card 1 (Trek Marlin 7) | Trek Marlin 7 hardtail trail bike, side view (view-transition to listing detail) |
| Card 2 (Giant Talon 2) | Giant Talon 2 mountain bike on trail stand, side view |
| Card 3 (Merida Big.Nine 200) | Merida Big.Nine 200 hardtail cross-country bike, front-three-quarter view |

## Notes

<!-- Optional. Anything off-system, questions about the spec, ideas for the team lead. -->

- Both directions directly implement the HE #8 fix from the evaluation:
  1. Clear sorting options: "Earliest arrival" and "Lowest total price" with active state marked.
  2. Notice callout upfront: clarifies that all totals include delivery, service, and booking fees, and notes the refundable deposit held at checkout.
  3. Detail cues: every card includes a clear right chevron cue signaling that tapping opens the listing details.
- Direction A follows the Fix screen's clean single-feed structure with an inline context line and active sort toggle.
- Direction B uses a top Fit Profile summary banner plus a 3-way provider segmented switch (All / Bike shops / Private) to further separate commercial shops from community owners.
- Both directions include state handling for `#default`, `#loading`, and `#empty` per RECIPES.md §8.
- Shared view-transition name `listing-photo` is attached to the Trek Marlin 7 placeholder per spec requirements.
