'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function GlassScene() {
  const group = useRef<THREE.Group>(null);
  
  const count = 20;
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5,
    ]);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />

      {positions.map((pos, i) => (
        <Float 
          key={i} 
          position={pos as [number, number, number]} 
          speed={1.5} 
          rotationIntensity={2} 
          floatIntensity={2}
        >
          <mesh rotation={[Math.random(), Math.random(), Math.random()]}>
            <octahedronGeometry args={[0.5, 0]} />
            <MeshDistortMaterial 
              color="#fff"
              speed={1}
              distort={0.2}
              radius={1}
              transparent
              opacity={0.4}
              roughness={0}
              metalness={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
