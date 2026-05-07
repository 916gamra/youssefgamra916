import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, FolderPlus, Layers, Hash } from 'lucide-react';
import { db } from '@/core/db';
import { getBlueprintMatrixForTemplate, MAX_BLUEPRINTS_PER_TEMPLATE, MatrixSlot } from '@/core/config/blueprintMatrix';
import { toast } from 'sonner';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';

export type ModalType = 'family' | 'template' | 'blueprint' | null;

interface PdrModalsProps {
  activeModal: ModalType;
  onClose: () => void;
  families: any[];
  templates: any[];
  blueprints?: any[];
  user?: any;
}

export function PdrModals({ activeModal, onClose, families, templates, blueprints = [], user }: PdrModalsProps) {
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
        await db.pdrFamilies.add({
          id,
          name: formData.name,
          description: formData.description || '',
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'PDR_FAMILY',
          entityId: id,
          details: `Created PDR Family: ${formData.name}`,
          severity: 'INFO'
        });
        toast.success('PDR Family created');
      } else if (activeModal === 'template') {
        if (!formData.name || !formData.familyId || !formData.skuBase) throw new Error('Missing required fields');
        await db.pdrTemplates.add({
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
          entityType: 'PDR_TEMPLATE',
          entityId: id,
          details: `Created PDR Template: ${formData.name}`,
          severity: 'INFO'
        });
        toast.success('PDR Template created');
      } else if (activeModal === 'blueprint') {
        if (!formData.templateId || !formData.reference || !formData.unit) throw new Error('Missing required fields');
        if (!formData.model || !formData.powerOrForce || !formData.technicalSpecs) throw new Error('Model, Power/Force and Technical Specifications are mandatory for Blueprints.');

        await db.pdrBlueprints.add({
          id: formData.id, // Pre-defined ID from the matrix
          templateId: formData.templateId,
          reference: formData.reference,
          unit: formData.unit,
          minThreshold: Number(formData.minThreshold) || 0,
          model: formData.model,
          powerOrForce: formData.powerOrForce,
          technicalSpecs: formData.technicalSpecs,
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'PDR_BLUEPRINT',
          entityId: formData.id,
          details: `Activated PDR Blueprint: ${formData.reference}`,
          severity: 'INFO'
        });
        toast.success('PDR Blueprint activated');
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
              {activeModal === 'family' && <><FolderPlus className="w-5 h-5 text-cyan-400" /> New Family</>}
              {activeModal === 'template' && <><Layers className="w-5 h-5 text-cyan-400" /> New Template</>}
              {activeModal === 'blueprint' && <><Hash className="w-5 h-5 text-cyan-400" /> New Blueprint</>}
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
              let activeSlot: MatrixSlot | undefined;
              let isMaxCapacity = false;
              let availableCount = 0;
              
              if (selectedTemplate) {
                const existingBlueprintsCount = blueprints.filter(b => b.templateId === selectedTemplate.id).length;
                const matrixSlots = getBlueprintMatrixForTemplate(selectedTemplate.id, selectedTemplate.skuBase);
                activeSlot = matrixSlots[existingBlueprintsCount];
                isMaxCapacity = existingBlueprintsCount >= MAX_BLUEPRINTS_PER_TEMPLATE;
                availableCount = existingBlueprintsCount + 1;
              }

              // Update formData automatically when selectedTemplate changes or we got a new active slot
              // We do this via standard React pattern by applying it effectively on submit
              // But we can also set the display values directly
              const displayReference = activeSlot ? activeSlot.reference : '';
              
              return (
              <>
                <div>
                  <label className="titan-label">Parent Template</label>
                  <select
                    required
                    value={formData.templateId || ''}
                    onChange={e => {
                      const newTemplateId = e.target.value;
                      const template = templates.find(t => t.id === newTemplateId);
                      if (template) {
                        const existing = blueprints.filter(b => b.templateId === newTemplateId).length;
                        const slots = getBlueprintMatrixForTemplate(template.id, template.skuBase);
                        const slot = slots[existing];
                        setFormData({ 
                          ...formData, 
                          templateId: newTemplateId, 
                          reference: slot ? slot.reference : '', 
                          id: slot ? slot.id : '' 
                        });
                      }
                    }}
                    className="titan-input appearance-none"
                  >
                    <option value="" disabled>Select Template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.skuBase})</option>
                    ))}
                  </select>
                </div>

                {isMaxCapacity && selectedTemplate && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 font-bold text-sm">MAX CAPACITY REACHED</p>
                    <p className="text-red-400/80 text-xs mt-1">This template has reached its maximum configuration slots ({MAX_BLUEPRINTS_PER_TEMPLATE}/{MAX_BLUEPRINTS_PER_TEMPLATE}).</p>
                  </div>
                )}

                {selectedTemplate && !isMaxCapacity && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="titan-label !mb-0">Reference / Model Designation</label>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Slot {availableCount} of {MAX_BLUEPRINTS_PER_TEMPLATE} Available</span>
                      </div>
                      <input
                        type="text"
                        disabled
                        value={displayReference}
                        className="titan-input font-mono opacity-60 bg-black/50 border-white/5 cursor-not-allowed text-cyan-400 font-bold"
                      />
                    </div>

                    {/* DYNAMIC TEMPLATE FIELDS FOR THE STATIC SLOT */}
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2 pb-2">
                         <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Pre-Configuration: V{availableCount}</span>
                         </div>
                         
                         <div className="grid grid-cols-1 gap-4">
                           <div>
                             <label className="titan-label">Model Designation</label>
                             <input type="text" required value={formData.model || ''} onChange={e => setFormData({ ...formData, model: e.target.value })} className="titan-input text-xs" placeholder="e.g., Heavy Duty X1" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="titan-label">Power / Force / Size</label>
                               <input type="text" required value={formData.powerOrForce || ''} onChange={e => setFormData({ ...formData, powerOrForce: e.target.value })} className="titan-input text-xs" placeholder="e.g., 15kW, 400T" />
                             </div>
                             <div>
                               <label className="titan-label">Technical Specs</label>
                               <input type="text" required value={formData.technicalSpecs || ''} onChange={e => setFormData({ ...formData, technicalSpecs: e.target.value })} className="titan-input text-xs" placeholder="e.g., 400V 3Ph 50Hz" />
                             </div>
                           </div>
                         </div>
                      </motion.div>
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
                )}
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
                disabled={isSubmitting || (activeModal === 'blueprint' && formData.templateId && blueprints.filter(b => b.templateId === formData.templateId).length >= MAX_BLUEPRINTS_PER_TEMPLATE)}
                className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-[#050508] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
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
