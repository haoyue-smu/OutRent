# My Equipment (14-my-equipment)

Designer: Shanise

## My choice

<!-- B as i like that there is a top navigation bar where they are able to view items at home or in the hub  seperately compared to A where the Hub items view will appear as a list below the at home items once any of their items are stored in the hub. i also prefer the layout of the equipmwnts in a grid compared to the list layout .  -->

## Image requests

| Where | What it should show | Rough size |
|---|---|---|
| At home: Road helmet | Road cycling helmet, front and side view | 80 × 80 px |
| At home: Gloves | Pair of cycling gloves | 80 × 80 px |
| At home: Old bike | Daniel’s old bike, full side view | 80 × 80 px |
| Add item sheet | The equipment being added, showing the whole item | 353 × 120 px |
| Added item thumbnail | The saved item, matching its entered name; includes Spare helmet in the review state | 80 × 80 px |

## Notes

- HE #22 was rated 0 in Iter1; the current Iter2 spec explicitly requires Add item, so this page implements adding but no general catalogue editor or Remove control.
- States: default (no hash), #empty, #add-item, #item-added. Added items are kept for this visit only and reset on reload.
- Layout-only helpers .stack and .section-heading group shared components; form controls use the existing .field tiles. No new visual component is proposed.
- Shared .screen is constrained to the viewport at 360 px because the supplied fixed 393 px frame otherwise overflows. Shared chrome is reused, with a solid tab bar on the plain background as DESIGN.md prohibits glass over plain surfaces.
- Profile is required by the design system’s four root tabs but has no page id in pages.json. The Profile link uses data-goes-to="profile" for Haoyue to resolve.
- All equipment links target the specified 15-equipment-detail page; item-specific routing will need Haoyue’s integration.

- Equipment thumbnails use 80 × 80 px instead of the shared 64 px row thumbnail so items are easier to recognise; this is a page-specific component size proposal.

- Hide the Hub group until it contains an item; reveal it when an item is added at the Hub. Keep one Add item control beside At home, plus the first-time empty-state action.

- Add photo uses a local file selector, shows the selected filename and changes its label to Replace photo. The selected image is not rendered or uploaded, following the placeholder-only image rule. Selection resets when the sheet closes. The placeholder’s visible description is hidden; its accessible description remains.


- Direction B is an alternative to the finished A: two-column equipment cards and location tabs replace A’s list and stacked groups. Only B was changed for this comparison.
- B states: default (home grid), #hub (Hub tab empty), #empty, #add-item and #item-added. Added items appear in the selected destination tab; form defaults to the current tab. Data resets on refresh.
- B proposes .gear-card: a shared .card composed with a photo placeholder and title, because the library’s horizontal row cannot provide the agreed grid layout. Card photos are 132 px tall (about 144 px wide at 393 px). Old bike’s idle reminder is inside its card.
- My choice remains for Shanise to write after comparing A and B.

Additional image requests for B (retain the chosen direction’s requests after selection):

| Where | What it should show | Rough size |
|---|---|---|
| B: Road helmet card | Road cycling helmet, front and side view | 144 × 132 px |
| B: Gloves card | Pair of cycling gloves | 144 × 132 px |
| B: Old bike card | Daniel’s old bike, full side view | 144 × 132 px |
| B: Add item sheet | The equipment being added, whole item | 353 × 120 px |
| B: Added item card | The saved item matching its entered name | 144 × 132 px |

- B’s .storage-link is an outlined action cue within the linked old-bike card, using the shared line token and pill radius with a 44 px minimum height. It makes the storage route easier to recognise without nesting links.
