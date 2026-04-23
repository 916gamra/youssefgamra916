import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Trash2, Edit3, Save, X, Search, UserCircle2, Pocket, ShieldCheck, MapPin } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { useNotifications } from '@/shared/hooks/useNotifications';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3 uppercase">
            <Users className="w-8 h-8 text-sky-500" /> Operational Staff
          </h1>
          <p className="text-slate-400 text-lg font-bold opacity-80 uppercase tracking-widest text-[10px]">Personnel Clearances & Zone Assignments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search personnel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all w-64 shadow-inner"
            />
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:shadow-[0_0_25px_rgba(14,165,233,0.4)]"
            >
              <Plus className="w-4 h-4" /> Issue Clearance
            </button>
          )}
        </div>
      </header>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[#0a0f14] border border-sky-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" /> {editingId ? 'Modify Personnel Dossier' : 'New Personnel Registration'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Operative Name</label>
                <input 
                  required 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Doe" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Primary Zone Assignment</label>
                <select 
                  required
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all appearance-none"
                >
                  <option value="" disabled>--- SELECT ZONE ---</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Specialty / Role (Opt)</label>
                <input 
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g., Lead Mechanic, Electromechanical" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
              <button 
                type="button" 
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-bold tracking-wider"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                type="submit" 
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] tracking-wider"
              >
                <Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Issue Credentials'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Staff ID Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((tech) => {
          const assignedSector = sectors.find(s => s.id === tech.sectorId);
          
          return (
            <motion.div 
              key={tech.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* ID Header Plaque */}
              <div className="flex justify-between items-center bg-black/50 p-2.5 border-b border-white/10">
                <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">ID: {tech.id.substring(0, 8)}</span>
                <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300 gap-1 bg-black/60 backdrop-blur-md border border-white/10 p-0.5 rounded-md">
                  <button onClick={() => handleEdit(tech)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-sky-400"><Edit3 className="w-3 h-3" /></button>
                  <button onClick={() => handleDelete(tech.id, tech.name)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>

              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 shadow-[inset_0_0_15px_rgba(14,165,233,0.1)]">
                  <UserCircle2 className="w-8 h-8" />
                </div>
                
                <h3 className="text-lg font-bold text-white tracking-wide mb-1">{tech.name}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-sky-400/80 mb-4 bg-sky-500/5 px-2.5 py-1 rounded-full border border-sky-500/20">
                  <Pocket className="w-3 h-3" />
                  <span className="font-mono">{tech.specialty || 'General Operative'}</span>
                </div>
                
                <div className="w-full bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Assigned Zone</span>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                     <MapPin className="w-4 h-4 text-emerald-500" />
                     {assignedSector ? assignedSector.name : 'Unknown Sector'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filteredStaff.length === 0 && !isAdding && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <Users className="w-12 h-12 text-slate-600 mb-4" />
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Active Personnel</p>
            <p className="text-xs text-slate-500 mt-2">Clearance granted list is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
