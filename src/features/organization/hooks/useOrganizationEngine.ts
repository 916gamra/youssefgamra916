import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Sector, Technician, Machine } from '@/core/db';
import { z } from 'zod';
import { validatePayload } from '@/core/logger';
import { organizationRepository } from '../repositories/OrganizationRepository';

export interface EnrichedMachine extends Machine {
  sectorName: string;
}

export interface EnrichedTechnician extends Technician {
  sectorName: string;
}

// Validation Schemas
const sectorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  managerName: z.string().optional(),
});

const technicianSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  sectorId: z.string().uuid('Invalid sector ID format'),
  specialty: z.string().optional(),
});

const machineSchema = z.object({
  name: z.string().min(2).max(100),
  sectorId: z.string().uuid(),
  family: z.string().min(1),
  template: z.string().min(1),
  referenceCode: z.string().min(2).regex(/^[A-Z0-9-\s]+$/i, 'Alphanumeric and dashes only'),
});

export function useOrganizationEngine() {
  const sectors = useLiveQuery(() => organizationRepository.getAllSectors());
  const technicians = useLiveQuery(() => organizationRepository.getAllTechnicians());
  const machines = useLiveQuery(() => organizationRepository.getAllMachines());

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

  const createSector = async (name: string, description?: string, managerName?: string) => {
    const validated = validatePayload(sectorSchema, { name, description, managerName }, 'CREATE_SECTOR');
    return organizationRepository.createSector(validated);
  };

  const updateSector = async (id: string, updates: Partial<Sector>) => {
    const validated = validatePayload(sectorSchema.partial(), updates, 'UPDATE_SECTOR');
    return organizationRepository.updateSector(id, validated);
  };

  const deleteSector = async (id: string) => {
    return organizationRepository.deleteSector(id);
  };

  const createTechnician = async (name: string, sectorId: string, specialty?: string) => {
    const validated = validatePayload(technicianSchema, { name, sectorId, specialty }, 'CREATE_TECHNICIAN');
    return organizationRepository.createTechnician(validated);
  };

  const updateTechnician = async (id: string, updates: Partial<Technician>) => {
    const validated = validatePayload(technicianSchema.partial(), updates, 'UPDATE_TECHNICIAN');
    return organizationRepository.updateTechnician(id, validated);
  };

  const deleteTechnician = async (id: string) => {
    return organizationRepository.deleteTechnician(id);
  };

  const createMachine = async (name: string, sectorId: string, family: string, template: string, referenceCode: string) => {
    const payload = { name, sectorId, family, template, referenceCode };
    const validated = validatePayload(machineSchema, payload, 'CREATE_MACHINE');
    return organizationRepository.createMachine(validated);
  };

  const updateMachine = async (id: string, updates: Partial<Machine>) => {
    const validated = validatePayload(machineSchema.partial(), updates, 'UPDATE_MACHINE');
    return organizationRepository.updateMachine(id, validated);
  };

  const deleteMachine = async (id: string) => {
    return organizationRepository.deleteMachine(id);
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
