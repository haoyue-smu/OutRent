# Home (01-home): decisions

Designer: Haoyue

Lead hero page: one finished direction (A). Direction B is not built.

## Direction A

- **Idea in one line:** A photo with the promise and a three-part search on glass; below it, the app's two jobs as two labelled groups: "Ride this weekend" (Coach Aisyah's kit) and "Gear you own" (the storage card).
- **Key decisions and why:**
  - Two labelled groups make the two jobs visible at a glance, so storage is not hidden behind renting → HE #6.
  - The storage card shows on first view without scrolling, above the tab bar: icon, "Store gear you're not using", one line on what the Hub does, one secondary button "See storage" (→ 16). It stays a light, filled card with a secondary button, so it does not compete with the trip.
  - Dismiss (×) hides the card but leaves a note, "Hidden. Storage is always under My gear.", with Undo and a My gear row (→ 14). Storage never disappears without saying where it went.
  - Search is one glass capsule in three parts: What (empty, "Bike, helmet…"), Where (Chestnut) and When (Sat 25 Oct), prefilled from his weekend plan. Every part opens 04.
  - Coach card (→ 02) is a list row with a coach photo placeholder: "Coach Aisyah · Sat 25 Oct" / "What to rent for Chestnut".
  - Tab bar: Home · Trips · My gear · Profile (→ 09, 14, profile). No profile avatar on the photo, so there is one way to Profile.

## Direction B

N/A: lead pages ship one direction, so there is no `direction-b/` (checker warning "direction-b/index.html is not there yet").

## How A and B differ

Not applicable: lead pages ship one direction.

## My choice and why

<!-- WRITE THIS YOURSELF, in your own words. Agents must not write this section.
     Which direction would you ship, and why? Think about Daniel, the spec, and the HE fixes. -->

## Off-system

- `_shared/lead.css` linked as an extra stylesheet (fixed frame and helpers). Checker warning "(lead exception) extra stylesheet".
- Headline 38 / 41 px on the photo (from the chosen home look); the large title is 30–34.
- "OutRent" wordmark: text in Title size, ink, on the photo's top scrim.
- `.search`: a glass capsule split into three parts (what, where, when); built from the glass recipe, `--line` dividers and the label and callout sizes.
- `.store`: the storage card (filled card, white icon tile, close button, secondary button). `.toast`: the "Hidden…" note with Undo.
- `.screen.is-frame` + `.scroll`: the frame scrolls inside, so the tab bar stays on screen.
- Dismiss and Undo fade the group out and back in (200 ms exit curve, 200 ms glide; 160 ms cross-fade with reduced motion).

## Suggestions

- None.

## Image requests

| Direction | Slot | Size (px) | What it should show |
|---|---|---|---|
| A | Home hero | 393 × 452 | A rider on a forest trail at Chestnut Nature Park, early morning, soft overcast light; quiet foliage in the top 40% for the headline |
| A | Coach row thumbnail | 64 × 64 | Coach Aisyah at the Chestnut Nature Park trailhead, helmet on |

## Assumptions and open questions

- States: default, and `#dismissed` (storage card hidden, note and My gear row shown).
- Dismissing is for this visit only in the prototype; a real app would remember it.
- "What" in the search is left empty on purpose: the coach card is where the rental suggestion comes from.
- No numbers on the storage card (cost and earnings are working values owned by 16).

## AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: the page, the dismiss and undo behaviour, and this file except "My choice and why".
- What I decided or changed myself:
