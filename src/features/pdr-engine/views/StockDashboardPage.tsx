import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStockEngine } from '../hooks/useStockEngine';
import { useProcurementEngine } from '../hooks/useProcurementEngine';
import { useTabStore } from '@/app/store';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { GlassCard } from '@/shared/components/GlassCard';
import { Box, AlertTriangle, AlertOctagon, ArrowUpRight, ArrowDownRight, Package, MapPin, Activity, ListFilter, Plus, Zap, CheckCircle2, TrendingUp, Search } from 'lucide-react';
import { cn } from '@/shared/utils';
import { StockTransactionModal } from './StockTransactionModal';
import { AddInventoryModal } from './AddInventoryModal';

export function StockDashboardPage({ tabId }: { tabId: string }) {
  const { inventory, movements, lowStockItems, outOfStockItems, isLoading } = useStockEngine();
  const { createPendingOrder } = useProcurementEngine();
  const { showSuccess, showError } = useNotifications();
  const { openTab } = useTabStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedStockId, setPreselectedStockId] = useState<string | undefined>();

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
      await createPendingOrder('SYSTEM_AUTO_GENERATED', lines);
      showSuccess('Order Injunction Sent', `Pending Purchase Order generated for ${lines.length} critical items.`);
      setTimeout(() => {
        openTab({ id: 'procurement', title: 'Procurement v4', component: 'procurement' });
      }, 1500);
    } catch(err: any) {
      showError('Sync Error', err.message);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 w-full h-full">
        <Activity className="w-8 h-8 text-cyan-500 animate-spin opacity-50" />
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-500/50">Initializing Telemetry...</p>
      </div>
    );
  }

  const recentMovements = movements.slice(0, 50);

  return (
    <div className="flex flex-col h-full w-full relative bg-transparent custom-scrollbar">
      
      {/* SCADA Background Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10] mix-blend-overlay" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 max-w-[1600px] w-full mx-auto p-4 md:p-8 flex flex-col gap-8 h-full"
      >
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.05] pb-6 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest">Node-01 Online</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight uppercase flex items-center gap-3">
              Stock Radar
            </h1>
            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1">Live Asset Telemetry & Inventory Control</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <AnimatePresence>
              {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleAutoProcure}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)] shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" /> Auto-Procure
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border border-white/10 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Initial Entry
            </button>

            <button
              onClick={() => { setPreselectedStockId(undefined); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shrink-0"
            >
              <Activity className="w-3.5 h-3.5" /> Log Movement
            </button>
          </div>
        </header>

        {/* Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <GlassCard className="flex flex-col relative overflow-hidden group border border-white/5 bg-white/[0.01] p-5">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">
                <Box className="w-3.5 h-3.5 text-cyan-500" /> Active Registry
              </div>
              <span className="text-[9px] text-slate-600 font-mono border border-white/5 px-1.5 py-0.5 rounded">SYS.COUNT</span>
            </div>
            <div className="flex items-baseline gap-3 relative z-10 mt-1">
              <h2 className="text-4xl font-light text-slate-100 font-mono tabular-nums">{inventory.length}</h2>
              <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Sync Ok</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </GlassCard>

          <motion.div
            animate={lowStockItems.length > 0 ? {
              boxShadow: ['0 0 10px rgba(245, 158, 11, 0.05)', '0 0 20px rgba(245, 158, 11, 0.15)', '0 0 10px rgba(245, 158, 11, 0.05)']
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "flex flex-col relative overflow-hidden group p-5 rounded-2xl border transition-all duration-500 bg-white/[0.01]",
              lowStockItems.length > 0 ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-white/5"
            )}
          >
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className={cn("flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mt-1", lowStockItems.length > 0 ? "text-amber-500" : "text-slate-500")}>
                <AlertTriangle className="w-3.5 h-3.5" /> Warning Levels
              </div>
              <span className={cn("text-[9px] font-mono border px-1.5 py-0.5 rounded", lowStockItems.length > 0 ? "border-amber-500/20 text-amber-500/50" : "border-white/5 text-slate-600")}>SYS.WARN</span>
            </div>
            <div className="flex items-baseline gap-3 relative z-10 mt-1">
              <h2 className={cn("text-4xl font-light font-mono tabular-nums", lowStockItems.length > 0 ? "text-amber-500" : "text-slate-100")}>{lowStockItems.length}</h2>
              {lowStockItems.length > 0 && <span className="text-[9px] font-mono font-bold text-amber-500 opacity-80 uppercase tracking-widest">Approaching Minima</span>}
            </div>
          </motion.div>

          <GlassCard className={cn(
            "flex flex-col relative overflow-hidden group p-5 border transition-all duration-500",
            outOfStockItems.length > 0 ? "border-rose-500/30 bg-rose-500/[0.05]" : "border-white/5 bg-white/[0.01]"
          )}>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className={cn("flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest mt-1", outOfStockItems.length > 0 ? "text-rose-500" : "text-slate-500")}>
                <AlertOctagon className="w-3.5 h-3.5" /> Critical Depletion
              </div>
              <span className={cn("text-[9px] font-mono border px-1.5 py-0.5 rounded", outOfStockItems.length > 0 ? "border-rose-500/20 text-rose-500/50" : "border-white/5 text-slate-600")}>SYS.CRIT</span>
            </div>
            <div className="flex items-baseline gap-3 relative z-10 mt-1">
              <h2 className={cn("text-4xl font-light font-mono tabular-nums", outOfStockItems.length > 0 ? "text-rose-500" : "text-slate-100")}>{outOfStockItems.length}</h2>
              {outOfStockItems.length > 0 && <span className="text-[9px] font-mono font-bold text-rose-500 opacity-80 uppercase tracking-widest">Out of Stock</span>}
            </div>
          </GlassCard>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
          {/* Main Registry Matrix */}
          <div className="flex-1 flex flex-col bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            
            <div className="p-4 border-b border-white/[0.05] bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <ListFilter className="w-4 h-4 text-cyan-500" />
                <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Global Asset List</h2>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Query reference or location..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-black/60 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600 font-mono"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#050608]">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead className="sticky top-0 bg-transparent z-20 border-b border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-3 font-mono font-bold text-slate-500 uppercase tracking-widest text-[9px]">PDR.REF</th>
                    <th className="px-5 py-3 font-mono font-bold text-slate-500 uppercase tracking-widest text-[9px]">LOC.VECTOR</th>
                    <th className="px-5 py-3 font-mono font-bold text-slate-500 uppercase tracking-widest text-[9px] text-right">QTY.BAL</th>
                    <th className="px-5 py-3 font-mono font-bold text-slate-500 uppercase tracking-widest text-[9px]">SYS.STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  <AnimatePresence mode="popLayout">
                    {filteredInventory.map((item, idx) => (
                      <motion.tr 
                        key={item.id}
                        onClick={() => { setPreselectedStockId(item.id); setIsModalOpen(true); }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.01, 0.2) }}
                        className="group hover:bg-white/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="font-mono font-semibold text-cyan-500 text-sm tracking-tight group-hover:text-cyan-400 transition-colors">
                            {item.blueprintReference}
                          </div>
                          <div className="text-[9px] font-mono text-slate-600 uppercase mt-0.5">ID:{item.id.substring(0, 8)}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 text-slate-300 text-[11px] font-mono">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{item.warehouseId}</span>
                          </div>
                          {item.locationDetails && (
                            <div className="text-[9px] font-mono text-slate-500 mt-1 ml-5">
                              {item.locationDetails}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="text-lg font-mono text-white tabular-nums">{item.quantityCurrent.toFixed(1).replace('.0', '')}</span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {item.isOutOfStock ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-[9px] font-mono uppercase text-rose-500">
                              <AlertOctagon className="w-3 h-3" /> DEPLETED
                            </div>
                          ) : item.isLowStock ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-[9px] font-mono uppercase text-amber-500">
                              <AlertTriangle className="w-3 h-3" /> LOW_LVL
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-mono uppercase text-emerald-500">
                              <CheckCircle2 className="w-3 h-3" /> OPTIMAL
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Box className="w-8 h-8 mb-3 text-slate-700" />
                          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-600">ZERO_MATCHES_FOUND</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Stream Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl relative shrink-0">
            <div className="p-4 border-b border-white/[0.05] bg-black/40 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <h2 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Network Log</h2>
              </div>
              <span className="text-[9px] font-mono text-slate-600 border border-white/5 px-1.5 py-0.5 rounded">STREAM.TX</span>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-3 space-y-2 bg-[#050608]">
              <AnimatePresence mode="popLayout">
                {recentMovements.length === 0 ? (
                  <div className="py-12 text-center text-[10px] font-mono text-slate-600 uppercase">NO_ACTIVITY</div>
                ) : (
                  recentMovements.map((movement, idx) => (
                    <motion.div 
                      key={movement.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] hover:border-white/10 transition-colors flex flex-col gap-2 relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          {movement.type === 'IN' ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                          ) : movement.type === 'OUT' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <Activity className="w-3.5 h-3.5 text-cyan-500" />
                          )}
                          <span className={cn(
                            "text-[9px] font-mono font-bold uppercase",
                            movement.type === 'IN' ? "text-emerald-500" : 
                            movement.type === 'OUT' ? "text-amber-500" : "text-cyan-500"
                          )}>
                            OP.{movement.type}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between">
                         <div className="font-mono text-[10px] text-slate-500">
                            REF:{movement.stockId.substring(0, 6).toUpperCase()}
                         </div>
                         <div className={cn(
                           "font-mono text-[13px] font-bold tabular-nums",
                           movement.type === 'IN' ? "text-emerald-400" : 
                           movement.type === 'OUT' ? "text-amber-400" : "text-cyan-400"
                         )}>
                            {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}{movement.quantity.toFixed(1).replace('.0', '')}
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </motion.div>

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
    </div>
  );
}
