# Ensure PostgreSQL is listening on localhost:5432 for local API development.
# Usage: .\scripts\start-postgres.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

function Test-PostgresPort {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", 5432)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

if (Test-PostgresPort) {
    Write-Host "PostgreSQL already listening on localhost:5432"
    exit 0
}

Write-Host "PostgreSQL not reachable on localhost:5432 - attempting to start..."

# Option 1: Docker Compose (preferred when Docker Desktop is running)
$dockerExe = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerExe) {
    $dockerOk = $false
    try {
        docker info *> $null
        $dockerOk = ($LASTEXITCODE -eq 0)
    } catch {
        $dockerOk = $false
    }
    if ($dockerOk) {
        Write-Host "Starting postgres container via Docker Compose..."
        Push-Location (Join-Path $repoRoot "docker")
        docker compose up -d postgres
        Pop-Location
        Start-Sleep -Seconds 8
        if (Test-PostgresPort) {
            Write-Host "PostgreSQL ready (Docker container health360-postgres)"
            exit 0
        }
    } else {
        Write-Host "Docker CLI found but engine is not running."
        $dockerDesktop = "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
        if (Test-Path $dockerDesktop) {
            Write-Host "Launching Docker Desktop - wait until it shows Engine running, then re-run this script."
            Start-Process $dockerDesktop
        }
    }
}

# Option 2: Windows PostgreSQL 16 service (requires Administrator once)
$pgService = Get-Service -Name "postgresql-x64-16" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -ne "Running") {
    Write-Host "Attempting to start Windows service postgresql-x64-16 (UAC prompt may appear)..."
    Start-Process powershell -Verb RunAs -Wait -ArgumentList "-NoProfile -Command net start postgresql-x64-16"
    Start-Sleep -Seconds 5
    if (Test-PostgresPort) {
        Write-Host "PostgreSQL ready (Windows service postgresql-x64-16)"
        exit 0
    }
}

Write-Host ""
Write-Host "Could not start PostgreSQL automatically. Choose one:" -ForegroundColor Yellow
Write-Host "  A) Docker: Open Docker Desktop, wait until running, then:"
Write-Host "     cd docker; docker compose up -d postgres"
Write-Host "  B) Local install: Open PowerShell as Administrator and run:"
Write-Host "     net start postgresql-x64-16"
Write-Host "     (First time only: .\scripts\setup-local-db.ps1 -PostgresPassword YOUR_POSTGRES_PASSWORD)"
exit 1
