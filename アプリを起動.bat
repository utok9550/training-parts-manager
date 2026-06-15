@echo off
setlocal
cd /d "%~dp0"

set "NPM_CMD=npm.cmd"

where node >nul 2>&1
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
  ) else (
    echo Node.js was not found.
    echo Restart Windows and run this file again.
    pause
    exit /b 1
  )
)

if not exist node_modules (
  echo Installing dependencies for the first launch...
  call "%NPM_CMD%" install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo Starting the app at http://localhost:5173
start "" cmd /c "timeout /t 2 /nobreak >nul && start "" http://localhost:5173"
call "%NPM_CMD%" run dev -- --host 0.0.0.0

echo The app has stopped.
pause
