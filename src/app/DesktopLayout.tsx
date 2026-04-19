import React, { Suspense, useState, useEffect } from 'react';
import { useOsStore } from './store/useOsStore';
import { LaunchpadView } from './layout/LaunchpadView';
import { GlobalDock } from './layout/GlobalDock';
import type { User } from '@/core/db';
import { Loader2, Timer } from 'lucide-react';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { hasPortalAccess } from '@/core/permissions';

// Lazy loading the micro-frontends
const PdrLayout = React.lazy(() => import('@/features/pdr-engine/layout/PdrLayout').then(m => ({ default: m.PdrLayout })));
const MasterDataLayout = React.lazy(() => import('@/features/organization/layout/MasterDataLayout').then(m => ({ default: m.MasterDataLayout })));
const AnalyticsLayout = React.lazy(() => import('@/features/analytics/layout/AnalyticsLayout').then(m => ({ default: m.AnalyticsLayout })));
const PreventiveLayout = React.lazy(() => import('@/features/preventive/layout/PreventiveLayout').then(m => ({ default: m.PreventiveLayout })));
const SystemSettingsLayout = React.lazy(() => import('@/features/system/layout/SystemSettingsLayout').then(m => ({ default: m.SystemSettingsLayout })));
const FactoryLayout = React.lazy(() => import('@/features/factory/layout/FactoryLayout').then(m => ({ default: m.FactoryLayout })));

// Loading Fallback
function PortalFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0f] text-[var(--text-dim)]">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mb-4" />
      <div className="text-sm font-medium tracking-widest uppercase">Initializing Module...</div>
    </div>
  );
}

export function DesktopLayout({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const { activePortal, setPortal } = useOsStore();
  const [sessionTime, setSessionTime] = useState(0);

  // Security Guard: Prevent unauthorized portal access
  useEffect(() => {
    if (activePortal !== 'HOME' && !hasPortalAccess(user, activePortal)) {
      console.warn(`SECURITY: Unauthorized access attempt to portal [${activePortal}] by user [${user?.name}]`);
      setPortal('HOME');
    }
  }, [activePortal, user, setPortal]);

  // Track session duration
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden font-sans selection:bg-blue-500/30 relative">
      {/* The Unified Global Dock */}
      {activePortal === 'HOME' ? (
        <GlobalDock user={user} onLogout={onLogout} />
      ) : null}

      <div className="flex flex-1 overflow-hidden relative">
        <ErrorBoundary>
          {activePortal === 'HOME' ? (
            <LaunchpadView user={user} />
          ) : (
            <Suspense fallback={<PortalFallback />}>
              <div className="flex flex-col w-full h-full relative">
                 {/* Portal Header with Dock Integration */}
                 <GlobalDock user={user} onLogout={onLogout} />
                 
                 {/* Dynamic Portal Content (Self-contained sidebars) */}
                 <div className="flex flex-1 overflow-hidden">
                   {activePortal === 'PDR' && <PdrLayout user={user} onLogout={onLogout} />}
                   {activePortal === 'ORGANIZATION' && <MasterDataLayout user={user} onLogout={onLogout} />}
                   {activePortal === 'FACTORY' && <FactoryLayout user={user} onLogout={onLogout} />}
                   {activePortal === 'ANALYTICS' && <AnalyticsLayout user={user} onLogout={onLogout} />}
                   {activePortal === 'PREVENTIVE' && <PreventiveLayout user={user} onLogout={onLogout} />}
                   {activePortal === 'SETTINGS' && <SystemSettingsLayout user={user} onLogout={onLogout} />}
                 </div>
              </div>
            </Suspense>
          )}
        </ErrorBoundary>
      </div>
      
      {/* OS Footer */}
      <footer className="h-[28px] bg-black/80 backdrop-blur-3xl border-t border-white/5 flex items-center px-4 md:px-6 text-[9px] md:text-[10px] text-white/40 gap-4 md:gap-6 shrink-0 z-50 relative tracking-widest uppercase font-mono shadow-[0_-5px_20px_rgba(0,0,0,0.5)] overflow-x-auto whitespace-nowrap custom-scrollbar">
        <span className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
          <span className="hidden sm:inline">SYS.PORTAL: </span>{activePortal}
        </span>
        <span className="flex items-center gap-2 opacity-80 shrink-0">
          <Timer className="w-3 h-3" />
          <span className="hidden sm:inline">SESSION: </span>{formatSessionTime(sessionTime)}
        </span>
        <span className="text-white/60 font-semibold shrink-0">USER: {user ? user.name : 'GUEST'}</span>
        <span className="ml-auto opacity-50 shrink-0 hidden md:inline">SYNC: SECURE</span>
        <span className="text-white/30 truncate shrink-0 ml-auto md:ml-0">V17.0.5 <span className="hidden lg:inline">- GRAND MASTER EDITION</span></span>
      </footer>
    </div>
  );
}
