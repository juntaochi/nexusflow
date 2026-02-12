'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNetworkGraph } from '@/hooks/economy/useNetworkGraph';
import { AgentNode } from './AgentNode';
import { FlowEdge } from './FlowEdge';
import { PaymentParticle } from './PaymentParticle';

export function EconomyNetworkGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const {
    nodes,
    edges,
    hoveredNode,
    setHoveredNode,
    setSelectedAgent,
    connectedNodes,
  } = useNetworkGraph();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle rotation
    groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#FF0420" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3B82F6" />

      {/* Background particles */}
      <PaymentParticle count={80} />

      {/* Edges */}
      {edges.map((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return null;

        const isHighlighted =
          hoveredNode === edge.source ||
          hoveredNode === edge.target;

        return (
          <FlowEdge
            key={`${edge.source}-${edge.target}`}
            edge={edge}
            sourceNode={source}
            targetNode={target}
            isHighlighted={isHighlighted}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <AgentNode
          key={node.id}
          node={node}
          isHovered={hoveredNode === node.id}
          isConnected={connectedNodes.has(node.id)}
          onHover={setHoveredNode}
          onClick={setSelectedAgent}
        />
      ))}
    </group>
  );
}
