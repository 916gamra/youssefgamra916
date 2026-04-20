import React, { useEffect } from 'react';
import { ClipboardCheck, KanbanSquare, CalendarClock, HardHat, FileSpreadsheet, LayoutDashboard } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';

import { PreventiveDashboard } from '../views/PreventiveDashboard';
import { ChecklistsView } from '../views/ChecklistsView';
import { SchedulesView } from '../views/SchedulesView';
import { WorkOrdersView } from '../views/WorkOrdersView';
import { PmExcelHubView } from '../views/PmExcelHubView';

const PREVENTIVE_COMPONENTS = {
  'pm-dashboard': PreventiveDashboard,
  'pm-checklists': ChecklistsView,
  'pm-schedules': SchedulesView,
  'pm-work-orders': WorkOrdersView,
  'pm-excel': PmExcelHubView,
};

export function PreventiveLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'pm-dashboard', title: 'Maintenance KPI', component: 'pm-dashboard' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Maintenance Ops"
        portalIcon={<ClipboardCheck />}
        colorClass="text-blue-500 bg-blue-500/20"
        borderClass="border-blue-500/30"
        textClass="text-blue-400"
      >
        <PortalSidebarItem 
          icon={<LayoutDashboard />} 
          isActive={activeTabId === 'pm-dashboard'} 
          onClick={() => openTab({ id: 'pm-dashboard', title: 'Maintenance KPI', component: 'pm-dashboard' })}
          title="Maintenance KPI"
        />
        <PortalSidebarItem 
          icon={<KanbanSquare />} 
          isActive={activeTabId === 'pm-checklists'} 
          onClick={() => openTab({ id: 'pm-checklists', title: 'Standard Protocols', component: 'pm-checklists' })}
          title="Protocols Lib"
        />
        <PortalSidebarItem 
          icon={<CalendarClock />} 
          isActive={activeTabId === 'pm-schedules'} 
          onClick={() => openTab({ id: 'pm-schedules', title: 'PM Schedules', component: 'pm-schedules' })}
          title="PM Scheduler"
        />
        <PortalSidebarItem 
          icon={<HardHat />} 
          isActive={activeTabId === 'pm-work-orders'} 
          onClick={() => openTab({ id: 'pm-work-orders', title: 'Work Orders', component: 'pm-work-orders' })}
          title="Work Orders"
        />
        <PortalSidebarItem 
          icon={<FileSpreadsheet />} 
          isActive={activeTabId === 'pm-excel'} 
          onClick={() => openTab({ id: 'pm-excel', title: 'Data Import/Export', component: 'pm-excel' })}
          title="Excel Data Hub"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={PREVENTIVE_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}


