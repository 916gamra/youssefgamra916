import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOsStore } from '../store/useOsStore';
import { useTabStore } from '../store';
import { Home, Settings, LogOut, User as UserIcon, Bell } from 'lucide-react';
import type { User } from '@/core/db';
import { cn } from '@/shared/utils';
import { hasPortalAccess } from '@/core/permissions';
import { useNotificationsContext } from '@/shared/context/NotificationContext';

export function GlobalDock({ user, onLogout, onOpenNotifications }: { user: User | null, onLogout: () => void, onOpenNotifications: () => void }) {
  const { activePortal, setPortal } = useOsStore();
  const { clearTabs } = useTabStore();
  const { unreadCount, getUnreadCountByPortal } = useNotificationsContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or Click Outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Return to launchpad action
  const handleGoHome = () => {
    setPortal('HOME');
    clearTabs();
  };

  const handleOpenSettings = () => {
    setPortal('SETTINGS');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  return (
    <div ref={menuRef} className="absolute top-[2px] right-2 md:top-[4px] md:right-4 z-[9999] flex flex-col items-end gap-2">
      {/* The Dock Core Action Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-center gap-2 p-1 md:p-1.5 rounded-[1.25rem] glass-panel-heavy"
      >
        {activePortal !== 'HOME' && (
          <button 
            onClick={handleGoHome}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider h-[32px] md:h-[36px]"
            title="Return to Workspace"
          >
            <Home className="w-4 h-4 md:w-4 md:h-4" />
            <span className="max-w-0 overflow-hidden sm:max-w-[120px] transition-all duration-300 whitespace-nowrap">Workspace</span>
          </button>
        )}

        {/* Separator if not home */}
        {activePortal !== 'HOME' && <div className="w-px h-5 bg-white/10 mx-1 md:mx-2" />}

        {/* Notification Bell */}
        <button 
          onClick={onOpenNotifications}
          className="relative p-2 md:p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.8)] animate-pulse" />
          )}
        </button>

        {/* User Bubble */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            "relative w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-xl flex items-center justify-center text-xs md:text-sm font-bold shadow-lg ring-2 ring-transparent transition-all duration-300", 
            user?.color ? user.color : 'bg-gray-700',
            isMenuOpen ? 'ring-white/50 scale-95' : 'hover:ring-white/20 hover:scale-105'
          )}
          title={user?.name}
        >
          {user?.initials || <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />}
          {user?.isPrimary && (
            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 bg-amber-400 rounded-full border-2 border-[#121216]"></div>
          )}
        </button>
      </motion.div>

      {/* Floating Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-64 glass-panel-heavy rounded-2xl p-2 flex flex-col mt-1 origin-top-right shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 mb-2 bg-white/5 rounded-xl">
              <h3 className="text-white font-bold text-sm truncate">{user?.name || 'Guest'}</h3>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mt-1">{user?.role || 'No Role'}</p>
            </div>
            
            {hasPortalAccess(user, 'SETTINGS') && (
              <button 
                onClick={handleOpenSettings}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <Settings className="w-4 h-4" />
                System Config
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 mt-1 text-left text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Secure Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
