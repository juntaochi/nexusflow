import { http } from 'wagmi';
import { baseSepolia, optimismSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Fallback to public RPCs if env vars not set
const baseSepoliaRpc = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
const opSepoliaRpc = process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC || 'https://sepolia.optimism.io';

export const config = getDefaultConfig({
  appName: 'NexusFlow',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [baseSepolia, optimismSepolia],
  transports: {
    [baseSepolia.id]: http(baseSepoliaRpc),
    [optimismSepolia.id]: http(opSepoliaRpc),
  },
  ssr: true,
});
