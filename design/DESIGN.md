# OutRent design system: Trail Glass

Version 0.3 · 23 Oct 2026 · Owner: Haoyue. v0.3: warm paper background; clay added for money (sources: Figma sage pairings, inspoai Herb Garden, media.io sage combinations). Agents: read this file fully before building or changing any page.

## 1. Direction

Photography does the talking. Interface that floats over a photo is frosted glass, like iOS. Everything people read sits on solid white. One sage accent, big confident type, very little else. Daily screens stay calm. A small number of hero moments carry the motion (section 9). Two hues carry meaning: sage for the app and anything about fit or selection, clay for money. Everything else is paper and ink.

The prototype is a mobile web app. Design and build at 393 × 852 only (iPhone 16). There is no desktop or tablet layout.

## 2. Colour scheme

These are the only colours allowed. If a colour is not in this table, do not use it. To add one, ask Haoyue; it is recorded here before anyone uses it.

| Token | Hex | Use |
|---|---|---|
| `--sage` | `#3E6A5A` | Primary buttons, selected states, links, fit and selection |
| `--sage-dark` | `#2F5246` | Text and icons on `--sage-tint` |
| `--sage-tint` | `#E3ECE7` | Selected tab, chips, secondary buttons |
| `--clay` | `#B5603F` | Money: icons, large amounts (24 px and up), the needle on money figures. Not for body-size text |
| `--clay-dark` | `#8E4A30` | Money text at body size and below, text and icons on `--clay-tint` |
| `--clay-tint` | `#F4E6DF` | Money chips, deposit and refund rows, money status pills |
| `--ink` | `#1E2622` | Body text, headings, icons |
| `--muted` | `#5C6863` | Secondary text, captions, unselected labels |
| `--paper` | `#F4F1E8` | Page background behind sheets, inset tiles (v0.2: `--paper` `#F2F4F1`) |
| `--line` | `#E3DFD3` | Borders, dividers, unselected input outlines (v0.2: `#DDE2DE`) |
| `--white` | `#FFFFFF` | Sheets, cards, inputs, text on `--sage` |
| `--error` | `#B0473B` | Error text and icons only |
| `--error-tint` | `#F6E4E1` | Error message background |

`--paper` is renamed `--paper`. tokens.css keeps `--paper` as an alias of `--paper` for one release so existing pages do not break; new pages use `--paper`.

These materials are built from the colours above. They are not new colours:

- **Glass.** White at 64%, `backdrop-filter: blur(24px) saturate(160%)`, a 1 px border of white at 70%, and shadow `0 8px 24px rgba(30,38,34,0.12)`. Use the glass only on top of photos. Over a plain background, use a `--line` border instead.
- **Scene placeholders.** Until the real photos arrive, stand-ins use `#DCE6E0`, `#B9CCC0`, `#8FAE9C` and `#5E8574`. They are not UI colours. Remove them when the photos go in.
- **Explainer figure greys.** Explainer figures only: `#E6EAE7`, `#EDF0EE`, `#A3ACA7`, plus `#B9CFC3` for the shaded side of the selected part. Figure paper is `--paper` so parts sit flush on the plate.

**Where clay goes, and where it does not.**

Clay means money. It appears on:
- The deposit, wherever it is shown: amount, "Held, not charged", "Released".
- Refund and cancellation amounts.
- Money status pills: Paid, Held, Released, Refunded.
- The all-in total on Search Results and Listing, as the large figure.

Clay does not appear on:
- Buttons. The primary button is always sage, even "Pay S$50".
- Day rates and line items in a breakdown. Those are ink. Only the total and the deposit are clay.
- Anything that is not money.

Clay is never the only signal. Every clay element also carries a word (Paid, Held, Deposit, Total).

Contrast: `--clay-dark` on white 6.6:1, on `--clay-tint` 6.1:1. `--clay` on white passes 4.5:1 only at 24 px and above, which is why it is limited to large amounts and icons.

Rules:

- Keep contrast at 4.5:1 or higher for text, and 3:1 or higher for icons and borders.
- Do not use yellow highlights, saturated or "jumpy" colours, or dark screens.
- Do not use gradients, apart from the photo scrim (ink at 0–35%) under text that sits on a photo.

## 3. Type

**Font: Onest** (Google Fonts, open source; picked because it stays crisp on Windows and phones), with fallback `system-ui, sans-serif`. Load weights 400, 600 and 700 only.

| Style | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|
| Display | 44 / 46 | 700 | −0.035em | Hero numbers (72 cm), one per screen |
| Large title | 30–34 / 34–38 | 700 | −0.03em | Page title, one per screen |
| Title | 20 / 25 | 600 | −0.01em | Section headings, card titles |
| Body | 17 / 24 | 400 | 0 | Reading text |
| Callout | 15 / 21 | 400 or 600 | 0 | Rows, list items, inputs |
| Footnote | 13 / 18 | 400 | 0 | Captions, meta in `--muted` |
| Label | 12 / 16 | 600 | 0.08em, uppercase | Small labels on figures, sparingly |

