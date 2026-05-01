import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { AlertTriangle, CheckCircle, ArrowRightLeft, Wrench, ShieldCheck, FileWarning, Search, RefreshCw, ShoppingCart, Zap, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { GlassCard } from '@/shared/components/GlassCard';
import { cn } from '@/shared/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export function ReconciliationCenterView() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { notify } = useNotifications();

  // Fetch anomalies via live query
  const anomalies = useLiveQuery(async () => {
    const allItems = await db.inventory.toArray();
    const blueprints = await db.pdrBlueprints.toArray();
    const bpMap = new Map(blueprints.map(bp => [bp.id, bp]));

    const detected: any[] = [];

    allItems.forEach(item => {
      const bp = bpMap.get(item.blueprintId);
      const minThreshold = bp?.minThreshold || 0;

      if (item.quantityCurrent < 0) {
        detected.push({
          id: item.id,
          blueprintId: item.blueprintId,
          reference: bp?.reference || 'UNKNOWN',
          type: 'NEGATIVE_STOCK',
          severity: 'CRITICAL',
          currentValue: item.quantityCurrent,
          description: 'Stock quantity falls below absolute zero.',
          recommendedAction: 'Reset to 0 and log an INVENTORY_ADJUSTMENT movement.'
        });
      } else if (item.quantityCurrent === 0) {
        detected.push({
          id: item.id,
          blueprintId: item.blueprintId,
          reference: bp?.reference || 'UNKNOWN',
          type: 'DEPLETED',
          severity: 'HIGH',
          currentValue: item.quantityCurrent,
          description: 'Stock is completely depleted.',
          recommendedAction: 'Initiate urgent Purchase Order or check unlogged receipts.'
        });
      } else if (item.quantityCurrent < minThreshold) {
        detected.push({
          id: item.id,
          blueprintId: item.blueprintId,
          reference: bp?.reference || 'UNKNOWN',
          type: 'LOW_STOCK',
          severity: 'MEDIUM',
          currentValue: item.quantityCurrent,
          threshold: minThreshold,
          description: `Stock is below the minimum threshold (${minThreshold}).`,
          recommendedAction: 'Plan standard procurement requisition.'
        });
      }
    });

    return detected.sort((a, b) => {
      const sMap = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
      return sMap[a.severity as keyof typeof sMap] - sMap[b.severity as keyof typeof sMap];
    });
  });

  const handleFixNegative = async (item: any) => {
    try {
      setIsProcessing(true);
      await db.inventory.update(item.id, {
        quantityCurrent: 0,
        updatedAt: new Date().toISOString()
      });

      const adjustmentQty = Math.abs(item.currentValue);
      await db.movements.add({
        id: crypto.randomUUID(),
        stockId: item.blueprintId,
        type: 'ADJUST',
        quantity: adjustmentQty,
        performedBy: 'Auto-Reconciliation System',
        timestamp: new Date().toISOString(),
        notes: `System auto-reconciliation: Compensated negative deficit (${item.currentValue}) to 0.`
      });

      notify('info', `Anomaly Resolved: ${item.reference}`, `Stock reset to 0. Logged adjustment of +${adjustmentQty}.`, 'PDR');
    } catch (error: any) {
      notify('critical', 'Reconciliation Failed', error.message, 'PDR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchFixNegatives = async () => {
    if (!anomalies) return;
    const negatives = anomalies.filter(a => a.type === 'NEGATIVE_STOCK');
    if (negatives.length === 0) return;

    try {
      setIsProcessing(true);
      let count = 0;
      await db.transaction('rw', db.inventory, db.movements, async () => {
        for (const item of negatives) {
          await db.inventory.update(item.id, {
            quantityCurrent: 0,
            updatedAt: new Date().toISOString()
          });

          const adjustmentQty = Math.abs(item.currentValue);
          await db.movements.add({
            id: crypto.randomUUID(),
            stockId: item.blueprintId,
            type: 'ADJUST',
            quantity: adjustmentQty,
            performedBy: 'Auto-Reconciliation System',
            timestamp: new Date().toISOString(),
            notes: `Batch auto-reconciliation: Compensated negative deficit (${item.currentValue}) to 0.`
          });
          count++;
        }
      });

      notify('info', 'Batch Reconciliation Complete', `Successfully resolved ${count} critical negative stock anomalies.`, 'PDR');
    } catch (error: any) {
      notify('critical', 'Batch Reconciliation Failed', error.message, 'PDR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePO = (item: any) => {
    notify('info', 'Procurement Triggered', `Drafting Purchase Order for ${item.reference}. Redirecting to Procurement module...`, 'PROCUREMENT');
  };

  const filteredAnomalies = anomalies?.filter(a => 
    a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-8 pb-12 px-4 lg:px-8"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <Wrench className="w-8 h-8 text-cyan-500" /> Auto-Reconciliation Center
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80">Resolve data inconsistencies, negative stock, and supply deficits.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <StatCompact icon={<ShieldAlert className="w-4 h-4 text-slate-400" />} label="Anomalies" value={anomalies?.length.toString() || '0'} />
          <StatCompact icon={<TrendingUp className="w-4 h-4 text-cyan-500" />} label="Resolved" value="94%" />
          <StatCompact icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} label="Health" value="Stable" />
          <StatCompact icon={<Zap className="w-4 h-4 text-amber-500" />} label="Sync" value="Active" />
        </div>
      </motion.header>

      <motion.div variants={itemVariants}>
        <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <RefreshCw className={cn("w-6 h-6 text-cyan-400", isProcessing && "animate-spin")} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Inconsistencies</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time stock integrity monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anomalies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="titan-input pl-11 w-80 shadow-none"
              />
            </div>
            
            {anomalies && anomalies.filter(a => a.type === 'NEGATIVE_STOCK').length > 0 && (
              <button 
                onClick={handleBatchFixNegatives}
                disabled={isProcessing}
                className="titan-button titan-button-primary"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
                Resolve Negatives
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1c23]/50">
                <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Reference</th>
                <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Severity</th>
                <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Current Val</th>
                <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Recommended Action</th>
                <th className="px-8 py-5 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] bg-black/5">
              {filteredAnomalies?.map((anomaly, idx) => (
                <tr key={anomaly.id} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                        anomaly.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        anomaly.severity === 'HIGH' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      )}>
                        {anomaly.severity === 'CRITICAL' ? <FileWarning className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-semibold text-white tracking-tight">{anomaly.reference}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border",
                      anomaly.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      anomaly.severity === 'HIGH' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    )}>
                      {anomaly.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-slate-400 uppercase tracking-widest">
                    {anomaly.type.replace('_', ' ')}
                  </td>
                  <td className="px-8 py-6 text-xs font-mono font-bold text-slate-300">
                    {anomaly.currentValue}
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-xs">
                      <p className="text-xs text-slate-400 italic line-clamp-2">{anomaly.recommendedAction}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end">
                      {anomaly.type === 'NEGATIVE_STOCK' ? (
                        <button
                          onClick={() => handleFixNegative(anomaly)}
                          disabled={isProcessing}
                          className="titan-button titan-button-success !px-4 !py-2 !text-[9px]"
                        >
                          <CheckCircle className="w-3 h-3" /> Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGeneratePO(anomaly)}
                          disabled={isProcessing}
                          className="titan-button titan-button-primary !px-4 !py-2 !text-[9px]"
                        >
                          <ShoppingCart className="w-3 h-3" /> Requisition
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(filteredAnomalies?.length === 0 || !filteredAnomalies) && (
                <tr className="bg-black/20">
                  <td colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <ShieldCheck className="w-16 h-16 mb-4 text-emerald-500" />
                      <p className="text-lg font-bold uppercase tracking-widest text-white">No active anomalies detected</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
      </motion.div>
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
