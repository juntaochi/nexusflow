'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

export function SuperchainGlobe() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  const basePos: [number, number, number] = [2, 1, 0];
  const opPos: [number, number, number] = [-2, -1, 0];

  return (
    <group ref={group}>
      <Sphere args={[3, 32, 32]}>
        <meshPhongMaterial 
          color="#111" 
          transparent 
          opacity={0.3} 
          wireframe 
        />
      </Sphere>

      <mesh position={basePos}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#0052ff" />
      </mesh>

      <mesh position={opPos}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ff0420" />
      </mesh>

      <Line
        points={[basePos, opPos]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </group>
  );
}
