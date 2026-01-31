import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { type Address, formatUnits } from 'viem';

const MOCK_AAVE_V2_ABI = [
  {
    name: 'getCurrentBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'asset', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'deposits',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'asset', type: 'address' }
    ],
    outputs: [
      { name: 'principal', type: 'uint256' },
      { name: 'lastUpdateTime', type: 'uint256' },
      { name: 'accruedInterest', type: 'uint256' }
    ],
  },
] as const;

export function useRealProfit() {
  const { address } = useAccount();

  // Contract Addresses (V2)
  const basePool = process.env.NEXT_PUBLIC_AAVE_POOL_BASE_SEPOLIA as Address;
  const opPool = process.env.NEXT_PUBLIC_AAVE_POOL_OP_SEPOLIA as Address;
  
  const baseToken = process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_BASE_SEPOLIA as Address;
  const opToken = process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_OP_SEPOLIA as Address;

  // 1. Read Base Sepolia Data
  const { data: baseBalance } = useReadContract({
    address: basePool,
    abi: MOCK_AAVE_V2_ABI,
    functionName: 'getCurrentBalance',
    args: address && baseToken ? [address, baseToken] : undefined,
    chainId: 84532,
  });

  const { data: baseDeposit } = useReadContract({
    address: basePool,
    abi: MOCK_AAVE_V2_ABI,
    functionName: 'deposits',
    args: address && baseToken ? [address, baseToken] : undefined,
    chainId: 84532,
  });

  // 2. Read OP Sepolia Data
  const { data: opBalance } = useReadContract({
    address: opPool,
    abi: MOCK_AAVE_V2_ABI,
    functionName: 'getCurrentBalance',
    args: address && opToken ? [address, opToken] : undefined,
    chainId: 11155420,
  });

  const { data: opDeposit } = useReadContract({
    address: opPool,
    abi: MOCK_AAVE_V2_ABI,
    functionName: 'deposits',
    args: address && opToken ? [address, opToken] : undefined,
    chainId: 11155420,
  });

  // Calculate Profit
  // Base Profit
  const basePrincipal = baseDeposit ? baseDeposit[0] : 0n;
  const baseCurrent = baseBalance || 0n;
  const baseProfit = baseCurrent > basePrincipal ? baseCurrent - basePrincipal : 0n;

  // OP Profit
  const opPrincipal = opDeposit ? opDeposit[0] : 0n;
  const opCurrent = opBalance || 0n;
  const opProfit = opCurrent > opPrincipal ? opCurrent - opPrincipal : 0n;

  // Total
  const totalProfit = baseProfit + opProfit;
  const totalPrincipal = basePrincipal + opPrincipal;
  const totalBalance = baseCurrent + opCurrent;

  return {
    totalProfit: Number(formatUnits(totalProfit, 18)),
    totalPrincipal: Number(formatUnits(totalPrincipal, 18)),
    totalBalance: Number(formatUnits(totalBalance, 18)),
    baseProfit: Number(formatUnits(baseProfit, 18)),
    opProfit: Number(formatUnits(opProfit, 18)),
    hasDeposits: totalPrincipal > 0n
  };
}
