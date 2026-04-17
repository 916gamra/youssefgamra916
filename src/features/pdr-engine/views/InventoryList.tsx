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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Spare Parts Inventory</h1>
          <p className="text-[var(--text-dim)] text-lg">Manage stock levels, locations, and thresholds.</p>
        </div>
      </header>

      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-[var(--glass-border)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all w-64"
              />
            </div>
          </div>
        </div>

        <div className="py-12 text-center text-[var(--text-dim)] border border-dashed border-[var(--glass-border)] rounded-xl bg-white/[0.02]">
          <Box className="w-12 h-12 mx-auto mb-4 opacity-50 text-[var(--accent)]" />
          <h3 className="text-lg font-medium text-[var(--text-bright)] mb-1">UI Temporarily Disabled</h3>
          <p className="max-w-sm mx-auto text-sm">We are upgrading to the new relational database schema (Families/Templates/Blueprints). Normal inventory views will return soon!</p>
        </div>
      </GlassCard>
    </div>
  );
}
