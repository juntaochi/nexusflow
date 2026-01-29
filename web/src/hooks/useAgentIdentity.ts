/**
 * Unified Agent Identity Hook
 * Combines World ID verification + ERC-8004 AgentRegistry
 */

import { useState, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { ISuccessResult } from '@worldcoin/idkit';
import { Address } from 'viem';

// AgentRegistry contract ABI (minimal)
const AGENT_REGISTRY_ABI = [
  {
    name: 'registerAgent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'metadataURI', type: 'string' },
    ],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    name: 'getAgent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [
      {
        name: 'profile',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'metadataURI', type: 'string' },
          { name: 'controller', type: 'address' },
          { name: 'validated', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'agentIdByController',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'controller', type: 'address' }],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: 'score', type: 'int256' }],
  },
  {
    name: 'updateReputation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'delta', type: 'int256' },
    ],
    outputs: [],
  },
] as const;

// Contract addresses (update with deployed addresses)
const AGENT_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || 
  '0x0000000000000000000000000000000000000000') as Address;

interface AgentProfile {
  name: string;
  metadataURI: string;
  controller: Address;
  validated: boolean;
}

interface AgentIdentity {
  agentId: bigint;
  profile: AgentProfile;
  reputation: bigint;
  worldIDVerified: boolean;
  nullifierHash?: string;
}

export function useAgentIdentity() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [identity, setIdentity] = useState<AgentIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verify World ID proof with backend
   */
  const verifyWorldID = useCallback(async (proof: ISuccessResult): Promise<string | null> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const response = await fetch('/api/verify/worldid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof, userAddress: address }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'World ID verification failed');
    }

    return result.nullifierHash;
  }, [address]);

  /**
   * Fetch current agent identity from registry
   */
  const fetchAgentIdentity = useCallback(async () => {
    if (!address || !publicClient) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get agent ID for this address
      const agentId = await publicClient.readContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'agentIdByController',
        args: [address],
      });

      if (agentId === BigInt(0)) {
        setIdentity(null);
        return;
      }

      // Fetch profile and reputation in parallel
      const [profileResult, reputation] = await Promise.all([
        publicClient.readContract({
          address: AGENT_REGISTRY_ADDRESS,
          abi: AGENT_REGISTRY_ABI,
          functionName: 'getAgent',
          args: [agentId],
        }),
        publicClient.readContract({
          address: AGENT_REGISTRY_ADDRESS,
          abi: AGENT_REGISTRY_ABI,
          functionName: 'getReputation',
          args: [agentId],
        }),
      ]);

      const profile = profileResult as AgentProfile;

      // Parse metadata for World ID info
      let worldIDVerified = false;
      let nullifierHash: string | undefined;
      try {
        const metadata = JSON.parse(profile.metadataURI);
        worldIDVerified = metadata.worldIDVerified || false;
        nullifierHash = metadata.nullifierHash;
      } catch {}

      setIdentity({
        agentId,
        profile,
        reputation: reputation as bigint,
        worldIDVerified,
        nullifierHash,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch identity';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient]);

  /**
   * Register agent in ERC-8004 registry
   */
  const registerAgent = useCallback(async (
    name: string,
    worldIDProof?: ISuccessResult
  ): Promise<bigint> => {
    if (!address || !walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Verify World ID if proof provided
      let nullifierHash: string | null = null;
      if (worldIDProof) {
        nullifierHash = await verifyWorldID(worldIDProof);
      }

      // Step 2: Register in AgentRegistry
      const metadataURI = JSON.stringify({
        name,
        version: '1.0.0',
        worldIDVerified: !!nullifierHash,
        nullifierHash,
        createdAt: new Date().toISOString(),
      });

      const hash = await walletClient.writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'registerAgent',
        args: [name, metadataURI],
      });

      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Extract agentId from logs (simplified)
      const agentId = BigInt(1); // In production, parse from event logs

      // Refresh identity
      await fetchAgentIdentity();

      return agentId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, verifyWorldID, fetchAgentIdentity]);

  /**
   * Vote on agent reputation
   */
  const voteReputation = useCallback(async (
    targetAgentId: bigint,
    isUpvote: boolean
  ) => {
    if (!walletClient || !publicClient) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const delta = isUpvote ? BigInt(1) : BigInt(-1);

      const hash = await walletClient.writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'updateReputation',
        args: [targetAgentId, delta],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // Refresh if voting on own agent
      if (identity && targetAgentId === identity.agentId) {
        await fetchAgentIdentity();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vote failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, publicClient, identity, fetchAgentIdentity]);

  // Auto-fetch identity when address changes
  useEffect(() => {
    if (address) {
      fetchAgentIdentity();
    } else {
      setIdentity(null);
    }
  }, [address, fetchAgentIdentity]);

  return {
    identity,
    isLoading,
    error,
    registerAgent,
    voteReputation,
    fetchAgentIdentity,
    hasAgent: identity !== null,
  };
}
