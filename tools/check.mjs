// OutRent checker. Keeps every page inside the design system.
//   npm run check                 check everything in work/
//   npm run check -- work/amanda  check one folder
//   node tools/check.mjs --staged (used by the pre-commit hook)
// ✗ = error (must fix, blocks commit)   ! = warning (allowed if explained in DECISIONS.md)
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const { pages, people } = JSON.parse(readFileSync(join(ROOT, "pages.json"), "utf8"));
const args = process.argv.slice(2);
const STAGED = args.includes("--staged");
const LEAD = process.env.OUTRENT_LEAD === "1";

const FONT_SIZES = new Set([11, 12, 13, 14, 15, 16, 17, 18, 20, 24, 28, 30, 32, 34, 38, 44]);
const RADII = new Set([0, 16, 18, 22, 28, 999]);
const NAMED_COLOURS = /\b(white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|brown|gold|cyan|magenta|lime|navy|teal|silver)\b/i;
const COMPONENT_CLASSES = new Set([...readFileSync(join(ROOT, "design", "components.css"), "utf8").matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));

const issues = []; // { file, level: "error" | "warn", msg }
let lenient = false; // work/lead: hero pages may break rules on purpose, so errors become warnings
const add = (file, level, msg) => issues.push(lenient && level === "error" ? { file: relative(ROOT, file).split(sep).join("/"), level: "warn", msg: "(lead exception) " + msg } :{ file: relative(ROOT, file).split(sep).join("/"), level, msg });
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

function cssBlocks(html) {
  const out = [];
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) out.push({ css: m[1], at: m.index });
  for (const m of html.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) out.push({ css: m[1], at: m.index });
  return out;
}

