'use client';

import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { agentRegistryConfig } from '@/lib/contracts/agent-registry';
import { CHAINS, CONTRACTS } from '@/lib/contracts';

interface AgentProfile {
  name: string;
  metadataURI: string;
  controller: string;
  validated: boolean;
}

export function useAgentRegistry() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();

  // Determine correct config based on chain
  const isOp = chainId === CHAINS.OP_SEPOLIA;
  const addressConfig = isOp ? (CONTRACTS.agentRegistry as any).opSepolia.address : CONTRACTS.agentRegistry.address;

  const config = {
    ...agentRegistryConfig,
    address: addressConfig,
  };

  // Get all agent IDs for this controller
  const { data: agentIds, isLoading: isIdsLoading, refetch: refetchAgentIds } = useReadContract({
    ...config,
    functionName: 'getAgentsByController',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Get agent count
  const { data: agentCount } = useReadContract({
    ...config,
    functionName: 'getAgentCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // For backward compatibility, get the first agent's profile and reputation
  const firstAgentId = agentIds && (agentIds as bigint[]).length > 0 ? (agentIds as bigint[])[0] : undefined;

  const { data: agentProfile, isLoading: isProfileLoading } = useReadContract({
    ...config,
    functionName: 'getAgent',
    args: firstAgentId ? [firstAgentId] : undefined,
    query: {
      enabled: !!firstAgentId,
    },
  });

  const { data: reputation, isLoading: isReputationLoading } = useReadContract({
    ...config,
    functionName: 'getReputation',
    args: firstAgentId ? [firstAgentId] : undefined,
    query: {
      enabled: !!firstAgentId,
    },
  });

  const registerAgent = async (name: string, metadataURI: string) => {
    const result = await writeContractAsync({
      ...config,
      functionName: 'registerAgent',
      args: [name, metadataURI],
    });
    // Refetch agent IDs after registration
    await refetchAgentIds();
    return result;
  };

  const submitFeedback = async (agentId: bigint, delta: number, jobHash: `0x${string}`, evidenceURI: string) => {
    return writeContractAsync({
      ...config,
      functionName: 'submitFeedback',
      args: [agentId, BigInt(delta), jobHash, evidenceURI],
    });
  };

  const attest = async (agentId: bigint, jobHash: `0x${string}`, ok: boolean, evidenceURI: string) => {
    return writeContractAsync({
      ...config,
      functionName: 'attest',
      args: [agentId, jobHash, ok, evidenceURI],
    });
  };

  const updateAgent = async (agentId: bigint, name: string, metadataURI: string) => {
    return writeContractAsync({
      ...config,
      functionName: 'updateAgent',
      args: [agentId, name, metadataURI],
    });
  };

  const myAgentIds = (agentIds as bigint[]) || [];
  const myAgentCount = agentCount ? Number(agentCount) : myAgentIds.length;

  return {
    // Single agent (backward compatibility)
    agentId: firstAgentId ? Number(firstAgentId) : 0,
    agentProfile: agentProfile as AgentProfile | undefined,
    reputation: reputation ? Number(reputation) : 0,

    // Multiple agents support
    myAgentIds,
    myAgentCount,

    // Status
    isLoading: isIdsLoading || isProfileLoading || isReputationLoading,
    hasAgent: myAgentIds.length > 0,

    // Actions
    registerAgent,
    submitFeedback,
    attest,
    updateAgent,
    refetchAgentIds,
  };
}

/**
 * Hook to get details for a specific agent by ID
 */
export function useAgentDetails(agentId: bigint | number | undefined) {
  const chainId = useChainId();
  const isOp = chainId === CHAINS.OP_SEPOLIA;
  const addressConfig = isOp ? (CONTRACTS.agentRegistry as any).opSepolia.address : CONTRACTS.agentRegistry.address;

  const config = {
    ...agentRegistryConfig,
    address: addressConfig,
  };

  const { data: profile, isLoading: isProfileLoading } = useReadContract({
    ...config,
    functionName: 'getAgent',
    args: agentId !== undefined ? [BigInt(agentId)] : undefined,
    query: {
      enabled: agentId !== undefined,
    },
  });

  const { data: reputation, isLoading: isReputationLoading } = useReadContract({
    ...config,
    functionName: 'getReputation',
    args: agentId !== undefined ? [BigInt(agentId)] : undefined,
    query: {
      enabled: agentId !== undefined,
    },
  });

  const { data: isTrusted } = useReadContract({
    ...config,
    functionName: 'isTrusted',
    args: agentId !== undefined ? [BigInt(agentId)] : undefined,
    query: {
      enabled: agentId !== undefined,
    },
  });

  return {
    profile: profile as AgentProfile | undefined,
    reputation: reputation ? Number(reputation) : 0,
    isTrusted: isTrusted as boolean | undefined,
    isLoading: isProfileLoading || isReputationLoading,
  };
}
