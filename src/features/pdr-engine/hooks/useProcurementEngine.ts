import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import type { PurchaseOrder, PurchaseOrderLine, PdrBlueprint } from '@/core/db';

export interface EnrichedPurchaseOrderLine extends PurchaseOrderLine {
  blueprintReference: string;
}

export interface EnrichedPurchaseOrder extends PurchaseOrder {
  lines: EnrichedPurchaseOrderLine[];
  totalAmount: number;
}

export function useProcurementEngine() {
  const purchaseOrders = useLiveQuery(() => db.purchaseOrders.orderBy('orderDate').reverse().toArray());
  const purchaseOrderLines = useLiveQuery(() => db.purchaseOrderLines.toArray());
  const blueprints = useLiveQuery(() => db.pdrBlueprints.toArray());

  const isLoading = purchaseOrders === undefined || purchaseOrderLines === undefined || blueprints === undefined;

  const enrichedOrders = useMemo((): EnrichedPurchaseOrder[] => {
    if (!purchaseOrders || !purchaseOrderLines || !blueprints) return [];

    // Map for fast blueprint lookups
    const blueprintMap = new Map<string, PdrBlueprint>();
    blueprints.forEach(b => blueprintMap.set(b.id, b));

    // Group lines by orderId
    const linesByOrderId = new Map<string, EnrichedPurchaseOrderLine[]>();
    purchaseOrderLines.forEach(line => {
      const blueprint = blueprintMap.get(line.blueprintId);
      const enrichedLine: EnrichedPurchaseOrderLine = {
        ...line,
        blueprintReference: blueprint?.reference || 'Unknown Reference'
      };

      const existingLines = linesByOrderId.get(line.orderId) || [];
      existingLines.push(enrichedLine);
      linesByOrderId.set(line.orderId, existingLines);
    });

    // Enrich orders
    return purchaseOrders.map(order => {
      const lines = linesByOrderId.get(order.id) || [];
      const totalAmount = lines.reduce((sum, line) => sum + (line.quantity * (line.unitPrice || 0)), 0);

      return {
        ...order,
        lines,
        totalAmount
      };
    });
  }, [purchaseOrders, purchaseOrderLines, blueprints]);

  const createDraftOrder = async (supplierName: string, linesData: Array<{ blueprintId: string, quantity: number, unitPrice?: number }>) => {
    const orderId = crypto.randomUUID();
    const orderDate = new Date().toISOString();

    await db.transaction('rw', db.purchaseOrders, db.purchaseOrderLines, async () => {
      await db.purchaseOrders.add({
        id: orderId,
        supplierName,
        status: 'DRAFT',
        orderDate,
        createdAt: orderDate
      });

      const linesToInsert: PurchaseOrderLine[] = linesData.map(line => ({
        id: crypto.randomUUID(),
        orderId,
        blueprintId: line.blueprintId,
        quantity: line.quantity,
        unitPrice: line.unitPrice || 0
      }));

      await db.purchaseOrderLines.bulkAdd(linesToInsert);
    });
  };

  const confirmOrder = async (orderId: string) => {
    await db.purchaseOrders.update(orderId, { status: 'ORDERED' });
  };

  const receiveOrder = async (orderId: string, performedBy: string = 'Procurement Auto-Fulfillment') => {
    await db.transaction('rw', db.purchaseOrders, db.purchaseOrderLines, db.inventory, db.movements, async () => {
      const order = await db.purchaseOrders.get(orderId);
      if (!order) throw new Error('Order not found');
      if (order.status === 'DELIVERED') throw new Error('Order already delivered');

      const lines = await db.purchaseOrderLines.where('orderId').equals(orderId).toArray();

      for (const line of lines) {
        let invItem = await db.inventory.where('blueprintId').equals(line.blueprintId).first();
        let stockId = invItem?.id;

        if (!invItem) {
          stockId = crypto.randomUUID();
          await db.inventory.add({
            id: stockId,
            blueprintId: line.blueprintId,
            warehouseId: 'WH-MAIN',
            quantityCurrent: line.quantity,
            updatedAt: new Date().toISOString()
          });
        } else {
          await db.inventory.update(invItem.id, {
            quantityCurrent: invItem.quantityCurrent + line.quantity,
            updatedAt: new Date().toISOString()
          });
        }

        await db.movements.add({
          id: crypto.randomUUID(),
          stockId: stockId!,
          type: 'IN',
          quantity: line.quantity,
          performedBy,
          notes: `Received from PO #${orderId.substring(0, 8)}`,
          timestamp: new Date().toISOString()
        });
      }

      await db.purchaseOrders.update(orderId, { status: 'DELIVERED' });
    });
  };

  return {
    orders: enrichedOrders,
    isLoading,
    createDraftOrder,
    confirmOrder,
    receiveOrder
  };
}
