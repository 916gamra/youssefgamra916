import React, { useEffect } from 'react';
import { PieChart, LineChart } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { AnalyticsDashboardPage } from '../views/AnalyticsDashboardPage';

const ANALYTICS_COMPONENTS = {
  'analytics-dashboard': AnalyticsDashboardPage,
};

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
        <PortalSidebarItem 
          icon={<LineChart />} 
          isActive={activeTabId === 'analytics-dashboard'} 
          onClick={() => openTab({ id: 'analytics-dashboard', title: 'Executive Hub', component: 'analytics-dashboard' })}
          title="Executive Hub"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={ANALYTICS_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
