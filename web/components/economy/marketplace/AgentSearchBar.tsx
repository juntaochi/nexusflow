'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useAgentMarketplace } from '@/hooks/economy/useAgentMarketplace';

export function AgentSearchBar() {
  const { filters, setFilters } = useAgentMarketplace();

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
        <input
          type="text"
          placeholder="Search agents..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-[var(--theme-border)] text-sm text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <button className="px-4 py-2.5 rounded-xl bg-black/30 border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:border-primary/50 transition-colors">
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
