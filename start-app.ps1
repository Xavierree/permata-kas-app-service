# Windows PowerShell Startup Script for WA-Generator

$ErrorActionPreference = "Stop"
$ProjectDir = Get-Location
$EnvFile = "$ProjectDir\.env"
$CredentialsFile = "Kas-Permata-App.json"

Write-Host "🚀 Starting WA-Generator..." -ForegroundColor Cyan

# Check dependencies
if (-not (Test-Path "$ProjectDir\node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Setup Environment
if (-not (Test-Path $EnvFile)) {
    Write-Host "⚠️  .env file not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "$ProjectDir\.env.example" $EnvFile
    
    # Auto-configure credentials if found
    if (Test-Path "$ProjectDir\$CredentialsFile") {
        Write-Host "🔑 Found credentials file: $CredentialsFile. Configuring .env..." -ForegroundColor Green
        (Get-Content $EnvFile) -replace "GOOGLE_APPLICATION_CREDENTIALS=.*", "GOOGLE_APPLICATION_CREDENTIALS=./$CredentialsFile" | Set-Content $EnvFile
    }
} else {
    Write-Host "✅ Environment file found." -ForegroundColor Green
}

# Check for Google Sheet ID placeholder
$EnvContent = Get-Content $EnvFile
if ($EnvContent -match "your_google_sheet_id") {
    Write-Host "--------------------------------------------------------" -ForegroundColor Red
    Write-Host "⚠️  WARNING: Google Sheet ID is not set in .env." -ForegroundColor Yellow
    Write-Host "Please open '$EnvFile' and set GOOGLE_SHEETS_ID." -ForegroundColor Yellow
    Write-Host "Running with MOCK DATA support enabled as fallback." -ForegroundColor Cyan
    Write-Host "--------------------------------------------------------" -ForegroundColor Red
    $env:USE_MOCK_DATA = "true"
} else {
    $env:USE_MOCK_DATA = "false"
}

# Start Application
Write-Host "✨ Launching Server..." -ForegroundColor Cyan
npm start
