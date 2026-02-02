'use client';

import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { agentRegistryConfig } from '@/lib/contracts/agent-registry';
import { CHAINS, CONTRACTS } from '@/lib/contracts';

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

  const { data: agentId, isLoading: isIdLoading } = useReadContract({
    ...config,
    functionName: 'agentIdByController',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: agentProfile, isLoading: isProfileLoading } = useReadContract({
    ...config,
    functionName: 'getAgent',
    args: agentId ? [agentId] : undefined,
    query: {
      enabled: !!agentId && Number(agentId) !== 0,
    },
  });

  const { data: reputation, isLoading: isReputationLoading } = useReadContract({
    ...config,
    functionName: 'getReputation',
    args: agentId ? [agentId] : undefined,
    query: {
      enabled: !!agentId && Number(agentId) !== 0,
    },
  });

  const registerAgent = async (name: string, metadataURI: string) => {
    return writeContractAsync({
      ...config,
      functionName: 'registerAgent',
      args: [name, metadataURI],
    });
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

  return {
    agentId: agentId ? Number(agentId) : 0,
    agentProfile: agentProfile as any,
    reputation: reputation ? Number(reputation) : 0,
    isLoading: isIdLoading || isProfileLoading || isReputationLoading,
    registerAgent,
    submitFeedback,
    attest,
    hasAgent: agentId ? Number(agentId) !== 0 : false,
  };
}
