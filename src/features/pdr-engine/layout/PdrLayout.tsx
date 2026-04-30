import React, { useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, ClipboardCheck } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';

import { StockDashboardPage } from '../views/StockDashboardPage';
import { PdrLibraryPage } from '../views/PdrLibraryPage';
import { PartDetail } from '../views/PartDetail';
import { ProcurementView } from '@/features/procurement/views/ProcurementView';
import { RequisitionHubView } from '@/features/requisition/views/RequisitionHubView';
import { AdvancedInventoryDashboard } from '../views/AdvancedInventoryDashboard';
import { ReconciliationCenterView } from '../views/ReconciliationCenterView';
import { Activity, Wrench } from 'lucide-react';

const PDR_COMPONENTS = {
  'pdr-dashboard': StockDashboardPage,
  'inventory-list': PdrLibraryPage,
  'part-detail': PartDetail,
  'procurement': ProcurementView,
  'requisition-hub': RequisitionHubView,
  'advanced-dashboard': AdvancedInventoryDashboard,
  'reconciliation': ReconciliationCenterView,
};

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
        colorClass="bg-cyan-600/20"
        borderClass="border-cyan-500/30"
        textClass="text-cyan-400"
      >
        <PortalSidebarItem 
          icon={<LayoutDashboard />} 
          isActive={activeTabId === 'dashboard'} 
          onClick={() => openTab({ id: 'dashboard', title: 'Stock Radar', component: 'pdr-dashboard' })}
          title="Stock Radar"
        />
        <PortalSidebarItem 
          icon={<Activity />} 
          isActive={activeTabId === 'advanced-dashboard'} 
          onClick={() => openTab({ id: 'advanced-dashboard', title: 'Inventory Analytics', component: 'advanced-dashboard' })}
          title="Inventory Analytics"
        />
        <PortalSidebarItem 
          icon={<Wrench />} 
          isActive={activeTabId === 'reconciliation'} 
          onClick={() => openTab({ id: 'reconciliation', title: 'Reconciliation Center', component: 'reconciliation' })}
          title="Reconciliation Center"
        />
        <PortalSidebarItem 
          icon={<Package />} 
          isActive={activeTabId === 'inventory'} 
          onClick={() => openTab({ id: 'inventory', title: 'PDR Library', component: 'inventory-list' })}
          title="PDR Library"
        />
        <PortalSidebarItem 
          icon={<ShoppingCart />} 
          isActive={activeTabId === 'procurement'} 
          onClick={() => openTab({ id: 'procurement', title: 'Procurement v4', component: 'procurement' })}
          title="Procurement"
        />
        <PortalSidebarItem 
          icon={<ClipboardCheck />} 
          isActive={activeTabId === 'requisition-hub'} 
          onClick={() => openTab({ id: 'requisition-hub', title: 'Requisition Hub', component: 'requisition-hub' })}
          title="Requisition Hub"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={PDR_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
