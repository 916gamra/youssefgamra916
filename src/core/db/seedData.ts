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
  { id: 'sec-production-a', name: 'Production Line A', description: 'Primary assembly line' },
  { id: 'sec-production-b', name: 'Production Line B', description: 'Secondary assembly and packaging' },
  { id: 'sec-utilities', name: 'Utilities', description: 'Power, air, and water supply' },
];

export const SEED_MACHINES: Machine[] = [
  { id: 'mach-compressor-1', name: 'Compressor ga355 (Smartbox)', sectorId: 'sec-utilities', family: 'Compressors', template: 'GA355', referenceCode: 'CMP-GA355-01' },
  { id: 'mach-conveyor-1', name: 'Main Conveyor System', sectorId: 'sec-production-a', family: 'Conveyors', template: 'Heavy Duty', referenceCode: 'CNV-MD-01' },
  { id: 'mach-packager-1', name: 'Packaging Unit X1', sectorId: 'sec-production-a', family: 'Packaging', template: 'AutoPack X1', referenceCode: 'PKG-X1-01' },
  { id: 'mach-mixer-1', name: 'Industrial Mixer M-200', sectorId: 'sec-production-b', family: 'Mixers', template: 'M-200', referenceCode: 'MIX-200-01' },
  { id: 'mach-cnc-1', name: 'CNC Milling Machine', sectorId: 'sec-production-b', family: 'Milling', template: '5-Axis CNC', referenceCode: 'CNC-5A-01' },
];

export const SEED_TEMPLATES: PdrTemplate[] = [
  { id: 'temp-ball-brg', familyId: 'fam-bearings', name: 'Deep Groove Ball Bearing', skuBase: 'DBB', createdAt: now },
  { id: 'temp-roller-brg', familyId: 'fam-bearings', name: 'Tapered Roller Bearing', skuBase: 'TRB', createdAt: now },
  { id: 'temp-v-belt', familyId: 'fam-belts', name: 'Classic V-Belt', skuBase: 'VBLT', createdAt: now },
  { id: 'temp-timing-belt', familyId: 'fam-belts', name: 'Polyurethane Timing Belt', skuBase: 'TBLT', createdAt: now },
  { id: 'temp-prox-sensor', familyId: 'fam-sensors', name: 'Inductive Proximity Sensor', skuBase: 'PROX', createdAt: now },
  { id: 'temp-temp-sensor', familyId: 'fam-sensors', name: 'PT100 Temperature Sensor', skuBase: 'PT100', createdAt: now },
  { id: 'temp-air-filter', familyId: 'fam-filters', name: 'Heavy Duty Air Filter', skuBase: 'AFLT', createdAt: now },
  { id: 'temp-oil-filter', familyId: 'fam-filters', name: 'Spin-on Oil Filter', skuBase: 'OFLT', createdAt: now },
  { id: 'temp-cylinder', familyId: 'fam-pneumatics', name: 'Double Acting Cylinder', skuBase: 'DCYL', createdAt: now },
  { id: 'temp-valve', familyId: 'fam-pneumatics', name: '5/2 Way Solenoid Valve', skuBase: '52VAL', createdAt: now },
];

export const SEED_BLUEPRINTS: PdrBlueprint[] = [
  // Bearings
  { id: 'bp-6204', templateId: 'temp-ball-brg', reference: '6204-2RS', unit: 'Pcs', minThreshold: 10, createdAt: now },
  { id: 'bp-6205', templateId: 'temp-ball-brg', reference: '6205-2RS', unit: 'Pcs', minThreshold: 10, createdAt: now },
  { id: 'bp-6306', templateId: 'temp-ball-brg', reference: '6306-ZZ', unit: 'Pcs', minThreshold: 5, createdAt: now },
  { id: 'bp-30205', templateId: 'temp-roller-brg', reference: '30205 J2/Q', unit: 'Pcs', minThreshold: 4, createdAt: now },
  { id: 'bp-32208', templateId: 'temp-roller-brg', reference: '32208 J2/Q', unit: 'Pcs', minThreshold: 2, createdAt: now },

  // Belts
  { id: 'bp-a30', templateId: 'temp-v-belt', reference: 'A30', unit: 'Pcs', minThreshold: 5, createdAt: now },
  { id: 'bp-b45', templateId: 'temp-v-belt', reference: 'B45', unit: 'Pcs', minThreshold: 5, createdAt: now },
  { id: 'bp-spa1000', templateId: 'temp-v-belt', reference: 'SPA1000', unit: 'Pcs', minThreshold: 8, createdAt: now },
  { id: 'bp-t5-500', templateId: 'temp-timing-belt', reference: 'T5-500-16', unit: 'Pcs', minThreshold: 2, createdAt: now },
  { id: 'bp-at10-1000', templateId: 'temp-timing-belt', reference: 'AT10-1000-25', unit: 'Pcs', minThreshold: 2, createdAt: now },

  // Sensors
  { id: 'bp-prx-12', templateId: 'temp-prox-sensor', reference: 'M12 PNP NO 4mm', unit: 'Pcs', minThreshold: 3, createdAt: now },
  { id: 'bp-prx-18', templateId: 'temp-prox-sensor', reference: 'M18 NPN NO 8mm', unit: 'Pcs', minThreshold: 3, createdAt: now },
  { id: 'bp-pt100-3w', templateId: 'temp-temp-sensor', reference: 'PT100 3-Wire 50mm', unit: 'Pcs', minThreshold: 2, createdAt: now },
  { id: 'bp-pt100-4w', templateId: 'temp-temp-sensor', reference: 'PT100 4-Wire 100mm', unit: 'Pcs', minThreshold: 2, createdAt: now },

  // Filters
  { id: 'bp-af-c14200', templateId: 'temp-air-filter', reference: 'C 14 200', unit: 'Pcs', minThreshold: 4, createdAt: now },
  { id: 'bp-af-c16400', templateId: 'temp-air-filter', reference: 'C 16 400', unit: 'Pcs', minThreshold: 4, createdAt: now },
  { id: 'bp-of-w940', templateId: 'temp-oil-filter', reference: 'W 940/25', unit: 'Pcs', minThreshold: 6, createdAt: now },

  // Pneumatics
  { id: 'bp-cyl-32x50', templateId: 'temp-cylinder', reference: 'ISO15552 D32 L50', unit: 'Pcs', minThreshold: 1, createdAt: now },
  { id: 'bp-cyl-50x100', templateId: 'temp-cylinder', reference: 'ISO15552 D50 L100', unit: 'Pcs', minThreshold: 1, createdAt: now },
  { id: 'bp-val-52-14', templateId: 'temp-valve', reference: '5/2 G1/4 24VDC', unit: 'Pcs', minThreshold: 4, createdAt: now },
];

export const INITIAL_DATA = {
  families: SEED_FAMILIES,
  sectors: SEED_SECTORS,
  machines: SEED_MACHINES,
  templates: SEED_TEMPLATES,
  blueprints: SEED_BLUEPRINTS,
};
