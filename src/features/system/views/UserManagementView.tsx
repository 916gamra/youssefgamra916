import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShieldCheck, UserCog, Plus, KeyRound, AlertCircle, Save, X, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import type { User } from '@/core/db';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { measureOperation, logger } from '@/core/logger';
import { userSchema } from '@/core/schemas';
import { cn } from '@/shared/utils';

const AVAILABLE_PORTALS = [
  { id: 'PDR', name: 'PDR Engine', color: 'text-cyan-400' },
  { id: 'PREVENTIVE', name: 'Shield Ops', color: 'text-emerald-400' },
  { id: 'ORGANIZATION', name: 'Part Catalog', color: 'text-amber-400' },
  { id: 'FACTORY', name: 'Factory Admin', color: 'text-indigo-400' },
  { id: 'ANALYTICS', name: 'The Oracle', color: 'text-fuchsia-400' },
  { id: 'SETTINGS', name: 'System Config', color: 'text-rose-400' }
];

const DEFAULT_PORTALS_ADMIN = ['PDR', 'PREVENTIVE', 'ORGANIZATION', 'FACTORY', 'ANALYTICS', 'SETTINGS'];
const DEFAULT_PORTALS_TECH = ['PDR', 'PREVENTIVE'];

export function UserManagementView() {
  const users = useLiveQuery(() => db.users.toArray());
  const { showSuccess, showError, showWarning } = useNotifications();

  // New user form state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Technician');
  const [newColor, setNewColor] = useState('bg-cyan-500');
  const [newPin, setNewPin] = useState('');
  
  const [allowedPortals, setAllowedPortals] = useState<string[]>(DEFAULT_PORTALS_TECH);

  const togglePortal = (portalId: string) => {
    setAllowedPortals(prev => 
      prev.includes(portalId) ? prev.filter(p => p !== portalId) : [...prev, portalId]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPin) return;

    logger.info({ newName, newRole }, 'Attempting to register new user');

    try {
      // 1. Zod Validation
      const validatedData = userSchema.parse({
        name: newName,
        pin: newPin,
        role: newRole,
        color: newColor,
        allowedPortals
      });

      // 2. Perform DB operation inside Performance Monitor
      await measureOperation('RegisterUser', async () => {
        const { hashPin } = await import('@/core/security');
        const hashedPin = await hashPin(validatedData.pin);
        const initials = validatedData.name.substring(0, 2).toUpperCase();

        const userToSave: any = {
          name: validatedData.name,
          role: validatedData.role,
          initials,
          color: validatedData.color,
          pin: hashedPin,
          isPrimary: false,
          allowedPortals: validatedData.allowedPortals
        };

        const result = await db.users.add(userToSave);
        logger.info({ userId: result }, 'User registered successfully to IndexedDB');
      });

      showSuccess('Personnel Registered Successfully', `User ${newName} added securely.`);
      setNewName('');
      setNewPin('');
      setIsAdding(false);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        const firstError = err.errors[0].message;
        logger.warn({ errors: err.errors }, 'Input validation failed');
        showWarning('Validation Error', firstError);
      } else {
        showError('Failed to register user', err.message || 'Database error occurred.');
      }
    }
  };

  const handleDeleteUser = async (userId: number, isPrimary?: boolean) => {
    if (isPrimary) {
      showError('System Failure', 'Cannot delete the Primary Founder account.');
      return;
    }
    
    if (window.confirm('WARNING: Are you sure you want to revoke this user\'s access and delete their profile completely?')) {
      try {
        await measureOperation('DeleteUser', async () => {
           await db.users.delete(userId);
        });
        showSuccess('User access revoked and deleted.');
      } catch (err: any) {
        showError('Failed to delete user', err.message);
      }
    }
  };

  const handleUpdatePortals = async (userId: number, portals: string[]) => {
    await db.users.update(userId, { allowedPortals: portals });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2 flex items-center gap-3">
            <UserCog className="w-8 h-8 text-rose-400" /> RBAC & Users
          </h1>
          <p className="text-[var(--text-dim)] text-lg">System-wide technical role-based access control.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsAdding(true); setAllowedPortals(DEFAULT_PORTALS_TECH); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-black rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4" /> Register User
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6 border border-rose-500/20 bg-rose-500/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
               <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
                 <ShieldCheck className="w-5 h-5 text-rose-400" /> New System User
               </h3>
               <form onSubmit={handleCreateUser} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <label className="block text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Full Name</label>
                     <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500/50 outline-none" />
                   </div>
                   <div>
                     <label className="block text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Security PIN</label>
                     <input type="password" required maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="e.g. 1234" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest text-white focus:border-rose-500/50 outline-none" />
                   </div>
                   <div>
                     <label className="block text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Role Title</label>
                     <select value={newRole} onChange={e => {
                        setNewRole(e.target.value);
                        if (e.target.value === 'Admin' || e.target.value === 'Manager') setAllowedPortals(DEFAULT_PORTALS_ADMIN);
                        else setAllowedPortals(DEFAULT_PORTALS_TECH);
                     }} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500/50 outline-none appearance-none">
                       <option>Technician</option>
                       <option>Engineer</option>
                       <option>Manager</option>
                       <option>Admin</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[11px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Interface Color</label>
                     <select value={newColor} onChange={e => setNewColor(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-rose-500/50 outline-none appearance-none">
                       <option value="bg-cyan-500">Cyan Energy</option>
                       <option value="bg-emerald-500">Emerald Green</option>
                       <option value="bg-rose-500">Crimson Red</option>
                       <option value="bg-amber-500">Amber Gold</option>
                       <option value="bg-indigo-500">Indigo Void</option>
                     </select>
                   </div>
                 </div>
                 
                 <div className="pt-2 border-t border-white/5">
                   <label className="block text-xs uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                     <KeyRound className="w-4 h-4 text-rose-400" /> Portal Access Constraints
                   </label>
                   <div className="flex flex-wrap gap-3">
                     {AVAILABLE_PORTALS.map(portal => (
                       <label key={portal.id} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors", allowedPortals.includes(portal.id) ? "bg-white/10 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : "bg-black/20 border-white/5 opacity-50")}>
                          <input type="checkbox" checked={allowedPortals.includes(portal.id)} onChange={() => togglePortal(portal.id)} className="hidden" />
                          <div className={cn("w-3 h-3 rounded-full border", allowedPortals.includes(portal.id) ? "bg-rose-500 border-rose-400" : "bg-transparent border-white/20")} />
                          <span className={cn("text-xs font-bold uppercase tracking-widest", portal.color)}>{portal.name}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl border border-[var(--glass-border)] text-sm font-medium hover:bg-white/5 uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all">Deploy User</button>
                 </div>
               </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users?.map(u => {
          const userPortals = u.isPrimary ? DEFAULT_PORTALS_ADMIN : ((u as any).allowedPortals || (u.role === 'Admin' || u.role === 'Super Administrator' || u.role === 'Manager' ? DEFAULT_PORTALS_ADMIN : DEFAULT_PORTALS_TECH));

          return (
            <GlassCard key={u.id} className="relative overflow-hidden group flex flex-col p-0 border border-white/10 hover:border-white/20 transition-all">
               <div className="p-5 border-b border-white/5 bg-black/40 relative">
                  {u.isPrimary && <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] uppercase font-bold border border-amber-500/30">Founder</div>}
                  {/* Delete Button (Only for non-primary) */}
                  {!u.isPrimary && (
                    <button 
                      onClick={() => u.id && handleDeleteUser(u.id, u.isPrimary)}
                      className="absolute top-3 right-3 p-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      title="Revoke & Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="flex items-center gap-4 mb-3">
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg", u.color || 'bg-gray-700')}>
                       {u.initials}
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{u.name}</h3>
                        <div className="text-[10px] font-mono mt-1 px-2 py-0.5 bg-white/10 rounded border border-white/10 w-fit text-white/70 uppercase tracking-widest">{u.role}</div>
                     </div>
                  </div>
               </div>
               
               <div className="p-5 flex-1 bg-black/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-3 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Portal Clearances</h4>
                  <div className="space-y-1.5 mb-4">
                     {AVAILABLE_PORTALS.map(portal => {
                        const hasAccess = userPortals.includes(portal.id);
                        return (
                          <div key={portal.id} className={cn("flex items-center justify-between px-3 py-1.5 rounded-md border text-sm transition-all", hasAccess ? `border-${portal.color.replace('text-', '')}/30 bg-[var(--glass-bg)]` : "border-white/5 opacity-40")}>
                             <span className={cn("text-[10px] uppercase font-bold tracking-wider", hasAccess ? portal.color : "text-[var(--text-dim)]")}>{portal.name}</span>
                             {hasAccess ? <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_currentColor]" /> : <X className="w-4 h-4 text-rose-500/50" />}
                          </div>
                        )
                     })}
                  </div>
               </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  );
}
