export type ItemCategory = 
  | "Coffee Beans" 
  | "Dairy & Milk" 
  | "Syrups" 
  | "Cups & Packaging" 
  | "Cleaning Supplies" 
  | "Other";

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  minStock: number;
  cost?: number;
  totalValue?: number;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

export type TransactionType = "restock" | "withdrawal" | "adjustment" | "deletion" | "addition";

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantityBefore: number;
  quantityAfter: number;
  delta: number;
  performedBy: string;
  timestamp: string;
  note?: string;
}

export type Role = "manager" | "employee";
