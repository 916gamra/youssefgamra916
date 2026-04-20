import React, { useState, useRef } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Database, Download, Upload, Trash2, Shield, Bell, Monitor, User as UserIcon, LogOut, Users, Plus, Edit2, X, RefreshCw, Loader2, Save } from 'lucide-react';
import { db, User } from '@/core/db';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Dialog from '@radix-ui/react-dialog';
import { seedDatabase } from '@/core/seed';
import { useDataVault } from '../hooks/useDataVault';

export function SettingsView({ onLogout, user }: { onLogout?: () => void, user?: User | null }) {
  const [activeSection, setActiveSection] = useState<'appearance' | 'data' | 'users'>('appearance');
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  
  const users = useLiveQuery(() => db.users.toArray());
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { exportBackup, importBackup, isExporting, isImporting } = useDataVault();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearDatabase = async () => {
    setIsClearing(true);
    try {
      await db.transaction('rw', [db.pdrFamilies, db.pdrTemplates, db.pdrBlueprints, db.inventory, db.movements], async () => {
        await db.pdrFamilies.clear();
        await db.pdrTemplates.clear();
        await db.pdrBlueprints.clear();
        await db.inventory.clear();
        await db.movements.clear();
      });
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to clear database", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const success = await seedDatabase();
    if (success) {
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    }
    setIsSeeding(false);
  };

  const handleExportData = async () => {
    try {
      await exportBackup();
    } catch (error) {
      console.error("Failed to export data", error);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      window.location.reload(); // Refresh to ensure state captures new data
    } catch (error) {
      console.error("Failed to import backup");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const pin = formData.get('pin') as string;
    
    await db.users.add({
      name,
      role,
      pin,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      color: ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 5)]
    });
    setIsAddUserOpen(false);
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser?.id) return;
    const formData = new FormData(e.currentTarget);
    
    await db.users.update(editingUser.id, {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      pin: formData.get('pin') as string,
    });
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: number) => {
    const u = await db.users.get(id);
    if (u?.isPrimary) return; // Cannot delete primary account
    await db.users.delete(id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">System Settings</h1>
          <p className="text-[var(--text-dim)] text-lg">Manage application preferences and local database.</p>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveSection('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeSection === 'appearance' ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-bright)]' : 'hover:bg-white/5 border border-transparent text-[var(--text-dim)] hover:text-[var(--text-bright)]'}`}
          >
            <Monitor className={`w-5 h-5 ${activeSection === 'appearance' ? 'text-[var(--accent)]' : ''}`} />
            Appearance
          </button>
          <button 
            onClick={() => setActiveSection('data')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeSection === 'data' ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-bright)]' : 'hover:bg-white/5 border border-transparent text-[var(--text-dim)] hover:text-[var(--text-bright)]'}`}
          >
            <Database className={`w-5 h-5 ${activeSection === 'data' ? 'text-[var(--accent)]' : ''}`} />
            Data Management
          </button>
          
          {user?.isPrimary && (
            <button 
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeSection === 'users' ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-bright)]' : 'hover:bg-white/5 border border-transparent text-[var(--text-dim)] hover:text-[var(--text-bright)]'}`}
            >
              <Users className={`w-5 h-5 ${activeSection === 'users' ? 'text-[var(--accent)]' : ''}`} />
              User Management
            </button>
          )}

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 border border-transparent text-[var(--text-dim)] hover:text-[var(--text-bright)] font-medium transition-colors">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 border border-transparent text-[var(--text-dim)] hover:text-[var(--text-bright)] font-medium transition-colors">
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          {activeSection === 'appearance' && (
            <GlassCard className="space-y-6">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] border-b border-[var(--glass-border)] pb-3">
                Appearance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-medium text-[var(--text-bright)]">Theme</h3>
                    <p className="text-[13px] text-[var(--text-dim)] mt-1">Application is currently optimized for dark mode environments.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 border border-[var(--glass-border)] rounded-lg p-1">
                    <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--glass-bg)] text-[var(--text-bright)] shadow-sm">
                      Dark
                    </button>
                    <button className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--text-dim)] opacity-50 cursor-not-allowed">
                      Light
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {activeSection === 'data' && (
            <GlassCard className="space-y-6">
              <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)] border-b border-[var(--glass-border)] pb-3">
                Data Management (Offline DB)
              </h2>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-medium text-[var(--accent)]">Seed Sample Data</h3>
                    <p className="text-[13px] text-[var(--text-dim)] mt-1">Populate the database with sample maintenance data for testing.</p>
                  </div>
                  <button 
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="flex items-center gap-2 bg-[var(--accent)] hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                    {isSeeding ? 'Seeding...' : 'Seed DB'}
                  </button>
                </div>
                
                {seedSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    Database seeded successfully. Check PDR Dashboard.
                  </div>
                )}

                <div className="h-px w-full bg-[var(--glass-border)]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-medium text-[var(--text-bright)]">Export Database</h3>
                    <p className="text-[13px] text-[var(--text-dim)] mt-1">Download a JSON backup of all spare parts, stock movements, and structure.</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    disabled={isExporting || isImporting}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-[var(--text-bright)] px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Exporting...' : 'Export JSON'}
                  </button>
                </div>

                <div className="h-px w-full bg-[var(--glass-border)]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div>
                    <h3 className="text-[15px] font-medium text-amber-500 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Restore from Vault (Backup)
                    </h3>
                    <p className="text-[13px] text-[var(--text-dim)] mt-1">
                      Upload a `.json` backup file. <strong className="text-red-400">WARNING: This replaces the entire local database.</strong>
                    </p>
                  </div>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImportData} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExporting || isImporting}
                    className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors shrink-0 disabled:opacity-50"
                  >
                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isImporting ? 'Restoring...' : 'Restore JSON'}
                  </button>
                </div>

                <div className="h-px w-full bg-[var(--glass-border)]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[15px] font-medium text-red-400">Clear Database</h3>
                    <p className="text-[13px] text-[var(--text-dim)] mt-1">Permanently delete all local data. This action cannot be undone.</p>
                  </div>
                  
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <button className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                        Clear Data
                      </button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                      <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-base)] border border-[var(--glass-border)] rounded-2xl p-6 z-50 shadow-2xl">
                        <Dialog.Title className="text-lg font-semibold text-red-400 mb-2">Are you absolutely sure?</Dialog.Title>
                        <Dialog.Description className="text-[14px] text-[var(--text-dim)] mb-6">
                          This action cannot be undone. This will permanently delete all spare parts and stock movement history from your local browser database.
                        </Dialog.Description>
                        
                        <div className="flex justify-end gap-3">
                          <Dialog.Close asChild>
                            <button className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-white/5 transition-colors">
                              Cancel
                            </button>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <button 
                              onClick={handleClearDatabase}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Yes, delete everything
                            </button>
                          </Dialog.Close>
                        </div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  </Dialog.Root>
                </div>
                
                {clearSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    Database cleared successfully.
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {activeSection === 'users' && user?.isPrimary && (
            <GlassCard className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[var(--text-dim)]">
                  User Management
                </h2>
                
                <Dialog.Root open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <Dialog.Trigger asChild>
                    <button className="flex items-center gap-2 bg-[var(--accent)] hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      Add User
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-base)] border border-[var(--glass-border)] rounded-2xl p-6 z-50 shadow-2xl">
                      <Dialog.Title className="text-lg font-semibold text-[var(--text-bright)] mb-4">Add New User</Dialog.Title>
                      <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-[var(--text-dim)] font-medium">Full Name</label>
                          <input required name="name" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-[var(--text-dim)] font-medium">Role</label>
                          <input required name="role" className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-[var(--text-dim)] font-medium">PIN</label>
                          <input required name="pin" maxLength={4} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" placeholder="1234" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                          <Dialog.Close asChild>
                            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-white/5 transition-colors">Cancel</button>
                          </Dialog.Close>
                          <button type="submit" className="bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Create User</button>
                        </div>
                      </form>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>

              <div className="space-y-3">
                {users?.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-[var(--glass-border)] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center text-sm font-bold text-white`}>
                        {u.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-[var(--text-bright)]">{u.name}</h3>
                          {u.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-dim)]">{u.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!u.isPrimary && (
                        <button 
                          onClick={() => u.id && handleDeleteUser(u.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-dim)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit User Dialog */}
              <Dialog.Root open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-base)] border border-[var(--glass-border)] rounded-2xl p-6 z-50 shadow-2xl">
                    <Dialog.Title className="text-lg font-semibold text-[var(--text-bright)] mb-4">Edit User</Dialog.Title>
                    {editingUser && (
                      <form onSubmit={handleEditUser} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs text-[var(--text-dim)] font-medium">Full Name</label>
                          <input required name="name" defaultValue={editingUser.name} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-[var(--text-dim)] font-medium">Role</label>
                          <input required name="role" defaultValue={editingUser.role} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-[var(--text-dim)] font-medium">PIN</label>
                          <input required name="pin" maxLength={4} defaultValue={editingUser.pin} className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-bright)] focus:outline-none focus:border-[var(--accent)] transition-all" />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                          <Dialog.Close asChild>
                            <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-white/5 transition-colors">Cancel</button>
                          </Dialog.Close>
                          <button type="submit" className="bg-[var(--accent)] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Save Changes</button>
                        </div>
                      </form>
                    )}
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

