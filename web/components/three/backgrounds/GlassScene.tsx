'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAnimationThrottle } from '@/hooks/useAnimationThrottle';

const PANELS = [
  { position: [-4, 2, -5] as [number, number, number], rotation: [0.2, 0.3, 0], color: '#6366f1' },
  { position: [4, -1, -4] as [number, number, number], rotation: [-0.2, -0.3, 0.1], color: '#ec4899' },
  { position: [0, 3, -6] as [number, number, number], rotation: [0.1, 0, 0], color: '#6366f1' },
  { position: [-2, -2, -3] as [number, number, number], rotation: [0, 0.2, -0.1], color: '#ec4899' },
];

export function GlassScene() {
  const group = useRef<THREE.Group>(null);
  const isAnimationDisabled = useAnimationThrottle();

  useFrame((state) => {
    if (!group.current || isAnimationDisabled) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />

      {PANELS.map((panel, i) => (
        <Float
          key={i}
          position={panel.position}
          speed={0.5}
          rotationIntensity={0.3}
          floatIntensity={0.5}
        >
          <mesh rotation={panel.rotation as [number, number, number]}>
            <boxGeometry args={[3, 2, 0.1]} />
            <meshPhysicalMaterial
              color={panel.color}
              transmission={0.9}
              opacity={0.3}
              transparent
              roughness={0.1}
              metalness={0.1}
              thickness={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
