# Health360 Mobile — Start Expo Dev Server (Windows PowerShell)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
$mobileRoot = Join-Path $repoRoot "mobile\health360-mobile"

Write-Host "=== Health360 Mobile — Start ===" -ForegroundColor Cyan
Write-Host "Project: $mobileRoot`n"

# Quick prerequisite checks (non-fatal warnings)
try { node -v | Out-Null } catch {
    Write-Error "Node.js not found. Install Node.js 20+ and retry."
}

Set-Location $mobileRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# Ensure SDK-aligned Expo packages
Write-Host "Validating Expo dependencies..." -ForegroundColor Cyan
npx expo install --check --fix 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Running expo install --fix..." -ForegroundColor Yellow
    npx expo install --fix
}

Write-Host "`nStarting Expo (Metro)..." -ForegroundColor Green
Write-Host "  Press a — Android emulator (requires SDK + adb)"
Write-Host "  Scan QR — Expo Go on physical device"
Write-Host "  API URL for Android emulator: set EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1`n"

npx expo start
exit $LASTEXITCODE
