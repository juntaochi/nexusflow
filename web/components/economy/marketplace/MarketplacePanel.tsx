'use client';

import { Store } from 'lucide-react';
import { useAgentMarketplace } from '@/hooks/economy/useAgentMarketplace';
import { AgentSearchBar } from './AgentSearchBar';
import { CategoryFilter } from './CategoryFilter';
import { MarketplaceAgentCard } from './MarketplaceAgentCard';
import { MarketplaceAgent } from '@/types/economy';

interface MarketplacePanelProps {
  onSelectAgent?: (agent: MarketplaceAgent) => void;
  onHireAgent?: (agent: MarketplaceAgent) => void;
}

export function MarketplacePanel({ onSelectAgent, onHireAgent }: MarketplacePanelProps) {
  const { agents } = useAgentMarketplace();

  return (
    <div className="h-full flex flex-col rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">
            Agent Marketplace
          </h2>
          <span className="ml-auto text-[10px] font-bold text-[var(--theme-text-muted)] bg-black/30 px-2 py-0.5 rounded-full">
            {agents.length} agents
          </span>
        </div>
        <AgentSearchBar />
        <div className="mt-3">
          <CategoryFilter />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {agents.slice(0, 8).map((agent) => (
            <MarketplaceAgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onSelectAgent?.(agent)}
              onHire={onHireAgent}
            />
          ))}
        </div>
        {agents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--theme-text-muted)]">
            <Store className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
