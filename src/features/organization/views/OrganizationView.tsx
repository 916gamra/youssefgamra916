import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Building2, Users, Plus, Wrench, ChevronRight, Briefcase } from 'lucide-react';
import { useOrganizationEngine } from '../hooks/useOrganizationEngine';

export function OrganizationView() {
  const { sectors, technicians, createSector, createTechnician } = useOrganizationEngine();
  
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--text-bright)] tracking-tight mb-2">Organization Structure</h1>
          <p className="text-[var(--text-dim)] text-lg">Manage facility sectors and authorized technical personnel.</p>
        </div>
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
      </header>

      {/* Forms Panels (Liquid Glass Modals inline) */}
      <AnimatePresence>
        {isAddingSector && (
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

        {isAddingTech && (
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

      {/* Grid of Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sectors.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-[var(--glass-border)] rounded-2xl bg-white/[0.02]">
            <Building2 className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-[var(--text-bright)] mb-2">No Sectors Defined</h3>
            <p className="text-[var(--text-dim)]">Create your first facility sector to begin organizing technicians and machines.</p>
          </div>
        ) : (
          sectors.map((sector) => {
            const sectorTechs = technicians.filter(t => t.sectorId === sector.id);
            return (
              <GlassCard key={sector.id} className="flex flex-col h-[400px] p-0 overflow-hidden group">
                <div className="p-5 border-b border-[var(--glass-border)] bg-black/20 flex justify-between items-start shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl group-hover:bg-[var(--accent)]/20 transition-colors" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-semibold text-[var(--text-bright)] flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[var(--accent)]" />
                      {sector.name}
                    </h3>
                    {sector.description && (
                      <p className="text-sm text-[var(--text-dim)] mt-1">{sector.description}</p>
                    )}
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-[var(--text-dim)] relative z-10">
                    {sectorTechs.length} Techs
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)] mb-3 flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5" /> Assigned Personnel
                  </h4>
                  {sectorTechs.length === 0 ? (
                    <p className="text-sm text-[var(--text-dim)] italic px-2">No technicians assigned yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {sectorTechs.map(tech => (
                        <div key={tech.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
                              {tech.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[var(--text-bright)]">{tech.name}</div>
                              {tech.specialty && <div className="text-[11px] text-[var(--text-dim)] flex items-center gap-1 mt-0.5"><Briefcase className="w-3 h-3"/> {tech.specialty}</div>}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--text-dim)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
