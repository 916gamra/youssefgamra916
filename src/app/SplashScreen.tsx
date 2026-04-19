import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Hexagon, Settings, ShieldCheck } from 'lucide-react';

const BOOT_LOGS = [
  "INITIALIZING TITANIC CORE...",
  "LOADING KERNEL MODULES...",
  "MOUNTING INDUSTRIAL DATA DRIVES...",
  "VERIFYING PDR ENGINE INTEGRITY...",
  "ESTABLISHING PREVENTIVE PROTOCOLS...",
  "SYNCING FACTORY ASSETS...",
  "CALIBRATING SENSORS...",
  "SECURING RBAC MATRICES...",
  "TITANIC OS READY."
];

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    // Total duration ~3000ms
    const interval = setInterval(() => {
      setLogIndex(prev => {
        if (prev < BOOT_LOGS.length - 1) return prev + 1;
        return prev;
      });
    }, 250);

    const timer = setTimeout(onComplete, 3500);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] text-white overflow-hidden font-sans">
      {/* Heavy Industrial Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
        <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        {/* Radial faint glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center w-full max-w-lg px-8"
      >
        {/* Industrial Logo Wrapper */}
        <div className="w-32 h-32 mb-10 relative flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 border-[3px] border-cyan-500/30 rounded-xl"
            animate={{ rotate: 180 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 border-2 border-dashed border-cyan-400/40 rounded-full"
            animate={{ rotate: -90 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative z-10 flex items-center justify-center">
            <Hexagon className="w-20 h-20 text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] fill-black/50" strokeWidth={1} />
            <motion.div 
              className="absolute"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-8 h-8 text-white drop-shadow-[0_0_8px_currentColor]" />
            </motion.div>
          </div>
        </div>
        
        {/* Typography */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg uppercase leading-none">
            TITANIC
            <span className="text-cyan-500 font-light tracking-[0.1em] ml-2">OS</span>
          </h1>
          <p className="text-cyan-400/80 text-xs md:text-sm tracking-[0.4em] uppercase font-mono flex items-center justify-center gap-3">
             <span className="w-6 h-px bg-cyan-500/50" />
             Industrial Maintenance Core
             <span className="w-6 h-px bg-cyan-500/50" />
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full relative px-4">
           {/* Terminal Boot Log */}
           <div className="h-6 mb-2 overflow-hidden flex justify-center">
             <motion.div 
                key={logIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[10px] md:text-xs font-mono text-cyan-500/70 tracking-wider uppercase text-center"
             >
                &gt; {BOOT_LOGS[logIndex]}
             </motion.div>
           </div>

           {/* Loading Bar */}
           <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
             <motion.div 
               className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 3, ease: "easeInOut" }}
             />
           </div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 text-[9px] text-zinc-600 tracking-[0.3em] font-mono uppercase">
        Ver 17.0.5 - Strategic Command
      </div>
    </div>
  );
}
