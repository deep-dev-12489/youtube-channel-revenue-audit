@echo off
title TubePulse - YouTube Analytics Studio (Windows Launcher)
color 0A

echo ================================================================
echo        TubePulse - YouTube Channel & Competitor Analytics
echo                  [ Windows Environment Launcher ]
echo ================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please download and install Node.js (v18 or higher) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js environment detected:
node -v
echo.

:: 2. Check and copy .env.local if not present
if not exist ".env.local" (
    echo [2/3] Setting up local environment (.env.local)...
    if exist ".env.windows.example" (
        copy ".env.windows.example" ".env.local" >nul
    ) else if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
    )
    echo       Created .env.local from template.
) else (
    echo [2/3] Environment file .env.local already configured.
)
echo.

:: 3. Check node_modules
if not exist "node_modules\" (
    echo [3/3] Installing dependencies (this may take a minute)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] npm install failed. Please check your network connection.
        pause
        exit /b 1
    )
) else (
    echo [3/3] Dependencies verified.
)

echo.
echo ================================================================
echo  Starting Next.js Server on http://localhost:3000 ...
echo  Press Ctrl+C to stop the server at any time.
echo ================================================================
echo.

start "" http://localhost:3000
npm run dev
