# Regenerate Health360 Final Brochure PDFs via Microsoft Edge (headless).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pdfDir = Join-Path $root "pdf"
New-Item -ItemType Directory -Force -Path $pdfDir | Out-Null

$edge = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $edge) { throw "Microsoft Edge not found." }

$html = (Resolve-Path (Join-Path $root "health360-brochure-final.html")).Path
function To-FileUri([string]$path, [string]$query) {
  $u = "file:///" + ($path -replace "\\", "/")
  if ($query) { $u += $query }
  return $u
}

function Export-Pdf([string]$query, [string]$outName) {
  $out = Join-Path $pdfDir $outName
  if (Test-Path $out) { Remove-Item $out -Force }
  $uri = To-FileUri $html $query
  $userData = Join-Path $env:TEMP ("edge-brochure-pdf-" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $userData | Out-Null
  Write-Host "Exporting $outName"
  Write-Host "  URL: $uri"
  $args = @(
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--allow-file-access-from-files",
    "--user-data-dir=$userData",
    "--no-pdf-header-footer",
    "--print-to-pdf=$out",
    $uri
  )
  $p = Start-Process -FilePath $edge -ArgumentList $args -PassThru -WindowStyle Hidden
  $ok = $p.WaitForExit(120000)
  if (-not $ok) {
    try { $p.Kill() } catch {}
    throw "Edge timed out exporting $outName"
  }
  # Edge sometimes returns before flush
  $deadline = (Get-Date).AddSeconds(20)
  while (-not (Test-Path $out) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 400 }
  Remove-Item $userData -Recurse -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $out)) { throw "Failed to create $out (exit $($p.ExitCode))" }
  Write-Host "  OK $([math]::Round((Get-Item $out).Length/1KB,1)) KB"
}

Export-Pdf "" "01-Health360-Brochure-Final-Full-A4.pdf"
Export-Pdf "?capture=outside" "02-Health360-Brochure-Final-Outside-A4.pdf"
Export-Pdf "?capture=inside" "03-Health360-Brochure-Final-Inside-A4.pdf"

Write-Host "Done. PDFs are in: $pdfDir"
Get-ChildItem $pdfDir | Format-Table Name, Length -AutoSize
