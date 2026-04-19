import React, { useEffect } from 'react';
import { Settings, Shield, Users, HardDriveDownload, ShieldAlert } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';

import { UserManagementView } from '../views/UserManagementView';
import { DataCoreView } from '../views/DataCoreView';
import { SecurityPoliciesView } from '../views/SecurityPoliciesView';
import { AuditTrailView } from '../views/AuditTrailView';

const SETTINGS_COMPONENTS = {
  'user-management': UserManagementView,
  'data-core': DataCoreView,
  'security-policies': SecurityPoliciesView,
  'audit-trail': AuditTrailView,
};

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
        colorClass="text-rose-500 bg-rose-500/20"
        borderClass="border-rose-500/30"
        textClass="text-rose-400"
      >
        <PortalSidebarItem 
          icon={<Users />} 
          isActive={activeTabId === 'user-management'} 
          onClick={() => openTab({ id: 'user-management', title: 'RBAC & Users', component: 'user-management' })}
          title="RBAC & Users"
        />
        <PortalSidebarItem 
          icon={<HardDriveDownload />} 
          isActive={activeTabId === 'data-core'} 
          onClick={() => openTab({ id: 'data-core', title: 'Data Core Backup', component: 'data-core' })}
          title="Data Core & Backup"
        />
        <PortalSidebarItem 
          icon={<Shield />} 
          isActive={activeTabId === 'security-policies'} 
          onClick={() => openTab({ id: 'security-policies', title: 'Security Policies', component: 'security-policies' })}
          title="Security Policies"
        />
        <PortalSidebarItem 
          icon={<ShieldAlert />} 
          isActive={activeTabId === 'audit-trail'} 
          onClick={() => openTab({ id: 'audit-trail', title: 'Audit Trail', component: 'audit-trail' })}
          title="System Audit Trail"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={SETTINGS_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}

