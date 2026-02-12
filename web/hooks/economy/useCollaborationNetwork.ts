'use client';

import { useEffect, useRef } from 'react';
import { useEconomyStore } from '@/stores/economy-store';
import { generateMockTaskChains, generateMockTaskChain } from '@/lib/economy/mock-data';
import { REFRESH_INTERVALS } from '@/lib/economy/constants';

export function useCollaborationNetwork() {
  const { taskChains, setTaskChains, updateTaskChain, addTaskChain } = useEconomyStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      setTaskChains(generateMockTaskChains(5));
      isInitialized.current = true;
    }

    // Simulate task progress
    const interval = setInterval(() => {
      const activeChains = taskChains.filter((c) => c.status === 'active');

      for (const chain of activeChains) {
        const runningStepIndex = chain.steps.findIndex((s) => s.status === 'running');

        if (runningStepIndex !== -1) {
          // Complete running step
          const updatedSteps = [...chain.steps];
          updatedSteps[runningStepIndex] = {
            ...updatedSteps[runningStepIndex],
            status: 'completed',
            duration: Math.floor(Math.random() * 2000) + 500,
          };

          // Start next step or complete chain
          if (runningStepIndex < chain.steps.length - 1) {
            updatedSteps[runningStepIndex + 1] = {
              ...updatedSteps[runningStepIndex + 1],
              status: 'running',
            };
            updateTaskChain(chain.id, { steps: updatedSteps });
          } else {
            updateTaskChain(chain.id, {
              steps: updatedSteps,
              status: 'completed',
              endTime: Date.now(),
            });
          }
        }
      }

      // Occasionally add new task chain
      if (Math.random() > 0.8 && taskChains.length < 8) {
        addTaskChain(generateMockTaskChain());
      }
    }, REFRESH_INTERVALS.taskChains);

    return () => clearInterval(interval);
  }, [taskChains, setTaskChains, updateTaskChain, addTaskChain]);

  const activeChains = taskChains.filter((c) => c.status === 'active');
  const completedChains = taskChains.filter((c) => c.status === 'completed');

  return {
    taskChains,
    activeChains,
    completedChains,
  };
}
