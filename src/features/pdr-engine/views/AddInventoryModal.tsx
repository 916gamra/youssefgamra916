import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { X, PackagePlus, AlertTriangle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { cn } from '@/shared/utils';

export function AddInventoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const blueprints = useLiveQuery(() => db.pdrBlueprints.toArray());
  const templates = useLiveQuery(() => db.pdrTemplates.toArray());

  const [blueprintId, setBlueprintId] = useState('');
  const [warehouseId, setWarehouseId] = useState('MAIN_WH');
  const [locationDetails, setLocationDetails] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBlueprintId('');
      setWarehouseId('MAIN_WH');
      setLocationDetails('');
      setQuantity('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!blueprintId) {
      setError("Please select a blueprint.");
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      setError("Valid quantity is required.");
      return;
    }

    try {
      // Check if already exists in that warehouse
      const existing = await db.inventory.where({ blueprintId, warehouseId }).first();
      if (existing) {
        setError(`This blueprint is already tracked in ${warehouseId}. Use 'New Movement' to add stock.`);
        return;
      }

      await db.inventory.add({
        id: crypto.randomUUID(),
        blueprintId,
        warehouseId,
        quantityCurrent: qty,
        locationDetails,
        updatedAt: new Date().toISOString()
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    className="w-full max-w-md bg-[var(--bg-base)]/95 backdrop-blur-3xl border border-[var(--glass-border)] shadow-2xl rounded-2xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold text-[var(--text-bright)] flex items-center gap-2">
                          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                             <PackagePlus className="w-5 h-5" />
                          </div>
                          Track New Blueprint
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button className="p-1.5 rounded-md hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </Dialog.Close>
                      </div>

                      {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                           <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Select Blueprint from Catalog</label>
                           <select required value={blueprintId} onChange={e => setBlueprintId(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                              <option value="">-- Master Catalog --</option>
                              {blueprints?.map(bp => {
                                const t = templates?.find(t => t.id === bp.templateId);
                                return (
                                  <option key={bp.id} value={bp.id}>
                                    {bp.reference} {t ? `(${t.skuBase})` : ''} - {bp.unit}
                                  </option>
                                );
                              })}
                           </select>
                        </div>

                        <div>
                           <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Warehouse / Area</label>
                           <input required value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g. WH-A1" />
                        </div>

                        <div>
                           <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Physical Location (Aisle/Shelf)</label>
                           <input value={locationDetails} onChange={e => setLocationDetails(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g. Aisle 4, Shelf B-12" />
                        </div>

                        <div>
                           <label className="block text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1">Initial Quantity Found</label>
                           <input type="number" step="any" min="0" required value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50" placeholder="0.00" />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                           <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--glass-border)] text-[var(--text-dim)] hover:text-white hover:bg-white/5 transition-all text-sm font-medium">Cancel</button>
                           <button type="submit" className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all font-semibold text-sm flex items-center gap-2">
                              <PackagePlus className="w-4 h-4" /> Start Tracking
                           </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
