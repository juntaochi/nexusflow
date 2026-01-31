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
      className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
          {typeIcons[tx.type]}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white capitalize">{tx.type}</h4>
          <p className="text-xs text-gray-500 font-medium">
            {formatDistanceToNow(tx.timestamp)} ago • {isBase ? 'Base' : 'OP'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {tx.amount && (
          <div className="text-right">
            <p className="text-sm font-bold text-white">{tx.amount} USDC</p>
          </div>
        )}
        
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusColors[tx.status]}`}>
          {tx.status}
        </div>

        <a 
          href={explorerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/50 transition-all"
        >
          ↗
        </a>
      </div>
    </motion.div>
  );
}
