import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const BOOT_LOGS = [
  "SYS_INIT // CORE KERNEL LOADED",
  "SEC_AUTH // VERIFYING PROTOCOLS",
  "DATABASE // MOUNTING VOLUMES",
  "PDR_ENG // LOADING SYSTEM BLUEPRINTS",
  "SYNC_MGR // ESTABLISHING ORBITAL UPLINK",
  "STATUS // SYSTEM_READY"
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

    const timer = setTimeout(onComplete, 3200);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* Industrial framing */}
      <div className="absolute inset-6 border border-white/5 pointer-events-none z-0" />
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 pointer-events-none z-0" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 pointer-events-none z-0" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20 pointer-events-none z-0" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20 pointer-events-none z-0" />

      {/* Grid Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: `32px 32px`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center w-full max-w-2xl px-8"
      >
        {/* Animated Custom SVG Logo (Organization + Maintenance) */}
        <div className="relative mb-14">
          <motion.svg 
            className="w-32 h-32" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Hexagon - Organization */}
            <motion.path 
              d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
              stroke="white" 
              strokeWidth="1" 
              strokeOpacity="0.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Inner Bold Hexagon */}
            <motion.path 
              d="M50 14L81 32V68L50 86L19 68V32L50 14Z" 
              stroke="white" 
              strokeWidth="3" 
              strokeOpacity="0.9"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
            />
            
            {/* Precision Hub - Maintenance & Engineering */}
            <motion.circle 
              cx="50" cy="50" r="12" 
              stroke="white" 
              strokeWidth="2" 
              strokeDasharray="4 4" 
              strokeOpacity="0.6"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 2, ease: "backOut", delay: 0.5 }}
              className="origin-center"
            />
            <motion.circle 
              cx="50" cy="50" r="4" 
              fill="white" 
              fillOpacity="1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            />
            
            {/* Connecting Nodes */}
            <motion.path 
              d="M50 14V38M50 62V86M19 32L39 44M81 68L61 56M81 32L61 44M19 68L39 56" 
              stroke="white" 
              strokeWidth="1.5" 
              strokeOpacity="0.4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            />
          </motion.svg>
          
          {/* Scanning Line overlay */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-[1px] bg-white text-center shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            initial={{ top: '0%', opacity: 0 }}
            animate={{ top: ['0%', '100%', '0%'], opacity: [0, 0.5, 0.5, 0] }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          />
        </div>
        
        {/* Typographic Logo */}
        <div className="flex flex-col justify-center items-center mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-5xl md:text-6xl font-light tracking-[0.3em] text-white leading-none ml-5"
          >
            TITANIK
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex items-center gap-4 mt-6"
          >
            <div className="h-[1px] w-8 bg-white/30" />
            <p className="text-[10px] text-white/50 uppercase font-mono tracking-[0.4em] font-medium ml-2">
              Industrial Management System
            </p>
            <div className="h-[1px] w-8 bg-white/30" />
          </motion.div>
        </div>
        
        {/* Progress Container */}
        <div className="w-full max-w-sm relative mt-4">
           {/* Terminal Boot Log */}
           <div className="mb-4 text-[10px] font-mono font-medium text-white/50 uppercase tracking-widest flex flex-col h-12 justify-end">
             <AnimatePresence mode="popLayout">
               {BOOT_LOGS.slice(0, logIndex + 1).map((log, idx) => (
                 <motion.div
                    key={log}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: idx === logIndex ? 1 : 0.3, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-1 last:mb-0 last:text-white/90"
                 >
                   &gt; {log}
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>

           {/* Stealth Loading Bar */}
           <div className="w-full h-[2px] bg-white/10 rounded-none overflow-hidden relative">
             <motion.div 
               className="absolute top-0 bottom-0 left-0 bg-white"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 3, ease: "circIn" }}
               onUpdate={(latest) => {
                 // The bar visually moves toward 100%
               }}
             />
           </div>
           
           <div className="mt-3 flex justify-between tracking-widest text-[9px] font-mono text-white/30">
              <span>BOOT_SEQ</span>
              <span>{Math.min(100, Math.round(((logIndex + 1) / BOOT_LOGS.length) * 100))}%</span>
           </div>
        </div>

      </motion.div>
      
      {/* Footer Versioning */}
      <div className="absolute bottom-8 text-[9px] text-white/20 font-mono tracking-[0.3em] uppercase">
        CIOB GMAO v4.0.0 // ENCLAVE SECURE
      </div>
    </div>
  );
}
