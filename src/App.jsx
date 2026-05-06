import React, { useEffect, useLayoutEffect, useRef, useState, Suspense, lazy } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import HomeEager from './components/Home.jsx';
import FocusTimerEager from './components/FocusTimer.jsx';
import TodoListEager from './components/TodoList.jsx';
import NotesEager from './components/Notes.jsx';
import DayPlannerEager from './components/DayPlanner.jsx';
import AnalyticsEager from './components/Analytics.jsx';
import SettingsEager from './components/Settings.jsx';
import ProfileEager from './components/Profile.jsx';

const componentLoaders = {
  home: () => import('./components/Home.jsx'),
  focus: () => import('./components/FocusTimer.jsx'),
  tasks: () => import('./components/TodoList.jsx'),
  notes: () => import('./components/Notes.jsx'),
  planner: () => import('./components/DayPlanner.jsx'),
  analytics: () => import('./components/Analytics.jsx'),
  settings: () => import('./components/Settings.jsx'),
  profile: () => import('./components/Profile.jsx'),
};

const lazyComponents = {
  home: lazy(componentLoaders.home),
  focus: lazy(componentLoaders.focus),
  tasks: lazy(componentLoaders.tasks),
  notes: lazy(componentLoaders.notes),
  planner: lazy(componentLoaders.planner),
  analytics: lazy(componentLoaders.analytics),
  settings: lazy(componentLoaders.settings),
  profile: lazy(componentLoaders.profile),
};

const eagerComponents = {
  home: HomeEager,
  focus: FocusTimerEager,
  tasks: TodoListEager,
  notes: NotesEager,
  planner: DayPlannerEager,
  analytics: AnalyticsEager,
  settings: SettingsEager,
  profile: ProfileEager,
};

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
      <div className="w-8 h-8 border-4 border-zinc-200 border-t-teal-500 rounded-full animate-spin dark:border-zinc-800 dark:border-t-teal-400"></div>
      <div className="text-sm font-semibold text-zinc-400">Loading workspace...</div>
    </div>
  );
}

function ActiveWorkspace({ tab, lazyLoading, goTo }) {
  const Component = (lazyLoading ? lazyComponents : eagerComponents)[tab] || eagerComponents.home;

  return (
    <div key={tab} className="animate-[pageSlide_0.36s_cubic-bezier(.2,.8,.2,1)]">
      <Component goTo={goTo} />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(() => localStorage.getItem('prodapp:tab') || 'home');
  const [lazyLoading, setLazyLoading] = useState(() => localStorage.getItem('prodapp:lazy-loading') !== 'false');
  const navRef = useRef(null);
  const tabRefs = useRef({});
  const [navPill, setNavPill] = useState({ left: 4, width: 44, opacity: 0 });
  
  function selectTab(k) { 
    setTab(k); 
    localStorage.setItem('prodapp:tab', k); 
  }

  useEffect(() => {
    const current = tabs.find(t => t.key === tab)?.label || 'App';
    document.title = `FocusFlow — ${current}`;
  }, [tab]);

  useEffect(() => {
    function onLazyLoadingChange(e) {
      setLazyLoading(!!e.detail?.enabled);
    }

    window.addEventListener('focusflow:lazy-loading-change', onLazyLoadingChange);
    return () => window.removeEventListener('focusflow:lazy-loading-change', onLazyLoadingChange);
  }, []);

  const [paletteOpen, setPaletteOpen] = useState(false);

  useLayoutEffect(() => {
    function updatePill() {
      const nav = navRef.current;
      const active = tabRefs.current[tab];
      if (!nav || !active) return;
      setNavPill({
        left: active.offsetLeft,
        width: active.offsetWidth,
        opacity: 1,
      });
    }

    updatePill();
    const frame = requestAnimationFrame(updatePill);
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePill) : null;
    if (navRef.current && resizeObserver) resizeObserver.observe(navRef.current);
    window.addEventListener('resize', updatePill);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePill);
    };
  }, [tab]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col gap-5 px-3 py-3 sm:px-5 lg:px-7 lg:py-6">
      <header className="app-surface sticky top-3 z-40 flex flex-col gap-4 rounded-[1.6rem] px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-950/15 dark:bg-white dark:text-zinc-950">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 13.5c2.55-3.1 5.55-3.1 8.1 0 2.53 3.08 5.32 3.08 7.9 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/><path d="M6.5 7.5h11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
            </span>
            <div>
              <div className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">FocusFlow</div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Priority workspace</div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button 
              className="icon-button" 
              onClick={() => setPaletteOpen(true)} 
              title="Command Palette (Cmd/Ctrl + K)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
        
        <nav ref={navRef} className="relative isolate flex gap-1.5 overflow-x-auto rounded-2xl border border-zinc-200/70 bg-zinc-100/60 p-1 hide-scrollbar dark:border-white/10 dark:bg-white/[0.04]">
          <span
            className="nav-active-pill"
            style={{
              opacity: navPill.opacity,
              width: `${navPill.width}px`,
              transform: `translateX(${navPill.left}px)`,
            }}
          />
          {tabs.map(t => (
            <button 
              key={t.key} 
              ref={node => { tabRefs.current[t.key] = node; }}
              className={`relative z-10 flex min-w-11 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-extrabold transition-[color,transform] duration-300 ${
                tab === t.key 
                  ? 'text-zinc-950 dark:text-zinc-950' 
                  : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
              onClick={() => selectTab(t.key)}
              title={t.label}
            >
              <span>{t.icon}</span>
              <span className="hidden xl:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button 
            className="icon-button" 
            onClick={() => setPaletteOpen(true)} 
            title="Command Palette (Cmd/Ctrl + K)"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        {lazyLoading ? (
          <Suspense fallback={<LoadingFallback />}>
            <ActiveWorkspace tab={tab} lazyLoading={lazyLoading} goTo={selectTab} />
          </Suspense>
        ) : (
          <ActiveWorkspace tab={tab} lazyLoading={lazyLoading} goTo={selectTab} />
        )}
      </main>
      
      <CommandPalette open={paletteOpen} onClose={(v)=> setPaletteOpen(!!v)} goTo={selectTab} />
    </div>
  );
}
