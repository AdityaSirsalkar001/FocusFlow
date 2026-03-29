import React, { useState } from 'react';
import { load, save } from '../lib/storage.js';

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtDuration(seconds = 0) {
  if (seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home({ goTo }) {
  // Load data
  const [todos, setTodos] = useState(() => load('todos', []));
  const notes = load('notes', []);
  const planner = load('planner', {});
  const stats = load('stats:focus', {});

  // Quick Capture State
  const [quickTask, setQuickTask] = useState('');

  // Task Metrics
  const activeTasks = todos.filter(t => !t.done);
  const completedTasks = todos.filter(t => t.done);
  const totalTasks = todos.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);
  const topTasks = activeTasks.slice(0, 3);
  
  // Planner & Stats Metrics
  const todayKey = dateKey();
  const todayStats = stats[todayKey] || { seconds: 0, sessions: 0 };
  const todayPlanner = planner[todayKey] || {};
  const plannedBlocks = Object.entries(todayPlanner).filter(([_, v]) => v && v.text).length;
  const recentNotes = Array.isArray(notes) ? notes.slice(0, 2) : [];
  
  // User Info
  const preferredName = (load('profile:name','') || 'there').trim();
  const greeting = getTimeOfDay();

  // Quick Add Function
  function handleQuickAdd(e) {
    e.preventDefault();
    const t = quickTask.trim();
    if (!t) return;
    const now = Date.now();
    const newTodos = [{ 
      id: crypto.randomUUID(), 
      text: t, 
      done: false, 
      createdAt: now, 
      updatedAt: now, 
      priority: 'Medium',
      deadline: null
    }, ...todos];
    
    setTodos(newTodos);
    save('todos', newTodos);
    setQuickTask('');
  }

  return (
    <section className="flex flex-col gap-8 w-full animate-[fadeIn_0.4s_ease-out]">
      
      {/* Header & Quick Capture */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-sm">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full font-bold text-xs uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold m-0 mb-2 tracking-tight text-slate-900 dark:text-white">
            {greeting}, {preferredName}.
          </h1>
          <p className="m-0 text-slate-500 dark:text-slate-400 font-medium">
            What are we focusing on today?
          </p>
        </div>

        {/* Quick Task Input */}
        <form onSubmit={handleQuickAdd} className="w-full md:w-96 relative group">
          <input 
            type="text" 
            placeholder="Quick add a task... (Press Enter)"
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl pl-5 pr-12 py-3.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md"
          />
          <button type="submit" disabled={!quickTask.trim()} className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </form>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">
        
        {/* Hero Focus Card */}
        <div className="md:col-span-2 relative overflow-hidden flex flex-col justify-between rounded-3xl p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-blue-900/20 transition-transform duration-300 hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md shadow-inner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span className="font-bold text-lg tracking-tight text-white/90">Focus Space</span>
              </div>
            </div>
            
            <div className="flex items-end gap-8 my-6">
              <div>
                <span className="text-6xl md:text-7xl font-black leading-none tracking-tighter drop-shadow-sm">{fmtDuration(todayStats.seconds)}</span>
                <span className="text-sm text-blue-200 font-bold uppercase tracking-widest mt-3 block">Focused Today</span>
              </div>
              <div className="w-[2px] h-16 bg-white/20 rounded-full mb-2"></div>
              <div className="mb-1">
                <span className="text-3xl md:text-4xl font-extrabold leading-none block">{todayStats.sessions}</span>
                <span className="text-xs text-blue-200 font-bold uppercase tracking-widest mt-2 block">Sessions</span>
              </div>
            </div>
            
            <button onClick={() => goTo('focus')} className="self-start mt-4 px-8 py-3.5 bg-white text-indigo-600 font-black rounded-2xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-2">
              Enter Flow State
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        {/* Tasks Progress Preview */}
        <div onClick={() => goTo('tasks')} className="group flex flex-col rounded-3xl p-6 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:ring-teal-500/30 hover:-translate-y-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Tasks Overview</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Daily Progress</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            {topTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-xl mb-1">🎉</span>
                <span className="text-sm font-medium text-slate-500">Inbox Zero!</span>
              </div>
            ) : (
              topTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                  <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded"></div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{t.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Day Planner Overview */}
        <div onClick={() => goTo('planner')} className="group flex flex-col rounded-3xl p-6 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-xl hover:ring-purple-500/30 hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Schedule</span>
          </div>
          
          <div className="flex flex-col flex-1 justify-center items-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="text-6xl font-black text-purple-600 dark:text-purple-400 leading-none tracking-tighter drop-shadow-sm">{plannedBlocks}</div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-3 text-center">Time Blocks<br/>Planned Today</div>
          </div>
        </div>

        {/* Notes Quick View */}
        <div className="flex flex-col md:col-span-2 rounded-3xl p-6 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:ring-amber-500/30 hover:-translate-y-1 cursor-pointer" onClick={() => goTo('notes')}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Recent Notes</span>
            </div>
            <button className="text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors">View All →</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {recentNotes.length === 0 ? (
               <div className="col-span-2 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                 <p className="text-sm font-medium text-slate-500">No notes captured yet. Jot something down!</p>
               </div>
            ) : (
               recentNotes.map(n => (
                 <div key={n.id} className="flex flex-col p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700">
                   <strong className="block text-slate-900 dark:text-white text-base mb-2 truncate">{n.title || 'Untitled Note'}</strong>
                   <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400 m-0 leading-relaxed font-medium">{n.content || 'No content provided.'}</p>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}