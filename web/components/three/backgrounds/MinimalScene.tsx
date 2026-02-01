'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useAnimationThrottle } from '@/hooks/useAnimationThrottle';

export function MinimalScene() {
  const group = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  const isAnimationDisabled = useAnimationThrottle();

  useFrame((state) => {
    if (isAnimationDisabled) return;
    
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
    
    if (cubeRef.current) {
      cubeRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      cubeRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={group}>
      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#e5e7eb" 
        cellColor="#f3f4f6" 
        position={[0, -2, 0]}
      />
      
      <mesh ref={cubeRef} position={[2, 1, -3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#d1d5db" wireframe />
      </mesh>

      <ambientLight intensity={1} />
    </group>
  );
}
