import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShieldCheck, UserCog, AlertCircle, Save, X, Lock, Fingerprint, Info, CheckCircle2, User as UserIcon, KeyRound } from 'lucide-react';
import { db } from '@/core/db';
import type { User } from '@/core/db';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { measureOperation } from '@/core/logger';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/app/store/useAuthStore';
import { isUserAdmin } from '@/core/permissions';
import { useAuthSlots } from '@/features/auth/hooks/useAuthSlots';

const AVAILABLE_PORTALS = [
  { id: 'PDR', name: 'PDR Engine', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500' },
  { id: 'PREVENTIVE', name: 'Maintenance', color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  { id: 'ORGANIZATION', name: 'Part Catalog', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500' },
  { id: 'FACTORY', name: 'Factory Admin', color: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500' },
  { id: 'ANALYTICS', name: 'Analytics Hub', color: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500' },
  { id: 'SETTINGS', name: 'System Config', color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export function UserManagementView() {
  const { currentUser } = useAuthStore();
  const allSlots = useAuthSlots();
  const { showSuccess, showError } = useNotifications();

  // Edit slot form state
  const [editingSlot, setEditingSlot] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const [editBadgeId, setEditBadgeId] = useState('');

  // SECURITY GUARD: Absolute gate for non-admins
  if (!isUserAdmin(currentUser)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black/40 rounded-[2rem] border border-rose-500/10 md:min-h-[500px] relative overflow-hidden backdrop-blur-xl">
         <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 shadow-inner">
            <Lock className="w-8 h-8 text-rose-500" />
         </div>
         <h1 className="text-3xl font-semibold text-rose-500 tracking-tight mb-2 relative z-10" >Access Restrictions Applied</h1>
         <p className="max-w-md text-slate-400 text-sm leading-relaxed relative z-10">
            Your current authorization level prevents viewing or modifying identity configurations. Administrative privileges are mandatory.
         </p>
      </div>
    );
  }

  const openEditModal = (slot: User) => {
    setEditingSlot(slot);
    setEditName(slot.name);
    setEditColor(slot.color);
    setEditPin(''); // leave blank unless changing
    setEditIsActive(slot.isActive || false);
    setEditBadgeId(slot.realBadgeId || '');
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !currentUser) return;

    try {
      const updates: any = {
        id: editingSlot.id, // Ensure ID is saved correctly in userOverrides
        name: editName,
        color: editColor,
        isActive: editIsActive
      };

      if (editingSlot.id.startsWith('TC')) {
        updates.realBadgeId = editBadgeId;
      }
      
      if (editPin.trim() !== '') {
        const { hashPin } = await import('@/core/security');
        updates.pin = await hashPin(editPin);
      }

      await measureOperation('UpdateUserOverride', async () => {
        const existing = await db.userOverrides.get(editingSlot.id);
        if (existing) {
          await db.userOverrides.update(editingSlot.id, updates);
        } else {
          await db.userOverrides.put(updates);
        }
      });

      showSuccess('Profile Synchronized', `Slot ${editingSlot.id} configured successfully.`);
      setEditingSlot(null);
    } catch (err: any) {
      showError('Sync Failure', err.message);
    }
  };

  const renderSlotGroup = (title: string, prefix: string) => {
    const slots = allSlots.filter((s: User) => s.id.startsWith(prefix));

    return (
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
          {prefix === 'SY' && <ShieldCheck className="w-5 h-5 text-red-500" />}
          {prefix === 'OP' && <UserCog className="w-5 h-5 text-indigo-500" />}
          {prefix === 'TC' && <UserIcon className="w-5 h-5 text-emerald-500" />}
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slots.map(slot => (
            <GlassCard key={slot.id} className={cn("!p-6 relative group overflow-hidden border-t-2", !slot.isActive && "opacity-50 grayscale", prefix === 'SY' && "border-t-red-500/50", prefix === 'OP' && "border-t-indigo-500/50", prefix === 'TC' && "border-t-emerald-500/50")}>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => openEditModal(slot)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-300"
                >
                  <UserCog className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0", slot.color)}>
                  {slot.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{slot.name}</h3>
                    {slot.isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-slate-400 font-mono">{slot.id}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>{slot.role}</span>
                </div>
                {slot.realBadgeId && (
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-slate-500" />
                    <span className="font-mono">Badge: {slot.realBadgeId}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mt-4 border-t border-white/5 pt-4">
                {slot.allowedPortals?.slice(0, 3).map(portalId => {
                  const p = AVAILABLE_PORTALS.find(x => x.id === portalId);
                  if (!p) return null;
                  return (
                    <span key={portalId} className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/5", p.color)}>
                      {p.name.split(' ')[0]}
                    </span>
                  );
                })}
                {slot.allowedPortals && slot.allowedPortals.length > 3 && (
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    +{slot.allowedPortals.length - 3}
                  </span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full flex flex-col pt-4 min-h-0 h-full relative z-10"
    >
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100 tracking-tight mb-2 flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-indigo-500" /> Identity Slot Configuration
          </h1>
          <p className="text-slate-400 text-lg">Manage stationary access slots and authentication overrides.</p>
        </div>
      </header>
      
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar lg:px-8 pb-12">
        {renderSlotGroup("System Administration", "SY")}
        {renderSlotGroup("Global Operational Management", "OP")}
        {renderSlotGroup("Technical Execution", "TC")}
      </div>

      <AnimatePresence>
        {editingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setEditingSlot(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl"
            >
              <GlassCard className="!p-8 overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <UserCog className="w-8 h-8 text-cyan-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Configure Slot</h2>
                      <p className="text-cyan-400 font-mono text-sm">{editingSlot.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingSlot(null)} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateSlot} className="space-y-6">
                  
                  {editingSlot.id !== 'SY-ADMIN' && (
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex-1">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest block mb-1">Slot Status</label>
                        <p className="text-xs text-slate-500">Enable or disable this slot.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={editIsActive} onChange={(e) => setEditIsActive(e.target.checked)} />
                        <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Override PIN Code</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value)}
                          placeholder="•••• (Leave blank to keep current)"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors pl-10"
                        />
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {editingSlot.id.startsWith('TC') && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Factory Badge ID</label>
                      <input 
                        type="text" 
                        value={editBadgeId}
                        onChange={(e) => setEditBadgeId(e.target.value)}
                        placeholder="e.g., PHY-BADGE-091"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  )}

                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Avatar Identity Color</label>
                     <div className="flex gap-3">
                        {['bg-cyan-500', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'].map(color => (
                        <button
                           key={color} type="button"
                           onClick={() => setEditColor(color)}
                           className={cn('w-8 h-8 rounded-full transition-transform', color, editColor === color ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100')}
                        />
                        ))}
                     </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                    <button type="button" onClick={() => setEditingSlot(null)} className="titan-button bg-white/5 hover:bg-white/10 text-white flex-1 flex justify-center items-center gap-2">
                       Cancel
                    </button>
                    <button type="submit" className="titan-button bg-cyan-600 hover:bg-cyan-500 text-white flex-1 flex justify-center items-center gap-2">
                       <Save className="w-5 h-5" /> Save Configuration
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
