@echo off
title Saham Bank - Serveur & Tunnel Cloudflare
echo ===================================================================
echo   SAHAM BANK ANALYTICS - DEMARRAGE DU SERVEUR ET DU TUNNEL
echo ===================================================================
echo.
echo 1. Lancement de l'API FastAPI connectee a Neon Cloud...
start "Saham API Backend" powershell -NoExit -Command "$env:DATABASE_URL='postgresql://neondb_owner:npg_rLhnzU7GtKe1@ep-misty-moon-b1rekr93-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require'; $env:SECRET_KEY='saham-secret-key-prod-2026-super-secure'; $env:LLM_PROVIDER='mock'; $env:CORS_ORIGINS='*'; cd backend; uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo 2. Lancement du tunnel HTTPS Cloudflare...
timeout /t 3 /nobreak >nul
start "Cloudflare Tunnel" powershell -NoExit -Command ".\cloudflared.exe tunnel --protocol http2 --url http://127.0.0.1:8000"

echo.
echo ===================================================================
echo   TOUT EST ACTIF !
echo   Votre portail en ligne est accessible sur :
echo   https://poc-shm.vercel.app/
echo.
echo   (Gardez ces fenetres ouvertes pendant vos demonstrations)
echo ===================================================================
pause
