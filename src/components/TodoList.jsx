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

// Helper to format datetime-local inputs
function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
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
    setItems([{ 
      id: crypto.randomUUID(), 
      text: t, 
      done: false, 
      createdAt: now, 
      updatedAt: now, 
      priority: newPriority,
      deadline: newDeadline || null
    }, ...items]);
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
      setPulseId(id); triggerCelebrate(); setTimeout(() => setPulseId(null), 800);
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

  // Automated Priority-Sorting & Deadline Algorithm
  const shown = useMemo(() => {
    let list = items;
    if (filter === 'active') list = list.filter(i => !i.done);
    if (filter === 'done') list = list.filter(i => i.done);
    
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

    return list.sort((a, b) => {
      // 1. Active tasks always above completed tasks
      if (a.done !== b.done) return a.done ? 1 : -1;
      
      // 2. If both are done, sort by recently updated
      if (a.done) return b.updatedAt - a.updatedAt;

      // 3. Sort by Priority (High > Medium > Low)
      const weightA = priorityWeight[a.priority || 'Medium'] || 2;
      const weightB = priorityWeight[b.priority || 'Medium'] || 2;
      if (weightA !== weightB) return weightB - weightA;

      // 4. If priority is the same, sort by Deadline (earliest first)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1; // Tasks with deadlines go above tasks without deadlines
      if (b.deadline) return 1;

      // 5. Fallback: newest created first
      return b.createdAt - a.createdAt;
    });
  }, [items, filter]);

  // Color coding for priorities
  const priorityColors = {
    'High': 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    'Medium': 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    'Low': 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h3>
        <button className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors" onClick={clearCompleted}>Clear Completed</button>
      </div>

      {/* Advanced Quick Add Toolbar */}
      <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex flex-1 items-center gap-2">
          <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all" placeholder="What needs to be done?" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem(); }} />
          <button className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors shadow-sm shrink-0" onClick={addItem} aria-label="Add task">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <input type="datetime-local" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
        <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none shrink-0" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Tasks</option>
          <option value="active">Active Only</option>
          <option value="done">Completed</option>
        </select>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {shown.length === 0 && <div className="text-center py-10 text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">No tasks found. Enjoy your day!</div>}
        {shown.map(item => {
          const isOverdue = item.deadline && !item.done && new Date(item.deadline) < new Date();
          return (
            <div key={item.id} className={`flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border rounded-2xl transition-all ${item.done ? 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900/50' : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md'} ${pulseId === item.id ? 'ring-2 ring-green-500 scale-[1.02]' : ''}`}>
              <div className="flex items-center gap-4">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500 cursor-pointer shrink-0" checked={item.done} onChange={() => toggle(item.id)} />
                <input className={`flex-1 bg-transparent border-none outline-none font-medium text-lg ${item.done ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`} value={item.text} onChange={e => edit(item.id, e.target.value)} placeholder="Task description..." />
                
                {/* Priority Badge */}
                {!item.done && (
                   <select 
                     className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer appearance-none shrink-0 text-center ${priorityColors[item.priority || 'Medium']}`}
                     value={item.priority || 'Medium'}
                     onChange={e => setItem(item.id, { priority: e.target.value })}
                   >
                     <option value="High">High</option>
                     <option value="Medium">Medium</option>
                     <option value="Low">Low</option>
                   </select>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pl-9">
                {/* Deadline Input */}
                <input 
                  type="datetime-local" 
                  className={`w-[180px] bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg px-2.5 py-1 text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:outline-none transition-colors ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-500'}`} 
                  value={formatDateTime(item.deadline)} 
                  onChange={e => setItem(item.id, { deadline: e.target.value })} 
                />

                <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto" onClick={() => remove(item.id)} title="Delete task">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {celebrate && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.3)_0%,transparent_60%)] animate-[burst_0.8s_ease-out_forwards]"></div>
        </div>
      )}
    </div>
  );
}