#!/usr/bin/env bash
# OutRent Iter2 setup for macOS.
# Installs: Homebrew (if missing), Git, Node.js LTS, GitHub CLI, Visual Studio Code.
# Safe to run twice: anything already installed is skipped.
#
# How to run: open Terminal, paste this line, press Enter:
#   bash install-mac.sh
# (run it from the folder where you saved the file, e.g. cd ~/Downloads first)

set -euo pipefail

say()  { printf "\n\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "  ✓ %s\n" "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

say "OutRent setup for Mac. This takes about 5–15 minutes. You may be asked for your Mac password."

# 1. Homebrew --------------------------------------------------------------
if have brew; then
  ok "Homebrew already installed"
else
  say "Installing Homebrew (the Mac package installer)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Make brew available in this window and in future windows (Apple Silicon and Intel paths).
for prefix in /opt/homebrew /usr/local; do
  if [ -x "$prefix/bin/brew" ]; then
    eval "$("$prefix/bin/brew" shellenv)"
    line="eval \"\$($prefix/bin/brew shellenv)\""
    touch "$HOME/.zprofile"
    grep -qxF "$line" "$HOME/.zprofile" || echo "$line" >> "$HOME/.zprofile"
    break
  fi
done
have brew || { echo "Homebrew did not install. Screenshot this window and send it to the team lead."; exit 1; }

# 2. Command-line tools -------------------------------------------------------
install_formula() {
  local cmd="$1" formula="$2" label="$3"
  if have "$cmd"; then ok "$label already installed"; else say "Installing $label…"; brew install "$formula"; fi
}
install_formula git  git     "Git"
install_formula node node@22 "Node.js LTS"
install_formula gh   gh      "GitHub CLI"

# node@22 is keg-only: link it so `node` and `npm` work everywhere.
if ! have node && brew list node@22 >/dev/null 2>&1; then
  brew link --overwrite --force node@22 >/dev/null
fi

# 3. Visual Studio Code -----------------------------------------------------------
if [ -d "/Applications/Visual Studio Code.app" ] || have code; then
  ok "Visual Studio Code already installed"
else
  say "Installing Visual Studio Code…"
  brew install --cask visual-studio-code
fi

# 4. Git identity (used on every save you make) --------------------------------
if [ -z "$(git config --global user.name || true)" ]; then
  say "One-time Git setup"
  read -r -p "  Your name (as teammates know you): " gname
  git config --global user.name "$gname"
fi
if [ -z "$(git config --global user.email || true)" ]; then
  read -r -p "  Your SMU email: " gmail
  git config --global user.email "$gmail"
fi
git config --global init.defaultBranch main

# 5. Check -------------------------------------------------------------------------------
say "Done. Versions installed:"
printf "  Git   %s\n" "$(git --version 2>/dev/null || echo 'missing')"
printf "  Node  %s\n" "$(node --version 2>/dev/null || echo 'missing')"
printf "  npm   %s\n" "$(npm --version 2>/dev/null || echo 'missing')"
printf "  gh    %s\n" "$(gh --version 2>/dev/null | head -n1 || echo 'missing')"
echo
echo "Next: close this Terminal window, open a new one, and follow START-HERE.md from step A5."
echo "If any line above says 'missing', screenshot this window and send it to the team lead."
