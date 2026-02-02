'use client';

import { Transaction } from '@/types/transaction';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { CHAINS } from '@/lib/contracts';

interface TransactionItemProps {
  tx: Transaction;
}

export function TransactionItem({ tx }: TransactionItemProps) {
  const isBase = tx.chainId === CHAINS.BASE_SEPOLIA;
  const explorerBase = isBase ? 'https://sepolia.basescan.org' : 'https://sepolia-optimism.etherscan.io';
  const explorerUrl = `${explorerBase}/tx/${tx.hash}`;

  const statusColors = {
    pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
    failed: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const typeIcons = {
    deposit: '↓',
    withdraw: '↑',
    rebalance: '⇄',
    register: '👤',
    authorize: '🔑',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-between group hover:bg-[var(--theme-sidebar-hover)] transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-border)] flex items-center justify-center text-lg text-[var(--theme-text)]">
          {typeIcons[tx.type]}
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--theme-text)] capitalize">{tx.type}</h4>
          <p className="text-xs text-[var(--theme-text-muted)] font-medium">
            {formatDistanceToNow(tx.timestamp)} ago • {isBase ? 'Base' : 'OP'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {tx.amount && (
          <div className="text-right">
            <p className="text-sm font-bold text-[var(--theme-text)]">{tx.amount} NUSD</p>
          </div>
        )}
        
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusColors[tx.status]}`}>
          {tx.status}
        </div>

        <a 
          href={explorerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-primary hover:border-primary/50 transition-all"
        >
          ↗
        </a>
      </div>
    </motion.div>
  );
}
