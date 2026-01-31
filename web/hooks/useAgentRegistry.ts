'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { agentRegistryConfig } from '@/lib/contracts/agent-registry';

export function useAgentRegistry() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: agentId, isLoading: isIdLoading } = useReadContract({
    ...agentRegistryConfig,
    functionName: 'agentIdByController',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: agentProfile, isLoading: isProfileLoading } = useReadContract({
    ...agentRegistryConfig,
    functionName: 'getAgent',
    args: agentId ? [agentId] : undefined,
    query: {
      enabled: !!agentId && Number(agentId) !== 0,
    },
  });

  const { data: reputation, isLoading: isReputationLoading } = useReadContract({
    ...agentRegistryConfig,
    functionName: 'getReputation',
    args: agentId ? [agentId] : undefined,
    query: {
      enabled: !!agentId && Number(agentId) !== 0,
    },
  });

  const registerAgent = async (name: string, metadataURI: string) => {
    return writeContractAsync({
      ...agentRegistryConfig,
      functionName: 'registerAgent',
      args: [name, metadataURI],
    });
  };

  return {
    agentId: agentId ? Number(agentId) : 0,
    agentProfile: agentProfile as any,
    reputation: reputation ? Number(reputation) : 0,
    isLoading: isIdLoading || isProfileLoading || isReputationLoading,
    registerAgent,
    hasAgent: agentId ? Number(agentId) !== 0 : false,
  };
}
