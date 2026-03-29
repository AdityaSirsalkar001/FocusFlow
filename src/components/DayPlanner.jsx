import React, { useState } from 'react';
import { usePersistentState } from '../lib/hooks.js';

function hoursRange(start = 6, end = 22) {
  const arr = [];
  for (let h = start; h <= end; h++) arr.push(h);
  return arr;
}

function dateKeyLocal(d = new Date()) { 
  const y=d.getFullYear(); 
  const m=String(d.getMonth()+1).padStart(2,'0'); 
  const day=String(d.getDate()).padStart(2,'0'); 
  return `${y}-${m}-${day}`; 
}

function fmtDateInput(k) { return k; }

function addDays(d, delta) { 
  const nd = new Date(d + 'T00:00:00'); 
  nd.setDate(nd.getDate() + delta); 
  return nd; 
}

function labelFor(key) { 
  const d = new Date(key + 'T00:00:00'); 
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); 
}

export default function DayPlanner() {
  const [myPlanner, setMyPlanner] = usePersistentState('planner', {});
  const [selected, setSelected] = usePersistentState('planner:date', dateKeyLocal());
  const [days, setDays] = usePersistentState('planner:span', 5);
  const [todos, setTodos] = usePersistentState('todos', []);
  const [editing, setEditing] = useState(null);

  function getDaySlots(map, dayKey) { return map[dayKey] || {}; }
  function slotFor(map, dayKey, hour) {
    const v = getDaySlots(map, dayKey)[hour];
    if (typeof v === 'string') return { text: v, done: false, todoId: null };
    return { text: v?.text || '', done: !!v?.done, todoId: v?.todoId || null };
  }

  function createLinkedTodo(setMap, map, dayKey, hour, text, done) {
    const now = Date.now();
    const todo = { id: crypto.randomUUID(), text, done: !!done, createdAt: now, updatedAt: now, project: 'Planner', tags: [] };
    setTodos([todo, ...todos]);
    const nextDay = { ...getDaySlots(map, dayKey), [hour]: { text, done: !!done, todoId: todo.id } };
    setMap({ ...map, [dayKey]: nextDay });
    return todo.id;
  }

  function setSlotGeneric(setMap, map, dayKey, hour, text) {
    const prev = slotFor(map, dayKey, hour);
    const nextDay = { ...getDaySlots(map, dayKey), [hour]: { text, done: prev.done, todoId: prev.todoId || null } };
    setMap({ ...map, [dayKey]: nextDay });
    const t = text.trim();
    if (t && prev.todoId) {
      setTodos(todos.map(td => td.id === prev.todoId ? { ...td, text: t, updatedAt: Date.now() } : td));
    }
  }

  function setDoneGeneric(setMap, map, dayKey, hour, done) {
    const prev = slotFor(map, dayKey, hour);
    const nextDay = { ...getDaySlots(map, dayKey), [hour]: { text: prev.text, done, todoId: prev.todoId || null } };
    setMap({ ...map, [dayKey]: nextDay });
    if (prev.todoId) {
      setTodos(todos.map(td => td.id === prev.todoId ? { ...td, done, updatedAt: Date.now() } : td));
    } else if (prev.text && prev.text.trim()) {
      const id = createLinkedTodo(setMap, map, dayKey, hour, prev.text.trim(), done);
      setTodos(todos.map(td => td.id === id ? { ...td, done } : td));
    }
  }

  function changeDate(deltaDays) {
    const d = new Date(selected + 'T00:00:00');
    d.setDate(d.getDate() + deltaDays);
    setSelected(dateKeyLocal(d));
  }

  function addTodoFromSlotGeneric(setMap, map, dayKey, hour) {
    const slot = slotFor(map, dayKey, hour);
    const t = slot.text.trim();
    if (!t || slot.todoId) return;
    createLinkedTodo(setMap, map, dayKey, hour, t, slot.done);
  }

  function deleteLinkedTodoGeneric(setMap, map, dayKey, hour) {
    const slot = slotFor(map, dayKey, hour);
    if (!slot.todoId) return;
    setTodos(todos.filter(td => td.id !== slot.todoId));
    const day = { ...getDaySlots(map, dayKey) };
    delete day[hour];
    setMap({ ...map, [dayKey]: day });
  }

  const dayKeys = Array.from({ length: Number(days) }, (_, i) => dateKeyLocal(addDays(selected, i)));

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Time Blocking Planner</h3>
        
        <div className="flex flex-wrap items-center gap-3 mb-8 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onClick={() => changeDate(-Number(days))}>Previous</button>
          <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onClick={() => setSelected(dateKeyLocal())}>Today</button>
          <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" onClick={() => changeDate(Number(days))}>Next</button>
          
          <input className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:border-purple-500 text-slate-700 dark:text-white" type="date" value={fmtDateInput(selected)} onChange={e => setSelected(e.target.value)} />
          
          <select className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none text-slate-700 dark:text-white" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={3}>3 days view</option>
            <option value={5}>5 days view</option>
            <option value={7}>7 days view</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 hide-scrollbar">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="flex bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="w-20 p-3 text-right text-xs font-semibold text-slate-500">Time</div>
              {dayKeys.map(k => (
                <div key={k} className="flex-1 p-3 text-center text-sm font-bold text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700">{labelFor(k)}</div>
              ))}
            </div>
            
            {/* Grid Body */}
            <div className="flex flex-col bg-white dark:bg-slate-900 relative">
              {hoursRange().map(h => (
                <div key={h} className="flex border-b border-slate-100 dark:border-slate-800/50">
                  <div className="w-20 p-3 text-right text-xs font-medium text-slate-400 select-none pt-4">{String(h).padStart(2, '0')}:00</div>
                  {dayKeys.map(k => {
                    const slot = slotFor(myPlanner, k, h);
                    const key = 'me|' + k + '|' + h;
                    const isEditing = editing === key;
                    
                    return (
                      <div key={k + h} className="flex-1 p-2 border-l border-slate-100 dark:border-slate-800/50 relative group">
                        <div className={`flex gap-2 rounded-xl border transition-all h-full min-h-[60px] p-2 ${slot.text ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50' : 'bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-700'} ${isEditing ? 'ring-2 ring-purple-500 border-transparent bg-white dark:bg-slate-800' : ''} ${slot.done ? 'opacity-60 bg-slate-50 dark:bg-slate-800 grayscale' : ''}`}>
                          
                          {slot.text && (
                            <input type="checkbox" className="mt-1 w-4 h-4 rounded text-purple-500 focus:ring-purple-500 cursor-pointer shrink-0" checked={slot.done} onChange={e => setDoneGeneric(setMyPlanner, myPlanner, k, h, e.target.checked)} />
                          )}
                          
                          <textarea 
                            className={`flex-1 w-full resize-none bg-transparent outline-none text-sm leading-tight text-slate-700 dark:text-slate-300 ${slot.done ? 'line-through text-slate-400' : ''}`} 
                            value={slot.text} 
                            placeholder="" 
                            onChange={e => setSlotGeneric(setMyPlanner, myPlanner, k, h, e.target.value)} 
                            onFocus={() => setEditing(key)} 
                            onBlur={() => setTimeout(() => setEditing(curr => curr === key ? null : curr), 150)} 
                          />
                          
                          {isEditing && slot.text.trim() && !slot.todoId && (
                            <button className="absolute bottom-2 right-2 text-xs bg-purple-500 text-white px-2 py-1 rounded shadow-sm hover:bg-purple-600" onMouseDown={e => e.preventDefault()} onClick={() => addTodoFromSlotGeneric(setMyPlanner, myPlanner, k, h)}>+ Task</button>
                          )}
                          {isEditing && slot.todoId && (
                            <button className="absolute bottom-2 right-2 text-xs bg-red-500 text-white px-2 py-1 rounded shadow-sm hover:bg-red-600" onMouseDown={e => e.preventDefault()} onClick={() => deleteLinkedTodoGeneric(setMyPlanner, myPlanner, k, h)}>Unlink</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}