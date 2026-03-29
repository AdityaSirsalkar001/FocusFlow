import React, { useEffect, useMemo, useState } from 'react';

export default function CommandPalette({ open, onClose, goTo, actions }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onClose(open ? false : true); }
      if (e.key === 'Escape') onClose(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const list = useMemo(() => {
    const base = [
      { id: 'nav:focus', label: 'Go to Focus', run: () => goTo('focus') },
      { id: 'nav:tasks', label: 'Go to Tasks', run: () => goTo('tasks') },
      { id: 'nav:notes', label: 'Go to Notes', run: () => goTo('notes') },
      { id: 'nav:planner', label: 'Go to Planner', run: () => goTo('planner') },
      { id: 'nav:analytics', label: 'Go to Analytics', run: () => goTo('analytics') },
      { id: 'nav:settings', label: 'Go to Settings', run: () => goTo('settings') },
      ...(actions||[])
    ];
    const text = q.toLowerCase();
    if (!text) return base;
    return base.filter(a => a.label.toLowerCase().includes(text));
  }, [q, goTo, actions]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center pt-[15vh] px-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => onClose(false)}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col h-max max-h-[60vh]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-white placeholder-slate-400" 
            autoFocus 
            placeholder="Type a command or search..." 
            value={q} 
            onChange={e => setQ(e.target.value)} 
          />
          <kbd className="hidden sm:inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 rounded font-mono">ESC</kbd>
        </div>
        
        <div className="overflow-y-auto p-2">
          {list.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No commands found.</div>
          ) : (
            list.map(a => (
              <button 
                key={a.id} 
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-colors" 
                onClick={() => { a.run(); onClose(false); setQ(''); }}
              >
                {a.label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}