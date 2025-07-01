@echo off
title Stop Travel Site Services
color 0c
echo ====================================
echo   STOPPING TRAVEL SITE SERVICES
echo ====================================
echo.

set "NGINX_PATH=D:\(P) PENYIMPANAN UTAMA\Downloads\nginx-1.28.0"

echo [1/3] Stopping Nginx Web Server...
cd /d "%NGINX_PATH%"
nginx.exe -s stop 2>nul
if %errorlevel% == 0 (
    echo Nginx stopped successfully!
) else (
    echo Nginx was not running or failed to stop gracefully.
    echo Trying to kill nginx processes...
    taskkill /f /im nginx.exe >nul 2>&1
    if %errorlevel% == 0 (
        echo Nginx processes terminated.
    ) else (
        echo No Nginx processes found.
    )
)
echo.

echo [2/3] Stopping Express.js Backend...
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo Node.js processes stopped successfully!
) else (
    echo No Node.js processes found.
)
echo.

echo [3/3] Cleaning up related processes...
:: Kill specific window titles
taskkill /fi "WINDOWTITLE eq Travel Site Backend API" /f >nul 2>&1

:: Kill any remaining processes that might be related
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Travel Site Backend API" >nul 2>&1

echo Process cleanup completed.
echo.

echo ====================================
echo    ALL SERVICES STOPPED SUCCESSFULLY
echo ====================================
echo.
echo All travel site services have been stopped:
echo ✓ Nginx Web Server
echo ✓ Express.js Backend
echo ✓ Related processes cleaned up
echo.
echo You can now safely close this window.
echo.
pause