# AGENTS.md — read this before doing anything

You are helping a member of IS211 team G14T3 design pages for **OutRent**, an outdoor-gear rental app. The prototype is a mobile web app made of plain HTML and CSS. Every page must look like it belongs to one product, so you work **inside a fixed design system** that Haoyue owns.

The person you are helping may be in Year 1 and new to Git and code. Explain each step in plain words, one step at a time. Never assume they know a command.

## 1. Read these first, in this order

1. `design/DESIGN.md`: the look, the rules and what may change (section 10 is the most important).
2. `design/components.html` (open with `npm run dev`) and `design/components.css`: every component that exists. Reuse these before inventing anything.
3. `design/RECIPES.md`: copy-ready patterns (bottom sheet, show more, segmented switch, agree-before-paying, ruler input, showing states). Use these before writing your own.
4. `specs/<page-id>.md`: what this page must do, its content, its states and where its links go.
5. `work/<name>/<page-id>/DECISIONS.md`: the decisions so far.

If a spec is missing or unclear, say so and write the question under "Notes" in DECISIONS.md. Do not guess silently.

## 2. The job

Build **one** complete page from the spec in `direction-a/index.html`, then improve it with the person.

A second version is optional. Build `direction-b/index.html` only when there is a genuinely different idea worth comparing, then let the person choose and keep improving only the chosen one. A second version must differ in at least one of:

- **structure**: what is on the page and how it is grouped,
- **information order**: what the user sees first, second, third,
- **interaction pattern**: tabs vs scroll, sheet vs new page, steps vs one form, etc.

Changing only colours, spacing or wording is not a second idea; do not build one just to have two.

Folder (created by `npm run new -- <name> <page-id>`):

```
work/<name>/<page-id>/
  direction-a/index.html   the page
  direction-b/index.html   optional: a second, clearly different idea
  assets/                  stays empty: no images here
  DECISIONS.md
```

Build each version as one `index.html`, starting from the template that `npm run new` creates. Keep the four `<link>` lines at the top.

## 3. What is fixed, what is open

**Locked (the checker blocks these):**

- Colours: only the tokens in `design/tokens.css` (`var(--sage)`, `var(--ink)`, `var(--mist)` …). Never write `#hex`, `rgb()` or colour names.
- Font: Onest only, through `var(--font)` or the type classes `.t-display .t-large .t-title .t-callout .t-body .t-label .t-foot`. Font sizes come from the type scale.
- Icons: Phosphor, through `<svg class="icon"><use href="../../../../design/icons.svg#i-name"/></svg>`. No emoji, no other icon sets.
- No images, videos or iframes (see section 4).
- No frameworks, libraries, CDNs, npm packages or build steps. Plain HTML, CSS and a little vanilla JavaScript only.
- No lorem ipsum. Use the mock data in DESIGN.md section 8.

**Open (this is your design):** layout, grouping, order, which components you use, how many steps, what is shown first, small interactions (sheets, tabs, toggles, expand/collapse), microcopy.

**Propose (allowed, but the checker warns):** a new component, a different radius or shadow, a gradient, a custom SVG drawing. Do it only if the library truly has nothing that works. Add one line on why under **"Notes"** in DECISIONS.md. Haoyue decides whether it joins the system.

Light theme only. Low contrast, calm colours, no bright highlights, no dark mode.

## 4. Images: placeholders only

Do not generate, download, screenshot or paste any image. Haoyue makes and manages every image.

Wherever a photo belongs, put a placeholder:

```html
<div class="img-ph" role="img" aria-label="Photo: rider adjusting saddle height on a trail bike, side view"></div>
```

Variants: `img-ph is-bleed` (full-width hero), `img-ph is-thumb` (small square). Then add one row to the **Image requests** table in DECISIONS.md: where it goes, what it shows, rough size.

## 5. Links between pages

Pages are built by different people, so link by page id, not by file path:

```html
<a href="#" data-goes-to="05-listing-detail">View bike</a>
```

Page ids are in `pages.json`. Haoyue wires them together later.

## 6. Motion and accessibility

- Use the motion tokens (`var(--t-quick)`, `var(--t-base)`, `var(--ease-glide)` …) from tokens.css. Keep motion short and purposeful.
- Respect reduced motion: wrap anything bigger than a fade in `@media (prefers-reduced-motion: no-preference)`.
- Every button and icon-only control has a label (`aria-label`). Tap targets are at least 44 px.
- Design at 393 × 852 (iPhone 16). Check that nothing breaks at 360 px.

## 7. DECISIONS.md

It is short on purpose. You fill in:

- **Image requests**: one row per placeholder in the page (the chosen version, if there are two).
- **Notes** (only if needed): anything off-system (section 3) or a question the spec didn't answer.

**Never write "My choice".** It is only needed when there is a direction-b; then the person writes which version they kept and why, in their own words. If it is empty, remind them; do not draft it, even if asked.

## 8. Before you say you are done

Run:

```
npm run check
```

- `✗` errors must be fixed. Fix them, then run it again.
- `!` warnings are allowed only if the Notes in DECISIONS.md explain them.

Then open the page (and direction-b, if there is one) with `npm run dev` and look at them at phone width. Tell the person what to check by eye.

## 9. Git (if they cloned the repo)

First time only: `npm run setup` (this turns on the automatic check before each commit).

```
git checkout work/<name>             # this branch already exists; never use another name
git add work/<name>
git commit -m "<page-id>: first version"
git push -u origin work/<name>
```

Push only to `work/<name>`; never push to `main` (it is protected anyway). No pull request is needed: when the page is done, the person tells Haoyue. If `git pull` or `git push` reports a merge conflict or any Git error, resolve it for them, keeping their own work, and explain in one line what happened. If they downloaded a zip instead, zip their `work/<name>/` folder after `npm run check` passes and they send that.

## 10. Do not touch

Only change files inside `work/<their-name>/`. Never edit `design/`, `tools/`, `templates/`, `specs/`, `pages.json`, this file, or anyone else's folder. If something there looks wrong, write it under **"Notes"** in DECISIONS.md instead.
