@echo off
title Build Frontend for Production
color 0b
echo ====================================
echo   BUILDING FRONTEND FOR PRODUCTION
echo ====================================
echo.

set "PROJECT_ROOT=D:\(P) PENYIMPANAN UTAMA\Project\Express\travelsite-react-express"
set "FRONTEND_PATH=%PROJECT_ROOT%\frontend"

:: Navigate to frontend directory
echo Navigating to frontend directory...
cd /d "%FRONTEND_PATH%"

if not exist "package.json" (
    echo ERROR: package.json not found in frontend directory!
    echo Expected path: %FRONTEND_PATH%
    echo Current directory: %cd%
    echo.
    echo Please check if:
    echo 1. The project path is correct
    echo 2. You have a React frontend in the frontend folder
    echo 3. The package.json file exists
    echo.
    pause
    exit /b 1
)

echo ✓ Found package.json
echo Current directory: %cd%
echo.

echo [1/3] Installing/Updating dependencies...
echo This may take a few minutes for the first time...
npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Clear npm cache: npm cache clean --force
    echo 3. Delete node_modules folder and try again
    echo 4. Check if Node.js and npm are properly installed
    echo.
    pause
    exit /b 1
)
echo ✓ Dependencies installed successfully!
echo.

echo [2/3] Building React application for production...
echo This may take a few minutes...
echo.
npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    echo.
    echo Common solutions:
    echo 1. Fix any syntax errors in your React code
    echo 2. Check for missing dependencies
    echo 3. Ensure all imports are correct
    echo 4. Check the console output above for specific errors
    echo.
    pause
    exit /b 1
)
echo.

echo [3/3] Verifying build...
if exist "build\index.html" (
    echo ✓ Build completed successfully!
    echo ✓ Build files are ready in the 'build' directory
    
    :: Show build folder contents
    echo.
    echo Build folder contents:
    dir build /w
) else (
    echo ERROR: Build directory or index.html not found!
    echo Expected: %cd%\build\index.html
    echo.
    if exist "build" (
        echo Build folder exists but index.html is missing.
        echo Build folder contents:
        dir build
    ) else (
        echo Build folder was not created.
    )
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo     FRONTEND BUILD COMPLETED!
echo ====================================
echo.
echo Build location: %cd%\build
echo Build size: 
for /f %%i in ('dir build /s /-c ^| find "File(s)"') do echo %%i
echo.
echo The frontend is now ready for production deployment.
echo Next steps:
echo 1. Run 'start-travelsite.bat' to start the application
echo 2. Or configure your web server to serve from the build folder
echo.
echo ====================================
echo Press any key to continue...
pause >nul