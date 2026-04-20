import React, { useState, useEffect } from 'react';
import { Shield, LockKeyhole, Timer, Fingerprint, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/utils';

export function SecurityPoliciesView() {
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(15);
  const [strictMode, setStrictMode] = useState(true);
  const [devMode, setDevMode] = useState(false);

  // Load preferences from local storage
  useEffect(() => {
    const prefsStr = localStorage.getItem('ciob_security_prefs');
    if (prefsStr) {
      try {
        const prefs = JSON.parse(prefsStr);
        if (prefs.autoLogoutMinutes !== undefined) setAutoLogoutMinutes(prefs.autoLogoutMinutes);
        if (prefs.strictMode !== undefined) setStrictMode(prefs.strictMode);
        if (prefs.devMode !== undefined) setDevMode(prefs.devMode);
      } catch (e) {
        console.error("Failed to parse security preferences");
      }
    }
  }, []);

  const handleSave = () => {
    const prefs = {
      autoLogoutMinutes,
      strictMode,
      devMode
    };
    localStorage.setItem('ciob_security_prefs', JSON.stringify(prefs));
    toast.success('System Security Policies synchronized.', {
       icon: <Shield className="w-4 h-4 text-rose-500" />
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 pt-4 px-6 md:px-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
         <div className="absolute -top-10 -left-10 w-80 h-80 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-4 uppercase">
              <Shield className="w-10 h-10 text-blue-500 " />
              Security Policies
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              System Access & Session Management
            </p>
         </div>
         <button 
            onClick={handleSave}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] shrink-0 active:scale-95 group relative overflow-hidden"
         >
           <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
           <span className="relative z-10">ENFORCE POLICIES</span>
         </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        
        {/* Session Timeout */}
        <div className="titan-card p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-500 bg-black/40 border-white/5">
          <div className="flex gap-8 items-center w-full md:w-auto mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-all duration-700">
               <Timer className="w-8 h-8 text-slate-400 transition-all duration-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1">Session Expiration</h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm">Determine the inactivity threshold before automatic logout.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-black/60 p-3 rounded-2xl border border-white/10 shadow-inner w-full md:w-auto justify-between md:justify-start">
            <input 
              type="number" 
              min="1" 
              max="120"
              value={autoLogoutMinutes}
              onChange={(e) => setAutoLogoutMinutes(parseInt(e.target.value))}
              className="w-20 bg-transparent text-center text-2xl font-bold text-white outline-none focus:text-blue-500 transition-all focus:scale-110"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 pr-4">Minutes</span>
          </div>
        </div>

        {/* Strict Hardware Validation */}
        <div className="titan-card p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-500 bg-black/40 border-white/5">
          <div className="flex gap-8 items-center w-full md:w-auto mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[1.25rem] border border-white/5 flex items-center justify-center shadow-inner  transition-all duration-700 bg-white/5">
               <Fingerprint className="w-8 h-8 text-slate-400 transition-all duration-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1">Strict Authentication</h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm">Require re-authentication for all destructive system events.</p>
            </div>
          </div>
          <button 
             onClick={() => setStrictMode(!strictMode)}
             className={cn(
               "w-16 h-9 rounded-full border transition-all relative outline-none active:scale-95 shadow-inner grow-0 shrink-0", 
               strictMode 
                ? "bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                : "bg-black/50 border-white/10"
             )}
          >
             <div className={cn(
               "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white transition-all shadow-md", 
               strictMode ? "left-8 rotate-0" : "left-1.5 rotate-45 opacity-40"
             )} />
          </button>
        </div>

        {/* Developer Mode */}
        <div className="titan-card p-8 flex flex-col md:flex-row items-center justify-between transition-all duration-500 bg-black/40 border-white/5 cursor-pointer" onClick={() => setDevMode(!devMode)}>
          <div className="flex gap-8 items-center w-full md:w-auto mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 border border-white/5 flex items-center justify-center shadow-inner transition-all duration-700 ">
               < Code2 className="w-8 h-8 text-slate-400 transition-all duration-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1">Developer Mode</h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm">Enable technical diagnostics and database views.</p>
            </div>
          </div>
          <button 
             onClick={(e) => { e.stopPropagation(); setDevMode(!devMode); }}
             className={cn(
               "w-16 h-9 rounded-full border transition-all relative outline-none active:scale-95 shadow-inner grow-0 shrink-0", 
               devMode 
                ? "bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                : "bg-black/50 border-white/10"
             )}
          >
             <div className={cn(
               "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-white transition-all shadow-md", 
               devMode ? "left-8 rotate-0" : "left-1.5 rotate-45 opacity-40"
             )} />
          </button>
        </div>

      </div>
    </div>
  );
}

