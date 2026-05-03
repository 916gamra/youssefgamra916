import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Sector, Technician, Machine, MachineFamily, MachineTemplate, MachineBlueprint } from '@/core/db';
import { db } from '@/core/db';
import { z } from 'zod';
import { validatePayload } from '@/core/logger';
import { organizationRepository } from '../repositories/OrganizationRepository';

export interface EnrichedMachine extends Machine {
  sectorName: string;
  managerName?: string;
  blueprintReference: string;
  templateName: string;
  skuBase: string;
  familyName: string;
}

export interface EnrichedTechnician extends Technician {
  sectorName: string;
}

// Validation Schemas
const sectorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  managerName: z.string().optional(),
  preventiveTechId: z.string().optional(),
});

const technicianSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  sectorId: z.string().min(1, 'Sector is required'),
  specialty: z.string().optional(),
});

const machineSchema = z.object({
  name: z.string().min(2).max(100),
  sectorId: z.string().min(1, 'Sector is required'),
  blueprintId: z.string().min(1, 'Blueprint is required'),
  referenceCode: z.string().min(2).regex(/^[A-Z0-9-\s]+$/i, 'Alphanumeric and dashes only'),
});

export function useOrganizationEngine() {
  const sectors = useLiveQuery(() => organizationRepository.getAllSectors());
  const technicians = useLiveQuery(() => organizationRepository.getAllTechnicians());
  const machines = useLiveQuery(() => organizationRepository.getAllMachines());
  
  // Master Data joins
  const blueprints = useLiveQuery(() => db.machineBlueprints.toArray());
  const templates = useLiveQuery(() => db.machineTemplates.toArray());
  const families = useLiveQuery(() => db.machineFamilies.toArray());

  const isLoading = sectors === undefined || technicians === undefined || machines === undefined || 
                    blueprints === undefined || templates === undefined || families === undefined;

  const enrichedMachines = useMemo((): EnrichedMachine[] => {
    if (!machines || !sectors || !blueprints || !templates || !families) return [];
    
    const sectorMap = new Map<string, { name: string, managerName?: string }>();
    sectors.forEach(s => sectorMap.set(s.id, { name: s.name, managerName: s.managerName }));

    const familyMap = new Map(families.map(f => [f.id, f.name]));
    const templateMap = new Map(templates.map(t => [t.id, { name: t.name, familyId: t.familyId, skuBase: t.skuBase }]));
    const blueprintMap = new Map(blueprints.map(b => [b.id, { reference: b.reference, templateId: b.templateId }]));

    return machines.map(m => {
      const sectorInfo = sectorMap.get(m.sectorId);
      const blueprintInfo = blueprintMap.get(m.blueprintId);
      const templateInfo = blueprintInfo ? templateMap.get(blueprintInfo.templateId) : null;
      const familyName = templateInfo ? (familyMap.get(templateInfo.familyId) || 'Unknown Family') : 'Unknown Family';
      
      return {
        ...m,
        sectorName: sectorInfo?.name || 'Unknown Sector',
        managerName: sectorInfo?.managerName,
        blueprintReference: blueprintInfo?.reference || 'Unknown Model',
        templateName: templateInfo?.name || 'Unknown Template',
        skuBase: templateInfo?.skuBase || 'UNKNOWN',
        familyName: familyName
      };
    });
  }, [machines, sectors, blueprints, templates, families]);

  const enrichedTechnicians = useMemo((): EnrichedTechnician[] => {
    if (!technicians || !sectors) return [];
    const sectorMap = new Map<string, string>();
    sectors.forEach(s => sectorMap.set(s.id, s.name));

    return technicians.map(t => ({
      ...t,
      sectorName: sectorMap.get(t.sectorId) || 'Unknown Sector'
    }));
  }, [technicians, sectors]);

  const createSector = async (name: string, description?: string, managerName?: string, preventiveTechId?: string) => {
    const validated = validatePayload(sectorSchema, { name, description, managerName, preventiveTechId }, 'CREATE_SECTOR');
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

  const createMachine = async (name: string, sectorId: string, blueprintId: string, referenceCode: string) => {
    const payload = { name, sectorId, blueprintId, referenceCode };
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
    families: families || [],
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
