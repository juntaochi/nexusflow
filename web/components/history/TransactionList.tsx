'use client';

import { useTxHistory } from '@/hooks/useTxHistory';
import { TransactionItem } from './TransactionItem';
import { AnimatePresence } from 'framer-motion';

export function TransactionList() {
  const { transactions, clearHistory } = useTxHistory();

  if (transactions.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl mb-4 text-gray-600">
          ∅
        </div>
        <h3 className="text-white font-bold mb-1">No Transactions Found</h3>
        <p className="text-gray-500 text-sm">Your local transaction history is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white/80 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Recent Activity
        </h3>
        <button 
          onClick={clearHistory}
          className="text-xs font-bold text-gray-500 hover:text-red-400 uppercase tracking-widest transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {transactions.map((tx) => (
            <TransactionItem key={tx.hash} tx={tx} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
