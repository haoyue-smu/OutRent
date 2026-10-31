> **Copy of the project doc claude/experiment/AGENT-PILOT.md, put on ops by Management, 1 Nov 00:40, unchanged except for this note.**
>
> One override from Haoyue (1 Nov 00:10) to §8: at the stopping date, ≥42 humans → human data only; fewer → human and agent rows are analysed **together**, with the agent rows flagged in the table (`agent = true`, §9) so they can always be separated. This does not change anything you build for the pilot; it makes the §9 agent flag required before any non-pilot agent run.

# Agent pilot · 10 simulated participants on the A/B test site

Status: spec, updated 31 Oct 2026 23:50 after the site revision (bundle `abtest-DUwRiIBB.js`). Internal only. Nothing in this file goes into any Iter2 deliverable; the Journal carries a one-line LLM usage declaration and nothing more.

Purpose of the pilot: test the pipeline, not the experiment. The human pilot (2–3 people) keeps its own gate. The agent pilot passes when all four checks below pass. Pilot rows never enter any dataset.

Damage decision (31 Oct): the participant's drivetrain photo shows the chain off and lying on the road. This is final. The scenario text, REQUIREMENTS E5-6 and MOCK-DATA §4 still say "bent rear derailleur" and must be changed by PO.

## 1. What an agent is

