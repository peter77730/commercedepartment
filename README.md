# 商業署網站專案

經濟部商業發展署靜態網站，提供創新、品牌、地方、綠色等各類補助計畫資訊及國際標竿案例。

## 技術架構

- 純 HTML 靜態網站，無前端框架
- **Tailwind CSS**（本地 build，不使用 CDN）
- 字型：Noto Sans TC / Noto Serif TC / Inter（via Google Fonts）
- 原生 JavaScript（無框架依賴）
- 符合台灣無障礙網頁開發規範 2.0 AA 等級（WCAG 2.1 Level AA）

## 目錄結構

```
/
├── index.html              # 首頁
├── innovation/             # 創新研發類計畫
├── brand/                  # 品牌輔導類計畫
├── district/               # 特色商圈類計畫
├── green/                  # 綠色永續類計畫
├── insight/                # 國際標竿（澳洲、德國、日本等）
├── news/                   # 最新消息
├── sitemap/                # 網站導覽
├── assets/
│   ├── css/                # 編譯後的 CSS（tailwind.css、style.css）
│   ├── js/                 # 網站互動邏輯
│   ├── images/             # 圖片資源
│   └── pdf/                # 可下載文件
├── templates/              # 共用 header / footer 模板
├── scripts/                # 模板同步工具
└── tailwind.config.js      # Tailwind 設定
```

## 本地開發

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

同步模板 + 監聽 Tailwind + Browser-Sync 熱重載：

```bash
npm start
```

### 單獨指令

| 指令 | 說明 |
|------|------|
| `npm run watch` | 監聽並重新編譯 Tailwind CSS |
| `npm run build` | 同步模板並輸出壓縮版 CSS |
| `npm run sync:templates` | 同步所有頁面的 header / subnav / footer |
| `npm run serve` | 僅啟動 Browser-Sync（不含 Tailwind watch） |

### 模板同步

header、footer、subnav 統一維護於 `templates/` 目錄，修改後執行：

```bash
npm run sync:templates
```

即可同步至全站所有 HTML 頁面。

## 上線部署注意事項

上線前請參閱 [DEPLOY_NOTES.md](DEPLOY_NOTES.md)，確認以下項目：

- 移除 `<meta name="robots" content="noindex,nofollow" />`
- 切換影片來源（本機路徑 → CDN R2 路徑）
- 處理各類 `<!-- 正式站移除 -->` / `<!-- 正式環境開啟 -->` 標記

## 無障礙規範

- 所有頁面提供「跳至主要內容」skip link
- 色彩對比度符合 WCAG 2.1 AA 標準
- 自動輪播元件提供鍵盤可操作的播放／暫停按鈕
- 語系標記：`<html lang="zh-TW">`
