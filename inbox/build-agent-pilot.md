# ROUND 2 (1 Nov 09:40) · read this first

Your 1 Nov report (ac3f086) was read. Haoyue approves **one** more round. If round 2 still fails check 1 or check 2, agents are dropped and only human data is used; say so plainly in the report.

The core finding stands: the models see the chain when asked, but do not look while acting. Change only what that finding and the grounding numbers point to:

1. **Look, then act.** On every new screen, the step message first asks: `Describe what is on this screen in one or two sentences, including anything in any photo.` The answer goes into a `look` field in the JSON, before `thought` and `action`. The runner sends only the current screenshot, as now. This is not task text: it does not name the bike, the chain, damage or reporting, and the forbidden-words check still runs.
2. **Feedback when nothing happens.** If the screenshot after a tap is identical to the one before (pixel hash, ignoring the clock), the next step message says `Nothing changed after that tap.` After two identical results in a row it also says `That control may not be ready yet.` No hint about which control to use.
3. **Typing.** Optional fields: the runner now decides per field with the persona's skip_rate both ways. When the field is not skipped, the step message says `You feel like writing a few words here.` (the spec only had the skip note, which is why every field was empty).
4. **Thought style.** The phone-style typing rule applies to typed text only; thoughts are plain first person, one or two sentences. Say this explicitly in the prompt.
5. **Models.** Run C: `google/gemini-2.5-flash`. Run D: `anthropic/claude-haiku-4.5` if it is on OpenRouter with image input (check), otherwise `qwen/qwen3-vl-235b-a22b-instruct`. Same 10 personas, same seeds, same viewports, 0 to 1000 grid as in round 1 unless the model does better in pixels on a smoke test.
6. **Budget.** Stop at **US$2.00 total for round 2** (smoke tests included); the key's limit is $5 and round 1 used about $0.32. Report actual cost per run.
7. Same report format, file `runs/2026-11-01-pilot-r2/REPORT.md`, with the round-1 numbers next to the round-2 numbers in the results table, plus three or four `look` answers from the drivetrain preview verbatim.

Everything else in the spec and below is unchanged. `pilot=1` only. Commit on `abtest`, no AI attribution. Do not truncate or delete rows.

---

# Inbox · Build-2 · agent runner for the A/B test site + 10-agent pilot

Written by the management chat (31 Oct 23:58), from the project doc claude/inbox/build-agent-pilot.md. Do this **after** build-abtest.md's UPDATE 9 is deployed. Pilot rows only (`pilot=1`): nothing from this task may enter the human dataset. Whether any agent data is used at all is a separate decision Haoyue takes with the professor in writing; your job here is the runner and the pilot report.

Spec: `git show origin/ops:inbox/AGENT-PILOT.md` (copy of the project doc, put on ops 1 Nov 00:40). Sections 2, 4, 5, 7 and 9 are the ones you implement against.

Live site: https://outrent-abtest.vercel.app/ (Vite bundle `abtest-*.js`, Supabase RPCs `ab_start` and `ab_log`).

Decision (31 Oct): the damage in the participant's drivetrain photo is the chain off and lying on the road. The live image already shows this. Do not change the image.

## 1. Runner

Location: `app/src/abtest/agent/` (beside the test-site source). Node, Playwright (already in the repo), plain `fetch` to OpenRouter. No framework. This is a fallback tool, not a product: build the smallest thing that produces rows with the same structure as human rows. Do not spend time on polish.

Files:
- `personas.js`: samples the seven dimensions in spec §4 with a fixed seed, asks the model to write each self-description, writes `personas/<run>.json` (persona_id, sampled values, text).
- `run.js`: one agent per invocation or a loop over a persona file. Config: `MODEL`, `OPENROUTER_API_KEY` (from `.env`, never committed), `VARIANT`, `VIEWPORT_H`, `TEMPERATURE=0.8`.
- `prompt.js`: system prompt = persona + behaviour rules (spec §5a) + action JSON schema (spec §2). The runner adds no task text; the agent reads the site's scenario screen. Forbidden-words check (spec §3) runs on the runner's own prompt text and fails loudly.
- `noise.js`: the four injected behaviours in spec §5b, each driven by the persona, each logged with `injected: true`.
- `trace/`: one JSONL per agent: step, screenshot path, thought, action, injected flag, `elementFromPoint` result, model latency, token usage.

Loop per step: screenshot (viewport only, PNG) → model → parse JSON → maybe inject noise → execute (tap at x,y / scroll / type) → wait (spec §5b reading pause) → repeat. Cap 45 steps. Mark `aborted` on cap or on 3 consecutive unparseable responses.

After each run: compare the agent's "About you" answers (`cycling`, `rented_before`, `age_band`) with its persona and record any mismatch.

Open the site with `?v=<a|b>&new=1&pilot=1`. Alternate `v` across personas. Sample `VIEWPORT_H` from spec §2 per persona. No site change is needed for the pilot; the `agent` flag (spec §9) is added only if Haoyue later says so, as a separate task.

Optional-field skipping: the runner decides per optional field with the persona's `skip_rate` and tells the model in the step message either "you feel like skipping this one" or nothing.

## 2. Pilot runs

- Run A: 10 personas, `qwen/qwen3-vl-30b-a3b-instruct`.
- Run B: same 10 personas and seeds, `z-ai/glm-4.6v`.
- Both with `pilot=1` so no row can enter the dataset.
- Record actual OpenRouter cost per run from the usage fields.
- Haoyue gives you the OpenRouter key; it goes in `app/.env.local` only.

## 3. Report

Write `app/src/abtest/agent/runs/<date>-pilot/REPORT.md` with, per run:
- the four pass checks from spec §7, each with the number behind it (noticed count and the thoughts at the drivetrain preview; tap accuracy from `elementFromPoint` on non-injected taps; the open-text answers verbatim, skip rate and persona mismatches; a diff of agent row columns vs a human row);
- per agent: variant, viewport, steps, injected actions, steps to report (events between `t_damage_visible` and `t_report_tap`), aborted or not;
- cost;
- anything in the spec that did not work as written, and what you did instead.

Do not interpret which variant "won". That is not the pilot's question.

## 4. Rules

- Commit on branch `abtest`; do not push to main.
- Commit as Haoyue only, no AI attribution lines.
- `.env*` and `trace/` screenshots stay out of git. Commit the persona files, the JSONL traces without screenshots, and REPORT.md.
- Report in chat as usual: what was done, what could not be done.
