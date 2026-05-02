import { PdrFamily, PdrTemplate, PdrBlueprint, Sector, Machine } from '../db';

const now = new Date().toISOString();

export const SEED_FAMILIES: PdrFamily[] = [
  { id: 'fam-bearings', name: 'Bearings', description: 'Roller, ball, and thrust bearings', createdAt: now },
  { id: 'fam-belts', name: 'Belts', description: 'V-belts, timing belts, and flat belts', createdAt: now },
  { id: 'fam-sensors', name: 'Sensors', description: 'Proximity, temperature, and pressure sensors', createdAt: now },
  { id: 'fam-filters', name: 'Filters', description: 'Air, oil, and water filters', createdAt: now },
  { id: 'fam-pneumatics', name: 'Pneumatics', description: 'Cylinders, valves, and fittings', createdAt: now },
];

export const SEED_SECTORS: Sector[] = [
  { id: 'sec-emboutissage', name: 'Emboutissage', managerName: 'Mohammed Zaradi', description: 'Deep Drawing and Metal Forming Section - Core Production.' },
];

export const SEED_MACHINES: Machine[] = [
  { id: 'mach-mech-press-2013', name: 'Mechanical Press V2013', sectorId: 'sec-emboutissage', family: 'Heavy Machinery', template: 'Mechanical Press Template', referenceCode: 'MP-2013-01' },
  { id: 'mach-mech-press-2015', name: 'Mechanical Press V2015', sectorId: 'sec-emboutissage', family: 'Heavy Machinery', template: 'Mechanical Press Template', referenceCode: 'MP-2015-02' },
  { id: 'mach-hyd-press-nc', name: 'Hydraulic NC Press', sectorId: 'sec-emboutissage', family: 'Heavy Machinery', template: 'Hydraulic Press Template', referenceCode: 'HP-NC-01' },
];

export const SEED_TEMPLATES: PdrTemplate[] = [
  { id: 'temp-mech-press', familyId: 'fam-pneumatics', name: 'Mechanical Press Template', skuBase: 'MP', createdAt: now },
  { id: 'temp-hyd-press', familyId: 'fam-pneumatics', name: 'Hydraulic Press Template', skuBase: 'HP', createdAt: now },
  { id: 'temp-ball-brg', familyId: 'fam-bearings', name: 'Deep Groove Ball Bearing', skuBase: 'DBB', createdAt: now },
  { id: 'temp-v-belt', familyId: 'fam-belts', name: 'Classic V-Belt', skuBase: 'VBLT', createdAt: now },
];

export const SEED_BLUEPRINTS: PdrBlueprint[] = [
  // Keeping this empty as instructed: "Do not link any spare parts or preventive schedules yet."
];

export const INITIAL_DATA = {
  families: SEED_FAMILIES,
  sectors: SEED_SECTORS,
  machines: SEED_MACHINES,
  templates: SEED_TEMPLATES,
  blueprints: SEED_BLUEPRINTS,
};
