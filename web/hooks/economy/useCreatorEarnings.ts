'use client';

import { useEffect, useRef } from 'react';
import { useEconomyStore } from '@/stores/economy-store';
import { generateMockCreatorEarnings } from '@/lib/economy/mock-data';

export function useCreatorEarnings() {
  const { creatorEarnings, setCreatorEarnings } = useEconomyStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      setCreatorEarnings(generateMockCreatorEarnings());
      isInitialized.current = true;
    }
  }, [setCreatorEarnings]);

  return { earnings: creatorEarnings };
}
