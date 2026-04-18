import React from 'react';
import { motion } from 'motion/react';
import { Box, Wrench, ShieldCheck, PieChart, Network, LayoutGrid, Settings, Factory } from 'lucide-react';
import { useOsStore, PortalType } from '../store/useOsStore';
import type { User } from '@/core/db';

const colorStyles = {
  cyan: {
    border: 'hover:border-cyan-500/50',
    icon: 'text-cyan-400',
    title: 'group-hover:text-cyan-300',
    iconBorder: 'group-hover:border-cyan-500/30'
  },
  emerald: {
    border: 'hover:border-emerald-500/50',
    icon: 'text-emerald-400',
    title: 'group-hover:text-emerald-300',
    iconBorder: 'group-hover:border-emerald-500/30'
  },
  fuchsia: {
    border: 'hover:border-fuchsia-500/50',
    icon: 'text-fuchsia-400',
    title: 'group-hover:text-fuchsia-300',
    iconBorder: 'group-hover:border-fuchsia-500/30'
  },
  amber: {
    border: 'hover:border-amber-500/50',
    icon: 'text-amber-400',
    title: 'group-hover:text-amber-300',
    iconBorder: 'group-hover:border-amber-500/30'
  },
  rose: {
    border: 'hover:border-rose-500/50',
    icon: 'text-rose-400',
    title: 'group-hover:text-rose-300',
    iconBorder: 'group-hover:border-rose-500/30'
  },
  indigo: {
    border: 'hover:border-indigo-500/50',
    icon: 'text-indigo-400',
    title: 'group-hover:text-indigo-300',
    iconBorder: 'group-hover:border-indigo-500/30'
  }
};

const APPS = [
  {
    id: 'PDR' as PortalType,
    title: 'PDR Engine',
    desc: 'Gestion des Pièces & Requisitions',
    icon: Box,
    color: 'cyan' as const,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    glow: 'bg-cyan-500/10'
  },
  {
    id: 'PREVENTIVE' as PortalType,
    title: 'Preventive Maintenance',
    desc: 'Planification & Inspections',
    icon: ShieldCheck,
    color: 'emerald' as const,
    gradient: 'from-emerald-500/20 to-green-500/20',
    glow: 'bg-emerald-500/10'
  },
  {
    id: 'ORGANIZATION' as PortalType,
    title: 'Part Catalog',
    desc: 'Families, Templates & Blueprints',
    icon: Network,
    color: 'amber' as const,
    gradient: 'from-amber-500/20 to-orange-500/20',
    glow: 'bg-amber-500/10'
  },
  {
    id: 'FACTORY' as PortalType,
    title: 'Factory Admin',
    desc: 'Sectors, Personnel & Machines',
    icon: Factory,
    color: 'indigo' as const,
    gradient: 'from-indigo-500/20 to-blue-500/20',
    glow: 'bg-indigo-500/10'
  },
  {
    id: 'ANALYTICS' as PortalType,
    title: 'The Oracle',
    desc: 'Analytics & Executive Dashboards',
    icon: PieChart,
    color: 'fuchsia' as const,
    gradient: 'from-fuchsia-500/20 to-purple-500/20',
    glow: 'bg-fuchsia-500/10'
  },
  {
    id: 'SETTINGS' as PortalType,
    title: 'System Config',
    desc: 'RBAC, Users & Portal Access',
    icon: Settings,
    color: 'rose' as const,
    gradient: 'from-rose-500/20 to-red-500/20',
    glow: 'bg-rose-500/10'
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

export function LaunchpadView({ user }: { user: User | null }) {
  const setPortal = useOsStore(state => state.setPortal);

  // Fallback default permissions based on role if allowedPortals isn't set
  let visibleApps = APPS;
  if (user) {
    if (user.isPrimary) {
      // Founders/Primary users always see everything regardless of locally saved schema limits
      visibleApps = APPS;
    } else if (user.role === 'Admin' || user.role === 'Manager' || user.role === 'Super Administrator') {
      const userPortals = (user as any).allowedPortals || ['PDR', 'PREVENTIVE', 'ORGANIZATION', 'FACTORY', 'ANALYTICS', 'SETTINGS'];
      visibleApps = APPS.filter(app => userPortals.includes(app.id));
    } else {
      const userPortals = (user as any).allowedPortals || ['PDR', 'PREVENTIVE'];
      visibleApps = APPS.filter(app => userPortals.includes(app.id));
    }
  }

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center relative overflow-hidden bg-[#050508]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[500px] bg-blue-500/10 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[600px] bg-emerald-500/5 rounded-full blur-[180px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] backdrop-blur-2xl">
              <LayoutGrid className="w-10 h-10 text-[var(--text-bright)]" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-sm">
              TITANIC OS
            </h1>
            <p className="text-sm text-[var(--text-dim)] uppercase tracking-[0.3em] font-medium flex items-center justify-center gap-4">
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
              Strategic Command Center
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center gap-5 lg:gap-8"
        >
          {visibleApps.map((app) => {
            const styles = colorStyles[app.color];
            return (
              <motion.div key={app.id} variants={item} className="h-full w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-22px)] max-w-sm">
                <div 
                  onClick={() => setPortal(app.id)}
                  className={`h-full group relative overflow-hidden p-8 rounded-[2rem] glass-panel ${styles.border} cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 flex flex-col items-center text-center`}
                >
                  <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] ${app.glow} group-hover:blur-[50px] group-hover:scale-150 transition-all duration-700 opacity-50 group-hover:opacity-100`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500`} />
                  
                  <div className={`relative z-10 w-20 h-20 rounded-[1.5rem] mb-8 flex items-center justify-center glass-panel-heavy ${styles.iconBorder} transition-all duration-500 group-hover:scale-110 shadow-2xl`}>
                     {React.createElement(app.icon, { className: `w-9 h-9 ${styles.icon} drop-shadow-[0_0_15px_currentColor] transition-transform duration-500` })}
                  </div>
                  
                  <h3 className={`relative z-10 text-2xl font-bold text-white mb-2 tracking-tight ${styles.title} transition-colors`}>
                    {app.title}
                  </h3>
                  
                  <p className="relative z-10 text-sm text-[var(--text-dim)] font-medium leading-relaxed group-hover:text-white/70 transition-colors px-2">
                    {app.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
