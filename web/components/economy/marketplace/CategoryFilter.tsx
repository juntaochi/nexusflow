'use client';

import { AgentCategory } from '@/types/economy';
import { CategoryBadge } from '../shared/CategoryBadge';
import { useAgentMarketplace } from '@/hooks/economy/useAgentMarketplace';

const ALL_CATEGORIES: AgentCategory[] = [
  'defi', 'data', 'compute', 'oracle', 'security', 'analytics', 'trading', 'infrastructure'
];

export function CategoryFilter() {
  const { filters, toggleCategory } = useAgentMarketplace();

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map((category) => (
        <CategoryBadge
          key={category}
          category={category}
          size="sm"
          selected={filters.categories.includes(category)}
          onClick={() => toggleCategory(category)}
        />
      ))}
    </div>
  );
}
