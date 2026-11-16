<#
.SYNOPSIS
    TubePulse Windows PowerShell Environment Launcher
#>

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       TubePulse - YouTube Channel & Competitor Analytics       " -ForegroundColor Yellow
Write-Host "                 [ Windows PowerShell Setup ]                   " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node -v
Write-Host "[1/3] Node.js detected: $nodeVersion" -ForegroundColor Green

# 2. Setup .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "[2/3] Initializing local environment (.env.local)..." -ForegroundColor Yellow
    if (Test-Path ".env.windows.example") {
        Copy-Item ".env.windows.example" ".env.local"
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
    }
    Write-Host "      Created .env.local from Windows template." -ForegroundColor Green
} else {
    Write-Host "[2/3] Local environment (.env.local) found." -ForegroundColor Green
}

# 3. Check node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[3/3] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] npm install encountered an error." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[3/3] Dependencies already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Launching server on http://localhost:3000 ..." -ForegroundColor Green
Write-Host " Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process "http://localhost:3000"
npm run dev
