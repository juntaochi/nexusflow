'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

export function SceneContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 50 }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
