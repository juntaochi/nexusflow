'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { NetworkEdge, NetworkNode } from '@/types/economy';

interface FlowEdgeProps {
  edge: NetworkEdge;
  sourceNode: NetworkNode;
  targetNode: NetworkNode;
  isHighlighted: boolean;
}

export function FlowEdge({ edge, sourceNode, targetNode, isHighlighted }: FlowEdgeProps) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(sourceNode.x || 0, sourceNode.y || 0, sourceNode.z || 0);
    const end = new THREE.Vector3(targetNode.x || 0, targetNode.y || 0, targetNode.z || 0);
    return [start, end];
  }, [sourceNode, targetNode]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const opacity = edge.active ? (isHighlighted ? 0.8 : 0.4) : 0.1;
  const color = edge.active ? '#FF0420' : '#ffffff';

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    }))} />
  );
}
