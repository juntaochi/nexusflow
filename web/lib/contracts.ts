import { Address } from 'viem';

export const CHAINS = {
  BASE_SEPOLIA: 84532,
  OP_SEPOLIA: 11155420,
} as const;

export type ChainId = typeof CHAINS[keyof typeof CHAINS];

export interface ContractConfig {
  address: Address;
  chainId: ChainId;
}

export const CONTRACTS = {
  agentRegistry: {
    address: (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || '0x') as Address,
    chainId: CHAINS.BASE_SEPOLIA,
  } as ContractConfig & { opSepolia: ContractConfig },
  
  nexusDelegation: {
    address: (process.env.NEXT_PUBLIC_NEXUS_DELEGATION_ADDRESS || '0x') as Address,
    chainId: CHAINS.BASE_SEPOLIA,
  } as ContractConfig & { opSepolia: ContractConfig },
  
  aavePool: {
    baseSepolia: {
      address: (process.env.NEXT_PUBLIC_AAVE_POOL_BASE_SEPOLIA || '0x') as Address,
      chainId: CHAINS.BASE_SEPOLIA,
    } as ContractConfig,
    opSepolia: {
      address: (process.env.NEXT_PUBLIC_AAVE_POOL_OP_SEPOLIA || '0x') as Address,
      chainId: CHAINS.OP_SEPOLIA,
    } as ContractConfig,
  },
  
  compoundComet: {
    baseSepolia: {
      address: (process.env.NEXT_PUBLIC_COMPOUND_COMET_BASE_SEPOLIA || '0x') as Address,
      chainId: CHAINS.BASE_SEPOLIA,
    } as ContractConfig,
    opSepolia: {
      address: (process.env.NEXT_PUBLIC_COMPOUND_COMET_OP_SEPOLIA || '0x') as Address,
      chainId: CHAINS.OP_SEPOLIA,
    } as ContractConfig,
  },
  
  crosschainBridge: {
    baseSepolia: {
      address: (process.env.NEXT_PUBLIC_CROSSCHAIN_BRIDGE_BASE_SEPOLIA || '0x') as Address,
      chainId: CHAINS.BASE_SEPOLIA,
    } as ContractConfig,
    opSepolia: {
      address: (process.env.NEXT_PUBLIC_CROSSCHAIN_BRIDGE_OP_SEPOLIA || '0x') as Address,
      chainId: CHAINS.OP_SEPOLIA,
    } as ContractConfig,
  },
  
  superchainERC20: {
    baseSepolia: {
      address: (process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_BASE_SEPOLIA || '0x') as Address,
      chainId: CHAINS.BASE_SEPOLIA,
    } as ContractConfig,
    opSepolia: {
      address: (process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_OP_SEPOLIA || '0x') as Address,
      chainId: CHAINS.OP_SEPOLIA,
    } as ContractConfig,
  },
} as const;

// Patch in the OP Sepolia addresses dynamically to avoid breaking type inference above
(CONTRACTS.agentRegistry as any).opSepolia = {
  address: (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS_OP || '0x') as Address,
  chainId: CHAINS.OP_SEPOLIA,
};

(CONTRACTS.nexusDelegation as any).opSepolia = {
  address: (process.env.NEXT_PUBLIC_DELEGATION_CONTRACT_OP || '0x') as Address,
  chainId: CHAINS.OP_SEPOLIA,
};

export const RPC_URLS = {
  [CHAINS.BASE_SEPOLIA]: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  [CHAINS.OP_SEPOLIA]: process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC || 'https://sepolia.optimism.io',
} as const;
