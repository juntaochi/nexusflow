'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useSyncExternalStore } from 'react';

// SSR Fix: Mock localStorage for server-side execution
if (typeof window === 'undefined') {
  const localStorageMock: Storage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  };
  globalThis.localStorage = localStorageMock;
}

export const config = getDefaultConfig({
  appName: 'NexusFlow',
  projectId: 'YOUR_PROJECT_ID',
  chains: [base],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  // Prevent hydration mismatch by rendering nothing on server
  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#22c55e',
          accentColorForeground: 'black',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
