# 建築法規 AI 權重分析系統 🏛️

> 利用關鍵字權重演算法，即時從多部台灣建築法規中檢索最相關的完整條文。

---

## 🚀 快速開啟方式

### 方法一：雙擊執行檔（最簡單）
直接在此資料夾中，**雙擊** `start agent.bat`
- 系統會自動啟動伺服器並開啟瀏覽器
- 請勿關閉跳出的黑色終端機視窗（那是伺服器）

### 方法二：Terminal 手動啟動（逐步指令）

> ⚠️ **重要：`npm run dev` 必須在 `app` 子資料夾內執行，不能在專案根目錄下執行！**

**步驟 1：打開 Terminal（PowerShell 或命令提示字元）**

**步驟 2：進入專案的 `app` 資料夾**
```powershell
cd C:\Users\user\.antigravity\cheng_yuan\Building-Code-Agent-KAI\app
```

**步驟 3：啟動開發伺服器**
```powershell
npm run dev
```

**步驟 4：看到以下訊息後，開啟瀏覽器輸入網址**
```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```
👉 瀏覽器網址：**http://localhost:5173/**

> 💡 伺服器會持續運行直到您關閉 Terminal 視窗為止

---

## 🗂️ 專案結構

```
Building-Code-Agent-KAI/
├── app/                   # React 前端網頁 (Vite)
│   └── src/
│       ├── App.jsx        # 主要元件與搜尋邏輯
│       ├── index.css      # 全局樣式（暗色主題）
│       └── laws_data.json # 爬取匯入的真實法條資料庫
│
├── law-mcp-server/        # MCP 伺服器
│   ├── index.js           # MCP Tool：search_law_articles
│   └── fetch_laws.js      # 法條爬蟲腳本（手動更新法規用）
│
├── start agent.bat        # ✅ 一鍵啟動執行檔
└── README.md
```

---

## 📚 已掛載的法規來源

| 法典名稱 | 法規代碼 | 說明 |
|----------|----------|------|
| 建築法 | D0070109 | 建築物興建、使用、拆除之根本大法 |
| 建築設計施工編 | D0070115 | 設計、防火、避難、停車等詳細規範 |
| 建築構造編 | D0070117 | 結構、耐震、載重等設計規範 |
| 身心障礙者權益保障法（無障礙） | K0020057 | 無障礙設施之設置義務與規範 |

### 新增法規步驟
1. 開啟 `law-mcp-server/fetch_laws.js`
2. 在 `SOURCES` 陣列中新增一筆：
   ```js
   { name: "法規名稱", url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=XXXXXXX" }
   ```
3. 同步更新 `law-mcp-server/index.js` 的 `SOURCES` 陣列
4. 在 `law-mcp-server/` 目錄下執行：
   ```bash
   node fetch_laws.js
   ```
   法條資料庫即自動更新至 `app/src/laws_data.json`

---

## 🧠 搜尋演算法說明

系統採用**對數加權計分法**：

```
分數 = 字詞權重 × (1 + ln(出現次數))
```

- 多個關鍵字可同時觸發同一條文，分數疊加
- 搜尋結果依總分排序，預設回傳前 10 筆

### 關鍵字分類與預設權重

| 分類 | 代表關鍵字 | 預設權重 |
|------|-----------|---------|
| 結構耐震 | 耐震、地震、制震、承重牆 | 2.0 |
| 消防安全 | 逃生、避難、安全梯 | 1.8 |
| 消防設備 | 滅火器、防火門、防火區劃 | 1.5 |
| 土地管制 | 建蔽率、容積率、分區 | 1.5 |
| 建築設計 | 增建、違建、停車、挑高 | 1.2 |
| 節能綠建築 | 通風、隔熱、太陽能 | 1.2 |
| 室內裝修 | 輕隔間、天花板、裝修 | 1.0 |

---

## 🔌 MCP 工具規格

**工具名稱：** `search_law_articles`

**輸入參數：**
| 參數 | 型別 | 說明 |
|------|------|------|
| `keywords` | `string[]` | 關鍵字陣列，可附加自訂權重，例如 `"防火:2.0"` |
| `top_k` | `number` (選填) | 回傳筆數，預設 5 |

**MCP 設定檔位置：** `C:\Users\user\.gemini\antigravity\mcp_config.json`

---

## ⚠️ 注意事項

- 法條資料庫為靜態快照，如法規修訂，請重新執行 `node fetch_laws.js` 以更新
- 爬取需連線至 `law.moj.gov.tw`，請確認網路連線正常
- 網頁伺服器須保持終端機視窗開啟（關閉即停止服務）
