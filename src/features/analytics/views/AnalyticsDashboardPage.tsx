import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { useAnalyticsEngine } from '../hooks/useAnalyticsEngine';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Eye, TrendingUp, PackageSearch, PenTool, Database, Loader2 } from 'lucide-react';

export function AnalyticsDashboardPage() {
  const { kpis, topMachines, techActivity, stockHealth, isLoading } = useAnalyticsEngine();

  if (isLoading) {
    return <div className="p-12 flex items-center gap-3 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /> Booting The Oracle...</div>;
  }

  // Liquid Chart Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl">
          <p className="text-sm font-semibold text-white mb-1">{label || payload[0]?.name}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
              {p.name}: <span className="text-white font-mono">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      {/* Oracle Header */}
      <header className="mb-8 pt-2">
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2 flex items-center gap-3">
          <Eye className="w-8 h-8 text-indigo-400" /> The Oracle 
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Executive</span>
        </h1>
        <p className="text-slate-400 text-lg">Central nervous system telemetry. Global supply chain and maintenance insights.</p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0 }}>
          <GlassCard className="relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Global Stock Volume</h3>
                  <div className="text-3xl font-bold font-mono text-white">
                    {kpis.totalStockVolume.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-medium">units</span>
                  </div>
                </div>
             </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <GlassCard className="relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400">
                  <PackageSearch className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Distinct Parts</h3>
                  <div className="text-3xl font-bold font-mono text-white">
                    {kpis.distinctParts.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-medium">blueprints</span>
                  </div>
                </div>
             </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <GlassCard className="relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
             <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-fuchsia-500/20 transition-all" />
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20 text-fuchsia-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Monthly Requisitions</h3>
                  <div className="text-3xl font-bold font-mono text-white">
                    {kpis.totalReqsThisMonth.toLocaleString()} <span className="text-sm font-sans text-slate-400 font-medium">orders</span>
                  </div>
                </div>
             </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Top Consuming Machines */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <GlassCard className="h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-white mb-1">The Black Holes 🕳️</h2>
              <p className="text-xs text-slate-400 mb-6 uppercase tracking-wider">Top Consuming Machines (Units Drafted)</p>
            </div>
            <div className="flex-1 relative z-10">
              {topMachines.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMachines} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} width={120} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="quantity" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={24}>
                      {topMachines.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Insufficient requisition data</div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Right: Stock Health Pie */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <GlassCard className="h-[400px] flex flex-col relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-white mb-1">Global Stock Health 🏥</h2>
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Inventory Viability Index</p>
            </div>
            <div className="flex-1 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockHealth}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stockHealth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="" />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-6">
                {stockHealth.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-400 font-medium">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

      </div>

      {/* Bottom Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <GlassCard className="relative overflow-hidden border-orange-500/20 bg-orange-500/5">
           <div className="absolute top-0 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
           <div className="relative z-10">
             <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
               <PenTool className="w-5 h-5 text-orange-400" /> Top Requisitioning Technicians
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                {techActivity.length > 0 ? techActivity.map((tech, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-center hover:border-orange-500/30 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-lg mb-2 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                       #{idx + 1}
                     </div>
                     <h3 className="text-sm font-medium text-white w-full truncate px-2">{tech.name}</h3>
                     <span className="text-xs text-slate-400">{tech.count} requests</span>
                  </div>
                )) : (
                  <div className="col-span-full py-8 text-center text-slate-400 text-sm">Awaiting field activity to populate.</div>
                )}
             </div>
           </div>
        </GlassCard>
      </motion.div>

    </div>
  );
}
