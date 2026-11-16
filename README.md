# 🚀 TubePulse Pro — YouTube Channel, Revenue & Algorithm Audit Studio

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Cross-Platform](https://img.shields.io/badge/Platform-macOS_%7C_Windows_%7C_Linux-blueviolet?style=for-the-badge)](https://github.com/deep-dev-12489/youtube-channel-revenue-audit)

**TubePulse Pro** is an enterprise-grade YouTube channel intelligence and monetization auditing studio. Designed for creators, media agencies, and algorithmic growth strategists to stress-test channel health, estimate AdSense earnings, detect viral outliers, dissect competitive moats using **Google Gemini AI**, and export structured intelligence dossiers in Markdown (`.md`).

Works **100% out-of-the-box with Zero API Keys** (via an intelligent public scraping engine) or with your own YouTube Data API v3 & Gemini API keys.

---

## 🧪 What This Software Audits & Tests

TubePulse Pro performs deep algorithmic and statistical tests across **6 critical dimensions of any YouTube channel**:

| # | Dimension | What It Tests & Calculates | Why It Matters |
| :-: | :--- | :--- | :--- |
| 💰 | **Monetization & Revenue Audit** | • 90-Day AdSense Revenue Range ($ & ₹)<br>• Projected Monthly Run-Rate<br>• Niche-Adjusted RPM ($3.5–$8.5 for Tech/Finance, $0.4–$1.5 for Entertainment)<br>• Shorts vs Long-Form Revenue Efficiency | Benchmarks whether a channel is monetizing effectively and tests its true commercial value. |
| ⏱️ | **Upload Cadence & Consistency** | • 90-Day Upload Volume<br>• Weekly Upload Pace (vids/week)<br>• Average Upload Gap (days between uploads) | Measures creator consistency, burnout risk, and channel velocity. |
| 🎯 | **Algorithmic Outlier Testing** | • Video Multiplier vs Channel Baseline<br>• **>2.0x Outlier Hit Rate**<br>• Peak Performer Identification | Tests which video topics & titles broke through the YouTube recommendation algorithm. |
| 🧠 | **Gemini AI Strategic Moat** | • Primary Niche & Sub-Niche Classification<br>• Content Pillars & Strategic Moat<br>• High-CTR Top Performing Angles<br>• Target Viewer Persona & Pain Points<br>• Competitor Takeaways & Next Video Hooks | Uncovers why the audience watches and provides a playbook to replicate top angles. |
| 📊 | **Format & Duration Dynamics** | • Shorts vs Long-Form Distribution Ratio<br>• Video Duration vs Views Correlation<br>• Chronological Views Velocity Timeline | Tests whether the channel succeeds through short-form viral loops or long-form retention. |
| 📄 | **Markdown (.md) Dossier Export** | • 1-Click Complete Raw & Analyzed Data Extraction<br>• Formatted Tables with Direct YouTube Links | Ready-to-use executive report for agency audits, client pitches, and competitor tracking. |

---

## ⚡ Cross-Platform Quickstart (macOS & Windows)

Dedicated 1-click launchers and environment configurations are included for both operating systems:

### 🍏 macOS Setup

#### 1-Click Launcher (Terminal)
```bash
git clone https://github.com/deep-dev-12489/youtube-channel-revenue-audit.git
cd youtube-channel-revenue-audit
chmod +x start-mac.sh
./start-mac.sh
```
*Automatically checks Node.js, configures `.env.local` from macOS template, installs dependencies, launches the server, and opens http://localhost:3000.*

---

### 🪟 Windows Setup

#### 1-Click Launcher (Double-Click)
1. Clone the repository:
   ```cmd
   git clone https://github.com/deep-dev-12489/youtube-channel-revenue-audit.git
   cd youtube-channel-revenue-audit
   ```
2. Double-click **`start-windows.bat`** in the folder!
   *(Or in PowerShell run: `.\scripts\start-windows.ps1`)*

---

## ⚙️ Environment Variables (Optional)

Configure via `.env.local` or the in-app **Settings Modal**:

```env
# Optional: YouTube Data API v3 Key (If empty, automatic zero-key public scraper takes over!)
YOUTUBE_API_KEY=

# Optional: Google Gemini API Key (From https://aistudio.google.com/)
GEMINI_API_KEY=

# Port Configuration
PORT=3000
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
