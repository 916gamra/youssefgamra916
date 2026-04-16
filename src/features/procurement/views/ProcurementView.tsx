import React from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShoppingCart, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';

export function ProcurementView() {
  const orders = [
    { id: 'PO-2024-001', vendor: 'Industrial Supplies Co.', date: '2024-04-10', status: 'Pending', total: '$1,240.00' },
    { id: 'PO-2024-002', vendor: 'TechParts Ltd.', date: '2024-04-12', status: 'Approved', total: '$850.50' },
    { id: 'PO-2024-003', vendor: 'Global Logistics', date: '2024-04-14', status: 'Shipped', total: '$2,100.00' },
    { id: 'PO-2024-004', vendor: 'Precision Tools', date: '2024-04-15', status: 'Delivered', total: '$420.00' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Approved': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Shipped': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Procurement v4</h1>
          <p className="text-[var(--text-dim)] text-lg">Manage purchase orders and vendor relations.</p>
        </div>
        <button className="bg-[var(--accent)] hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          New Purchase Order
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Clock className="text-amber-400" />} label="Pending Orders" value="12" />
        <StatCard icon={<CheckCircle2 className="text-emerald-400" />} label="Approved" value="45" />
        <StatCard icon={<AlertCircle className="text-red-400" />} label="Overdue" value="3" />
        <StatCard icon={<ShoppingCart className="text-blue-400" />} label="Total Spend" value="$42.5k" />
      </div>

      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-[var(--text-bright)]">Recent Purchase Orders</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input 
                type="text" 
                placeholder="Search orders..." 
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
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider">Status</th>
                <th className="pb-4 font-semibold text-[var(--text-dim)] text-xs uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 text-sm font-medium text-[var(--accent)]">{order.id}</td>
                  <td className="py-4 text-sm text-[var(--text-bright)]">{order.vendor}</td>
                  <td className="py-4 text-sm text-[var(--text-dim)]">{order.date}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-mono text-[var(--text-bright)] text-right">{order.total}</td>
                </tr>
              ))}
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
