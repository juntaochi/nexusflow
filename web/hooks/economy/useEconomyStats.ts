'use client';

import { useEffect, useCallback } from 'react';
import { useEconomyStore } from '@/stores/economy-store';
import { generateMockStats } from '@/lib/economy/mock-data';
import { REFRESH_INTERVALS } from '@/lib/economy/constants';

export function useEconomyStats() {
  const { stats, setStats } = useEconomyStore();

  const refreshStats = useCallback(() => {
    const newStats = generateMockStats();
    setStats(newStats);
  }, [setStats]);

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, REFRESH_INTERVALS.stats);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return { stats, refreshStats };
}
