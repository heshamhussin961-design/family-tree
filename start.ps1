# ============================================================
#  شجرة العيلة — Start Script
#  شغّل backend + frontend بأمر واحد
# ============================================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  شجرة العيلة — Launching..." -ForegroundColor Green  
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# ── Start Backend ──────────────────────────────────────────
Write-Host "[1/2] Starting Backend on http://localhost:8080 ..." -ForegroundColor Cyan
$backend = Start-Process -FilePath "python" `
    -ArgumentList "-m", "uvicorn", "main:app", "--reload", "--port", "8080" `
    -WorkingDirectory "$ROOT\backend" `
    -PassThru `
    -WindowStyle Normal

Start-Sleep -Seconds 2

if ($backend.HasExited) {
    Write-Host "[ERROR] Backend failed to start!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Backend running (PID $($backend.Id))" -ForegroundColor Green

# ── Start Frontend ─────────────────────────────────────────
Write-Host ""
Write-Host "[2/2] Starting Frontend on http://localhost:5173 ..." -ForegroundColor Cyan
$frontend = Start-Process -FilePath "npm" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory "$ROOT\frontend" `
    -PassThru `
    -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[OK] Frontend running (PID $($frontend.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Backend  → http://localhost:8080" -ForegroundColor White
Write-Host "  Frontend → http://localhost:5173" -ForegroundColor White
Write-Host "  API Docs → http://localhost:8080/docs" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press ENTER to stop both servers..." -ForegroundColor Yellow
Read-Host

# ── Cleanup ────────────────────────────────────────────────
Write-Host "Stopping servers..." -ForegroundColor Red
Stop-Process -Id $backend.Id  -ErrorAction SilentlyContinue
Stop-Process -Id $frontend.Id -ErrorAction SilentlyContinue
Write-Host "Done." -ForegroundColor Green
