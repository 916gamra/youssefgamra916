import React from 'react';
import { useTabStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package } from 'lucide-react';
import { cn } from '@/shared/utils';
import type { User } from '@/core/db';
import { SettingsView } from '@/features/settings/views/SettingsView';

export function PortalCanvas({ componentMap, user, onLogout }: { componentMap: Record<string, React.FC<any>>, user: User | null, onLogout: () => void }) {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabStore();

  const MERGED_MAP = {
    ...componentMap,
    'settings': SettingsView
  };

  return (
        <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-transparent overflow-hidden">
          {/* Top Bar (Chrome-like Tabs) */}
          <header className="h-[44px] md:h-[50px] bg-black/40 border-b border-white/10 flex items-end px-2 gap-1 shrink-0 w-full overflow-x-auto custom-scrollbar lg:pr-64 pr-20">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex items-center h-[36px] md:h-[42px] px-3 md:px-4 min-w-[120px] max-w-[200px] md:min-w-[160px] md:max-w-[240px] rounded-t-lg cursor-pointer transition-all select-none border border-b-0 text-[11px] md:text-xs gap-2 shrink-0",
                  tab.isActive 
                    ? "bg-white/[0.08] text-white border-white/20 z-10 shadow-[0_4px_14px_0_rgba(255,255,255,0.05)]" 
                    : "bg-white/[0.02] text-white/50 border-white/5 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <span className="truncate flex-1">{tab.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className={cn(
                    "ml-1 p-1 rounded-md opacity-40 hover:opacity-100 transition-all text-[10px]",
                  )}
                >
                  <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
            ))}
          </header>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col w-full">
            <AnimatePresence mode="wait">
              {activeTabId && tabs.find(t => t.id === activeTabId) && (() => {
                const tab = tabs.find(t => t.id === activeTabId)!;
                const Component = MERGED_MAP[tab.component] || (() => <div className="p-6 text-[var(--text-dim)]">Component '{tab.component}' Not Found in Portal</div>);
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col overflow-x-hidden overflow-y-auto custom-scrollbar w-full"
                  >
                    <div className="flex flex-col px-4 py-6 md:p-8">
                      <Component tabId={tab.id} onLogout={onLogout} user={user} />
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
            
            {tabs.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-dim)] px-6 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 shadow-2xl">
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-white/20" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-white/50 tracking-widest uppercase mb-2">No Active Module</h2>
                <p className="text-xs md:text-sm max-w-sm">Select operations from the sidebar to begin.</p>
              </div>
            )}
          </div>
        </main>
  );
}
