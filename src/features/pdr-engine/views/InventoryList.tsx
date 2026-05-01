import React, { useState, useMemo } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Search, Filter, Plus, MoreHorizontal, ChevronUp, ChevronDown, X, Box } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import * as Dialog from '@radix-ui/react-dialog';
import { useTabStore } from '@/app/store';

export function InventoryList() {
  const { openTab } = useTabStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stubs for rendering empty view
  const inventory = useLiveQuery(() => db.inventory.toArray());

  return (
    <div className="w-full space-y-6 pb-12 lg:px-8">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">Spare Parts Inventory</h1>
          <p className="text-slate-400 text-lg">Manage stock levels, locations, and thresholds.</p>
        </div>
      </header>

      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all w-64"
              />
            </div>
          </div>
        </div>

        <div className="py-12 text-center text-slate-400 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
          <Box className="w-12 h-12 mx-auto mb-4 opacity-50 text-cyan-500" />
          <h3 className="text-lg font-medium text-white mb-1">UI Temporarily Disabled</h3>
          <p className="max-w-sm mx-auto text-sm">We are upgrading to the new relational database schema (Families/Templates/Blueprints). Normal inventory views will return soon!</p>
        </div>
      </GlassCard>
    </div>
  );
}
