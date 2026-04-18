import React, { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, ClipboardCheck } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { StockDashboardPage } from '../views/StockDashboardPage';
import { PdrLibraryPage } from '../views/PdrLibraryPage';
import { PartDetail } from '../views/PartDetail';
import { ProcurementView } from '@/features/procurement/views/ProcurementView';
import { RequisitionHubView } from '@/features/requisition/views/RequisitionHubView';
import { ExcelHubView } from '../views/ExcelHubView';
import { FileSpreadsheet } from 'lucide-react';

const PDR_COMPONENTS = {
  'pdr-dashboard': StockDashboardPage,
  'inventory-list': PdrLibraryPage,
  'part-detail': PartDetail,
  'procurement': ProcurementView,
  'requisition-hub': RequisitionHubView,
  'excel-hub': ExcelHubView,
};

function SidebarItem({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 border",
        isActive 
          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]" 
          : "bg-transparent text-[var(--text-dim)] border-transparent hover:bg-white/5 hover:text-white"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </button>
  );
}

export function PdrLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'dashboard', title: 'Stock Radar', component: 'pdr-dashboard' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="PDR Engine"
        portalIcon={<Package />}
        colorClass="bg-cyan-500/20"
        borderClass="border-cyan-500/30"
        textClass="text-cyan-400"
      >
        <SidebarItem 
          icon={<LayoutDashboard />} 
          isActive={activeTabId === 'dashboard'} 
          onClick={() => openTab({ id: 'dashboard', title: 'Stock Radar', component: 'pdr-dashboard' })}
          title="Stock Radar"
        />
        <SidebarItem 
          icon={<Package />} 
          isActive={activeTabId === 'inventory'} 
          onClick={() => openTab({ id: 'inventory', title: 'PDR Library', component: 'inventory-list' })}
          title="PDR Library"
        />
        <SidebarItem 
          icon={<ShoppingCart />} 
          isActive={activeTabId === 'procurement'} 
          onClick={() => openTab({ id: 'procurement', title: 'Procurement v4', component: 'procurement' })}
          title="Procurement"
        />
        <SidebarItem 
          icon={<ClipboardCheck />} 
          isActive={activeTabId === 'requisition-hub'} 
          onClick={() => openTab({ id: 'requisition-hub', title: 'Requisition Hub', component: 'requisition-hub' })}
          title="Requisition Hub"
        />
        <SidebarItem 
          icon={<FileSpreadsheet />} 
          isActive={activeTabId === 'excel-hub'} 
          onClick={() => openTab({ id: 'excel-hub', title: 'Excel Hub', component: 'excel-hub' })}
          title="Excel Data Integration"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={PDR_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
