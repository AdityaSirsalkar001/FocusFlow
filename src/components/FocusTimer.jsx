import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInterval, usePersistentState } from '../lib/hooks.js';
import { load, save } from '../lib/storage.js';

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function incTodaySeconds(delta = 1) {
  const key = 'stats:focus';
  const stats = load(key, {});
  const k = dateKey();
  const cur = stats[k] || { seconds: 0, sessions: 0 };
  cur.seconds += delta;
  stats[k] = cur;
  save(key, stats);
}

export default function FocusTimer() {
  const [settings] = usePersistentState('timer:settings', {
    focusMin: 25, shortBreakMin: 5, longBreakMin: 15, roundsUntilLong: 4, autoStartBreaks: false, autoStartFocus: true
  });

  const [modeType, setModeType] = usePersistentState('timer:type', 'timer');
  const [mode, setMode] = usePersistentState('timer:mode', 'focus');
  const [round, setRound] = usePersistentState('timer:round', 1);
  const [remaining, setRemaining] = usePersistentState('timer:remaining', 25 * 60);
  const [running, setRunning] = usePersistentState('timer:running', false);

  // Persistence Logic: Store the timestamp when the timer started/resumed
  const [startTime, setStartTime] = usePersistentState('timer:startTime', null);

  const wrapRef = useRef(null);
  const [isFs, setIsFs] = useState(false);
  
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const total = useMemo(() => (
    mode === 'focus' ? settings.focusMin * 60 : mode === 'short' ? settings.shortBreakMin * 60 : settings.longBreakMin * 60
  ), [mode, settings]);

  // Sync effect: When the app loads or tab becomes active, calculate the "lost" time
  useEffect(() => {
    if (running && startTime) {
      const elapsedSinceStart = Math.floor((Date.now() - startTime) / 1000);
      const newRemaining = Math.max(0, total - elapsedSinceStart);
      setRemaining(newRemaining);
      
      if (newRemaining === 0) {
        handleComplete();
      }
    }
  }, []);

  useInterval(() => {
    if (!running || modeType !== 'timer') return;

    const now = Date.now();
    const elapsedSinceStart = Math.floor((now - startTime) / 1000);
    const calculatedRemaining = total - elapsedSinceStart;

    if (calculatedRemaining <= 0) {
      setRemaining(0);
      handleComplete();
    } else {
      setRemaining(calculatedRemaining);
      if (mode === 'focus') incTodaySeconds(1);
    }
  }, 1000);

  function handleComplete() {
    setRunning(false);
    setStartTime(null);
    // Logic for next rounds would go here
  }

  function start() {
    // Save exactly when we started so other tabs can calculate progress
    const now = Date.now();
    const currentElapsed = total - remaining;
    setStartTime(now - (currentElapsed * 1000)); 
    setRunning(true);
  }

  function pause() {
    setRunning(false);
    setStartTime(null);
  }

  function reset() {
    setRunning(false);
    setStartTime(null);
    setRemaining(total);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) { wrapRef.current?.requestFullscreen?.(); } 
    else { document.exitFullscreen?.(); }
  }

  const ringColor = mode === 'focus' ? 'text-blue-500' : 'text-amber-500';
  const ambientGlow = mode === 'focus' ? 'bg-blue-500/20' : 'bg-amber-500/20';

  return (
    <div ref={wrapRef} className={`flex justify-center w-full transition-all duration-700 ${isFs ? 'fixed inset-0 z-[100] bg-slate-950 items-center justify-center overflow-hidden' : ''}`}>
      {isFs && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-[70vmin] h-[70vmin] rounded-full blur-[120px] ${ambientGlow} ${running ? 'animate-pulse' : 'opacity-40'}`}></div>
        </div>
      )}

      <div className={`relative z-10 w-full max-w-2xl flex flex-col ${isFs ? 'bg-transparent border-none items-center' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8'}`}>
        {!isFs && (
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Focus Space</h3>
             <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Persistent Timer</div>
           </div>
        )}

        <div className="flex flex-col items-center w-full">
          <div className={`relative mb-10 flex justify-center items-center ${ringColor} ${isFs ? 'mt-[-10vh]' : ''}`}>
            <svg viewBox="0 0 220 220" width={isFs ? 450 : 280} height={isFs ? 450 : 280} className="drop-shadow-2xl">
              <circle cx="110" cy="110" r="90" strokeWidth={isFs ? 3 : 8} fill="none" className={isFs ? 'stroke-white/5' : 'stroke-slate-200 dark:stroke-slate-800'} />
              <circle 
                cx="110" cy="110" r="90" strokeWidth={isFs ? 4 : 8} fill="none" stroke="currentColor" 
                strokeDasharray={2 * Math.PI * 90} 
                strokeDashoffset={(2 * Math.PI * 90) * (1 - (remaining / total))} 
                strokeLinecap="round" transform="rotate(-90 110 110)" 
                className="transition-all duration-1000 ease-linear" 
              />
              <text x="110" y={isFs ? "130" : "125"} textAnchor="middle" fontSize={isFs ? 64 : 52} fontWeight={isFs ? "900" : "800"} fill={isFs ? "white" : "currentColor"} className="font-sans tabular-nums tracking-tighter">{fmt(remaining)}</text>
            </svg>
          </div>

          <div className={`flex items-center gap-6 ${isFs ? 'fixed bottom-12 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full' : 'mb-8'}`}>
            {!running ? (
              <button className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg" onClick={start}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            ) : (
              <button className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full" onClick={pause}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              </button>
            )}
            <button className="w-12 h-12 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 rounded-full" onClick={reset}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
            <button className="w-12 h-12 flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-500 rounded-full" onClick={toggleFullscreen}>
              {isFs ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> 
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}