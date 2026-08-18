@echo off
setlocal EnableExtensions

for /F %%a in ('echo prompt $E^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[1;32m"
set "YELLOW=%ESC%[1;33m"
set "CYAN=%ESC%[1;36m"
set "RED=%ESC%[1;31m"
set "RESET=%ESC%[0m"

cd /d "%~dp0..\customer"

echo %CYAN%=== CUSTOMER ===%RESET%

if not exist "node_modules" (
    echo %YELLOW%⚠ node_modules not found. Installing dependencies for CUSTOMER...%RESET%
    call npm install
    if errorlevel 1 (
        echo %RED%✖ CUSTOMER npm install failed.%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%✔ CUSTOMER dependencies installed.%RESET%
) else (
    echo %GREEN%✔ CUSTOMER dependencies already present.%RESET%
)

echo %CYAN%▶ Starting CUSTOMER (npm run dev)...%RESET%
call npm run dev

echo %RED%CUSTOMER process exited.%RESET%
pause
