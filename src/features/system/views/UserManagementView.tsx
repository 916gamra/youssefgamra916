import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShieldCheck, UserCog, Plus, KeyRound, AlertCircle, Save, X, Trash2, Lock, Fingerprint, Info, CheckCircle2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import type { User } from '@/core/db';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { measureOperation, logger } from '@/core/logger';
import { userSchema } from '@/core/schemas';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/app/store/useAuthStore';
import { isUserAdmin } from '@/core/permissions';

const AVAILABLE_PORTALS = [
  { id: 'PDR', name: 'PDR Engine', color: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500' },
  { id: 'PREVENTIVE', name: 'Maintenance', color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  { id: 'ORGANIZATION', name: 'Part Catalog', color: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500' },
  { id: 'FACTORY', name: 'Factory Admin', color: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500' },
  { id: 'ANALYTICS', name: 'Analytics Hub', color: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500' },
  { id: 'SETTINGS', name: 'System Config', color: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500' }
];

const DEFAULT_PORTALS_ADMIN = ['PDR', 'PREVENTIVE', 'ORGANIZATION', 'FACTORY', 'ANALYTICS', 'SETTINGS'];
const DEFAULT_PORTALS_TECH = ['PDR', 'PREVENTIVE'];

export function UserManagementView() {
  const { currentUser } = useAuthStore();
  const users = useLiveQuery(() => db.users.toArray(), [], []);
  const { showSuccess, showError, showWarning } = useNotifications();

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

  // Edit user form state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editPortals, setEditPortals] = useState<string[]>([]);

  const openEditModal = (user: User) => {
    if (user.isPrimary && !currentUser?.isPrimary) {
      showError('Restricted', 'Access Denied: The primary administrator profile is write-protected.');
      return;
    }
    
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditColor(user.color || 'bg-cyan-500');
    setEditPin(''); // leave blank unless changing
    setEditPortals(user.isPrimary ? DEFAULT_PORTALS_ADMIN : (user.allowedPortals || []));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !currentUser) return;

    if (!isUserAdmin(currentUser)) {
      showError('Operation Void', 'Administrative signature required to write changes.');
      return;
    }

    try {
      const updates: Partial<User> = {
        name: editName,
        color: editColor,
        initials: editName.substring(0, 2).toUpperCase(),
      };
      
      if (!editingUser.isPrimary) {
        updates.role = editRole;
        updates.allowedPortals = editPortals;
      }

      if (editPin.trim() !== '') {
        const { hashPin } = await import('@/core/security');
        updates.pin = await hashPin(editPin);
      }

      await measureOperation('UpdateUser', async () => {
        await db.users.update(editingUser.id!, updates);
      });

      showSuccess('Profile Synchronized', `Account settings for ${editName} updated successfully.`);
      setEditingUser(null);
    } catch (err: any) {
      showError('Sync Failure', err.message);
    }
  };

  const toggleEditPortal = (portalId: string) => {
    if (editingUser?.isPrimary) return; 
    setEditPortals(prev => 
      prev.includes(portalId) ? prev.filter(p => p !== portalId) : [...prev, portalId]
    );
  };
  
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

    try {
      const validatedData = userSchema.parse({
        name: newName,
        pin: newPin,
        role: newRole,
        color: newColor,
        allowedPortals
      });

      await measureOperation('RegisterUser', async () => {
        const { hashPin } = await import('@/core/security');
        const hashedPin = await hashPin(validatedData.pin);
        const initials = validatedData.name.substring(0, 2).toUpperCase();

        const userToSave: Omit<User, 'id'> = {
          name: validatedData.name,
          role: validatedData.role,
          initials,
          color: validatedData.color,
          pin: hashedPin,
          isPrimary: false,
          allowedPortals: validatedData.allowedPortals
        };

        await db.users.add(userToSave);
      });

      showSuccess('Identity Created', `${newName} has been successfully registered.`);
      setNewName('');
      setNewPin('');
      setIsAdding(false);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        showWarning('Validation Error', err.errors[0].message);
      } else {
        showError('Registration Failed', err.message || 'Database error occurred.');
      }
    }
  };

  const handleDeleteUser = async (userId: number, isPrimary?: boolean) => {
    if (isPrimary) {
      showError('System Failure', 'The Founder/Primary profile cannot be deleted.');
      return;
    }
    
    if (window.confirm('WARNING: Are you absolutely sure you want to permanently revoke this identity and delete their profile?')) {
      try {
        await measureOperation('DeleteUser', async () => {
           await db.users.delete(userId);
        });
        showSuccess('Identity Revoked', 'The user profile has been permanently purged.');
      } catch (err: any) {
        showError('Purge Failed', err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100 tracking-tight mb-2 flex items-center gap-3">
            <UserCog className="w-8 h-8 text-rose-500" /> 
            Identity Control
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Manage system access, assign roles, and precisely orchestrate functional clearance across all enterprise hubs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsAdding(true); setAllowedPortals(DEFAULT_PORTALS_TECH); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-rose-500/20 shrink-0 active:scale-95 border border-transparent"
          >
            <Plus className="w-4 h-4" /> Add Identity
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6 border border-white/10 bg-white/[0.02] shadow-2xl relative overflow-hidden rounded-2xl mb-8">
               <div className="flex items-start gap-4 mb-6 relative z-10">
                 <div className="p-3 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                    <Fingerprint className="w-6 h-6 text-rose-400" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-200">Initialize New Agent</h3>
                    <p className="text-sm text-slate-400 mt-1">Configure credentials and assign module clearances.</p>
                 </div>
               </div>

               <form onSubmit={handleCreateUser} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                     <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all placeholder:text-slate-600 shadow-inner" placeholder="E.g., John Doe" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Access PIN</label>
                     <input type="password" required maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="••••" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 shadow-inner tracking-[0.25em] font-mono transition-all" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role Classification</label>
                     <select value={newRole} onChange={e => {
                        setNewRole(e.target.value);
                        if (e.target.value === 'Admin' || e.target.value === 'Manager') setAllowedPortals(DEFAULT_PORTALS_ADMIN);
                        else setAllowedPortals(DEFAULT_PORTALS_TECH);
                     }} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 appearance-none shadow-inner transition-all">
                       <option>Technician</option>
                       <option>Engineer</option>
                       <option>Manager</option>
                       <option>Admin</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Visual Tag Color</label>
                     <select value={newColor} onChange={e => setNewColor(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 appearance-none shadow-inner transition-all">
                       <option value="bg-cyan-500">Cyan Energy</option>
                       <option value="bg-emerald-500">Emerald Green</option>
                       <option value="bg-rose-500">Crimson Red</option>
                       <option value="bg-amber-500">Amber Gold</option>
                       <option value="bg-indigo-500">Indigo Void</option>
                     </select>
                   </div>
                 </div>
                 
                 <div className="pt-2">
                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4 text-slate-400" /> Module Privileges
                   </label>
                   <div className="flex flex-wrap gap-3">
                     {AVAILABLE_PORTALS.map(portal => (
                       <label key={portal.id} className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer select-none transition-all duration-200", allowedPortals.includes(portal.id) ? "bg-white/[0.05] border-white/20 shadow-sm" : "bg-black/20 border-white/5 opacity-60 hover:opacity-100 hover:bg-black/40")}>
                          <input type="checkbox" checked={allowedPortals.includes(portal.id)} onChange={() => togglePortal(portal.id)} className="hidden" />
                          <div className={cn("w-4 h-4 rounded-md border flex items-center justify-center transition-all", allowedPortals.includes(portal.id) ? `${portal.bg} ${portal.border}` : "bg-black/50 border-white/20")}>
                             {allowedPortals.includes(portal.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={cn("text-[11px] font-bold uppercase tracking-widest", allowedPortals.includes(portal.id) ? "text-slate-200" : "text-slate-500")}>{portal.name}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 bg-black/40 hover:bg-white/10 text-slate-300 rounded-xl font-medium text-sm transition-colors border border-white/10 shadow-inner">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 bg-white text-black hover:bg-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(255,255,255,0.2)]">Execute Profile</button>
                 </div>
               </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-8 border border-white/10 bg-[#121318]/90 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative rounded-3xl" style={{ backdropFilter: 'blur(30px)' }}>
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                 
                 <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-5">
                   <div className="flex items-center gap-4">
                     <div className={cn("w-12 h-12 rounded-[0.8rem] flex items-center justify-center text-xl font-bold text-white shadow-inner border border-white/10", editColor || 'bg-slate-800')}>
                       {editName.substring(0,2).toUpperCase()}
                     </div>
                     <div>
                       <h3 className="text-xl font-semibold text-white tracking-tight">Modify Identity</h3>
                       <p className="text-sm text-slate-400">Updating configuration for {editName}</p>
                     </div>
                   </div>
                   <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white border border-white/5 shadow-inner">
                     <X className="w-5 h-5" />
                   </button>
                 </div>
                 
                 <form onSubmit={handleUpdateUser} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Display Name</label>
                       <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all shadow-inner" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">PIN Override <span className="text-[9px] opacity-70">(Leave blank to keep)</span></label>
                       <input type="password" maxLength={6} value={editPin} onChange={e => setEditPin(e.target.value)} placeholder="••••••••" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 font-mono tracking-[0.25em] transition-all shadow-inner" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Role Classification</label>
                       <select value={editRole} onChange={e => setEditRole(e.target.value)} disabled={editingUser.isPrimary} className={cn("w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 appearance-none transition-all shadow-inner", editingUser.isPrimary && "opacity-50 cursor-not-allowed")}>
                         <option>Technician</option>
                         <option>Engineer</option>
                         <option>Manager</option>
                         <option>Admin</option>
                         {editingUser.isPrimary && <option>Super Administrator</option>}
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Avatar Aura</label>
                       <select value={editColor} onChange={e => setEditColor(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 appearance-none transition-all shadow-inner">
                         <option value="bg-cyan-500">Cyan</option>
                         <option value="bg-emerald-500">Emerald</option>
                         <option value="bg-rose-500">Red</option>
                         <option value="bg-amber-500">Amber</option>
                         <option value="bg-indigo-500">Indigo</option>
                       </select>
                     </div>
                   </div>
                   
                   <div className="pt-2">
                     <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-slate-400" /> Module Privileges
                     </label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {AVAILABLE_PORTALS.map(portal => {
                         const isActive = editPortals.includes(portal.id);
                         return (
                         <label key={portal.id} className={cn("flex flex-col gap-2 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200", isActive ? "bg-white/[0.05] border-white/20 shadow-sm" : "bg-black/20 border-white/5 opacity-60 hover:opacity-100 hover:bg-black/40")}>
                            <input type="checkbox" checked={isActive} onChange={() => toggleEditPortal(portal.id)} className="hidden" disabled={editingUser.isPrimary} />
                            <div className="flex items-center justify-between">
                              <div className={cn("w-4 h-4 rounded-md border flex items-center justify-center transition-all", isActive ? `${portal.bg} ${portal.border}` : "bg-black/50 border-white/20")}>
                                 {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                            <span className={cn("text-xs font-bold tracking-tight", isActive ? "text-slate-200" : "text-slate-500")}>{portal.name}</span>
                         </label>
                       )})}
                     </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                      <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 bg-black/40 hover:bg-white/10 text-slate-300 rounded-xl font-medium text-sm transition-colors border border-white/10 shadow-inner">Cancel</button>
                      <button type="submit" className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(255,255,255,0.2)]">Save Changes</button>
                   </div>
                 </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.filter(u => {
          if (u.isPrimary && (!currentUser || !currentUser.isPrimary)) { return false; }
          return true;
        }).map(u => {
          const userPortals = u.isPrimary ? DEFAULT_PORTALS_ADMIN : ((u as any).allowedPortals || (u.role === 'Admin' || u.role === 'Super Administrator' || u.role === 'Manager' ? DEFAULT_PORTALS_ADMIN : DEFAULT_PORTALS_TECH));

          return (
            <GlassCard key={u.id} className="relative overflow-hidden group flex flex-col p-6 border border-white/5 hover:border-white/20 transition-all bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl shadow-lg hover:shadow-2xl translate-y-0 hover:-translate-y-1 duration-300 cursor-pointer" onClick={() => openEditModal(u as User)}>
               <div className="flex items-start justify-between mb-6 relative">
                  <div className="flex items-center gap-4">
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-inner border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0", u.color || 'bg-slate-800')}>
                       {u.initials}
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-100 tracking-tight truncate group-hover:text-white transition-colors">{u.name}</h3>
                        <p className="text-sm font-medium text-slate-500 truncate mt-0.5">{u.role}</p>
                     </div>
                  </div>
               </div>

               {u.isPrimary && <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">Founder</div>}
               
               {!u.isPrimary && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); u.id && handleDeleteUser(u.id, u.isPrimary); }}
                   className="absolute top-4 right-4 p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10 shadow-sm"
                   title="Delete User"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               )}

               <div className="mt-auto border-t border-white/5 pt-4">
                  <div className="flex flex-wrap gap-2">
                     {AVAILABLE_PORTALS.map(portal => {
                        const hasAccess = userPortals.includes(portal.id);
                        if (!hasAccess) return null;
                        return (
                          <div key={portal.id} className="flex items-center px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-300 shadow-inner whitespace-nowrap">
                             {portal.name}
                          </div>
                        )
                     })}
                  </div>
               </div>
               
               <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </GlassCard>
          )
        })}
      </div>
      
      <div className="mt-8 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
        <Info className="w-6 h-6 text-blue-400 shrink-0" />
        <div>
           <h4 className="font-bold text-blue-400 uppercase tracking-widest text-sm mb-1">Identity Federation Architecture</h4>
           <p className="text-slate-300 text-[13px] leading-relaxed max-w-4xl">
             User accounts are locally encrypted and bound to this application instance. 
             Modifying system roles dynamically updates interface availability across all active sessions. 
             Administrative (Founder) profiles possess immutable root capabilities.
           </p>
        </div>
      </div>
    </div>
  );
}
