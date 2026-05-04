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

      // Ensure we remove old technician users that were used for login previously.
      const oldTechUsers = await db.users.filter(u => u.role?.includes('Technician') || u.role?.includes('Maintenance') || u.role?.includes('Souder')).toArray();
      if (oldTechUsers.length > 0) {
        await db.users.bulkDelete(oldTechUsers.map(u => u.id as number));
        console.log('[DatabaseSeeder] Removed obsolete technician login accounts.');
      }

      const userCount = await db.users.count();

      // Always force injection if force is true.
      if (force) {
        console.log('[DatabaseSeeder] Enforcing master data synchronization...');
        
        await db.transaction('rw', [
          db.pdrFamilies, db.pdrTemplates, db.pdrBlueprints, 
          db.machineFamilies, db.machineTemplates, db.machineBlueprints,
          db.sectors, db.machines, db.technicians, db.users
        ], async () => {
          // Inject/Update Master Data (Using bulkPut for idempotent sync)
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
            await db.users.bulkPut(INITIAL_DATA.users);
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
