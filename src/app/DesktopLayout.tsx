import React, { Suspense } from 'react';
import { useOsStore } from './store/useOsStore';
import { LaunchpadView } from './layout/LaunchpadView';
import { GlobalDock } from './layout/GlobalDock';
import type { User } from '@/core/db';
import { Loader2 } from 'lucide-react';

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
  const { activePortal } = useOsStore();

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden font-sans selection:bg-blue-500/30">
      {/* The Unified Global Dock */}
      <GlobalDock user={user} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden relative">
        {activePortal === 'HOME' ? (
          <LaunchpadView user={user} />
        ) : (
          <Suspense fallback={<PortalFallback />}>
            {/* Dynamic Portal Content (Self-contained sidebars) */}
            {activePortal === 'PDR' && <PdrLayout user={user} onLogout={onLogout} />}
            {activePortal === 'ORGANIZATION' && <MasterDataLayout user={user} onLogout={onLogout} />}
            {activePortal === 'FACTORY' && <FactoryLayout user={user} onLogout={onLogout} />}
            {activePortal === 'ANALYTICS' && <AnalyticsLayout user={user} onLogout={onLogout} />}
            {activePortal === 'PREVENTIVE' && <PreventiveLayout user={user} onLogout={onLogout} />}
            {activePortal === 'SETTINGS' && <SystemSettingsLayout user={user} onLogout={onLogout} />}
          </Suspense>
        )}
      </div>
      
      {/* OS Footer */}
      <footer className="h-[28px] bg-black/80 backdrop-blur-3xl border-t border-white/5 flex items-center px-6 text-[10px] text-white/40 gap-6 shrink-0 z-50 relative tracking-widest uppercase font-mono shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>
          SYS.PORTAL: {activePortal}
        </span>
        <span className="opacity-50">LATENCY: 12ms</span>
        <span className="text-white/60 font-semibold">USER: {user ? user.name : 'GUEST'}</span>
        <span className="ml-auto opacity-50">SYNC: SECURE</span>
        <span className="text-white/30 truncate">V17.0.5 - GRAND MASTER EDITION</span>
      </footer>
    </div>
  );
}
