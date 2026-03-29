import React, { useRef } from 'react';
import { usePersistentState } from '../lib/hooks.js';
import Analytics from './Analytics.jsx';

export default function Profile() {
  // Use local storage for all profile data
  const [displayName, setDisplayName] = usePersistentState('profile:name', '');
  const [email, setEmail] = usePersistentState('profile:email', '');
  const [avatar, setAvatar] = usePersistentState('profile:avatar', '');
  const fileInputRef = useRef(null);

  const initial = (displayName || email || 'U').slice(0, 1).toUpperCase();

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Save base64 image to local storage
      };
      reader.readAsDataURL(file);
    }
  }

  function clearProfile() {
    if (confirm('Are you sure you want to clear your profile info?')) {
      setDisplayName('');
      setEmail('');
      setAvatar('');
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      
      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Profile Details</h3>
        
        <div className="flex flex-col gap-10">
          
          {/* User Info Header with Image Upload */}
          <div className="flex flex-wrap items-center gap-6">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload avatar"
            >
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-lg shadow-blue-500/20 shrink-0 border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-3xl md:text-4xl font-black shadow-lg shadow-blue-500/20 shrink-0" aria-hidden="true">
                  {initial}
                </div>
              )}
              {/* Hover overlay for upload */}
              <div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="flex flex-col pt-1">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {displayName || 'Guest User'}
              </div>
              <div className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {email || 'No email provided'}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-mono bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg self-start">
                Local Account
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="flex flex-col gap-4 max-w-2xl">
            <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">Edit Details</h4>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl gap-4">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Display Name</div>
                <div className="text-sm text-slate-500 font-medium mt-0.5">How you appear in the app</div>
              </div>
              <input 
                className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
                placeholder="Your name" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl gap-4">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Email Address</div>
                <div className="text-sm text-slate-500 font-medium mt-0.5">For your personal records</div>
              </div>
              <input 
                className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" 
                placeholder="you@example.com" 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-start">
            <button 
              className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-all shadow-sm" 
              onClick={clearProfile}
            >
              Clear Profile Data
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <h4 className="text-xl font-bold text-slate-900 dark:text-white px-2">Your Activity</h4>
        <Analytics />
      </div>

    </div>
  );
}