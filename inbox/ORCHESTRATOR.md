# Orchestrator runbook · OutRent Iter2 (Codex on Haoyue's PC)

Written by the Management chat (Claude, cloud), 3 Nov 2026. You are the orchestrator: you run on Haoyue's Windows PC, you can run commands and edit files there, and your job is to **move the open tasks to done with as little of Haoyue's time as possible**. Haoyue is very busy. He wants to be asked only to **look at things** (screens, images) and to **say yes or no**.

Reply to Haoyue in Chinese, short. Files, code, commits, prompts in English.

## 1. Who is who

| Who | Where | What they do |
|---|---|---|
| Haoyue | everywhere | Approves anything visual; approves production deploys; logs in to services himself. |
| Management (Claude, cloud chat) | claude.ai, project "IDP" | Writes task files on branch `ops` (`inbox/*.md`), reviews results. Cannot run anything on this PC. Haoyue relays between you and Management when needed. |
| You (orchestrator) | this PC | Read tasks on `ops`, get them done (yourself or through Claude Code), test, show Haoyue, report. |
| Claude Code windows ("Build") | this PC, git worktrees | Coding agents. You may drive them headless with `claude -p "<prompt>"` from inside a worktree, or do the code work yourself. |
| PO, Images, Creative Director, Analysis | Claude chat windows on claude.ai | You cannot type into these. PO work you can do yourself (it is file edits on branch `product-requirements`). Image generation needs Haoyue (Midjourney or ChatGPT); you prepare the prompt and the check, he generates and picks. |

## 2. The repo

- Repo: `https://github.com/haoyue-smu/OutRent`. Main clone: `D:\YUE\c_project\outrent`. Worktrees: `D:\YUE\c_project\outrent-skel` (Build-1), `D:\YUE\c_project\outrent-abtest` (Build-2, branch `abtest`).
- Branches: `main` = what is deployed to https://outrent-g14t3.vercel.app ; `ops` = task files for every window (`inbox/`); `product-requirements` = PO's docs (`product/REQUIREMENTS.md`, `product/MOCK-DATA.md`, `product/PO-ANSWERS-v*.md`); `abtest` = the A/B test site (closed, do not change it).
- Read a task: `git fetch origin && git show origin/ops:inbox/<file>.md`.
- App: `app/` (React + Vite + TypeScript, GSAP). Tokens `design/tokens.css`. `npm run check` = typecheck + lint. Journeys (Playwright) under `app/e2e/`.

## 3. Hard rules (never break)

