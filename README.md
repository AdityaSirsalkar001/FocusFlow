# 🌊 FocusFlow

**FocusFlow** is a high-performance, local-first productivity ecosystem designed to help developers and students master their time.  
Built with a **"Bento Box" inspired dashboard**, it integrates deep-work timers, task management with automated priority sorting, and a time-blocking day planner into a single, seamless interface.

🚀 **[Live Demo](https://project1-nine-phi.vercel.app/)** | 📂 **[Source Code](https://github.com/AdityaSirsalkar001/FocusFlow)**

---

## 🛠️ Technical Stack

- **Frontend:** React.js (Hooks, Context API, Suspense)  
- **Styling:** Tailwind CSS (Mobile-first, Glassmorphism UI)  
- **State & Persistence:** LocalStorage caching with custom persistence hooks  
- **Performance:** Code-splitting via React Lazy Loading  
- **Deployment:** Vercel  

---

## ✨ Key Features

### ⚡ Zero-Latency Performance
By leveraging **LocalStorage caching** and optimized **React Hooks**, FocusFlow handles 50+ concurrent tasks and extensive notes with zero network latency.  
Your data stays on your device, ensuring total privacy and instant interactions.

### 🤖 Automated Priority-Sorting
The application features a custom-built algorithm that automatically organizes your workflow.  
Tasks are weighted based on **Priority (High/Medium/Low)** and **Deadline Proximity**, reducing manual organization time.

### ⏲️ Persistent Focus Timer
A premium Pomodoro and Stopwatch suite that remains accurate even when tabs are switched or the browser is minimized.  
It uses timestamp-calibration logic to ensure your focus sessions are never interrupted by browser power-saving modes.

### 📅 Time-Blocking Planner
A visual day-grid for planning your hours. Easily link tasks from your todo list directly into time slots to create a structured daily roadmap.

### 📊 Performance Analytics
Deep-dive into your productivity trends with visual heatmaps and intensity charts, tracking focus sessions and task completion rates over time.

---

## 📈 Optimization Highlights (Resume-Ready)

- **Lazy Loading:** Implemented `React.lazy()` and `<Suspense>` for route-based code splitting, reducing initial bundle size and improving Time to Interactive (TTI).  
- **Responsive Design:** Built a fully fluid UI using Tailwind CSS for seamless experience across devices.  
- **Scalable Architecture:** Optimized for heavy local data usage while maintaining smooth UI performance.

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/AdityaSirsalkar001/FocusFlow.git
cd FocusFlow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

---

## 🌟 Support

If you like this project, consider giving it a ⭐ on GitHub!
