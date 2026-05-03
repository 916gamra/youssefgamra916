import { PdrFamily, PdrTemplate, PdrBlueprint, Sector, Machine, MachineFamily, MachineTemplate, MachineBlueprint, Technician, User } from '../db';

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
  { 
    id: 'fam-tournage', 
    name: 'Tournage Machine', 
    code: 'TR', 
    technicalDescription: 'Machining process in which a cutting tool, typically a non-rotary tool bit, describes a helix toolpath by moving more or less linearly while the workpiece rotates.',
    createdAt: now 
  },
  { 
    id: 'fam-visseuse', 
    name: 'Visseuse Machine', 
    code: 'VI', 
    technicalDescription: 'Mechanical fastening using screws.',
    createdAt: now 
  },
  { 
    id: 'fam-poinconneuse', 
    name: 'Poinçonneuse Machine', 
    code: 'PC', 
    technicalDescription: 'Punching machine for material deformation or cutting.',
    createdAt: now 
  },
  { 
    id: 'fam-sertissage-bec', 
    name: 'Sertissage Bec Bouilloire', 
    code: 'SB', 
    technicalDescription: 'Specialized seaming operation for kettle spouts.',
    createdAt: now 
  },
  { 
    id: 'fam-moteur-meule', 
    name: 'Moteur Meule', 
    code: 'ME', 
    technicalDescription: 'Grinding motor assembly.',
    createdAt: now 
  },
  { 
    id: 'fam-scotcheuse', 
    name: 'Scotcheuse Machine', 
    code: 'SC', 
    technicalDescription: 'Taping machine.',
    createdAt: now 
  },
  { 
    id: 'fam-traitement-surf', 
    name: 'Traitement Surface', 
    code: 'TF', 
    technicalDescription: 'Surface treatment, chemical baths, and finishing operations.',
    createdAt: now 
  },
  { 
    id: 'fam-ravivage', 
    name: 'Ravivage', 
    code: 'RA', 
    technicalDescription: 'Process of restoring the cutting surface of grinding wheels.',
    createdAt: now 
  },
  { 
    id: 'fam-transpalette', 
    name: 'Transpalette', 
    code: 'TP', 
    technicalDescription: 'Material handling equipment used to lift and move pallets.',
    createdAt: now 
  },
  { 
    id: 'fam-compresseur', 
    name: 'Compresseur', 
    code: 'CO', 
    technicalDescription: 'Pneumatic infrastructure machine used to increase the pressure of a gas/air by reducing its volume.',
    createdAt: now 
  },
  { 
    id: 'fam-pompage', 
    name: 'Système De Pompage', 
    code: 'PM', 
    technicalDescription: 'Hydraulic infrastructure for moving fluids. PMI specifically targets submersible pumps (Pompe Immergée).',
    createdAt: now 
  },
  { 
    id: 'fam-elevateur', 
    name: 'Elévateur', 
    code: 'EL', 
    technicalDescription: 'Vertical transport equipment used for moving goods between floors or high levels.',
    createdAt: now 
  },
  { 
    id: 'fam-transformateur', 
    name: 'Transformateur Electrique', 
    code: 'SY', 
    technicalDescription: 'Electrical infrastructure device that transfers electrical energy from one circuit to another (stepping voltage up or down).',
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
  { id: 'tpl-tr-par', familyId: 'fam-tournage', name: 'Tourne Parallèle', type: 'E', skuBase: 'TRP', technicalDescription: 'Standard parallel lathe for cylindrical machining.', createdAt: now },
  { id: 'tpl-tr-spec', familyId: 'fam-tournage', name: 'Tourne Unique (TRR)', type: 'S', skuBase: 'TRR', technicalDescription: 'Specialized or unique lathe configuration.', createdAt: now },
  { id: 'tpl-pe-per', familyId: 'fam-persage', name: 'Perceuse Specialized', type: 'S', skuBase: 'PER', technicalDescription: 'Specialized drilling operations.', createdAt: now },
  { id: 'tpl-rv-rvs', familyId: 'fam-rivetage', name: 'Rivetage Semi-Electric', type: 'S', skuBase: 'RVS', technicalDescription: 'Type S - Semi-Electric rivetage.', createdAt: now },
  { id: 'tpl-vi-vis', familyId: 'fam-visseuse', name: 'Visseuse Specialized', type: 'S', skuBase: 'VIS', technicalDescription: 'Specialized screwing tool.', createdAt: now },
  { id: 'tpl-pc-pcp', familyId: 'fam-poinconneuse', name: 'Poinçonneuse Specialized', type: 'S', skuBase: 'PCP', technicalDescription: 'Specialized punching operations.', createdAt: now },
  { id: 'tpl-pc-pcm', familyId: 'fam-poinconneuse', name: 'Poinçonneuse Mechanical', type: 'M', skuBase: 'PCM', technicalDescription: 'Mechanical punching operations.', createdAt: now },
  { id: 'tpl-sb-sbb', familyId: 'fam-sertissage-bec', name: 'Sertissage Bec Specialized', type: 'S', skuBase: 'SBB', technicalDescription: 'Kettle Spout Seaming.', createdAt: now },
  { id: 'tpl-me-mel', familyId: 'fam-moteur-meule', name: 'Moteur Meule Specialized', type: 'S', skuBase: 'MEL', technicalDescription: 'Grinding motor assembly.', createdAt: now },
  { id: 'tpl-sc-sca', familyId: 'fam-scotcheuse', name: 'Scotcheuse Automatic', type: 'A', skuBase: 'SCA', technicalDescription: 'Type A - Automatic tapping machine.', createdAt: now },
  { id: 'tpl-tf-tfa', familyId: 'fam-traitement-surf', name: 'Traitement Surface Automatic', type: 'A', skuBase: 'TFA', technicalDescription: 'Type A - Automatic surface treatment.', createdAt: now },
  { id: 'tpl-ra-rav', familyId: 'fam-ravivage', name: 'Ravivage Specialized', type: 'S', skuBase: 'RAV', technicalDescription: 'Specialized process of restoring the cutting surface.', createdAt: now },
  { id: 'tpl-tp-trs', familyId: 'fam-transpalette', name: 'Transpalette Specialized', type: 'S', skuBase: 'TRS', technicalDescription: 'Specialized material handling transpalette.', createdAt: now },
  { id: 'tpl-co-com', familyId: 'fam-compresseur', name: 'Compresseur Specialized', type: 'S', skuBase: 'COM', technicalDescription: 'Specialized compressor infrastructure.', createdAt: now },
  { id: 'tpl-pm-pmi', familyId: 'fam-pompage', name: 'Pompe Immergée (Submersible)', type: 'S', skuBase: 'PMI', technicalDescription: 'Specialized Submersible Pump (Pompe Immergée).', createdAt: now },
  { id: 'tpl-el-elv', familyId: 'fam-elevateur', name: 'Elévateur Specialized', type: 'S', skuBase: 'ELV', technicalDescription: 'Specialized handling elevator infrastructure.', createdAt: now },
  { id: 'tpl-sy-syc', familyId: 'fam-transformateur', name: 'Transformateur Electrique Specialized', type: 'S', skuBase: 'SYC', technicalDescription: 'Specialized electrical transformer.', createdAt: now },
];

