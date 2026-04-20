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
 * Ensures consistent styling and interaction logic.
 */
export function PortalSidebarItem({ icon, isActive, onClick, title }: PortalSidebarItemProps) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[1.25rem] transition-all duration-500 border relative group",
        isActive 
          ? "bg-current/15 border-current shadow-[0_0_20px_rgba(34,211,238,0.2)]" 
          : "bg-transparent text-[#8b9bb4]/40 border-transparent hover:bg-white/5 hover:text-white/80 hover:scale-105"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { 
        className: cn(
          "w-6 h-6 transition-transform duration-500", 
          isActive && "scale-110 "
        ) 
      })}
    </button>
  );
}

