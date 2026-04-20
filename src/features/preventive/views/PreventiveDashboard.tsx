import React from 'react';
import { motion } from 'motion/react';
import { CalendarClock, ShieldCheck, HardHat, TrendingUp, Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { cn } from '@/shared/utils';

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
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0a0a0f]">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3 uppercase">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Maintenance Operations
          </h1>
          <p className="text-slate-400 uppercase tracking-widest text-xs mt-2 font-semibold flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
            Preventive Maintenance Dashboard
          </p>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
           <div className="px-4 py-2 flex flex-col items-center border-r border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sys. Health</span>
              <span className="text-blue-400 font-mono text-sm uppercase">Nominal</span>
           </div>
           <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-widest">Active Ops</span>
              <span className="text-white font-mono text-sm">{stats?.inProgressOrders || 0}</span>
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Active Protocols" 
          value={stats?.totalSchedules || 0} 
          icon={<CalendarClock />} 
          color="blue" 
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
          color="slate" 
          label="Completed"
        />
        <StatCard 
          title="Schema Definitions" 
          value={stats?.checklists || 0} 
          icon={<Activity />} 
          color="blue" 
          label="Checklists"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1">
        {/* Upcoming Tasks */}
        <div className="xl:col-span-2 titan-card p-0 flex flex-col overflow-hidden border-white/5">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Maintenance Queue
            </h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Active</span>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {stats?.upcomingOrders && stats.upcomingOrders.length > 0 ? (
               <div className="space-y-4">
                  {stats.upcomingOrders.map(order => (
                    <div key={order.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center border",
                            order.status === 'IN_PROGRESS' ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          )}>
                             <Activity className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-100">Work Order #{order.id.substring(0,8)}</h4>
                             <p className="text-[10px] text-[#8b9bb4] mt-1 font-mono uppercase tracking-widest">Machine ID: {order.machineId.substring(0,12)}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tight border",
                            order.status === 'IN_PROGRESS' ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" : "bg-white/5 border-white/10 text-[#8b9bb4]"
                          )}>
                            {order.status}
                          </span>
                          <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500/20 active:scale-95">
                             <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mb-4" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">No Pending Orders</span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">All equipment maintenance is up to date</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / System Status */}
        <div className="flex flex-col gap-6">
           <div className="titan-card p-6 bg-blue-500/5">
             <h2 className="text-xs font-bold text-slate-100 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Maintenance Actions
             </h2>
             <div className="flex flex-col gap-3">
                <QuickActionButton 
                  title="Initialize Protocol" 
                  desc="Define new maintenance schema" 
                  color="blue" 
                />
                <QuickActionButton 
                  title="Force Work Order" 
                  desc="Manual override schedule" 
                  color="blue" 
                />
             </div>
           </div>

           <div className="titan-card p-6 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                 <AlertTriangle className="w-5 h-5 text-amber-500" />
                 <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Compliance Overview</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Overdue Critical</span>
                    <span className="text-rose-400 font-mono text-xs">0 Items</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Safety Sign-offs</span>
                    <span className="text-emerald-400 font-mono text-xs">Complete</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ title, desc, color }: any) {
  const colors: any = {
    emerald: "border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/10 text-emerald-400",
    indigo: "border-indigo-500/20 bg-indigo-500/[0.03] hover:bg-indigo-500/10 text-indigo-400",
    cyan: "border-cyan-500/20 bg-cyan-500/[0.03] hover:bg-cyan-500/10 text-cyan-400",
    blue: "border-blue-500/20 bg-blue-500/[0.03] hover:bg-blue-500/10 text-blue-400",
  };

  return (
    <button className={cn(
      "w-full p-4 rounded-2xl border text-left transition-all duration-300 group active:scale-[0.98]",
      colors[color]
    )}>
      <div className="flex justify-between items-center">
        <span className="font-bold text-xs uppercase tracking-[0.1em]">{title}</span>
        <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-[10px] opacity-60 mt-1 font-medium text-slate-400">{desc}</p>
    </button>
  );
}

function StatCard({ title, value, icon, color, label }: any) {
  const colorMap: any = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/10 shadow-blue-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-amber-500/5',
    slate: 'text-slate-400 border-slate-500/20 bg-white/5 shadow-slate-500/5',
  };

  const style = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-between overflow-hidden shadow-2xl transition-all hover:scale-[1.02]",
        style
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{title}</h3>
          <p className="text-[9px] font-bold opacity-60">{label}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 opacity-80 backdrop-blur-sm">
          {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
        </div>
      </div>
      <div className="text-3xl font-bold tracking-tight flex items-end gap-2 text-white">
        {value}
        <span className="text-[10px] font-bold uppercase opacity-50 mb-1 tracking-widest text-slate-400">Total</span>
      </div>
      
      {/* Decorative inner glow */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}

