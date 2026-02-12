'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { EconomyTransaction } from '@/types/economy';
import { AgentAvatar, PaymentBadge } from '../shared';

interface TransactionFeedProps {
  transactions: EconomyTransaction[];
  onTransactionClick?: (tx: EconomyTransaction) => void;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function TransactionFeed({ transactions, onTransactionClick }: TransactionFeedProps) {
  const handleClick = (tx: EconomyTransaction) => {
    if (tx.txHash) {
      window.open(`https://basescan.org/tx/${tx.txHash}`, '_blank');
    }
    onTransactionClick?.(tx);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {transactions.slice(0, 8).map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            layout
            onClick={() => handleClick(tx)}
            className="flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-[var(--theme-border)] hover:border-primary/20 hover:bg-black/30 transition-colors cursor-pointer group"
          >
            <AgentAvatar name={tx.fromAgentName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px]">
                <span className="font-bold text-[var(--theme-text)] truncate max-w-[60px]">
                  {tx.fromAgentName.split('#')[0]}
                </span>
                <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                <span className="font-bold text-[var(--theme-text)] truncate max-w-[60px]">
                  {tx.toAgentName.split('#')[0]}
                </span>
              </div>
              <div className="text-[8px] text-[var(--theme-text-muted)] truncate">
                {tx.taskType}
              </div>
            </div>
            <div className="text-right shrink-0 flex items-center gap-2">
              <div>
                <PaymentBadge amount={tx.amount} size="sm" />
                <div className="text-[8px] text-[var(--theme-text-muted)] mt-0.5">
                  {formatTimeAgo(tx.timestamp)}
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-[var(--theme-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
