import React, { useEffect } from 'react';
import { Network, BookOpen, Database } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { CatalogView } from '../views/CatalogView';

const MASTER_COMPONENTS = {
  'catalog': CatalogView,
};

function SidebarItem({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title?: string }) {
  // Amber variant
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 border",
        isActive 
          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
          : "bg-transparent text-[var(--text-dim)] border-transparent hover:bg-white/5 hover:text-white"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </button>
  );
}

export function MasterDataLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'catalog', title: 'Part Blueprints', component: 'catalog' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Part Catalog"
        portalIcon={<Database />}
        colorClass="bg-amber-500/20"
        borderClass="border-amber-500/30"
        textClass="text-amber-400"
      >
        <SidebarItem 
          icon={<BookOpen />} 
          isActive={activeTabId === 'catalog'} 
          onClick={() => openTab({ id: 'catalog', title: 'Part Blueprints', component: 'catalog' })}
          title="Part Catalog & Blueprints"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={MASTER_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
