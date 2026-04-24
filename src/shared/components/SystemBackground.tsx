import React from 'react';

export function SystemBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none bg-[#020202]">
      {/* Dynamic Orbs - Darker, more industrial/stealth */}
      <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-slate-800/10 blur-[130px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-cyan-900/5 blur-[150px] rounded-full mix-blend-screen" />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      
      {/* Subtle Grid - SCADA / Technical feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: `64px 64px`,
        }}
      />
      {/* Micro-grid for extra detail */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: `16px 16px`,
        }}
      />
    </div>
  );
}
