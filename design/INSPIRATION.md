# INSPIRATION.md — where to look, what to borrow

Our look in one line: **calm, photo-led, quiet green, like an Apple product page you can actually use.** Frosted glass only on things that float (top buttons, tab bar, action bar); everything you read sits on plain white.

Look for **how good apps arrange information and steps**, not for colours or fonts. Those are already fixed in `DESIGN.md`.

## Words to search with

- apple keynote ui, apple product page, frosted glass ios, ios 26 liquid glass
- calm mobile booking flow, rental checkout mobile, all-in price breakdown app
- bottom sheet ios, step-by-step form mobile, order tracking screen
- outdoor app ui, trail app ui, bike fit app

Add "mobbin" or "dribbble" to a search to get screenshots instead of articles.

## Where to look

| Site | Good for | Note |
|---|---|---|
| [Mobbin](https://mobbin.com) | Real screens from shipped apps, searchable by flow ("checkout", "booking", "tracking") | Free account shows a lot |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) | Sheets, tab bars, lists, spacing, touch targets | The rulebook our components follow |
| [apple.com](https://www.apple.com) product pages | Photo-first layout, short headlines, lots of space | Look at the iPhone and Watch pages |
| [Page Flows](https://pageflows.com) | Whole user flows, step by step | Useful for 06–08 and 13 |
| [Dribbble](https://dribbble.com) | Ideas for a single screen | Concepts, not tested; borrow structure only |

## Apps worth opening on your own phone

| App | Look at | Useful for |
|---|---|---|
| Airbnb | Price shown as a total, house rules before booking, trip page | 04, 07, 08, 09 |
| Grab / foodpanda | Live order tracking, "what happens next" | 08, 10 |
| Komoot / AllTrails | Calm outdoor feel, maps, saved gear and trips | 09, 13, 18 |
| Strava | My gear list, weekly activity | 13, 14, 15 |
| Apple Wallet / Find My | Glass over content, cards that expand | 15, 17 |
| Shopee / Lazada | Return and refund screens | 06, 12 |

## How to use a reference

1. Screenshot 2–3 screens that solve the same problem as your page.
2. Write one line under "Notes" in DECISIONS.md: what you borrowed (order, grouping, interaction) and from where.
3. Rebuild it with our components. Never copy their colours, fonts, icons or images.

## What to avoid

- Dark mode, neon, bright yellow, strong contrast, colourful badges everywhere
- Busy screens: more than one main action, long paragraphs, walls of chips
- Hidden costs or pre-ticked boxes (these were Iter1 problems)
- Gradients and heavy shadows
- Stock photos or AI images in your page: use `.img-ph` placeholders, the team lead adds images later
