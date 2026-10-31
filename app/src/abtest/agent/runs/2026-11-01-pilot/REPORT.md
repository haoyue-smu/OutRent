# Agent pilot report, 1 Nov 2026

Live site `abtest-DUwRiIBB.js`, every row `pilot=1`. Runner in `app/src/abtest/agent/`, spec `inbox/AGENT-PILOT.md`. No variant comparison here.

## Result

**Neither run passes. Check 1 is 0 of 10 in both runs, so under §7 this goes back to Haoyue and Management before anything else.** The Gemini retry that §7 asks for after a check 2 failure has not been run for that reason.

| Check | Run A, qwen3-vl-30b-a3b | Run B, glm-4.6v | Bar |
|---|---|---|---|
| 1 Vision: "Yes" with the thought | **0 of 10** (0 "Yes") | **0 of 10** (0 "Yes") | at least 7 of 10 |
| 2 Grounding: tap on a live control | **26.3%** (114 of 434) | **40.6%** (153 of 377) | at least 90% |
| 2 Grounding: on the control the thought names | 12.4% (54 of 434) | 36.9% (139 of 377) | |
| 2 Runs at the 45-step cap | **10 of 10** | **6 of 10** | 0 |
| 3 Skip rate | **100%** (10 of 10 fields) | **100%** (12 of 12 fields) | 30% to 60% |
| 3 Open-text answers | **none typed** | **none typed** | |
| 3 Wrong "About you" answers | **1** (p10 age) | 0 | 0 |
| 4 Data | not fully testable, see below | not fully testable, see below | |
| Reached the end (`t_finish`) | 0 of 10 | 5 of 10 | |
| Reports sent | 0 of 10 | 0 of 10 | |

## Check 1: the models see the chain but do not act on it

No agent in either run said anything about the chain at the drivetrain preview, and none answered "Yes" on question 1.

To separate seeing from attending, the screenshot `app/e2e/out/agent/pilot-b/p03/08.png` (local only) was sent to each model outside the walk, without persona or rules, twice per question (`vision-probe.json`). Asked "Is anything wrong with the bike in this photo?", qwen, GLM and Gemini all named the chain as off or detached, 2 of 2 times each. So the image and the screenshot size are fine. The failure is in the walk: told to act one step at a time, the agents treat the preview as a button to get past.

Thoughts at the preview, Run A:

- p01 (noticed No): "last photo taken, need to confirm it" / "last photo taken, need to confirm it"
- p02 (noticed -): never reached the preview
- p03 (noticed -): never reached the preview
- p04 (noticed No): "this photo looks clear, need to confirm it to move on" / "this photo looks clear, need to confirm it to move on"
- p05 (noticed -): never reached the preview
- p06 (noticed No): "need to use this photo quickly to avoid missing my ride"
- p07 (noticed No): "last photo taken, need to use it fast to move on"
- p08 (noticed -): never reached the preview
- p09 (noticed -): never reached the preview
- p10 (noticed No): "this photo of the drivetrain looks clear, time to use it"

Thoughts at the preview, Run B:

- p01 (noticed -): never reached the preview
- p02 (noticed No): "need to use this photo, retake is too slow"
- p03 (noticed No): "photo of drivetrain looks clear, use it to keep going"
- p04 (noticed No): "drivetrain photo is clear, use it to finish"
- p05 (noticed -): never reached the preview
- p06 (noticed No): "photo of drivetrain looks okay, tap use photo to move on fast"
- p07 (noticed No): "need to finish fast, use the photo" / "need to finish fast, use the photo"
- p08 (noticed -): never reached the preview
- p09 (noticed -): never reached the preview
- p10 (noticed No): "drivetrain looks fine, tap use photo to continue"

## Check 2: most misses are taps on a disabled button

| | Run A | Run B |
|---|---|---|
| Non-injected taps | 434 | 377 |
| On a live control | 114 | 153 |
| On a disabled button or its dock | 309 | 180 |
| On no control | 11 | 44 |

The main button reads "Take 3 photos" but is disabled until the photos are taken; the photos start from the tiles above it. Agents tap it, nothing changes, and they repeat the same tap until the cap. Seven-tenths of Run A's taps are this. In Run B, p06 finished the flow and then spent its steps tapping for a close button on the thank-you screen, so its row is complete but it counts as capped.

"Names the control" is a word match between the thought and the control's name, so it undercounts: `trace/<run>/misses.txt` lists every miss for reading by eye. The tap landing on the right spot looks better than these totals where agents did reach a live control: in the five finished Run B walks the taps land on what the thought says, for example `trace/pilot-b/p03.jsonl`.

## Check 3

No agent typed anything, so there is no text to mix with human answers, and the skip rate is 100%. The runner told agents to skip with probability `skip_rate`, but with no note the model still skipped. Agents only pass this if they are told when to type; §5a only specifies the note for skipping. The human pilot's answers are also not available yet.

Persona answers: 3 agents in Run A and 5 in Run B reached question 5. The only wrong answer is Run A p10, 35 to 44 against a persona of 25 to 34. `trace/*/*.summary.json` also lists a null for every agent that stopped before answering; those are not counted as wrong.