export const SEED_MACHINE_BLUEPRINTS: MachineBlueprint[] = [
  { id: 'bp-mech-press-standard', templateId: 'tpl-pr-man', reference: 'PRM1-V1', createdAt: now },
  { id: 'bp-hyd-press-nc', templateId: 'tpl-pr-hyd', reference: 'PRH1-X200', createdAt: now },
  { id: 'bp-tourne-p-std', templateId: 'tpl-tr-par', reference: 'TRP1-1500', createdAt: now },
  { id: 'bp-scotcheuse-auto', templateId: 'tpl-sc-sca', reference: 'SCA1-V1', createdAt: now },
  { id: 'bp-traitement-surf', templateId: 'tpl-tf-tfa', reference: 'TFA1-LIGNE', createdAt: now },
  { id: 'bp-ravivage', templateId: 'tpl-ra-rav', reference: 'RAV1-V1', createdAt: now },
  { id: 'bp-transpalette', templateId: 'tpl-tp-trs', reference: 'TRS1-MAN', createdAt: now },
  { id: 'bp-compresseur', templateId: 'tpl-co-com', reference: 'COM1-AIR', createdAt: now },
  { id: 'bp-pompage', templateId: 'tpl-pm-pmi', reference: 'PMI1-EAU', createdAt: now },
  { id: 'bp-elevateur', templateId: 'tpl-el-elv', reference: 'ELV1-V1', createdAt: now },
  { id: 'bp-transformateur', templateId: 'tpl-sy-syc', reference: 'SYC1-220V', createdAt: now },
  { id: 'bp-visseuse', templateId: 'tpl-vi-vis', reference: 'VIS1-PNEU', createdAt: now },
  { id: 'bp-poinconneuse', templateId: 'tpl-pc-pcp', reference: 'PCP1-CNC', createdAt: now },
  { id: 'bp-sertissage-bec', templateId: 'tpl-sb-sbb', reference: 'SBB1-V1', createdAt: now },
  { id: 'bp-moteur-meule', templateId: 'tpl-me-mel', reference: 'MEL1-3000', createdAt: now },
];

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
