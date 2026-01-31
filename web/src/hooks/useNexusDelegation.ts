import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { type Address } from 'viem';

const NEXUS_DELEGATION_ABI = [
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'sessionKeys',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'key', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'sessionKeyExpiry',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'key', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'dailyLimit',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'dailySpent',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'tokenDailyLimits',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'tokenDailySpent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'allowedTargets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'target', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'guardians',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'recoveryThreshold',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const;

export function useNexusDelegation(delegationAddress?: Address, tokenAddress?: Address) {
  const { address: userAddress } = useAccount();

  // Read basic delegation data
  const { data: owner } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'owner',
  });

  const { data: dailyLimit } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'dailyLimit',
  });

  const { data: dailySpent } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'dailySpent',
  });

  // Read token-specific limits if token address provided
  const { data: tokenDailyLimit } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'tokenDailyLimits',
    args: tokenAddress ? [tokenAddress] : undefined,
  });

  const { data: tokenDailySpentAmount } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'tokenDailySpent',
    args: tokenAddress ? [tokenAddress] : undefined,
  });

  // Read session key status if user is connected
  const { data: isSessionKey } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'sessionKeys',
    args: userAddress ? [userAddress] : undefined,
  });

  const { data: sessionExpiry } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'sessionKeyExpiry',
    args: userAddress ? [userAddress] : undefined,
  });

  const { data: recoveryThreshold } = useReadContract({
    address: delegationAddress,
    abi: NEXUS_DELEGATION_ABI,
    functionName: 'recoveryThreshold',
  });

  // Check if specific protocols are whitelisted
  const KNOWN_PROTOCOLS = {
    'Uniswap V3': '0x2626664c2603336E57B271c5C0b26F421741e481' as Address,
    'Aave V3': '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5' as Address,
    '0x Exchange': '0xDef1C0ded9bec7F1a1670819833240f027b25EfF' as Address,
    'Superchain Messenger': '0x4200000000000000000000000000000000000023' as Address,
  };

  const { data: whitelistData } = useReadContracts({
    contracts: Object.values(KNOWN_PROTOCOLS).map((protocolAddress) => ({
      address: delegationAddress,
      abi: NEXUS_DELEGATION_ABI,
      functionName: 'allowedTargets',
      args: [protocolAddress],
    })),
  });

  const whitelist = Object.keys(KNOWN_PROTOCOLS).filter((_name, index) => {
    const result = whitelistData?.[index];
    return result?.status === 'success' && result.result === true;
  });

  return {
    owner,
    dailyLimit,
    dailySpent,
    tokenDailyLimit,
    tokenDailySpent: tokenDailySpentAmount,
    isSessionKey,
    sessionExpiry,
    recoveryThreshold,
    whitelist,
    isOwner: owner && userAddress ? owner.toLowerCase() === userAddress.toLowerCase() : false,
  };
}
