// src/core/db.ts
import Dexie, { type Table } from 'dexie';

// --- 1. Domain Interfaces (PDR Engine) ---

export interface PdrFamily {
  id: string; // UUID
  name: string;
  description?: string;
  createdAt: string;
}

export interface PdrTemplate {
  id: string; // UUID
  familyId: string; // Foreign Key to PdrFamily
  name: string;
  skuBase: string; // e.g., 'RLM-6200'
  description?: string;
  createdAt: string;
}

export interface PdrBlueprint {
  id: string; // UUID
  templateId: string; // Foreign Key to PdrTemplate
  reference: string; // Exact Part Number e.g., '6205-2RS'
  unit: string; // 'Pcs', 'Kg', 'Liters'
  minThreshold: number;
  createdAt: string;
}

// --- 2. Domain Interfaces (Stock Engine) ---

export interface StockItem {
  id: string; // UUID
  blueprintId: string; // Foreign Key to PdrBlueprint
  warehouseId: string;
  quantityCurrent: number;
  locationDetails?: string; // e.g., 'Aisle 3, Shelf B'
  updatedAt: string;
}

export interface StockMovement {
  id: string; // UUID
  stockId: string; // Foreign Key to StockItem
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  performedBy: string; // User ID or Name
  notes?: string;
  timestamp: string;
}

// --- 3. Domain Interfaces (Procurement Engine) ---

export type OrderStatus = 'DRAFT' | 'ORDERED' | 'DELIVERED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string; // UUID
  supplierName: string;
  status: OrderStatus;
  orderDate: string;
  expectedDelivery?: string;
  createdAt: string;
}

export interface PurchaseOrderLine {
  id: string; // UUID
  orderId: string; // Foreign Key to PurchaseOrder
  blueprintId: string; // Foreign Key to PdrBlueprint
  quantity: number;
  unitPrice?: number;
}

// --- 4. Domain Interfaces (Organization & Requisition Engine) ---

export interface Sector {
  id: string; // UUID
  name: string;
  description?: string;
}

export interface Technician {
  id: string; // UUID
  name: string;
  sectorId: string; // Foreign Key to Sector
  specialty?: string;
}

export interface Machine {
  id: string; // UUID
  name: string;
  sectorId: string; // Foreign Key to Sector
  family: string;
  template: string;
  referenceCode: string;
}

export type RequisitionStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED';

export interface PartRequisition {
  id: string; // UUID
  technicianId: string; // Foreign Key to Technician
  machineId: string; // Foreign Key to Machine
  status: RequisitionStatus;
  requestDate: string;
}

export interface PartRequisitionLine {
  id: string; // UUID
  requisitionId: string; // Foreign Key to PartRequisition
  blueprintId: string; // Foreign Key to PdrBlueprint
  quantity: number;
}

// Users (Preserving your existing User schema)
export interface User {
  id?: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  pin: string;
  isPrimary?: boolean;
}

// --- 3. The Database Engine ---

export class GmaoDatabase extends Dexie {
  // PDR Library Tables
  pdrFamilies!: Table<PdrFamily, string>;
  pdrTemplates!: Table<PdrTemplate, string>;
  pdrBlueprints!: Table<PdrBlueprint, string>;
  
  // Stock Engine Tables
  inventory!: Table<StockItem, string>;
  movements!: Table<StockMovement, string>;
  
  // Procurement Engine Tables
  purchaseOrders!: Table<PurchaseOrder, string>;
  purchaseOrderLines!: Table<PurchaseOrderLine, string>;
  
  // Organization & Requisition Engine Tables
  sectors!: Table<Sector, string>;
  technicians!: Table<Technician, string>;
  machines!: Table<Machine, string>;
  partRequisitions!: Table<PartRequisition, string>;
  partRequisitionLines!: Table<PartRequisitionLine, string>;

  // System Tables
  users!: Table<User, number>;

  constructor() {
    super('CIOB_GMAO_DB');
    
    // Schema Version 7 (Pivot to Requisition ERP)
    this.version(7).stores({
      pdrFamilies: 'id, name',
      pdrTemplates: 'id, familyId, name, skuBase',
      pdrBlueprints: 'id, templateId, reference',
      inventory: 'id, blueprintId, warehouseId',
      movements: 'id, stockId, type, timestamp',
      purchaseOrders: 'id, supplierName, status, orderDate',
      purchaseOrderLines: 'id, orderId, blueprintId',
      sectors: 'id, name',
      technicians: 'id, name, sectorId',
      machines: 'id, name, sectorId',
      partRequisitions: 'id, technicianId, machineId, status, requestDate',
      partRequisitionLines: 'id, requisitionId, blueprintId',
      users: '++id, name, role, isPrimary'
    });
  }
}


export const db = new GmaoDatabase();
