# Health360 M1 Acceptance Test Script (PowerShell)
# Run after backend is up on :8080

$ErrorActionPreference = "Stop"
$base = "http://localhost:8080/api/v1"
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "accept.$ts@test.health360"
$password = "SecureP@ss1"

function Invoke-Api {
    param($Method, $Url, $Body = $null, $Token = $null)
    $args = @("-s", "-w", "`nHTTP:%{http_code}", "-X", $Method, $Url, "-H", "Content-Type: application/json")
    if ($Token) { $args += @("-H", "Authorization: Bearer $Token") }
    if ($Body) {
        $path = "$env:TEMP\h360-body.json"
        $Body | Set-Content -Path $path -NoNewline
        $args += @("-d", "@$path")
    }
    $raw = curl.exe @args
    $parts = $raw -split "`nHTTP:"
    return @{ Body = $parts[0]; Status = $parts[-1].Trim() }
}

Write-Host "`n=== 1. REGISTER ===" -ForegroundColor Cyan
$reg = Invoke-Api POST "$base/auth/register" (@{
    email=$email; password=$password; confirmPassword=$password
    firstName="Accept"; lastName="Test"; phone="9876543210"
    role="PATIENT"; acceptTerms=$true
} | ConvertTo-Json -Compress)
Write-Host "Status: $($reg.Status)"
if ($reg.Status -ne "201") { Write-Host $reg.Body; exit 1 }

Write-Host "`n=== 2. VERIFY (check backend log for token, then set `$verifyToken) ===" -ForegroundColor Cyan
Write-Host "Email: $email - copy token from backend VERIFICATION EMAIL log"
$verifyToken = Read-Host "Paste verification token"
$ver = Invoke-Api GET "$base/auth/verify-email?token=$([uri]::EscapeDataString($verifyToken))"
Write-Host "Status: $($ver.Status)"
if ($ver.Status -ne "200") { Write-Host $ver.Body; exit 1 }

Write-Host "`n=== 3. LOGIN ===" -ForegroundColor Cyan
$login = Invoke-Api POST "$base/auth/login" (@{email=$email; password=$password; deviceInfo="acceptance"} | ConvertTo-Json -Compress)
Write-Host "Status: $($login.Status)"
$loginJson = $login.Body | ConvertFrom-Json
if ($login.Status -ne "200") { Write-Host $login.Body; exit 1 }
$access = $loginJson.data.accessToken
$refresh = $loginJson.data.refreshToken

Write-Host "`n=== 4. GET PROFILE ===" -ForegroundColor Cyan
$me = Invoke-Api GET "$base/users/me" -Token $access
Write-Host "Status: $($me.Status)"
if ($me.Status -ne "200") { Write-Host $me.Body; exit 1 }

Write-Host "`n=== 5. PATCH PROFILE ===" -ForegroundColor Cyan
$patch = Invoke-Api PATCH "$base/users/me" (@{lastName="Updated"} | ConvertTo-Json -Compress) -Token $access
Write-Host "Status: $($patch.Status)"
if ($patch.Status -ne "200") { Write-Host $patch.Body; exit 1 }

Write-Host "`n=== 6. NOTIFICATION PREFS ===" -ForegroundColor Cyan
$notif = Invoke-Api GET "$base/users/me/notification-preferences" -Token $access
Write-Host "Status: $($notif.Status)"
if ($notif.Status -ne "200") { Write-Host $notif.Body; exit 1 }

Write-Host "`n=== 7. REFRESH TOKEN ===" -ForegroundColor Cyan
$ref = Invoke-Api POST "$base/auth/refresh" (@{refreshToken=$refresh} | ConvertTo-Json -Compress)
Write-Host "Status: $($ref.Status)"
$refJson = $ref.Body | ConvertFrom-Json
if ($ref.Status -ne "200") { Write-Host $ref.Body; exit 1 }
$access = $refJson.data.accessToken

Write-Host "`n=== 8. CHANGE PASSWORD ===" -ForegroundColor Cyan
$pwd = Invoke-Api PUT "$base/auth/password" (@{
    currentPassword=$password; newPassword="SecureP@ss2"; confirmPassword="SecureP@ss2"
} | ConvertTo-Json -Compress) -Token $access
Write-Host "Status: $($pwd.Status)"
if ($pwd.Status -ne "200") { Write-Host $pwd.Body; exit 1 }
$password = "SecureP@ss2"

Write-Host "`n=== 9. RE-LOGIN ===" -ForegroundColor Cyan
$login2 = Invoke-Api POST "$base/auth/login" (@{email=$email; password=$password; deviceInfo="acceptance"} | ConvertTo-Json -Compress)
Write-Host "Status: $($login2.Status)"
$login2Json = $login2.Body | ConvertFrom-Json
$access = $login2Json.data.accessToken
$refresh = $login2Json.data.refreshToken

Write-Host "`n=== 10. RBAC ===" -ForegroundColor Cyan
$rbacOk = Invoke-Api GET "$base/rbac/patient-profile" -Token $access
$rbacDeny = Invoke-Api GET "$base/rbac/admin-users" -Token $access
Write-Host "Patient probe: $($rbacOk.Status) (expect 200)"
Write-Host "Admin probe: $($rbacDeny.Status) (expect 403)"

Write-Host "`n=== 11. LOGOUT ===" -ForegroundColor Cyan
$logout = curl.exe -s -w "`nHTTP:%{http_code}" -X POST "$base/auth/logout" -H "Authorization: Bearer $access" -H "X-Refresh-Token: $refresh"
Write-Host $logout

Write-Host "`n=== 12. EXISTING USER LOGIN ===" -ForegroundColor Cyan
$existing = Invoke-Api POST "$base/auth/login" (@{email="s2test@health360.test"; password="SecureP@ss1"; deviceInfo="acceptance"} | ConvertTo-Json -Compress)
Write-Host "s2test Status: $($existing.Status)"

Write-Host "`n=== 13. INVALID TOKEN (expect 401) ===" -ForegroundColor Cyan
$bad = Invoke-Api GET "$base/users/me" -Token "invalid.token.value"
Write-Host "Status: $($bad.Status) (expect 401)"

Write-Host "`nAll automated checks complete." -ForegroundColor Green
