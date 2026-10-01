<#
.SYNOPSIS
    zero2dev: get the learning app onto this Windows computer and start it.

.DESCRIPTION
    Run in PowerShell as Administrator:

        irm https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/get.ps1 | iex

    1. Makes sure WSL2 and Ubuntu are installed. The first time, Windows needs a restart:
       restart, open "Ubuntu" once from the Start menu to create your Linux user, and run
       the same command again.
    2. Downloads zero2dev inside Ubuntu and starts it.

    After this the app runs offline, at http://127.0.0.1:4750 in your Windows browser,
    and starts when you log in. Run the command again at any time to update.
#>
$ErrorActionPreference = 'Stop'
$Distro = 'Ubuntu'
$GetSh = 'https://raw.githubusercontent.com/bugemarvin/zero2dev/main/setup/get.sh'

function Write-Step([string]$Message) { Write-Host "==> $Message" -ForegroundColor Cyan }

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host 'Please run PowerShell as Administrator: Start menu, type PowerShell, right-click, "Run as administrator".' -ForegroundColor Yellow
    return
}

$env:WSL_UTF8 = '1'
$distros = @()
if (Get-Command wsl.exe -ErrorAction SilentlyContinue) {
    $lines = & wsl.exe --list --quiet 2>$null
    if ($LASTEXITCODE -eq 0 -and $lines) {
        $distros = @($lines | ForEach-Object { ($_ -replace "`0", '').Trim() } | Where-Object { $_ })
    }
}

if ($distros -notcontains $Distro) {
    Write-Step "Installing WSL2 and $Distro (a real Linux inside Windows)"
    wsl.exe --install --distribution $Distro --no-launch
    Write-Host ''
    Write-Host 'Almost there. Three steps:' -ForegroundColor Cyan
    Write-Host '  1. Restart Windows.'
    Write-Host "  2. Open '$Distro' from the Start menu once, and choose a Linux user name and password."
    Write-Host '  3. Run this same command again.'
    return
}

# The install line on a copy of the guide that is online sets Z2D_TRUST to that site's address.
$trust = "$env:Z2D_TRUST"
if ($trust -notmatch '^https://[A-Za-z0-9.-]+(:[0-9]+)?$') { $trust = '' }

Write-Step "Downloading and starting zero2dev inside $Distro"
wsl.exe -d $Distro -- bash -c "curl -fsSL $GetSh | Z2D_TRUST='$trust' bash"
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host "That did not finish. If '$Distro' has never been opened, open it once from the Start menu, create your Linux user, and run this command again." -ForegroundColor Yellow
    return
}
Write-Host ''
Write-Host 'zero2dev is installed. It is open in your browser at http://127.0.0.1:4750 and works offline from now on.' -ForegroundColor Green
Start-Process 'http://127.0.0.1:4750'
