param(
    [switch]$NoBuild = $false
)

$ErrorActionPreference = "SilentlyContinue"
$root = "C:\Users\user\Downloads\saham-bank-analytics-portal"

$frontendDir = Join-Path $root "frontend"
$backendDir  = Join-Path $root "backend"
$python      = Join-Path $backendDir "venv\Scripts\python.exe"
$node        = "C:\Program Files\nodejs\node.exe"
$npm         = "C:\Program Files\nodejs\npm.cmd"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Saham Bank Analytics Portal - Launch Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Build frontend if needed
if (-not $NoBuild) {
    Write-Host "[1/4] Building frontend..." -ForegroundColor Yellow
    Set-Location -LiteralPath $frontendDir
    & $npm run build 2>&1 | Out-String | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }
    Write-Host "  OK" -ForegroundColor Green
} else {
    Write-Host "[1/4] Skipping frontend build (-NoBuild)" -ForegroundColor Yellow
}

# 2. Start Backend API
Write-Host "[2/4] Starting Backend API on port 8000..." -ForegroundColor Yellow
$apiProcess = Start-Process -PassThru -FilePath $python -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory $backendDir
Start-Sleep -Seconds 5

$apiOk = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2
        Write-Host "  API: $($r.status)" -ForegroundColor Green
        $apiOk = $true
        break
    } catch { Start-Sleep -Seconds 1 }
}

if (-not $apiOk) { Write-Host "  API failed to start!" -ForegroundColor Red; exit 1 }

# 3. Start Frontend
Write-Host "[3/4] Starting Frontend on port 3000..." -ForegroundColor Yellow
$frontProcess = Start-Process -PassThru -FilePath $node -ArgumentList "server.cjs" -WorkingDirectory $frontendDir
Start-Sleep -Seconds 3

$frontOk = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { Write-Host "  Frontend: OK ($($r.Content.Length) bytes)" -ForegroundColor Green; $frontOk = $true; break }
    } catch { Start-Sleep -Seconds 1 }
}

# 4. Summary
Write-Host ""
Write-Host "[4/4] Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Status: API=$apiOk | Frontend=$frontOk"
Write-Host "  Frontend : http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs : http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Gold KPIs: http://localhost:8000/gold/kpis" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers."

# Keep alive
try {
    while ($true) { Start-Sleep -Seconds 10 }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    $apiProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    $frontProcess | Stop-Process -Force -ErrorAction SilentlyContinue
}
