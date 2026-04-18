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
        <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#0a0a0f]">
          {/* Top Bar (Chrome-like Tabs) */}
          <header className="h-[44px] bg-black/40 border-b border-[var(--glass-border)] flex items-end px-2 gap-1 shrink-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex items-center h-[36px] px-4 min-w-[160px] max-w-[240px] rounded-t-lg cursor-pointer transition-all select-none border border-b-0 text-xs gap-2",
                  tab.isActive 
                    ? "bg-[var(--glass-bg)] text-[var(--text-bright)] border-[var(--glass-border)] border-t-2 border-t-[var(--accent)] z-10" 
                    : "bg-white/[0.03] text-[var(--text-dim)] border-[var(--glass-border)] hover:bg-white/5"
                )}
              >
                <span className="truncate flex-1">{tab.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className={cn(
                    "ml-2 p-1 rounded-md opacity-40 hover:opacity-100 transition-all text-[10px]",
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </header>

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
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
                    className="absolute inset-0 overflow-y-auto p-6"
                  >
                    <Component tabId={tab.id} onLogout={onLogout} user={user} />
                  </motion.div>
                );
              })()}
            </AnimatePresence>
            
            {tabs.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-dim)] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0a0f] to-[#0a0a0f]">
                <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 mb-6 shadow-2xl">
                    <Package className="w-12 h-12 text-white/20" />
                </div>
                <h2 className="text-xl font-semibold text-white/50 tracking-widest uppercase mb-2">No Active Module</h2>
                <p className="text-sm">Select operations from the sidebar to begin.</p>
              </div>
            )}
          </div>
        </main>
  );
}
