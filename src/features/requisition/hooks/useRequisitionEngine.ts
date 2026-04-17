import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import type { Technician, Machine, PdrBlueprint, StockItem } from '@/core/db';

export function useRequisitionEngine() {
  const technicians = useLiveQuery(() => db.technicians.toArray());
  const machines = useLiveQuery(() => db.machines.toArray());
  const blueprints = useLiveQuery(() => db.pdrBlueprints.toArray());
  const inventory = useLiveQuery(() => db.inventory.toArray());

  const isLoading = 
    technicians === undefined || 
    machines === undefined || 
    blueprints === undefined || 
    inventory === undefined;

  const submitRequisition = async (
    technicianId: string, 
    machineId: string, 
    cartLines: Array<{ blueprintId: string, quantity: number }>
  ) => {
    // CRITICAL ACID LOGIC
    await db.transaction(
      'rw', 
      [db.partRequisitions, db.partRequisitionLines, db.inventory, db.movements, db.technicians, db.machines, db.pdrBlueprints],
      async () => {
        const tech = await db.technicians.get(technicianId);
        const machine = await db.machines.get(machineId);
        
        if (!tech || !machine) {
          throw new Error("Technician or Machine not found. Validation failed.");
        }

        const reqId = crypto.randomUUID();
        const date = new Date().toISOString();

        // 1. Create part requisition
        await db.partRequisitions.add({
          id: reqId,
          technicianId,
          machineId,
          status: 'FULFILLED',
          requestDate: date
        });

        // 2. Loop through cart
        for (const line of cartLines) {
          const blueprint = await db.pdrBlueprints.get(line.blueprintId);
          if (!blueprint) {
            throw new Error(`Blueprint ${line.blueprintId} not found.`);
          }

          const invItem = await db.inventory.where('blueprintId').equals(line.blueprintId).first();
          if (!invItem) {
            throw new Error(`Item ${blueprint.reference} has no inventory record.`);
          }

          if (invItem.quantityCurrent < line.quantity) {
            throw new Error(`Stock Insufficient for ${blueprint.reference}. Available: ${invItem.quantityCurrent}, Requested: ${line.quantity}`);
          }

          // 3. Deduct stock
          await db.inventory.update(invItem.id, {
            quantityCurrent: invItem.quantityCurrent - line.quantity,
            updatedAt: date
          });

          // 4. Create Requisition Line
          await db.partRequisitionLines.add({
            id: crypto.randomUUID(),
            requisitionId: reqId,
            blueprintId: line.blueprintId,
            quantity: line.quantity
          });

          // 5. Audit Trail (Movement)
          await db.movements.add({
            id: crypto.randomUUID(),
            stockId: invItem.id,
            type: 'OUT',
            quantity: line.quantity,
            performedBy: tech.name,
            notes: `Requisition (auto-deduct) | Machine: ${machine.name} [${machine.referenceCode}]`,
            timestamp: date
          });
        }
    });
  };

  return {
    technicians: technicians || [],
    machines: machines || [],
    blueprints: blueprints || [],
    inventory: inventory || [],
    isLoading,
    submitRequisition
  };
}
