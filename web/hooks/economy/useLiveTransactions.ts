'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useEconomyStore } from '@/stores/economy-store';
import { generateMockTransaction } from '@/lib/economy/mock-data';
import { REFRESH_INTERVALS } from '@/lib/economy/constants';

export function useLiveTransactions() {
  const { transactions, addTransaction, setTransactions } = useEconomyStore();
  const isInitialized = useRef(false);

  const generateNewTransaction = useCallback(() => {
    const tx = generateMockTransaction();
    tx.timestamp = Date.now();
    addTransaction(tx);
  }, [addTransaction]);

  useEffect(() => {
    if (!isInitialized.current) {
      // Initialize with some transactions
      const initialTxs = Array.from({ length: 10 }, () => {
        const tx = generateMockTransaction();
        tx.timestamp = Date.now() - Math.random() * 60000;
        return tx;
      }).sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(initialTxs);
      isInitialized.current = true;
    }

    // Add new transactions periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        generateNewTransaction();
      }
    }, REFRESH_INTERVALS.transactions);

    return () => clearInterval(interval);
  }, [generateNewTransaction, setTransactions]);

  return { transactions, generateNewTransaction };
}
