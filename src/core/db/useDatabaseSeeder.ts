import { useEffect } from 'react';
import { db } from '../db';
import { INITIAL_DATA } from './seedData';
import { toast } from 'sonner';

export function runDatabaseSeed(force = false) {
  return async () => {
    try {
      const pdrFamilyCount = await db.pdrFamilies.count();
      const machineFamilyCount = await db.machineFamilies.count();
      const machineCount = await db.machines.count();

      try {
        // ALWAYS run this cleanup to remove corrupted/old seed V1 items
        const oldBlueprints = await db.machineBlueprints.toArray();
        // The old bad seeded items had -V1, or they were specified manually in the oldSeedIds list.
        const oldSeedIds = [
          'bp-mech-press-standard', 'bp-hyd-press-nc', 'bp-tourne-p-std', 
          'bp-scotcheuse-auto', 'bp-traitement-surf', 'bp-ravivage', 
          'bp-transpalette', 'bp-compresseur', 'bp-pompage', 'bp-elevateur', 
          'bp-transformateur', 'bp-visseuse', 'bp-poinconneuse', 
          'bp-sertissage-bec', 'bp-moteur-meule'
        ];
        const badBlueprints = oldBlueprints.filter(b => b.reference.includes('-V1') || oldSeedIds.includes(b.id));
        if (badBlueprints.length > 0) {
           const badIds = badBlueprints.map(b => b.id);
           await db.machineBlueprints.bulkDelete(badIds);
           console.log('[DatabaseSeeder] DELETED OLD BAD BLUEPRINTS:', badIds);
        }

        const oldMachines = await db.machines.toArray();
        const badMachines = oldMachines.filter(m => m.id.startsWith('mach-') && m.referenceCode.includes('20'));
        if (badMachines.length > 0) {
           const badIds = badMachines.map(m => m.id);
           await db.machines.bulkDelete(badIds);
           console.log('[DatabaseSeeder] DELETED OLD BAD MACHINES:', badIds);
        }

        const oldPdrBlueprints = await db.pdrBlueprints.toArray();
        const badPdrBlueprints = oldPdrBlueprints.filter(b => b.reference && b.reference.includes('-V1'));
        if (badPdrBlueprints.length > 0) {
           const badIds = badPdrBlueprints.map(b => b.id);
           await db.pdrBlueprints.bulkDelete(badIds);
           console.log('[DatabaseSeeder] DELETED OLD BAD PDR BLUEPRINTS:', badIds);
        }
      } catch (err) {
        console.error('Cleanup error:', err);
      }

      // Always force injection if force is true.
      if (force || machineCount === 0 || machineFamilyCount === 0 || pdrFamilyCount === 0) {
        console.log('[DatabaseSeeder] Enforcing master data synchronization...');
        
        await db.transaction('rw', [
          db.pdrFamilies, db.pdrTemplates, db.pdrBlueprints, 
          db.machineFamilies, db.machineTemplates, db.machineBlueprints,
          db.sectors, db.machines
        ], async () => {
          // Inject/Update Master Data (Using bulkPut for idempotent sync)
          await db.pdrFamilies.bulkPut(INITIAL_DATA.pdrFamilies);
          await db.machineFamilies.bulkPut(INITIAL_DATA.machineFamilies);
          await db.machineTemplates.bulkPut(INITIAL_DATA.machineTemplates);
          await db.sectors.bulkPut(INITIAL_DATA.sectors);
          
          if (machineCount === 0) {
            await db.machines.bulkPut(INITIAL_DATA.machines);
          }
          await db.pdrTemplates.bulkPut(INITIAL_DATA.pdrTemplates);
          await db.pdrBlueprints.bulkPut(INITIAL_DATA.pdrBlueprints);

          if (INITIAL_DATA.machineBlueprints && INITIAL_DATA.machineBlueprints.length > 0) {
            await db.machineBlueprints.bulkPut(INITIAL_DATA.machineBlueprints);
          }
        });

        console.log('[DatabaseSeeder] Master data successfully synchronized.');
      }
    } catch (error) {
      console.error('Failed to inject master data into Dexie', error);
      toast.error("Initialization Error", {
        description: "Failed to load master data.",
      });
    }
  };
}

// Hook alternative
export function useDatabaseSeeder() {
  useEffect(() => {
    runDatabaseSeed()();
  }, []);
}
