import React, { useState, useEffect } from 'react';
import { Shield, LockKeyhole, Timer, Fingerprint, Code2 } from 'lucide-react';
import { GlassCard } from '@/shared/components/GlassCard';
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
    toast.success('Security Policies updated successfully.', {
       icon: <Shield className="w-4 h-4 text-rose-400" />
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="pt-2 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-white tracking-tight mb-2 flex items-center gap-3">
             <Shield className="w-8 h-8 text-rose-400" /> Security Policies
           </h1>
           <p className="text-white/50 text-lg">Manage device-level security constraints and session parameters.</p>
        </div>
        <button 
           onClick={handleSave}
           className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-black font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] shrink-0"
        >
          Enforce Policies
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Session Timeout */}
        <GlassCard className="p-6 border border-white/10 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
          <div className="flex gap-6 items-center">
            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-rose-500/30 transition-colors">
               <Timer className="w-7 h-7 text-white/50 group-hover:text-rose-400 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Session Inactivity Timeout</h3>
              <p className="text-sm text-white/50 max-w-md">Automatically revoke access and require PIN verification if the device is left idle.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/30 p-2 rounded-xl border border-white/5">
            <input 
              type="number" 
              min="1" 
              max="120"
              value={autoLogoutMinutes}
              onChange={(e) => setAutoLogoutMinutes(parseInt(e.target.value))}
              className="w-16 bg-transparent text-center text-xl font-mono text-white outline-none"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 pr-2">Minutes</span>
          </div>
        </GlassCard>

        {/* Strict Hardware Validation (Mock feature) */}
        <GlassCard className="p-6 border border-white/10 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
          <div className="flex gap-6 items-center">
            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-rose-500/30 transition-colors">
               <Fingerprint className="w-7 h-7 text-white/50 group-hover:text-rose-400 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Strict Identity Verification</h3>
              <p className="text-sm text-white/50 max-w-md">Require re-authentication for critical destructive operations (e.g., Deleting Schedules or Users).</p>
            </div>
          </div>
          <button 
             onClick={() => setStrictMode(!strictMode)}
             className={cn("w-14 h-8 rounded-full border-2 transition-all relative", strictMode ? "bg-rose-500 border-rose-500" : "bg-black/50 border-white/10")}
          >
             <div className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white transition-all shadow-md", strictMode ? "left-7" : "left-1")} />
          </button>
        </GlassCard>

        {/* Developer Mode */}
        <GlassCard className="p-6 border border-white/10 flex items-center justify-between group hover:border-rose-500/30 transition-colors">
          <div className="flex gap-6 items-center">
            <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center shadow-inner group-hover:border-rose-500/30 transition-colors">
               <Code2 className="w-7 h-7 text-white/50 group-hover:text-rose-400 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Developer & Debug Mode</h3>
              <p className="text-sm text-white/50 max-w-md">Expose database internals, bypass client-side limits, and reveal system error tracing.</p>
            </div>
          </div>
          <button 
             onClick={() => setDevMode(!devMode)}
             className={cn("w-14 h-8 rounded-full border-2 transition-all relative", devMode ? "bg-amber-500 border-amber-500" : "bg-black/50 border-white/10")}
          >
             <div className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white transition-all shadow-md", devMode ? "left-7" : "left-1")} />
          </button>
        </GlassCard>

      </div>
    </div>
  );
}
