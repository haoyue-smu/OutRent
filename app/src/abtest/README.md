# A/B test site

A second entry point of the app (`abtest.html`, `vite.abtest.config.ts`), built to `dist-abtest/`. It shares page 11's pieces (`pages/11-handover-check/pieces.tsx`) and uses neither the app's store nor its router.

## To go live

1. Apply `schema.sql` to the Supabase project `outrent-abtest`.
2. Put the project's URL and anon key in `app/.env.local` (git ignores it). The build refuses to run without them.

   ```
   VITE_ABTEST_SUPABASE_URL=https://<ref>.supabase.co
   VITE_ABTEST_SUPABASE_ANON=<anon key>
   ```
3. When the damaged photo arrives: put it in `work/haoyue/11-handover-check/assets/`, import it in `story.ts` as `DRIVE_PHOTO` and set `DRIVE_IS_PLACEHOLDER = false`.
4. Build from `app/`: `npx vite build --config vite.abtest.config.ts`.
5. Deploy from a separate folder, so the `outrent` Vercel project never changes: copy `dist-abtest/` to a new folder, then there `npx vercel link` (new project `outrent-abtest`), `npx vercel --prod`, and alias it to `outrent-abtest.vercel.app`.

## Checks

With the built site served on port 5193 (`npm run preview -- --config vite.abtest.config.ts --port 5193`), from `app/`: `node e2e/abtest.mjs layouts | flows | diff | assign`. `layouts` retakes screen 7's screenshots; rebuild afterwards. `node e2e/abtest-replay.mjs rows.json [id …]` rebuilds sessions from an export of `ab_results`.

## Export

The public key cannot read the table, by design. Export in the Supabase SQL editor, then download the CSV:

```sql
select * from public.ab_results where pilot order by id;
```

`node e2e/abtest-replay.mjs export.csv [id …]` rebuilds the sessions from it.

## Links

`?v=a` and `?v=b` force a version (row marked `forced`), `?pilot=1` marks the row `pilot`. `?new=1` together with either opens a fresh row on the same phone.
