export function getExplorerBaseUrl(chainId: number): string {
  // Only the networks we use in this repo.
  if (chainId === 8453) return 'https://basescan.org';
  if (chainId === 84532) return 'https://sepolia.basescan.org';
  if (chainId === 10) return 'https://optimistic.etherscan.io';
  if (chainId === 11155420) return 'https://sepolia-optimism.etherscan.io';
  // Fallback: no explorer.
  return '';
}

export function explorerAddressUrl(chainId: number, address: string): string | null {
  const base = getExplorerBaseUrl(chainId);
  if (!base) return null;
  return `${base}/address/${address}`;
}

export function explorerTxUrl(chainId: number, txHash: string): string | null {
  const base = getExplorerBaseUrl(chainId);
  if (!base) return null;
  return `${base}/tx/${txHash}`;
}
