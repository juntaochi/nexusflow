'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

export function MinimalScene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
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
        sectionColor="#eee" 
        cellColor="#ccc" 
        position={[0, -2, 0]}
      />
      
      <mesh position={[0, 0, -5]}>
        <boxGeometry args={[10, 10, 0.1]} />
        <meshBasicMaterial color="#f9fafb" />
      </mesh>

      <ambientLight intensity={1} />
    </group>
  );
}
