import React, { Suspense, useState, useEffect } from 'react';
import { useOsStore } from './store/useOsStore';
import { LaunchpadView } from './layout/LaunchpadView';
import { GlobalDock } from './layout/GlobalDock';
import type { User } from '@/core/db';
import { Loader2, Timer } from 'lucide-react';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { hasPortalAccess } from '@/core/permissions';
import { Skeleton } from '@/shared/components/Skeleton';
import { SystemBackground } from '@/shared/components/SystemBackground';

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
    <div className="flex-1 flex w-full h-full p-6 bg-transparent gap-6">
      {/* Sidebar Skeleton */}
      <div className="w-[100px] hidden lg:flex flex-col gap-6 items-center py-6 bg-black/20 border border-white/5 rounded-3xl backdrop-blur-md">
        <Skeleton className="w-16 h-16 rounded-[1.25rem] bg-white/10" />
        <div className="w-full flex flex-col gap-4 px-4 mt-6">
          <Skeleton className="w-full h-14 rounded-[1.25rem]" />
          <Skeleton className="w-full h-14 rounded-[1.25rem]" />
          <Skeleton className="w-full h-14 rounded-[1.25rem]" />
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center bg-black/20 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex gap-4 items-center">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                </div>
            </div>
            <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
        </div>

        {/* Dashboard Area Skeleton */}
        <div className="flex-1 flex gap-6">
          <div className="flex-1 flex flex-col gap-6">
              <Skeleton className="h-[200px] w-full rounded-3xl bg-black/20 border border-white/5 backdrop-blur-md" />
              <div className="grid grid-cols-2 gap-6 flex-1">
                 <Skeleton className="w-full h-full rounded-3xl bg-black/20 border border-white/5 backdrop-blur-md" />
                 <Skeleton className="w-full h-full rounded-3xl bg-black/20 border border-white/5 backdrop-blur-md" />
              </div>
          </div>
          <Skeleton className="w-[350px] h-full rounded-3xl bg-black/20 border border-white/5 backdrop-blur-md hidden xl:block" />
        </div>
      </div>
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
      <SystemBackground />
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
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
          <span className="hidden sm:inline">MODULE: </span>{activePortal}
        </span>
        <span className="flex items-center gap-2 opacity-80 shrink-0">
          <Timer className="w-3 h-3" />
          <span className="hidden sm:inline">SESSION: </span>{formatSessionTime(sessionTime)}
        </span>
        <span className="text-white/60 font-semibold shrink-0">USER: {user ? user.name : 'GUEST'}</span>
        <span className="ml-auto opacity-50 shrink-0 hidden md:inline">SYNC: SECURE</span>
        <span className="text-white/30 truncate shrink-0 ml-auto md:ml-0">V17.0.5 <span className="hidden lg:inline">- ENTERPRISE EDITION</span></span>
      </footer>
    </div>
  );
}
