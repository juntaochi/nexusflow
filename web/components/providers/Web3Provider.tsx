'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { useThemeStore } from '@/stores/theme-store';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function RainbowKitThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rainbowKitTheme = !mounted || theme === 'minimal' 
    ? lightTheme() 
    : darkTheme({
        accentColor: theme === 'cyberpunk' ? '#00ffff' : '#3b82f6',
        accentColorForeground: 'white',
        borderRadius: theme === 'glass' ? 'large' : 'medium',
      });

  return (
    <RainbowKitProvider theme={rainbowKitTheme}>
      {children}
    </RainbowKitProvider>
  );
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitThemeProvider>
          {children}
        </RainbowKitThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
