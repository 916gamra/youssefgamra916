import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/core/db';
import { catalogRepository } from '../repositories/CatalogRepository';
import { z } from 'zod';
import { logger, validatePayload } from '@/core/logger';

// Schemas (Keeping them for validation layer before calling repository)
const familySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
});

const templateSchema = z.object({
  familyId: z.string().uuid(),
  name: z.string().min(2).max(100),
  skuBase: z.string().min(2),
});

const blueprintSchema = z.object({
  templateId: z.string().uuid(),
  reference: z.string().min(2),
  unit: z.enum(['Pcs', 'Liters', 'Kg', 'Meters']),
  minThreshold: z.number().min(0),
});

export function useMasterCatalogEngine() {
  const families = useLiveQuery(() => catalogRepository.getAllFamilies());
  const templates = useLiveQuery(() => catalogRepository.getAllTemplates());
  const blueprints = useLiveQuery(() => catalogRepository.getAllBlueprints());

  const isLoading = families === undefined || templates === undefined || blueprints === undefined;

  const createFamily = async (payload: { name: string; description?: string }) => {
    const validated = validatePayload(familySchema, payload, 'CREATE_FAMILY');
    return catalogRepository.createFamily(validated);
  };

  const createTemplate = async (payload: { familyId: string; name: string; skuBase: string }) => {
    const validated = validatePayload(templateSchema, payload, 'CREATE_TEMPLATE');
    return catalogRepository.createTemplate(validated);
  };

  const createBlueprint = async (payload: { templateId: string; reference: string; unit: string; minThreshold: number }) => {
    const validated = validatePayload(blueprintSchema, payload, 'CREATE_BLUEPRINT');
    return catalogRepository.createBlueprint({
      ...validated,
      reference: validated.reference.toUpperCase()
    });
  };

  return {
    families: families || [],
    templates: templates || [],
    blueprints: blueprints || [],
    isLoading,
    createFamily,
    createTemplate,
    createBlueprint
  };
}
