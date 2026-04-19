import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';

export function usePdrLibrary() {
  const families = useLiveQuery(() => db.pdrFamilies.toArray());
  const templates = useLiveQuery(() => db.pdrTemplates.toArray());
  const blueprints = useLiveQuery(() => db.pdrBlueprints.toArray());

  const isLoading = families === undefined || templates === undefined || blueprints === undefined;

  const templateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (templates) {
      templates.forEach(t => {
        counts.set(t.familyId, (counts.get(t.familyId) || 0) + 1);
      });
    }
    return counts;
  }, [templates]);

  const blueprintCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (blueprints) {
      blueprints.forEach(b => {
        counts.set(b.templateId, (counts.get(b.templateId) || 0) + 1);
      });
    }
    return counts;
  }, [blueprints]);

  const linkPartToMachine = async (machineId: string, blueprintId: string) => {
    // Prevent duplicates
    const existing = await db.machinePartMappings
      .where({ machineId, blueprintId })
      .first();
    
    if (existing) return;

    await db.machinePartMappings.add({
      id: crypto.randomUUID(),
      machineId,
      blueprintId,
      addedAt: new Date().toISOString()
    });
  };

  const unlinkPartFromMachine = async (machineId: string, blueprintId: string) => {
    await db.machinePartMappings
      .where({ machineId, blueprintId })
      .delete();
  };

  const getMachineBOM = (machineId?: string) => {
    return useLiveQuery(async () => {
      if (!machineId) return [];
      const mappings = await db.machinePartMappings.where('machineId').equals(machineId).toArray();
      const blueprintIds = mappings.map(m => m.blueprintId);
      return db.pdrBlueprints.where('id').anyOf(blueprintIds).toArray();
    }, [machineId]);
  };

  return {
    families: families || [],
    templates: templates || [],
    blueprints: blueprints || [],
    templateCounts,
    blueprintCounts,
    isLoading,
    linkPartToMachine,
    unlinkPartFromMachine,
    getMachineBOM
  };
}
