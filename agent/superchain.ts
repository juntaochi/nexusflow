import type { Address } from "viem";

export type SuperchainKey = "base-sepolia" | "op-sepolia";

export interface SuperchainContracts {
  crosschainBridge: Address;
  superchainErc20: Address;
  aavePool: Address;
  compoundComet: Address;
  tokenDecimals: number;
}

export interface SuperchainConfig {
  key: SuperchainKey;
  label: string;
  chainId: number;
  rpcUrl: string;
  explorerBaseUrl: string;
  messenger: Address;
  contracts: SuperchainContracts;
}

const MESSENGER_ADDRESS = "0x4200000000000000000000000000000000000023" as Address;

const readEnv = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
};

const requireEnv = (keys: string[], label: string): string => {
  const value = readEnv(keys);
  if (!value) {
    throw new Error(`Missing ${label} env (${keys.join(" or ")}).`);
  }
  return value;
};

const buildContracts = (prefix: "BASE_SEPOLIA" | "OP_SEPOLIA"): SuperchainContracts => {
  const suffix = prefix.toLowerCase();
  return {
    crosschainBridge: requireEnv(
      [`CROSSCHAIN_BRIDGE_${prefix}`, `NEXT_PUBLIC_BRIDGE_${prefix}`],
      `CrosschainBridge ${suffix}`
    ) as Address,
    superchainErc20: requireEnv(
      [`SUPERCHAIN_ERC20_${prefix}`, `NEXT_PUBLIC_SUPERCHAIN_ERC20_${prefix}`],
      `SuperchainERC20 ${suffix}`
    ) as Address,
    aavePool: requireEnv(
      [`AAVE_POOL_${prefix}`, `NEXT_PUBLIC_AAVE_POOL_${prefix}`],
      `Aave Pool ${suffix}`
    ) as Address,
    compoundComet: requireEnv(
      [`COMPOUND_COMET_${prefix}`, `NEXT_PUBLIC_COMPOUND_COMET_${prefix}`],
      `Compound Comet ${suffix}`
    ) as Address,
    tokenDecimals: Number(readEnv([`SUPERCHAIN_ERC20_DECIMALS_${prefix}`]) ?? 18),
  };
};

export const getSuperchainConfig = (): Record<SuperchainKey, SuperchainConfig> => {
  const baseSepoliaRpc = requireEnv(
    ["BASE_SEPOLIA_RPC", "BASE_SEPOLIA_RPC_URL"],
    "Base Sepolia RPC"
  );
  const opSepoliaRpc = requireEnv(
    ["OP_SEPOLIA_RPC", "OP_SEPOLIA_RPC_URL"],
    "OP Sepolia RPC"
  );

  return {
    "base-sepolia": {
      key: "base-sepolia",
      label: "Base Sepolia",
      chainId: 84532,
      rpcUrl: baseSepoliaRpc,
      explorerBaseUrl: "https://sepolia.basescan.org",
      messenger: MESSENGER_ADDRESS,
      contracts: buildContracts("BASE_SEPOLIA"),
    },
    "op-sepolia": {
      key: "op-sepolia",
      label: "OP Sepolia",
      chainId: 11155420,
      rpcUrl: opSepoliaRpc,
      explorerBaseUrl: "https://sepolia-optimism.etherscan.io",
      messenger: MESSENGER_ADDRESS,
      contracts: buildContracts("OP_SEPOLIA"),
    },
  };
};

export const getChainByLabel = (label: string) => {
  const config = getSuperchainConfig();
  return Object.values(config).find((chain) => chain.label === label);
};
