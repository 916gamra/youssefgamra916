import { PdrFamily, PdrTemplate, PdrBlueprint, Sector, Machine, MachineFamily, MachineTemplate, Technician, User } from '../db';

const now = new Date().toISOString();

// PDR Master Data
// PDR Master Data
export const SEED_PDR_FAMILIES: PdrFamily[] = [
  { id: 'fam-bearings', name: 'Bearings', description: 'Roller, ball, and thrust bearings', createdAt: now },
  { id: 'fam-belts', name: 'Belts', description: 'V-belts, timing belts, and flat belts', createdAt: now },
  { id: 'fam-sensors', name: 'Sensors', description: 'Proximity, temperature, and pressure sensors', createdAt: now },
  { id: 'fam-filters', name: 'Filters', description: 'Air, oil, and water filters', createdAt: now },
  { id: 'fam-pneumatics', name: 'Pneumatics', description: 'Cylinders, valves, and fittings', createdAt: now },
];

export const SEED_SECTORS: Sector[] = [
  { id: 'sector-polissage', name: 'POLISSAGE', managerName: 'Mohammed Fatouh', description: 'Surface finishing and buffing hall' },
  { id: 'sector-satinage', name: 'SATINAGE', managerName: 'Naima Belhaje', description: 'Satin finish production line' },
  { id: 'sector-repoussage', name: 'REPOUSSAGE', managerName: 'Tarike', description: 'Metal spinning and forming sector' },
  { id: 'sector-detourage', name: 'DETOURAGE', managerName: 'Mohsin Satt', description: 'Edge trimming and contouring station' },
  { id: 'sector-emboutissage', name: 'EMBOUTISSAGE', managerName: 'Hasan Zaradi', description: 'Deep drawing and heavy pressing area' },
  { id: 'sector-injection-plastic', name: 'PRESS INJECTION', managerName: 'Abde Arafie', description: 'Plastic and Bakelite injection molding facility' },
  { id: 'sector-maintenance', name: 'MAINTENANCE CENTRAL', managerName: 'Maintenance Manager', description: 'Centralized maintenance support and engineering workshop' },
];

export const SEED_TECHNICIANS: Technician[] = [
  { id: 'tech-youssef', name: 'Youssef Gamra', sectorId: 'sector-maintenance', specialty: 'Technician Maintenance (Grade 1)' },
  { id: 'tech-ismail', name: 'Ismail Motmir', sectorId: 'sector-maintenance', specialty: 'Technician Maintenance (Grade 1)' },
  { id: 'tech-rachid', name: 'Rachid', sectorId: 'sector-maintenance', specialty: 'Technician Maintenance (Grade 1)' },
  { id: 'tech-muhammad', name: 'Muhammad', sectorId: 'sector-maintenance', specialty: 'Technician Maintenance (Grade 1)' },
  { id: 'tech-boujama', name: 'Boujama Marid', sectorId: 'sector-maintenance', specialty: 'Technician Maintenance (Grade 1)' },
  { id: 'tech-anas', name: 'Anas', sectorId: 'sector-maintenance', specialty: 'Maintenance (Grade 2)' },
  { id: 'tech-brahime', name: 'Brahime', sectorId: 'sector-maintenance', specialty: 'Maintenance (Grade 2)' },
  { id: 'tech-mouad', name: 'Mouad', sectorId: 'sector-maintenance', specialty: 'Souder (Grade 3)' },
];

export const SEED_USERS: User[] = [
  { name: 'Youssef Gamra', role: 'Technician Maintenance', initials: 'YG', color: '#6366f1', pin: '1234', isPrimary: true, allowedPortals: ['ENGINEERING', 'STOCK', 'MAINTENANCE'] },
  { name: 'Ismail Motmir', role: 'Technician Maintenance', initials: 'IM', color: '#8b5cf6', pin: '0000', allowedPortals: ['MAINTENANCE'] },
  { name: 'Rachid', role: 'Technician Maintenance', initials: 'RA', color: '#ec4899', pin: '0000', allowedPortals: ['MAINTENANCE'] },
  { name: 'Muhammad', role: 'Technician Maintenance', initials: 'MU', color: '#f59e0b', pin: '0000', allowedPortals: ['MAINTENANCE'] },
  { name: 'Boujama Marid', role: 'Technician Maintenance', initials: 'BM', color: '#10b981', pin: '0000', allowedPortals: ['MAINTENANCE'] },
  { name: 'Anas', role: 'Maintenance', initials: 'AN', color: '#64748b', pin: '0000', allowedPortals: ['MAINTENANCE'] },
  { name: 'Brahime', role: 'Maintenance', initials: 'BR', color: '#64748b', pin: '0000', allowedPortals: ['MAINTENANCE'] },
  { name: 'Mouad', role: 'Souder', initials: 'MO', color: '#ef4444', pin: '0000', allowedPortals: ['MAINTENANCE'] },
];

