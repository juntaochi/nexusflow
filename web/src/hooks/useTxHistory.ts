import { useState } from 'react';

export interface TransactionRecord {
  hash: string;
  action: string;
  timestamp: number;
  status: 'Success' | 'Pending' | 'Failed';
  explorerUrl?: string;
}

const STORAGE_KEY = 'nexus_agent_tx_history';

export function useTxHistory() {
  // Lazy initialization to load from localStorage only on initial render
  const [history, setHistory] = useState<TransactionRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse tx history', e);
      return [];
    }
  });

  const addTransaction = (tx: TransactionRecord) => {
    setHistory((prev) => {
      const updated = [tx, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addTransaction, clearHistory };
}
