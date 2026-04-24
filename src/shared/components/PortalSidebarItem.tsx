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
 * Ensures consistent styling and interaction logic using an industrial SCADA-like UI.
 */
export function PortalSidebarItem({ icon, isActive, onClick, title }: PortalSidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-full h-14 relative flex items-center justify-center transition-all duration-300 group overflow-hidden font-mono",
        isActive 
          ? "bg-current/5 text-current" 
          : "bg-transparent text-white/30 hover:bg-white/5 hover:text-white/80"
      )}
    >
      {/* Active Indicator Bar */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 transition-all duration-300",
          isActive ? "w-[3px] bg-current shadow-[0_0_12px_currentColor]" : "w-[2px] bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-white/30"
        )} 
      />

      {/* Inner Hover/Active Accent lines */}
      {isActive && (
        <>
          <div className="absolute top-0 right-0 w-3 h-[1px] bg-current opacity-60" />
          <div className="absolute bottom-0 right-0 w-3 h-[1px] bg-current opacity-60" />
        </>
      )}

      {/* Icon Frame */}
      <div className={cn(
        "relative w-10 h-10 flex items-center justify-center border transition-all duration-300 pointer-events-none",
        isActive ? "border-current bg-current/10 scale-110 shadow-[inset_0_0_10px_currentColor]" : "border-transparent group-hover:border-white/10 group-hover:scale-105"
      )}>
        {/* Subtle decorative corners for the active state frame */}
        {isActive && (
           <>
             <div className="absolute top-[-1px] left-[-1px] w-1.5 h-1.5 border-t border-l border-current opacity-80" />
             <div className="absolute bottom-[-1px] right-[-1px] w-1.5 h-1.5 border-b border-r border-current opacity-80" />
           </>
        )}

        {React.cloneElement(icon as React.ReactElement, { 
          className: cn("w-5 h-5", isActive ? "drop-shadow-[0_0_8px_currentColor]" : "") 
        })}
      </div>
      
    </button>
  );
}

