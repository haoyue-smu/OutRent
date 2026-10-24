# OutRent · multi-persona review · plan v0.2 (local copy)

Agreed with Haoyue 25 Oct 02:28. Round 1 (this run): the Creative Director's prototype (prototype/). Read-only: the reviewers judge, they never change the design. Paths below are relative to this folder.

## 1. Goal

Find out, before the one fix pass, whether the whole prototype:
1. tells Daniel's story from start to end without a gap (both journeys: renting, storing),
2. is consistent (facts, words, components, look) across all 18 pages,
3. works (no dead buttons, no broken states, no broken text at 393 px),
4. holds up as UI to an expert eye,
5. would score high with the IS211 teaching team.

Each reviewer gives a score. Haoyue reads the scores and the top improvements in the morning and decides what goes to the Creative Director.

## 2. What is reviewed

- prototype/index.html, all 18 pages, every state and transition it holds, at 393 × 852.
- Sources of truth: product/ (MOCK-DATA, REQUIREMENTS, PO-ANSWERS v1.6–1.7); docs/SITEMAP.md; docs/COURSE-BRIEF.md; docs/WORDING-RULES.md; docs/BASELINE-CHECKLIST.md; docs/DIRECTION.md; docs/FIXES.md.
- Locked: the Creative Director's direction ("the fitter's line"). Reviewers may flag a disagreement as "needs a decision" with the argument; they may not propose a different direction.

## 3. Reviewers (cards)

### A · Users (goal-level walkthrough; at every step the 4 cognitive-walkthrough questions)

| Card | Who | Journey |
|---|---|---|
| A1 | Daniel, first trail ride, first rental (primary persona) | 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 |
| A2 | Daniel a week later, weekly regular | 09 → 13 (skip, pause, stop) |
| A3 | Daniel as owner of the unused Giant Escape 3 | 01 → 14 → 15 → 16 → 17 → 15 at the Hub; 18 racks |
| A4 | A complete beginner who does not know cycling terms (hardtail, clipless, frame M) | 01 → 02 → 03 → 04 → 05 |
| A5 | A careful, price-sensitive renter who distrusts deposits and hidden fees | 04 → 05 → 06 → 07 → 08 → 12; 15–17 storage costs |
| A6 | Things go wrong: delay, report a problem, cancel, rack full | every exception state that exists |

### B · Stakeholders

| Card | Who | Lens |
|---|---|---|
| B1 | IS211 grader (teaching team) | Course rules (docs/COURSE-BRIEF.md): breakdowns solved, the 9 ideas visible, persona and scenario followed, error states, plain copy, motion only as feedback, consistent design system. Would this be a top-two project in the cohort? |
| B2 | Timah Cycles (the shop) | Would a real shop produce this content (photos, set-up, timings)? Is anything promised that a shop could not deliver? |

### C · Experts

| Card | Lens |
|---|---|
| C1 | **Story**: does the app read as one story from 01 to 18? Every link goes where it says; nothing Daniel needs is missing; nothing appears before it could exist (check the mock clock on every page). |
| C2 | **Consistency, facts**: every number, name, date, ID and term on every page against MOCK-DATA; date form "25 Oct · 7:40"; produces the term table. |
| C3 | **Consistency, system**: the same component looks and behaves the same everywhere (top bar, cards, buttons, tab bar, photo frames, sheets, motion); one app from 01 to 18. |
| C4 | **UI expert**: hierarchy, focal point, type, spacing, density, alignment, image use; Vercel Web Interface Guidelines (https://github.com/vercel-labs/web-interface-guidelines, fetch if the network allows). |
| C5a | **Copy, line editor** (see REVIEW-TASK.md). |
| C5b | **Copy, real-app copywriter** (see REVIEW-TASK.md). |
| C6 | **Accessibility**: contrast, 44 px targets, labels, focus order, reduced motion (axe-core plus manual). |
| C7 | **Motion and feel**: every transition timed (Playwright trace), plays once, explains something; a feel checklist left for Haoyue's phone. |
| C8 | **Bug hunter**: clicks every control on every page; dead ends, wrong destinations, stuck states, overlaps, clipping, broken text, console errors. |
| C9 | **Senior product designer** (shipped consumer apps): maturity, polish, distinctiveness; where it already beats a typical vibe-coded app, and where it still looks like one. |

## 4. What every finding contains

id · card · page · state · what happens · what should happen · Nielsen heuristic (one) · severity 0–4 (4 blocker, 3 major, 2 minor, 1 polish) · screenshot · **the improvement**, written as a concrete change ("on 07, move X to Y, because …"; for copy: old string → new string), never "consider improving".

## 5. Scores

Every card gives an overall score out of 10 for its lens (one sentence why), a score per page out of 10 (journey cards: per step walked), and the BASELINE items it covers as pass / fail.

The report adds: a scorecard (card × page grid with averages per page and per card); a separate wording score per page and overall; journey pass/fail (renting, weekly, storing, exceptions); the five goals in section 1, each scored out of 10.

## 6. Each card also writes a short letter (review/letters/<card>.md)

1. Two sentences: how the app felt for this person or lens.
2. Top 5 improvements, ranked, each with page, change, reason, expected effect.
3. One thing that already works and must be kept.
4. Any "needs a decision" against the locked direction, with the argument.

## 7. Report

review/REPORT.md and review/report.html (phone-readable, screenshots inline, filter by severity and card; Chinese explanations, English terms and app strings):
- scorecard, wording score and journey pass/fail first;
- **Top 15 improvements**, ranked by severity × how many cards raised it ("N of 17 cards"), each with pages and effort S/M/L;
- Wording: term table, then wording findings by page (old → new);
- bugs as their own list with repro steps;
- per page: findings sorted by severity, duplicates merged as "N of M cards";
- conflicts between cards as "needs a decision", both arguments;
- C7 timing table and feel checklist.
Plus review/FIXES-append.md for the fix pass. Nothing goes to the Creative Director until Haoyue has read the report.
