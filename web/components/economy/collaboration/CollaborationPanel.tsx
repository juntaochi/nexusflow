'use client';

import { GitBranch } from 'lucide-react';
import { useCollaborationNetwork } from '@/hooks/economy/useCollaborationNetwork';
import { TaskChainViz } from './TaskChainViz';

export function CollaborationPanel() {
  const { activeChains, completedChains } = useCollaborationNetwork();

  return (
    <div className="h-full flex flex-col rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">
            Collaboration Network
          </h2>
          <span className="ml-auto text-[10px] font-bold text-[var(--theme-text-muted)] bg-black/30 px-2 py-0.5 rounded-full">
            {activeChains.length} active
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeChains.length === 0 && completedChains.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--theme-text-muted)]">
            <GitBranch className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No active collaborations</p>
          </div>
        ) : (
          <>
            {activeChains.map((chain) => (
              <TaskChainViz key={chain.id} chain={chain} />
            ))}
            {completedChains.slice(0, 2).map((chain) => (
              <TaskChainViz key={chain.id} chain={chain} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
