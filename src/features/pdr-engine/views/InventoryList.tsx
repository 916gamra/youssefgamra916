import React, { useState, useMemo } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Search, Filter, Plus, MoreHorizontal, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SparePart } from '@/core/db';
import * as Dialog from '@radix-ui/react-dialog';
import { useTabStore } from '@/app/store';

type SortKey = keyof SparePart;
type SortDirection = 'asc' | 'desc';

export function InventoryList() {
  const parts = useLiveQuery(() => db.spareParts.toArray());
  const { openTab } = useTabStore();

  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'partNumber',
    direction: 'asc'
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Seed some initial data if empty
  React.useEffect(() => {
    const seedData = async () => {
      const count = await db.spareParts.count();
      if (count === 0) {
        await db.spareParts.bulkAdd([
          { partNumber: '#PDR-1082-A', name: 'Hydraulic Actuator XT-9', description: 'Main hydraulic pump for excavator', quantity: 42, minThreshold: 5, location: 'W-ALPHA-01', updatedAt: new Date() },
          { partNumber: '#PDR-0492-C', name: 'Engine Seal (Type 4)', description: 'Standard engine oil filter', quantity: 8, minThreshold: 10, location: 'W-BETA-04', updatedAt: new Date() },
          { partNumber: '#PDR-9921-X', name: 'Cooling Fan Module', description: 'Heavy duty transmission belt', quantity: 115, minThreshold: 10, location: 'W-ALPHA-02', updatedAt: new Date() },
          { partNumber: '#PDR-3320-K', name: 'Control Board P17', description: '24V Alternator for heavy machinery', quantity: 12, minThreshold: 15, location: 'W-GAMMA-01', updatedAt: new Date() },
        ]);
      }
    };
    seedData();
  }, []);

  const sortedParts = useMemo(() => {
    if (!parts) return [];
    let filtered = parts;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = parts.filter(p => p.partNumber.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [parts, sortConfig, searchQuery]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-[var(--accent)]" /> : <ChevronDown className="w-3 h-3 text-[var(--accent)]" />;
  };

  const handleRowClick = (part: SparePart) => {
    openTab({
      id: `part-detail-${part.id}`,
      title: `${part.partNumber}`,
      component: 'part-detail'
    });
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await db.spareParts.add({
      partNumber: formData.get('partNumber') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      quantity: Number(formData.get('quantity')),
      minThreshold: Number(formData.get('minThreshold')),
      location: formData.get('location') as string,
      updatedAt: new Date()
    });
    setIsAddOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight">Inventory</h1>
          <p className="text-[var(--text-dim)] mt-1">Manage spare parts and stock levels</p>
        </div>
        
        <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              Add Part
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-base)] border border-[var(--glass-border)] rounded-2xl p-6 z-50 shadow-2xl">
              <Dialog.Title className="text-lg font-semibold text-[var(--text-bright)] mb-4">Add New Part</Dialog.Title>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Part Number</label>
                    <input required name="partNumber" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="#PDR-XXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Location</label>
                    <input required name="location" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="W-ALPHA-01" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[var(--text-dim)] font-medium">Name</label>
                  <input required name="name" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="Hydraulic Pump" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[var(--text-dim)] font-medium">Description</label>
                  <textarea name="description" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none h-20" placeholder="Enter part description..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Quantity</label>
                    <input required type="number" name="quantity" min="0" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Min Threshold</label>
                    <input required type="number" name="minThreshold" min="0" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="5" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-white/5 transition-colors">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Save Part</button>
                </div>
              </form>
              <Dialog.Close asChild>
                <button className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-[var(--text-bright)]"><X className="w-4 h-4"/></button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>

      <GlassCard className="flex-1 flex flex-col min-h-0 overflow-hidden p-0">
        <div className="p-4 border-b border-[var(--glass-border)] flex items-center gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search part number, name..." 
              className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-bright)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-sm font-medium text-[var(--text-dim)] transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)]">PDR Master Registry</h2>
            <div className="text-[12px] text-[var(--accent)] cursor-pointer hover:underline" onClick={() => setIsAddOpen(true)}>+ Add New Entry</div>
          </div>
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="sticky top-0 bg-[var(--bg-base)] z-10">
              <tr>
                <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)] cursor-pointer group select-none" onClick={() => handleSort('partNumber')}>
                  <div className="flex items-center gap-1">Part ID <SortIcon columnKey="partNumber" /></div>
                </th>
                <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)] cursor-pointer group select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Description <SortIcon columnKey="name" /></div>
                </th>
                <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)] cursor-pointer group select-none" onClick={() => handleSort('location')}>
                  <div className="flex items-center gap-1">Warehouse <SortIcon columnKey="location" /></div>
                </th>
                <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)] cursor-pointer group select-none" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center gap-1">Stock <SortIcon columnKey="quantity" /></div>
                </th>
                <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)]">Status</th>
                <th className="px-2 py-3 border-b border-[var(--glass-border)] w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedParts.map((part) => (
                <tr key={part.id} onClick={() => handleRowClick(part)} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <td className="px-2 py-3 border-b border-white/[0.02] text-[var(--text-bright)]">{part.partNumber}</td>
                  <td className="px-2 py-3 border-b border-white/[0.02]">
                    <div className="font-medium text-[var(--text-bright)]">{part.name}</div>
                    <div className="text-xs text-[var(--text-dim)] truncate max-w-xs">{part.description}</div>
                  </td>
                  <td className="px-2 py-3 border-b border-white/[0.02] text-[var(--text-dim)]">{part.location}</td>
                  <td className="px-2 py-3 border-b border-white/[0.02] text-[var(--text-bright)] font-mono">{part.quantity}</td>
                  <td className="px-2 py-3 border-b border-white/[0.02]">
                    {part.quantity <= part.minThreshold ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Critical
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Optimal
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3 border-b border-white/[0.02] text-right">
                    <button onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-bright)] opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedParts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-[var(--text-dim)] text-sm">
                    {parts ? 'No parts found.' : 'Loading inventory data...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
