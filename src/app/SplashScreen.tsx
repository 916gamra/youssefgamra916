import React from 'react';
import { motion } from 'motion/react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 mb-8 relative">
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 blur-xl opacity-50"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-light tracking-widest mb-2">CIOB <span className="font-bold">GMAO</span></h1>
        <p className="text-zinc-500 text-sm tracking-widest uppercase mb-12">v17.0 PDR Engine</p>
        
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
