// src/core/seed.ts
import { db } from './db';

// وظيفة مساعدة لتوليد معرفات بسيطة (لتجنب تعقيدات مكتبات خارجية الآن)
const generateId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);

export async function seedDatabase() {
  try {
    // 1. فتح معاملة (Transaction) لضمان سلامة الحقن (إما ينجح كله أو يفشل كله)
    await db.transaction('rw', [db.pdrFamilies, db.pdrTemplates, db.pdrBlueprints, db.inventory, db.movements], async () => {
      
      // تنظيف القاعدة للبدء على أرضية صلبة
      await db.pdrFamilies.clear();
      await db.pdrTemplates.clear();
      await db.pdrBlueprints.clear();
      await db.inventory.clear();
      await db.movements.clear();

      const now = new Date().toISOString();

      // --- 1. حقن العائلات (Families) ---
      const familyRoulementsId = generateId();
      const familyCourroiesId = generateId();
      const familyElectriqueId = generateId();

      await db.pdrFamilies.bulkAdd([
        { id: familyRoulementsId, name: 'Roulements', description: 'Roulements mécaniques industriels', createdAt: now },
        { id: familyCourroiesId, name: 'Courroies', description: 'Courroies de transmission', createdAt: now },
        { id: familyElectriqueId, name: 'Composants Électriques', description: 'Contacteurs, disjoncteurs, relais', createdAt: now },
      ]);

      // --- 2. حقن القوالب (Templates) ---
      const templateBillesId = generateId();
      const templateRouleauxId = generateId();
      const templateTrapId = generateId();
      const templateContacteurId = generateId();

      await db.pdrTemplates.bulkAdd([
        { id: templateBillesId, familyId: familyRoulementsId, name: 'Roulement à billes standard', skuBase: 'RLM-B', createdAt: now },
        { id: templateRouleauxId, familyId: familyRoulementsId, name: 'Roulement à rouleaux coniques', skuBase: 'RLM-R', createdAt: now },
        { id: templateTrapId, familyId: familyCourroiesId, name: 'Courroie Trapézoïdale', skuBase: 'CRT-T', createdAt: now },
        { id: templateContacteurId, familyId: familyElectriqueId, name: 'Contacteur de Puissance', skuBase: 'CNT-P', createdAt: now },
      ]);

      // --- 3. حقن القطع النهائية (Blueprints) ---
      const bp6204Id = generateId();
      const bp6205Id = generateId();
      const bpA32Id = generateId();
      const bpLC1DId = generateId();

      await db.pdrBlueprints.bulkAdd([
        { id: bp6204Id, templateId: templateBillesId, reference: '6204-2RS', unit: 'Pcs', minThreshold: 10, createdAt: now },
        { id: bp6205Id, templateId: templateBillesId, reference: '6205-2RS', unit: 'Pcs', minThreshold: 15, createdAt: now },
        { id: bpA32Id, templateId: templateTrapId, reference: 'A-32 (13x813)', unit: 'Pcs', minThreshold: 5, createdAt: now },
        { id: bpLC1DId, templateId: templateContacteurId, reference: 'LC1D09M7 (220V)', unit: 'Pcs', minThreshold: 3, createdAt: now },
      ]);

      // --- 4. حقن المخزون الفعلي (Inventory) ---
      const stock1Id = generateId();
      const stock2Id = generateId();
      const stock3Id = generateId();
      const stock4Id = generateId();

      await db.inventory.bulkAdd([
        { id: stock1Id, blueprintId: bp6204Id, warehouseId: 'MAG-01', quantityCurrent: 25, locationDetails: 'Rayon A - Étagère 2', updatedAt: now },
        { id: stock2Id, blueprintId: bp6205Id, warehouseId: 'MAG-01', quantityCurrent: 8, locationDetails: 'Rayon A - Étagère 2', updatedAt: now }, // حالة نقص (Low Stock) لأن 8 < 15
        { id: stock3Id, blueprintId: bpA32Id, warehouseId: 'MAG-01', quantityCurrent: 12, locationDetails: 'Rayon C - Étagère 1', updatedAt: now },
        { id: stock4Id, blueprintId: bpLC1DId, warehouseId: 'MAG-02', quantityCurrent: 0, locationDetails: 'Armoire Électrique', updatedAt: now }, // حالة نفاذ (Out of Stock)
      ]);

      // --- 5. حقن الحركات (Movements) ---
      await db.movements.bulkAdd([
        { id: generateId(), stockId: stock1Id, type: 'IN', quantity: 25, performedBy: 'Admin', notes: 'Initial Stock', timestamp: now },
        { id: generateId(), stockId: stock2Id, type: 'IN', quantity: 10, performedBy: 'Admin', notes: 'Initial Stock', timestamp: now },
        { id: generateId(), stockId: stock2Id, type: 'OUT', quantity: 2, performedBy: 'Youssef', notes: 'Machine 3 Repair', timestamp: now },
      ]);

    });

    console.log('✅ Database successfully seeded with Master PDR Data!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return false;
  }
}
