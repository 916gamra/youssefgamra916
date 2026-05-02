import { useEffect } from 'react';
import { db } from '../db';
import { INITIAL_DATA } from './seedData';
import { toast } from 'sonner';

export function runDatabaseSeed(force = false) {
  return async () => {
    try {
      const familyCount = await db.pdrFamilies.count();
      const machineCount = await db.machines.count();

      if (force || familyCount === 0 || machineCount === 0) {
        await db.transaction('rw', [db.pdrFamilies, db.pdrTemplates, db.pdrBlueprints, db.sectors, db.machines], async () => {
          // Clear tables just in case of partial failed seed
          await db.pdrFamilies.clear();
          await db.pdrTemplates.clear();
          await db.pdrBlueprints.clear();
          await db.sectors.clear();
          await db.machines.clear();

          // Inject Master Data
          await db.pdrFamilies.bulkAdd(INITIAL_DATA.families);
          await db.sectors.bulkAdd(INITIAL_DATA.sectors);
          await db.machines.bulkAdd(INITIAL_DATA.machines);
          await db.pdrTemplates.bulkAdd(INITIAL_DATA.templates);
          await db.pdrBlueprints.bulkAdd(INITIAL_DATA.blueprints);
        });

        toast.success("System Initialized: Master Data Injected", {
            description: "Industrial parameters successfully loaded.",
        });
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
