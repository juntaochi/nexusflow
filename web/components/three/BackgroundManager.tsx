'use client';

import dynamic from 'next/dynamic';
import { WebGLCheck } from './WebGLCheck';
import { SceneContainer } from './SceneContainer';

const CyberpunkScene = dynamic(
  () => import('./backgrounds/CyberpunkScene').then((mod) => mod.CyberpunkScene),
  { ssr: false }
);

export function BackgroundManager() {
  return (
    <WebGLCheck>
      <SceneContainer>
        <CyberpunkScene />
      </SceneContainer>
    </WebGLCheck>
  );
}
