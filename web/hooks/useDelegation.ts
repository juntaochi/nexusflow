'use client';

import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { nexusDelegationConfig } from '@/lib/contracts/nexus-delegation';

export function useDelegation() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: dailyLimit } = useReadContract({
    ...nexusDelegationConfig,
    functionName: 'dailyLimit',
    query: {
      enabled: !!address,
    },
  });

  const { data: remainingAllowance } = useReadContract({
    ...nexusDelegationConfig,
    functionName: 'getRemainingDailyAllowance',
    query: {
      enabled: !!address,
    },
  });

  const authorizeSessionKey = async (key: string, authorized: boolean, expiry?: number) => {
    if (expiry) {
      return writeContractAsync({
        ...nexusDelegationConfig,
        functionName: 'authorizeSessionKey',
        args: [key as `0x${string}`, authorized, BigInt(expiry)],
      });
    }
    return writeContractAsync({
      ...nexusDelegationConfig,
      functionName: 'authorizeSessionKey',
      args: [key as `0x${string}`, authorized],
    });
  };

  return {
    dailyLimit: dailyLimit ? BigInt(dailyLimit as string) : 0n,
    remainingAllowance: remainingAllowance ? BigInt(remainingAllowance as string) : 0n,
    authorizeSessionKey,
  };
}
