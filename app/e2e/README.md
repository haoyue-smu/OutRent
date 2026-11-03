# Local journey checks

Run the app server first. These scripts reuse the existing `playwright-core` installation; they do not install a browser. Set `BASE` (default `http://localhost:5191`), `PW_FROM` if needed, and `BROWSER_EXECUTABLE` to an installed browser when Playwright's bundled browser is unavailable. Set `E2E_OUT` to an output directory ending in `/`. Keep `TEMP`, `TMP`, and outputs on the task's approved drive.

From the repository root:

```powershell
node app/e2e/run.mjs
node app/e2e/reset.mjs
node app/e2e/crawl.mjs
```

`run.mjs` runs the existing journeys plus report checks and returns a failing exit code for failed assertions. Select names to run a focused check:

- `ER`: default booking, three-photo gate, cosmetic scratch report, saved record, return, booking reply, weekly ride, and storage at the Hub.
- `ERstates`: draft and sent reload, 375/393 widths, long optional details, seeded report, and no-report variants.
- `ERr`: reduced-motion report journey.
- `ERoffset`: Back navigation, the alternate 7:20 delivery timeline, and prevention of retroactive reports after return.
- `ERalternate`: other report reasons remain pending rather than receiving the scratch response.
- `ERshots`: explicitly refresh the eight review screenshots at 393 × 852; excluded from the default run because `ER` already captures them.

The crawl accepts route prefixes, for example `node app/e2e/crawl.mjs 09 11 12 components`. It checks buttons, links, native fields and sliders, then controls revealed one level deeper on the same page. It records actual response evidence, local popup loads, failed requests, console errors, broken images, overflow, placeholders, and every action it could not cover. Each route is capped at 240 controls. Already-selected controls and previously taken photos are listed separately. It blocks write requests and external navigation. Existing prototype placeholders are reported as limitations; a nonzero crawl exit is not automatically a new regression.

`crawl.json` checkpoints every five controls. Prefix reruns replace only matching route rows; set `CRAWL_RESUME=1` to retain completed rows during a resumed full run. Review `completed` and `limits` before describing coverage as complete. Run browser suites serially on machines with limited memory. Logs and screenshots are evidence, not production submissions.
