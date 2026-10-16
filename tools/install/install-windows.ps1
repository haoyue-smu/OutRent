# OutRent Iter2 setup for Windows 10/11.
# Installs: Git, Node.js LTS, GitHub CLI, Visual Studio Code (via winget, built into Windows).
# Safe to run twice: anything already installed is skipped.
#
# How to run:
#   1. Press the Windows key, type "PowerShell", open "Windows PowerShell".
#   2. Go to the folder where you saved this file, e.g.:  cd $HOME\Downloads
#   3. Paste this line and press Enter:
#        powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
# Click "Yes" if Windows asks for permission.

$ErrorActionPreference = "Stop"

function Say($text)  { Write-Host "`n$text" -ForegroundColor White }
function Ok($text)   { Write-Host "  [ok] $text" -ForegroundColor Green }
function Have($cmd)  { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user    = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

Say "OutRent setup for Windows. This takes about 5-15 minutes."

if (-not (Have "winget")) {
  Write-Host "winget is missing. Open Microsoft Store, search 'App Installer', install or update it, then run this script again." -ForegroundColor Yellow
  exit 1
}

$apps = @(
  @{ Cmd = "git";  Id = "Git.Git";                    Label = "Git" },
  @{ Cmd = "node"; Id = "OpenJS.NodeJS.LTS";          Label = "Node.js LTS" },
  @{ Cmd = "gh";   Id = "GitHub.cli";                 Label = "GitHub CLI" },
  @{ Cmd = "code"; Id = "Microsoft.VisualStudioCode"; Label = "Visual Studio Code" }
)

foreach ($app in $apps) {
  Refresh-Path
  if (Have $app.Cmd) {
    Ok "$($app.Label) already installed"
  } else {
    Say "Installing $($app.Label)..."
    winget install --id $app.Id --exact --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189) {
      Write-Host "  Could not install $($app.Label). Screenshot this window and send it to the team lead." -ForegroundColor Yellow
    }
  }
}

Refresh-Path

# Git identity (used on every save you make)
if (Have "git") {
  if (-not (git config --global user.name)) {
    Say "One-time Git setup"
    $name = Read-Host "  Your name (as teammates know you)"
    git config --global user.name "$name"
  }
  if (-not (git config --global user.email)) {
    $mail = Read-Host "  Your SMU email"
    git config --global user.email "$mail"
  }
  git config --global init.defaultBranch main
  git config --global core.autocrlf true
}

Say "Done. Versions installed:"
foreach ($c in @("git --version", "node --version", "npm --version", "gh --version")) {
  try { $v = (Invoke-Expression $c 2>$null | Select-Object -First 1) } catch { $v = $null }
  if (-not $v) { $v = "missing" }
  Write-Host ("  {0,-16} {1}" -f $c.Split(" ")[0], $v)
}
Write-Host ""
Write-Host "Next: close this window, open a new PowerShell window, and follow START-HERE.md from step A5."
Write-Host "If any line above says 'missing', restart your computer and run this script once more."
