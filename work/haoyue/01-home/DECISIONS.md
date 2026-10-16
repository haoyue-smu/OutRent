# Home (01-home)

Designer: Haoyue

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show |
|---|---|
| Home hero (393 × 452) | A rider on a forest trail at Chestnut Nature Park, early morning, soft overcast light; quiet foliage in the top 40% for the headline |
| Coach row thumbnail (64 × 64) | Coach Aisyah at the Chestnut Nature Park trailhead, helmet on |

## Notes

Lead hero page: one finished direction (A). Direction B is not built.

### The page

- **Idea in one line:** A photo with the promise and a three-part search on glass; below it, the app's two jobs as two labelled groups: "Ride this weekend" (Coach Aisyah's kit) and "Gear you own" (the storage card).
- **Key decisions and why:**
  - Two labelled groups make the two jobs visible at a glance, so storage is not hidden behind renting → HE #6.
  - The storage card shows on first view without scrolling, above the tab bar: icon, "Store gear you're not using", one line on what the Hub does, one secondary button "See storage" (→ 16). It stays a light, filled card with a secondary button, so it does not compete with the trip.
  - Dismiss (×) hides the card but leaves a note, "Hidden. Storage is always under My gear.", with Undo and a My gear row (→ 14). Storage never disappears without saying where it went.
  - Search is one glass capsule in three parts: What (empty, "Bike, helmet…"), Where (Chestnut) and When (Sat 25 Oct), prefilled from his weekend plan. Every part opens 04.
  - Coach card (→ 02) is a list row with a coach photo placeholder: "Coach Aisyah · Sat 25 Oct" / "What to rent for Chestnut".
  - Tab bar: Home · Trips · My gear · Profile (→ 09, 14, profile). No profile avatar on the photo, so there is one way to Profile.

### Off-system

- `_shared/lead.css` linked as an extra stylesheet (fixed frame and helpers). Checker warning "(lead exception) extra stylesheet".
- Headline 38 / 41 px on the photo (from the chosen home look); the large title is 30–34.
- "OutRent" wordmark: text in Title size, ink, on the photo's top scrim.
- `.search`: a glass capsule split into three parts (what, where, when); built from the glass recipe, `--line` dividers and the label and callout sizes.
- `.store`: the storage card (filled card, white icon tile, close button, secondary button). `.toast`: the "Hidden…" note with Undo.
- `.screen.is-frame` + `.scroll`: the frame scrolls inside, so the tab bar stays on screen.
- Dismiss and Undo fade the group out and back in (200 ms exit curve, 200 ms glide; 160 ms cross-fade with reduced motion).
- No `direction-b/`: lead pages ship one direction (checker warning "direction-b/index.html is not there yet").

### Assumptions and open questions

- States: default, and `#dismissed` (storage card hidden, note and My gear row shown).
- Dismissing is for this visit only in the prototype; a real app would remember it.
- "What" in the search is left empty on purpose: the coach card is where the rental suggestion comes from.
- No numbers on the storage card (cost and earnings are working values owned by 16).

### AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: the page, the dismiss and undo behaviour, and this file except "My choice".
- What I decided or changed myself:
