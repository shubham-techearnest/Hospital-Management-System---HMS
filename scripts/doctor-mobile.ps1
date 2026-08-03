# Health360 Mobile — Environment Doctor (Windows PowerShell)
# Validates Node, Java, Android SDK, adb, and runs Expo Doctor.

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
$mobileRoot = Join-Path $repoRoot "mobile\health360-mobile"
$failed = $false

function Write-Check($label, $ok, $detail) {
    if ($ok) {
        Write-Host "[OK]   $label" -ForegroundColor Green
        if ($detail) { Write-Host "       $detail" -ForegroundColor DarkGray }
    } else {
        Write-Host "[FAIL] $label" -ForegroundColor Red
        if ($detail) { Write-Host "       $detail" -ForegroundColor Yellow }
        $script:failed = $true
    }
}

Write-Host "`n=== Health360 Mobile — Environment Doctor ===" -ForegroundColor Cyan
Write-Host "Project: $mobileRoot`n"

# Node.js
try {
    $nodeVersion = (node -v).TrimStart('v')
    $nodeMajor = [int]($nodeVersion.Split('.')[0])
    Write-Check "Node.js" ($nodeMajor -ge 20) "v$nodeVersion (requires >= 20)"
} catch {
    Write-Check "Node.js" $false "Not found. Install Node.js 20 LTS from https://nodejs.org/"
}

# npm
try {
    $npmVersion = (npm -v)
    Write-Check "npm" $true "v$npmVersion"
} catch {
    Write-Check "npm" $false "Not found."
}

# Java (required for Android native builds)
try {
    $javaOut = (java -version 2>&1 | Select-Object -First 1)
    Write-Check "Java" $true $javaOut
} catch {
    Write-Check "Java" $false "Not found. Install JDK 17 (Android Studio bundled JDK is fine)."
}

# Android SDK environment variables
$sdkRoot = $env:ANDROID_HOME
if (-not $sdkRoot) { $sdkRoot = $env:ANDROID_SDK_ROOT }
$hasSdkEnv = -not [string]::IsNullOrWhiteSpace($sdkRoot)
Write-Check "ANDROID_HOME / ANDROID_SDK_ROOT" $hasSdkEnv $(if ($hasSdkEnv) { $sdkRoot } else { "Not set. See docs/mobile/MOBILE_SETUP.md" })

if ($hasSdkEnv) {
    $platformTools = Join-Path $sdkRoot "platform-tools"
    $adbPath = Join-Path $platformTools "adb.exe"
    Write-Check "Android platform-tools" (Test-Path $adbPath) $adbPath

    $buildTools = Get-ChildItem (Join-Path $sdkRoot "build-tools") -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    Write-Check "Android Build Tools" ($null -ne $buildTools) $(if ($buildTools) { $buildTools.FullName } else { "Install via Android Studio SDK Manager" })

    $platforms = Get-ChildItem (Join-Path $sdkRoot "platforms") -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    Write-Check "Android Platform SDK" ($null -ne $platforms) $(if ($platforms) { $platforms.FullName } else { "Install Android 14+ (API 34+) via SDK Manager" })
} else {
    Write-Check "Android platform-tools (adb)" $false "Skipped — SDK root not configured"
}

# adb on PATH
try {
    $adbVersion = (adb version 2>&1 | Select-Object -First 1)
    Write-Check "adb on PATH" $true $adbVersion
} catch {
    Write-Check "adb on PATH" $false "Add %ANDROID_HOME%\platform-tools to PATH"
}

# Project dependencies
Set-Location $mobileRoot
if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalling npm dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "`nRunning Expo Doctor..." -ForegroundColor Cyan
npx expo-doctor
$doctorExit = $LASTEXITCODE
if ($doctorExit -ne 0) { $failed = $true }

Write-Host "`nRunning TypeScript check..." -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) { $failed = $true }

if ($failed) {
    Write-Host "`nSome checks failed. See docs/mobile/MOBILE_SETUP.md for remediation." -ForegroundColor Red
    exit 1
}

Write-Host "`nAll checks passed. Run scripts/start-mobile.ps1 to start Metro." -ForegroundColor Green
exit 0
