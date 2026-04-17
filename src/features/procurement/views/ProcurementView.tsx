import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShoppingCart, Clock, CheckCircle2, AlertCircle, Search, Filter, Loader2, ArrowRightCircle, PackagePlus } from 'lucide-react';
import { useProcurementEngine, EnrichedPurchaseOrder } from '@/features/pdr-engine/hooks/useProcurementEngine';

export function ProcurementView() {
  const { orders, isLoading, confirmOrder, receiveOrder } = useProcurementEngine();
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'DRAFT': return { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
      case 'ORDERED': return { color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' };
      case 'DELIVERED': return { color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' };
      case 'CANCELLED': return { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' };
      default: return { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
    }
  };

  const handleAction = async (orderId: string, action: 'CONFIRM' | 'RECEIVE') => {
    setProcessingId(orderId);
    try {
      if (action === 'CONFIRM') {
        await confirmOrder(orderId);
        setToastMsg({ id: Date.now().toString(), msg: 'Order Confirmed & Placed!', type: 'success' });
      } else if (action === 'RECEIVE') {
        await receiveOrder(orderId);
        setToastMsg({ id: Date.now().toString(), msg: 'Goods received and stock updated!', type: 'success' });
      }
    } catch (err: any) {
      setToastMsg({ id: Date.now().toString(), msg: err?.message || 'Operation failed', type: 'error' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const pendingCount = orders.filter(o => o.status === 'ORDERED' || o.status === 'DRAFT').length;
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;
  const totalSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  if (isLoading) {
    return <div className="p-8 text-[var(--text-dim)] flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Loading Procurement Engine...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full flex items-center gap-3 border shadow-2xl backdrop-blur-md ${
              toastMsg.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'bg-red-500/20 border-red-500/30 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            }`}
          >
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toastMsg.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-end mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Procurement Live Control</h1>
          <p className="text-[var(--text-dim)] text-lg">Manage purchase orders and external supply chain.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Clock className="text-amber-400" />} label="Pending Orders" value={pendingCount.toString()} />
        <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Delivered" value={deliveredCount.toString()} />
        <StatCard icon={<AlertCircle className="text-red-400" />} label="Overdue" value="0" />
        <StatCard icon={<ShoppingCart className="text-blue-400" />} label="Total Spend" value={`$${totalSpend.toFixed(2)}`} />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-[var(--text-bright)]">Purchase Orders Radar</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input 
                type="text" 
                placeholder="Search queries..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/20 border border-[var(--glass-border)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all w-64"
              />
            </div>
            <button className="p-2 rounded-lg bg-white/5 border border-[var(--glass-border)] text-[var(--text-dim)] hover:text-[var(--text-bright)]">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Order ID</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Vendor</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Date</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Lines</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Status</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider text-right">Total</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {filteredOrders.map((order) => {
                const style = getStatusStyle(order.status);
                const isProcessing = processingId === order.id;
                
                return (
                  <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-sm font-medium text-[var(--accent)] truncate max-w-[100px]">{order.id.substring(0, 8)}</td>
                    <td className="py-4 text-sm text-[var(--text-bright)]">
                       {order.supplierName === 'SYSTEM_AUTO_GENERATED' ? (
                         <span className="flex items-center gap-2 text-indigo-300"><ShoppingCart className="w-3 h-3"/> Auto-Generated</span>
                       ) : order.supplierName}
                    </td>
                    <td className="py-4 text-sm text-[var(--text-dim)]">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="py-4 text-sm text-[var(--text-dim)]">{order.lines.length} items</td>
                    <td className="py-4">
                      <motion.span 
                        layout
                        animate={{ backgroundColor: style.bg, borderColor: style.border, color: style.color }}
                        transition={{ duration: 0.3 }}
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${order.status === 'ORDERED' ? 'animate-pulse' : ''}`}
                      >
                        {order.status}
                      </motion.span>
                    </td>
                    <td className="py-4 text-sm font-mono text-[var(--text-bright)] text-right">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-4 text-right">
                      {order.status === 'DRAFT' && (
                        <button
                          onClick={() => handleAction(order.id, 'CONFIRM')}
                          disabled={isProcessing}
                          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <ArrowRightCircle className="w-3 h-3"/>}
                          Place Order
                        </button>
                      )}
                      
                      {order.status === 'ORDERED' && (
                        <button
                          onClick={() => handleAction(order.id, 'RECEIVE')}
                          disabled={isProcessing}
                          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
                        >
                          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <PackagePlus className="w-3 h-3"/>}
                          Receive Goods
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="inline-flex items-center justify-center text-emerald-500/50">
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-dim)]">No purchase orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <GlassCard className="flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-[var(--glass-border)]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold text-[var(--text-bright)] mt-0.5">{value}</p>
      </div>
    </GlassCard>
  );
}
