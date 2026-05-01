import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Bell, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useNotificationsContext, Notification } from '@/shared/context/NotificationContext';
import { cn } from '@/shared/utils';

export const NotificationHub = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotificationsContext();

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
        case 'critical': return 'border-l-rose-500';
        case 'warning': return 'border-l-amber-500';
        default: return 'border-l-cyan-500';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-black/80 backdrop-blur-3xl border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Bell className="w-5 h-5" /> Activity Center
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={markAllAsRead} className="text-xs text-slate-400 hover:text-white transition-colors">Mark All Read</button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400"><X className="w-5 h-5"/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center text-slate-500 pt-20">No active notifications.</div>
              ) : (
                notifications.map(n => (
                  <motion.div 
                    key={n.id}
                    layout
                    className={cn(
                        "p-4 rounded-xl bg-white/[0.03] border border-white/5 border-l-4 flex gap-4 transition-all hover:bg-white/[0.06]",
                        getBorderColor(n.type),
                        n.isRead && "opacity-60"
                    )}
                  >
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white">{n.title}</span>
                        <div className="flex gap-2">
                            {!n.isRead && <button onClick={() => markAsRead(n.id)} className="text-slate-500 hover:text-white"><Check className="w-4 h-4"/></button>}
                            <button onClick={() => removeNotification(n.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">{n.message}</p>
                      <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500">{n.source}</span>
                          {n.action && (
                              <button onClick={n.action.onClick} className="text-xs font-bold text-cyan-400 hover:underline">{n.action.label}</button>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
