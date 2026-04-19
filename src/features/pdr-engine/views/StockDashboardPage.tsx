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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Activity className="w-12 h-12 text-cyan-500 animate-spin opacity-50" />
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--text-dim)] animate-pulse text-cyan-400">Locking Sensors...</p>
      </div>
    );
  }

  const recentMovements = movements.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-bright)] tracking-tighter mb-2 flex items-center gap-4 italic uppercase">
            <Zap className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" /> 
            Command Radar
          </h1>
          <p className="text-[var(--text-dim)] text-xl font-medium italic opacity-80">Telemetry data fusion and physical asset mapping.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                onClick={handleAutoProcure}
                className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)] shrink-0"
              >
                <TrendingUp className="w-4 h-4 animate-bounce" />
                Auto-Procure
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Map
          </button>

          <button
            onClick={() => { setPreselectedStockId(undefined); setIsModalOpen(true); }}
            className="flex items-center gap-3 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(8,145,178,0.3)] hover:shadow-[0_15px_40px_rgba(8,145,178,0.5)] shrink-0"
          >
            <Activity className="w-4 h-4" />
            Inject Record
          </button>
        </div>
      </header>

      {/* KPI Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="flex flex-col relative overflow-hidden group border-white/5 !p-8">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em]">Total Inventory</p>
              <h2 className="text-5xl font-black text-[var(--text-bright)] mt-2 italic tracking-tighter tabular-nums">{inventory.length}</h2>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <Box className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 relative z-10 uppercase tracking-widest bg-emerald-400/5 px-3 py-1.5 rounded-xl w-fit">
            <TrendingUp className="w-3.5 h-3.5" /> Synchronized
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[100px] group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
        </GlassCard>

        <motion.div
          animate={lowStockItems.length > 0 ? {
            boxShadow: ['0 0 20px rgba(245, 158, 11, 0.1)', '0 0 40px rgba(245, 158, 11, 0.25)', '0 0 20px rgba(245, 158, 11, 0.1)']
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            "bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-8 relative overflow-hidden border transition-all duration-700",
            lowStockItems.length > 0 ? "border-amber-500/30 ring-1 ring-amber-500/10" : "border-white/10"
          )}
        >
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em]">Warning Threshold</p>
              <h2 className={cn("text-5xl font-black mt-2 italic tracking-tighter tabular-nums", lowStockItems.length > 0 ? "text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "text-[var(--text-bright)]")}>
                {lowStockItems.length}
              </h2>
            </div>
            <div className={cn("p-4 rounded-2xl border transition-all", lowStockItems.length > 0 ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-white/5 border-white/10 text-[var(--text-dim)]")}>
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
          <p className="text-xs font-bold text-[var(--text-dim)] relative z-10 uppercase tracking-widest italic opacity-60">Approaching system minima</p>
          {lowStockItems.length > 0 && <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />}
        </motion.div>

        <motion.div
          animate={outOfStockItems.length > 0 ? {
            boxShadow: ['0 0 20px rgba(239, 68, 68, 0.1)', '0 0 50px rgba(239, 68, 68, 0.4)', '0 0 20px rgba(239, 68, 68, 0.1)']
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            "bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-8 relative overflow-hidden border transition-all duration-700",
            outOfStockItems.length > 0 ? "border-red-500/40 bg-red-500/[0.03] ring-1 ring-red-500/20" : "border-white/10"
          )}
        >
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <p className="text-[10px] uppercase font-black text-[var(--text-dim)] tracking-[0.2em]">Critical Depletion</p>
              <h2 className={cn("text-5xl font-black mt-2 italic tracking-tighter tabular-nums", outOfStockItems.length > 0 ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-[var(--text-bright)]")}>
                {outOfStockItems.length}
              </h2>
            </div>
            <div className={cn("p-4 rounded-2xl border transition-all shadow-xl", outOfStockItems.length > 0 ? "bg-red-500/20 border-red-500/40 text-red-500" : "bg-white/5 border-white/10 text-[var(--text-dim)]")}>
              <AlertOctagon className="w-8 h-8" />
            </div>
          </div>
          <p className="text-xs font-black text-red-400 relative z-10 uppercase tracking-widest animate-pulse italic">Immediate action required</p>
          {outOfStockItems.length > 0 && <div className="absolute inset-0 bg-red-500/5 backdrop-blur-3xl pointer-events-none" />}
          {outOfStockItems.length > 0 && <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[120px] pointer-events-none" />}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Live Inventory Grid */}
        <GlassCard className="lg:col-span-3 flex flex-col p-0 overflow-hidden h-[650px] shadow-2xl border-white/5 rounded-3xl">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                <ListFilter className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Active Sensor Array</h2>
                <p className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">Global Asset Distribution</p>
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Locate blueprint..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm text-[var(--text-bright)] focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all w-full sm:w-80 shadow-inner italic font-medium"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-black/10">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-black/60 backdrop-blur-xl z-20 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-black text-[var(--text-dim)] uppercase tracking-[0.2em] text-[10px]">Asset Reference</th>
                  <th className="px-8 py-5 font-black text-[var(--text-dim)] uppercase tracking-[0.2em] text-[10px]">Location Telemetry</th>
                  <th className="px-8 py-5 font-black text-[var(--text-dim)] uppercase tracking-[0.2em] text-[10px]">Current Quantity</th>
                  <th className="px-8 py-5 font-black text-[var(--text-dim)] uppercase tracking-[0.2em] text-[10px]">Pulse State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredInventory.map((item, idx) => (
                    <motion.tr 
                      key={item.id}
                      onClick={() => { setPreselectedStockId(item.id); setIsModalOpen(true); }}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.02 }}
                      className="group border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="font-mono font-black text-[var(--text-bright)] text-sm tracking-tight">{item.blueprintReference}</div>
                        <div className="text-[9px] font-black text-cyan-500/50 uppercase tracking-widest mt-1">HASH: {item.id.substring(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-white font-bold italic text-sm group-hover:text-cyan-300 transition-colors">
                          <MapPin className="w-4 h-4 text-cyan-500/50" />
                          {item.warehouseId}
                        </div>
                        {item.locationDetails && (
                          <div className="text-[10px] font-medium text-[var(--text-dim)] mt-1.5 ml-6 opacity-60">
                            {item.locationDetails}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white italic tracking-tighter tabular-nums">{item.quantityCurrent}</span>
                          <span className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {item.isOutOfStock ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase tracking-widest text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <AlertOctagon className="w-3 h-3" /> Depleted
                          </div>
                        ) : item.isLowStock ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest text-amber-400">
                            <AlertTriangle className="w-3 h-3" /> Minimum
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <CheckCircle2 className="w-3 h-3" /> Optimized
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Box className="w-16 h-16 mb-4 text-white" />
                        <p className="text-xl font-black italic uppercase tracking-[0.2em] text-white">Null sensor contact in mapping range</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Live Activity Stream */}
        <div className="flex flex-col gap-6 h-[650px]">
           <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden border-white/5 rounded-3xl bg-white/[0.01]">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-sm font-black text-white italic uppercase tracking-widest">Signal Stream</h2>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {recentMovements.length === 0 ? (
                  <div className="py-20 text-center text-[var(--text-dim)] italic text-xs opacity-40">Scanning for frequency...</div>
                ) : (
                  recentMovements.map((movement, idx) => (
                    <motion.div 
                      key={movement.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] transition-all group-hover:bg-cyan-500/5 blur-2xl" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2 rounded-xl transition-all shadow-lg",
                            movement.type === 'IN' ? "bg-emerald-500/10 text-emerald-400 group-hover:shadow-emerald-500/20" : 
                            movement.type === 'OUT' ? "bg-amber-500/10 text-amber-400 group-hover:shadow-amber-500/20" : 
                            "bg-blue-500/10 text-blue-400 group-hover:shadow-blue-500/20"
                          )}>
                            {movement.type === 'IN' ? <ArrowDownRight className="w-4 h-4" /> : 
                             movement.type === 'OUT' ? <ArrowUpRight className="w-4 h-4" /> : 
                             <Activity className="w-4 h-4" />}
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]",
                            movement.type === 'IN' ? "text-emerald-400" : 
                            movement.type === 'OUT' ? "text-amber-400" : "text-blue-400"
                          )}>
                            {movement.type} FLOW
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-dim)] font-mono font-bold bg-white/5 px-2 py-1 rounded">
                          {new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-end justify-between relative z-10">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Target ID</span>
                          <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-400 transition-colors uppercase italic tracking-tighter">
                            {movement.stockId.substring(0, 10)}
                          </span>
                        </div>
                        <span className="text-2xl font-black text-white italic tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}{movement.quantity}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <button className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-[var(--text-dim)] hover:text-white uppercase tracking-[0.3em] transition-all">
                Access Audit Logs
              </button>
            </div>
          </GlassCard>
        </div>
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
