import React, { useEffect } from 'react';
import { PieChart, LineChart } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { AnalyticsDashboardPage } from '../views/AnalyticsDashboardPage';

const ANALYTICS_COMPONENTS = {
  'analytics-dashboard': AnalyticsDashboardPage,
};

function SidebarItem({ icon, isActive, onClick, title }: { icon: React.ReactNode, isActive: boolean, onClick: () => void, title?: string }) {
  // Fuchsia
  return (
    <button 
      onClick={onClick}
      title={title}
      className={cn(
        "w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 border",
        isActive 
          ? "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)]" 
          : "bg-transparent text-[var(--text-dim)] border-transparent hover:bg-white/5 hover:text-white"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </button>
  );
}

export function AnalyticsLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, openTab } = useTabStore();

  useEffect(() => {
    if (tabs.length === 0) {
      openTab({ id: 'analytics-dashboard', title: 'The Oracle', component: 'analytics-dashboard' });
    }
  }, [tabs.length, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="The Oracle"
        portalIcon={<PieChart />}
        colorClass="bg-fuchsia-500/20"
        borderClass="border-fuchsia-500/30"
        textClass="text-fuchsia-400"
      >
        <SidebarItem 
          icon={<LineChart />} 
          isActive={activeTabId === 'analytics-dashboard'} 
          onClick={() => openTab({ id: 'analytics-dashboard', title: 'The Oracle Dashboard', component: 'analytics-dashboard' })}
          title="The Oracle Dashboard"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={ANALYTICS_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
