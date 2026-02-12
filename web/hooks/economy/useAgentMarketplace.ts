'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useEconomyStore } from '@/stores/economy-store';
import { generateMockAgents } from '@/lib/economy/mock-data';
import { AgentCategory } from '@/types/economy';

export function useAgentMarketplace() {
  const {
    marketplaceAgents,
    setMarketplaceAgents,
    filters,
    setFilters,
    resetFilters,
  } = useEconomyStore();

  useEffect(() => {
    if (marketplaceAgents.length === 0) {
      setMarketplaceAgents(generateMockAgents(24));
    }
  }, [marketplaceAgents.length, setMarketplaceAgents]);

  const filteredAgents = useMemo(() => {
    let result = [...marketplaceAgents];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (agent) =>
          agent.name.toLowerCase().includes(search) ||
          agent.description.toLowerCase().includes(search) ||
          agent.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((agent) => filters.categories.includes(agent.category));
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter((agent) => agent.rating >= filters.minRating);
    }

    // Price filter
    if (filters.maxPrice < Infinity) {
      result = result.filter((agent) => agent.pricePerTask <= filters.maxPrice);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter((agent) => agent.status === filters.status);
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        result.sort((a, b) => a.pricePerTask - b.pricePerTask);
        break;
      case 'jobs':
        result.sort((a, b) => b.totalJobs - a.totalJobs);
        break;
      case 'recent':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [marketplaceAgents, filters]);

  const toggleCategory = useCallback(
    (category: AgentCategory) => {
      const current = filters.categories;
      const newCategories = current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category];
      setFilters({ categories: newCategories });
    },
    [filters.categories, setFilters]
  );

  return {
    agents: filteredAgents,
    allAgents: marketplaceAgents,
    filters,
    setFilters,
    resetFilters,
    toggleCategory,
  };
}
