import React from 'react';
import { motion } from 'motion/react';
import { CalendarClock, ShieldCheck, HardHat, TrendingUp, Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { cn } from '@/shared/utils';
import { GlassCard } from '@/shared/components/GlassCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export function PreventiveDashboard() {
  const stats = useLiveQuery(async () => {
    const totalSchedules = await db.pmSchedules.count();
    const pendingOrders = await db.pmWorkOrders.where('status').equals('PENDING').count();
    const inProgressOrders = await db.pmWorkOrders.where('status').equals('IN_PROGRESS').count();
    const completedOrders = await db.pmWorkOrders.where('status').equals('COMPLETED').count();
    const checklists = await db.pmChecklists.count();

    const upcomingOrders = await db.pmWorkOrders
      .where('status')
      .anyOf(['PENDING', 'IN_PROGRESS'])
      .limit(5)
      .toArray();

    return { totalSchedules, pendingOrders, inProgressOrders, completedOrders, checklists, upcomingOrders };
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-24 px-4 relative z-10 w-full lg:px-8"
    >
      <motion.div variants={itemVariants} className="mb-12 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <ShieldCheck className="w-8 h-8 text-emerald-500" /> Maintenance Operations
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">
            Preventive Maintenance Dashboard
          </p>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
           <div className="px-5 py-2 flex flex-col items-center border-r border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sys. Health</span>
              <span className="text-emerald-400 font-mono text-sm uppercase">Nominal</span>
           </div>
           <div className="px-5 py-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Ops</span>
              <span className="text-white font-mono text-sm">{stats?.inProgressOrders || 0}</span>
           </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Protocols" 
          value={stats?.totalSchedules || 0} 
          icon={<CalendarClock />} 
          color="emerald" 
          label="Schedules"
        />
        <StatCard 
          title="Pending Allocation" 
          value={stats?.pendingOrders || 0} 
          icon={<HardHat />} 
          color="amber" 
          label="Work Orders"
        />
        <StatCard 
          title="Operations Sync" 
          value={stats?.completedOrders || 0} 
          icon={<TrendingUp />} 
          color="emerald" 
          label="Completed"
        />
        <StatCard 
          title="Schema Definitions" 
          value={stats?.checklists || 0} 
          icon={<Activity />} 
          color="cyan" 
          label="Checklists"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Upcoming Tasks */}
        <div className="xl:col-span-2">
          <GlassCard className="p-0 flex flex-col overflow-hidden h-[450px] shadow-[0_0_30px_rgba(0,0,0,0.5)] border-white/5">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-500" /> Maintenance Queue
              </h2>
              <span className="text-[10px] text-emerald-500/70 border border-emerald-500/20 font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">Active</span>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
              {stats?.upcomingOrders && stats.upcomingOrders.length > 0 ? (
                 <div className="space-y-4">
                    {stats.upcomingOrders.map(order => (
                      <div key={order.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm",
                              order.status === 'IN_PROGRESS' ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            )}>
                               <Activity className="w-5 h-5" />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Work Order #{order.id.substring(0,8)}</h4>
                               <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">Machine ID: {order.machineId.substring(0,12)}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className={cn(
                              "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight border shadow-sm",
                              order.status === 'IN_PROGRESS' ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-white/5 border-white/10 text-slate-400"
                            )}>
                              {order.status}
                            </span>
                            <button className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95">
                               <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mb-4" />
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">No Pending Orders</span>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">All equipment maintenance is up to date</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions / System Status */}
        <div className="flex flex-col gap-6 h-[450px]">
           <GlassCard className="p-6 border-emerald-500/10 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
             <h2 className="text-xs font-bold text-slate-100 mb-6 uppercase tracking-widest flex items-center gap-2 relative z-10">
                <Activity className="w-4 h-4 text-emerald-400" /> Maintenance Actions
             </h2>
             <div className="flex flex-col gap-4 relative z-10">
                <QuickActionButton 
                  title="Initialize Protocol" 
                  desc="Define new maintenance schema" 
                  color="emerald" 
                />
                <QuickActionButton 
                  title="Force Work Order" 
                  desc="Manual override schedule" 
                  color="emerald" 
                />
             </div>
           </GlassCard>

           <GlassCard className="p-6 border-white/5 flex-1 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                   <AlertTriangle className="w-4 h-4 text-amber-500" />
                 </div>
                 <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Compliance Overview</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Overdue Critical</span>
                    <span className="text-rose-400 font-mono text-xs font-bold">0 Items</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Safety Sign-offs</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Complete</span>
                 </div>
              </div>
           </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuickActionButton({ title, desc, color }: { title: string; desc: string; color: 'emerald' | 'indigo' | 'cyan' | 'blue' }) {
  const colors: Record<string, string> = {
    emerald: "border-emerald-500/20 bg-emerald-500/[0.02] hover:bg-emerald-500/10 text-emerald-400",
    indigo: "border-indigo-500/20 bg-indigo-500/[0.02] hover:bg-indigo-500/10 text-indigo-400",
    cyan: "border-cyan-500/20 bg-cyan-500/[0.02] hover:bg-cyan-500/10 text-cyan-400",
    blue: "border-blue-500/20 bg-blue-500/[0.02] hover:bg-blue-500/10 text-blue-400",
  };

  return (
    <button className={cn(
      "w-full p-4 rounded-xl border text-left transition-all duration-300 group active:scale-[0.98] shadow-sm",
      colors[color]
    )}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-[11px] uppercase tracking-widest">{title}</span>
        <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-[10px] opacity-60 font-medium text-slate-400">{desc}</p>
    </button>
  );
}

function StatCard({ title, value, icon, color, label }: { title: string; value: string | number; icon: React.ReactNode; color: 'emerald' | 'amber' | 'slate' | 'cyan'; label?: string }) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    slate: "text-slate-400 border-slate-500/20 bg-slate-500/10 shadow-[0_0_15px_rgba(100,116,139,0.15)]",
  };

  const style = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className="relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] !p-6 border-white/5">
         <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{title}</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 opacity-60">{label}</p>
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-110", style)}>
               {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
            </div>
         </div>
         <div className="text-4xl font-bold font-mono text-white flex items-baseline gap-2 tracking-tight relative z-10">
           {value}
         </div>
      </GlassCard>
    </motion.div>
  );
}

