'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';

// SSR Fix: Mock localStorage for server-side execution
if (typeof window === 'undefined') {
  const noop = () => null;
  global.localStorage = {
    getItem: noop,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    key: noop,
    length: 0,
  } as any;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
