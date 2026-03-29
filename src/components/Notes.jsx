import React, { useMemo, useState } from 'react';
import { usePersistentState } from '../lib/hooks.js';

export default function Notes() {
  const [notes, setNotes] = usePersistentState('notes', []);
  const [query, setQuery] = usePersistentState('notes:query', '');
  const [selectedId, setSelectedId] = usePersistentState('notes:selected', null);

  function addNote() {
    const now = Date.now();
    const newNote = { id: crypto.randomUUID(), title: '', content: '', createdAt: now, updatedAt: now };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
  }

  function remove(id) {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function setTitle(id, title) { setNotes(notes.map(n => n.id === id ? { ...n, title, updatedAt: Date.now() } : n)); }
  function setContent(id, content) { setNotes(notes.map(n => n.id === id ? { ...n, content, updatedAt: Date.now() } : n)); }

  const filtered = useMemo(() => {
    const q = (query || '').toLowerCase();
    const list = notes;
    if (!q) return list;
    return list.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
  }, [query, notes]);

  const selected = notes.find(n => n.id === selectedId) || null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Notes</h3>
        <div className="flex gap-3 flex-1 max-w-md">
          <input className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" placeholder="Search notes..." value={query} onChange={e => setQuery(e.target.value)} />
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap" onClick={addNote}>New Note</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Notes List */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">All Notes</div>
          <ul className="overflow-y-auto flex-1 p-2 space-y-1">
            {filtered.length === 0 && <li className="p-4 text-center text-sm text-slate-500">No notes found.</li>}
            {filtered.map(n => (
              <li key={n.id} onClick={() => setSelectedId(n.id)} className={`p-3 rounded-xl cursor-pointer transition-colors group ${selectedId === n.id ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}>
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-slate-900 dark:text-white truncate pr-2">{n.title || 'Untitled'}</strong>
                  <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity" onClick={(e) => { e.stopPropagation(); remove(n.id); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
                <div className="text-xs text-slate-500 mb-1">{new Date(n.updatedAt).toLocaleDateString()}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{n.content || '...'}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a note to edit or create a new one.</div>
          ) : (
            <div className="flex-1 flex flex-col p-6 gap-4">
              <input className="text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600" placeholder="Note Title" value={selected.title} onChange={e => setTitle(selected.id, e.target.value)} />
              <textarea className="flex-1 w-full resize-none bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 leading-relaxed" placeholder="Start typing your notes here..." value={selected.content} onChange={e => setContent(selected.id, e.target.value)} />
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Last edited: {new Date(selected.updatedAt).toLocaleString()}</span>
                <button className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={() => remove(selected.id)}>Delete Note</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}