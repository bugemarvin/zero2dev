<#
.SYNOPSIS
    zero2dev: set up a Windows machine for development with WSL2.

.DESCRIPTION
    Run from an elevated (Administrator) PowerShell. Safe to re-run.
      1. Installs Git, VS Code, Windows Terminal and PowerShell 7 with winget.
      2. Enables WSL2 and installs a Linux distro.
      3. Runs setup/install.sh inside that distro to install the toolchains.

    If WSL was not installed before, the script stops after step 2 and asks you
    to restart, open the distro once to create your Linux user, and run it again.

.EXAMPLE
    .\install.ps1
    .\install.ps1 -Stacks java,elixir,postgres
    .\install.ps1 -All -Docker

.EXAMPLE
    # Without cloning the repository first:
    & ([scriptblock]::Create((irm https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/install.ps1))) -Stacks java,postgres
#>
param(
    [string[]]$Stacks = @(),
    [switch]$All,
    [switch]$Minimal,
    [switch]$Docker,
    [string]$Distro = 'Ubuntu',
    [switch]$SkipApps,
    [switch]$SkipWsl
)

$ErrorActionPreference = 'Stop'
$RawBase = 'https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup'

function Write-Step([string]$Message) { Write-Host "==> $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message)   { Write-Host " ok  $Message" -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host "warn $Message" -ForegroundColor Yellow }

function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$machine;$user"
}

function Install-WingetApp([string]$Id) {
    winget list --id $Id --exact --accept-source-agreements *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "$Id already installed"
        return
    }
    Write-Step "Installing $Id"
    winget install --id $Id --exact --source winget --silent `
        --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { Write-Warn "winget could not install $Id (exit $LASTEXITCODE)" }
}

function Get-WslDistros {
    # wsl.exe prints UTF-16; WSL_UTF8 fixes that on current versions, the
    # replace handles older ones.
    $env:WSL_UTF8 = '1'
    $lines = & wsl.exe --list --quiet 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $lines) { return @() }
    return @($lines | ForEach-Object { ($_ -replace "`0", '').Trim() } | Where-Object { $_ })
}

# ---------- checks ----------
if (-not (Test-Admin)) {
    throw 'Run this script from an elevated PowerShell (right-click > Run as administrator).'
}
$build = [Environment]::OSVersion.Version.Build
if ($build -lt 19041) {
    throw "Windows build $build is too old for WSL2. Update to Windows 10 version 2004 or later."
}

# ---------- 1. Windows apps ----------
if (-not $SkipApps) {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        $apps = @('Git.Git', 'Microsoft.VisualStudioCode', 'Microsoft.WindowsTerminal', 'Microsoft.PowerShell')
        if ($Docker) { $apps += 'Docker.DockerDesktop' }
        foreach ($app in $apps) { Install-WingetApp $app }

        Update-SessionPath
        if (Get-Command code -ErrorAction SilentlyContinue) {
            Write-Step 'Installing VS Code extensions'
            foreach ($ext in @('ms-vscode-remote.remote-wsl', 'ms-vscode.cpptools', 'ms-python.python')) {
                code --install-extension $ext --force | Out-Null
            }
        } else {
            Write-Warn 'VS Code is not on PATH yet. Open a new terminal and re-run to add the extensions.'
        }
    } else {
        Write-Warn 'winget not found. Install "App Installer" from the Microsoft Store, then re-run.'
    }
}

if ($SkipWsl) {
    Write-Ok 'Skipped WSL (-SkipWsl).'
    return
}

# ---------- 2. WSL2 + distro ----------
$distros = Get-WslDistros
if ($distros -notcontains $Distro) {
    Write-Step "Installing WSL2 and $Distro"
    wsl.exe --install --distribution $Distro --no-launch
    if ($LASTEXITCODE -ne 0) { throw "wsl --install failed (exit $LASTEXITCODE)." }
    Write-Host ''
    Write-Host 'Next steps:' -ForegroundColor Cyan
    Write-Host '  1. Restart Windows if you were asked to.'
    Write-Host "  2. Open '$Distro' from the Start menu once and create your Linux user."
    Write-Host '  3. Run this script again to install the toolchains.'
    return
}
Write-Ok "$Distro is installed in WSL"
wsl.exe --set-default-version 2 | Out-Null

# ---------- 3. toolchains inside WSL ----------
$flags = @()
if ($All) { $flags += '--all' }
elseif ($Minimal) { $flags += '--minimal' }
elseif ($Stacks.Count -gt 0) { $flags += @('--stack', ($Stacks -join ',')) }
$flagText = $flags -join ' '

$localScript = $null
if ($PSScriptRoot) {
    $candidate = Join-Path $PSScriptRoot 'install.sh'
    if (Test-Path $candidate) { $localScript = $candidate }
}

Write-Step "Running install.sh inside $Distro (you will be asked for your Linux password)"
if ($localScript) {
    $forward = $localScript -replace '\\', '/'
    $wslPath = (& wsl.exe -d $Distro -- wslpath -a "$forward").Trim()
    # tr strips carriage returns in case git checked the file out with CRLF.
    $command = "tr -d '\r' < '$wslPath' > /tmp/z2d-install.sh && bash /tmp/z2d-install.sh $flagText"
} else {
    $command = "curl -fsSL $RawBase/install.sh -o /tmp/z2d-install.sh && bash /tmp/z2d-install.sh $flagText"
}
wsl.exe -d $Distro -- bash -c $command
$installExit = $LASTEXITCODE

Write-Host ''
if ($installExit -ne 0) {
    Write-Warn 'Some stacks were not installed. The summary above says why for each one, and what to try next.'
    Write-Host '  - Run this script again to retry: it skips everything that is already installed.'
    Write-Host '  - Or carry on without them: the learning app can run a missing language in Docker.'
} else {
    Write-Ok 'All stacks are installed.'
}

Write-Host ''
Write-Host 'Start learning:' -ForegroundColor Cyan
Write-Host "  1. Open '$Distro' (Windows Terminal, or the Start menu)."
if ($localScript) {
    $projectWin = Split-Path -Parent $PSScriptRoot
    $projectWsl = (& wsl.exe -d $Distro -- wslpath -a ($projectWin -replace '\\', '/')).Trim()
    Write-Host "  2. cd '$projectWsl'"
} else {
    Write-Host '  2. git clone https://github.com/bugemarvin/zero2dev.git; cd zero2dev'
}
Write-Host '  3. python3 app.py'
Write-Host '  The app opens in your Windows browser at http://127.0.0.1:4750'
if ($installExit -ne 0) { exit 1 }
