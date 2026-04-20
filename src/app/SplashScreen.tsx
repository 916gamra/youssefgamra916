import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Database } from 'lucide-react';

const BOOT_LOGS = [
  "Initializing system framework...",
  "Authenticating access token...",
  "Mounting local database volumes...",
  "Loading PDR maintenance blueprints...",
  "Synchronizing facility assets...",
  "System environment ready."
];

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex(prev => {
        if (prev < BOOT_LOGS.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    const timer = setTimeout(onComplete, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center w-full max-w-md px-8"
      >
        {/* Industrial Corporate Logo */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 leading-none">
              TITANIC
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">
              Maintenance Management
            </p>
          </div>
        </div>
        
        {/* Progress Container */}
        <div className="w-full relative mt-16 px-4">
           {/* Clean Status Text */}
           <div className="h-5 mb-3 flex justify-between items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
             <motion.span 
                key={logIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
             >
                {BOOT_LOGS[logIndex]}
             </motion.span>
             <span className="text-slate-600">
               {Math.min(100, Math.round(((logIndex + 1) / BOOT_LOGS.length) * 100))}%
             </span>
           </div>

           {/* Precision Loading Bar */}
           <div className="w-full h-1 bg-slate-800 rounded-none overflow-hidden">
             <motion.div 
               className="h-full bg-blue-600"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 2.8, ease: "easeInOut" }}
             />
           </div>
        </div>

        {/* Minimal Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex gap-6 mt-16 opacity-50"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-slate-600" /> Secure Boot
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Database className="w-4 h-4 text-slate-600" /> Offline Ready
          </div>
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-8 text-[10px] text-slate-600 tracking-wider font-semibold uppercase">
        CIOB GMAO v1.0.0 — Enterprise Edition
      </div>
    </div>
  );
}
