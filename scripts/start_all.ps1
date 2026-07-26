$ErrorActionPreference = "SilentlyContinue"
$root = "C:\Users\user\Downloads\saham-bank-analytics-portal"
$backend = Join-Path $root "saham-bank-backend"
$python = Join-Path $backend "venv\Scripts\python.exe"

# Kill old processes
taskkill /F /IM python.exe 2>$null
Start-Sleep -Seconds 2

Write-Host "=== Starting Saham Bank Analytics Portal ==="
Write-Host ""

# Start Backend API
Write-Host "[1] Starting Backend API on port 8000..."
$p = Start-Process -PassThru -NoNewWindow -FilePath $python -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WorkingDirectory $backend
Start-Sleep -Seconds 5

# Test API
$apiOk = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $r = Invoke-RestMethod -Uri "http://localhost:8000/health" -UseBasicParsing
        Write-Host "   API: $($r.status)"
        $apiOk = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}

# Start Frontend
Write-Host "[2] Starting Frontend on port 3000..."
$p2 = Start-Process -PassThru -NoNewWindow -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "server.cjs" -WorkingDirectory $root
Start-Sleep -Seconds 3

$frontOk = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            Write-Host "   Frontend: OK ($($r.Content.Length) bytes)"
            $frontOk = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Status: API=$apiOk | Frontend=$frontOk"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8000"
Write-Host "  Docs:     http://localhost:8000/docs"
Write-Host "========================================"
Write-Host ""
Write-Host "Running. Press Ctrl+C to stop."

while ($true) {
    Start-Sleep -Seconds 30
    # Keep alive
}
