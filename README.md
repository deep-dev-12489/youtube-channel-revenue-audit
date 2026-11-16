# TubePulse 🎬 — YouTube Competitor & Channel Analytics Studio

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Cross-Platform](https://img.shields.io/badge/Platform-macOS_%7C_Windows_%7C_Linux-blueviolet?style=for-the-badge)](https://github.com/deep-dev-12489/youtube-channel-analysis)

A high-performance YouTube competitor and channel intelligence dashboard. Analyzes 90-day upload cadences, flags viral outlier videos (>2x channel average views), extracts strategic content moats and audience personas with **Google Gemini AI**, and features a **1-click Markdown (`.md`) full-data export**.

Works **out-of-the-box with Zero API Keys** (via an intelligent public scraping engine) or with your own YouTube Data API v3 & Gemini API keys.

---

## ⚡ Cross-Platform Quickstart

This repository contains dedicated environment setups for both **macOS** and **Windows**.

### 🍏 macOS Setup

#### Option A: One-Click Launcher (Terminal)
Open Terminal in the project root:
```bash
chmod +x start-mac.sh
./start-mac.sh
```
*This script automatically verifies Node.js, configures `.env.local`, installs packages, launches Next.js, and opens http://localhost:3000 in your default browser.*

#### Option B: Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/deep-dev-12489/youtube-channel-analysis.git
cd youtube-channel-analysis

# 2. Setup environment
cp .env.mac.example .env.local

# 3. Install dependencies & start
npm install
npm run dev
```

---

### 🪟 Windows Setup

#### Option A: One-Click Launcher (Double-Click)
- Simply double-click **`start-windows.bat`** in the project folder.
- Or in **PowerShell**:
  ```powershell
  .\scripts\start-windows.ps1
  ```
*This automatically checks Node.js, configures `.env.local`, runs `npm install`, launches Next.js, and opens http://localhost:3000.*

#### Option B: Manual Setup (CMD / PowerShell)
```cmd
:: 1. Clone repository
git clone https://github.com/deep-dev-12489/youtube-channel-analysis.git
cd youtube-channel-analysis

:: 2. Setup environment
copy .env.windows.example .env.local

:: 3. Install dependencies & start
npm install
npm run dev
```

---

## 🎯 Key Features

- **🔎 Universal Channel Input**: Search by Channel Name, Handle (`@fireship`, `@thefoodgupshup`), Channel URL, or Channel ID (`UC...`).
- **🛡️ Zero-Key Public Scraping Engine**: Analyze channels without needing a Google Cloud API key! Works on standard long-form videos and Shorts-only channels alike.
- **📊 90-Day Cadence & Health KPIs**:
  - Total Videos (past 90 days)
  - Weekly Upload Frequency (velocity metric)
  - Average Upload Gap (days between consecutive videos)
  - Average Views & Median Views benchmark
  - Shorts vs. Long-form video distribution ratio
- **🔥 Viral Outlier Detection**: Automatically isolates and highlights videos outperforming the channel's 90-day average by **>2.0x**.
- **🤖 Gemini AI Algorithmic Dossier**:
  - Niche & Sub-Niche classification
  - Strategic Moat & Positioning
  - Content Pillars
  - Top-Performing Angles with explanations & examples
  - Target Viewer Persona & Pain Points
  - Competitor Takeaways & Next Video Hooks
- **📈 Interactive Recharts**:
  - Views Over Time (chronological timeline)
  - Duration vs. Views Performance scatter/bar analysis
- **📝 1-Click Markdown (.md) Report Export**:
  - Download a structured, clean `.md` intelligence dossier containing channel metadata, 90d KPIs, Gemini AI strategy breakdown, outlier hit list, and full 90-day video performance catalog.

---

## ⚙️ Environment Variables (Optional)

Configure in `.env.local` or through the interactive in-app **Settings Modal**:

```env
# Optional: YouTube Data API v3 Key
# (If omitted, automatic public resolver handles all channels)
YOUTUBE_API_KEY=

# Optional: Google Gemini API Key
# (From https://aistudio.google.com/)
GEMINI_API_KEY=

# Port (Default: 3000)
PORT=3000
```

---

## 📦 Project Structure

```
youtube-channel-analysis/
├── start-windows.bat          # 1-Click Windows Batch launcher
├── start-mac.sh               # 1-Click macOS Bash launcher
├── scripts/
│   ├── start-windows.ps1      # PowerShell launcher
│   └── start-mac.sh           # macOS shell script
├── .env.example               # Universal environment template
├── .env.windows.example       # Windows environment template
├── .env.mac.example           # macOS environment template
├── src/
│   ├── app/
│   │   ├── api/analyze/       # Backend API endpoint (YouTube + Gemini + Fallbacks)
│   │   ├── layout.tsx         # Root layout & styling
│   │   └── page.tsx           # Main analytics dashboard
│   ├── components/            # UI components (KPICards, VideoTable, Charts, etc.)
│   ├── lib/                   # Core business logic (youtube scraper, gemini, markdownExport)
│   └── types/                 # TypeScript interfaces
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Engine**: [Google Gemini 2.0 Flash](https://aistudio.google.com/)

---

## 📄 License

MIT © [Deepali Motwani](https://github.com/deep-dev-12489)
