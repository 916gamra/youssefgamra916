import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, FolderPlus, Layers, Hash } from 'lucide-react';
import { db, type MachineFamily, type MachineTemplate, type MachineOperationType } from '@/core/db';
import { toast } from 'sonner';
import { useAuditTrail } from '@/features/system/hooks/useAuditTrail';

export type ModalType = 'family' | 'template' | 'blueprint' | null;

interface MachineModalsProps {
  activeModal: ModalType;
  onClose: () => void;
  families: MachineFamily[];
  templates: MachineTemplate[];
  user?: any;
}

export function MachineModals({ activeModal, onClose, families, templates, user }: MachineModalsProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logEvent } = useAuditTrail();

  // Auto-generate SKU Base for Templates
  useEffect(() => {
    if (activeModal === 'template' && formData.familyId && formData.type) {
      const family = families.find(f => f.id === formData.familyId);
      if (family) {
        let sku = '';
        if (formData.type === 'S') {
          // Special/Unique: First 3 letters of Family Name
          sku = family.name.substring(0, 3).toUpperCase();
        } else {
          // Functional Keys: Family Code (2 letters) + Type (1 letter)
          sku = `${family.code}${formData.type}`;
        }
        setFormData(prev => ({ ...prev, skuBase: sku }));
      }
    }
  }, [formData.familyId, formData.type, families, activeModal, formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      if (activeModal === 'family') {
        if (!formData.name || !formData.code) throw new Error('Name and Code are required');
        await db.machineFamilies.add({
          id,
          name: formData.name,
          code: formData.code.toUpperCase().substring(0, 2),
          description: formData.description || '',
          technicalDescription: formData.technicalDescription || '',
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'MACHINE_FAMILY',
          entityId: id,
          details: `Created Machine Family: ${formData.name} (${formData.code})`,
          severity: 'INFO'
        });
        toast.success('Machine Family created');
      } else if (activeModal === 'template') {
        if (!formData.name || !formData.familyId || !formData.skuBase || !formData.type) throw new Error('Missing required fields');
        await db.machineTemplates.add({
          id,
          familyId: formData.familyId,
          name: formData.name,
          type: formData.type as MachineOperationType,
          skuBase: formData.skuBase,
          description: formData.description || '',
          technicalDescription: formData.technicalDescription || '',
          createdAt,
        });
        await logEvent({
          userId: user?.id || 'GUEST',
          userName: user?.name || 'Guest User',
          action: 'CREATE',
          entityType: 'MACHINE_TEMPLATE',
          entityId: id,
          details: `Created Machine Template: ${formData.name} Type: ${formData.type}`,
          severity: 'INFO'
        });
        toast.success('Machine Template created');
      } else if (activeModal === 'blueprint') {
        if (!formData.templateId || !formData.reference) throw new Error('Missing required fields');
        await db.machineBlueprints.add({
          id,
          templateId: formData.templateId,
          reference: formData.reference,
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="titan-label">Family Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="titan-input"
                      placeholder="e.g., Satinage, Press"
                    />
                  </div>
                  <div>
                    <label className="titan-label">Code</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      value={formData.code || ''}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="titan-input font-mono uppercase text-center"
                      placeholder="ST"
                    />
                  </div>
                </div>
                <div>
                  <label className="titan-label">Industrial/Mechanical Definition</label>
                  <textarea
                    value={formData.technicalDescription || ''}
                    onChange={e => setFormData({ ...formData, technicalDescription: e.target.value })}
                    className="titan-input h-20 resize-none"
                    placeholder="Physical process (e.g., removal of material via rotation)..."
                  />
                </div>
                <div>
                  <label className="titan-label">Internal Notes</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="titan-input h-20 resize-none"
                    placeholder="Logistical hints or site-specific notes..."
                  />
                </div>
              </>
            )}

            {activeModal === 'template' && (
              <>
                <div className="grid grid-cols-2 gap-4">
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
                        <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="titan-label">Operation Type</label>
                    <select
                      required
                      value={formData.type || ''}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="titan-input appearance-none"
                    >
                      <option value="" disabled>Select Type (Priority Logic Applied)...</option>
                      <option value="A">A - Automatic (CNC/PLC Controlled)</option>
                      <option value="I">I - Injection (Plastic/Metal Molding)</option>
                      <option value="H">H - Hydraulic (Fluid Power)</option>
                      <option value="P">P - Pneumatic (Compressed Air)</option>
                      <option value="E">E - Electric (Electromechanical)</option>
                      <option value="M">M - Manual (Pure Mechanical)</option>
                      <option value="S">S - Special/Unique (Tri-Char ID)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="titan-label">Template Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="titan-input"
                      placeholder="e.g., Standard Satinage"
                    />
                  </div>
                  <div>
                    <label className="titan-label">SKU Genetic Base</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={formData.skuBase || ''}
                      onChange={e => setFormData({ ...formData, skuBase: e.target.value.toUpperCase() })}
                      className="titan-input font-mono uppercase text-center border-indigo-500/30"
                      placeholder="e.g., TRP, STA"
                    />
                    <p className="text-[9px] text-indigo-400 mt-1 uppercase tracking-tighter opacity-70">Overridable Functional Code</p>
                  </div>
                </div>
                <div>
                  <label className="titan-label">Functional Mechanical Identity</label>
                  <textarea
                    rows={2}
                    value={formData.technicalDescription || ''}
                    onChange={e => setFormData({ ...formData, technicalDescription: e.target.value })}
                    className="titan-input resize-none"
                    placeholder="Specific mechanical purpose of this template..."
                  />
                </div>
                <div className="hidden">
                  <label className="titan-label">Notes</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="titan-input resize-none"
                  />
                </div>
              </>
            )}

            {activeModal === 'blueprint' && (
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
                  <label className="titan-label">Catalog Reference / Version ID</label>
                  <input
                    type="text"
                    required
                    value={formData.reference || ''}
                    onChange={e => setFormData({ ...formData, reference: e.target.value })}
                    className="titan-input font-mono"
                    placeholder="e.g., STM1-00-V1"
                  />
                </div>
              </>
            )}

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
                className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-[#050508] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
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
