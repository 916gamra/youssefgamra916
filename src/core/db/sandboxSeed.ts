import { db } from '../db';

export async function checkAndSeedSandbox() {
  try {
    const isSeeded = localStorage.getItem('BDR_NEXUS_SANDBOX_SEEDED_V18');
    if (isSeeded === 'true') {
      return; // Already seeded.
    }

    console.log('[SandboxSeeder] Executing seeding of initial sectors, TRR, PRI, SAT, TRP, RCP, PER, MRT, FRM, MEL, and SCM machines into sandbox...');

    await db.transaction('rw', [
      db.pdrFamilies,
      db.pdrTemplates,
      db.pdrBlueprints,
      db.inventory,
      db.movements,
      db.sectors,
      db.technicians,
      db.machines,
      db.machineFamilies,
      db.machineTemplates,
      db.machineBlueprints,
      db.machinePartMappings,
      db.standardComponents,
      db.standardActions,
      db.preventiveTasks,
      db.taskExecutions
    ], async () => {
      // Clear all items to give the user a pure empty sandbox.
      await db.pdrFamilies.clear();
      await db.pdrTemplates.clear();
      await db.pdrBlueprints.clear();
      await db.inventory.clear();
      await db.movements.clear();
      await db.sectors.clear();
      await db.technicians.clear();
      await db.machines.clear();
      await db.machineFamilies.clear();
      await db.machineTemplates.clear();
      await db.machineBlueprints.clear();
      await db.machinePartMappings.clear();
      await db.standardComponents.clear();
      await db.standardActions.clear();
      await db.preventiveTasks.clear();
      await db.taskExecutions.clear();

      console.log('[SandboxSeeder] Sandbox database is now completely empty.');
      
      const sectorsList = [
        "Bakélite", "compresseur", "Detourage", "Diver", "Emboutissage", 
        "Fabrication Mécanique", "Finition Emballage 1", "Finition Emballage 2", 
        "Finition Emballage 3", "Finition Emballage 4", "Polissage", 
        "Repoussage", "Satinage", "Soudeur"
      ].map((name, i) => {
        const num = (i + 1).toString().padStart(2, '0');
        return {
          id: `SEC-${num}`,
          name,
          managerName: '',
          description: `Zone ${name}`,
          status: 'Active' as const
        };
      });
      await db.sectors.bulkAdd(sectorsList);
      
      console.log(`[SandboxSeeder] Added ${sectorsList.length} initial sectors.`);

      // Cleanup old bad families and blueprints if any
      await db.machineFamilies.bulkDelete(['fam-repoussage', 'fam-tournage', 'fam-trp']);
      
      // Create TR (Tours) Family
      const trFamily = {
        id: 'fam-tr',
        name: 'Tours',
        code: 'TR',
        technicalDescription: 'Machines de tournage (repoussage, parallèles, etc).',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(trFamily);

      const trrTemplate = {
        id: 'tpl-trr',
        familyId: 'fam-tr',
        name: 'Tour à Repoussage',
        type: 'M' as const, // Assuming M for Mechanical/Manual
        skuBase: 'TRR',
        technicalDescription: 'Tour standard pour opérations de repoussage manuel et semi-automatique.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(trrTemplate);

      const trrBlueprint = {
        id: 'mchbp-trr-std',
        templateId: 'tpl-trr',
        reference: 'TRR-STANDARD',
        brand: 'Standard Manufacturing',
        model: 'TRR-GENERIC',
        powerOrForce: 'Standard',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Modèle de référence pour les tours de repoussage généraux',
        componentIds: [], // To be populated later
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(trrBlueprint);

      // Create Individual TRR Machines
      const trrNumbers = ['15', '21', '08', '16', '18', '12', '23', '02', '07', '11', '04', '05'];
      const machinesList = trrNumbers.map((num, i) => ({
        id: `mach-TRR${num}`,
        blueprintId: 'mchbp-trr-std',
        referenceCode: `TRR-${num}`,
        serialNumber: `SN-TRR${num}-SIM`,
        manufacturingYear: 2020 - (i % 5),
        sectorId: 'SEC-12', // Repoussage
        technicianId: null as any, // Not assigned initially based on request
        status: 'Active' as const
      }));
      await db.machines.bulkAdd(machinesList);

      console.log(`[SandboxSeeder] Added ${machinesList.length} TRR machines.`);

      // Create PRI (Press Injection) Family, Template, Blueprint
      const injectionFamily = {
        id: 'fam-injection',
        name: 'Presses à Injection',
        code: 'PRI',
        technicalDescription: 'Injection plastique et moulage bakélite sous haute pression.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(injectionFamily);

      const priTemplate = {
        id: 'tpl-pri',
        familyId: 'fam-injection',
        name: 'Presse Injection Bakélite',
        type: 'H' as const, // Hydraulic/Thermal
        skuBase: 'PRI',
        technicalDescription: 'Presse spécialisée pour injection thermodurcissable (Bakélite).',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(priTemplate);

      const priBlueprint = {
        id: 'mchbp-pri-std',
        templateId: 'tpl-pri',
        reference: 'PRI-STANDARD',
        brand: 'Bakelite Tech',
        model: 'PRI-GENERIC',
        powerOrForce: 'Haute Pression',
        energySource: 'Électrique/Hydraulique',
        technicalSpecs: 'Modèle générique de presse à injection pour le secteur Bakélite',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(priBlueprint);

      // Create Individual PRI Machines
      const priNumbers = ['04', '05', '06', '07', '08', '09'];
      const priMachinesList = priNumbers.map((num, i) => ({
        id: `mach-PRI${num}`,
        blueprintId: 'mchbp-pri-std',
        referenceCode: num === '07' ? 'PRI-7' : `PRI-${num}`,
        serialNumber: `SN-PRI${num}-SIM`,
        manufacturingYear: 2018 + i,
        sectorId: 'SEC-01', // Bakélite is SEC-01
        technicianId: null as any,
        status: 'Active' as const
      }));
      await db.machines.bulkAdd(priMachinesList);

      console.log(`[SandboxSeeder] Added ${priMachinesList.length} PRI machines.`);

      // Create SAT (Satinage) Family, Template, Blueprint
      const satinageFamily = {
        id: 'fam-satinage',
        name: 'Machines de Satinage',
        code: 'SAT',
        technicalDescription: 'Machines pour la finition de surface (Satinage).',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(satinageFamily);

      const satTemplate = {
        id: 'tpl-sat',
        familyId: 'fam-satinage',
        name: 'Machine de Satinage Standard',
        type: 'M' as const, // Mechanical/Surface finish
        skuBase: 'SAT',
        technicalDescription: 'Brossage et finition de surface.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(satTemplate);

      const satBlueprint = {
        id: 'mchbp-sat-std',
        templateId: 'tpl-sat',
        reference: 'SAT-STANDARD',
        brand: 'Satin Tech',
        model: 'SAT-GENERIC',
        powerOrForce: 'Standard',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Modèle générique pour équipement de satinage',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(satBlueprint);

      // Create Individual SAT Machines
      // SAT-03 SAT-09 SAT-08 SAT-15 SAT-20 SAT-28 SAT-29 SAT-33 SAT-34
      const satNumbers = ['03', '09', '08', '15', '20', '28', '29', '33', '34'];
      const satMachinesList = satNumbers.map((num, i) => ({
        id: `mach-SAT${num}`,
        blueprintId: 'mchbp-sat-std',
        referenceCode: `SAT-${num}`,
        serialNumber: `SN-SAT${num}-SIM`,
        manufacturingYear: 2019 + (i % 4),
        sectorId: 'SEC-13', // Satinage is SEC-13
        technicianId: null as any,
        status: 'Active' as const
      }));
      await db.machines.bulkAdd(satMachinesList);

      console.log(`[SandboxSeeder] Added ${satMachinesList.length} SAT machines.`);

      // Create TRP (Tour Parallèle) Template, Blueprint
      const trpTemplate = {
        id: 'tpl-trp',
        familyId: 'fam-tr',
        name: 'Tour Parallèle Standard',
        type: 'M' as const, // Mechanical
        skuBase: 'TRP',
        technicalDescription: 'Tour parallèle mécanique standard pour fabrication et outillage.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(trpTemplate);

      const trpBlueprint = {
        id: 'mchbp-trp-std',
        templateId: 'tpl-trp',
        reference: 'TRP-STANDARD',
        brand: 'Ciob Heavy Machining',
        model: 'TRP-GENERIC-X1',
        powerOrForce: '11 kW',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Modèle de référence pour les tours parallèles généraux de fabrication',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(trpBlueprint);

      // Create Individual TRP Machines
      // TRP-01 TRP-04 TRP-08 TRP-10 TRP-11 TRP-12
      const trpNumbers = ['01', '04', '08', '10', '11', '12'];
      const trpMachinesList = trpNumbers.map((num, i) => ({
        id: `mach-TRP${num}`,
        blueprintId: 'mchbp-trp-std',
        referenceCode: `TRP-${num}`,
        serialNumber: `SN-TRP${num}-SIM`,
        manufacturingYear: 2020 + (i % 3),
        sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
        technicianId: null as any,
        status: 'Active' as const
      }));
      await db.machines.bulkAdd(trpMachinesList);

      console.log(`[SandboxSeeder] Added ${trpMachinesList.length} TRP machines.`);

      // Create RCP (Rectifieuse) Family, Template, Blueprints
      const rcpFamily = {
        id: 'fam-rcp',
        name: 'Rectifieuses',
        code: 'RCP',
        technicalDescription: 'Machines de rectification plane ou cylindrique pour finition de précision.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(rcpFamily);

      const rcpTemplate = {
        id: 'tpl-rcp',
        familyId: 'fam-rcp',
        name: 'Rectifieuse de Précision',
        type: 'M' as const, // Mechanical/Precision
        skuBase: 'RCP',
        technicalDescription: 'Rectifieuse industrielle pour rectification de surfaces.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(rcpTemplate);

      // Blueprint 1: Standard
      const rcpStdBlueprint = {
        id: 'mchbp-rcp-std',
        templateId: 'tpl-rcp',
        reference: 'RCP-STANDARD',
        brand: 'GrindMaster',
        model: 'GM-RECT-STD',
        powerOrForce: '7.5 kW',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Modèle de référence standard pour rectification plane et cylindrique semi-automatique.',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(rcpStdBlueprint);

      // Blueprint 2: Small Manual (RCP-03)
      const rcpSmallManualBlueprint = {
        id: 'mchbp-rcp-small-manual',
        templateId: 'tpl-rcp',
        reference: 'RCP-MINI-MANUAL',
        brand: 'MicroGrind Co.',
        model: 'MG-MAN-01',
        powerOrForce: '2.2 kW',
        energySource: 'Électrique 220V',
        technicalSpecs: 'Modèle réduit conçu exclusivement pour les pièces de petite taille. Fonctionnement 100% manuel, haute précision sans assistance automatique.',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(rcpSmallManualBlueprint);

      // Create Individual RCP Machines
      // RCP-02 and RCP-04: standard blueprint
      // RCP-03: small manual blueprint
      const rcpMachinesList = [
        {
          id: 'mach-RCP02',
          blueprintId: 'mchbp-rcp-std',
          referenceCode: 'RCP-02',
          serialNumber: 'SN-RCP02-SIM',
          manufacturingYear: 2021,
          sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
          technicianId: null as any,
          status: 'Active' as const
        },
        {
          id: 'mach-RCP04',
          blueprintId: 'mchbp-rcp-std',
          referenceCode: 'RCP-04',
          serialNumber: 'SN-RCP04-SIM',
          manufacturingYear: 2022,
          sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
          technicianId: null as any,
          status: 'Active' as const
        },
        {
          id: 'mach-RCP03',
          blueprintId: 'mchbp-rcp-small-manual',
          referenceCode: 'RCP-03',
          serialNumber: 'SN-RCP03-SIM',
          manufacturingYear: 2023,
          sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(rcpMachinesList);

      console.log(`[SandboxSeeder] Added ${rcpMachinesList.length} RCP machines.`);

      // Create PER (Perceuse) Family, Template, Blueprint
      const perFamily = {
        id: 'fam-per',
        name: 'Perceuses',
        code: 'PER',
        technicalDescription: 'Machines de perçage et taraudage de précision.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(perFamily);

      const perTemplate = {
        id: 'tpl-per',
        familyId: 'fam-per',
        name: 'Perceuse Industrielle de Fabrication',
        type: 'M' as const, // Mechanical / Advanced Drill
        skuBase: 'PER',
        technicalDescription: 'Perceuse à colonne industrielle avancée conçue pour les opérations lourdes de fabrication mécanique.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(perTemplate);


      // Create Advanced PER Blueprint (PER-06 is advanced/custom, not simple standard)
      const perAdvancedBlueprint = {
        id: 'mchbp-per-advanced',
        templateId: 'tpl-per',
        reference: 'PER-ADVANCED',
        brand: 'AluDrill Heavy Tech',
        model: 'AD-PRO-600',
        powerOrForce: '5.5 kW / High Torque',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Perceuse industrielle de haute précision dotée de vitesses variables électroniques, d’un affichage numérique de profondeur, et d’un système d’arrosage intégré pour usinage intensif (Fabrication Mécanique).',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(perAdvancedBlueprint);

      // Create Individual PER Machine PER-06
      const perMachinesList = [
        {
          id: 'mach-PER06',
          blueprintId: 'mchbp-per-advanced',
          referenceCode: 'PER-06',
          serialNumber: 'SN-PER06-SIM',
          manufacturingYear: 2024,
          sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(perMachinesList);

      console.log(`[SandboxSeeder] Added ${perMachinesList.length} PER machines.`);

      // Create PRR (Perceuse Radiale) Template, Blueprint
      const prrTemplate = {
        id: 'tpl-prr',
        familyId: 'fam-per',
        name: 'Perceuse Radiale',
        type: 'M' as const, // Mechanical
        skuBase: 'PRR',
        technicalDescription: 'Perceuse radiale avec bras mobile pour l\'usinage de pièces industrielles lourdes et encombrantes.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(prrTemplate);

      // Components for PRR (Perceuse Radiale)
      const prrComponents = [
        {
          id: 'comp-prr-bras',
          name: 'Le bras (Bras mobile horizontal)',
          family: 'MEC' as const,
          taskIds: [],
          criticality: 'HIGH' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-prr-tete',
          name: 'La tête de perçage (Tête mobile)',
          family: 'ELE' as const,
          taskIds: [],
          criticality: 'CRITICAL' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-prr-colonne',
          name: 'La colonne (Pilier de support principal)',
          family: 'MEC' as const,
          taskIds: [],
          criticality: 'HIGH' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-prr-boite',
          name: 'Boîte de vitesses (Contrôle d\'avance)',
          family: 'MEC' as const,
          taskIds: [],
          criticality: 'CRITICAL' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-prr-lubrif',
          name: 'Système de lubrification',
          family: 'HYD' as const,
          taskIds: [],
          criticality: 'MEDIUM' as const,
          createdAt: new Date().toISOString()
        }
      ];
      await db.standardComponents.bulkAdd(prrComponents);

      const prrBlueprint = {
        id: 'mchbp-prr-radiale',
        templateId: 'tpl-prr',
        reference: 'PRR-RADIALE',
        brand: 'HeavyDrill',
        model: 'HDR-RAD-2000',
        powerOrForce: '11 kW',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Idéale pour les grandes pièces avec un bras de grande portée, boîte de vitesses intégrée et système de lubrification.',
        componentIds: prrComponents.map(c => c.id),
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(prrBlueprint);

      // Create Individual PRR Machine PRR-01
      const prrMachinesList = [
        {
          id: 'mach-PRR01',
          blueprintId: 'mchbp-prr-radiale',
          referenceCode: 'PRR-01',
          serialNumber: 'SN-PRR01-SIM',
          manufacturingYear: 2021,
          sectorId: 'SEC-06', // Fabrication Mécanique
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(prrMachinesList);

      console.log(`[SandboxSeeder] Added ${prrMachinesList.length} PRR machines.`);

      // Create MRT (Mortiseuses) Family, Template, Blueprint
      const mrtFamily = {
        id: 'fam-mrt',
        name: 'Mortiseuses',
        code: 'MRT',
        technicalDescription: 'Machines à mortaiser pour l’usinage de rainures et de mortaises.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(mrtFamily);

      const mrtTemplate = {
        id: 'tpl-mrt',
        familyId: 'fam-mrt',
        name: 'Mortiseuse Industrielle',
        type: 'M' as const, // Mechanical
        skuBase: 'MRT',
        technicalDescription: 'Machine de mortaisage standard pour fabrication de rainures de clavettes.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(mrtTemplate);

      const mrtBlueprint = {
        id: 'mchbp-mrt-std',
        templateId: 'tpl-mrt',
        reference: 'MRT-STANDARD',
        brand: 'SlotMaster',
        model: 'MRT-GENERIC-X',
        powerOrForce: '4.0 kW',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Modèle de référence standard pour mortaisage mécanique de précision',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(mrtBlueprint);

      // Create Individual MRT Machine MRT-01
      const mrtMachinesList = [
        {
          id: 'mach-MRT01',
          blueprintId: 'mchbp-mrt-std',
          referenceCode: 'MRT-01',
          serialNumber: 'SN-MRT01-SIM',
          manufacturingYear: 2023,
          sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(mrtMachinesList);

      console.log(`[SandboxSeeder] Added ${mrtMachinesList.length} MRT machines.`);

      // Create FRM (Fraiseuses) Family, Template, Blueprint
      const frmFamily = {
        id: 'fam-frm',
        name: 'Fraiseuses',
        code: 'FRM',
        technicalDescription: 'Machines de fraisage mécanique pour enlèvement de matière.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(frmFamily);

      const frmTemplate = {
        id: 'tpl-frm',
        familyId: 'fam-frm',
        name: 'Fraiseuse Mécanique Standard',
        type: 'M' as const, // Mechanical
        skuBase: 'FRM',
        technicalDescription: 'Fraiseuse mécanique conventionnelle pour travaux d’usinage.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(frmTemplate);

      const frmBlueprint = {
        id: 'mchbp-frm-std',
        templateId: 'tpl-frm',
        reference: 'FRM-STANDARD',
        brand: 'MillCut',
        model: 'FRM-GENERIC-1',
        powerOrForce: '5.5 kW',
        energySource: 'Électrique 380V',
        technicalSpecs: 'Modèle de référence standard pour fraisage mécanique conventionnel (Fabrication Mécanique)',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(frmBlueprint);

      // Create Individual FRM Machine FRM-01
      const frmMachinesList = [
        {
          id: 'mach-FRM01',
          blueprintId: 'mchbp-frm-std',
          referenceCode: 'FRM-01',
          serialNumber: 'SN-FRM01-SIM',
          manufacturingYear: 2022,
          sectorId: 'SEC-06', // Fabrication Mécanique is SEC-06
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(frmMachinesList);

      console.log(`[SandboxSeeder] Added ${frmMachinesList.length} FRM machines.`);

      // Create MEL (Meuleuses) Family, Template, Blueprint
      const melFamily = {
        id: 'fam-mel',
        name: 'Meuleuses',
        code: 'MEL',
        technicalDescription: 'Machines équipées d\'un moteur électrique rapide et d\'une meule pour l\'enlèvement de matière par friction.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(melFamily);

      const melTemplate = {
        id: 'tpl-mel',
        familyId: 'fam-mel',
        name: 'Meuleuse Industrielle',
        type: 'E' as const, // Electrical
        skuBase: 'MEL',
        technicalDescription: 'Touret à meuler fixe pour opérations de finition, d\'ébarbage et d\'affûtage.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(melTemplate);

      const melBlueprint = {
        id: 'mchbp-mel-std',
        templateId: 'tpl-mel',
        reference: 'MEL-STANDARD',
        brand: 'GrindTec',
        model: 'GT-MEUL-X',
        powerOrForce: '1.5 kW',
        energySource: 'Électrique 220V',
        technicalSpecs: 'Touret à meuler fixe avec double meule, utilisé pour l\'affûtage d\'outils de coupe et l\'ébavurage.',
        componentIds: [],
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(melBlueprint);

      // Create Individual MEL Machine MEL-01
      const melMachinesList = [
        {
          id: 'mach-MEL01',
          blueprintId: 'mchbp-mel-std',
          referenceCode: 'MEL-01',
          serialNumber: 'SN-MEL01-SIM',
          manufacturingYear: 2023,
          sectorId: 'SEC-06', // Fabrication Mécanique
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(melMachinesList);

      console.log(`[SandboxSeeder] Added ${melMachinesList.length} MEL machines.`);

      // Create SCM (Scie Alternative) Family, Template, Blueprint, Components
      const scieFamily = {
        id: 'fam-scie',
        name: 'Sciage',
        code: 'SCI',
        technicalDescription: 'Machines de coupe de métaux (débitage) pour préparer les bruts avant usinage.',
        createdAt: new Date().toISOString()
      };
      await db.machineFamilies.add(scieFamily);

      const scmTemplate = {
        id: 'tpl-scm',
        familyId: 'fam-scie',
        name: 'Scie Alternative Mécanique',
        type: 'M' as const,
        skuBase: 'SCM',
        technicalDescription: 'Machine transformant un mouvement rotatif en mouvement rectiligne alternatif (système bielle-manivelle) pour le tronçonnage des barres.',
        createdAt: new Date().toISOString()
      };
      await db.machineTemplates.add(scmTemplate);

      // Components for SCM
      const scmComponents = [
        {
          id: 'comp-scm-bielle',
          name: 'Système bielle-manivelle',
          family: 'MEC' as const,
          taskIds: [],
          criticality: 'CRITICAL' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-scm-hydraulique',
          name: 'Système Hydraulique (Contrôle de descente/avance)',
          family: 'HYD' as const,
          taskIds: [],
          criticality: 'HIGH' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-scm-etau',
          name: 'Étau hydraulique (Fixation de la barre)',
          family: 'HYD' as const,
          taskIds: [],
          criticality: 'MEDIUM' as const,
          createdAt: new Date().toISOString()
        },
        {
          id: 'comp-scm-moteur',
          name: 'Moteur électrique',
          family: 'ELE' as const,
          taskIds: [],
          criticality: 'HIGH' as const,
          createdAt: new Date().toISOString()
        }
      ];
      await db.standardComponents.bulkAdd(scmComponents);

      const scmBlueprint = {
        id: 'mchbp-scm-std',
        templateId: 'tpl-scm',
        reference: 'SCM-ALTERNATIVE',
        brand: 'SawMaster',
        model: 'SM-250-ALT',
        powerOrForce: '2.2 kW',
        energySource: 'Électrique 380V / Hydraulique',
        technicalSpecs: 'Idéale pour le débitage. Équipée d\'un système hydraulique pour lever la lame au retour et d\'un étau de serrage puissant.',
        componentIds: scmComponents.map(c => c.id),
        createdAt: new Date().toISOString()
      };
      await db.machineBlueprints.add(scmBlueprint);

      // Create Individual SCM Machine SCM-01
      const scmMachinesList = [
        {
          id: 'mach-SCM01',
          blueprintId: 'mchbp-scm-std',
          referenceCode: 'SCM-01',
          serialNumber: 'SN-SCM01-SIM',
          manufacturingYear: 2021,
          sectorId: 'SEC-06', // Fabrication Mécanique
          technicianId: null as any,
          status: 'Active' as const
        }
      ];
      await db.machines.bulkAdd(scmMachinesList);

      console.log(`[SandboxSeeder] Added ${scmMachinesList.length} SCM machines.`);

      localStorage.setItem('BDR_NEXUS_SANDBOX_SEEDED_V18', 'true');
    });
  } catch (error) {
    console.error('[SandboxSeeder] Wiping sandbox failed:', error);
  }
}