One agent = one simulated participant who walks the test site (https://outrent-abtest.vercel.app/) exactly as a human would. The site does all the logging itself (see §9); the runner only drives the browser. Each agent produces one row with the same fields as a human row, plus:

- `agent` true (new column, added before the real run, not for the pilot; see §9)
- `persona_id`, `model`, `temperature`, `run_id` (internal, kept in the local trace only)

The row must be indistinguishable in structure from a human row. The analysis script must run on it unchanged.

## 2. Perception and action

- Playwright, mobile emulation, touch enabled. Viewport height sampled per agent from: 667, 780, 844, 852, 896, 932. Width 390 (375 for 667).
- The agent sees only a screenshot of the current viewport. No DOM, no accessibility tree, no element list, no URL.
- Each step the model returns JSON: `{"thought": "<1–2 sentences, first person>", "action": {"type": "tap"|"scroll"|"type"|"done", ...}}`
  - `tap`: `x`, `y` in viewport pixels
  - `scroll`: `direction` up|down, `amount` small|large
  - `type`: `text` (only when a text field is focused)
- After each action: wait (see §5b), screenshot, next step. Hard cap 45 steps, then the run is marked `aborted` and excluded.
- After every tap the runner records `document.elementFromPoint(x, y)` (tag + text/aria-label) in the local trace. This is the tap-accuracy measure for check 2; it is never sent to Supabase.
- Action history in context: last 6 steps (thought + action), no screenshots except the current one.
- Model via OpenRouter. The model id is a config value; the pilot runs the same 10 personas on two models (see §6). The model must accept image input; text-only models (most DeepSeek chat models) cannot be used.
- Temperature 0.8. Reasoning traces saved to a local JSONL per run, not to Supabase.

## 3. Task text

The system prompt contains the persona (§4) and the behaviour rules (§5). The task is only the site's own scenario screen, which the agent reads from the screenshot like a human; the runner adds nothing. The current scenario text is: "Do the hand-over check before you ride. If anything's wrong, let the shop know."

The words damage, bent, derailleur, chain, report, link, problem must not appear anywhere in the runner's own prompt text. The agent is never told what is being tested.

## 4. Persona generation

Sampling frame: adults in Singapore aged 18–44 who might rent sports equipment. Cycling experience not required. Shop owners and other non-renter stakeholders are out of frame.

Each persona is sampled from these dimensions, then written by the model as a 120–160 word first-person self-description (name, occupation, phone habits, and the sampled facts), saved with its `persona_id` and the sampled values:

| Dimension | Values | Pilot draw | Site field |
|---|---|---|---|
| age band | 18–24 / 25–34 / 35–44 | 4 / 4 / 2 | `age_band` |
| cycling | never / a few times a year / monthly or more | 3 / 4 / 3 | `cycling` |
| rented sports or outdoor gear before | yes / no | 5 / 5 | `rented_before` |
| reading habit | reads everything, scrolls / skims, heads for the main button | 5 / 5 | — |
| deposit worry | worried about losing S$150 / not bothered | 6 / 4 | — |
| time pressure | ride starts at 8:00, in a hurry / relaxed | 5 / 5 | — |
| optional-field skip rate | 0.3 / 0.5 / 0.7 | 3 / 4 / 3 | — |

The first three dimensions are the same three questions the site asks on its last screen ("About you"). An agent's answers there must match its persona. The runner checks this after each run and flags any mismatch in the trace; the report counts mismatches.

Dimensions are crossed randomly with a fixed seed.

Assignment: forced by URL (`?v=a` / `?v=b`), alternating, 5 and 5. The site records `p_forced`; agent rows are analysed as their own dataset, so forced assignment is acceptable there.

## 5. Behaviour

### 5a. Strategy, in the system prompt (the model decides)

Persona traits are written as attention habits that decide the next action, not as adjectives. Example: "I read the headline and the buttons; I rarely scroll back up" rather than "I am impatient".

- You are using your own phone. You act on what you see. One action at a time.
- Think the way this person would, in one or two short sentences, then act.
- Optional text fields: leave empty with probability `skip_rate` (decided per field by the runner, passed in as "you feel like skipping this one" / no note).
- When you do type: at most 15 words, phone style, fragments fine, lowercase fine, no full explanations, do not start with "because". Few-shot examples: the human pilot's real answers, inserted once they exist. Until then, three placeholder examples in that style.
- No Singlish imitation.
- You do not know this is a study of layout. Do not comment on the interface unless a question asks.

### 5b. Mechanical noise, in the runner (the model does not know)

| Behaviour | Implementation | Driven by |
|---|---|---|
| Mis-tap | With probability p the runner moves the tap to the nearest other tappable element. The model sees the wrong result next step and recovers itself. | time pressure: in a hurry p = 0.10, relaxed p = 0.03 |
| Look around first | When a new screen appears, the runner scrolls to the bottom and back before the model's first decision on that screen. | reading habit: "reads everything" only |
| Reading pause | Wait after each action = 400 ms + words on screen × ms per word (250 for "reads everything", 80 for "skims"). | reading habit |
| Re-check | With probability 0.2 after each photo, the runner taps the photo just taken to view it full size, then the model continues. | deposit worry: worried only |

Every injected action is logged in the trace with `injected: true`. The site logs it like any other tap.

Calibration: once the human pilot exists, compare mean steps, scrolls and mis-taps per human with the agents and adjust p and the pause values to match. Until then the values above are placeholders.

## 6. Pilot runs and cost

Budget assumption per agent: ~28 steps, ~2.5k input tokens (one screenshot + persona + short history) and ~120 output tokens per step → ~70k input, ~3.4k output per agent. The walk in §9 confirms about 25 taps for a full run with a report, before noise.

Candidate models on OpenRouter (list prices seen 31 Oct 2026; confirm on openrouter.ai before each run):

| Model | In / out per 1M | Per agent | 100 agents | Note |
|---|---|---|---|---|
| qwen/qwen3-vl-8b-instruct | ~$0.08 / ~$0.3 | ~$0.007 | ~$0.7 | cheapest; grounding may be weak |
| qwen/qwen3-vl-30b-a3b-instruct | ~$0.13 / ~$1.56 | ~$0.015 | ~$1.5 | Run A default |
| qwen/qwen3-vl-235b-a22b-instruct | ~$0.20 / ~$0.8–1.5 | ~$0.018 | ~$1.8 | |
| google/gemini-2.5-flash-lite | $0.10 / $0.40 | ~$0.008 | ~$0.8 | |
| z-ai/glm-4.6v | ~$0.30 / ~$1 | ~$0.025 | ~$2.5 | GUI-agent trained; Run B default |
| google/gemini-2.5-flash | $0.30 / $2.50 | ~$0.03 | ~$3 | fallback if both defaults fail grounding |

Run A: 10 personas on qwen3-vl-30b-a3b-instruct.
Run B: the same 10 personas, same seeds, on glm-4.6v.
Both pilot runs together: under $0.50. Full study of 100 agents on either default: under $3.

Record model id, list price and actual OpenRouter cost in the run log.

## 7. Pass checks

1. Vision: at least 7 of 10 agents answer end question 1 "Yes" and their thought at the drivetrain preview mentions the chain being off, hanging or on the ground. If fewer in both runs, report back before anything else.
2. Grounding: tap accuracy ≥ 90% by `elementFromPoint` on non-injected taps (the tap lands on the control the thought names); no run hits the step cap.
3. Text: a reader shown 10 agent open-text answers mixed with the human pilot's answers cannot reliably tell them apart; skip rate between 30% and 60%; zero persona/"About you" mismatches.
4. Data: each agent row has every human field populated or null exactly as a human row would, and the analysis script runs without modification.

Decision rule after the pilot: use the cheapest model that passes all four checks. If neither default passes check 2, retry with gemini-2.5-flash before changing anything else.

## 8. Out of scope and open decisions

- No comparison of agent results with human results in any deliverable.
- No agent verbatim quotes in Results. Agent open text is used for theme counts only.
- Human and agent data are never mixed in one test. At the stopping date: ≥42 humans → human data only; fewer → agent dataset, human rows kept in an appendix. **(Superseded 1 Nov by Haoyue: fewer than 42 humans → mixed, agent rows flagged. See the note at the top.)**
- Open decision (Haoyue): which metric is primary. **(Settled 31 Oct 23:55: `time_to_report` primary, steps to report secondary for everyone.)** Since the 31 Oct revision the scenario tells every participant "If anything's wrong, let the shop know", so most people in both groups will try to report. That makes the report rate (`reported`) likely to hit a ceiling in both groups, and the difference between A and B shows up in how quickly and how directly people find the link. For humans that is `time_to_report`. For agents, time is model latency and has no meaning. The agent-safe equivalent is **steps to report**: the number of logged tap and scroll events between `t_damage_visible` and `t_report_tap`, computed from the `events` array (each event has a sequence number `n`). This can be computed for humans too.

## 9. Test-site facts (read from the deployed site, 31 Oct 2026 23:40, bundle `abtest-DUwRiIBB.js`, Supabase stubbed, no rows written)

URL parameters, already built in:
- `?v=a` or `?v=b` forces the variant; sent to Supabase as `p_forced`.
- `?pilot=1` flags the row as pilot (`p_pilot`).
- `?new=1` clears the saved session in localStorage (the site otherwise resumes a participant where they left off). Needed on every agent run, together with `v` or `pilot`.
- Still missing: an agent flag. Before the real agent run, Build adds `?agent=1` → `p_agent` on `ab_start`, plus the `agent` boolean column and the RPC parameter in Supabase. The pilot runs on `?pilot=1` alone.

Logging, all inside the site:
- `ab_start` (POST, Supabase RPC): `t0`, `forced`, `pilot`, `viewport_h`, `viewport_w`, `dpr`, `device`, `user_agent`. Returns `id`, `variant`, `token`. Verified live on 31 Oct: one `pilot=1` session got id 394, variant A, and four `ab_log` patches returned 204.
- `ab_log` (POST, batched every 400 ms, retried): patches of `set` fields, `events` (every tap, scroll, screen, photo, form event with sequence `n` and `t` in ms since `t0`), `scroll_depth`, `photo_taken`, `hidden`.
- `set` fields observed in a full variant A walk: `page_open`, `link_visible_on_load`, `t_damage_visible`, `link_in_view_at_damage`, `first_tap_after_photos`, `t_report_tap`, `report_opened`, `report_sent`, `report_reason`, `report_photos`, `report_details_len`, `order`, `record_saved`, `t_end`, `noticed`, `t_q1_done`, `seq`, `t_q2_done`, `find_ease`, `find_not_looked`, `find_where`, `t_q3_done`, `t_questions_done`, `preference`, `preference_left`, `preference_why`, `t_q4_done`, `cycling`, `rented_before`, `age_band`, `t_q5_done`, `t_finish`. Also `scroll_up_after_photos` when it happens.
- Table hygiene: ids had reached 394 on 31 Oct, so the table holds earlier test rows. Before the real run, decide which rows other than `pilot` and `forced` are test rows and remove or flag them.

Flow (variant A, iPhone 13 viewport, 664 px visible):
- Welcome → Continue → scenario ("Do the hand-over check before you ride. If anything's wrong, let the shop know.") → Start → hand-over page.
- Each photo: Take photo → full-screen preview with Retake / Use photo → back on the page (2 taps per part, 6 in all). The drivetrain preview shows the chain off and lying on the road, clearly visible at full size. The main button reads "Take 3 photos" → "Take 2 more photos" → "Take 1 more photo" → "Save record".
- Report: link → form (reason radios, attach any of the three hand-over photos, Add a photo, optional details, Send to Timah Cycles) → "Report sent" screen → Back to hand-over (link now reads "Report sent · 7:46") → Save record.
- End questions, one per screen, 5 in all:
  1. Did you notice anything wrong with the bike? Yes / No / Not sure
  2. Overall, how difficult or easy was the task? 1–7
  3. How easy was it to find where to report a problem with the bike? 1–7 or "I didn't look for it", plus optional "Where did you look first?"
  4. Which layout would you rather use? Two full-page images ("Report link at the top" / "at the bottom"), tap to enlarge, plus optional "Why?". Left/right order is logged (`preference_left`).
  5. About you: How often do you cycle? (Never / A few times a year / Monthly or more); Rented sports or outdoor gear before? (Yes / No); Your age (18 to 24 / 25 to 34 / 35 to 44 / 45 or older / Prefer not to say). Finish.
- Full run with a report: about 25 taps. Without a report: about 18.

Link position (top of the link button relative to the top of the viewport):
- A, on load: 162 / 664, visible. After the three photos: −186, scrolled out of view above.
- B, on load: 795 / 664, below the fold. After the three photos: 504 / 664, visible next to Save record.

Controls carry text or aria-labels ("See the shop's photo of the crank arm full size", "Attach your photo of the drivetrain", "See "Report link at the top" full size", …), which is what makes the `elementFromPoint` accuracy check in §2 possible.
