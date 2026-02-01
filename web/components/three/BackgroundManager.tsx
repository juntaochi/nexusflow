'use client';

import dynamic from 'next/dynamic';
import { useThemeStore } from '@/stores/theme-store';
import { WebGLCheck } from './WebGLCheck';
import { SceneContainer } from './SceneContainer';

const CyberpunkScene = dynamic(
  () => import('./backgrounds/CyberpunkScene').then((mod) => mod.CyberpunkScene),
  { ssr: false }
);
const GlassScene = dynamic(
  () => import('./backgrounds/GlassScene').then((mod) => mod.GlassScene),
  { ssr: false }
);
const MinimalScene = dynamic(
  () => import('./backgrounds/MinimalScene').then((mod) => mod.MinimalScene),
  { ssr: false }
);

export function BackgroundManager() {
  const { theme } = useThemeStore();

  return (
    <WebGLCheck>
      <SceneContainer>
        {theme === 'cyberpunk' && <CyberpunkScene />}
        {theme === 'glass' && <GlassScene />}
        {theme === 'minimal' && <MinimalScene />}
      </SceneContainer>
    </WebGLCheck>
  );
}
