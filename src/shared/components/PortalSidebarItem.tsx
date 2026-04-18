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
        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 border",
        isActive 
          ? "bg-current/10 border-current shadow-[0_0_15px_rgba(34,211,238,0.15)] filter brightness-110" 
          : "bg-transparent text-[var(--text-dim)] border-transparent hover:bg-white/5 hover:text-white"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </button>
  );
}
