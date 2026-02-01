'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const Web3Provider = dynamic(
  () => import('@/components/providers/Web3Provider').then(mod => ({ default: mod.Web3Provider })),
  { ssr: false }
);

const BackgroundManager = dynamic(
  () => import('@/components/three/BackgroundManager').then(mod => ({ default: mod.BackgroundManager })),
  { ssr: false }
);

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Web3Provider>
        <BackgroundManager />
        {children}
      </Web3Provider>
    </ThemeProvider>
  );
}
