import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { ShieldCheck, UserCog, Plus, KeyRound, AlertCircle, Save, X, Trash2, Lock } from 'lucide-react';
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
  const { currentUser } = useAuthStore();
  const users = useLiveQuery(() => db.users.toArray());
  const { showSuccess, showError, showWarning } = useNotifications();

  // SECURITY GUARD: Absolute gate for non-admins
  if (!isUserAdmin(currentUser)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black/60 rounded-[3rem] border border-rose-500/20 backdrop-blur-3xl min-h-[500px]">
         <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(244,63,94,0.15)] border border-rose-500/20">
            <Lock className="w-10 h-10 text-rose-500" />
         </div>
         <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4 drop-shadow-md">Clearance Required</h1>
         <p className="max-w-md text-[#8b9bb4] italic font-medium leading-relaxed">
            Your current biometric signature does not match the required authorization level for the System Configuration Node. 
         </p>
         <div className="mt-8 text-[10px] font-black text-rose-500/50 uppercase tracking-[0.5em] animate-pulse">Security Lockdown Active</div>
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
    // SECURITY: Non-primaries cannot edit the primary founder
    if (user.isPrimary && !currentUser?.isPrimary) {
      showError('Level 7 Restriction', 'Access Denied: The Prime DNA structure is write-protected.');
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

    // Final security check
    if (!isUserAdmin(currentUser)) {
      showError('Operation Void', 'Administrative signature required for commit.');
      return;
    }

    try {
      const updates: any = {
        name: editName,
        role: editRole,
        color: editColor,
        initials: editName.substring(0, 2).toUpperCase(),
        allowedPortals: editPortals
      };

      if (editPin.trim() !== '') {
        const { hashPin } = await import('@/core/security');
        updates.pin = await hashPin(editPin);
      }

      await measureOperation('UpdateUser', async () => {
        await db.users.update(editingUser.id!, updates);
      });

      showSuccess('User Map Synchronized', `Permissions for ${editName} updated.`);
      setEditingUser(null);
    } catch (err: any) {
      showError('Sync Failure', err.message);
    }
  };


  // ... rest of the component ...


  const toggleEditPortal = (portalId: string) => {
    if (editingUser?.isPrimary) return; // Primary always has all
    setEditPortals(prev => 
      prev.includes(portalId) ? prev.filter(p => p !== portalId) : [...prev, portalId]
    );
  };

  const handleQuickPortalToggle = async (userId: number, currentPortals: string[], portalId: string, isPrimary?: boolean) => {
    if (isPrimary) {
      showWarning('Restricted', 'Primary account portals cannot be modified.');
      return;
    }
    const newPortals = currentPortals.includes(portalId) 
      ? currentPortals.filter(p => p !== portalId)
      : [...currentPortals, portalId];
    await handleUpdatePortals(userId, newPortals);
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
          <p className="text-[#8b9bb4] text-lg">System-wide technical role-based access control.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsAdding(true); setAllowedPortals(DEFAULT_PORTALS_TECH); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-[#050508] rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] shrink-0 active:scale-95"
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
            <GlassCard className="p-6 border-rose-500/20 bg-rose-500/[0.02] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
               <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 relative z-10">
                 <ShieldCheck className="w-5 h-5 text-rose-400" /> New System User
               </h3>
               <form onSubmit={handleCreateUser} className="space-y-6 relative z-10">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div>
                     <label className="titan-label">Full Name</label>
                     <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="titan-input" />
                   </div>
                   <div>
                     <label className="titan-label">Security PIN</label>
                     <input type="password" required maxLength={6} value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="e.g. 1234" className="titan-input font-mono tracking-widest" />
                   </div>
                   <div>
                     <label className="titan-label">Role Title</label>
                     <select value={newRole} onChange={e => {
                        setNewRole(e.target.value);
                        if (e.target.value === 'Admin' || e.target.value === 'Manager') setAllowedPortals(DEFAULT_PORTALS_ADMIN);
                        else setAllowedPortals(DEFAULT_PORTALS_TECH);
                     }} className="titan-input appearance-none">
                       <option>Technician</option>
                       <option>Engineer</option>
                       <option>Manager</option>
                       <option>Admin</option>
                     </select>
                   </div>
                   <div>
                     <label className="titan-label">Interface Color</label>
                     <select value={newColor} onChange={e => setNewColor(e.target.value)} className="titan-input appearance-none">
                       <option value="bg-cyan-500">Cyan Energy</option>
                       <option value="bg-emerald-500">Emerald Green</option>
                       <option value="bg-rose-500">Crimson Red</option>
                       <option value="bg-amber-500">Amber Gold</option>
                       <option value="bg-indigo-500">Indigo Void</option>
                     </select>
                   </div>
                 </div>
                 
                 <div className="pt-2 border-t border-white/5">
                   <label className="titan-label mb-3 flex items-center gap-2">
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

                 <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 uppercase tracking-widest transition-all">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-[#050508] text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all active:scale-95">Deploy User</button>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-6 border-white/10 glass-panel-heavy overflow-hidden shadow-2xl relative">
                 {/* Top Glare Edge */}
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                 
                 <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                 <div className="flex justify-between items-center mb-6 relative z-10">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <UserCog className="w-6 h-6 text-cyan-400" /> User Configuration
                   </h3>
                   <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                     <X className="w-5 h-5" />
                   </button>
                 </div>
                 
                 <form onSubmit={handleUpdateUser} className="space-y-6 relative z-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                       <label className="titan-label">Full Name</label>
                       <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="titan-input" />
                     </div>
                     <div>
                       <label className="titan-label">Security PIN (Leave blank to keep)</label>
                       <input type="password" maxLength={6} value={editPin} onChange={e => setEditPin(e.target.value)} placeholder="••••" className="titan-input font-mono tracking-widest" />
                     </div>
                     <div>
                       <label className="titan-label">Role Title</label>
                       <select value={editRole} onChange={e => setEditRole(e.target.value)} className="titan-input appearance-none">
                         <option>Technician</option>
                         <option>Engineer</option>
                         <option>Manager</option>
                         <option>Admin</option>
                       </select>
                     </div>
                     <div>
                       <label className="titan-label">Interface Color</label>
                       <select value={editColor} onChange={e => setEditColor(e.target.value)} className="titan-input appearance-none">
                         <option value="bg-cyan-500">Cyan Energy</option>
                         <option value="bg-emerald-500">Emerald Green</option>
                         <option value="bg-rose-500">Crimson Red</option>
                         <option value="bg-amber-500">Amber Gold</option>
                         <option value="bg-indigo-500">Indigo Void</option>
                       </select>
                     </div>
                   </div>
                   
                   <div className="pt-4 border-t border-white/5">
                     <label className="titan-label mb-4 flex items-center gap-2">
                       <KeyRound className="w-4 h-4 text-cyan-400" /> Portal Clearances
                     </label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {AVAILABLE_PORTALS.map(portal => (
                         <label key={portal.id} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer select-none transition-all duration-300", editPortals.includes(portal.id) ? "bg-white/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-white/[0.05]" : "bg-black/40 border-white/5 opacity-60 hover:opacity-100")}>
                            <input type="checkbox" checked={editPortals.includes(portal.id)} onChange={() => toggleEditPortal(portal.id)} className="hidden" disabled={editingUser.isPrimary} />
                            <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-inner", editPortals.includes(portal.id) ? "bg-cyan-500 border-cyan-400" : "bg-black/50 border-white/20")}>
                               {editPortals.includes(portal.id) && <ShieldCheck className="w-3 h-3 text-black" />}
                            </div>
                            <span className={cn("text-xs font-bold uppercase tracking-widest", editPortals.includes(portal.id) ? portal.color : "text-[var(--text-dim)]")}>{portal.name}</span>
                         </label>
                       ))}
                     </div>
                   </div>

                   <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/10 uppercase tracking-widest transition-colors">Cancel</button>
                      <button type="submit" className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050508] text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all active:scale-95">Save Changes</button>
                   </div>
                 </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users?.filter(u => {
          // Rule: If you are NOT the primary founder, you CANNOT see the founder account.
          if (u.isPrimary && (!currentUser || !currentUser.isPrimary)) {
            return false;
          }
          return true;
        }).map(u => {
          const userPortals = u.isPrimary ? DEFAULT_PORTALS_ADMIN : ((u as any).allowedPortals || (u.role === 'Admin' || u.role === 'Super Administrator' || u.role === 'Manager' ? DEFAULT_PORTALS_ADMIN : DEFAULT_PORTALS_TECH));

          return (
            <GlassCard key={u.id} className="relative overflow-hidden group flex flex-col p-0 border border-white/5 hover:border-white/20 transition-all bg-white/[0.02] hover:bg-white/[0.04]">
               <div 
                  className="p-5 border-b border-white/5 relative cursor-pointer"
                  onClick={() => openEditModal(u as User)}
               >
                  {u.isPrimary && <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] uppercase font-bold border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">Founder</div>}
                  {/* Delete Button (Only for non-primary) */}
                  {!u.isPrimary && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); u.id && handleDeleteUser(u.id, u.isPrimary); }}
                      className="absolute top-4 right-4 p-1.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10"
                      title="Revoke & Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-4 mb-3">
                     <div className={cn("w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 transition-transform group-hover:scale-105", u.color || 'bg-gray-700')}>
                       {u.initials}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">{u.name}</h3>
                        <div className="text-[10px] font-mono mt-2 px-2.5 py-1 bg-black/40 rounded-md border border-white/10 w-fit text-[#8b9bb4] uppercase tracking-widest shadow-inner">{u.role}</div>
                     </div>
                  </div>
                  <div className="text-xs text-white/30 mt-4 flex items-center gap-1 group-hover:text-cyan-400/80 transition-colors">
                     <span>Click to configure profile</span>
                  </div>
               </div>
               
               <div className="p-5 flex-1 bg-black/40 shadow-inner">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8b9bb4] mb-4 flex items-center gap-1.5 drop-shadow-md"><KeyRound className="w-3.5 h-3.5 text-white/30" /> Portal Clearances</h4>
                  <div className="space-y-2">
                     {AVAILABLE_PORTALS.map(portal => {
                        const hasAccess = userPortals.includes(portal.id);
                        return (
                          <div key={portal.id} className={cn("flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all", hasAccess ? `border-${portal.color.replace('text-', '')}/20 bg-white/5 shadow-[inset_0_1px_rgba(255,255,255,0.05)]` : "border-white/5 bg-transparent")}>
                             <span className={cn("text-[11px] uppercase font-bold tracking-wider", hasAccess ? portal.color : "text-[#8b9bb4]")}>{portal.name}</span>
                             <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickPortalToggle(u.id!, userPortals, portal.id, u.isPrimary);
                                }}
                                disabled={u.isPrimary}
                                className={cn(
                                  "w-9 h-5 rounded-full relative transition-colors duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-none",
                                  hasAccess ? "bg-emerald-500" : "bg-black/50 border border-white/10",
                                  u.isPrimary ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:ring-2 hover:ring-white/20"
                                )}
                             >
                               <div className={cn(
                                 "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm",
                                 hasAccess ? "translate-x-4.5 left-[1px]" : "translate-x-0.5"
                               )} />
                             </button>
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
