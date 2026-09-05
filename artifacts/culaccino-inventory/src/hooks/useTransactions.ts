import {
  useListTransactions,
  getListTransactionsQueryKey,
} from '@workspace/api-client-react';
import type { Transaction as ApiTransaction } from '@workspace/api-client-react';
import { Transaction, TransactionType } from '../types/inventory';

const POLL_MS = 5000;

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

export function useTransactions() {
  const { data } = useListTransactions({
    query: {
      queryKey: getListTransactionsQueryKey(),
      refetchInterval: POLL_MS,
      refetchOnWindowFocus: true,
    },
  });
  const transactions: Transaction[] = (data ?? []).map(toTransaction);
  return { transactions };
}
