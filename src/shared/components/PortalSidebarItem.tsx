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
        "w-full h-11 relative flex items-center justify-center transition-all duration-200 group rounded-[10px] active:scale-95 font-sans",
        isActive 
          ? "bg-slate-200/70 dark:bg-white/10 text-current shadow-sm" 
          : "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-400/20 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      {/* Fluent Active Indicator Pill */}
      <div 
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-current transition-all duration-300",
          isActive ? "h-5 opacity-100" : "h-0 opacity-0 group-hover:h-3 group-hover:opacity-30 group-hover:bg-slate-400 dark:group-hover:bg-white/50"
        )} 
      />

      {React.cloneElement(icon as React.ReactElement, { 
        className: cn(
          "w-[18px] h-[18px] transition-transform duration-300", 
          isActive ? "scale-110 drop-shadow-sm font-bold" : "group-hover:scale-105"
        ) 
      })}
    </button>
  );
}

