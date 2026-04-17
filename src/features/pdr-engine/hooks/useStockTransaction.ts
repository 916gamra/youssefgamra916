import { useState } from 'react';
import { db } from '@/core/db';

export function useStockTransaction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = async (
    stockId: string,
    type: 'IN' | 'OUT',
    quantity: number,
    performedBy: string
  ): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);
    try {
      if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero.');
      }
      if (!stockId) {
        throw new Error('No stock item selected.');
      }
      if (!performedBy.trim()) {
        throw new Error('Technician name is required.');
      }

      await db.transaction('rw', [db.inventory, db.movements], async () => {
        const item = await db.inventory.get(stockId);
        if (!item) throw new Error('Stock item not found in database.');

        if (type === 'OUT' && item.quantityCurrent < quantity) {
          throw new Error('Insufficient stock for this withdrawal. Available: ' + item.quantityCurrent);
        }

        const newQuantity =
          type === 'IN'
            ? item.quantityCurrent + quantity
            : item.quantityCurrent - quantity;

        // Update the inventory record
        await db.inventory.update(stockId, {
          quantityCurrent: newQuantity,
          updatedAt: new Date().toISOString(),
        });

        // Log the movement
        await db.movements.add({
          id: crypto.randomUUID(),
          stockId,
          type,
          quantity,
          performedBy,
          timestamp: new Date().toISOString(),
        });
      });

      return true;
    } catch (err: any) {
      setError(err?.message || 'Transaction failed.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    executeTransaction,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
}