- Use sentence case everywhere, except Label.
- Use tabular figures for prices, sizes and times (`font-variant-numeric: tabular-nums`).
- Write numbers with their unit: "72 cm", "S$38 / day", "Sat 7:40".

## 4. Space, shape and depth

- **Grid.** 4 px base. Use only 4, 8, 12, 16, 20, 24, 32 and 40.
- **Side gutters.** 20 px for content; 12–16 px for floating bars.
- **Radius.** 22 for cards and sheets' inner tiles, 28 for sheet tops, and fully round (height ÷ 2) for buttons, chips, inputs and the tab bar. 16 for small thumbnails.
- **Depth.**
  - Sheets have no shadow.
  - Floating things (tab bar, action bar, glass buttons) use the glass shadow.
  - Cards use either a `--line` border or a `--paper` fill, not both.
- **Touch targets.** At least 44 × 44.
- **Safe area.** Keep 54 px clear at the top for the status bar. Floating bars sit 22–26 px above the bottom edge.

## 5. Image language

There are two kinds of image, and they never mix inside one card.

1. **Photos are evidence.** Use them for this exact item, this place, this person. They go full-bleed at the top of a screen or inside thumbnails.

**All images are placeholders in your work.** Do not generate, download or paste any photo or illustration. Every image slot uses the `.img-ph` placeholder from components.css:
- Set its size to match the final image.
- Give it an `aria-label` that says what the image should show, e.g. `"Photo: this Trek Marlin 7 on a trail, side view"`.
- List each slot under "Image requests" in your DECISIONS.md: page, slot name, size, what it shows.

Haoyue generates and manages every image, and swaps them in when the final page is built.
2. **Explainer figures are explanation.** They are isometric line figures that show how something fits or works. They always sit on the explainer plate (section 7) and only use the explainer figure greys plus `--sage` for the selected part. Figures are supplied by Haoyue. On your pages, show the explainer plate with a placeholder naming the figure.

Icons are Phosphor, regular weight, 20–24 px. Use the fill weight only for a selected tab. Do not use emoji.

## 5a. Logo

The files are in `design/brand/`. Use them as they are.

| File | Use it |
|---|---|
| `outrent-lockup.svg` | Mark + name on light surfaces: white, `--paper`, and glass pills or bars |
| `outrent-lockup-white.svg` | Mark + name directly on `--sage` or on a photo |
| `outrent-mark.svg` / `outrent-mark-white.svg` | The mark alone, where there is no room for the lockup at 20 px tall or more |
| `outrent-wordmark.svg` / `outrent-wordmark-white.svg` | The name alone, only where the mark is already shown nearby |
| `favicon.svg` | The browser tab: `<link rel="icon" href="../../../../design/brand/favicon.svg">` |
| `app-icon.svg` | Home-screen and store icon (1024 × 1024) |

Rules:
- The lockup is at least 20 px tall. Smaller than that, use the mark alone.
- Keep clear space around it equal to the dot's diameter, on every side.
- Never recolour, stretch, rotate, outline, add shadows or other effects, or set "OutRent" in type yourself.

## 6. Layout patterns

- **Photo top, sheet below.** Used on Home and Listing.
  - A photo or scene fills the top 45–55% of the screen.
  - A white sheet with radius-28 top corners overlaps the photo by 28–40 px.
  - Glass controls float on the photo: back, save, and chips such as "Fits you · M".
- **Form screen.** Used on Fit and checkout.
  - The page sits on a `--paper` background, with a glass back button at the top left and a centred page name.
  - The large title sits on the left. White input tiles go below it.
  - A glass action bar sits at the bottom with one primary button.
- **Floating tab bar.** Shown on the 4 root tabs only: Home, Trips, My gear, Profile.
  - It is a glass capsule, centred, with its bottom 26 px above the screen edge.
  - The selected tab grows to show its label on a `--sage-tint` pill.
  - Hide it on flow pages: listing, fit, booking, delivery.
- **Bottom action bar.** A glass capsule, 12 px from each side and 22 px from the bottom.
  - It holds a price or summary on the left and one primary button on the right.
  - It can instead hold a single full-width button.
- **One primary action per screen.** Any second action is a secondary button or a text link.

## 7. Components

The class names below are the ones in `components.css`. Use these. Do not restyle them per page.

