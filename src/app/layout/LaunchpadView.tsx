import React from 'react';
import { motion } from 'motion/react';
import { Box, ShieldCheck, PieChart, Network, Settings, Factory } from 'lucide-react';
import { useOsStore, PortalType } from '../store/useOsStore';
import type { User } from '@/core/db';
import { hasPortalAccess } from '@/core/permissions';

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
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Filter apps based on security permissions
  const visibleApps = APPS.filter(app => hasPortalAccess(user, app.id));

  return (
    <div className="flex flex-col h-full w-full items-center relative overflow-y-auto overflow-x-hidden bg-[#050508] custom-scrollbar pb-16">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[500px] bg-blue-500/10 rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[600px] bg-emerald-500/5 rounded-full blur-[180px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      {/* Clock & Date Header (Consistency with Login) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center pointer-events-none pt-8 md:pt-12 mb-6 md:mb-10 relative z-20 shrink-0"
      >
        <h2 className="text-4xl md:text-5xl font-light text-white tracking-widest leading-none mb-1 opacity-90">{formatTime(time)}</h2>
        <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-[0.4em] font-bold">{formatDate(time)}</p>
      </motion.div>

      <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 flex-1 flex flex-col items-center">
        <div className="text-center mb-10 md:mb-16 shrink-0">
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-4 md:mb-6 drop-shadow-sm">
              TITANIC OS
            </h1>
            <p className="text-xs md:text-sm text-[var(--text-dim)] uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium flex items-center justify-center gap-2 md:gap-4">
              <span className="hidden leading-none md:block w-8 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
              Strategic Command Center
              <span className="hidden leading-none md:block w-8 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
            </p>
          </motion.div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mx-auto"
        >
          {visibleApps.map((app) => {
            const styles = colorStyles[app.color];
            return (
              <motion.div key={app.id} variants={item} className="h-full w-full flex">
                <div 
                  onClick={() => setPortal(app.id)}
                  className={`flex-1 group relative overflow-hidden flex flex-col items-center text-center p-6 md:p-8 rounded-[2rem] glass-panel ${styles.border} cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 lg:hover:-translate-y-3`}
                >
                  <div className={`absolute -top-24 -right-24 md:-top-32 md:-right-32 w-48 h-48 md:w-64 md:h-64 rounded-full blur-[60px] md:blur-[80px] ${app.glow} group-hover:blur-[40px] group-hover:scale-[1.3] transition-all duration-700 opacity-40 group-hover:opacity-100 pointer-events-none`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none`} />
                  
                  <div className={`relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.5rem] mb-6 md:mb-8 flex items-center justify-center glass-panel-heavy ${styles.iconBorder} transition-all duration-500 group-hover:scale-110 shadow-xl md:shadow-2xl`}>
                     {React.createElement(app.icon, { className: `w-7 h-7 md:w-9 md:h-9 ${styles.icon}  md: transition-transform duration-500` })}
                  </div>
                  
                  <h3 className={`relative z-10 text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 tracking-tight ${styles.title} transition-colors leading-tight`}>
                    {app.title}
                  </h3>
                  
                  <p className="relative z-10 text-xs md:text-sm text-[var(--text-dim)] font-medium leading-relaxed group-hover:text-white/80 transition-colors px-2">
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
