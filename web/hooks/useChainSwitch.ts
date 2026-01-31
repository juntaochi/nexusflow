'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia, optimismSepolia } from 'wagmi/chains';

export function useChainSwitch() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const currentChain = chainId === baseSepolia.id 
    ? 'Base Sepolia' 
    : chainId === optimismSepolia.id 
    ? 'OP Sepolia' 
    : 'Unknown';

  const switchToBase = () => {
    if (isConnected && chainId !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id });
    }
  };

  const switchToOP = () => {
    if (isConnected && chainId !== optimismSepolia.id) {
      switchChain({ chainId: optimismSepolia.id });
    }
  };

  return {
    currentChain,
    chainId,
    isConnected,
    isPending,
    switchToBase,
    switchToOP,
    isBase: chainId === baseSepolia.id,
    isOP: chainId === optimismSepolia.id,
  };
}
