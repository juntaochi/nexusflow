'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useAnimationThrottle } from '@/hooks/useAnimationThrottle';
import { SuperchainGlobe } from '../SuperchainGlobe';

export function CyberpunkScene() {
  const gridRef = useRef<THREE.Group>(null);
  const isAnimationDisabled = useAnimationThrottle();

  useFrame((state) => {
    if (gridRef.current && !isAnimationDisabled) {
      gridRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <>
      <color attach="background" args={['#0F111A']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} color="#FF0420" intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#0052FF" intensity={0.5} />
      
      <SuperchainGlobe />
      
      <group ref={gridRef}>
        <Grid
          position={[0, -4, 0]}
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#FF0420"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#0052FF"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
        />
      </group>
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}
