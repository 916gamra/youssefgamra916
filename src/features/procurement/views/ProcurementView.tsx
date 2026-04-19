import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShoppingCart, Clock, CheckCircle2, AlertCircle, Search, Filter, Loader2, ArrowRightCircle, PackagePlus, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { useProcurementEngine } from '@/features/pdr-engine/hooks/useProcurementEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { cn } from '@/shared/utils';

export function ProcurementView() {
  const { orders, isLoading, confirmOrder, fulfillOrder } = useProcurementEngine();
  const { showSuccess, showError } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return { color: '#9CA3AF', bg: 'rgba(156,163,175,0.05)', border: 'rgba(156,163,175,0.2)', label: 'Draft / Pending' };
      case 'ORDERED': return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', label: 'On Route' };
      case 'FULFILLED': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'Stocked' };
      case 'CANCELLED': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Voided' };
      default: return { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)', label: status };
    }
  };

  const handleAction = async (orderId: string, action: 'CONFIRM' | 'FULFILL') => {
    setProcessingId(orderId);
    try {
      if (action === 'CONFIRM') {
        await confirmOrder(orderId);
        showSuccess('Order Dispatched', 'PO has been transmitted to supplier.');
      } else if (action === 'FULFILL') {
        await fulfillOrder(orderId);
        showSuccess('Inventory Synchronized', 'Order items have been injected into global stock.');
      }
    } catch (err: any) {
      showError('Transaction Failure', err?.message || 'State transition failed');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const orderedCount = orders.filter(o => o.status === 'ORDERED').length;
  const fulfilledCount = orders.filter(o => o.status === 'FULFILLED').length;
  const totalSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-50" />
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--text-dim)] animate-pulse">Syncing Procurement Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative px-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-4">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-bright)] tracking-tighter mb-2 flex items-center gap-4 italic uppercase">
            <ShoppingCart className="w-10 h-10 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" /> 
            Procurement Pipeline
          </h1>
          <p className="text-[var(--text-dim)] text-xl font-medium italic opacity-80">Orchestrating the supply chain state machine.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <StatCompact icon={<Clock className="text-yellow-400" />} label="Active" value={orderedCount.toString()} />
          <StatCompact icon={<TrendingUp className="text-emerald-400" />} label="Growth" value="+12%" />
          <StatCompact icon={<CheckCircle2 className="text-blue-400" />} label="Synced" value={fulfilledCount.toString()} />
          <StatCompact icon={<DollarSign className="text-fuchsia-400" />} label="Spend" value={`${(totalSpend/1000).toFixed(1)}k`} />
        </div>
      </header>

      <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl">
        <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Active Injunctions</h2>
              <p className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-widest">Real-time procurement tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Orders or Vendors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-sm text-[var(--text-bright)] focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all w-80 shadow-inner italic font-medium"
              />
            </div>
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[var(--text-dim)] hover:text-white hover:bg-white/10 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em]">Hash / ID</th>
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em]">Vendor Entity</th>
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em]">BOM Lines</th>
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em]">State</th>
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em] text-right">Value (USD)</th>
                <th className="px-8 py-5 font-black text-[var(--text-dim)] text-[10px] uppercase tracking-[0.2em] text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/10">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, idx) => {
                  const style = getStatusStyle(order.status);
                  const isProcessing = processingId === order.id;
                  
                  return (
                    <motion.tr 
                      key={order.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0"
                    >
                      <td className="px-8 py-6 text-xs font-mono font-black text-blue-400 group-hover:text-blue-300 transition-colors">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white italic uppercase tracking-tight">{order.supplierName}</span>
                          {order.supplierName === 'SYSTEM_AUTO_GENERATED' && (
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Automated Sync</span>
                          ) }
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-semibold text-[var(--text-dim)]">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-8 py-6">
                        <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/10">
                          {order.lines.length} Elements
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <motion.div 
                          layout
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm",
                            order.status === 'ORDERED' && "animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.1)]"
                          )}
                          style={{ backgroundColor: style.bg, borderColor: style.border, color: style.color }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          {style.label}
                        </motion.div>
                      </td>
                      <td className="px-8 py-6 text-sm font-mono font-bold text-white text-right">
                        ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleAction(order.id, 'CONFIRM')}
                              disabled={isProcessing}
                              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <ArrowRightCircle className="w-3 h-3"/>}
                              Transmit
                            </button>
                          )}
                          
                          {order.status === 'ORDERED' && (
                            <button
                              onClick={() => handleAction(order.id, 'FULFILL')}
                              disabled={isProcessing}
                              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <PackagePlus className="w-3 h-3"/>}
                              Fulfill
                            </button>
                          )}

                          {order.status === 'FULFILLED' && (
                            <div className="w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredOrders.length === 0 && (
                <tr className="bg-black/20">
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <AlertCircle className="w-16 h-16 mb-4 text-white" />
                      <p className="text-xl font-black italic uppercase tracking-[0.2em] text-white">No active purchase orders found</p>
                    </div>
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

function StatCompact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-all shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">{label}</span>
        <span className="text-lg font-black text-white italic -mt-1">{value}</span>
      </div>
    </div>
  );
}
