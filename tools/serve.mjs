// Zero-dependency preview server. Usage: npm run dev  →  http://localhost:5173
import { createServer } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = Number(process.env.PORT) || 5173;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json", ".md": "text/plain; charset=utf-8" };

function home() {
  const { pages, names = {} } = JSON.parse(readFileSync(join(ROOT, "pages.json"), "utf8"));
  const rows = []; // [page id, html], sorted by page id below
  const workDir = join(ROOT, "work");
  const people = existsSync(workDir) ? readdirSync(workDir).filter((d) => statSync(join(workDir, d)).isDirectory()) : [];
  for (const person of people) {
    for (const pid of readdirSync(join(workDir, person))) {
      const p = pages.find((x) => x.id === pid);
      if (!p) continue;
      const links = ["a", "b"].filter((d) => existsSync(join(workDir, person, pid, "direction-" + d, "index.html")))
        .map((d) => `<a href="/work/${person}/${pid}/direction-${d}/">Direction ${d.toUpperCase()}</a>`).join(" · ");
      rows.push([pid, `<li><b>${pid}</b> ${p.name} <small>(${names[person] || person})</small> — ${links} · <a href="/work/${person}/${pid}/DECISIONS.md">DECISIONS.md</a></li>`]);
    }
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OutRent preview</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;color:#1E2622;background:#F2F4F1}a{color:#3E6A5A}li{margin:6px 0}small{color:#5C6863}</style>
<h1>OutRent preview</h1>
<p><a href="/design/components.html"><b>Component library</b></a>: every colour, type style and component you may use. · <a href="/design/recipes.html"><b>Recipes</b></a>: live versions of RECIPES.md.</p>
<h2>Work in progress</h2><ul>${rows.map((r) => r[1]).join("") || "<li>Nothing yet. Run <code>npm run new -- &lt;name&gt; &lt;page-id&gt;</code>.</li>"}</ul>`;
}

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/") { res.writeHead(200, { "content-type": TYPES[".html"] }); return res.end(home()); }
  let file = normalize(join(ROOT, url));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("Not found: " + url); }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
  res.end(readFileSync(file));
}).listen(PORT, () => {
  console.log(`OutRent preview running at http://localhost:${PORT}`);
  console.log("Open it in your browser. Press Ctrl+C here to stop.");
});
