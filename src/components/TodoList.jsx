import React, { useEffect, useMemo, useState } from 'react';
import { usePersistentState } from '../lib/hooks.js';
import { playTone } from '../lib/sound.js';

function nextDue(date, recurring) {
  const d = new Date(date);
  if (recurring === 'daily') d.setDate(d.getDate() + 1);
  if (recurring === 'weekly') d.setDate(d.getDate() + 7);
  if (recurring === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function dueState(item) {
  if (!item.deadline || item.done) return { label: 'No deadline', tone: 'text-zinc-400' };
  const diff = new Date(item.deadline).getTime() - Date.now();
  if (diff < 0) return { label: 'Overdue', tone: 'text-rose-500' };
  if (diff < 86400000) return { label: 'Due today', tone: 'text-amber-500' };
  return { label: new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), tone: 'text-sky-500' };
}

export default function TodoList() {
  const [items, setItems] = usePersistentState('todos', []);
  const [text, setText] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [filter, setFilter] = useState('all');
  const [planner, setPlanner] = usePersistentState('planner', {});
  const [celebrate, setCelebrate] = useState(false);
  const [pulseId, setPulseId] = useState(null);

  function addItem() {
    const t = text.trim();
    if (!t) return;
    const now = Date.now();
    setItems([{ id: crypto.randomUUID(), text: t, done: false, createdAt: now, updatedAt: now, priority: newPriority, deadline: newDeadline || null }, ...items]);
    setText('');
    setNewPriority('Medium');
    setNewDeadline('');
  }

  function triggerCelebrate() {
    try {
      playTone({ freq: 880, duration: 110, type: 'triangle' });
      setTimeout(() => playTone({ freq: 1318.5, duration: 130, type: 'triangle' }), 120);
      setTimeout(() => playTone({ freq: 1760, duration: 140, type: 'triangle' }), 260);
    } catch {}
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 900);
  }

  function toggle(id) {
    const target = items.find(i => i.id === id);
    const willBeDone = target ? !target.done : false;
    const nextItems = items.map(i => {
      if (i.id !== id) return i;
      const done = !i.done;
      const updated = { ...i, done, updatedAt: Date.now() };
      if (done && i.recurring && i.recurring !== 'none' && i.dueAt) {
        const next = { ...i, id: crypto.randomUUID(), done: false, createdAt: Date.now(), updatedAt: Date.now(), dueAt: nextDue(i.dueAt, i.recurring) };
        return [updated, next];
      }
      return updated;
    }).flat();
    setItems(nextItems);

    const newPlanner = { ...planner };
    Object.keys(newPlanner).forEach(dayKey => {
      const day = newPlanner[dayKey] || {};
      let changed = false;
      Object.keys(day).forEach(h => {
        const v = day[h];
        if (v && typeof v === 'object' && v.todoId === id) { day[h] = { ...v, done: willBeDone }; changed = true; }
      });
      if (changed) newPlanner[dayKey] = { ...day };
    });
    setPlanner(newPlanner);

    if (willBeDone) {
      setPulseId(id);
      triggerCelebrate();
      setTimeout(() => setPulseId(null), 800);
    }
  }

  function remove(id) {
    setItems(items.filter(i => i.id !== id));
    const newPlanner = { ...planner };
    let touched = false;
    Object.keys(newPlanner).forEach(dayKey => {
      const day = { ...(newPlanner[dayKey] || {}) };
      let changed = false;
      Object.keys(day).forEach(h => {
        const v = day[h];
        if (v && typeof v === 'object' && v.todoId === id) { delete day[h]; changed = true; touched = true; }
      });
      if (changed) newPlanner[dayKey] = day;
    });
    if (touched) setPlanner(newPlanner);
  }

  function edit(id, value) { setItems(items.map(i => i.id === id ? { ...i, text: value, updatedAt: Date.now() } : i)); }
  function setItem(id, patch) { setItems(items.map(i => i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i)); }

  function clearCompleted() {
    const toRemove = new Set(items.filter(i => i.done).map(i => i.id));
    setItems(items.filter(i => !i.done));
    if (toRemove.size === 0) return;
    const newPlanner = { ...planner };
    let touched = false;
    Object.keys(newPlanner).forEach(dayKey => {
      const day = { ...(newPlanner[dayKey] || {}) };
      let changed = false;
      Object.keys(day).forEach(h => {
        const v = day[h];
        if (v && typeof v === 'object' && v.todoId && toRemove.has(v.todoId)) { delete day[h]; changed = true; touched = true; }
      });
      if (changed) newPlanner[dayKey] = day;
    });
    if (touched) setPlanner(newPlanner);
  }

  const shown = useMemo(() => {
    let list = [...items];
    if (filter === 'active') list = list.filter(i => !i.done);
    if (filter === 'done') list = list.filter(i => i.done);
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    return list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.done) return b.updatedAt - a.updatedAt;
      const weightA = priorityWeight[a.priority || 'Medium'] || 2;
      const weightB = priorityWeight[b.priority || 'Medium'] || 2;
      if (weightA !== weightB) return weightB - weightA;
      if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [items, filter]);

  const total = items.length;
  const done = items.filter(i => i.done).length;
  const active = total - done;
  const high = items.filter(i => !i.done && i.priority === 'High').length;
  const overdue = items.filter(i => i.deadline && !i.done && new Date(i.deadline) < new Date()).length;
  const completion = total === 0 ? 0 : Math.round((done / total) * 100);

  const priorityColors = {
    High: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-400/25',
    Medium: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-400/25',
    Low: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-500/10 dark:border-sky-400/25',
  };

  const metrics = [
    { label: 'Total', value: total, dot: 'bg-zinc-950 dark:bg-white' },
    { label: 'Active', value: active, dot: 'bg-teal-500' },
    { label: 'High Priority', value: high, dot: 'bg-rose-500' },
    { label: 'Overdue', value: overdue, dot: 'bg-amber-500' },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr] animate-[fadeIn_0.4s_ease-out]">
      <aside className="panel p-5 sm:p-6 xl:sticky xl:top-32 xl:self-start">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Task engine</div>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">Smart Queue</h2>
          </div>
          <div className="rounded-2xl bg-zinc-950 px-3 py-2 text-sm font-black text-white dark:bg-white dark:text-zinc-950">{completion}%</div>
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-white/10">
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6,#0ea5e9)] transition-all duration-700" style={{ width: `${completion}%` }} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {metrics.map(metric => (
            <div key={metric.label} className="metric-card">
              <div className={`mb-3 h-2 w-8 rounded-full ${metric.dot}`} />
              <div className="text-3xl font-black text-zinc-950 dark:text-white">{metric.value}</div>
              <div className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 panel-soft p-3">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Create task</div>
          <div className="space-y-3">
            <input className="control w-full" placeholder="What needs to be done?" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem(); }} />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <select className="control w-full" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <input type="datetime-local" className="control w-full" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
            </div>
            <button className="primary-button w-full" onClick={addItem}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to queue
            </button>
          </div>
        </div>
      </aside>

      <section className="panel p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">Auto sorted by priority and deadline</div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">Tasks</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="control" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Tasks</option>
              <option value="active">Active Only</option>
              <option value="done">Completed</option>
            </select>
            <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-black text-rose-600 transition hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300" onClick={clearCompleted}>Clear Completed</button>
          </div>
        </div>

        <div className="space-y-3">
          {shown.length === 0 && <div className="panel-soft grid min-h-56 place-items-center p-6 text-center"><div><div className="text-2xl font-black text-zinc-950 dark:text-white">No tasks found</div><div className="mt-2 text-sm font-semibold text-zinc-500">Create a task to start the queue.</div></div></div>}
          {shown.map(item => {
            const due = dueState(item);
            return (
              <div key={item.id} className={`rounded-2xl border p-4 transition-all ${item.done ? 'border-zinc-200 bg-zinc-50/75 opacity-70 dark:border-white/10 dark:bg-white/[0.025]' : 'border-zinc-200 bg-white/82 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-teal-400/40'} ${pulseId === item.id ? 'ring-4 ring-emerald-500/25' : ''}`}>
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
                  <input type="checkbox" className="h-5 w-5 rounded border-zinc-300 text-teal-500 focus:ring-teal-500" checked={item.done} onChange={() => toggle(item.id)} />
                  <input className={`min-w-0 bg-transparent text-lg font-black outline-none ${item.done ? 'text-zinc-400 line-through' : 'text-zinc-950 dark:text-white'}`} value={item.text} onChange={e => edit(item.id, e.target.value)} placeholder="Task description" />
                  {!item.done && (
                    <select className={`w-full rounded-xl border px-3 py-2 text-xs font-black outline-none sm:w-28 ${priorityColors[item.priority || 'Medium']}`} value={item.priority || 'Medium'} onChange={e => setItem(item.id, { priority: e.target.value })}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  )}
                  <button className="icon-button justify-self-start text-zinc-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10" onClick={() => remove(item.id)} title="Delete task">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 sm:pl-8">
                  <span className={`text-xs font-black uppercase tracking-[0.14em] ${due.tone}`}>{due.label}</span>
                  <input type="datetime-local" className="control max-w-[220px] py-1.5 text-xs" value={formatDateTime(item.deadline)} onChange={e => setItem(item.id, { deadline: e.target.value })} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {celebrate && <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"><div className="h-[50vw] w-[50vw] animate-[burst_0.8s_ease-out_forwards] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.30)_0%,transparent_60%)]" /></div>}
    </div>
  );
}
