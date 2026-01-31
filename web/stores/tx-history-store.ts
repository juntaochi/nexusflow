import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction } from '@/types/transaction';

interface TxHistoryState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  clearHistory: () => void;
}

const getStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

export const useTxHistoryStore = create<TxHistoryState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) => 
        set((state) => ({ 
          transactions: [tx, ...state.transactions].slice(0, 100) 
        })),
      updateTransaction: (hash, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.hash === hash ? { ...tx, ...updates } : tx
          ),
        })),
      clearHistory: () => set({ transactions: [] }),
    }),
    {
      name: 'tx-history-storage',
      storage: createJSONStorage(() => getStorage()),
    }
  )
);
