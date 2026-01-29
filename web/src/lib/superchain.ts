export type SuperchainKey = "base-sepolia" | "op-sepolia";

export interface SuperchainChain {
  key: SuperchainKey;
  label: string;
  chainId: number;
  explorerBaseUrl: string;
}

export const SUPERCHAIN_CHAINS: SuperchainChain[] = [
  {
    key: "base-sepolia",
    label: "Base Sepolia",
    chainId: 84532,
    explorerBaseUrl: "https://sepolia.basescan.org",
  },
  {
    key: "op-sepolia",
    label: "OP Sepolia",
    chainId: 11155420,
    explorerBaseUrl: "https://sepolia-optimism.etherscan.io",
  },
];

export const getChainById = (chainId: number | undefined) =>
  SUPERCHAIN_CHAINS.find((chain) => chain.chainId === chainId);

export const getChainByLabel = (label: string) =>
  SUPERCHAIN_CHAINS.find((chain) => chain.label === label);
