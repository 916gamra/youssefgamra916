import React, { useEffect } from 'react';
import { ShieldCheck, KanbanSquare, CalendarClock, HardHat, FileSpreadsheet, LayoutDashboard } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';

import { PreventiveDashboard } from '../views/PreventiveDashboard';
import { ChecklistsView } from '../views/ChecklistsView';
import { SchedulesView } from '../views/SchedulesView';
import { WorkOrdersView } from '../views/WorkOrdersView';
import { ShieldExcelHubView } from '../views/ShieldExcelHubView';

const PREVENTIVE_COMPONENTS = {
  'pm-dashboard': PreventiveDashboard,
  'pm-checklists': ChecklistsView,
  'pm-schedules': SchedulesView,
  'pm-work-orders': WorkOrdersView,
  'pm-excel': ShieldExcelHubView,
};

export function PreventiveLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'pm-dashboard', title: 'Shield Radar', component: 'pm-dashboard' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Shield Ops"
        portalIcon={<ShieldCheck />}
        colorClass="text-emerald-500 bg-emerald-500/20"
        borderClass="border-emerald-500/30"
        textClass="text-emerald-400"
      >
        <PortalSidebarItem 
          icon={<LayoutDashboard />} 
          isActive={activeTabId === 'pm-dashboard'} 
          onClick={() => openTab({ id: 'pm-dashboard', title: 'Shield Radar', component: 'pm-dashboard' })}
          title="Shield Radar"
        />
        <PortalSidebarItem 
          icon={<KanbanSquare />} 
          isActive={activeTabId === 'pm-checklists'} 
          onClick={() => openTab({ id: 'pm-checklists', title: 'Blueprint Library', component: 'pm-checklists' })}
          title="Protocols Lib"
        />
        <PortalSidebarItem 
          icon={<CalendarClock />} 
          isActive={activeTabId === 'pm-schedules'} 
          onClick={() => openTab({ id: 'pm-schedules', title: 'Tactical Schedules', component: 'pm-schedules' })}
          title="PM Scheduler"
        />
        <PortalSidebarItem 
          icon={<HardHat />} 
          isActive={activeTabId === 'pm-work-orders'} 
          onClick={() => openTab({ id: 'pm-work-orders', title: 'Field Operations', component: 'pm-work-orders' })}
          title="Work Orders"
        />
        <PortalSidebarItem 
          icon={<FileSpreadsheet />} 
          isActive={activeTabId === 'pm-excel'} 
          onClick={() => openTab({ id: 'pm-excel', title: 'Integration Hub', component: 'pm-excel' })}
          title="Excel Data Hub"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={PREVENTIVE_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}


