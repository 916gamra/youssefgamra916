import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Box, ShieldCheck, PieChart, Network, Settings, Factory, Activity, Cpu, Database, AlertTriangle, Users } from 'lucide-react';
import { useOsStore, PortalType } from '../store/useOsStore';
import type { User } from '@/core/db';
import { hasPortalAccess } from '@/core/permissions';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { GlassCard } from '@/shared/components/GlassCard';
import { cn } from '@/shared/utils';
import { SystemBackground } from '@/shared/components/SystemBackground';

// --- SYSTEM NODES CONFIGURATION ---
const APPS = [
  {
    id: 'PDR' as PortalType,
    title: 'PDR Engine',
    desc: 'Parts & Requisition Control',
    icon: Box,
    theme: 'cyan',
    sysCode: 'NODE-01'
  },
  {
    id: 'PREVENTIVE' as PortalType,
    title: 'Maintenance',
    desc: 'Preventive Task Scheduling',
    icon: ShieldCheck,
    theme: 'emerald',
    sysCode: 'NODE-02'
  },
  {
    id: 'ORGANIZATION' as PortalType,
    title: 'Part Catalog',
    desc: 'Master Reference Dictionary',
    icon: Network,
    theme: 'amber',
    sysCode: 'NODE-03'
  },
  {
    id: 'FACTORY' as PortalType,
    title: 'Factory Admin',
    desc: 'Sectors & Infrastructure',
    icon: Factory,
    theme: 'indigo',
    sysCode: 'NODE-04'
  },
  {
    id: 'ANALYTICS' as PortalType,
    title: 'Analytics Hub',
    desc: 'Executive Telemetry',
    icon: PieChart,
    theme: 'fuchsia',
    sysCode: 'NODE-05'
  },
  {
    id: 'SETTINGS' as PortalType,
    title: 'System Config',
    desc: 'RBAC & Global Security',
    icon: Settings,
    theme: 'rose',
    sysCode: 'NODE-06'
  }
];

const THEME_MAP: Record<string, string> = {
  cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  indigo: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5',
  fuchsia: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/5',
  rose: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
};

const BORDER_HOVER_MAP: Record<string, string> = {
  cyan: 'hover:border-cyan-500/50',
  emerald: 'hover:border-emerald-500/50',
  amber: 'hover:border-amber-500/50',
  indigo: 'hover:border-indigo-500/50',
  fuchsia: 'hover:border-fuchsia-500/50',
  rose: 'hover:border-rose-500/50',
};

const SHINE_MAP: Record<string, string> = {
  cyan: 'from-cyan-500/10 to-transparent',
  emerald: 'from-emerald-500/10 to-transparent',
  amber: 'from-amber-500/10 to-transparent',
  indigo: 'from-indigo-500/10 to-transparent',
  fuchsia: 'from-fuchsia-500/10 to-transparent',
  rose: 'from-rose-500/10 to-transparent',
};

const containerAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export function LaunchpadView({ user }: { user: User | null }) {
  const setPortal = useOsStore(state => state.setPortal);
  const [time, setTime] = useState(new Date());

  // --- LIVE TELEMETRY HOOKS ---
  const stats = useLiveQuery(async () => {
    const [invCount, machinesCount, pendingOrders, usersCount] = await Promise.all([
      db.inventory.count(),
      db.machines.count(),
      db.pmWorkOrders.where('status').equals('PENDING').count(),
      db.users.count()
    ]);
    return { invCount, machinesCount, pendingOrders, usersCount };
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();

  const visibleApps = APPS.filter(app => hasPortalAccess(user, app.id));

  return (
    <div className="flex flex-col h-full w-full relative overflow-y-auto overflow-x-hidden bg-transparent custom-scrollbar">
      <SystemBackground />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-8 flex-1 flex flex-col">
        
        {/* --- SCADA HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/[0.08] pb-6">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">TITANIC <span className="text-white/30 font-light">OS</span></h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-[0.2em] flex items-center gap-3">
              Strategic Command Center <span className="w-1 h-1 rounded-full bg-slate-600" /> Enterprise Edition
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end md:text-right">
            <h2 className="text-3xl font-mono text-slate-200 tracking-wider font-light">{formatTime(time)}</h2>
            <p className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest mt-1 bg-blue-500/10 px-3 py-1 rounded-sm border border-blue-500/20">{formatDate(time)}</p>
          </div>
        </header>

        {/* --- TELEMETRY DASHBOARD --- */}
        <section className="mb-12">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Core Telemetry
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 flex flex-col gap-3 group border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-start">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] text-slate-600 font-mono border border-white/5 px-1.5 py-0.5 rounded">SYS.INV</span>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-light text-slate-100 font-mono">{stats?.invCount ?? '-'}</div>
                <div className="text-[10px] uppercase text-slate-500 tracking-widest mt-1 font-semibold">Active Stock Lines</div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col gap-3 group border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-start">
                <Factory className="w-4 h-4 text-indigo-400" />
                <span className="text-[9px] text-slate-600 font-mono border border-white/5 px-1.5 py-0.5 rounded">SYS.MCH</span>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-light text-slate-100 font-mono">{stats?.machinesCount ?? '-'}</div>
                <div className="text-[10px] uppercase text-slate-500 tracking-widest mt-1 font-semibold">Registered Machines</div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col gap-3 group border-amber-500/20 bg-amber-500/[0.02]">
              <div className="flex justify-between items-start">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] text-amber-500/40 font-mono border border-amber-500/10 px-1.5 py-0.5 rounded">SYS.PM</span>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-light text-amber-400 font-mono">{stats?.pendingOrders ?? '-'}</div>
                <div className="text-[10px] uppercase text-amber-500/60 tracking-widest mt-1 font-semibold">Pending Work Orders</div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col gap-3 group border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-start">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] text-slate-600 font-mono border border-white/5 px-1.5 py-0.5 rounded">SYS.USR</span>
              </div>
              <div className="mt-2">
                <div className="text-3xl font-light text-slate-100 font-mono">{stats?.usersCount ?? '-'}</div>
                <div className="text-[10px] uppercase text-slate-500 tracking-widest mt-1 font-semibold">Authorized Agents</div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* --- SYSTEM NODES (PORTALS) --- */}
        <section className="flex-1 flex flex-col">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" /> Authorized System Nodes
          </h3>
          
          <motion.div 
            variants={containerAnim}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {visibleApps.map((app) => {
              const themeStyle = THEME_MAP[app.theme];
              const borderHover = BORDER_HOVER_MAP[app.theme];
              const shineStyle = SHINE_MAP[app.theme];
              
              return (
                <motion.div key={app.id} variants={itemAnim} className="h-full">
                  <div 
                    onClick={() => setPortal(app.id)}
                    className={cn(
                      "group relative flex flex-col p-6 h-full rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                      "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]",
                      borderHover
                    )}
                  >
                    {/* Inner Shine Effect */}
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none", shineStyle)} />
                    
                    <div className="absolute top-0 right-6 px-2 py-1 bg-black/60 border-x border-b border-white/5 rounded-b-md">
                       <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{app.sysCode}</span>
                    </div>

                    <div className="relative z-10 flex items-start gap-4 mb-6 mt-2">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 duration-500",
                        themeStyle
                      )}>
                         <app.icon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                      <div className="pt-1">
                        <h3 className="text-lg font-semibold text-slate-200 tracking-tight group-hover:text-white transition-colors">{app.title}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{app.desc}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 relative z-10 flex items-center justify-between border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest transition-all group-hover:text-slate-300">
                         <span className="w-4 h-px bg-current opacity-50" /> Initialize Node
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 shadow-[0_0_0_rgba(37,99,235,0)] group-hover:shadow-[0_0_8px_rgba(37,99,235,0.8)] transition-all duration-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

      </div>
    </div>
  );
}
