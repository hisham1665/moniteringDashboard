<p align="center">
  <img src="https://img.shields.io/badge/Vesper-Security%20Dashboard-8b5cf6?style=for-the-badge&logo=shield&logoColor=white" alt="Vesper Badge" />
</p>

<h1 align="center">🛡️ Vesper — Security Monitoring Dashboard</h1>

<p align="center">
  <em>Built in your hands, guarded in ours.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-AI%20Insights-4285F4?style=flat-square&logo=google&logoColor=white" alt="Gemini AI" />
</p>

---

**Vesper** is a real-time security monitoring dashboard designed to work alongside the [`secure-flow`](https://www.npmjs.com/package/secure-flow) Express middleware. It ingests security events from your Node.js application via Supabase and provides live traffic analysis, threat intelligence, IP management, and AI-powered security posture reports — all through a sleek, dark-themed interface.

> This module is part of a larger project. The dashboard visualizes events emitted by the `secure-flow` middleware through a shared Supabase backend.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Security Overview** | At-a-glance stats — total requests, threats blocked, average risk score, response times |
| **Live Traffic Monitor** | Real-time area charts tracking requests, threats, and blocked events over configurable time windows |
| **Threat Intelligence** | Breakdown of threat types (XSS, NoSQL Injection, Brute Force, etc.) and severity distribution |
| **File Security** | Dedicated view for file scan events with detailed logs |
| **IP Management** | Top offending IPs ranked by threat count and risk score, plus IP ban and block logs |
| **AI Insight Engine** | One-click AI security report powered by **Gemini 2.5 Flash** — generates plain-English posture analysis, threat explanations, and actionable recommendations |
| **Real-time Updates** | Supabase Realtime subscriptions push new events to the dashboard instantly |
| **Demo Mode** | Runs with generated sample data when Supabase is not configured — perfect for exploring the UI |
| **Responsive Design** | Fully responsive with a collapsible off-canvas sidebar for mobile devices |

---

## 🏗️ Architecture

```
┌──────────────────────┐       ┌─────────────────────┐       ┌────────────────────┐
│   Express App        │       │     Supabase         │       │  Vesper Dashboard   │
│   + secure-flow      │──────▶│   security_events    │◀──────│  (this repo)        │
│     middleware        │ insert│     table            │select │                     │
└──────────────────────┘       └─────────────────────┘       └────────────────────┘
                                        │                              │
                                        │  realtime                    │
                                        └──────────────────────────────┘
                                                                       │
                                                              ┌────────▼────────┐
                                                              │  Gemini 2.5     │
                                                              │  Flash API      │
                                                              │  (AI Reports)   │
                                                              └─────────────────┘
```

1. Your Express app uses `secure-flow` with a `SupabaseAdapter` to log every request, threat, block, and scan to the `security_events` table.
2. Vesper connects to the same Supabase project, queries events by API key, and subscribes to realtime inserts.
3. The AI Insight tab sends aggregated event data to Google Gemini for a human-friendly security posture report.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A [Supabase](https://supabase.com) project (free tier works)
- *(Optional)* A [Google AI Studio](https://aistudio.google.com/) API key for the AI Insight feature

### 1. Clone & Install

```bash
git clone https://github.com/hisham1665/moniteringDashboard.git
cd moniteringDashboard
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key        # Optional — for AI Insight
```

> **Note:** Without Supabase credentials, the dashboard automatically runs in **Demo Mode** with simulated data.

### 3. Set Up the Database

Run the included SQL schema in your Supabase SQL Editor:

```sql
-- File: supabase-schema.sql
-- Creates the security_events table, indexes, RLS policies, and realtime
```

Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard) and paste the contents of [`supabase-schema.sql`](./supabase-schema.sql).

### 4. Start the Dev Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

---

## 🔌 Connecting Your Express App

Install and configure the `secure-flow` middleware in your Express application:

```js
const { secureFlow, SupabaseAdapter } = require('secure-flow');

const adapter = new SupabaseAdapter({
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-anon-key',
  apiKey: 'my-project-key',   // ← Use this same key in the dashboard
});

app.use(secureFlow({ supabaseAdapter: adapter }));
```

When prompted in the dashboard, enter the same `apiKey` value to link and view your application's security events.

---

## 📁 Project Structure

```
dashboard/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── AIExplanationPanel.jsx   # Individual threat AI explanation
│   │   ├── AIInsightTab.jsx         # Full AI security report (Gemini)
│   │   ├── EventsTable.jsx          # Sortable events log table
│   │   ├── Onboarding.jsx           # API key entry screen
│   │   ├── Sidebar.jsx              # Navigation sidebar
│   │   ├── StatsCards.jsx           # Summary stat cards
│   │   ├── ThreatChart.jsx          # Threat/severity pie charts
│   │   ├── TopIPs.jsx               # Top offending IPs list
│   │   └── TrafficChart.jsx         # Traffic timeline area chart
│   ├── hooks/
│   │   └── useSecurityData.js       # Data fetching, realtime, and stats
│   ├── lib/
│   │   └── supabase.js              # Supabase client and connection test
│   ├── App.jsx                      # Root app with view routing
│   ├── index.css                    # Global styles and design system
│   └── main.jsx                     # Entry point
├── supabase-schema.sql              # Database schema for Supabase
├── .env.example                     # Environment variable template
├── index.html                       # HTML entry with meta tags and fonts
├── vite.config.js                   # Vite configuration
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Database & Realtime** | Supabase (PostgreSQL + Realtime) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **AI** | Google Generative AI (Gemini 2.5 Flash) |
| **Date Utilities** | date-fns |
| **Routing** | React Router DOM v7 |
| **Styling** | Vanilla CSS with custom design tokens |

---

## 📊 Dashboard Views

### Overview
The default view with summary stats, traffic timeline, threat breakdown pie chart, top offending IPs, and recent threat logs — all in one glance.

### Traffic
Deep-dive into request volume with a full-width traffic chart and a filterable request log table.

### Threats
Threat-focused analytics with dual charts (by type and by severity) and a complete threat log.

### File Security
A dedicated event log for `file_scan` events generated by secure-flow's file upload protection.

### IP Management
Top IPs ranked by threat activity, IP ban history, and blocked request logs.

### AI Insight
Generate a comprehensive, plain-English security posture report powered by Gemini AI. Includes:
- **System Posture** — Healthy / Warning / Critical
- **Top Active Threats** — explained in simple, non-technical language
- **Smart Recommendations** — actionable next steps anyone can follow

---

## 🧪 Demo Mode

If Supabase is **not configured** (missing or placeholder env values), the dashboard automatically enters Demo Mode:
- Generates **200 sample events** covering requests, threats, blocks, rate limits, file scans, and IP bans
- All charts, stats, and tables are fully functional with the simulated data
- Perfect for exploring the UI, presenting, or developing locally without a backend

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes* | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes* | Your Supabase anonymous/public key |
| `VITE_GEMINI_API_KEY` | No | Google AI API key for the AI Insight feature |

> \* Not required if you only want to run in Demo Mode.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of the **Vesper** ecosystem. See the root project for license details.

---

<p align="center">
  <strong>Vesper</strong> — Real-time security intelligence for your Express applications.
</p>
