import Dexie, { type Table } from 'dexie';

export interface SparePart {
  id?: number;
  partNumber: string;
  name: string;
  description: string;
  quantity: number;
  minThreshold: number;
  location: string;
  updatedAt: Date;
}

export interface StockMovement {
  id?: number;
  partId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  date: Date;
}

export interface User {
  id?: number;
  name: string;
  role: string;
  initials: string;
  color: string;
  pin: string;
  isPrimary?: boolean;
}

export class CIOBDatabase extends Dexie {
  spareParts!: Table<SparePart, number>;
  stockMovements!: Table<StockMovement, number>;
  users!: Table<User, number>;

  constructor() {
    super('CIOB_GMAO_DB');
    this.version(1).stores({
      spareParts: '++id, partNumber, name, quantity, location'
    });
    this.version(2).stores({
      spareParts: '++id, partNumber, name, quantity, location',
      stockMovements: '++id, partId, type, date'
    });
    this.version(3).stores({
      spareParts: '++id, partNumber, name, quantity, location',
      stockMovements: '++id, partId, type, date',
      users: '++id, name, role, isPrimary'
    });
  }
}

export const db = new CIOBDatabase();
