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
import { useNotificationsContext } from '@/shared/context/NotificationContext';

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
  cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 shadow-[inner_0_0_15px_rgba(34,211,238,0.1)]',
  emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[inner_0_0_15px_rgba(16,185,129,0.1)]',
  amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[inner_0_0_15px_rgba(245,158,11,0.1)]',
  indigo: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 shadow-[inner_0_0_15px_rgba(99,102,241,0.1)]',
  fuchsia: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10 shadow-[inner_0_0_15px_rgba(217,70,239,0.1)]',
  rose: 'text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[inner_0_0_15px_rgba(244,63,94,0.1)]',
};

const THEME_BG_MAP: Record<string, string> = {
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  fuchsia: 'bg-fuchsia-500',
  rose: 'bg-rose-500',
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
  const { getUnreadCountByPortal } = useNotificationsContext();
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
        
        {/* --- OS HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                <div className="w-1.5 h-4 bg-emerald-500 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white flex items-center gap-3">
                TITANIC <span className="text-white/20 font-light border-l border-white/10 pl-3 ml-1">OS</span>
              </h1>
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-3 text-mono uppercase tracking-widest text-[10px]">
               <span className="w-2 h-2 rounded-full border border-white/30 flex items-center justify-center"><span className="w-1 h-1 bg-white/50 rounded-full" /></span>
               SECURE WORKSPACE INITIALIZED
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end md:text-right">
            <h2 className="text-3xl text-slate-200 tracking-tight font-medium">{formatTime(time)}</h2>
            <p className="text-sm text-slate-400 mt-1">{formatDate(time)}</p>
          </div>
        </header>

        {/* --- TELEMETRY DASHBOARD --- */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-6 flex flex-col gap-3 group">
               <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2">
                 <Database className="w-5 h-5 text-cyan-400" />
               </div>
               <div>
                 <div className="text-3xl font-semibold text-slate-100">{stats?.invCount ?? '-'}</div>
                 <div className="text-sm text-slate-500 mt-1 font-medium">Inventory Items</div>
               </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col gap-3 group">
               <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
                 <Factory className="w-5 h-5 text-indigo-400" />
               </div>
               <div>
                 <div className="text-3xl font-semibold text-slate-100">{stats?.machinesCount ?? '-'}</div>
                 <div className="text-sm text-slate-500 mt-1 font-medium">Machines</div>
               </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col gap-3 group">
               <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                 <AlertTriangle className="w-5 h-5 text-amber-400" />
               </div>
               <div>
                 <div className="text-3xl font-semibold text-amber-400">{stats?.pendingOrders ?? '-'}</div>
                 <div className="text-sm text-amber-500/80 mt-1 font-medium">Pending Tasks</div>
               </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col gap-3 group">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                 <Users className="w-5 h-5 text-emerald-400" />
               </div>
               <div>
                 <div className="text-3xl font-semibold text-slate-100">{stats?.usersCount ?? '-'}</div>
                 <div className="text-sm text-slate-500 mt-1 font-medium">Active Users</div>
               </div>
            </GlassCard>
          </div>
        </section>

        {/* --- SYSTEM NODES (PORTALS) --- */}
        <section className="flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-400 mb-6">Applications</h3>
          
          <motion.div 
            variants={containerAnim}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {visibleApps.map((app) => {
              const themeStyle = THEME_MAP[app.theme];
              const themeBg = THEME_BG_MAP[app.theme];
              
              return (
                <motion.div key={app.id} variants={itemAnim} className="h-full">
                  <GlassCard 
                    onClick={() => setPortal(app.id)}
                    className={cn(
                      "group flex flex-col p-0 h-[220px] !bg-black/20 border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer"
                    )}
                  >
                    {/* Big blur background */}
                    <div className={cn("absolute -top-12 -right-12 w-40 h-40 blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none", themeBg)} />

                    <div className="p-6 relative z-10 flex-1 flex flex-col">
                       <div className="flex justify-between items-start mb-auto relative">
                           <div className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-105 duration-500 shadow-lg",
                             themeStyle
                           )}>
                             <app.icon className="w-7 h-7 stroke-[1.5]" />
                           </div>
                           {getUnreadCountByPortal(app.id) > 0 && (
                               <span className={cn(
                                   "absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg border border-black/50 animate-bounce",
                                   themeBg
                               )}>
                                   {getUnreadCountByPortal(app.id)}
                               </span>
                           )}
                           <span className="text-[10px] font-bold text-slate-400 bg-white/5 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 transition-colors">{app.sysCode}</span>
                       </div>

                       <div>
                           <h3 className="text-xl font-bold text-slate-200 tracking-tight mb-1 group-hover:text-white transition-colors drop-shadow-md">{app.title}</h3>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed">{app.desc}</p>
                       </div>
                    </div>
                    
                    <div className="h-[3px] w-full bg-white/5 group-hover:bg-white/10 transition-colors">
                       <div className={cn("h-full w-0 group-hover:w-full transition-all duration-700 ease-in-out", themeBg)} />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

      </div>
    </div>
  );
}
