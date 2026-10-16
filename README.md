# OutRent prototype: start here

OutRent is a mobile app for renting outdoor gear. This repo holds the Iter2 hi-fi prototype. Each of us designs a few pages, in **two directions (A and B)**, inside one shared design system so the whole app feels like one product.

**Deadline: Wed 21 Oct, 23:59.** Both directions + DECISIONS.md for every page you own.

## 1. Install (once)

- Mac: open Terminal in this folder and run `bash tools/install/install-mac.sh`
- Windows: open PowerShell in this folder and run `powershell -ExecutionPolicy Bypass -File tools\install\install-windows.ps1`

Then: `npm run setup`

## 2. Get the files

**GitHub (recommended):** accept the invite, then

```
git clone https://github.com/haoyue-smu/outrent.git
cd outrent
git checkout work/<your-name>
npm run setup
```

Your branch `work/<your-name>` already exists. Work only there. Nobody can push to `main`; the team lead merges.

**Zip:** download the zip from the team chat, unzip, `npm run setup`.

## 3. Your pages

Your folders are already made: `work/<your-name>/<page-id>/`. The page list and owners are in `pages.json`; the map of the app is `team/sitemap.html`. What each page must do is in `specs/<page-id>.md`. Looking for ideas: `design/INSPIRATION.md`.

## 4. Work with your AI agent

Open this folder in VS Code (or Codex / Claude Code / Cursor) and tell your agent:

> Read AGENTS.md, then help me build direction A of `<page-id>`.

AGENTS.md tells the agent the rules. You still decide: **write "My choice and why" in DECISIONS.md yourself.**

Preview: `npm run dev` → open http://localhost:5173

## 5. Hand in

1. `npm run check` until there are no ✗.
2. GitHub: commit and push to `work/<your-name>`, then open a pull request into `main`. Zip: zip your `work/<your-name>/` folder and send it.

## Rules in one line each

- Colours, font (Onest) and icons (Phosphor) come only from `design/`. The checker blocks anything else.
- No real images: use `.img-ph` placeholders and list them under Image requests.
- Only change files in `work/<your-name>/`.
- Stuck? Ask your agent first, then the team chat.
