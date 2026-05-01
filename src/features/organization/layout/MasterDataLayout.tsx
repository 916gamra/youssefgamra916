import React, { useEffect } from 'react';
import { Database, FolderTree, FileJson } from 'lucide-react';
import { useTabStore } from '@/app/store';
import { PortalCanvas } from '@/app/layout/PortalCanvas';
import { PortalSidebar } from '@/app/layout/PortalSidebar';
import { PortalSidebarItem } from '@/shared/components/PortalSidebarItem';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';

import { TaxonomyView } from '../views/TaxonomyView';
import { PartMasterView } from '../views/PartMasterView';

const MASTER_COMPONENTS = {
  'taxonomy': TaxonomyView,
  'part-master': PartMasterView,
};

export function MasterDataLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { tabs, openTab } = useTabStore();

  const currentTab = tabs.find(t => t.portalId === 'ORGANIZATION');
  const activeTabId = currentTab?.id;

  useEffect(() => {
    if (!currentTab) {
      openTab({ id: 'part-master', portalId: 'ORGANIZATION', title: 'Part Master Core', component: 'part-master' });
    }
  }, [currentTab, openTab]);

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <PortalSidebar 
        portalName="Sys. Catalog"
        portalIcon={<Database />}
        colorClass="bg-amber-500/10 text-amber-500"
        borderClass="border-amber-500/30"
        textClass="text-amber-400"
      >
        <PortalSidebarItem 
          icon={<FileJson />} 
          isActive={activeTabId === 'part-master'} 
          onClick={() => openTab({ id: 'part-master', portalId: 'ORGANIZATION', title: 'Part Master Core', component: 'part-master' })}
          title="Part Master Core"
          colorClass="text-amber-400"
        />
        <PortalSidebarItem 
          icon={<FolderTree />} 
          isActive={activeTabId === 'taxonomy'} 
          onClick={() => openTab({ id: 'taxonomy', portalId: 'ORGANIZATION', title: 'Taxonomy Logic', component: 'taxonomy' })}
          title="Taxonomy & Classes"
          colorClass="text-amber-400"
        />
      </PortalSidebar>

      <PortalCanvas componentMap={MASTER_COMPONENTS} user={user} onLogout={onLogout} />
    </div>
  );
}
