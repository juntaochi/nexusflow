'use client';

import { useReadContract } from 'wagmi';
import { aavePoolConfig } from '@/lib/contracts/aave-pool';
import { CONTRACTS } from '@/lib/contracts';
import { useMemo } from 'react';

export function useArbitrage() {
  const assetBase = CONTRACTS.superchainERC20.baseSepolia.address;
  const assetOP = CONTRACTS.superchainERC20.opSepolia.address;

  const { data: reserveDataBase } = useReadContract({
    ...aavePoolConfig.baseSepolia,
    functionName: 'getReserveData',
    args: assetBase ? [assetBase] : undefined,
  });

  const { data: reserveDataOP } = useReadContract({
    ...aavePoolConfig.opSepolia,
    functionName: 'getReserveData',
    args: assetOP ? [assetOP] : undefined,
  });

  const rates = useMemo(() => {
    const rateBase = reserveDataBase ? Number((reserveDataBase as any).currentLiquidityRate) / 1e25 : 0;
    const rateOP = reserveDataOP ? Number((reserveDataOP as any).currentLiquidityRate) / 1e25 : 0;
    
    const spread = Math.abs(rateBase - rateOP);
    const direction = rateBase > rateOP ? 'OP -> Base' : 'Base -> OP';
    const isProfitable = spread > 0.5;

    return {
      rateBase,
      rateOP,
      spread,
      direction,
      isProfitable,
    };
  }, [reserveDataBase, reserveDataOP]);

  return rates;
}
