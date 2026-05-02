import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, FolderPlus, Layers, Hash } from 'lucide-react';
import { db } from '@/core/db';
import { toast } from 'sonner';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';

export type ModalType = 'family' | 'template' | 'blueprint' | null;

interface MachineModalsProps {
  activeModal: ModalType;
  onClose: () => void;
  families: any[];
  templates: any[];
  user?: any;
}

export function MachineModals({ activeModal, onClose, families, templates, user }: MachineModalsProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logEvent } = useAuditTrail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      if (activeModal === 'family') {
        if (!formData.name) throw new Error('Family name is required');
        await db.machineFamilies.add({
          id,
          name: formData.name,
          description: formData.description || '',
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'MACHINE_FAMILY',
          entityId: id,
          details: `Created Machine Family: ${formData.name}`,
          severity: 'INFO'
        });
        toast.success('Machine Family created');
      } else if (activeModal === 'template') {
        if (!formData.name || !formData.familyId || !formData.skuBase) throw new Error('Missing required fields');
        await db.machineTemplates.add({
          id,
          familyId: formData.familyId,
          name: formData.name,
          skuBase: formData.skuBase,
          description: formData.description || '',
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'MACHINE_TEMPLATE',
          entityId: id,
          details: `Created Machine Template: ${formData.name}`,
          severity: 'INFO'
        });
        toast.success('Machine Template created');
      } else if (activeModal === 'blueprint') {
        if (!formData.templateId || !formData.reference || !formData.unit) throw new Error('Missing required fields');
        await db.machineBlueprints.add({
          id,
          templateId: formData.templateId,
          reference: formData.reference,
          unit: formData.unit,
          minThreshold: Number(formData.minThreshold) || 0,
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'MACHINE_BLUEPRINT',
          entityId: id,
          details: `Created Machine Blueprint: ${formData.reference}`,
          severity: 'INFO'
        });
        toast.success('Machine Blueprint created');
      }

      setFormData({});
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md glass-panel-heavy rounded-3xl overflow-hidden"
        >
          {/* Top Glare Edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {activeModal === 'family' && <><FolderPlus className="w-5 h-5 text-indigo-400" /> New Family</>}
              {activeModal === 'template' && <><Layers className="w-5 h-5 text-indigo-400" /> New Template</>}
              {activeModal === 'blueprint' && <><Hash className="w-5 h-5 text-indigo-400" /> New Blueprint</>}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {activeModal === 'family' && (
              <>
                <div>
                  <label className="titan-label">Family Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="titan-input"
                    placeholder="e.g., Bearings, Motors"
                  />
                </div>
                <div>
                  <label className="titan-label">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="titan-input h-24 resize-none"
                    placeholder="Optional description..."
                  />
                </div>
              </>
            )}

            {activeModal === 'template' && (
              <>
                <div>
                  <label className="titan-label">Parent Family</label>
                  <select
                    required
                    value={formData.familyId || ''}
                    onChange={e => setFormData({ ...formData, familyId: e.target.value })}
                    className="titan-input appearance-none"
                  >
                    <option value="" disabled>Select Family...</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="titan-label">Template Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="titan-input"
                    placeholder="e.g., Roller Bearings"
                  />
                </div>
                <div>
                  <label className="titan-label">SKU Base</label>
                  <input
                    type="text"
                    required
                    value={formData.skuBase || ''}
                    onChange={e => setFormData({ ...formData, skuBase: e.target.value })}
                    className="titan-input font-mono"
                    placeholder="e.g., RLM-6200"
                  />
                </div>
              </>
            )}

            {activeModal === 'blueprint' && (() => {
              const selectedTemplate = templates.find(t => t.id === formData.templateId);
              const templateNameLower = (selectedTemplate?.name || '').toLowerCase();
              
              const isMotor = templateNameLower.includes('motor') || templateNameLower.includes('engine');
              const isCable = templateNameLower.includes('cable') || templateNameLower.includes('wire');
              const isBearing = templateNameLower.includes('bearing');
              const isPump = templateNameLower.includes('pump');

              return (
              <>
                <div>
                  <label className="titan-label">Parent Template</label>
                  <select
                    required
                    value={formData.templateId || ''}
                    onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                    className="titan-input appearance-none"
                  >
                    <option value="" disabled>Select Template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.skuBase})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="titan-label">Reference / Part No.</label>
                  <input
                    type="text"
                    required
                    value={formData.reference || ''}
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                    className="titan-input font-mono"
                    placeholder="e.g., 6205-2RS"
                  />
                </div>

                {/* DYNAMIC TEMPLATE FIELDS */}
                <AnimatePresence>
                  {selectedTemplate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2 pb-2">
                       <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Template Requirements: {selectedTemplate.name}</span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         {isMotor && (
                           <>
                             <div>
                               <label className="titan-label">Power (kW/HP)</label>
                               <input type="text" className="titan-input text-xs" placeholder="e.g., 15kW" />
                             </div>
                             <div>
                               <label className="titan-label">Voltage (V)</label>
                               <input type="text" className="titan-input text-xs" placeholder="e.g., 400V 3Ph" />
                             </div>
                           </>
                         )}
                         {isCable && (
                           <>
                             <div>
                               <label className="titan-label">Length (m)</label>
                               <input type="number" className="titan-input text-xs" placeholder="e.g., 100" />
                             </div>
                             <div>
                               <label className="titan-label">Gauge / Section</label>
                               <input type="text" className="titan-input text-xs" placeholder="e.g., 3x2.5mm²" />
                             </div>
                           </>
                         )}
                         {isBearing && (
                           <>
                             <div>
                               <label className="titan-label">Inner Diameter (mm)</label>
                               <input type="number" className="titan-input text-xs" placeholder="e.g., 25" />
                             </div>
                             <div>
                               <label className="titan-label">Outer Diameter (mm)</label>
                               <input type="number" className="titan-input text-xs" placeholder="e.g., 52" />
                             </div>
                           </>
                         )}
                         {isPump && (
                           <>
                             <div>
                               <label className="titan-label">Flow Rate (m³/h)</label>
                               <input type="text" className="titan-input text-xs" placeholder="e.g., 50 m³/h" />
                             </div>
                             <div>
                               <label className="titan-label">Max Head (m)</label>
                               <input type="text" className="titan-input text-xs" placeholder="e.g., 30m" />
                             </div>
                           </>
                         )}
                         {(!isMotor && !isCable && !isBearing && !isPump) && (
                           <>
                             <div className="col-span-2">
                               <label className="titan-label">Custom Specification</label>
                               <input type="text" className="titan-input text-xs" placeholder="Key = Value (e.g., Material = SUS304)" />
                             </div>
                           </>
                         )}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="titan-label">Unit</label>
                    <select
                      required
                      value={formData.unit || ''}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                      className="titan-input appearance-none"
                    >
                      <option value="" disabled>Select...</option>
                      <option value="Pcs">Pieces (Pcs)</option>
                      <option value="Kg">Kilograms (Kg)</option>
                      <option value="L">Liters (L)</option>
                      <option value="M">Meters (M)</option>
                      <option value="Set">Set</option>
                    </select>
                  </div>
                  <div>
                    <label className="titan-label">Min Threshold</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.minThreshold || ''}
                      onChange={e => setFormData({ ...formData, minThreshold: e.target.value })}
                      className="titan-input font-mono"
                      placeholder="0"
                    />
                  </div>
                </div>
              </>
            )})}

            <div className="pt-4 mt-6 border-t border-white/5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-[#050508] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Saving...' : 'Deploy Data'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
