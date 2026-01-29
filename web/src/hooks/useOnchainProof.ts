'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { type Address } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const AGENT_REGISTRY_READ_ABI = [
  {
    name: 'agentCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'count', type: 'uint256' }],
  },
  {
    name: 'agentIdByController',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'controller', type: 'address' }],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
] as const;

export function useOnchainProof() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const registryAddress = (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || ZERO_ADDRESS) as Address;
  const delegationAddress = (process.env.NEXT_PUBLIC_DELEGATION_CONTRACT || ZERO_ADDRESS) as Address;

  const [registryHasCode, setRegistryHasCode] = useState<boolean | null>(null);
  const [delegationHasCode, setDelegationHasCode] = useState<boolean | null>(null);
  const [agentCount, setAgentCount] = useState<bigint | null>(null);
  const [agentId, setAgentId] = useState<bigint | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!publicClient) return;
      if (registryAddress.toLowerCase() === ZERO_ADDRESS) return;

      try {
        const [registryCode, delegationCode, count, id] = await Promise.all([
          publicClient.getBytecode({ address: registryAddress }),
          publicClient.getBytecode({ address: delegationAddress }),
          publicClient.readContract({
            address: registryAddress,
            abi: AGENT_REGISTRY_READ_ABI,
            functionName: 'agentCount',
          }),
          address
            ? publicClient.readContract({
                address: registryAddress,
                abi: AGENT_REGISTRY_READ_ABI,
                functionName: 'agentIdByController',
                args: [address],
              })
            : Promise.resolve(null),
        ]);

        if (cancelled) return;

        setRegistryHasCode(Boolean(registryCode && registryCode !== '0x'));
        setDelegationHasCode(Boolean(delegationCode && delegationCode !== '0x'));
        setAgentCount((count as bigint) ?? null);
        setAgentId(id === null ? null : (id as bigint));
      } catch {
        if (cancelled) return;
        setRegistryHasCode(null);
        setDelegationHasCode(null);
        setAgentCount(null);
        setAgentId(null);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [publicClient, registryAddress, delegationAddress, address]);

  return {
    registryAddress,
    delegationAddress,
    registryHasCode,
    delegationHasCode,
    agentCount,
    agentId,
    hasRegistryAddress: registryAddress.toLowerCase() !== ZERO_ADDRESS,
  };
}
