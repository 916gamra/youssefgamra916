import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { INDUSTRIAL_CATALOG } from '@/core/config/industrialGenetics';

export function useMachineLibrary() {
  const blueprints = useLiveQuery(() => db.machineBlueprints.toArray());

  const families = INDUSTRIAL_CATALOG.families;
  const templates = INDUSTRIAL_CATALOG.templates;

  const isLoading = blueprints === undefined;

  const templateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    templates.forEach(t => {
      counts.set(t.familyId, (counts.get(t.familyId) || 0) + 1);
    });
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

  return {
    families,
    templates,
    blueprints: blueprints || [],
    templateCounts,
    blueprintCounts,
    isLoading,
  };
}
