'use client';

import { useTxHistoryStore } from '@/stores/tx-history-store';
import { Transaction, TransactionType } from '@/types/transaction';
import { useChainId } from 'wagmi';

export function useTxHistory() {
  const chainId = useChainId();
  const { transactions, addTransaction, updateTransaction, clearHistory } = useTxHistoryStore();

  const recordTransaction = (
    hash: string, 
    type: TransactionType, 
    amount?: string, 
    asset?: string
  ) => {
    const newTx: Transaction = {
      hash,
      type,
      amount,
      asset,
      timestamp: Date.now(),
      status: 'pending',
      chainId,
    };
    addTransaction(newTx);
    return newTx;
  };

  const confirmTransaction = (hash: string, success: boolean = true) => {
    updateTransaction(hash, { status: success ? 'confirmed' : 'failed' });
  };

  return {
    transactions,
    recordTransaction,
    confirmTransaction,
    clearHistory,
  };
}
