import React from 'react';
import { cn } from '@/shared/utils';

interface PortalSidebarProps {
  portalName: string;
  portalIcon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  textClass: string;
  children: React.ReactNode;
}

export function PortalSidebar({ portalName, portalIcon, colorClass, borderClass, textClass, children }: PortalSidebarProps) {
  const nameParts = portalName.split(' ');

  return (
    <aside className="w-[84px] border-r border-white/5 bg-black/60 backdrop-blur-3xl flex flex-col items-center py-6 gap-3 shrink-0 z-40 overflow-y-auto custom-scrollbar shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      
      {/* Portal Identity */}
      <div className="flex flex-col items-center shrink-0 mb-2">
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border mb-3 shadow-[inset_0_1px_rgba(255,255,255,0.1),_0_0_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 duration-300", colorClass, borderClass)}>
           {React.cloneElement(portalIcon as React.ReactElement, { className: cn("w-6 h-6 drop-shadow-md", textClass) })}
         </div>
         <span className={cn("text-[9px] uppercase tracking-widest font-bold text-center leading-tight opacity-70", textClass)}>
           {nameParts.map((word, i) => (
             <React.Fragment key={i}>
               {word}
               {i < nameParts.length - 1 && <br/>}
             </React.Fragment>
           ))}
         </span>
      </div>

      <div className="w-8 h-px bg-white/10 shrink-0 my-3" />

      {/* Portal Content (Nav Items) */}
      <div className="flex flex-col gap-3 shrink-0 items-center w-full px-2">
         {children}
      </div>
    </aside>
  );
}
