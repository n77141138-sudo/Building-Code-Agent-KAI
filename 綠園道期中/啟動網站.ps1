# 台南綠園道民意分析平台 - 啟動腳本
$dir      = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontend = Join-Path $dir "index.html"
$admin    = Join-Path $dir "launch_admin.html"

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "  ======================================================" -ForegroundColor Green
    Write-Host "    台南綠園道民意分析平台  BOT 啟動系統" -ForegroundColor Green
    Write-Host "  ======================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  路徑：$dir" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  [1] 開啟 前台（民意看板）" -ForegroundColor Cyan
    Write-Host "  [2] 開啟 後台（管理面板）" -ForegroundColor Cyan
    Write-Host "  [3] 同時開啟前台 + 後台" -ForegroundColor Cyan
    Write-Host "  [4] 離開" -ForegroundColor Cyan
    Write-Host ""
}

$running = $true
while ($running) {
    Show-Menu
    $choice = Read-Host "  輸入選項 (1/2/3/4)"

    if ($choice -eq "1") {
        Write-Host "  [BOT] 正在啟動前台看板..." -ForegroundColor Yellow
        Start-Process $frontend
        Write-Host "  [BOT] 前台已在瀏覽器開啟！" -ForegroundColor Green
        Read-Host "  按 Enter 回選單"
    }
    elseif ($choice -eq "2") {
        Write-Host "  [BOT] 正在啟動後台管理面板..." -ForegroundColor Yellow
        Start-Process $admin
        Write-Host "  [BOT] 後台已開啟！（帳號：admin / 密碼：1234）" -ForegroundColor Green
        Read-Host "  按 Enter 回選單"
    }
    elseif ($choice -eq "3") {
        Write-Host "  [BOT] 啟動前台..." -ForegroundColor Yellow
        Start-Process $frontend
        Start-Sleep -Milliseconds 800
        Write-Host "  [BOT] 啟動後台..." -ForegroundColor Yellow
        Start-Process $admin
        Write-Host "  [BOT] 前台 + 後台均已開啟！（帳號：admin / 密碼：1234）" -ForegroundColor Green
        Read-Host "  按 Enter 回選單"
    }
    elseif ($choice -eq "4") {
        Write-Host "  感謝使用！系統關閉中..." -ForegroundColor Green
        Start-Sleep -Seconds 1
        $running = $false
    }
    else {
        Write-Host "  請輸入 1~4 的選項！" -ForegroundColor Red
        Start-Sleep -Seconds 1
    }
}
