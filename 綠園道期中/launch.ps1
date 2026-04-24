$dir      = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontend = Join-Path $dir "index.html"
$admin    = Join-Path $dir "launch_admin.html"
$server   = Join-Path $dir "votes_server.py"
$surveyApp = Join-Path $dir "現場調查\app.py"

$running = $true
while ($running) {
    Clear-Host
    Write-Host ""
    Write-Host "  ======================================================" -ForegroundColor Green
    Write-Host "    台南綠園道民意分析平台  BOT 啟動系統" -ForegroundColor Green
    Write-Host "  ======================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  [1] 開啟 前台（民意看板）" -ForegroundColor Cyan
    Write-Host "  [2] 開啟 後台（管理面板）" -ForegroundColor Cyan
    Write-Host "  [3] 同時開啟前台 + 後台" -ForegroundColor Cyan
    Write-Host "  [4] 啟動 資料橋接伺服器（現場調查即時同步）" -ForegroundColor Yellow
    Write-Host "  [5] 啟動 現場調查投票系統（Streamlit 本機）" -ForegroundColor Magenta
    Write-Host "  [6] 全部啟動（前台+後台+橋接+投票）" -ForegroundColor Green
    Write-Host "  [7] 離開" -ForegroundColor DarkGray
    Write-Host ""
    $choice = Read-Host "  輸入選項 (1-7)"

    if ($choice -eq "1") {
        Start-Process $frontend
        Write-Host "  前台已開啟！" -ForegroundColor Green
        Start-Sleep -Seconds 1

    } elseif ($choice -eq "2") {
        Start-Process $admin
        Write-Host "  後台已開啟！帳號 admin / 密碼 1234" -ForegroundColor Green
        Start-Sleep -Seconds 1

    } elseif ($choice -eq "3") {
        Start-Process $frontend
        Start-Sleep -Milliseconds 600
        Start-Process $admin
        Write-Host "  前台 + 後台均已開啟！" -ForegroundColor Green
        Start-Sleep -Seconds 1

    } elseif ($choice -eq "4") {
        Write-Host "  啟動資料橋接伺服器（port 8765）..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "python `"$server`""
        Write-Host "  資料橋接伺服器已啟動！現場調查資料將每30秒同步到分析網站。" -ForegroundColor Green
        Start-Sleep -Seconds 2

    } elseif ($choice -eq "5") {
        Write-Host "  啟動 Streamlit 現場調查投票系統..." -ForegroundColor Magenta
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "streamlit run `"$surveyApp`""
        Start-Sleep -Seconds 3
        Start-Process "http://localhost:8501"
        Write-Host "  Streamlit 已啟動！" -ForegroundColor Green
        Start-Sleep -Seconds 1

    } elseif ($choice -eq "6") {
        Write-Host "  啟動全部服務..." -ForegroundColor Green
        # 資料橋接伺服器
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "python `"$server`""
        Start-Sleep -Milliseconds 500
        # Streamlit
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "streamlit run `"$surveyApp`""
        Start-Sleep -Seconds 2
        # 前台
        Start-Process $frontend
        Start-Sleep -Milliseconds 800
        # 後台
        Start-Process $admin
        Write-Host "  全部服務已啟動！" -ForegroundColor Green
        Write-Host "  資料橋接: http://localhost:8765/votes" -ForegroundColor DarkGray
        Write-Host "  投票系統: http://localhost:8501" -ForegroundColor DarkGray
        Start-Sleep -Seconds 2

    } elseif ($choice -eq "7") {
        $running = $false
    } else {
        Write-Host "  請輸入 1~7！" -ForegroundColor Red
        Start-Sleep -Seconds 1
    }
}
