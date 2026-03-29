import React, { useEffect, useState, Suspense, lazy } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import CommandPalette from './components/CommandPalette.jsx';

// Lazy Load all the main tab components
const Home = lazy(() => import('./components/Home.jsx'));
const FocusTimer = lazy(() => import('./components/FocusTimer.jsx'));
const TodoList = lazy(() => import('./components/TodoList.jsx'));
const Notes = lazy(() => import('./components/Notes.jsx'));
const DayPlanner = lazy(() => import('./components/DayPlanner.jsx'));
const Analytics = lazy(() => import('./components/Analytics.jsx'));
const Settings = lazy(() => import('./components/Settings.jsx'));
const Profile = lazy(() => import('./components/Profile.jsx'));

const tabs = [
  { key: 'home', label: 'Home', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { key: 'focus', label: 'Focus', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key: 'tasks', label: 'Tasks', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { key: 'notes', label: 'Notes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { key: 'planner', label: 'Planner', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { key: 'analytics', label: 'Analytics', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: 'settings', label: 'Settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { key: 'profile', label: 'Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
];

// Simple loading skeleton while components fetch
function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="text-sm font-medium text-slate-400">Loading module...</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(() => localStorage.getItem('prodapp:tab') || 'home');
  
  function selectTab(k) { 
    setTab(k); 
    localStorage.setItem('prodapp:tab', k); 
  }

  useEffect(() => {
    const current = tabs.find(t => t.key === tab)?.label || 'App';
    document.title = `FocusFlow — ${current}`;
  }, [tab]);

  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 md:px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm">
        <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
          <span className="text-blue-600 dark:text-blue-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3z" opacity="0.2"/><path d="M6 12c2.5-2.2 5.5-2.2 8 0 2.5 2.2 5.5 2.2 8 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
          </span> 
          FocusFlow
        </div>
        
        <nav className="flex flex-wrap gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map(t => (
            <button 
              key={t.key} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                tab === t.key 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => selectTab(t.key)}
            >
              <span>{t.icon}</span>
              <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" 
            onClick={() => setPaletteOpen(true)} 
            title="Command Palette (Cmd/Ctrl + K)"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* The Suspense wrapper handles the loading state while the lazy component is fetched */}
      <main className="flex-1 animate-[fadeIn_0.3s_ease-out]">
        <Suspense fallback={<LoadingFallback />}>
          {tab === 'home' && <Home goTo={selectTab} />}
          {tab === 'focus' && <FocusTimer />}
          {tab === 'tasks' && <TodoList />}
          {tab === 'notes' && <Notes />}
          {tab === 'planner' && <DayPlanner />}
          {tab === 'analytics' && <Analytics />}
          {tab === 'settings' && <Settings />}
          {tab === 'profile' && <Profile />}
        </Suspense>
      </main>
      
      <CommandPalette open={paletteOpen} onClose={(v)=> setPaletteOpen(!!v)} goTo={selectTab} />
    </div>
  );
}