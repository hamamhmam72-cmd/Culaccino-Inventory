import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  listItems,
  listTransactions,
  createItem,
  updateItem as apiUpdateItem,
  deleteItem as apiDeleteItem,
  withdrawItem as apiWithdrawItem,
  restockItem as apiRestockItem,
} from '@workspace/api-client-react';
import type { Item as ApiItem, Transaction as ApiTransaction } from '@workspace/api-client-react';

// ── Types (mirror web app's inventory.ts) ──────────────────────────────────
export type ItemCategory =
  | 'Coffee Beans'
  | 'Dairy & Milk'
  | 'Syrups'
  | 'Cups & Packaging'
  | 'Cleaning Supplies'
  | 'Other';

export type TransactionType =
  | 'restock'
  | 'withdrawal'
  | 'adjustment'
  | 'deletion'
  | 'addition';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  minStock: number;
  cost?: number;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

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

export const CATEGORIES: ItemCategory[] = [
  'Coffee Beans',
  'Dairy & Milk',
  'Syrups',
  'Cups & Packaging',
  'Cleaning Supplies',
  'Other',
];

const POLL_MS = 5000;

function toInventoryItem(item: ApiItem): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category as ItemCategory,
    quantity: item.quantity,
    unit: item.unit,
    minStock: item.minStock,
    cost: item.cost ?? undefined,
    addedBy: item.addedBy,
    addedAt: item.addedAt,
    updatedAt: item.updatedAt,
  };
}

function toTransaction(tx: ApiTransaction): Transaction {
  return {
    id: tx.id,
    itemId: tx.itemId,
    itemName: tx.itemName,
    type: tx.type as TransactionType,
    quantityBefore: tx.quantityBefore,
    quantityAfter: tx.quantityAfter,
    delta: tx.delta,
    performedBy: tx.performedBy,
    timestamp: tx.timestamp,
    note: tx.note ?? undefined,
  };
}

// ── New-item shape used by addItem ────────────────────────────────────────
export interface NewItemData {
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  minStock: number;
  cost?: number;
}

// ── Context ───────────────────────────────────────────────────────────────
interface InventoryContextType {
  items: InventoryItem[];
  transactions: Transaction[];
  loading: boolean;
  withdrawItem: (id: string, qty: number, performedBy: string, note?: string) => Promise<void>;
  restockItem: (id: string, qty: number, performedBy: string, note?: string) => Promise<void>;
  addItem: (data: NewItemData, performedBy: string) => Promise<void>;
  updateItem: (id: string, data: Partial<NewItemData>, performedBy: string) => Promise<void>;
  deleteItem: (id: string, performedBy: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const loadAll = useCallback(async () => {
    try {
      const [apiItems, apiTxs] = await Promise.all([listItems(), listTransactions()]);
      if (!mounted.current) return;
      setItems(apiItems.map(toInventoryItem));
      setTransactions(apiTxs.map(toTransaction));
    } catch (err) {
      console.error('[InventoryContext] loadAll error:', err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  // Initial load + background polling so all devices stay in sync
  useEffect(() => {
    mounted.current = true;
    loadAll();
    const interval = setInterval(loadAll, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [loadAll]);

  const withdrawItem = useCallback(
    async (id: string, qty: number, performedBy: string, note?: string) => {
      await apiWithdrawItem(id, { quantity: qty, performedBy, note });
      await loadAll();
    },
    [loadAll],
  );

  const restockItem = useCallback(
    async (id: string, qty: number, performedBy: string, note?: string) => {
      await apiRestockItem(id, { quantity: qty, performedBy, note });
      await loadAll();
    },
    [loadAll],
  );

  const addItem = useCallback(
    async (data: NewItemData, performedBy: string) => {
      await createItem({
        name: data.name.trim(),
        category: data.category,
        quantity: data.quantity,
        unit: data.unit.trim(),
        minStock: data.minStock,
        cost: data.cost ?? null,
        performedBy,
      });
      await loadAll();
    },
    [loadAll],
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<NewItemData>, performedBy: string) => {
      await apiUpdateItem(id, {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.unit !== undefined ? { unit: data.unit.trim() } : {}),
        ...(data.minStock !== undefined ? { minStock: data.minStock } : {}),
        ...(data.cost !== undefined ? { cost: data.cost } : {}),
        performedBy,
      });
      await loadAll();
    },
    [loadAll],
  );

  const deleteItem = useCallback(
    async (id: string, performedBy: string) => {
      await apiDeleteItem(id, { performedBy });
      await loadAll();
    },
    [loadAll],
  );

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  return (
    <InventoryContext.Provider value={{
      items, transactions, loading,
      withdrawItem, restockItem,
      addItem, updateItem, deleteItem,
      refresh,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
