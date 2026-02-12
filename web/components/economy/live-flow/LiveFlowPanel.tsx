'use client';

import { Radio } from 'lucide-react';
import { useLiveTransactions } from '@/hooks/economy/useLiveTransactions';
import { TransactionFeed } from './TransactionFeed';
import { MiniFlowViz } from './MiniFlowViz';

export function LiveFlowPanel() {
  const { transactions } = useLiveTransactions();

  return (
    <div className="h-full flex flex-col rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-primary" />
            <div className="absolute inset-0 animate-ping">
              <Radio className="w-4 h-4 text-primary opacity-50" />
            </div>
          </div>
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">
            Live Economy Flow
          </h2>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Streaming
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MiniFlowViz />
        <TransactionFeed transactions={transactions} />
      </div>
    </div>
  );
}
