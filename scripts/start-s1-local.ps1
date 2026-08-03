# Start Health360 S1 locally (Windows PowerShell)
# Prerequisites: Java 21, Maven, PostgreSQL 16 with health360_db created

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
$mavenHome = "C:\Users\ParmeshwarSuryawansh\tools\apache-maven-3.9.6"
$env:PATH = "$env:JAVA_HOME\bin;$mavenHome\bin;$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:POSTGRES_USER = "health360"
$env:POSTGRES_PASSWORD = "health360_local_dev"
$env:APP_BASE_URL = "http://localhost:5173"

Write-Host "Starting backend on http://localhost:8080 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$env:JAVA_HOME = '$env:JAVA_HOME'
`$env:PATH = '$env:JAVA_HOME\bin;C:\Users\ParmeshwarSuryawansh\tools\apache-maven-3.9.6\bin;' + `$env:PATH
`$env:SPRING_PROFILES_ACTIVE = 'local'
`$env:POSTGRES_USER = 'health360'
`$env:POSTGRES_PASSWORD = 'health360_local_dev'
Set-Location '$repoRoot\backend\health360-api'
mvn spring-boot:run -DskipTests
"@

Write-Host "Starting frontend on http://localhost:5173 ..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Set-Location '$repoRoot\frontend\health360-web'
npm run dev
"@

Write-Host "Done. After DB setup, test: curl http://localhost:8080/api/v1/health"
