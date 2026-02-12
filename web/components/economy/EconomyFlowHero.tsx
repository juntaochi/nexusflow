'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EconomyNetworkGraph } from '../three/economy/EconomyNetworkGraph';

export function EconomyFlowHero() {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F111A] to-[#1a1a2e] border border-[var(--theme-border)]">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <EconomyNetworkGraph />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>

      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0F111A] via-transparent to-transparent" />

      {/* Title overlay */}
      <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Agent Economy Network
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[var(--theme-text)] tracking-tight">
          Agent-to-Agent Economy
        </h1>
        <p className="text-sm text-[var(--theme-text-muted)] mt-1 max-w-md">
          Real-time visualization of autonomous agents collaborating, transacting, and creating value across the Superchain.
        </p>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[var(--theme-border)]">
          <span className="text-[10px] font-bold text-[var(--theme-text-muted)]">Nodes: </span>
          <span className="text-[10px] font-mono font-bold text-primary">25</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[var(--theme-border)]">
          <span className="text-[10px] font-bold text-[var(--theme-text-muted)]">Active: </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400">Live</span>
        </div>
      </div>
    </div>
  );
}
