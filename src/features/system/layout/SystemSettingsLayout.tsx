import React, { useEffect } from 'react';
import { Settings, Shield, Users, HardDriveDownload } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { UserManagementView } from '../views/UserManagementView';
import { DataCoreView } from '../views/DataCoreView';
import { SecurityPoliciesView } from '../views/SecurityPoliciesView';

const SETTINGS_COMPONENTS = {
  'user-management': UserManagementView,
  'data-core': DataCoreView,
  'security-policies': SecurityPoliciesView,
};

function SidebarItem({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title?: string }) {
  // Rose variant
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[1.25rem] transition-all duration-500 border relative group",
        isActive 
          ? "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.2)]" 
          : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white/80 hover:scale-105"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: cn("w-6 h-6 transition-transform duration-500", isActive && "scale-110 drop-shadow-[0_0_8px_currentColor]") })}
    </button>
  );
}

export function SystemSettingsLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'user-management', title: 'RBAC & Users', component: 'user-management' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="System Config"
        portalIcon={<Settings />}
        colorClass="bg-rose-500/20"
        borderClass="border-rose-500/30"
        textClass="text-rose-400"
      >
        <SidebarItem 
          icon={<Users />} 
          isActive={activeTabId === 'user-management'} 
          onClick={() => openTab({ id: 'user-management', title: 'RBAC & Users', component: 'user-management' })}
          title="RBAC & Users"
        />
        <SidebarItem 
          icon={<HardDriveDownload />} 
          isActive={activeTabId === 'data-core'} 
          onClick={() => openTab({ id: 'data-core', title: 'Data Core Backup', component: 'data-core' })}
          title="Data Core & Backup"
        />
        <SidebarItem 
          icon={<Shield />} 
          isActive={activeTabId === 'security-policies'} 
          onClick={() => openTab({ id: 'security-policies', title: 'Security Policies', component: 'security-policies' })}
          title="Security Policies"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={SETTINGS_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
