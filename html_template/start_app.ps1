# Aureues Finance Dashboard - Quick Start Script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Aureues Finance Dashboard" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Set-Location -Path $PSScriptRoot

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Green
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Green
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Please ensure .env file exists with API credentials" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Green
$packages = @("flask", "flask-cors", "requests", "python-dotenv")
foreach ($package in $packages) {
    try {
        pip show $package 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $package is installed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Installing $package..." -ForegroundColor Yellow
            pip install $package
        }
    } catch {
        Write-Host "⚠️  Installing $package..." -ForegroundColor Yellow
        pip install $package
    }
}

# Run tests
Write-Host ""
Write-Host "Running integration tests..." -ForegroundColor Green
python test_integration.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  Starting Flask Server..." -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Server will be available at:" -ForegroundColor Green
    Write-Host "  http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    Set-Location -Path $PSScriptRoot
    # Start the Flask app
    python app.py
} else {
    Write-Host ""
    Write-Host "❌ Tests failed. Please check the error messages above." -ForegroundColor Red
    Write-Host "Fix the issues before starting the application." -ForegroundColor Yellow
    exit 1
}
