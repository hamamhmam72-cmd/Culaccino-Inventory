import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useWithdrawItem,
  useRestockItem,
  getListItemsQueryKey,
  getListTransactionsQueryKey,
} from '@workspace/api-client-react';
import type { Item } from '@workspace/api-client-react';
import { InventoryItem, ItemCategory } from '../types/inventory';

const POLL_MS = 5000;

function toInventoryItem(item: Item): InventoryItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category as ItemCategory,
    quantity: item.quantity,
    unit: item.unit,
    minStock: item.minStock,
    cost: item.cost ?? undefined,
    totalValue: item.totalValue ?? undefined,
    addedBy: item.addedBy,
    addedAt: item.addedAt,
    updatedAt: item.updatedAt,
  };
}

export function useInventory() {
  const queryClient = useQueryClient();
  const { data } = useListItems({
    query: {
      queryKey: getListItemsQueryKey(),
      refetchInterval: POLL_MS,
      refetchOnWindowFocus: true,
    },
  });
  const items: InventoryItem[] = (data ?? []).map(toInventoryItem);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListItemsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
  }, [queryClient]);

  const mutationOptions = { mutation: { onSettled: invalidate } };

  const createMutation = useCreateItem(mutationOptions);
  const updateMutation = useUpdateItem(mutationOptions);
  const deleteMutation = useDeleteItem(mutationOptions);
  const withdrawMutation = useWithdrawItem(mutationOptions);
  const restockMutation = useRestockItem(mutationOptions);

  const addItem = useCallback(
    (
      itemData: Omit<InventoryItem, 'id' | 'addedAt' | 'updatedAt' | 'addedBy'> & {
        addedBy?: string;
      },
      performedBy: string,
    ) => {
      createMutation.mutate({
        data: {
          name: itemData.name,
          category: itemData.category,
          quantity: itemData.quantity,
          unit: itemData.unit,
          minStock: itemData.minStock,
          cost: itemData.cost ?? null,
          performedBy,
        },
      });
    },
    [createMutation],
  );

  const updateItem = useCallback(
    (
      id: string,
      updates: Partial<Omit<InventoryItem, 'id' | 'addedAt' | 'addedBy'>>,
      performedBy: string,
    ) => {
      updateMutation.mutate({
        id,
        data: {
          ...(updates.name !== undefined ? { name: updates.name } : {}),
          ...(updates.category !== undefined ? { category: updates.category } : {}),
          ...(updates.quantity !== undefined ? { quantity: updates.quantity } : {}),
          ...(updates.unit !== undefined ? { unit: updates.unit } : {}),
          ...(updates.minStock !== undefined ? { minStock: updates.minStock } : {}),
          ...(updates.cost !== undefined ? { cost: updates.cost } : {}),
          performedBy,
        },
      });
    },
    [updateMutation],
  );

  const deleteItem = useCallback(
    (id: string, performedBy: string) => {
      deleteMutation.mutate({ id, data: { performedBy } });
    },
    [deleteMutation],
  );

  const withdrawItem = useCallback(
    (id: string, quantity: number, performedBy: string, note?: string) => {
      withdrawMutation.mutate({ id, data: { quantity, performedBy, note } });
    },
    [withdrawMutation],
  );

  const restockItem = useCallback(
    (id: string, quantity: number, performedBy: string, note?: string) => {
      restockMutation.mutate({ id, data: { quantity, performedBy, note } });
    },
    [restockMutation],
  );

  return { items, addItem, updateItem, deleteItem, restockItem, withdrawItem };
}
