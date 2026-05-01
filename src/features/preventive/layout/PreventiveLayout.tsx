import React, { useEffect } from 'react';
import { ClipboardCheck, KanbanSquare, CalendarClock, HardHat, LayoutDashboard } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';

import { PreventiveDashboard } from '../views/PreventiveDashboard';
import { ChecklistsView } from '../views/ChecklistsView';
import { SchedulesView } from '../views/SchedulesView';
import { WorkOrdersView } from '../views/WorkOrdersView';

const PREVENTIVE_COMPONENTS = {
  'pm-dashboard': PreventiveDashboard,
  'pm-checklists': ChecklistsView,
  'pm-schedules': SchedulesView,
  'pm-work-orders': WorkOrdersView,
};

export function PreventiveLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, openTab } = useTabStore();

  const currentTab = tabs.find(t => t.portalId === 'PREVENTIVE');
  const activeTabId = currentTab?.id;

  useEffect(() => {
    if (!currentTab) {
      openTab({ id: 'pm-dashboard', portalId: 'PREVENTIVE', title: 'Maintenance KPI', component: 'pm-dashboard' });
    }
  }, [currentTab, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Maintenance Ops"
        portalIcon={<ClipboardCheck />}
        colorClass="bg-emerald-500/10 text-emerald-500"
        borderClass="border-emerald-500/30"
        textClass="text-emerald-400"
      >
        <PortalSidebarItem 
          icon={<LayoutDashboard />} 
          isActive={activeTabId === 'pm-dashboard'} 
          onClick={() => openTab({ id: 'pm-dashboard', portalId: 'PREVENTIVE', title: 'Maintenance KPI', component: 'pm-dashboard' })}
          title="Maintenance KPI"
          colorClass="text-emerald-400"
        />
        <PortalSidebarItem 
          icon={<KanbanSquare />} 
          isActive={activeTabId === 'pm-checklists'} 
          onClick={() => openTab({ id: 'pm-checklists', portalId: 'PREVENTIVE', title: 'Standard Protocols', component: 'pm-checklists' })}
          title="Protocols Lib"
          colorClass="text-emerald-400"
        />
        <PortalSidebarItem 
          icon={<CalendarClock />} 
          isActive={activeTabId === 'pm-schedules'} 
          onClick={() => openTab({ id: 'pm-schedules', portalId: 'PREVENTIVE', title: 'PM Schedules', component: 'pm-schedules' })}
          title="PM Scheduler"
          colorClass="text-emerald-400"
        />
        <PortalSidebarItem 
          icon={<HardHat />} 
          isActive={activeTabId === 'pm-work-orders'} 
          onClick={() => openTab({ id: 'pm-work-orders', portalId: 'PREVENTIVE', title: 'Work Orders', component: 'pm-work-orders' })}
          title="Work Orders"
          colorClass="text-emerald-400"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={PREVENTIVE_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}


