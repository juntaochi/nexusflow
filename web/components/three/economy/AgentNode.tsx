'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NetworkNode } from '@/types/economy';
import { CATEGORY_COLORS } from '@/lib/economy/constants';

interface AgentNodeProps {
  node: NetworkNode;
  isHovered: boolean;
  isConnected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function AgentNode({ node, isHovered, isConnected, onHover, onClick }: AgentNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const color = CATEGORY_COLORS[node.category];
  const baseSize = 0.15 + node.activity * 0.15;
  const targetScale = isHovered ? 1.5 : isConnected ? 1.2 : 1;

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth scale transition
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    // Gentle floating animation
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = (node.y || 0) + Math.sin(time * 0.5 + (node.x || 0)) * 0.05;

    // Glow pulse
    if (glowRef.current && node.status === 'online') {
      const pulse = 0.5 + Math.sin(time * 2) * 0.2;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * (isHovered ? 0.8 : 0.4);
    }
  });

  return (
    <group position={[node.x || 0, node.y || 0, node.z || 0]}>
      {/* Glow effect */}
      <mesh ref={glowRef} scale={[baseSize * 2.5, baseSize * 2.5, baseSize * 2.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(node.id)}
        onPointerLeave={() => onHover(null)}
        onClick={() => onClick(node.id)}
      >
        <sphereGeometry args={[baseSize, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.8 : 0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Status indicator ring */}
      {node.status === 'online' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseSize * 1.3, baseSize * 1.5, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
