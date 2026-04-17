import React from 'react';
import { useTabStore } from './store';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, Package, Settings, Wrench, Menu, LogOut, ShoppingCart, Terminal, Factory, ClipboardCheck, PieChart } from 'lucide-react';
import { cn } from '@/shared/utils';

// Placeholder components for tabs
import { StockDashboardPage } from '@/features/pdr-engine/views/StockDashboardPage';
import { PdrLibraryPage } from '@/features/pdr-engine/views/PdrLibraryPage';
import { PartDetail } from '@/features/pdr-engine/views/PartDetail';
import { SettingsView } from '@/features/settings/views/SettingsView';
import { ProcurementView } from '@/features/procurement/views/ProcurementView';
import { TerminalView } from '@/features/terminal/views/TerminalView';
import { OrganizationView } from '@/features/organization/views/OrganizationView';
import { MachineRegistryView } from '@/features/organization/views/MachineRegistryView';
import { RequisitionHubView } from '@/features/requisition/views/RequisitionHubView';
import { AnalyticsDashboardPage } from '@/features/analytics/views/AnalyticsDashboardPage';
import type { User } from '@/core/db';

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  'pdr-dashboard': StockDashboardPage,
  'inventory-list': PdrLibraryPage,
  'part-detail': PartDetail,
  'settings': SettingsView,
  'procurement': ProcurementView,
  'terminal': TerminalView,
  'organization': OrganizationView,
  'machine-registry': MachineRegistryView,
  'requisition-hub': RequisitionHubView,
  'analytics-dashboard': AnalyticsDashboardPage
};

export function DesktopLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } = useTabStore();

  // Initial tab
  React.useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'analytics-dashboard', title: 'The Oracle', component: 'analytics-dashboard' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden font-sans selection:bg-blue-500/30">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[72px] border-r border-[var(--glass-border)] flex flex-col items-center pt-5 gap-6 bg-black/20 shrink-0 overflow-y-auto custom-scrollbar pb-6">
          <SidebarItem 
            icon={<PieChart />} 
            isActive={activeTabId === 'analytics-dashboard'} 
            onClick={() => openTab({ id: 'analytics-dashboard', title: 'The Oracle', component: 'analytics-dashboard' })}
            title="The Oracle"
          />
          <SidebarItem 
            icon={<LayoutDashboard />} 
            isActive={activeTabId === 'dashboard'} 
            onClick={() => openTab({ id: 'dashboard', title: 'Stock Dashboard', component: 'pdr-dashboard' })}
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
            icon={<Wrench />} 
            isActive={activeTabId === 'organization'} 
            onClick={() => openTab({ id: 'organization', title: 'Organization', component: 'organization' })}
            title="Sectors & Staff"
          />
          <SidebarItem 
            icon={<Factory />} 
            isActive={activeTabId === 'machine-registry'} 
            onClick={() => openTab({ id: 'machine-registry', title: 'Machine Registry', component: 'machine-registry' })}
            title="Machine Registry"
          />
          <SidebarItem 
            icon={<ClipboardCheck />} 
            isActive={activeTabId === 'requisition-hub'} 
            onClick={() => openTab({ id: 'requisition-hub', title: 'Requisition Hub', component: 'requisition-hub' })}
            title="Requisition Hub"
          />
          {user?.isPrimary && (
            <SidebarItem 
              icon={<Terminal />} 
              isActive={activeTabId === 'terminal'} 
              onClick={() => openTab({ id: 'terminal', title: 'System Terminal', component: 'terminal' })}
              title="Terminal"
            />
          )}
          <div className="mt-auto flex flex-col gap-4 mb-5">
            <SidebarItem 
              icon={<Settings />} 
              isActive={activeTabId === 'settings'} 
              onClick={() => openTab({ id: 'settings', title: 'System Settings', component: 'settings' })}
              title="Settings"
            />
            <button 
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Top Bar (Chrome-like Tabs) */}
          <header className="h-[44px] bg-black/40 border-b border-[var(--glass-border)] flex items-end px-2 gap-1 shrink-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex items-center h-[36px] px-4 min-w-[160px] max-w-[240px] rounded-t-lg cursor-pointer transition-all select-none border border-b-0 text-xs gap-2",
                  tab.isActive 
                    ? "bg-[var(--glass-bg)] text-[var(--text-bright)] border-[var(--glass-border)] border-t-2 border-t-[var(--accent)] z-10" 
                    : "bg-white/[0.03] text-[var(--text-dim)] border-[var(--glass-border)] hover:bg-white/5"
                )}
              >
                <span className="truncate flex-1">{tab.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className={cn(
                    "ml-2 p-1 rounded-md opacity-40 hover:opacity-100 transition-all text-[10px]",
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </header>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {tabs.map((tab) => {
                if (tab.id !== activeTabId) return null;
                const Component = COMPONENT_MAP[tab.component] || (() => <div>Component Not Found</div>);
                
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 overflow-y-auto p-6"
                  >
                    <Component tabId={tab.id} onLogout={onLogout} user={user} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {tabs.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--text-dim)]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--glass-bg)] flex items-center justify-center mx-auto mb-4 border border-[var(--glass-border)]">
                    <Package className="w-8 h-8 opacity-50" />
                  </div>
                  <p>No tabs open. Select a module from the sidebar.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* OS Footer */}
      <footer className="h-[24px] bg-black/50 border-t border-[var(--glass-border)] flex items-center px-4 text-[10px] text-[var(--text-dim)] gap-5 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
          SYSTEM ONLINE
        </span>
        <span>LATENCY: 12ms</span>
        <span className="uppercase">USER: {user ? user.name : 'GUEST'}</span>
        <span>SYNC: COMPLETE (DEXIE_LOCAL)</span>
        <span className="ml-auto">V17.0.4 - GENESIS EDITION</span>
      </footer>
    </div>
  );
}

function SidebarItem({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-10 h-10 rounded-xl bg-[var(--glass-bg)] flex items-center justify-center border transition-all",
        isActive 
          ? "text-[var(--accent)] border-[var(--accent-glow)] shadow-[0_0_15px_var(--accent-glow)]" 
          : "text-[var(--text-dim)] border-transparent hover:bg-white/10"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </button>
  );
}