## Check 4

- **Structure:** rows are written by the site's own code. The finished row Run B p03 (id 443) has every field in §9's list except the report fields, because it did not report, and `find_where` and `preference_why`, because it skipped them. No writes refused, no console errors, in either run.
- **Not tested:** no analysis script exists in the repo, only the `ab_results` view. The public key cannot read the table, so no real human row was compared. Rows here are rebuilt from the writes the runner captured (`trace/*/*.row.json`), with the rules in `schema.sql`.

## Per agent

Steps to report: empty for all, since nobody reached the report tap after the damage. Run A p02 opened the form once, through an injected mis-tap, before seeing the damage.

Run A, qwen/qwen3-vl-30b-a3b-instruct, row ids 439 to 457:

| Agent | Var | Viewport | Status | Steps | Injected | Steps to report | Noticed | Sent | Cost |
|---|---|---|---|---|---|---|---|---|---|
| p01 | a | 390×852 | capped | 45 | 3 | - | No | no | $0.0087 |
| p02 | b | 390×932 | capped | 45 | 7 | - | - | no | $0.0090 |
| p03 | a | 390×932 | capped | 45 | 1 | - | - | no | $0.0089 |
| p04 | b | 390×780 | capped | 45 | 7 | - | No | no | $0.0084 |
| p05 | a | 375×667 | capped | 45 | 1 | - | - | no | $0.0079 |
| p06 | b | 390×896 | capped | 45 | 6 | - | No | no | $0.0090 |
| p07 | a | 390×896 | capped | 45 | 6 | - | No | no | $0.0089 |
| p08 | b | 375×667 | capped | 45 | 2 | - | - | no | $0.0084 |
| p09 | a | 375×667 | capped | 45 | 6 | - | - | no | $0.0083 |
| p10 | b | 390×780 | capped | 45 | 4 | - | No | no | $0.0091 |

Run B, z-ai/glm-4.6v, row ids 441 to 458:

| Agent | Var | Viewport | Status | Steps | Injected | Steps to report | Noticed | Sent | Cost |
|---|---|---|---|---|---|---|---|---|---|
| p01 | a | 390×852 | capped | 45 | 3 | - | - | no | $0.0158 |
| p02 | b | 390×932 | finished | 37 | 7 | - | No | no | $0.0182 |
| p03 | a | 390×932 | finished | 23 | 0 | - | No | no | $0.0094 |
| p04 | b | 390×780 | finished | 28 | 5 | - | No | no | $0.0123 |
| p05 | a | 375×667 | capped | 45 | 1 | - | - | no | $0.0157 |
| p06 | b | 390×896 | capped | 45 | 4 | - | No | no | $0.0200 |
| p07 | a | 390×896 | capped | 45 | 5 | - | No | no | $0.0233 |
| p08 | b | 375×667 | capped | 45 | 1 | - | - | no | $0.0165 |
| p09 | a | 375×667 | capped | 45 | 6 | - | - | no | $0.0184 |
| p10 | b | 390×780 | finished | 27 | 3 | - | No | no | $0.0119 |

"Injected" counts mis-taps, look-arounds and re-checks.

## Cost

| | Actual | List per 1M in / out, seen 1 Nov |
|---|---|---|
| Run A | $0.0868 | $0.15 / $0.60 |
| Run B | $0.1616 | $0.30 / $0.90 |
| Personas | $0.0015 | |
| Five smoke tests and the probe | $0.0737 | |
| **Total** | **$0.3226** by OpenRouter's key usage | |

Runs are cheap partly because capped agents repeat one short reply.

## What did not work as written, and what was done instead

1. **Coordinates (§2).** Asked for viewport pixels, qwen and GLM answered on a 0 to 1000 grid, so taps landed off screen (`trace/smoke-a`, `trace/smoke-b`, both capped). Gemini in pixels also capped (`trace/smoke-gemini-pixels`). Runs A and B therefore ask for the 0 to 1000 grid and the runner scales it to pixels; the trace keeps both. `COORDS=pixels` restores the spec's version.
2. **"You do not know this is a study of layout" (§5a).** Left out, because saying it tells the agent what is tested (§3). The prompt has only "Do not comment on how the screens are built unless a question asks."
3. **`elementFromPoint` (§2).** Read just before the tap rather than after, because a tap can replace the screen.
4. **Thought style.** The phone-style rule for typing leaks into the thoughts, which are terse. This may contribute to check 1 but has not been tested.
5. **Persona text.** Written by qwen and sometimes loose: p02 mentions a scooter and the thoughts then repeat it. Files were kept as generated, because both runs had to use the same people.
6. **Browser.** Chromium with mobile emulation, so `device` reads "Windows · Chrome". WebKit has no touch scroll gesture in Playwright.
7. **Rows used.** The 20 pilot rows plus 5 smoke rows, about ids 434 to 458, all `pilot = true` and `forced = true`. They are in the table until the planned truncate. No site change, no deploy.
8. **Placeholders.** The few-shot examples and all noise values are the spec's placeholders.
