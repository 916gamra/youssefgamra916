import { PdrFamily, PdrTemplate, PdrBlueprint, Sector, Machine, MachineFamily, MachineTemplate, MachineBlueprint, Technician, User } from '../db';

const now = new Date().toISOString();

// PDR Master Data
// PDR Master Data
export const SEED_PDR_FAMILIES: PdrFamily[] = [
  { id: 'fam-CO', name: 'COURROIES', description: 'Power transmission belts', createdAt: now },
  { id: 'fam-RO', name: 'ROULEMENTS', description: 'SKF Standard bearings', createdAt: now },
  { id: 'fam-VI', name: 'VISSERIE', description: 'ISO Standard screws and bolts', createdAt: now }
];

export const SEED_SECTORS: Sector[] = Array.from({ length: 15 }, (_, i) => {
  const num = (i + 1).toString().padStart(2, '0');
  return {
    id: `SEC-${num}`,
    name: `Sector ${num}`,
    managerName: '',
    description: '',
    status: 'Dormant' as const
  };
});

export const SEED_TECHNICIANS: Technician[] = [];

export const SEED_USERS: User[] = [
];

export const SEED_MACHINES: Machine[] = [];

export const SEED_TEMPLATES: PdrTemplate[] = [
  // COURROIES
  { id: 'temp-CO-A', familyId: 'fam-CO', name: 'Courroie Type A', skuBase: 'CO-A', createdAt: now },
  { id: 'temp-CO-B', familyId: 'fam-CO', name: 'Courroie Type B', skuBase: 'CO-B', createdAt: now },
  { id: 'temp-CO-SPZ', familyId: 'fam-CO', name: 'Courroie Type SPZ', skuBase: 'CO-SPZ', createdAt: now },
  // ROULEMENTS
  { id: 'temp-RO-B', familyId: 'fam-RO', name: 'Roulement Standard Ball 6xxx', skuBase: 'RO-B', createdAt: now },
  { id: 'temp-RO-C', familyId: 'fam-RO', name: 'Roulement Conical 3xxxx', skuBase: 'RO-C', createdAt: now },
  { id: 'temp-RO-T', familyId: 'fam-RO', name: 'Roulement Thrust 5xxxx', skuBase: 'RO-T', createdAt: now },
  // VISSERIE
  { id: 'temp-VI-BTR', familyId: 'fam-VI', name: 'Vis Allen/BTR', skuBase: 'VI-BTR', createdAt: now },
  { id: 'temp-VI-HEX', familyId: 'fam-VI', name: 'Vis Hexagonale', skuBase: 'VI-HEX', createdAt: now },
  { id: 'temp-VI-SST', familyId: 'fam-VI', name: 'Vis Sans Tête', skuBase: 'VI-SST', createdAt: now },
];

export const SEED_BLUEPRINTS: PdrBlueprint[] = [
  // Keeping this empty as instructed: "Do not link any spare parts or preventive schedules yet."
];

// Machine Genetic Data
export const SEED_MACHINE_FAMILIES: MachineFamily[] = [];
export const SEED_MACHINE_TEMPLATES: MachineTemplate[] = [];

export const SEED_MACHINE_BLUEPRINTS: MachineBlueprint[] = [];

export const INITIAL_DATA = {
  pdrFamilies: SEED_PDR_FAMILIES,
  sectors: SEED_SECTORS,
  machines: SEED_MACHINES,
  pdrTemplates: SEED_TEMPLATES,
  pdrBlueprints: SEED_BLUEPRINTS,
  machineFamilies: SEED_MACHINE_FAMILIES,
  machineTemplates: SEED_MACHINE_TEMPLATES,
  machineBlueprints: SEED_MACHINE_BLUEPRINTS,
  technicians: SEED_TECHNICIANS,
  users: SEED_USERS,
};
