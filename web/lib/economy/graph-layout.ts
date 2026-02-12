import { NetworkNode, NetworkEdge } from '@/types/economy';

interface LayoutNode extends NetworkNode {
  vx: number;
  vy: number;
  vz: number;
}

export function forceDirectedLayout(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  iterations: number = 100
): NetworkNode[] {
  const layoutNodes: LayoutNode[] = nodes.map((node) => ({
    ...node,
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
    z: (Math.random() - 0.5) * 5,
    vx: 0,
    vy: 0,
    vz: 0,
  }));

  const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

  const repulsion = 2;
  const attraction = 0.1;
  const damping = 0.9;
  const minDistance = 0.5;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const nodeA = layoutNodes[i];
        const nodeB = layoutNodes[j];

        const dx = nodeB.x! - nodeA.x!;
        const dy = nodeB.y! - nodeA.y!;
        const dz = nodeB.z! - nodeA.z!;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), minDistance);

        const force = repulsion / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        const fz = (dz / distance) * force;

        nodeA.vx -= fx;
        nodeA.vy -= fy;
        nodeA.vz -= fz;
        nodeB.vx += fx;
        nodeB.vy += fy;
        nodeB.vz += fz;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) continue;

      const dx = target.x! - source.x!;
      const dy = target.y! - source.y!;
      const dz = target.z! - source.z!;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const force = distance * attraction * edge.weight;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      const fz = (dz / distance) * force;

      source.vx += fx;
      source.vy += fy;
      source.vz += fz;
      target.vx -= fx;
      target.vy -= fy;
      target.vz -= fz;
    }

    // Apply velocities with damping
    for (const node of layoutNodes) {
      node.x! += node.vx;
      node.y! += node.vy;
      node.z! += node.vz;
      node.vx *= damping;
      node.vy *= damping;
      node.vz *= damping;
    }
  }

  // Normalize positions to fit within bounds
  const bounds = { x: 8, y: 6, z: 4 };
  let maxX = 0, maxY = 0, maxZ = 0;

  for (const node of layoutNodes) {
    maxX = Math.max(maxX, Math.abs(node.x!));
    maxY = Math.max(maxY, Math.abs(node.y!));
    maxZ = Math.max(maxZ, Math.abs(node.z!));
  }

  const scaleX = maxX > 0 ? bounds.x / maxX : 1;
  const scaleY = maxY > 0 ? bounds.y / maxY : 1;
  const scaleZ = maxZ > 0 ? bounds.z / maxZ : 1;

  return layoutNodes.map(({ vx, vy, vz, ...node }) => ({
    ...node,
    x: node.x! * scaleX,
    y: node.y! * scaleY,
    z: node.z! * scaleZ,
  }));
}

export function getNodeConnections(nodeId: string, edges: NetworkEdge[]): string[] {
  return edges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => (e.source === nodeId ? e.target : e.source));
}
