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
  model?: string;
  powerOrForce?: string;
  technicalSpecs?: string;
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
  id: string; // SEC-01 to SEC-15
  name: string;
  description?: string;
  managerName: string;
  preventiveTechId?: string; // One assigned PM technician
  status: 'Active' | 'Dormant';
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
  code: string; // 2 Letters e.g. ST
  description?: string;
  technicalDescription?: string; // Mechanical process details
  createdAt: string;
}

export type MachineOperationType = 'A' | 'I' | 'H' | 'P' | 'E' | 'M' | 'S';

export interface MachineTemplate {
  id: string; // UUID
  familyId: string;
  name: string;
  type: MachineOperationType; // New: Automatic, Hydraulic, Pneumatic, Electric, Manual
  skuBase: string; // e.g. STM
  description?: string;
  technicalDescription?: string; // Functional identity details
  createdAt: string;
}

export interface MachineBlueprint {
  id: string; // UUID
  templateId: string;
  reference: string; // e.g. SAT1-00
  brand: string; // e.g. Siemens
  model: string; // Manufacturer Model
  powerOrForce: string; // e.g. 15 kW, 50 Tonnes
  energySource: string; // 380v, 220v, Pneumatic, Hydraulic, Mixed
  technicalSpecs?: string;
  category?: string; // Optional metadata
  createdAt: string;
}

export interface Machine {
  id: string; // UUID
  blueprintId: string; // Foreign Key to MachineBlueprint
  referenceCode: string; // e.g. SAT1-01
  serialNumber: string; // Physical serial number
  manufacturingYear: number;
  sectorId: string; // Foreign Key to Sector
  technicianId?: string; // Foreign Key to Technician for monthly sweep
  status: 'Active' | 'Standby' | 'Maintenance';
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

// --- 5. Domain Interfaces (Preventive Maintenance Engine - Inheritance Pattern) ---

export type TaskFamily = 'MEC' | 'ELE' | 'HYD' | 'PNU' | 'ELN';
export type TaskFrequencyType = 'TIME' | 'COUNTER';

// The "Knowledge Base" Task Definition
export interface PreventiveTask {
  id: string; // UUID
  title: string;
  family: TaskFamily;
  targetTemplateId?: string; // Optional link to a PdrTemplate (e.g. 'Hydraulic Pump' template)
  frequencyType: TaskFrequencyType;
  frequencyValue: number; // e.g. 30 (days) or 10000 (cycles)
  linkedBlueprintIds: string[]; // Linked PdrBlueprints required for this task (e.g. specific filters/oil)
  createdAt: string;
}

// Tasks assigned to a Machine Blueprint (Model Inheritance)
export interface BlueprintTask {
  id: string; // UUID
  machineBlueprintId: string; // Foreign Key to MachineBlueprint
  taskId: string; // Foreign Key to PreventiveTask
  isEnabled: boolean; // default true
  addedAt: string;
}

// Tasks assigned or overridden on a specific Machine Instance
export interface MachineTask {
  id: string; // UUID
  machineId: string; // Foreign Key to Machine
  taskId: string; // Foreign Key to PreventiveTask
  isInherited: boolean; // true if it cascaded from BlueprintTask
  isEnabled: boolean; // allow toggling inherited tasks for a specific unit
  addedAt: string;
}

export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

// Log of task executions
export interface TaskExecution {
  id: string; // UUID
  machineId: string;
  taskId: string;
  status: WorkOrderStatus;
  scheduledDate: string;
  executedAt?: string;
  doneBy?: string; // Technician ID
  notes?: string;
  durationMinutes?: number;
}

export interface UserOverride {
  id: string; // The fixed slot ID (e.g. SY-ADMIN, OP-00001)
  name?: string;
  pin?: string;
  color?: string;
  isActive?: boolean;
  realBadgeId?: string;
  allowedPortals?: string[];
  lastActiveAt?: string;
}

// Users (Preserving your existing User schema)
export interface User {
  id: string; // Changed from number to string for slot ID
  name: string;
  role: string;
  initials: string;
  color: string;
  pin: string;
  isPrimary?: boolean;
  isSystemRoot?: boolean;
  allowedPortals?: string[];
  lastActiveAt?: string;
  realBadgeId?: string; // Physical factory badge number
  isActive?: boolean;
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
  preventiveTasks!: Table<PreventiveTask, string>;
  blueprintTasks!: Table<BlueprintTask, string>;
  machineTasks!: Table<MachineTask, string>;
  taskExecutions!: Table<TaskExecution, string>;

  // System Tables
  userOverrides!: Table<UserOverride, string>;
  auditLogs!: Table<AuditLog, string>;
  
  // Excel Integration Tables
  excelTemplates!: Table<ExcelTemplate, string>;
  excelBackups!: Table<ExcelBackup, string>;

  constructor() {
    super('CIOB_GMAO_DB');
    
    // Schema Version 14 (Preventive Maintenance Inheritance Update)
    this.version(14).stores({
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
      machines: 'id, blueprintId, sectorId, technicianId',
      machinePartMappings: 'id, machineId, blueprintId',
      partRequisitions: 'id, technicianId, machineId, status, requestDate',
      partRequisitionLines: 'id, requisitionId, blueprintId',
      preventiveTasks: 'id, family, targetTemplateId',
      blueprintTasks: 'id, machineBlueprintId, taskId',
      machineTasks: 'id, machineId, taskId',
      taskExecutions: 'id, machineId, taskId, status, scheduledDate',
      userOverrides: 'id, isActive, realBadgeId',
      auditLogs: 'id, userId, action, entityType, timestamp, severity',
      excelTemplates: 'id, portalId, name',
      excelBackups: 'id, portalId, timestamp'
    });
  }
}

export const db = new GmaoDatabase();
