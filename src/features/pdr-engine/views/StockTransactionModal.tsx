import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownRight, ArrowUpRight, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import { useStockTransaction } from '../hooks/useStockTransaction';
import type { EnrichedStockItem } from '../hooks/useStockEngine';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: EnrichedStockItem[];
  preselectedStockId?: string;
}

export function StockTransactionModal({
  isOpen,
  onClose,
  inventory,
  preselectedStockId
}: StockTransactionModalProps) {
  const [stockId, setStockId] = useState<string>('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<string>('');
  const [performedBy, setPerformedBy] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { executeTransaction, isProcessing, error, clearError } = useStockTransaction();

  useEffect(() => {
    if (isOpen) {
      setStockId(preselectedStockId || (inventory.length > 0 ? inventory[0].id : ''));
      setType('IN');
      setQuantity('');
      setPerformedBy('');
      setSuccessMsg(null);
      clearError();
    }
  }, [isOpen, preselectedStockId, inventory, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg(null);

    const qty = parseFloat(quantity);
    if (isNaN(qty)) return;

    const success = await executeTransaction(stockId, type, qty, performedBy);
    if (success) {
      setSuccessMsg(`Transaction successful: ${type} ${qty} for selected item.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const selectedItem = inventory.find(i => i.id === stockId);

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
                    className="w-full max-w-md bg-transparent/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-cyan-500" />
                          New Stock Movement
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </Dialog.Close>
                      </div>

                      {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>{error}</p>
                        </div>
                      )}

                      {successMsg && (
                        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>{successMsg}</p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Selected Item */}
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-semibold tracking-wider text-slate-400">Target Item</label>
                          <select
                            value={stockId}
                            onChange={(e) => setStockId(e.target.value)}
                            disabled={isProcessing}
                            className="titan-input py-2.5 appearance-none disabled:opacity-50"
                          >
                            <option value="" disabled className="bg-[#0a0f18]">Select an item...</option>
                            {inventory.map(item => (
                              <option key={item.id} value={item.id} className="bg-[#0a0f18]">
                                {item.blueprintReference} (Warehouse {item.warehouseId}) • Avail: {item.quantityCurrent}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Transaction Type */}
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase font-semibold tracking-wider text-slate-400">Movement Type</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setType('IN')}
                              disabled={isProcessing}
                              className={cn(
                                "flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all font-medium text-sm disabled:opacity-50",
                                type === 'IN' 
                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                                  : "bg-black/30 border-white/10 text-slate-400 hover:bg-white/5"
                              )}
                            >
                              <ArrowDownRight className="w-4 h-4" /> Entrée (IN)
                            </button>
                            <button
                              type="button"
                              onClick={() => setType('OUT')}
                              disabled={isProcessing}
                              className={cn(
                                "flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all font-medium text-sm disabled:opacity-50",
                                type === 'OUT' 
                                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                                  : "bg-black/30 border-white/10 text-slate-400 hover:bg-white/5"
                              )}
                            >
                              <ArrowUpRight className="w-4 h-4" /> Sortie (OUT)
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Quantity */}
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center justify-between">
                              <span>Quantity</span>
                              {selectedItem && <span className="text-[10px] text-cyan-500">Avail: {selectedItem.quantityCurrent} {selectedItem.unit}</span>}
                            </label>
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              required
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              disabled={isProcessing}
                              placeholder="0.00"
                              className="titan-input py-2.5 disabled:opacity-50"
                            />
                          </div>

                          {/* Performed By */}
                          <div className="space-y-1.5">
                            <label className="text-xs uppercase font-semibold tracking-wider text-slate-400">Technician</label>
                            <input
                              type="text"
                              required
                              value={performedBy}
                              onChange={(e) => setPerformedBy(e.target.value)}
                              disabled={isProcessing}
                              placeholder="Name / ID"
                              className="titan-input py-2.5 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="titan-button titan-button-outline disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isProcessing || !stockId || !quantity || !performedBy}
                            className={cn(
                              "titan-button disabled:opacity-50 disabled:cursor-not-allowed",
                              type === 'IN'
                                ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-black"
                                : "bg-amber-500 hover:bg-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-black"
                            )}
                          >
                            {isProcessing ? (
                              <>
                                <Activity className="w-4 h-4 animate-pulse" />
                                Processing...
                              </>
                            ) : (
                              <>Confirm {type}</>
                            )}
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
