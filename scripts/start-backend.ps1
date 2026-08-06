# Start Health360 API locally (requires PostgreSQL on :5432)
# Usage: .\scripts\start-backend.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

& (Join-Path $PSScriptRoot "start-postgres.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
$mavenCandidates = @(
    (Join-Path $repoRoot "backend\health360-api\.local\apache-maven-3.9.9\bin\mvn.cmd"),
    "C:\Users\ParmeshwarSuryawansh\tools\apache-maven-3.9.6\bin\mvn.cmd"
)
$mvn = $mavenCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $mvn) {
    $cmd = Get-Command mvn -ErrorAction SilentlyContinue
    if ($cmd) { $mvn = $cmd.Source }
}
if (-not (Test-Path $javaHome)) {
    Write-Error "Java 21 not found at $javaHome"
}
if (-not $mvn) {
    Write-Error "Maven not found. Install Maven or use backend/health360-api/.local/apache-maven-3.9.9"
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$(Split-Path $mvn -Parent);$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:POSTGRES_USER = "health360"
$env:POSTGRES_PASSWORD = "health360_local_dev"
$env:POSTGRES_DB = "health360_db"
$env:APP_BASE_URL = "http://localhost:5173"

Write-Host "Starting API on http://localhost:8080 ..."
Set-Location (Join-Path $repoRoot "backend\health360-api")
& $mvn spring-boot:run "-Dspring-boot.run.profiles=local"
