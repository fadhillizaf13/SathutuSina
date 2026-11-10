@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Install Node.js LTS first. & pause & exit /b 1)
if not exist "node_modules" (
  echo Installing frontend dependencies (internet needed on first run)...
  call npm install
  if errorlevel 1 (echo npm install failed. Check your internet connection. & pause & exit /b 1)
)
echo Starting Sathutu Sina in frontend preview mode.
echo Check frontend/.env contains REACT_APP_DEMO_MODE=true.
call npm start
pause
