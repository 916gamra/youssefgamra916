import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarClock, ShieldCheck, HardHat, TrendingUp } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';

export function PreventiveDashboard() {
  const stats = useLiveQuery(async () => {
    const totalSchedules = await db.pmSchedules.count();
    const pendingOrders = await db.pmWorkOrders.where('status').equals('PENDING').count();
    const completedOrders = await db.pmWorkOrders.where('status').equals('COMPLETED').count();
    const checklists = await db.pmChecklists.count();

    return { totalSchedules, pendingOrders, completedOrders, checklists };
  });

  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-400 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" />
          Shield Ops Dashboard
        </h1>
        <p className="text-[var(--text-dim)] uppercase tracking-widest text-sm mt-2 font-medium">
          Preventive Maintenance Command Center
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Schedules" 
          value={stats?.totalSchedules || 0} 
          icon={<CalendarClock />} 
          color="emerald" 
        />
        <StatCard 
          title="Pending Work Orders" 
          value={stats?.pendingOrders || 0} 
          icon={<HardHat />} 
          color="amber" 
          glow
        />
        <StatCard 
          title="Completed (30d)" 
          value={stats?.completedOrders || 0} 
          icon={<TrendingUp />} 
          color="cyan" 
        />
        <StatCard 
          title="Protocol Checklists" 
          value={stats?.checklists || 0} 
          icon={<ShieldCheck />} 
          color="indigo" 
        />
      </div>

      {/* Main Operation Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Upcoming Tasks */}
        <div className="xl:col-span-2 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <h2 className="text-xl font-bold text-white mb-4">Urgent & Upcoming Operations</h2>
          
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-emerald-500/20 rounded-xl bg-black/20">
            <ShieldCheck className="w-10 h-10 text-emerald-500/30 mb-2" />
            <span className="text-emerald-500/50 text-sm font-medium">No pending critical operations. Systems nominal.</span>
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="border border-[var(--glass-border)] bg-black/40 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4">Command Actions</h2>
          <div className="flex flex-col gap-3">
             <button className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-left transition-colors flex flex-col">
               <span>Deploy Protocol</span>
               <span className="text-xs text-emerald-500/60 mt-1">Create new checklist template</span>
             </button>
             <button className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-left transition-colors flex flex-col">
               <span>Schedule Mission</span>
               <span className="text-xs text-indigo-500/60 mt-1">Bind protocol to a specific machine</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, glow }: any) {
  const colorMap: any = {
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/5',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-amber-500/5',
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10 shadow-cyan-500/5',
    indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10 shadow-indigo-500/5',
  };

  const style = colorMap[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between overflow-hidden shadow-xl ${style}`}
    >
      {glow && <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-50 bg-${color}-500`} />}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">{title}</h3>
        <div className="opacity-70">{icon}</div>
      </div>
      <div className="text-4xl font-black relative z-10">{value}</div>
    </motion.div>
  );
}
