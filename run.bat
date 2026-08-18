@echo off
:: run.bat - Lives in project root. Launches backend and frontend dev servers,
:: each in its own CMD window, via scripts/run-backend.bat and scripts/run-frontend.bat.

setlocal EnableExtensions

reg add "HKCU\Console" /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

set ROOT_DIR=%~dp0
set SCRIPTS_DIR=%ROOT_DIR%scripts\
set ADMIN_DIR=%ADMIN_DIR%admin
set CUSTOMER_DIR=%ROOT_DIR%customer
set BACKEND_DIR=%ROOT_DIR%backend

echo(
echo ============================================
echo    Starting Dev Environment Launcher
echo ============================================
echo(

if not exist "%BACKEND_DIR%" (
    echo [ERROR] backend directory not found at: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%CUSTOMER_DIR%" (
    echo [ERROR] frontend directory not found at: %CUSTOMER_DIR%
    pause
    exit /b 1
)

if not exist "%ADMIN_DIR%" (
    echo [ERROR] frontend directory not found at: %ADMIN_DIR%
    pause
    exit /b 1
)

if not exist "%SCRIPTS_DIR%run-backend.bat" (
    echo [ERROR] scripts\run-backend.bat not found.
    pause
    exit /b 1
)

if not exist "%SCRIPTS_DIR%run-admin.bat" (
    echo [ERROR] scripts\run-admin.bat not found.
    pause
    exit /b 1
)

if not exist "%SCRIPTS_DIR%run-customer.bat" (
    echo [ERROR] scripts\run-customer.bat not found.
    pause
    exit /b 1
)

echo Launching BACKEND terminal...
start "BACKEND" cmd /k "%SCRIPTS_DIR%run-backend.bat"

timeout /t 1 /nobreak >nul

echo Launching ADMIN terminal...
start "ADMIN" cmd /k "%SCRIPTS_DIR%run-admin.bat"

echo Launching CUSTOMER terminal...
start "CUSTOMER" cmd /k "%SCRIPTS_DIR%run-customer.bat"

echo(
echo Both terminals launched. Check the new windows for logs.
exit /b 0
