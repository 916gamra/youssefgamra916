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

      if (force || pdrFamilyCount === 0 || machineFamilyCount === 0 || machineCount === 0) {
        console.log('[DatabaseSeeder] Initiating master data injection...');
        
        await db.transaction('rw', [
          db.pdrFamilies, db.pdrTemplates, db.pdrBlueprints, 
          db.machineFamilies, db.machineTemplates, db.machineBlueprints,
          db.sectors, db.machines, db.technicians, db.users
        ], async () => {
          // Inject/Update Master Data (Using bulkPut for idempotent sync)
          // We provide explicit IDs for most entities to ensure idempotency
          await db.pdrFamilies.bulkPut(INITIAL_DATA.pdrFamilies);
          await db.machineFamilies.bulkPut(INITIAL_DATA.machineFamilies);
          await db.machineTemplates.bulkPut(INITIAL_DATA.machineTemplates);
          await db.sectors.bulkPut(INITIAL_DATA.sectors);
          await db.machines.bulkPut(INITIAL_DATA.machines);
          await db.pdrTemplates.bulkPut(INITIAL_DATA.pdrTemplates);
          await db.pdrBlueprints.bulkPut(INITIAL_DATA.pdrBlueprints);
          
          if (INITIAL_DATA.machineBlueprints) {
            await db.machineBlueprints.bulkPut(INITIAL_DATA.machineBlueprints);
          }
          
          if (INITIAL_DATA.technicians) {
            await db.technicians.bulkPut(INITIAL_DATA.technicians);
          }
          
          if (INITIAL_DATA.users) {
            // Since users table uses ++id, but we provided explicit IDs in seedData, bulkPut will work
            await db.users.bulkPut(INITIAL_DATA.users);
          }
        });

        console.log('[DatabaseSeeder] Master data successfully injected.');

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
