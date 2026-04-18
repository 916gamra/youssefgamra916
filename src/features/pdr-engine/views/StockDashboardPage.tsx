import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStockEngine } from '../hooks/useStockEngine';
import { useProcurementEngine } from '../hooks/useProcurementEngine';
import { useTabStore } from '@/app/store';
import { GlassCard } from '@/shared/components/GlassCard';
import { Box, AlertTriangle, AlertOctagon, ArrowUpRight, ArrowDownRight, Package, MapPin, Activity, ListFilter, Plus, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { StockTransactionModal } from './StockTransactionModal';
import { AddInventoryModal } from './AddInventoryModal';

export function StockDashboardPage({ tabId }: { tabId: string }) {
  const { inventory, movements, lowStockItems, outOfStockItems, isLoading } = useStockEngine();
  const { createDraftOrder } = useProcurementEngine();
  const { openTab } = useTabStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedStockId, setPreselectedStockId] = useState<string | undefined>();
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const handleAutoProcure = async () => {
    const criticalItems = [...outOfStockItems, ...lowStockItems];
    const uniqueItems = Array.from(new Map(criticalItems.map(item => [item.id, item])).values());
    
    if (uniqueItems.length === 0) return;

    const lines = uniqueItems.map(item => {
      const safeThreshold = item.minThreshold > 0 ? item.minThreshold : 5; 
      const suggestedQuantity = Math.max(1, (safeThreshold * 2) - item.quantityCurrent);
      return {
        blueprintId: item.blueprintId,
        quantity: suggestedQuantity
      };
    });

    try {
      await createDraftOrder('SYSTEM_AUTO_GENERATED', lines);
      setActionMsg(`Draft Purchase Order generated for ${lines.length} items.`);
      setTimeout(() => {
        setActionMsg(null);
        openTab({ id: 'procurement', title: 'Procurement v4', component: 'procurement' });
      }, 2000);
    } catch(err) {
      console.error(err);
    }
  };

  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory;
    return inventory.filter(item => 
      item.blueprintReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-dim)]">
        <Activity className="w-8 h-8 animate-pulse text-[var(--accent)]" />
      </div>
    );
  }

  const recentMovements = movements.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Stock Live Control Room</h1>
          <p className="text-[var(--text-dim)] text-lg">Real-time inventory radar mapping blueprints to physical locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                onClick={handleAutoProcure}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] shrink-0"
              >
                <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                Auto-Procure Critical
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] shrink-0"
          >
            <Plus className="w-4 h-4" />
            Track Blueprint
          </button>

          <button
            onClick={() => { setPreselectedStockId(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] shrink-0"
          >
            <Activity className="w-4 h-4" />
            Nouveau Mouvement
          </button>
        </div>
      </header>

      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{actionMsg} Redirecting to Procurement...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[12px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Total Active</p>
              <h2 className="text-4xl font-mono font-semibold text-[var(--text-bright)] mt-1">{inventory.length}</h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Box className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-dim)] relative z-10">Tracked stock items across all warehouses</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
        </GlassCard>

        <motion.div
          animate={lowStockItems.length > 0 ? {
            boxShadow: ['0 0 0px rgba(245, 158, 11, 0)', '0 0 20px rgba(245, 158, 11, 0.4)', '0 0 0px rgba(245, 158, 11, 0)']
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            "bg-white/5 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden border",
            lowStockItems.length > 0 ? "border-amber-500/30" : "border-white/10"
          )}
        >
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[12px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Low Stock</p>
              <h2 className={cn("text-4xl font-mono font-semibold mt-1", lowStockItems.length > 0 ? "text-amber-400" : "text-[var(--text-bright)]")}>
                {lowStockItems.length}
              </h2>
            </div>
            <div className={cn("p-3 rounded-xl border", lowStockItems.length > 0 ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-white/5 border-white/10 text-[var(--text-dim)]")}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-dim)] relative z-10">Items approaching minimum threshold</p>
          {lowStockItems.length > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />}
        </motion.div>

        <motion.div
          animate={outOfStockItems.length > 0 ? {
            boxShadow: ['0 0 0px rgba(239, 68, 68, 0)', '0 0 30px rgba(239, 68, 68, 0.5)', '0 0 0px rgba(239, 68, 68, 0)']
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            "bg-white/5 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden border",
            outOfStockItems.length > 0 ? "border-red-500/30 bg-red-500/5" : "border-white/10"
          )}
        >
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[12px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Critical Out</p>
              <h2 className={cn("text-4xl font-mono font-semibold mt-1", outOfStockItems.length > 0 ? "text-red-500" : "text-[var(--text-bright)]")}>
                {outOfStockItems.length}
              </h2>
            </div>
            <div className={cn("p-3 rounded-xl border", outOfStockItems.length > 0 ? "bg-red-500/20 border-red-500/40 text-red-500" : "bg-white/5 border-white/10 text-[var(--text-dim)]")}>
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-red-300/80 relative z-10">Items completely depleted</p>
          {outOfStockItems.length > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl mix-blend-screen" />}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Inventory Grid */}
        <GlassCard className="lg:col-span-2 flex flex-col p-0 overflow-hidden h-[600px]">
          <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between shrink-0 bg-black/20">
            <h2 className="text-[15px] font-semibold text-[var(--text-bright)] flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[var(--accent)]" /> 
              Active Radar Array
            </h2>
            <input 
              type="text" 
              placeholder="Search reference or warehouse..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/30 border border-[var(--glass-border)] rounded-lg pl-3 pr-4 py-1.5 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all w-64"
            />
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="sticky top-0 bg-[var(--bg-base)]/95 backdrop-blur-md z-10 border-b border-[var(--glass-border)]">
                <tr>
                  <th className="px-5 py-4 font-semibold text-[var(--text-dim)] uppercase tracking-wider text-xs">Reference</th>
                  <th className="px-5 py-4 font-semibold text-[var(--text-dim)] uppercase tracking-wider text-xs">Location</th>
                  <th className="px-5 py-4 font-semibold text-[var(--text-dim)] uppercase tracking-wider text-xs">Quantity</th>
                  <th className="px-5 py-4 font-semibold text-[var(--text-dim)] uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredInventory.map((item, idx) => (
                    <motion.tr 
                      key={item.id}
                      onClick={() => { setPreselectedStockId(item.id); setIsModalOpen(true); }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-medium text-[var(--text-bright)]">{item.blueprintReference}</div>
                        <div className="text-[11px] text-[var(--text-dim)] mt-0.5">ID: {item.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[var(--text-dim)] group-hover:text-[var(--text-bright)] transition-colors">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.warehouseId}
                        </div>
                        {item.locationDetails && (
                          <div className="text-[11px] text-[var(--text-dim)] mt-1 ml-5 opacity-70">
                            {item.locationDetails}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-mono text-[var(--text-bright)]">{item.quantityCurrent}</span>
                          <span className="text-xs text-[var(--text-dim)] uppercase">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {item.isOutOfStock ? (
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                            Depleted
                          </span>
                        ) : item.isLowStock ? (
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Healthy
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-[var(--text-dim)]">
                      No stock items active on radar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Recent Activity Stream */}
        <GlassCard className="flex flex-col p-0 overflow-hidden h-[600px]">
          <div className="p-5 border-b border-[var(--glass-border)] bg-black/20 shrink-0">
            <h2 className="text-[15px] font-semibold text-[var(--text-bright)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent)]" /> 
              Telemetry Stream
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <div className="space-y-2">
              {recentMovements.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-dim)] text-sm">No recent telemetry data.</div>
              ) : (
                recentMovements.map((movement, idx) => (
                  <motion.div 
                    key={movement.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {movement.type === 'IN' ? (
                          <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                            <ArrowDownRight className="w-4 h-4" />
                          </div>
                        ) : movement.type === 'OUT' ? (
                          <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400">
                            <Activity className="w-4 h-4" />
                          </div>
                        )}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          movement.type === 'IN' ? "text-emerald-400" : movement.type === 'OUT' ? "text-amber-400" : "text-blue-400"
                        )}>
                          {movement.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--text-dim)] font-mono">
                        {new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-[var(--text-dim)] font-mono">{movement.stockId.substring(0, 8)}</span>
                      <span className="text-xl font-mono text-[var(--text-bright)]">
                        {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}{movement.quantity}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      <StockTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        inventory={inventory}
        preselectedStockId={preselectedStockId}
      />
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </motion.div>
  );
}
