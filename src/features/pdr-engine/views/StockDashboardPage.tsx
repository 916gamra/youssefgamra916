import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStockEngine } from '../hooks/useStockEngine';
import { useProcurementEngine } from '../hooks/useProcurementEngine';
import { useTabStore } from '@/app/store';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { GlassCard } from '@/shared/components/GlassCard';
import { Box, AlertTriangle, AlertOctagon, ArrowUpRight, ArrowDownRight, Package, MapPin, Activity, ListFilter, Plus, Zap, CheckCircle2, TrendingUp, Search, Database, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/shared/utils';
import { StockTransactionModal } from './StockTransactionModal';
import { AddInventoryModal } from './AddInventoryModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-8 pb-12 px-4 relative z-10 lg:px-8"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <Box className="w-8 h-8 text-cyan-500" /> Stock Radar
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">Live Asset Telemetry & Inventory Control.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <StatCompact icon={<Database className="w-4 h-4 text-emerald-500" />} label="Tracked" value={inventory.length.toString()} />
          <StatCompact icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} label="Low" value={lowStockItems.length.toString()} />
          <StatCompact icon={<AlertOctagon className="w-4 h-4 text-rose-500" />} label="Empty" value={outOfStockItems.length.toString()} />
          <StatCompact icon={<Activity className="w-4 h-4 text-cyan-500" />} label="Activity" value={movements.length.toString()} />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Registry Matrix */}
          <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl h-[600px] flex flex-col">
            
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Box className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight">Global Asset List</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live telemetry of active registry</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search radar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="titan-input py-2.5 pl-11 pr-3 w-48 shadow-none"
                  />
                </div>
                
                <AnimatePresence>
                  {(outOfStockItems.length > 0 || lowStockItems.length > 0) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={handleAutoProcure}
                      className="titan-button titan-button-danger shrink-0 !py-2.5"
                    >
                      <Zap className="w-4 h-4" /> Procure
                    </motion.button>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="titan-button titan-button-outline shrink-0 !py-2.5 !px-3 hover:bg-white/5"
                  title="Initial Entry"
                >
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { setPreselectedStockId(undefined); setIsModalOpen(true); }}
                  className="titan-button titan-button-active shrink-0 !py-2.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  title="Log Movement"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar bg-black/10">
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
          </GlassCard>
        </div>

        <div className="space-y-8">
          {/* Activity Stream Sidebar */}
          <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-2xl rounded-3xl h-[600px] flex flex-col relative">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-4 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-tight">Network Log</h2>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(6,182,212,0.1)]">STREAM.TX</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 relative z-10 cursor-ns-resize">
              <AnimatePresence mode="popLayout">
                {recentMovements.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <Activity className="w-12 h-12 text-white mx-auto mb-3" />
                    <div className="text-xs font-bold uppercase tracking-widest">NO_ACTIVITY</div>
                  </div>
                ) : (
                  recentMovements.map((movement, idx) => (
                    <motion.div 
                      key={movement.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors flex flex-col gap-3 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded flex items-center justify-center shrink-0 border",
                            movement.type === 'IN' ? 'bg-emerald-500/10 border-emerald-500/20' :
                            movement.type === 'OUT' ? 'bg-amber-500/10 border-amber-500/20' :
                            'bg-cyan-500/10 border-cyan-500/20'
                          )}>
                            {movement.type === 'IN' ? (
                              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                            ) : movement.type === 'OUT' ? (
                              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Activity className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            movement.type === 'IN' ? "text-emerald-500" : 
                            movement.type === 'OUT' ? "text-amber-500" : "text-cyan-500"
                          )}>
                            OP.{movement.type}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between px-1">
                         <div className="font-mono text-xs font-bold text-slate-400 tracking-tight">
                            {movement.stockId.substring(0, 8).toUpperCase()}
                         </div>
                         <div className={cn(
                           "font-mono text-lg font-light tabular-nums",
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
            <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0a0f18] to-transparent z-20 pointer-events-none" />
          </GlassCard>
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
    </motion.div>
  );
}

function StatCompact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-base font-bold text-white -mt-0.5">{value}</span>
      </div>
    </div>
  );
}
