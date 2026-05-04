import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Trash2, Edit3, Save, X, Search, UserCircle2, Pocket, ShieldCheck, MapPin } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { GlassCard } from '@/shared/components/GlassCard';
import { cn } from '@/shared/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export function StaffRegistryView() {
  const { technicians, sectors, createTechnician, updateTechnician, deleteTechnician } = useOrganizationEngine();
  const { showSuccess, showError } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [specialty, setSpecialty] = useState('');

  const filteredStaff = technicians.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    sectors.find(s => s.id === t.sectorId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sectorId) return;
    try {
      if (editingId) {
        await updateTechnician(editingId, { name, sectorId, specialty });
        showSuccess('Dossier Updated', `${name} profile adjusted.`);
      } else {
        await createTechnician(name, sectorId, specialty);
        showSuccess('Personnel Registered', `${name} granted access.`);
      }
      handleCancel();
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleEdit = (tech: any) => {
    setEditingId(tech.id);
    setName(tech.name);
    setSectorId(tech.sectorId);
    setSpecialty(tech.specialty || '');
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Revoke clearance for ${name}?`)) {
      try {
        await deleteTechnician(id);
        showSuccess('Clearance Revoked', `${name} has been removed from active duty.`);
      } catch (err: any) {
        showError('Action Failed', err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setSectorId('');
    setSpecialty('');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full flex flex-col gap-6 relative z-10"
    >
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pt-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1 flex items-center gap-4 uppercase">
            <Users className="w-8 h-8 text-indigo-500" /> Operational Staff
          </h1>
          <p className="text-slate-400 text-lg font-medium opacity-80 font-sans">Personnel Clearances & Zone Assignments.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <StatCompact icon={<Users className="w-4 h-4 text-indigo-500" />} label="Total Personnel" value={technicians.length.toString()} />
          <StatCompact icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} label="Cleared" value={technicians.length.toString()} />
        </div>
      </motion.header>

      <motion.div variants={itemVariants} className="flex-1 min-h-0 flex flex-col">
        <GlassCard className="!p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl h-full flex flex-col">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Staff Directory</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Personnel Registry</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search personnel..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="titan-input py-2.5 pl-11 pr-3 w-64 shadow-none"
                />
              </div>
              {!isAdding && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="titan-button titan-button-primary bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] shrink-0 !py-2.5"
                >
                  <Plus className="w-4 h-4" /> Issue Clearance
                </button>
              )}
            </div>
          </div>

          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="border-b border-white/5 bg-white/[0.02]"
            >
              <div className="p-8 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> {editingId ? 'Modify Personnel Dossier' : 'New Personnel Registration'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Operative Name</label>
                      <input 
                        required 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., John Doe" 
                        className="titan-input py-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Primary Zone Assignment</label>
                      <select 
                        required
                        value={sectorId}
                        onChange={(e) => setSectorId(e.target.value)}
                        className="titan-input appearance-none py-3"
                      >
                        <option value="" disabled className="bg-[#14161f]">--- SELECT ZONE ---</option>
                        {sectors.map(s => <option key={s.id} value={s.id} className="bg-[#14161f]">{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">Specialty / Role (Opt)</label>
                      <input 
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="e.g., Lead Mechanic, Electromechanical" 
                        className="titan-input py-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      className="titan-button titan-button-outline !px-6"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="titan-button titan-button-primary bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] !px-8"
                    >
                      <Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Issue Credentials'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-black/10 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredStaff.map((tech) => {
                  const assignedSector = sectors.find(s => s.id === tech.sectorId);
                  
                  return (
                    <motion.div 
                      key={tech.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="titan-card overflow-hidden flex flex-col group relative shadow-2xl p-0 hover:border-indigo-500/30 transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                      
                      {/* ID Header Plaque */}
                      <div className="flex justify-between items-center bg-white/[0.02] p-4 border-b border-white/5 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(14,165,233,0.8)] animate-pulse" />
                           <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">ID-{tech.id.substring(0, 6)}</span>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300 gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-1 rounded-lg">
                          <button onClick={() => handleEdit(tech)} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-indigo-400 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(tech.id, tech.name)} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 shadow-[inset_0_0_20px_rgba(14,165,233,0.15)] group-hover:scale-105 transition-transform duration-500">
                          <UserCircle2 className="w-10 h-10" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-white tracking-wide mb-2 uppercase">{tech.name}</h3>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-400/90 mb-5 bg-indigo-500/10 px-3 py-1.5 rounded-md border border-indigo-500/20 uppercase tracking-widest font-bold">
                          <Pocket className="w-3.5 h-3.5" />
                          <span>{tech.specialty || 'General Operative'}</span>
                        </div>
                        
                        <div className="w-full bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col gap-2 mt-auto text-left">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Assigned Zone
                          </span>
                          <div className="text-sm font-bold text-slate-200 uppercase tracking-tight">
                             {assignedSector ? assignedSector.name : 'Unknown Sector'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filteredStaff.length === 0 && !isAdding && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <Users className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Active Personnel</p>
                  <p className="text-xs text-slate-500 mt-2">Clearance granted list is currently empty.</p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

function StatCompact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-base font-bold text-white -mt-0.5">{value}</span>
      </div>
    </div>
  );
}

