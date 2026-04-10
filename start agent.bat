@echo off
title 建築法規 AI 系統伺服器 (Building Code Agent)

echo ====================================================
echo   正在啟動【建築法規 AI 權重分析系統】...
echo   伺服器啟動後將會自動開啟瀏覽器！
echo   (請勿關閉此黑盒子視窗，否則網頁會失效)
echo ====================================================

:: 1. 檢查是否在正確的目錄
if not exist "%~dp0app\package.json" (
    echo [錯誤] 找不到 app 資料夾或 package.json！
    echo 所在的目錄是: %~dp0
    echo 請確保您是在專案根目錄執行此檔案。
    pause
    exit /b
)

:: 2. 切換到 app 目錄
cd /d "%~dp0app"

:: 3. 檢查 node_modules 是否存在，若不存在則嘗試安裝
if not exist "node_modules\" (
    echo [提示] 偵測到尚未安裝依賴項，正在執行 npm install...
    call npm install
)

:: 4. 啟動伺服器
echo [資訊] 正在啟動 Vite 伺服器 (Port: 9000)...
call npm run dev -- --open

if %ERRORLEVEL% neq 0 (
    echo.
    echo [錯誤] 伺服器啟動失敗！
    echo 可能是因為 9000 端口被佔用，或者 Node.js 環境有問題。
    pause
)
