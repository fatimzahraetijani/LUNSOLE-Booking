@echo off
title LUNSOLE Booking — Dev Server
color 0A

echo.
echo  ==========================================
echo   LUNSOLE BOOKING — Starting Dev Servers
echo   Created by Fatim Zahrae Tijani
echo  ==========================================
echo.

echo  [1/2] Starting Backend (Node.js on port 5000)...
start "LUNSOLE Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 2 /nobreak >nul

echo  [2/2] Starting Frontend (Vite on port 5173)...
start "LUNSOLE Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  Both servers are starting in separate windows.
echo  Backend  → http://localhost:5000
echo  Frontend → http://localhost:5173
echo.
pause