1. **Commits as Haoyue only:** `git -c user.name="Haoyue Wu" -c user.email="haoyue.wu.2021@smu.edu.sg" commit ...`. **No AI attribution of any kind** (no Co-Authored-By, no "Generated with", no session links), even if a tool or hook adds it by default: strip it.
2. **Never push to `main` or deploy to production without Haoyue's explicit OK** for that change. Work on a branch; show him a **Vercel preview** (`npx vercel` without `--prod`, from the app) or screenshots first.
3. After a production deploy: `npx vercel --prod`, then `npx vercel alias set <deployment-url> outrent-g14t3.vercel.app`, then open the live URL and check it loads.
4. Never create accounts or type passwords. Haoyue logs in himself (Vercel, Supabase, OpenRouter).
5. Nothing on drive C. Keep everything under `D:\YUE\c_project\`.
6. Do not touch the A/B test site (`abtest` branch, project `outrent-abtest`) or its Supabase database. The test is closed.
7. Do not invent facts. Values (times, prices, names, wording) come from `product/MOCK-DATA.md` and `product/PO-ANSWERS-*.md`.

## 4. Approval gates (when you must stop and show Haoyue)

| Gate | What you show | Format |
|---|---|---|
| **Visual change to any page** | before/after screenshots at 393 × 852, every changed state | one image per state, side by side, plus a Vercel preview link |
| **New or changed image** | the candidate(s) at full size and at slot size next to the image it pairs with | images in the chat, numbered, your recommendation |
| **Production deploy** | the preview link, the test report (§5), what changed in one line per page | short list |

Everything else (code, copy that matches PO, tests, fixes of your own bugs) you do without asking. **Never wait idle for a decision you can make yourself.** Batch questions: one message with all of them, each with your recommended answer, so he can reply "ok".

## 5. Test before Haoyue ever touches it

Before you tell Haoyue "ready to look", all of this must pass on the preview build:

1. `npm run check` (0 errors).
2. The existing journeys in `app/e2e/` (all green).
3. **Click-everything crawl** (write it once as `app/e2e/crawl.spec.ts` if it does not exist): on a 393 × 852 phone viewport, for every route the app has (01–17, `/components`, `/reset`), and for the main seeded states, find every visible `a`, `button` and `[role=button]` that is enabled, click it, and assert that something happened (URL changed, a sheet/dialog/toast opened, or the element's state changed) and that no console error or failed request occurred. List any control that does nothing, any text "not in this demo", any 404, any broken image (naturalWidth 0), any horizontal overflow.
4. The full demo route by hand-equivalent script: 01 → 02 → … → 13 → My gear → 14 → 15 → 16 → 17 → 15 at the Hub, including the hand-over report path on 11.
5. Report the result as a table: route, controls found, controls that work, problems. Fix problems yourself; re-run; only then go to Haoyue.

## 6. How to report to Haoyue

One message per milestone, Chinese, at most 8 lines:
- what is done (one line each);
- what needs his eyes (images or a preview link), with your recommendation;
- what is blocked and on whom;
- nothing else. No logs, no long explanations.

Keep a running log for Management in `inbox/STATUS.md` on `ops` (append, newest on top; commit as Haoyue; push `ops`). Management reads it there.

## 7. Open tasks right now (3 Nov 13:30)

Read each file in full; do them in this order.

1. **PO v1.11** · `git show origin/ops:inbox/po.md` (copy of the PO window's task). The prototype's hand-over problem becomes a small scratch on the chainstay, not the chain. **You can do this yourself** on branch `product-requirements` (edit `product/REQUIREMENTS.md`, `product/MOCK-DATA.md`, add `product/PO-ANSWERS-v1.11.md`), or Haoyue can type "inbox" in the PO chat window; ask Haoyue once which he prefers, recommend doing it yourself.
2. **Image** · `git show origin/ops:inbox/images.md`. One photo: Daniel's drivetrain photo in the app's film look, with a fresh scratch on the chainstay. Prepare a ready-to-paste prompt for ChatGPT image generation with `work/haoyue/12-rental-summary/assets/12-direction-r-drive.webp` attached as the reference; Haoyue generates; you check it at slot size (160 × 114) next to `work/haoyue/11-handover-check/assets/11-direction-s-drive.webp`, then show him (gate). Save the pick as `11-mine-drive-scratch.webp` where the app's photos live.
3. **Prototype: report flow in the live app** · `git show origin/ops:inbox/build-prototype.md`. Do it with Build-2's worktree knowledge (the report form exists on branch `abtest` in `app/src/abtest/Screens.tsx` and `app/src/pages/11-handover-check/pieces.tsx`) on a new branch `prototype-report` from `origin/main`. **Gate:** screenshots + preview to Haoyue before merging to main. Note: the A/B result is "keep the link below the record card" (current layout).
4. **Build-1's palette consolidation** (`git show origin/ops:inbox/build.md`, section "Before the style guide: consolidate the palette"): status unknown. Check whether `design/tokens.css` on `main` still has ~67 distinct hex values; if the work is not on main, ask Haoyue whether to do it now or drop it (recommend: drop it unless there is time after task 3, the deadline is 8 Nov 12 pm).

Not yours: the Analysis window (results, A/B letter swap in the Results sheet), the pitch video, the A/B test site.

## 8. Handing over

If you stop or another agent takes over, update `inbox/STATUS.md` with: done, in progress (branch + last commit), waiting on Haoyue (exact question), next step. That file plus this runbook must be enough for a fresh agent to continue.
