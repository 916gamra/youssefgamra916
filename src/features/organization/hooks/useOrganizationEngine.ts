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

  return {
    sectors: sectors || [],
    technicians: enrichedTechnicians,
    machines: enrichedMachines,
    isLoading,
    createSector,
    createTechnician,
    createMachine
  };
}
