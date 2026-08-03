# Bootstrap Health360 local PostgreSQL user and database.
# Usage: .\scripts\setup-local-db.ps1 -PostgresPassword "your-postgres-superuser-password"

param(
    [Parameter(Mandatory = $true)]
    [string]$PostgresPassword
)

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$sqlFile = Join-Path $PSScriptRoot "init-local-db.sql"

if (-not (Test-Path $psql)) {
    Write-Error "PostgreSQL 16 not found at $psql. Install PostgreSQL.PostgreSQL.16 via winget."
}

$env:PGPASSWORD = $PostgresPassword
& $psql -U postgres -h localhost -d postgres -f $sqlFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "Database setup failed. Check the postgres superuser password."
}
Write-Host "Local database ready: health360_db (user: health360)"
