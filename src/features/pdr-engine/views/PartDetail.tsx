import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { GlassCard } from '@/shared/components/GlassCard';
import { Package, MapPin, Clock, Plus, ArrowUpRight, ArrowDownRight, Filter, X, Edit2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PartDetail({ tabId }: { tabId: string }) {
  const partId = parseInt(tabId.replace('part-detail-', ''), 10);
  const part = useLiveQuery(() => db.spareParts.get(partId), [partId]);
  const movements = useLiveQuery(() => db.stockMovements.where('partId').equals(partId).toArray(), [partId]);

  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [movementError, setMovementError] = useState('');
  
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredMovements = useMemo(() => {
    if (!movements) return [];
    return movements.filter(m => {
      if (filterType !== 'ALL' && m.type !== filterType) return false;
      if (dateFrom && m.date < new Date(dateFrom)) return false;
      if (dateTo && m.date > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [movements, filterType, dateFrom, dateTo]);

  const chartData = useMemo(() => {
    if (!part || !movements) return [];
    
    let currentQ = part.quantity;
    const points = [{
      date: new Date().toLocaleDateString(),
      timestamp: new Date().getTime(),
      quantity: currentQ
    }];

    const sortedDesc = [...movements].sort((a, b) => b.date.getTime() - a.date.getTime());

    sortedDesc.forEach(m => {
      if (m.type === 'IN') {
        currentQ -= m.quantity;
      } else {
        currentQ += m.quantity;
      }
      points.push({
        date: m.date.toLocaleDateString(),
        timestamp: m.date.getTime(),
        quantity: currentQ
      });
    });

    return points.sort((a, b) => a.timestamp - b.timestamp);
  }, [part, movements]);

  const handleAddMovement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMovementError('');
    if (!part) return;

    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as 'IN' | 'OUT';
    const qty = Number(formData.get('quantity'));
    const reason = formData.get('reason') as string;
    const dateStr = formData.get('date') as string;

    if (type === 'OUT' && !reason.trim()) {
      setMovementError('Reason / Reference is required for Stock Out movements.');
      return;
    }

    await db.transaction('rw', db.spareParts, db.stockMovements, async () => {
      await db.stockMovements.add({
        partId,
        type,
        quantity: qty,
        reason,
        date: new Date(dateStr)
      });

      const newQuantity = type === 'IN' ? part.quantity + qty : Math.max(0, part.quantity - qty);
      await db.spareParts.update(partId, { quantity: newQuantity, updatedAt: new Date() });
    });
    setIsAddMovementOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!part) return;

    const formData = new FormData(e.currentTarget);
    await db.spareParts.update(partId, {
      partNumber: formData.get('partNumber') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      quantity: Number(formData.get('quantity')),
      minThreshold: Number(formData.get('minThreshold')),
      location: formData.get('location') as string,
      updatedAt: new Date()
    });
    setIsEditOpen(false);
  };

  if (!part) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-dim)]">
        Loading part details...
      </div>
    );
  }

  const maxScale = Math.max(part.quantity, part.minThreshold * 2, 10);
  const currentPercentage = Math.min(100, Math.max(0, (part.quantity / maxScale) * 100));
  const thresholdPercentage = Math.min(100, (part.minThreshold / maxScale) * 100);
  
  const isCriticallyLow = part.quantity <= part.minThreshold / 2;
  const isLowStock = part.quantity <= part.minThreshold;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight">{part.partNumber}</h1>
            {isCriticallyLow ? (
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold uppercase bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                Critically Low
              </span>
            ) : isLowStock ? (
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Low Stock
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-[11px] font-semibold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Optimal
              </span>
            )}
          </div>
          <p className="text-[var(--text-dim)] text-lg">{part.name}</p>
        </div>
        <div className="flex gap-3">
          <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
            <Dialog.Trigger asChild>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-[var(--text-bright)] px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors">
                <Edit2 className="w-4 h-4" />
                Edit Part
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-base)] border border-[var(--glass-border)] rounded-2xl p-6 z-50 shadow-2xl">
                <Dialog.Title className="text-lg font-semibold text-[var(--text-bright)] mb-4">Edit Part Details</Dialog.Title>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-dim)] font-medium">Part Number</label>
                      <input required name="partNumber" defaultValue={part.partNumber} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-dim)] font-medium">Location</label>
                      <input required name="location" defaultValue={part.location} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Name</label>
                    <input required name="name" defaultValue={part.name} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Description</label>
                    <textarea name="description" defaultValue={part.description} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none h-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-dim)] font-medium">Quantity</label>
                      <input required type="number" name="quantity" min="0" defaultValue={part.quantity} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-dim)] font-medium">Min Threshold</label>
                      <input required type="number" name="minThreshold" min="0" defaultValue={part.minThreshold} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-white/5 transition-colors">Cancel</button>
                    </Dialog.Close>
                    <button type="submit" className="bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Save Changes</button>
                  </div>
                </form>
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-[var(--text-bright)]"><X className="w-4 h-4"/></button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          
          <Dialog.Root open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
            <Dialog.Trigger asChild>
              <button className="flex items-center gap-2 bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors">
                <Plus className="w-4 h-4" />
                Add Movement
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-base)] border border-[var(--glass-border)] rounded-2xl p-6 z-50 shadow-2xl">
                <Dialog.Title className="text-lg font-semibold text-[var(--text-bright)] mb-4">Record Stock Movement</Dialog.Title>
                
                {movementError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{movementError}</p>
                  </div>
                )}

                <form onSubmit={handleAddMovement} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-dim)] font-medium">Movement Type</label>
                      <select required name="type" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all appearance-none">
                        <option value="IN">Stock In (+)</option>
                        <option value="OUT">Stock Out (-)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--text-dim)] font-medium">Quantity</label>
                      <input required type="number" name="quantity" min="1" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="1" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Date</label>
                    <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all [color-scheme:dark]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Reason / Reference</label>
                    <input name="reason" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="e.g. PO-10294 or Maintenance WO-55" />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-white/5 transition-colors">Cancel</button>
                    </Dialog.Close>
                    <button type="submit" className="bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Save Movement</button>
                  </div>
                </form>
                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-[var(--text-bright)]"><X className="w-4 h-4"/></button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2 space-y-6">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] border-b border-[var(--glass-border)] pb-3">
            Part Information
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[12px] text-[var(--text-dim)] mb-1">Description</p>
              <p className="text-[14px] text-[var(--text-bright)]">{part.description || 'No description provided.'}</p>
            </div>
            <div>
              <p className="text-[12px] text-[var(--text-dim)] mb-1">Location</p>
              <div className="flex items-center gap-2 text-[14px] text-[var(--text-bright)]">
                <MapPin className="w-4 h-4 text-[var(--accent)]" />
                {part.location}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-6">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] border-b border-[var(--glass-border)] pb-3">
            Stock Status
          </h2>
          <div className="space-y-5">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[12px] text-[var(--text-dim)] mb-1">Current Quantity</p>
                <p className="text-3xl font-mono text-[var(--text-bright)]">{part.quantity}</p>
              </div>
              <Package className="w-8 h-8 text-[var(--glass-border)]" />
            </div>

            {/* Visual Indicator / Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-2.5 bg-black/40 rounded-full overflow-hidden border border-[var(--glass-border)]">
                {/* Threshold Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                  style={{ left: `${thresholdPercentage}%` }}
                />
                {/* Current Quantity Bar */}
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    isCriticallyLow ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 
                    isLowStock ? 'bg-amber-500' : 
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${currentPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] uppercase font-semibold text-[var(--text-dim)]">
                <span>0</span>
                <span className={isLowStock ? 'text-amber-500' : 'text-[var(--text-dim)]'}>Min: {part.minThreshold}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--glass-border)]">
              <span className="text-[12px] text-[var(--text-dim)]">Last Updated</span>
              <span className="text-[12px] text-[var(--text-bright)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {part.updatedAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Chart Section */}
      <GlassCard className="h-[300px] flex flex-col">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] border-b border-[var(--glass-border)] pb-3 mb-4 shrink-0">
          Stock Quantity Over Time
        </h2>
        <div className="flex-1 min-h-0 w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-dim)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="var(--text-dim)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-base)', 
                    borderColor: 'var(--glass-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-bright)'
                  }}
                  itemStyle={{ color: 'var(--accent)' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="quantity" 
                  stroke="var(--accent)" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: 'var(--bg-base)', strokeWidth: 2 }} 
                  activeDot={{ r: 5, fill: 'var(--accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-dim)] text-sm">
              Not enough movement data to display chart. Add movements to see the trend.
            </div>
          )}
        </div>
      </GlassCard>
      
      <GlassCard className="flex flex-col min-h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-4 mb-4">
          <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)]">
            Stock Movement History
          </h2>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-black/20 border border-[var(--glass-border)] rounded-lg p-1">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === 'ALL' ? 'bg-[var(--glass-bg)] text-[var(--text-bright)]' : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('IN')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === 'IN' ? 'bg-emerald-500/20 text-emerald-400' : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'}`}
              >
                In
              </button>
              <button 
                onClick={() => setFilterType('OUT')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === 'OUT' ? 'bg-amber-500/20 text-amber-400' : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'}`}
              >
                Out
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-black/20 border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all [color-scheme:dark]" 
              />
              <span className="text-[var(--text-dim)] text-xs">to</span>
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-black/20 border border-[var(--glass-border)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all [color-scheme:dark]" 
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredMovements.length > 0 ? (
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="sticky top-0 bg-[var(--bg-base)] z-10">
                <tr>
                  <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)]">Part ID</th>
                  <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)]">Date</th>
                  <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)]">Type</th>
                  <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)]">Quantity</th>
                  <th className="px-2 py-3 font-medium text-[var(--text-dim)] border-b border-[var(--glass-border)]">Reason / Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-2 py-3 border-b border-white/[0.02] text-[var(--text-dim)] font-mono">
                      #{movement.partId}
                    </td>
                    <td className="px-2 py-3 border-b border-white/[0.02] text-[var(--text-bright)]">
                      {movement.date.toLocaleDateString()}
                    </td>
                    <td className="px-2 py-3 border-b border-white/[0.02]">
                      {movement.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <ArrowDownRight className="w-3 h-3" /> IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <ArrowUpRight className="w-3 h-3" /> OUT
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 border-b border-white/[0.02] font-mono text-[var(--text-bright)]">
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </td>
                    <td className="px-2 py-3 border-b border-white/[0.02] text-[var(--text-dim)]">
                      {movement.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] py-12">
              <Filter className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm">No stock movements found matching the current filters.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
