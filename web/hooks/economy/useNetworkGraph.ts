'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useEconomyStore } from '@/stores/economy-store';
import { generateMockNetworkData } from '@/lib/economy/mock-data';
import { forceDirectedLayout } from '@/lib/economy/graph-layout';
import { REFRESH_INTERVALS } from '@/lib/economy/constants';

export function useNetworkGraph() {
  const {
    networkData,
    setNetworkData,
    hoveredNode,
    setHoveredNode,
    selectedAgent,
    setSelectedAgent,
  } = useEconomyStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const data = generateMockNetworkData(25);
      const layoutNodes = forceDirectedLayout(data.nodes, data.edges);
      setNetworkData({ nodes: layoutNodes, edges: data.edges });
      isInitialized.current = true;
    }

    // Periodically update edge activity
    const interval = setInterval(() => {
      setNetworkData({
        ...networkData,
        edges: networkData.edges.map((edge) => ({
          ...edge,
          active: Math.random() > 0.3,
        })),
      });
    }, REFRESH_INTERVALS.network);

    return () => clearInterval(interval);
  }, [networkData, setNetworkData]);

  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();
    connected.add(hoveredNode);
    networkData.edges.forEach((edge) => {
      if (edge.source === hoveredNode) connected.add(edge.target);
      if (edge.target === hoveredNode) connected.add(edge.source);
    });
    return connected;
  }, [hoveredNode, networkData.edges]);

  return {
    nodes: networkData.nodes,
    edges: networkData.edges,
    hoveredNode,
    setHoveredNode,
    selectedAgent,
    setSelectedAgent,
    connectedNodes,
  };
}