| Component | Class | Notes |
|---|---|---|
| Primary button | `.btn` | `--sage` fill, white 17/600, height 54, full pill |
| Secondary button | `.btn.is-secondary` | `--sage-tint` fill, `--sage-dark` text |
| Text button | `.btn.is-text` | `--sage` text, no fill |
| Glass icon button | `.icon-btn` | 44 × 44 round glass |
| Chip | `.chip` | Height 30–36, `--sage-tint` fill or glass over photos. Add an icon with "Fits you" |
| Input tile | `.field` | White, `--line` border; 1.5 px `--sage` border when focused or chosen. Label 13 muted, value 28/700 |
| Segmented control | `.segmented` | White track with `--line` border; selected segment on `--sage-tint` |
| List row | `.row` | 64 px thumbnail, meta 13 muted, title 18/600, divider `--line` |
| Stat tile | `.stat` | `--paper` fill, radius 18, value 24/700 plus unit 14/600, label 12 muted |
| Card | `.card` | White, radius 22, `--line` border or `--paper` fill |
| Money pill | `.pill.is-money` | `--clay-tint` fill, `--clay-dark` text, same height as `.chip`. For Paid / Held / Released / Refunded |
| Sheet | `.sheet` | White, radius 28 on top, padding 20–22 |
| Tab bar | `.tabbar` | See section 6 |
| Action bar | `.actionbar` | See section 6 |
| Explainer plate | `.explainer` | `--paper` plate, no border, radius 22 (white on a `--paper` page, with the figure's paper set to match). Corners: "Fig n" top left, title top right, hint bottom left, live readout bottom right. Steps listed under it as numbered rows (`.explain-steps`), which are also the controls |
| Ruler edge | `.explainer.has-ruler` + `.ruler` | Only when the figure is about a length the person sets (inside leg, height). A drag scale along the plate's top edge replaces the top corners: ticks every 1 cm, labels every 5, a `--sage` needle and value bubble, snaps to whole cm on release, arrow keys step 1 cm, light haptic per cm where supported. Never use it for steps or non-length values |
| Step progress | `.steps` | Pick → Fit → Deliver → Ride → Return, on flow pages only |

States:

- **Money total:** `.stat.is-money` sets the value in `--clay`.

- **Pressed:** scale 0.97, or the fill one step darker.
- **Disabled:** `--line` fill with `--muted` text.
- **Focus:** 2 px `--sage` outline with a 2 px offset.
- **Error:** `--error` text plus `--error-tint` box, with a message that says how to fix it.

## 8. Writing

- Write short and plain. Speak to Daniel as "you". Say exactly what happens, e.g. "Choose delivery", not "Continue".
- Use one idea per line. If a screen needs a paragraph, it needs a figure or a list instead.
- Use the mock data consistently:
  - Trek Marlin 7, size M, from Timah Cycles, Bukit Timah.
  - Chestnut Nature Park, Sat 25 Oct, delivery at 7:40.
  - S$38 / day, S$150 deposit.
  - Height 176 cm, inside leg 81 cm, saddle 72 cm, fork sag 25%, bars +1 cm.
  - Coach Aisyah.

## 9. Motion

Durations:

| Token | Time | Use |
|---|---|---|
| `--t-press` | 120 ms | Touch feedback |
| `--t-quick` | 200 ms | Chips, toggles, fades |
| `--t-base` | 320 ms | Sheets, size swap |
| `--t-slow` | 560 ms | Card → page |
| `--t-story` | ≤ 1.2 s | Exploded view, once per visit |

Easing:

- Glide `cubic-bezier(0.32,0.72,0,1)` for entrances.
- Exit `cubic-bezier(0.4,0,1,1)` at 70% of the entry time.
- Settle is a spring (stiffness 300, damping 26) for snapping into place.
- Scrub is linear and follows scroll.

Rules:

- Use at most one hero moment per screen. Motion shows cause: things move from where they came from.
- Never block a tap for more than 600 ms.
- Animate only transform, opacity and clip-path.
- With `prefers-reduced-motion`, use a 160 ms cross-fade instead.

Hero moments (reserved for Haoyue's pages):

1. Size swap on Fit.
2. Exploded setup on Listing.
3. Card → page from Search to Listing.

Small moments anyone may use:

- The step progress draws on.
- Numbers roll when they change.

## 10. What you may change

**Locked** (the checker fails the build):
- The 13 colours, Onest and the type scale, radii, shadows, the glass recipe, Phosphor icons.
- The shared chrome: top bar, tab bar, action bar.
- Image language: photos versus figures, and figure placeholders.
- The mock data in section 8.
- The 393 frame, 44 px targets and contrast minimums.

**Open.** This is your design:
- Page structure: scroll, steps, tabs or sheet.
- Information order.
- Which components you use and how you combine them.
- Interaction pattern.
- Copy.
- Empty, loading and error states.
- The small motion moments in section 9.

**Propose** (the checker warns). You may do these, but explain each one in one line under "Notes" in DECISIONS.md:
- A new component built only from tokens.
- An extra Phosphor icon.
- A new use of an existing colour, such as a sage block.

New colours or type sizes are never built. Suggest them under "Notes" instead.

**Rules:**
- A second version (direction-b) is optional. If you build one, it must differ in structure, information order or interaction pattern. Say which one in a sentence.
- Rule-breaking hero moments belong to Haoyue's pages only.

## 11. Do not

- Use clay for anything that is not money, or put it on a button.
- Add colours, fonts, shadows or radii that are not in this file.
- Use dark backgrounds, yellow, gradients or neon.
- Put glass over a plain background.
- Put a photo and a figure in the same card.
- Use more than one primary button per screen.
- Use emoji, lorem ipsum, or made-up data that contradicts section 8.
- Build desktop or tablet layouts.
