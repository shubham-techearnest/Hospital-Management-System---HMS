@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0doctor-mobile.ps1"
exit /b %ERRORLEVEL%
