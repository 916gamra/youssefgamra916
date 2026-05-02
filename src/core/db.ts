// src/core/db.ts
import Dexie, { type Table } from 'dexie';
import 'dexie-export-import';
import type { ExcelTemplate, ExcelBackup } from './excel/types';

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

export type OrderStatus = 'PENDING' | 'ORDERED' | 'FULFILLED' | 'CANCELLED';

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
  managerName?: string;
}

export interface Technician {
  id: string; // UUID
  name: string;
  sectorId: string; // Foreign Key to Sector
  specialty?: string;
}

export interface MachineFamily {
  id: string; // UUID
  name: string;
  description?: string;
  createdAt: string;
}

export interface MachineTemplate {
  id: string; // UUID
  familyId: string;
  name: string;
  skuBase: string; // e.g. MP for Mechanical Press
  createdAt: string;
}

export interface MachineBlueprint {
  id: string; // UUID
  templateId: string;
  reference: string; // e.g. MP-2013
  category?: string; // Optional metadata
  minThreshold?: number; // Might not apply to machines, but keeping shape
  createdAt: string;
}

export interface Machine {
  id: string; // UUID
  name: string;
  sectorId: string; // Foreign Key to Sector
  family: string;
  template: string;
  referenceCode: string;
}

export interface MachinePartMapping {
  id: string; // UUID
  machineId: string; // Foreign Key to Machine
  blueprintId: string; // Foreign Key to PdrBlueprint
  addedAt: string;
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

// --- 5. Domain Interfaces (Preventive Maintenance Engine) ---

export interface PmChecklist {
  id: string; // UUID
  name: string;
  description?: string;
  targetMachineFamily?: string; // Optional: restrict this checklist to a specific family of machines
  createdAt: string;
}

export interface PmTask {
  id: string; // UUID
  checklistId: string; // Foreign Key to PmChecklist
  order: number; // For sorting tasks logically
  taskDescription: string;
  isCritical: boolean; // Must pass or work order fails
  requiredPartTemplateId?: string; // Optional: link to a PDR Template if parts are usually consumed
}

export interface PmSchedule {
  id: string; // UUID
  machineId: string; // Foreign Key to Machine
  checklistId: string; // Foreign Key to PmChecklist
  frequencyDays: number; // e.g., 30 for monthly, 7 for weekly
  lastPerformedAt?: string;
  nextDueDate: string;
  isActive: boolean;
}

export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export interface PmWorkOrder {
  id: string; // UUID
  scheduleId?: string; // If generated from a schedule
  machineId: string; 
  checklistId: string;
  technicianId?: string; // Assigned to or claimed by
  status: WorkOrderStatus;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
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
  allowedPortals?: string[];
  lastActiveAt?: string;
}

export type AuditLogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLog {
  id: string; // UUID
  userId: string | number;
  userName: string;
  action: string; // 'CREATE', 'DELETE', 'UPDATE', 'LOGIN', 'EXPORT', 'BACKUP'
  entityType: string; // 'PDR_BLUEPRINT', 'STOCK_ITEM', 'USER', etc.
  entityId: string;
  details: string; // JSON string or plain text
  timestamp: string;
  severity: AuditLogSeverity;
  deviceInfo?: string;
}

// --- 3. The Database Engine ---

export class GmaoDatabase extends Dexie {
  // PDR Library Tables
  pdrFamilies!: Table<PdrFamily, string>;
  pdrTemplates!: Table<PdrTemplate, string>;
  pdrBlueprints!: Table<PdrBlueprint, string>;
  
  // Machine Master Data Tables
  machineFamilies!: Table<MachineFamily, string>;
  machineTemplates!: Table<MachineTemplate, string>;
  machineBlueprints!: Table<MachineBlueprint, string>;
  
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
  machinePartMappings!: Table<MachinePartMapping, string>;
  partRequisitions!: Table<PartRequisition, string>;
  partRequisitionLines!: Table<PartRequisitionLine, string>;

  // Preventive Maintenance Tables
  pmChecklists!: Table<PmChecklist, string>;
  pmTasks!: Table<PmTask, string>;
  pmSchedules!: Table<PmSchedule, string>;
  pmWorkOrders!: Table<PmWorkOrder, string>;

  // System Tables
  users!: Table<User, number>;
  auditLogs!: Table<AuditLog, string>;
  
  // Excel Integration Tables
  excelTemplates!: Table<ExcelTemplate, string>;
  excelBackups!: Table<ExcelBackup, string>;

  constructor() {
    super('CIOB_GMAO_DB');
    
    // Schema Version 12 (Added Machine Master Data tables)
    this.version(12).stores({
      pdrFamilies: 'id, name',
      pdrTemplates: 'id, familyId, name, skuBase',
      pdrBlueprints: 'id, templateId, reference',
      machineFamilies: 'id, name',
      machineTemplates: 'id, familyId, name, skuBase',
      machineBlueprints: 'id, templateId, reference',
      inventory: 'id, blueprintId, warehouseId',
      movements: 'id, stockId, type, timestamp',
      purchaseOrders: 'id, supplierName, status, orderDate',
      purchaseOrderLines: 'id, orderId, blueprintId',
      sectors: 'id, name',
      technicians: 'id, name, sectorId',
      machines: 'id, name, sectorId',
      machinePartMappings: 'id, machineId, blueprintId',
      partRequisitions: 'id, technicianId, machineId, status, requestDate',
      partRequisitionLines: 'id, requisitionId, blueprintId',
      pmChecklists: 'id, name',
      pmTasks: 'id, checklistId, order',
      pmSchedules: 'id, machineId, checklistId, nextDueDate, isActive',
      pmWorkOrders: 'id, machineId, technicianId, status, scheduledDate',
      users: '++id, name, role, isPrimary',
      auditLogs: 'id, userId, action, entityType, timestamp, severity',
      excelTemplates: 'id, portalId, name',
      excelBackups: 'id, portalId, timestamp'
    });
  }
}

export const db = new GmaoDatabase();
