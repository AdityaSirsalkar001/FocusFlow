import React, { useMemo, useState } from 'react';
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

function deadlineLabel(value) {
  if (!value) return 'No deadline';
  const due = new Date(value);
  const diff = due.getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  if (diff < 86400000) return 'Due today';
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Home({ goTo }) {
  const [todos, setTodos] = useState(() => load('todos', []));
  const notes = load('notes', []);
  const planner = load('planner', {});
  const stats = load('stats:focus', {});
  const [quickTask, setQuickTask] = useState('');

  const activeTasks = todos.filter(t => !t.done);
  const completedTasks = todos.filter(t => t.done);
  const totalTasks = todos.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);
  const todayKey = dateKey();
  const todayStats = stats[todayKey] || { seconds: 0, sessions: 0 };
  const todayPlanner = planner[todayKey] || {};
  const plannedBlocks = Object.entries(todayPlanner).filter(([, v]) => v && v.text).length;
  const recentNotes = Array.isArray(notes) ? notes.slice(0, 2) : [];
  const preferredName = (load('profile:name', '') || 'there').trim();

  const sortedPriorityTasks = useMemo(() => {
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    return [...activeTasks].sort((a, b) => {
      const weight = (priorityWeight[b.priority || 'Medium'] || 2) - (priorityWeight[a.priority || 'Medium'] || 2);
      if (weight) return weight;
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    }).slice(0, 5);
  }, [activeTasks]);

  function handleQuickAdd(e) {
    e.preventDefault();
    const t = quickTask.trim();
    if (!t) return;
    const now = Date.now();
    const newTodos = [{ id: crypto.randomUUID(), text: t, done: false, createdAt: now, updatedAt: now, priority: 'Medium', deadline: null }, ...todos];
    setTodos(newTodos);
    save('todos', newTodos);
    setQuickTask('');
  }

  const metricTiles = [
    { label: 'Active Tasks', value: activeTasks.length, detail: 'LocalStorage cached', accent: 'bg-teal-500' },
    { label: 'Completed', value: completedTasks.length, detail: `${progressPercent}% completion`, accent: 'bg-emerald-500' },
    { label: 'Planned Blocks', value: plannedBlocks, detail: 'Deadline aware', accent: 'bg-sky-500' },
    { label: 'Focus Today', value: fmtDuration(todayStats.seconds), detail: `${todayStats.sessions} sessions`, accent: 'bg-rose-500' },
  ];

  return (
    <section className="flex w-full flex-col gap-5 animate-[fadeIn_0.4s_ease-out]">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel relative overflow-hidden p-5 sm:p-7 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#14b8a6,#0ea5e9,#f43f5e,#f59e0b)]" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">
                {getTimeOfDay()}, {preferredName}.
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-zinc-500 dark:text-zinc-400">
                A fast, offline-first command center for sorting priorities, tracking deadlines, and turning focus sessions into measurable output.
              </p>
            </div>

            <form onSubmit={handleQuickAdd} className="w-full max-w-xl">
              <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-950/80">
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Capture a task and press Enter" value={quickTask} onChange={e => setQuickTask(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-white" />
                  <button type="submit" disabled={!quickTask.trim()} className="primary-button disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-white/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metricTiles.map(tile => (
              <div key={tile.label} className="metric-card">
                <div className={`mb-4 h-2 w-10 rounded-full ${tile.accent}`} />
                <div className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">{tile.value}</div>
                <div className="mt-1 text-sm font-extrabold text-zinc-700 dark:text-zinc-200">{tile.label}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{tile.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel overflow-hidden p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Today</div>
              <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">Execution Score</h2>
            </div>
            <button onClick={() => goTo('analytics')} className="icon-button" title="Open analytics">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div className="mt-7 grid place-items-center">
            <div className="relative grid h-48 w-48 place-items-center rounded-full bg-[conic-gradient(#14b8a6_var(--p),rgba(228,228,231,0.75)_0)] dark:bg-[conic-gradient(#2dd4bf_var(--p),rgba(255,255,255,0.10)_0)]" style={{ '--p': `${progressPercent}%` }}>
              <div className="grid h-36 w-36 place-items-center rounded-full bg-white shadow-inner dark:bg-zinc-950">
                <div className="text-center">
                  <div className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white">{progressPercent}%</div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Done</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            <button onClick={() => goTo('tasks')} className="panel-soft p-3 transition hover:-translate-y-0.5"><div className="text-xl font-black text-zinc-950 dark:text-white">{totalTasks}</div><div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tasks</div></button>
            <button onClick={() => goTo('planner')} className="panel-soft p-3 transition hover:-translate-y-0.5"><div className="text-xl font-black text-zinc-950 dark:text-white">{plannedBlocks}</div><div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Blocks</div></button>
            <button onClick={() => goTo('focus')} className="panel-soft p-3 transition hover:-translate-y-0.5"><div className="text-xl font-black text-zinc-950 dark:text-white">{todayStats.sessions}</div><div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Focus</div></button>
          </div>
        </aside>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Sorted queue</div><h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">Priority Next</h2></div>
            <button onClick={() => goTo('tasks')} className="primary-button">Manage Tasks</button>
          </div>

          <div className="space-y-3">
            {sortedPriorityTasks.length === 0 ? (
              <div className="panel-soft grid min-h-40 place-items-center p-6 text-center"><div><div className="text-xl font-black text-zinc-950 dark:text-white">No active tasks</div><div className="mt-2 text-sm font-semibold text-zinc-500">Your queue is clear.</div></div></div>
            ) : sortedPriorityTasks.map((task, index) => (
              <button key={task.id} onClick={() => goTo('tasks')} className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-zinc-200 bg-white/78 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-teal-400/40">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white dark:bg-white dark:text-zinc-950">{index + 1}</span>
                <span className="min-w-0"><span className="block truncate text-base font-black text-zinc-950 dark:text-white">{task.text}</span><span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">{task.priority || 'Medium'} priority - {deadlineLabel(task.deadline)}</span></span>
                <span className={`h-3 w-3 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Low' ? 'bg-sky-500' : 'bg-amber-500'}`} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div><div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Knowledge</div><h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">Recent Notes</h2></div>
            <button onClick={() => goTo('notes')} className="icon-button" title="Open notes"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg></button>
          </div>

          <div className="space-y-3">
            {recentNotes.length === 0 ? (
              <div className="panel-soft grid min-h-40 place-items-center p-6 text-center"><div><div className="text-xl font-black text-zinc-950 dark:text-white">No notes yet</div><div className="mt-2 text-sm font-semibold text-zinc-500">Capture decisions while you work.</div></div></div>
            ) : recentNotes.map(note => (
              <button key={note.id} onClick={() => goTo('notes')} className="block w-full rounded-2xl border border-zinc-200 bg-white/78 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.045]">
                <div className="truncate text-base font-black text-zinc-950 dark:text-white">{note.title || 'Untitled Note'}</div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">{note.content || 'No content provided.'}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