export const SEED_MACHINES: Machine[] = [
  { id: 'mach-mech-press-2013', name: 'Mechanical Press V2013', sectorId: 'sector-emboutissage', blueprintId: 'bp-mech-press-standard', referenceCode: 'MP-2013-01' },
  { id: 'mach-mech-press-2015', name: 'Mechanical Press V2015', sectorId: 'sector-emboutissage', blueprintId: 'bp-mech-press-standard', referenceCode: 'MP-2015-02' },
  { id: 'mach-hyd-press-nc', name: 'Hydraulic NC Press', sectorId: 'sector-emboutissage', blueprintId: 'bp-hyd-press-nc', referenceCode: 'HP-NC-01' },
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

// Machine Genetic Data
export const SEED_MACHINE_FAMILIES: MachineFamily[] = [
  { 
    id: 'fam-pressing', 
    name: 'Pressing Machine', 
    code: 'PR', 
    technicalDescription: 'Industrial shaping of material via vertical pressure and compression.',
    createdAt: now 
  },
  { 
    id: 'fam-satinage', 
    name: 'Satinage Machine', 
    code: 'ST', 
    technicalDescription: 'Surface finishing process using abrasive rollers to create a satin texture.',
    createdAt: now 
  },
  { 
    id: 'fam-polissage', 
    name: 'Polissage Machine', 
    code: 'PO', 
    technicalDescription: 'Surface smoothing and brightening using rotary buffs and polishing compounds.',
    createdAt: now 
  },
  { 
    id: 'fam-detourage', 
    name: 'Detourage Machine', 
    code: 'DE', 
    technicalDescription: 'Contour cutting and trimming of part edges after initial shaping.',
    createdAt: now 
  },
  { 
    id: 'fam-sertissage', 
    name: 'Sertissage Machine', 
    code: 'SR', 
    technicalDescription: 'Mechanical joining of two parts by deforming one or both to lock them.',
    createdAt: now 
  },
  { 
    id: 'fam-persage', 
    name: 'Persage Machine', 
    code: 'PE', 
    technicalDescription: 'Mechanical process of creating cylindrical holes using rotating cutting tools.',
    createdAt: now 
  },
  { 
    id: 'fam-decoupage', 
    name: 'Découpage Machine', 
    code: 'DC', 
    technicalDescription: 'Industrial separation of raw material into specific geometries.',
    createdAt: now 
  },
  { 
    id: 'fam-rivetage', 
    name: 'Rivetage Machine', 
    code: 'RV', 
    technicalDescription: 'Permanent mechanical joining process using rivets, involving deforming the rivet shank to create a second head.',
    createdAt: now 
  },
  { 
    id: 'fam-taraudage', 
    name: 'Taraudage Machine', 
    code: 'TD', 
    technicalDescription: 'Mechanical process of cutting internal threads in a pre-drilled hole using a tap tool to allow screw insertion.',
    createdAt: now 
  },
  { 
    id: 'fam-repoussage', 
    name: 'Repoussage Machine', 
    code: 'RE', 
    technicalDescription: 'Metal spinning process where a disc or tube of metal is rotated at high speed and formed over a mandrel.',
    createdAt: now 
  },
];

export const SEED_MACHINE_TEMPLATES: MachineTemplate[] = [
  { id: 'tpl-pr-man', familyId: 'fam-pressing', name: 'Press Mechanical/Manual', type: 'M', skuBase: 'PRM', createdAt: now },
  { id: 'tpl-pr-hyd', familyId: 'fam-pressing', name: 'Press Hydraulic', type: 'H', skuBase: 'PRH', createdAt: now },
  { id: 'tpl-pr-elec', familyId: 'fam-pressing', name: 'Press Electric', type: 'E', skuBase: 'PRE', createdAt: now },
  { id: 'tpl-pr-inj', familyId: 'fam-pressing', name: 'Press Injection', type: 'I', skuBase: 'PRI', technicalDescription: 'Optimized for Thermosetting materials (Bakelite) and standard thermoplastics.', createdAt: now },
  { id: 'tpl-pr-spec', familyId: 'fam-pressing', name: 'Special Press', type: 'S', skuBase: 'PRS', createdAt: now },
  { id: 'tpl-sat-auto', familyId: 'fam-satinage', name: 'Satinage Automatic', type: 'A', skuBase: 'STA', createdAt: now },
  { id: 'tpl-sat-elec', familyId: 'fam-satinage', name: 'Satinage Electric', type: 'E', skuBase: 'STE', createdAt: now },
  { id: 'tpl-sat-man', familyId: 'fam-satinage', name: 'Satinage Manual/Mechanical', type: 'M', skuBase: 'STM', createdAt: now },
  { id: 'tpl-sat-unique', familyId: 'fam-satinage', name: 'Satinage Special Edition', type: 'S', skuBase: 'SAT', createdAt: now },
  { id: 'tpl-pol-auto', familyId: 'fam-polissage', name: 'Polissage Automatic', type: 'A', skuBase: 'POA', createdAt: now },
  { id: 'tpl-pol-man', familyId: 'fam-polissage', name: 'Polissage Manual', type: 'M', skuBase: 'POM', createdAt: now },
  { id: 'tpl-pol-unique', familyId: 'fam-polissage', name: 'Polissage Special Line', type: 'S', skuBase: 'POL', createdAt: now },
  { id: 'tpl-det-unique', familyId: 'fam-detourage', name: 'Detourage Special Edition', type: 'S', skuBase: 'DET', createdAt: now },
  { id: 'tpl-sr-man', familyId: 'fam-sertissage', name: 'Sertissage Manuel', type: 'M', skuBase: 'SRM', createdAt: now },
  { id: 'tpl-sr-elec', familyId: 'fam-sertissage', name: 'Sertissage Electric', type: 'E', skuBase: 'SRE', createdAt: now },
  { id: 'tpl-sr-spec', familyId: 'fam-sertissage', name: 'Special Sertissage', type: 'S', skuBase: 'SER', createdAt: now },
  { id: 'tpl-pe-elec', familyId: 'fam-persage', name: 'Persage Électrique', type: 'E', skuBase: 'PRE', technicalDescription: 'Standard electric drill press for metal/plastic.', createdAt: now },
  { id: 'tpl-pe-spec', familyId: 'fam-persage', name: 'Persage Special', type: 'S', skuBase: 'PER', technicalDescription: 'Complex multi-spindle drilling unit.', createdAt: now },
  { id: 'tpl-dc-scg', familyId: 'fam-decoupage', name: 'Sciage/Sawing Unit', type: 'S', skuBase: 'SCG', technicalDescription: 'Functional Sawing identity mapped to Decoupage family.', createdAt: now },
  { id: 'tpl-rv-auto', familyId: 'fam-rivetage', name: 'Rivetage Automatic', type: 'A', skuBase: 'RVA', technicalDescription: 'High-speed automated assembly.', createdAt: now },
  { id: 'tpl-rv-elec', familyId: 'fam-rivetage', name: 'Rivetage Electric', type: 'E', skuBase: 'RVE', technicalDescription: 'Electric motor-driven riveting systems.', createdAt: now },
  { id: 'tpl-rv-man', familyId: 'fam-rivetage', name: 'Rivetage Manual/Mechanical', type: 'M', skuBase: 'RVM', technicalDescription: 'Manual or simple mechanical riveting tools.', createdAt: now },
  { id: 'tpl-td-auto', familyId: 'fam-taraudage', name: 'Taraudage Automatic', type: 'A', skuBase: 'TDA', technicalDescription: 'High-precision automated threading for mass production.', createdAt: now },
  { id: 'tpl-td-elec', familyId: 'fam-taraudage', name: 'Taraudage Electric', type: 'E', skuBase: 'TDE', technicalDescription: 'Standard electric tapping machines for industrial maintenance and fabrication.', createdAt: now },
  { id: 'tpl-re-spec', familyId: 'fam-repoussage', name: 'Repoussage Special (REP)', type: 'S', skuBase: 'REP', technicalDescription: 'Advanced metal spinning unit for complex geometries.', createdAt: now },
];

export const INITIAL_DATA = {
  pdrFamilies: SEED_PDR_FAMILIES,
  sectors: SEED_SECTORS,
  machines: SEED_MACHINES,
  pdrTemplates: SEED_TEMPLATES,
  blueprints: SEED_BLUEPRINTS,
  machineFamilies: SEED_MACHINE_FAMILIES,
  machineTemplates: SEED_MACHINE_TEMPLATES,
  technicians: SEED_TECHNICIANS,
  users: SEED_USERS,
};
