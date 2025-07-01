@echo off
title Travel Site Deployment
color 0a
echo ====================================
echo    TRAVEL SITE DEPLOYMENT SCRIPT
echo ====================================
echo.

:: Set base paths
set "PROJECT_ROOT=D:\(P) PENYIMPANAN UTAMA\Project\Express\travelsite-react-express"
set "NGINX_PATH=D:\(P) PENYIMPANAN UTAMA\Downloads\nginx-1.28.0"

:: Check if required directories exist
echo Checking required directories...
if not exist "%PROJECT_ROOT%\backend" (
    echo ERROR: Backend directory not found at %PROJECT_ROOT%\backend
    echo Please check if the path is correct.
    pause
    exit /b 1
)

if not exist "%PROJECT_ROOT%\frontend\build" (
    echo ERROR: Frontend build directory not found!
    echo Path checked: %PROJECT_ROOT%\frontend\build
    echo Please run 'build-frontend.bat' first to build the React app.
    pause
    exit /b 1
)

if not exist "%NGINX_PATH%\nginx.exe" (
    echo ERROR: Nginx not found at %NGINX_PATH%
    echo Please check if Nginx is installed at the correct location.
    pause
    exit /b 1
)

echo All directories found successfully!
echo.

echo [1/4] Checking Nginx configuration...
cd /d "%NGINX_PATH%"
nginx.exe -t 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Nginx configuration test failed or nginx.conf needs setup
    echo Continuing anyway... you may need to configure nginx.conf manually
) else (
    echo Nginx configuration is valid!
)
echo.

echo [2/4] Starting MongoDB (if using local MongoDB)...
:: Uncomment and modify the line below if using local MongoDB
:: net start MongoDB 2>nul
echo MongoDB check skipped (modify script if needed)
echo.

echo [3/4] Starting Express.js Backend...
cd /d "%PROJECT_ROOT%\backend"
if not exist "app.js" (
    if exist "server.js" (
        set "SERVER_FILE=server.js"
    ) else if exist "index.js" (
        set "SERVER_FILE=index.js"
    ) else (
        echo ERROR: No server file found (app.js, server.js, or index.js)
        pause
        exit /b 1
    )
) else (
    set "SERVER_FILE=app.js"
)

echo Starting backend server with %SERVER_FILE%...
start "Travel Site Backend API" cmd /k "echo Backend Server Starting... && echo Server File: %SERVER_FILE% && echo API URL: http://localhost:5000 && echo Health Check: http://localhost:5000/health && echo. && node %SERVER_FILE%"

echo Waiting for backend to initialize...
timeout /t 8 /nobreak
echo.

echo [4/4] Starting Nginx Web Server...
cd /d "%NGINX_PATH%"

:: Stop nginx if already running (ignore errors)
echo Stopping any existing Nginx processes...
nginx.exe -s stop >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start nginx
echo Starting Nginx...
start /min nginx.exe
if %errorlevel% == 0 (
    echo Nginx started successfully!
) else (
    echo Nginx command executed (check if running in background)
)

:: Wait a moment for nginx to start
timeout /t 3 /nobreak >nul
echo.

echo ====================================
echo      APPLICATION IS NOW RUNNING!
echo ====================================
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost:5000
echo Health Check: http://localhost:5000/health
echo Admin Dashboard: http://localhost/dashboard
echo.
echo Default Admin Credentials:
echo Username: admin
echo Password: 123 (check your .env file for actual credentials)
echo.
echo ====================================
echo.
echo Services Status:
echo - Backend: Check the backend window for status
echo - Nginx: Should be running on port 80
echo - Frontend: Served by Nginx from build folder
echo.
echo ====================================
echo Press any key to open the application...
pause >nul

:: Open browser
echo Opening application in browser...
start http://localhost
timeout /t 2 /nobreak >nul

echo.
echo Application opened in browser!
echo.
echo IMPORTANT: Keep this window open to maintain services.
echo Close this window or run 'stop-travelsite.bat' to stop all services.
echo.
echo Press any key to exit (this will NOT stop the services)...
pause >nul