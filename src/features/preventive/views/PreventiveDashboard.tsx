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
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
            <ShieldCheck className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            SHIELD COMMAND
          </h1>
          <p className="text-[#8b9bb4] uppercase tracking-[0.3em] text-[10px] mt-2 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            Tactical Maintenance Operations Center
          </p>
        </div>
        
        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
           <div className="px-4 py-2 flex flex-col items-center border-r border-white/5">
              <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-widest">Sys. Health</span>
              <span className="text-emerald-400 font-mono text-sm uppercase">Optimized</span>
           </div>
           <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-widest">Active Ops</span>
              <span className="text-white font-mono text-sm">{stats?.inProgressOrders || 0}</span>
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Protocols" 
          value={stats?.totalSchedules || 0} 
          icon={<CalendarClock />} 
          color="emerald" 
          label="Schedules"
        />
        <StatCard 
          title="Pending Deployment" 
          value={stats?.pendingOrders || 0} 
          icon={<HardHat />} 
          color="amber" 
          label="Work Orders"
          glow
        />
        <StatCard 
          title="Operational Sync" 
          value={stats?.completedOrders || 0} 
          icon={<TrendingUp />} 
          color="cyan" 
          label="Completed"
        />
        <StatCard 
          title="Schema Blueprints" 
          value={stats?.checklists || 0} 
          icon={<Activity />} 
          color="indigo" 
          label="Checklists"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1">
        {/* Upcoming Tasks */}
        <div className="xl:col-span-2 titan-card p-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Tactical Queue
            </h2>
            <span className="text-[10px] text-[#8b9bb4] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Real-time Feed</span>
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
                             <h4 className="text-sm font-bold text-white">Maintenance Deployment #{order.id.substring(0,8)}</h4>
                             <p className="text-[10px] text-[#8b9bb4] mt-1 font-mono uppercase tracking-widest">Machine ID: {order.machineId.substring(0,12)}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter border",
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
                <ShieldCheck className="w-12 h-12 text-emerald-500/20 mb-4" />
                <span className="text-[#8b9bb4] text-xs font-bold uppercase tracking-[0.2em] opacity-40">Zero Pending Threats</span>
                <span className="text-[10px] text-emerald-500/40 mt-1 italic">All systems performing within nominal parameters</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="flex flex-col gap-6">
           <div className="titan-card p-6 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
             <h2 className="text-xs font-bold text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Command Actions
             </h2>
             <div className="flex flex-col gap-3">
                <QuickActionButton 
                  title="Initialize Protocol" 
                  desc="Define new maintenance schema" 
                  color="emerald" 
                />
                <QuickActionButton 
                  title="Force Deployment" 
                  desc="Manual override work order" 
                  color="indigo" 
                />
                <QuickActionButton 
                  title="Telemetry Sync" 
                  desc="Import data from sensor hub" 
                  color="cyan" 
                />
             </div>
           </div>

           <div className="titan-card p-6 border-amber-500/30 bg-amber-500/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                 <AlertTriangle className="w-5 h-5 text-amber-500" />
                 <h3 className="text-xs font-bold text-white uppercase tracking-widest">Security Overview</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-[#8b9bb4] font-bold uppercase">Critical Caps</span>
                    <span className="text-rose-400 font-mono text-xs">0 Active</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-[#8b9bb4] font-bold uppercase">Auth Override</span>
                    <span className="text-emerald-400 font-mono text-xs">Disabled</span>
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
      <p className="text-[10px] opacity-60 mt-1 italic">{desc}</p>
    </button>
  );
}

function StatCard({ title, value, icon, color, label, glow }: any) {
  const colorMap: any = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-amber-500/5',
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 shadow-cyan-500/5',
    indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10 shadow-indigo-500/5',
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
      {glow && (
        <div className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20",
          color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
        )} />
      )}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{title}</h3>
          <p className="text-[9px] font-bold opacity-40 italic">{label}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 opacity-80 backdrop-blur-sm">
          {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
        </div>
      </div>
      <div className="text-4xl font-black italic tracking-tighter flex items-end gap-2">
        {value}
        <span className="text-[10px] font-bold uppercase opacity-30 mb-1.5 tracking-widest italic">Units</span>
      </div>
      
      {/* Decorative inner glow */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  );
}

