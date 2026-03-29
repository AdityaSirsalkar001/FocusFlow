import React from 'react';
import { usePersistentState } from '../lib/hooks.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function Settings() {
  const [settings, setSettings] = usePersistentState('timer:settings', {
    focusMin: 25, shortBreakMin: 5, longBreakMin: 15, roundsUntilLong: 4, autoStartBreaks: false, autoStartFocus: true
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Settings</h3>
      
      <div className="flex flex-col gap-10">
        
        {/* Appearance */}
        <div>
          <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">General</h4>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Appearance Theme</div>
              <div className="text-sm text-slate-500">Toggle light or dark mode</div>
            </div>
            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"><ThemeToggle /></div>
          </div>
        </div>

        {/* Timer Settings */}
        <div>
          <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Focus Timer Configuration</h4>
          
          <div className="flex gap-3 mb-6 flex-wrap">
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors" onClick={() => setSettings({ ...settings, focusMin: 25, shortBreakMin: 5, longBreakMin: 15 })}>Pomodoro (25/5/15)</button>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors" onClick={() => setSettings({ ...settings, focusMin: 50, shortBreakMin: 10, longBreakMin: 20 })}>Deep Work (50/10/20)</button>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors" onClick={() => setSettings({ ...settings, focusMin: 90, shortBreakMin: 10, longBreakMin: 30 })}>Flow State (90/10/30)</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Focus Duration (min)</span>
              <input className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-center text-slate-900 dark:text-white outline-none focus:border-blue-500" type="number" min="1" max="180" value={settings.focusMin} onChange={(e) => setSettings({ ...settings, focusMin: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Short Break (min)</span>
              <input className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-center text-slate-900 dark:text-white outline-none focus:border-amber-500" type="number" min="1" max="60" value={settings.shortBreakMin} onChange={(e) => setSettings({ ...settings, shortBreakMin: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Long Break (min)</span>
              <input className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-center text-slate-900 dark:text-white outline-none focus:border-purple-500" type="number" min="1" max="60" value={settings.longBreakMin} onChange={(e) => setSettings({ ...settings, longBreakMin: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rounds before Long Break</span>
              <input className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-center text-slate-900 dark:text-white outline-none focus:border-blue-500" type="number" min="1" max="10" value={settings.roundsUntilLong} onChange={(e) => setSettings({ ...settings, roundsUntilLong: Number(e.target.value) })} />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-start Breaks</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.autoStartBreaks} onChange={(e) => setSettings({ ...settings, autoStartBreaks: e.target.checked })} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-start Focus</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.autoStartFocus} onChange={(e) => setSettings({ ...settings, autoStartFocus: e.target.checked })} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}