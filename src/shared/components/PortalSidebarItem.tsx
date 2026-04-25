import React from 'react';
import { cn } from '@/shared/utils';

interface PortalSidebarItemProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  title?: string;
}

/**
 * Shared sidebar item component for all portals.
 * Windows 11 Fluent Design style.
 */
export function PortalSidebarItem({ icon, isActive, onClick, title }: PortalSidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-full h-11 relative flex items-center justify-center transition-all duration-300 group rounded-xl active:scale-95 font-sans z-10 overflow-hidden",
        isActive 
          ? "bg-slate-200/70 dark:bg-white/[0.04] text-current shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-none border border-transparent dark:border-white/[0.05]" 
          : "bg-transparent text-slate-500 dark:text-slate-500 hover:bg-slate-400/20 dark:hover:bg-white/[0.02] hover:text-slate-900 dark:hover:text-white border border-transparent dark:hover:border-white/[0.02]"
      )}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-current/5 to-transparent pointer-events-none" />
      )}
      
      {/* Fluent Active Indicator Pill */}
      <div 
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-current transition-all duration-500 ease-out shadow-[0_0_8px_currentColor]",
          isActive ? "h-6 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-30 group-hover:shadow-none dark:group-hover:bg-white/50"
        )} 
      />

      {React.cloneElement(icon as React.ReactElement, { 
        className: cn(
          "w-[18px] h-[18px] transition-all duration-300 relative z-10", 
          isActive ? "scale-110 drop-shadow-[0_0_8px_currentColor]" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"
        ) 
      })}
    </button>
  );
}

