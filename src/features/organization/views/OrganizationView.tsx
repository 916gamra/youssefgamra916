import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Building2, Users, Plus, Wrench, ChevronRight, Briefcase, Factory, Cpu, ArrowLeft, Tag, Box } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';
import { cn } from '@/shared/utils';

export function OrganizationView() {
  const { sectors, technicians, machines, createSector, createTechnician } = useOrganizationEngine();
  
  // Drill-down State
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  // States for new Sector
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorDesc, setNewSectorDesc] = useState('');

  // States for new Technician
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [newTechName, setNewTechName] = useState('');
  const [newTechSpecialty, setNewTechSpecialty] = useState('');
  const [newTechSectorId, setNewTechSectorId] = useState('');

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName) return;
    await createSector(newSectorName, newSectorDesc);
    setNewSectorName('');
    setNewSectorDesc('');
    setIsAddingSector(false);
  };

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName || !newTechSectorId) return;
    await createTechnician(newTechName, newTechSectorId, newTechSpecialty);
    setNewTechName('');
    setNewTechSpecialty('');
    setNewTechSectorId('');
    setIsAddingTech(false);
  };

  const selectedSector = sectors.find(s => s.id === selectedSectorId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          {selectedSector ? (
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => setSelectedSectorId(null)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-bright)] transition-colors border border-[var(--glass-border)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight">{selectedSector.name}</h1>
                <p className="text-[var(--text-dim)]">{selectedSector.description || 'Facility Sector Details'}</p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Organization Structure</h1>
              <p className="text-[var(--text-dim)] text-lg">Manage facility sectors and authorized technical personnel.</p>
            </>
          )}
        </div>

        {!selectedSector && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingSector(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[var(--text-bright)] rounded-xl font-medium transition-all shrink-0"
            >
              <Building2 className="w-4 h-4" />
              New Sector
            </button>
            <button
              onClick={() => setIsAddingTech(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0"
            >
              <Users className="w-4 h-4" />
              Add Technician
            </button>
          </div>
        )}
      </header>

      {/* Forms Panels (Liquid Glass Modals inline) */}
      <AnimatePresence>
        {isAddingSector && !selectedSector && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <h3 className="text-lg font-medium text-[var(--text-bright)] mb-4 flex items-center gap-2 relative z-10">
                <Building2 className="w-5 h-5 text-emerald-400" /> Create Facility Sector
              </h3>
              <form onSubmit={handleAddSector} className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <input
                  type="text"
                  placeholder="Sector Name (e.g., Packaging Line A)"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  className="bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-[var(--accent)] outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={newSectorDesc}
                  onChange={(e) => setNewSectorDesc(e.target.value)}
                  className="bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-[var(--accent)] outline-none"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAddingSector(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--glass-border)] text-sm font-medium hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)]">Save Sector</button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {isAddingTech && !selectedSector && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-6 border border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <h3 className="text-lg font-medium text-[var(--text-bright)] mb-4 flex items-center gap-2 relative z-10">
                <Users className="w-5 h-5 text-blue-400" /> Register Technician
              </h3>
              <form onSubmit={handleAddTechnician} className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  className="bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-[var(--accent)] outline-none"
                  required
                />
                <select
                  value={newTechSectorId}
                  onChange={(e) => setNewTechSectorId(e.target.value)}
                  className="bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-[var(--accent)] outline-none appearance-none"
                  required
                >
                  <option value="" disabled>Assign to Sector...</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Specialty (e.g., Electrical)"
                  value={newTechSpecialty}
                  onChange={(e) => setNewTechSpecialty(e.target.value)}
                  className="bg-black/30 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-bright)] focus:border-[var(--accent)] outline-none"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAddingTech(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--glass-border)] text-sm font-medium hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)]">Register</button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedSector ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {sectors.length === 0 ? (
              <div className="col-span-full p-12 text-center border border-[var(--glass-border)] rounded-2xl bg-white/[0.02]">
                <Building2 className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-[var(--text-bright)] mb-2">No Sectors Defined</h3>
                <p className="text-[var(--text-dim)]">Create your first facility sector to begin organizing technicians and machines.</p>
              </div>
            ) : (
              sectors.map((sector) => {
                const sectorTechs = technicians.filter(t => t.sectorId === sector.id);
                const sectorMachines = machines.filter(m => m.sectorId === sector.id);

                return (
                  <GlassCard 
                    key={sector.id} 
                    className="flex flex-col p-0 overflow-hidden group cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
                    onClick={() => setSelectedSectorId(sector.id)}
                  >
                    <div className="p-6 relative overflow-hidden h-[200px] flex flex-col justify-between">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/10 rounded-full blur-3xl group-hover:bg-[var(--accent)]/20 transition-colors" />
                      
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-[var(--text-bright)] flex items-center gap-2 mb-2">
                          <Building2 className="w-6 h-6 text-[var(--accent)]" />
                          {sector.name}
                        </h3>
                        {sector.description && (
                          <p className="text-sm text-[var(--text-dim)] line-clamp-2">{sector.description}</p>
                        )}
                      </div>

                      <div className="relative z-10 flex gap-4">
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                           <Users className="w-4 h-4 text-blue-400" />
                           <span className="text-sm font-mono font-semibold text-white">{sectorTechs.length} <span className="text-[10px] text-[var(--text-dim)] font-sans font-normal uppercase">Techs</span></span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                           <Cpu className="w-4 h-4 text-fuchsia-400" />
                           <span className="text-sm font-mono font-semibold text-white">{sectorMachines.length} <span className="text-[10px] text-[var(--text-dim)] font-sans font-normal uppercase">Assets</span></span>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 p-2 rounded-full bg-[var(--accent)] text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                         <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="drill-down"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Techs Column */}
            <GlassCard className="flex flex-col h-[600px] border-blue-500/20 bg-blue-500/5 p-0 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="p-5 border-b border-white/10 bg-black/20 shrink-0 relative z-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <Users className="w-5 h-5 text-blue-400" />
                     Assigned Personnel
                  </h3>
               </div>
               <div className="flex-1 overflow-auto p-4 space-y-3 relative z-10">
                  {technicians.filter(t => t.sectorId === selectedSector.id).map(tech => (
                     <div key={tech.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-colors">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-500/50 flex items-center justify-center text-lg font-bold text-white">
                          {tech.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{tech.name}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-dim)]">
                             <Briefcase className="w-3.5 h-3.5 text-blue-400" /> {tech.specialty || 'Generalist'}
                          </div>
                        </div>
                     </div>
                  ))}
                  {technicians.filter(t => t.sectorId === selectedSector.id).length === 0 && (
                     <div className="p-8 text-center text-[var(--text-dim)]">No technicians assigned inside this sector.</div>
                  )}
               </div>
            </GlassCard>

            {/* Machines Column */}
            <GlassCard className="flex flex-col h-[600px] border-fuchsia-500/20 bg-fuchsia-500/5 p-0 overflow-hidden relative">
               <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="p-5 border-b border-white/10 bg-black/20 shrink-0 relative z-10">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <Factory className="w-5 h-5 text-fuchsia-400" />
                     Operating Machinery
                  </h3>
               </div>
               <div className="flex-1 overflow-auto p-4 space-y-3 relative z-10">
                  {machines.filter(m => m.sectorId === selectedSector.id).map(machine => (
                     <div key={machine.id} className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-fuchsia-500/30 transition-colors flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-base font-semibold text-white">{machine.name}</p>
                              <p className="text-[10px] font-mono mt-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-fuchsia-300 w-fit">{machine.referenceCode}</p>
                           </div>
                           <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                              <Cpu className="w-5 h-5" />
                           </div>
                        </div>
                        <div className="flex gap-4 border-t border-white/5 pt-3 mt-1">
                           <div className="flex flex-col">
                              <span className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-0.5 flex items-center gap-1"><Box className="w-3 h-3"/> Family</span>
                              <span className="text-xs text-white/90">{machine.family}</span>
                           </div>
                           <div className="w-px bg-white/10" />
                           <div className="flex flex-col">
                              <span className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-0.5 flex items-center gap-1"><Tag className="w-3 h-3"/> Template</span>
                              <span className="text-xs text-white/90">{machine.template}</span>
                           </div>
                        </div>
                     </div>
                  ))}
                  {machines.filter(m => m.sectorId === selectedSector.id).length === 0 && (
                     <div className="p-8 text-center text-[var(--text-dim)]">No machines physically mapped to this sector.</div>
                  )}
               </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
