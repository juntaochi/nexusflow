import { create } from 'zustand';
import {
  EconomyStats,
  EconomyTransaction,
  NetworkGraphData,
  TaskChain,
  MarketplaceAgent,
  MarketplaceFilters,
  CreatorEarnings,
} from '@/types/economy';

interface EconomyState {
  // Stats
  stats: EconomyStats;
  setStats: (stats: EconomyStats) => void;

  // Live transactions
  transactions: EconomyTransaction[];
  addTransaction: (tx: EconomyTransaction) => void;
  setTransactions: (txs: EconomyTransaction[]) => void;

  // Network graph
  networkData: NetworkGraphData;
  setNetworkData: (data: NetworkGraphData) => void;

  // Active task chains
  taskChains: TaskChain[];
  addTaskChain: (chain: TaskChain) => void;
  updateTaskChain: (id: string, updates: Partial<TaskChain>) => void;
  setTaskChains: (chains: TaskChain[]) => void;

  // Marketplace
  marketplaceAgents: MarketplaceAgent[];
  setMarketplaceAgents: (agents: MarketplaceAgent[]) => void;
  filters: MarketplaceFilters;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  resetFilters: () => void;

  // Creator earnings
  creatorEarnings: CreatorEarnings | null;
  setCreatorEarnings: (earnings: CreatorEarnings) => void;

  // UI state
  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
}

const defaultFilters: MarketplaceFilters = {
  search: '',
  categories: [],
  minRating: 0,
  maxPrice: Infinity,
  status: 'all',
  sortBy: 'rating',
};

const defaultStats: EconomyStats = {
  volume24h: 0,
  activeAgents: 0,
  tasksPerHour: 0,
  avgPayment: 0,
  tvl: 0,
  totalTransactions: 0,
};

export const useEconomyStore = create<EconomyState>((set) => ({
  // Stats
  stats: defaultStats,
  setStats: (stats) => set({ stats }),

  // Live transactions
  transactions: [],
  addTransaction: (tx) =>
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 50),
    })),
  setTransactions: (transactions) => set({ transactions }),

  // Network graph
  networkData: { nodes: [], edges: [] },
  setNetworkData: (networkData) => set({ networkData }),

  // Task chains
  taskChains: [],
  addTaskChain: (chain) =>
    set((state) => ({
      taskChains: [chain, ...state.taskChains].slice(0, 20),
    })),
  updateTaskChain: (id, updates) =>
    set((state) => ({
      taskChains: state.taskChains.map((chain) =>
        chain.id === id ? { ...chain, ...updates } : chain
      ),
    })),
  setTaskChains: (taskChains) => set({ taskChains }),

  // Marketplace
  marketplaceAgents: [],
  setMarketplaceAgents: (marketplaceAgents) => set({ marketplaceAgents }),
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  // Creator earnings
  creatorEarnings: null,
  setCreatorEarnings: (creatorEarnings) => set({ creatorEarnings }),

  // UI state
  selectedAgent: null,
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  hoveredNode: null,
  setHoveredNode: (hoveredNode) => set({ hoveredNode }),
}));
