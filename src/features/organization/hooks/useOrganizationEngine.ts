import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import type { Sector, Technician, Machine } from '@/core/db';

export interface EnrichedMachine extends Machine {
  sectorName: string;
}

export interface EnrichedTechnician extends Technician {
  sectorName: string;
}

export function useOrganizationEngine() {
  const sectors = useLiveQuery(() => db.sectors.toArray());
  const technicians = useLiveQuery(() => db.technicians.toArray());
  const machines = useLiveQuery(() => db.machines.toArray());

  const isLoading = sectors === undefined || technicians === undefined || machines === undefined;

  const enrichedMachines = useMemo((): EnrichedMachine[] => {
    if (!machines || !sectors) return [];
    const sectorMap = new Map<string, string>();
    sectors.forEach(s => sectorMap.set(s.id, s.name));

    return machines.map(m => ({
      ...m,
      sectorName: sectorMap.get(m.sectorId) || 'Unknown Sector'
    }));
  }, [machines, sectors]);

  const enrichedTechnicians = useMemo((): EnrichedTechnician[] => {
    if (!technicians || !sectors) return [];
    const sectorMap = new Map<string, string>();
    sectors.forEach(s => sectorMap.set(s.id, s.name));

    return technicians.map(t => ({
      ...t,
      sectorName: sectorMap.get(t.sectorId) || 'Unknown Sector'
    }));
  }, [technicians, sectors]);

  const createSector = async (name: string, description?: string) => {
    const id = crypto.randomUUID();
    await db.sectors.add({ id, name, description });
    return id;
  };

  const createTechnician = async (name: string, sectorId: string, specialty?: string) => {
    const id = crypto.randomUUID();
    await db.technicians.add({ id, name, sectorId, specialty });
    return id;
  };

  const createMachine = async (name: string, sectorId: string, family: string, template: string, referenceCode: string) => {
    const id = crypto.randomUUID();
    await db.machines.add({ id, name, sectorId, family, template, referenceCode });
    return id;
  };

  const updateSector = async (id: string, updates: Partial<Sector>) => {
    await db.sectors.update(id, updates);
  };

  const deleteSector = async (id: string) => {
    // Check if sector has dependencies (machines or techs)
    const machinesCount = await db.machines.where('sectorId').equals(id).count();
    const techsCount = await db.technicians.where('sectorId').equals(id).count();
    
    if (machinesCount > 0 || techsCount > 0) {
      throw new Error(`Cannot delete sector: It contains ${machinesCount} machines and ${techsCount} technicians.`);
    }
    
    await db.sectors.delete(id);
  };

  const updateTechnician = async (id: string, updates: Partial<Technician>) => {
    await db.technicians.update(id, updates);
  };

  const deleteTechnician = async (id: string) => {
    await db.technicians.delete(id);
  };

  const updateMachine = async (id: string, updates: Partial<Machine>) => {
    await db.machines.update(id, updates);
  };

  const deleteMachine = async (id: string) => {
    await db.machines.delete(id);
  };

  return {
    sectors: sectors || [],
    technicians: enrichedTechnicians,
    machines: enrichedMachines,
    isLoading,
    createSector,
    updateSector,
    deleteSector,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    createMachine,
    updateMachine,
    deleteMachine
  };
}
