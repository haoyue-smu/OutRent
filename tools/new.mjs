// Creates your work folder for one page from the templates.
// Usage: npm run new -- <your-name> <page-id>
// Example: npm run new -- amanda 04-search-results
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const { pages, people } = JSON.parse(readFileSync(join(ROOT, "pages.json"), "utf8"));
const [person, pageId] = process.argv.slice(2).map((s) => (s || "").toLowerCase());

const page = pages.find((p) => p.id === pageId);
if (!people.includes(person) || !page) {
  console.log("Usage: npm run new -- <your-name> <page-id>");
  console.log("Names:", people.join(", "));
  console.log("Your pages:");
  for (const p of pages) if (p.designer === person) console.log("  " + p.id + "  " + p.name);
  if (!people.includes(person)) for (const p of pages) if (p.designer !== "haoyue") console.log("  " + p.id + "  (" + p.designer + ")");
  process.exit(1);
}
if (page.designer !== person) console.log(`Note: ${page.id} is assigned to ${page.designer}. Creating it anyway.`);

const dir = join(ROOT, "work", person, page.id);
if (existsSync(dir)) { console.log("Already exists: work/" + person + "/" + page.id + " (nothing changed)"); process.exit(0); }

const fill = (text, direction = "") => text
  .replaceAll("{{PAGE_NAME}}", page.name).replaceAll("{{PAGE_ID}}", page.id)
  .replaceAll("{{DIRECTION}}", direction).replaceAll("{{PERSON}}", person[0].toUpperCase() + person.slice(1));

const pageTpl = readFileSync(join(ROOT, "templates", "page.html"), "utf8");
for (const d of ["a", "b"]) {
  mkdirSync(join(dir, "direction-" + d), { recursive: true });
  writeFileSync(join(dir, "direction-" + d, "index.html"), fill(pageTpl, d.toUpperCase()));
}
mkdirSync(join(dir, "assets"), { recursive: true });
writeFileSync(join(dir, "assets", ".gitkeep"), "");
writeFileSync(join(dir, "DECISIONS.md"), fill(readFileSync(join(ROOT, "templates", "DECISIONS.md"), "utf8")));
console.log("Created work/" + person + "/" + page.id + "/");
console.log("  direction-a/index.html, direction-b/index.html, assets/, DECISIONS.md");
console.log("Preview: npm run dev, then open http://localhost:5173/work/" + person + "/" + page.id + "/direction-a/");
