# Listing Detail (05-listing-detail)

Designer: Haoyue

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->

## Image requests

| Where | What it should show |
|---|---|
| Hero photo 1 (also the 1st thumbnail) (393 × 420; thumb 80 × 80) | This Trek Marlin 7, size M, side view on the Loop Cycles stand, taken Wed 22 Oct |
| Photo 2 (393 × 420; thumb 80 × 80) | Chain, cassette and rear derailleur of this bike, close up |
| Photo 3 (393 × 420; thumb 80 × 80) | Front fork and stanchions of this bike, close up |
| Photo 4 (393 × 420; thumb 80 × 80) | Tread on both tyres of this bike, close up |

## Notes

Lead hero page: one finished direction (A). Direction B is not built.

### The page

- **Idea in one line:** Photo top, sheet below. The tapped photo grows into the hero, then the sheet answers in order: is it this bike (dated photos), who supplies it, what was set up for me, and what I pay in total.
- **Key decisions and why:**
  - Hero photo carries a glass "Wed 22 Oct · 1/4" chip, and four dated thumbnails sit under the title. Tapping one swaps the hero → HE #11: he sees this exact bike and when it was photographed, not a catalogue picture.
  - Supplier row (Loop Cycles, bike shop, Bukit Timah, "sets up, delivers and collects this bike") → HE #17: who he is dealing with is stated before he books.
  - Set-up plate: the bike figure with three numbered rows (saddle 72 cm, fork sag 25%, bars +1 cm). Scrolling walks through them; the rows are also the controls.
  - Price shown as S$53 all-in everywhere (action bar and a breakdown card: rental S$38 + delivery and collection S$12 + service S$3), with the S$150 deposit on its own line → HE #1: no charge appears for the first time at checkout.
  - "Fits you · frame M" chip and "Edit fit" both go to 03.
  - No step progress: this page is the "Pick" step and neither the spec nor the system asks for it here.

### Off-system

- `_shared/lead.css` linked as an extra stylesheet (figure colours, fixed frame, helpers). Checker warning "(lead exception) extra stylesheet".
- GSAP 3.15 + ScrollTrigger (`_shared/`, local copies, no CDN) drive the exploded set-up. Approved lead exception to "no libraries".
- Bike explainer figure (`_shared/bike-figure.js`, the same single copy 03 uses) instead of an explainer placeholder: supplied by the lead. Colours only through the explainer greys and `--sage`; mist plate and mist figure paper because this is a white page.
- Exploded set-up (hero moment 2): when 40% of the plate is on screen, saddle then bars lift apart along their own axes (480 ms, 80 ms stagger; the frame never moves; once per visit). Scrolling the set-up section steps 1 → 2 → 3 (part turns sage, fork sinks by its travel on step 2). Leaving the section snaps the parts back and the three tiles count up; the readout says "Ready at 7:40". A tap or arrow key hands control to the person and stops the scroll steps.
- Numbered marks on the figure (`.b-mark`: sage ring, white fill; filled sage when selected), riding on the part they name.
- Card → page (hero moment 3), receiving end: `@view-transition { navigation: auto; }` and `view-transition-name: listing-photo` on the hero photo, as spec 04 asks. The photo flight takes 560 ms on the glide curve; then the sheet rises and the glass controls fade in (360–640 ms) and the price bar rises last (560–760 ms).
- `.screen.is-frame` + `.scroll`: the 393 × 852 frame scrolls inside, so the price bar stays on screen.
- Page classes, built from tokens: `.hero-photo`, `.on-photo` (glass chips on the photo), `.photos` (dated thumbnail strip), `.lines` (price breakdown), plus `.group`, `.head`, `.stack`, `.verdict` from `_shared/lead.css`.
- No `direction-b/`: lead pages ship one direction (checker warning "direction-b/index.html is not there yet").

### Assumptions and open questions

- HE #11 is read as "no proof this is the actual item or of its condition" and HE #17 as "unclear who supplies the bike". Please correct if the HE list says otherwise.
- The four photo subjects (side, drivetrain, fork, tyres) are my choice; all four are dated Wed 22 Oct per the spec.
- The deposit is described as "held on your card and refunded when the bike is back"; how it is held is not in the spec.
- Back goes to 04-search-results; the shop row has no page to open yet (no shop page in the sitemap).
- Reduced motion: no scroll steps or explode; the figure shows the numbered marks, rows still select a part with a 160 ms cross-fade, and the page transition becomes a 160 ms cross-fade. Not yet checked with the OS setting turned on.
- The card → page transition was checked with a stand-in card; it will run for real once 04 carries the same name.

### AI use

- Tool and model used: Claude Code (Claude Opus 5.5).
- What the AI generated: the page, the explode and scroll-step code, the numbered marks, the entrance after the page transition, and this file except "My choice".
- What I decided or changed myself:
