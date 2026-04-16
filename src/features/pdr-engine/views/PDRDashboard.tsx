import React from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

export function PDRDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight">PDR Engine Overview</h1>
        <p className="text-[var(--text-dim)] mt-1">Spare Parts & Inventory Management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Parts" 
          value="12,450" 
          trend="+2.4%" 
          icon={<Package className="w-5 h-5 text-blue-400" />} 
        />
        <StatCard 
          title="Low Stock Alerts" 
          value="34" 
          trend="-12%" 
          trendDown 
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} 
        />
        <StatCard 
          title="Monthly Usage" 
          value="1,240" 
          trend="+8.1%" 
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} 
        />
        <StatCard 
          title="System Health" 
          value="99.9%" 
          trend="Stable" 
          icon={<Activity className="w-5 h-5 text-purple-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <GlassCard className="lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)]">Inventory Activity</h2>
          </div>
          <div className="flex-1 flex items-center justify-center border border-dashed border-[var(--glass-border)] rounded-xl bg-white/5">
            <p className="text-[var(--text-dim)]">Chart Visualization Area</p>
          </div>
        </GlassCard>
        
        <div className="flex flex-col gap-5">
          <GlassCard>
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] mb-[15px]">Core Engine Status</h2>
            <div className="flex justify-between mb-3">
              <span className="text-[var(--text-dim)] text-[12px]">Inventory Value</span>
              <span className="font-mono text-[var(--text-bright)]">€1,429,550.00</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-[var(--text-dim)] text-[12px]">Total SKUs</span>
              <span className="font-mono text-[var(--text-bright)]">12,482</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-[var(--text-dim)] text-[12px]">Pending Orders</span>
              <span className="font-mono text-[var(--text-bright)]">14</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-[var(--text-dim)] text-[12px]">Stock-out Risk</span>
              <span className="font-mono text-amber-500">2.4%</span>
            </div>
            <button className="bg-[var(--accent)] text-white border-none rounded-lg p-2.5 text-[13px] font-semibold w-full mt-2.5 cursor-pointer">
              Run Analysis Report
            </button>
          </GlassCard>

          <GlassCard className="flex-1">
            <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] mb-[15px]">Recent Activity</h2>
            <div className="text-[11px] flex flex-col gap-3">
              <div className="border-l-2 border-[var(--accent)] pl-2.5">
                <p className="text-[var(--text-bright)]">Stock update #PDR-1082-A</p>
                <p className="text-[var(--text-dim)]">3 mins ago • Admin user</p>
              </div>
              <div className="border-l-2 border-[var(--text-dim)] pl-2.5">
                <p className="text-[var(--text-bright)]">Manual Audit completed</p>
                <p className="text-[var(--text-dim)]">1 hour ago • Warehouse B</p>
              </div>
              <div className="border-l-2 border-amber-500 pl-2.5">
                <p className="text-[var(--text-bright)]">Threshold alert triggered</p>
                <p className="text-[var(--text-dim)]">2 hours ago • Automated</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendDown, icon }: { title: string, value: string, trend: string, trendDown?: boolean, icon: React.ReactNode }) {
  return (
    <GlassCard>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendDown ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-[var(--text-dim)] text-sm font-medium mb-1">{title}</h4>
        <p className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight">{value}</p>
      </div>
    </GlassCard>
  );
}
