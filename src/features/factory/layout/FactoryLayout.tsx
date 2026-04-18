import React, { useEffect } from 'react';
import { Factory, Cpu, Network } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { OrganizationView } from '../../organization/views/OrganizationView';
import { MachineRegistryView } from '../../organization/views/MachineRegistryView';
import { FactoryExcelHubView } from '../views/FactoryExcelHubView';
import { FileSpreadsheet } from 'lucide-react';

const FACTORY_COMPONENTS = {
  'organization': OrganizationView,
  'machine-registry': MachineRegistryView,
  'excel-hub': FactoryExcelHubView,
};

function SidebarItem({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title?: string }) {
  // Indigo variant
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 border",
        isActive 
          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
          : "bg-transparent text-[var(--text-dim)] border-transparent hover:bg-white/5 hover:text-[var(--text-bright)]"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </button>
  );
}

export function FactoryLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'organization', title: 'Sectors & Staff', component: 'organization' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Factory Admin"
        portalIcon={<Factory />}
        colorClass="bg-indigo-500/20"
        borderClass="border-indigo-500/30"
        textClass="text-indigo-400"
      >
        <SidebarItem 
          icon={<Network />} 
          isActive={activeTabId === 'organization'} 
          onClick={() => openTab({ id: 'organization', title: 'Sectors & Staff', component: 'organization' })}
          title="Sectors & Staff"
        />
        <SidebarItem 
          icon={<Cpu />} 
          isActive={activeTabId === 'machine-registry'} 
          onClick={() => openTab({ id: 'machine-registry', title: 'Machine Registry', component: 'machine-registry' })}
          title="Machine Registry"
        />
        <SidebarItem 
          icon={<FileSpreadsheet />} 
          isActive={activeTabId === 'excel-hub'} 
          onClick={() => openTab({ id: 'excel-hub', title: 'Plant Excel Hub', component: 'excel-hub' })}
          title="Plant Excel Hub"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={FACTORY_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
