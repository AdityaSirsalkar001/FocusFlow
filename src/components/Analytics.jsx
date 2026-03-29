import React, { useMemo } from 'react';
import { load } from '../lib/storage.js';

function getDays(n = 7) { 
  const now = new Date(); 
  return Array.from({ length: n }, (_, i) => { 
    const d = new Date(now); 
    d.setDate(now.getDate() - (n - 1 - i)); 
    return d; 
  }); 
}

function dateKey(d) { 
  const y = d.getFullYear(); 
  const m = String(d.getMonth() + 1).padStart(2, '0'); 
  const day = String(d.getDate()).padStart(2, '0'); 
  return `${y}-${m}-${day}`; 
}

function minutes(s = 0) { return Math.round((s || 0) / 60); }

export default function Analytics() {
  const stats = load('stats:focus', {});
  const todos = load('todos', []);

  // Focus Data Calculation
  const days = getDays(7);
  const daily = days.map(d => ({ 
    key: dateKey(d), 
    label: d.toLocaleDateString(undefined, { weekday: 'short' }), 
    seconds: (stats[dateKey(d)]?.seconds) || 0, 
    sessions: (stats[dateKey(d)]?.sessions) || 0 
  }));

  const maxSec = Math.max(1, ...daily.map(d => d.seconds));
  const totalWeekSec = daily.reduce((a, b) => a + b.seconds, 0);
  const totalWeekSessions = daily.reduce((a, b) => a + b.sessions, 0);
  
  const todayKey = dateKey(new Date());
  const today = { seconds: (stats[todayKey]?.seconds) || 0, sessions: (stats[todayKey]?.sessions) || 0 };

  const completedTasks = todos.filter(t => t.done).length;
  const activeTasks = todos.length - completedTasks;
  const completionRate = todos.length === 0 ? 0 : Math.round((completedTasks / todos.length) * 100);

  const priorityData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    todos.filter(t => !t.done).forEach(t => {
      if (counts[t.priority]) counts[t.priority]++;
      else counts['Medium']++;
    });
    return counts;
  }, [todos]);

  // FIXED: Level class logic to ensure even low focus (1m) is visible
  function levelClass(seconds) { 
    if (seconds === 0) return 'bg-slate-100 dark:bg-slate-800/50'; 
    const r = seconds / maxSec; 
    if (r < .25) return 'bg-rose-400/60 dark:bg-rose-500/40'; // High visibility for low focus
    if (r < .5) return 'bg-rose-500/80'; 
    return 'bg-rose-600'; 
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm animate-[fadeIn_0.4s_ease-out]">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Performance Analytics</h3>
      
      <div className="flex flex-col gap-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{minutes(totalWeekSec)}m</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Weekly Focus</div>
          </div>
          <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-3xl font-black text-rose-500 dark:text-rose-400 mb-1">{totalWeekSessions}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Sessions</div>
          </div>
          <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-3xl font-black text-teal-500 dark:text-teal-400 mb-1">{completionRate}%</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Completion Rate</div>
          </div>
          <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-3xl font-black text-amber-500 dark:text-amber-400 mb-1">{activeTasks}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Pending Tasks</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Focus Intensity
            </h4>
            <div className="flex justify-between items-end gap-3 h-48 mb-4 px-2">
              {daily.map(d => {
                const mins = minutes(d.seconds);
                // FIXED: height logic has a minimum of 4% if focus > 0
                const heightPercent = d.seconds > 0 ? Math.max(4, (d.seconds / maxSec) * 100) : 0;
                
                return (
                  <div key={d.key} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                    {/* Tooltip (always exists, just hidden) */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold shadow-xl">
                      {mins}m
                    </div>
                    
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out border-b border-transparent ${levelClass(d.seconds)}`} 
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Task Priority Load
            </h4>
            <div className="space-y-4 flex-1 justify-center flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">High Priority</span>
                <span className="text-sm font-black text-red-500">{priorityData.High}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${(priorityData.High / (activeTasks || 1)) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Medium Priority</span>
                <span className="text-sm font-black text-amber-500">{priorityData.Medium}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(priorityData.Medium / (activeTasks || 1)) * 100}%` }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Low Priority</span>
                <span className="text-sm font-black text-blue-500">{priorityData.Low}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(priorityData.Low / (activeTasks || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}