'use client';

import { useThemeStore } from '@/stores/theme-store';
import { WebGLCheck } from './WebGLCheck';
import { SceneContainer } from './SceneContainer';
import { CyberpunkScene } from './backgrounds/CyberpunkScene';
import { GlassScene } from './backgrounds/GlassScene';
import { MinimalScene } from './backgrounds/MinimalScene';

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
