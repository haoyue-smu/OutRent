// One-time setup after cloning: turns on the pre-commit check. Usage: npm run setup
import { execSync } from "node:child_process";
import { chmodSync, existsSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "pipe" }).toString().trim();
const v = process.versions.node.split(".").map(Number);
console.log("Node " + process.versions.node + (v[0] >= 20 ? " ✓" : "  ✗ needs Node 20 or newer (run the install script again)"));
try {
  run("git --version");
  if (existsSync(".git")) {
    run("git config core.hooksPath .githooks");
    if (existsSync(".githooks/pre-commit")) chmodSync(".githooks/pre-commit", 0o755);
    console.log("Git hooks on ✓ (the checker runs before every commit)");
  } else {
    console.log("No .git folder (you downloaded a zip). That's fine: run `npm run check` yourself before sending your folder.");
  }
} catch {
  console.log("Git not found. Run the install script for your computer first.");
}
console.log("\nNext: npm run new -- <your-name> <page-id>   then   npm run dev");
