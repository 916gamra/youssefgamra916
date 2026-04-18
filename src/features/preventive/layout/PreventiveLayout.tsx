import React, { useState } from 'react';
import { ShieldCheck, KanbanSquare, CalendarClock, HardHat } from 'lucide-react';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PreventiveDashboard } from '../views/PreventiveDashboard';
import { ChecklistsView } from '../views/ChecklistsView';
import { SchedulesView } from '../views/SchedulesView';
import { WorkOrdersView } from '../views/WorkOrdersView';
import { ShieldExcelHubView } from '../views/ShieldExcelHubView';
import { FileSpreadsheet } from 'lucide-react';
import { cn } from '@/shared/utils';

function SidebarItem({ icon, isActive, onClick, label }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, label?: string }) {
  // Emerald luxury variant
  return (
    <button 
      onClick={onClick}
      title={label}
      className={cn(
        "w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-[1.25rem] transition-all duration-500 border relative group",
        isActive 
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
          : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white/80 hover:scale-105"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: cn("w-6 h-6 transition-transform duration-500", isActive && "scale-110 drop-shadow-[0_0_8px_currentColor]") })}
    </button>
  );
}

export function PreventiveLayout() {
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'CHECKLISTS' | 'SCHEDULES' | 'WORK_ORDERS' | 'EXCEL'>('DASHBOARD');

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Shield Ops"
        portalIcon={<ShieldCheck />}
        colorClass="bg-emerald-500/20"
        borderClass="border-emerald-500/30"
        textClass="text-emerald-400"
      >
        <SidebarItem 
          icon={<ShieldCheck />} 
          label="Dashboard" 
          isActive={activeView === 'DASHBOARD'} 
          onClick={() => setActiveView('DASHBOARD')}
        />
        <SidebarItem 
          icon={<KanbanSquare />} 
          label="Protocols (Checklists)" 
          isActive={activeView === 'CHECKLISTS'} 
          onClick={() => setActiveView('CHECKLISTS')}
        />
        <SidebarItem 
          icon={<CalendarClock />} 
          label="Schedules" 
          isActive={activeView === 'SCHEDULES'} 
          onClick={() => setActiveView('SCHEDULES')}
        />
        <SidebarItem 
          icon={<HardHat />} 
          label="Work Orders" 
          isActive={activeView === 'WORK_ORDERS'} 
          onClick={() => setActiveView('WORK_ORDERS')}
        />
        <SidebarItem 
          icon={<FileSpreadsheet />} 
          label="Data Hub" 
          isActive={activeView === 'EXCEL'} 
          onClick={() => setActiveView('EXCEL')}
        />
      </PortalSidebar>

      <div className="flex-1 relative overflow-hidden bg-[#0a0a0f] flex flex-col">
         {/* Top Bar Blank for Tab Headers if needed later */}
         <header className="h-[44px] bg-black/40 border-b border-[var(--glass-border)] flex items-end px-2 gap-1 shrink-0"></header>
         
         <div className="flex-1 overflow-hidden relative">
            {activeView === 'DASHBOARD' && <PreventiveDashboard />}
            {activeView === 'CHECKLISTS' && <ChecklistsView />}
            {activeView === 'SCHEDULES' && <SchedulesView />}
            {activeView === 'WORK_ORDERS' && <WorkOrdersView />}
            {activeView === 'EXCEL' && <ShieldExcelHubView />}
         </div>
      </div>
    </div>
  );
}
