# OutRent app (React)

The final prototype. Built by the Build window (Claude Code) from the Claude Design files, one page at a time.

- `npm run app:dev` from the repo root starts it. `npm run app:build` builds to `app/dist/`.
- The design system is imported unchanged from `../design/` (`tokens.css`, `components.css`, `icons.svg`, `brand/`). Do not copy or rewrite it.
- One route per page, `/<page-id>` (ids in `../pages.json`). `src/pages.ts` holds the demo order.
- Each page lives in `src/pages/<page-id>/`, with its exported Claude Design files in `design/`. Register the component in `src/pages/index.ts`.
- Links between pages use `<GoTo page="05-listing-detail">` from `src/shell/Link.tsx`.
- `npm run check` from the root also checks `app/src` against the design rules (tokens only, no images, no emoji, type scale).
