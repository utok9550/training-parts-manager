@echo off
chcp 65001 > nul
cd /d "%~dp0"

where node > nul 2>&1
if errorlevel 1 (
  echo Node.js が見つかりません。
  echo PCを再起動してから、もう一度このファイルを実行してください。
  pause
  exit /b 1
)

if not exist node_modules (
  echo 初回起動の準備をしています...
  call npm install
  if errorlevel 1 (
    echo 依存関係のインストールに失敗しました。
    pause
    exit /b 1
  )
)

start "" http://localhost:5173
echo アプリを起動しています。この画面は閉じずに使用してください。
call npm run dev -- --host 0.0.0.0
