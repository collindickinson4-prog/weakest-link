@echo off
title The Weakest Link
cd /d "%~dp0"

if not exist node_modules (
  echo ============================================
  echo  First-time setup: installing dependencies.
  echo  This only happens once and may take a minute.
  echo ============================================
  call npm install
)

echo.
echo ============================================
echo  Starting The Weakest Link...
echo  Your browser will open automatically.
echo  Press F11 in the browser for fullscreen on the TV.
echo  Keep this window open while you play. Close it to quit.
echo ============================================
echo.

call npm run dev
pause
