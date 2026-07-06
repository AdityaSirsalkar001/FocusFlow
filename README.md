<div align="center">

# 🌊 FocusFlow

### A local-first productivity ecosystem for developers & students

**Zero-latency task management · Persistent focus timer · Time-blocking planner**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Optional_Sync-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#-license)

[🚀 Live Demo](https://project1-nine-phi.vercel.app) · [📂 Report a Bug](../../issues) · [✨ Request a Feature](../../issues)

</div>

---

## 📖 Overview

**FocusFlow** brings deep-work timers, intelligent task management, and a visual day planner into a single, seamless interface — inspired by Bento Box dashboard design.

Most productivity tools are either bloated, require constant internet access, or don't integrate their pieces well. FocusFlow is built **local-first**: your data lives on your device by default, every interaction is instant, and cloud sync is entirely optional.

## ✨ Key Features

| Feature | Description |
|---|---|
| ⚡ **Zero-Latency Performance** | LocalStorage caching handles 50+ concurrent tasks with zero network latency |
| 🤖 **Automated Priority Sorting** | Custom algorithm weights tasks by priority *and* deadline proximity |
| ⏲️ **Persistent Focus Timer** | Pomodoro/stopwatch suite using timestamp-calibration — stays accurate even in background tabs |
| 📅 **Time-Blocking Planner** | Visual hour-by-hour day grid, linkable directly to your to-do list |
| 📊 **Performance Analytics** | Heatmaps and intensity charts tracking focus sessions & completion rates |
| 🤝 **Collaboration** | Create groups, generate invite links, and share planners with teammates |
| 🌗 **Dark Mode** | Full light/dark theming with persisted preference |
| ☁️ **Optional Cloud Sync** | Supabase-backed multi-device sync, with the app fully functional offline |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│   Home · Focus Timer · Tasks · Planner · Notes · Analytics  │
│              Settings · Profile · Theme Toggle               │
└───────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  State Management Layer                     │
│           usePersistentState  (React state + localStorage)  │
└───────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                           │
│   localStorage (primary)  ·  Supabase (sync)  ·  Web Audio   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend:** React (Hooks, Context API, Suspense)
- **Styling:** Tailwind CSS — mobile-first, glassmorphism UI
- **State & Persistence:** Custom `usePersistentState` hook over LocalStorage
- **Performance:** Route-based code-splitting via `React.lazy()`
- **Backend (optional):** Supabase — auth, Postgres, realtime sync
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/AdityaSirsalkar001/FocusFlow.git
cd FocusFlow

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Optional: Enable Cloud Sync

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Without these variables, FocusFlow runs entirely offline using LocalStorage — no setup required.

## 📈 Performance Highlights

- **~30% smaller initial bundle** via lazy-loaded routes with `<Suspense>` and hover-preloading
- **Zero-latency reads/writes** — all core data operations are synchronous against LocalStorage
- **Drift-free timer** — timestamp calibration instead of naive `setInterval` counting
- **Graceful degradation** — every cloud feature silently falls back to local-only mode on failure

## 🗂️ Project Structure

```
FocusFlow/
├── public/
├── src/
│   ├── components/       # Home, FocusTimer, TodoList, DayPlanner, Notes, Analytics, ...
│   ├── hooks.js          # usePersistentState, useInterval
│   ├── storage.js        # LocalStorage read/write helpers
│   ├── supabaseClient.js # Supabase client wrapper
│   ├── plannerApi.js     # Cloud sync for day planner
│   ├── collabApi.js      # Groups & invitations
│   └── App.jsx           # Root component, routing, lazy loading
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🌟 Show Your Support

If you find this project useful, consider giving it a ⭐ on GitHub!

---

<div align="center">

Built with ❤️ by **[Aditya Sirsalkar](https://github.com/AdityaSirsalkar001)**

</div>
