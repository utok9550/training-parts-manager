@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=node.exe"

where node >nul 2>&1
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
  ) else (
    echo Node.js was not found.
    echo Restart Windows and run this file again.
    pause
    exit /b 1
  )
)

if not exist "node_modules\vite\bin\vite.js" (
  echo App dependencies were not found.
  echo Please contact the app developer.
  pause
  exit /b 1
)

echo Starting the app at http://localhost:5173
start "" cmd /c "timeout /t 2 /nobreak >nul && start "" http://localhost:5173"
"%NODE_EXE%" "node_modules\vite\bin\vite.js" --host 0.0.0.0

echo The app has stopped.
pause
