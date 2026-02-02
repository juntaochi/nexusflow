'use client';

import { useReadContract, useAccount, useChainId } from 'wagmi';
import { aavePoolConfig } from '@/lib/contracts/aave-pool';
import { CONTRACTS, CHAINS } from '@/lib/contracts';
import { useEffect } from 'react';

export function useYield() {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const isBase = chainId === CHAINS.BASE_SEPOLIA;
  const config = isBase ? aavePoolConfig.baseSepolia : aavePoolConfig.opSepolia;
  const asset = isBase 
    ? CONTRACTS.superchainERC20.baseSepolia.address 
    : CONTRACTS.superchainERC20.opSepolia.address;

  const { data: balance, refetch: refetchBalance } = useReadContract({
    ...config,
    functionName: 'getCurrentBalance',
    args: address && asset ? [address, asset] : undefined,
    query: {
      enabled: !!address && !!asset,
    },
  });

  const { data: reserveData } = useReadContract({
    ...config,
    functionName: 'getReserveData',
    args: asset ? [asset] : undefined,
    query: {
      enabled: !!asset,
    },
  });

  const { data: depositInfo } = useReadContract({
    ...config,
    functionName: 'deposits',
    args: address && asset ? [address, asset] : undefined,
    query: {
      enabled: !!address && !!asset,
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetchBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchBalance]);

  const liquidityRate = reserveData ? (reserveData as any).currentLiquidityRate : 0;
  const apy = liquidityRate ? (Number(liquidityRate) / 1e25) : 0;

  return {
    balance: balance ? BigInt(balance as string) : 0n,
    principal: depositInfo ? BigInt((depositInfo as any).principal) : 0n,
    lastUpdateTime: depositInfo ? Number((depositInfo as any).lastUpdateTime) : 0,
    apy,
    isLoading: !balance && !!address,
    asset,
  };
}