function checkCss(file, css, text, at) {
  const where = (i) => `line ${lineOf(text, at + i)}`;
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, (c) => " ".repeat(c.length));
  for (const m of clean.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) add(file, "error", `${where(m.index)}: colour ${m[0]} written directly. Use a colour token such as var(--sage).`);
  for (const m of clean.matchAll(/\b(rgba?|hsla?|oklch|lab)\s*\(/gi)) add(file, "error", `${where(m.index)}: ${m[1]}() colour written directly. Use a colour token.`);
  for (const m of clean.matchAll(/(?:^|[;{\s])((?:background|background-color|color|border(?:-[a-z]+)?|fill|stroke|outline(?:-color)?)\s*:\s*[^;}]*)/gi)) {
    if (NAMED_COLOURS.test(m[1].replace(/var\([^)]*\)/g, ""))) add(file, "error", `${where(m.index)}: named colour in "${m[1].trim()}". Use a colour token.`);
  }
  for (const m of clean.matchAll(/font-family\s*:\s*([^;}]*)/gi)) {
    const v = m[1].trim();
    if (!/^(var\(--font\)|inherit)$/.test(v)) add(file, "error", `${where(m.index)}: font-family "${v}". Only var(--font) (Onest) is allowed.`);
  }
  for (const m of clean.matchAll(/font-size\s*:\s*([^;}]*)/gi)) {
    const v = m[1].trim();
    if (v.startsWith("var(") || v === "inherit") continue;
    const px = v.match(/^(\d+(?:\.\d+)?)px$/);
    if (!px || !FONT_SIZES.has(Number(px[1]))) add(file, "error", `${where(m.index)}: font-size ${v} is not on the type scale. Use a type class (.t-title, .t-body…) or var(--fs-…).`);
  }
  for (const m of clean.matchAll(/border-radius\s*:\s*([^;}]*)/gi)) {
    const v = m[1].trim();
    if (v.includes("var(") || v === "50%" || v === "inherit") continue;
    const bad = v.split(/\s+/).some((part) => { const n = part.match(/^(\d+)px$/); return !(part === "0" || (n && RADII.has(Number(n[1])))); });
    if (bad) add(file, "warn", `${where(m.index)}: border-radius ${v}. Use a radius token (var(--r-card) etc.) or explain it under Off-system.`);
  }
  for (const m of clean.matchAll(/box-shadow\s*:\s*([^;}]*)/gi)) if (!/^(none|var\(--shadow-float\))$/.test(m[1].trim())) add(file, "warn", `${where(m.index)}: custom box-shadow. Use var(--shadow-float) or explain it under Off-system.`);
  for (const m of clean.matchAll(/backdrop-filter\s*:\s*([^;}]*)/gi)) if (!/var\(--glass-blur\)|none/.test(m[1])) add(file, "warn", `${where(m.index)}: custom backdrop-filter. Use the .glass class or var(--glass-blur).`);
  for (const m of clean.matchAll(/url\(\s*["']?([^"')]+)/gi)) if (!/icons\.svg/.test(m[1])) add(file, "error", `${where(m.index)}: url(${m[1]}) loads an image. All images must be .img-ph placeholders.`);
  for (const m of clean.matchAll(/(?:linear|radial|conic)-gradient\(/gi)) add(file, "warn", `${where(m.index)}: gradient. Gradients are not part of the look; explain it under Off-system.`);
}

function checkHtml(file, html, decisions) {
  if (!/<main[^>]*class="[^"]*\bscreen\b/.test(html)) add(file, "error", `the page must be built inside <main class="screen"> (see templates/page.html).`);
  for (const need of ["design/tokens.css", "design/components.css"]) if (!html.includes(need)) add(file, "error", `missing the link to ${need}. Keep the four lines at the top of the template.`);
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/gi)) {
    const href = m[1];
    if (/rel="preconnect"/.test(m[0])) continue;
    if (/^https:\/\/fonts\.googleapis\.com\/css2\?family=Onest/.test(href) || /design\/(tokens|components)\.css$/.test(href)) continue;
    add(file, "error", `line ${lineOf(html, m.index)}: extra stylesheet ${href}. Only the design system and Onest are allowed.`);
  }
  for (const m of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/gi)) if (/^(https?:)?\/\//.test(m[1])) add(file, "error", `line ${lineOf(html, m.index)}: external script ${m[1]}. No libraries or CDNs: plain HTML, CSS and a little JavaScript only.`);
  for (const m of html.matchAll(/<(img|picture|video|iframe)\b/gi)) add(file, "error", `line ${lineOf(html, m.index)}: <${m[1]}> found. Images must be <div class="img-ph" role="img" aria-label="Photo: …">, and the request listed in DECISIONS.md.`);
  for (const m of html.matchAll(/\s(fill|stroke|stop-color)="(#[0-9a-fA-F]{3,8}|rgb[^"]*|[a-z]+)"/gi)) {
    if (/^(none|currentColor|transparent)$/i.test(m[2])) continue;
    add(file, "error", `line ${lineOf(html, m.index)}: ${m[1]}="${m[2]}" in an SVG. Use currentColor or a token through CSS.`);
  }
  for (const m of html.matchAll(/<svg\b(?![^>]*class="[^"]*\bicon\b)[^>]*>[\s\S]*?<\/svg>/gi)) if (/<path\b/.test(m[0]) && !/<use\b/.test(m[0])) add(file, "warn", `line ${lineOf(html, m.index)}: hand-drawn SVG. Use Phosphor icons from design/icons.svg, or list it under Off-system.`);
  if (/lorem ipsum/i.test(html)) add(file, "error", `lorem ipsum found. Use the mock data from DESIGN.md section 8.`);
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html.replace(/<!--[\s\S]*?-->/g, ""))) add(file, "error", `emoji found. Use Phosphor icons instead.`);
  for (const { css, at } of cssBlocks(html)) checkCss(file, css, html, at);
  // New classes defined in the page = new component (tier 3).
  const defined = new Set();
  for (const { css } of cssBlocks(html).filter((b) => /[{}]/.test(b.css))) for (const m of css.matchAll(/\.([a-zA-Z][\w-]*)\s*[,{:.\s>+~[]/g)) defined.add(m[1]);
  const fresh = [...defined].filter((c) => !COMPONENT_CLASSES.has(c));
  if (fresh.length) {
    const offSystem = (decisions.match(/## Off-system([\s\S]*?)(\n## |$)/) || [])[1] || "";
    const listed = offSystem.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (!listed || /^none\.?$/i.test(listed)) add(file, "warn", `new classes ${fresh.map((c) => "." + c).join(", ")} are not in the component library. List them under "Off-system" in DECISIONS.md with a reason.`);
  }
}

function checkDecisions(file, text) {
  const section = (title) => ((text.match(new RegExp(`## ${title}([\\s\\S]*?)(\\n## |$)`)) || [])[1] || "").replace(/<!--[\s\S]*?-->/g, "").trim();
  for (const t of ["Direction A", "Direction B", "How A and B differ", "My choice and why", "Off-system", "Image requests", "AI use"]) {
    if (!text.includes("## " + t)) add(file, "error", `section "## ${t}" is missing. Copy it back from templates/DECISIONS.md.`);
  }
  if (!section("How A and B differ")) add(file, "warn", `"How A and B differ" is empty. One sentence: structure, information order or interaction pattern.`);
  if (!section("My choice and why")) add(file, "warn", `"My choice and why" is empty. Write it yourself, in your own words.`);
}

function checkPageFolder(dir) {
  const [person, pageId] = relative(join(ROOT, "work"), dir).split(sep);
  lenient = person === "lead";
  if (!people.includes(person)) add(dir, "error", `"${person}" is not a team member folder. Use your name from pages.json.`);
  if (!pages.some((p) => p.id === pageId)) add(dir, "error", `"${pageId}" is not a page id. See pages.json (e.g. 04-search-results).`);
  const decPath = join(dir, "DECISIONS.md");
  const decisions = existsSync(decPath) ? readFileSync(decPath, "utf8") : "";
  if (!decisions) add(dir, "error", `DECISIONS.md is missing. Run: npm run new -- ${person} ${pageId}`);
  else checkDecisions(decPath, decisions);
  for (const d of ["direction-a", "direction-b"]) {
    const f = join(dir, d, "index.html");
    if (!existsSync(f)) { add(dir, "warn", `${d}/index.html is not there yet.`); continue; }
    checkHtml(f, readFileSync(f, "utf8"), decisions);
  }
  const walk = (p) => statSync(p).isDirectory() ? readdirSync(p).flatMap((c) => walk(join(p, c))) : [p];
  for (const f of walk(dir)) {
    if (f.endsWith(".css")) checkCss(f, readFileSync(f, "utf8"), readFileSync(f, "utf8"), 0);
    if (/\.(png|jpe?g|webp|gif|avif|heic)$/i.test(f)) add(f, "error", `image file in your folder. Images are managed by the team lead; use .img-ph and list it under Image requests.`);
    if (/node_modules|package\.json$/.test(f)) add(f, "error", `no packages or frameworks in work folders.`);
  }
}

// ---------- which folders to check ----------
let targets = [];
const workRoot = join(ROOT, "work");
const pageDirsUnder = (p) => {
  if (!existsSync(p)) return [];
  const rel = relative(workRoot, p).split(sep).filter(Boolean);
  if (rel.length >= 2) return [join(workRoot, rel[0], rel[1])];
  if (rel.length === 1) return readdirSync(p).filter((c) => !c.startsWith("_")).map((c) => join(p, c)).filter((c) => statSync(c).isDirectory());
  return readdirSync(p).flatMap((person) => statSync(join(p, person)).isDirectory() ? pageDirsUnder(join(p, person)) : []);
};

if (STAGED) {
  const files = execSync("git diff --cached --name-only --diff-filter=ACMR", { cwd: ROOT }).toString().split("\n").filter(Boolean);
  const outside = files.filter((f) => !f.startsWith("work/"));
  if (outside.length && !LEAD) for (const f of outside) add(join(ROOT, f), "error", `only files inside work/<your-name>/ may be changed. Undo this change (ask your agent: "unstage ${f}").`);
  const owners = new Set(files.filter((f) => f.startsWith("work/")).map((f) => f.split("/")[1]));
  if (owners.size > 1 && !LEAD) add(workRoot, "warn", `this commit touches more than one person's folder (${[...owners].join(", ")}). Only change your own.`);
  targets = [...new Set(files.filter((f) => f.startsWith("work/") && f.split("/").length > 3 && !f.split("/")[2].startsWith("_")).map((f) => join(workRoot, f.split("/")[1], f.split("/")[2])))].filter(existsSync);
} else if (args.includes("--pr")) {
  // Pull request check (GitHub Actions): branch must be work/<name>, and only work/<name>/ may change.
  const branch = process.env.GITHUB_HEAD_REF || execSync("git rev-parse --abbrev-ref HEAD", { cwd: ROOT }).toString().trim();
  const isLead = process.env.GITHUB_ACTOR && process.env.GITHUB_ACTOR === process.env.GITHUB_REPOSITORY_OWNER;
  const base = process.env.GITHUB_BASE_REF || "main";
  const files = execSync(`git diff --name-only --diff-filter=ACMRD origin/${base}...HEAD`, { cwd: ROOT }).toString().split("\n").filter(Boolean);
  const m = branch.match(/^work\/([a-z]+)$/);
  if (!isLead) {
    if (!m || !people.includes(m[1])) add(workRoot, "error", `branch "${branch}" is not allowed. Use your own branch: work/<your-name> (e.g. work/amanda).`);
    else for (const f of files) if (!f.startsWith(`work/${m[1]}/`)) add(join(ROOT, f), "error", `this pull request changes a file outside work/${m[1]}/. Only your own folder may change.`);
  }
  targets = [...new Set(files.filter((f) => f.startsWith("work/") && f.split("/").length > 3 && !f.split("/")[2].startsWith("_")).map((f) => join(workRoot, f.split("/")[1], f.split("/")[2])))].filter(existsSync);
} else {
  const given = args.filter((a) => !a.startsWith("--"));
  targets = given.length ? given.flatMap((g) => pageDirsUnder(join(ROOT, g))) : pageDirsUnder(workRoot);
}
for (const t of targets) checkPageFolder(t);
lenient = false;

// ---------- report ----------
const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
const byFile = new Map();
for (const i of issues) byFile.set(i.file, [...(byFile.get(i.file) || []), i]);
for (const [file, list] of byFile) {
  console.log("\n" + file);
  for (const i of list) console.log(`  ${i.level === "error" ? "✗" : "!"} ${i.msg}`);
}
console.log(`\n${targets.length} page folder(s) checked: ${errors.length} error(s), ${warns.length} warning(s).`);
if (errors.length) console.log("Fix every ✗ before committing or sending your folder. Warnings (!) are allowed if DECISIONS.md explains them.");
else console.log(warns.length ? "No errors. Check the warnings are explained in DECISIONS.md." : "All clear ✓");
process.exit(errors.length ? 1 : 0);
