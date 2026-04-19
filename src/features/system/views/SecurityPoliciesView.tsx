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
            <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2 flex items-center gap-4 uppercase">
              <Shield className="w-10 h-10 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
              Policy Matrix
            </h1>
            <p className="text-[#8b9bb4] uppercase tracking-[0.3em] text-[10px] font-bold flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
              Terminal Access & Session Integrity
            </p>
         </div>
         <button 
            onClick={handleSave}
            className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] shrink-0 active:scale-95 group relative overflow-hidden"
         >
           <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
           <span className="relative z-10">ENFORCE POLICIES</span>
         </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        
        {/* Session Timeout */}
        <div className="titan-card p-8 flex flex-col md:flex-row items-center justify-between group hover:border-rose-500/40 transition-all duration-500 bg-black/40 border-white/5">
          <div className="flex gap-8 items-center w-full md:w-auto mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[1.25rem] bg-rose-500/[0.02] border border-white/5 flex items-center justify-center shadow-inner group-hover:border-rose-500/50 transition-all duration-700 group-hover:scale-105">
               <Timer className="w-8 h-8 text-white/20 group-hover:text-rose-500 transition-all duration-700 drop-shadow-[0_0_10px_rgba(244,63,94,0)] group-hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Session Expiration</h3>
              <p className="text-xs text-[#8b9bb4] italic font-medium max-w-sm">Determine the inactivity threshold before terminal lockout.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-black/60 p-3 rounded-2xl border border-white/10 shadow-inner w-full md:w-auto justify-between md:justify-start">
            <input 
              type="number" 
              min="1" 
              max="120"
              value={autoLogoutMinutes}
              onChange={(e) => setAutoLogoutMinutes(parseInt(e.target.value))}
              className="w-20 bg-transparent text-center text-2xl font-black text-white outline-none focus:text-rose-500 transition-all focus:scale-110"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pr-4">Minutes</span>
          </div>
        </div>

        {/* Strict Hardware Validation */}
        <div className="titan-card p-8 flex flex-col md:flex-row items-center justify-between group hover:border-rose-500/40 transition-all duration-500 bg-black/40 border-white/5">
          <div className="flex gap-8 items-center w-full md:w-auto mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[1.25rem] bg-rose-500/[0.02] border border-white/5 flex items-center justify-center shadow-inner group-hover:border-rose-500/50 transition-all duration-700 group-hover:scale-105">
               <Fingerprint className="w-8 h-8 text-white/20 group-hover:text-rose-500 transition-all duration-700 group-hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Zero-Trust Protocol</h3>
              <p className="text-xs text-[#8b9bb4] italic font-medium max-w-sm">Strict re-authentication for all destructive system events.</p>
            </div>
          </div>
          <button 
             onClick={() => setStrictMode(!strictMode)}
             className={cn(
               "w-16 h-9 rounded-full border transition-all relative outline-none active:scale-95 shadow-inner grow-0 shrink-0", 
               strictMode 
                ? "bg-rose-500 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]" 
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
        <div className="titan-card p-8 flex flex-col md:flex-row items-center justify-between group hover:border-amber-500/40 transition-all duration-500 bg-black/40 border-white/5 cursor-pointer" onClick={() => setDevMode(!devMode)}>
          <div className="flex gap-8 items-center w-full md:w-auto mb-6 md:mb-0">
            <div className="w-16 h-16 rounded-[1.25rem] bg-amber-500/[0.02] border border-white/5 flex items-center justify-center shadow-inner group-hover:border-amber-500/50 transition-all duration-700 group-hover:scale-105">
               < Code2 className="w-8 h-8 text-white/20 group-hover:text-amber-500 transition-all duration-700 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Architect Access</h3>
              <p className="text-xs text-[#8b9bb4] italic font-medium max-w-sm">Reveal database core flux and technical diagnostic telemetry.</p>
            </div>
          </div>
          <button 
             onClick={(e) => { e.stopPropagation(); setDevMode(!devMode); }}
             className={cn(
               "w-16 h-9 rounded-full border transition-all relative outline-none active:scale-95 shadow-inner grow-0 shrink-0", 
               devMode 
                ? "bg-amber-500 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
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

