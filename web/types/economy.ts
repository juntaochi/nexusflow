// Agent-to-Agent Economy Types

export type AgentCategory =
  | 'defi'
  | 'data'
  | 'compute'
  | 'oracle'
  | 'security'
  | 'analytics'
  | 'trading'
  | 'infrastructure';

export type AgentStatus = 'online' | 'busy' | 'offline';

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  status: AgentStatus;
  rating: number;
  totalJobs: number;
  successRate: number;
  pricePerTask: number;
  currency: string;
  avatar: string;
  owner: string;
  createdAt: number;
  tags: string[];
  capabilities: string[];
}

export type TransactionDirection = 'incoming' | 'outgoing';

export interface EconomyTransaction {
  id: string;
  fromAgent: string;
  fromAgentName: string;
  toAgent: string;
  toAgentName: string;
  amount: number;
  currency: string;
  taskType: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

export interface TaskStep {
  agentId: string;
  agentName: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  cost: number;
  duration?: number;
}

export interface TaskChain {
  id: string;
  name: string;
  initiator: string;
  steps: TaskStep[];
  totalCost: number;
  startTime: number;
  endTime?: number;
  status: 'active' | 'completed' | 'failed';
}

export interface ProfitShare {
  agentId: string;
  agentName: string;
  share: number;
  amount: number;
}

export interface CollaborationTask {
  id: string;
  taskChain: TaskChain;
  profitShares: ProfitShare[];
  totalRevenue: number;
}

export interface CreatorAgent {
  id: string;
  name: string;
  status: AgentStatus;
  totalEarnings: number;
  todayEarnings: number;
  totalJobs: number;
  rating: number;
  createdAt: number;
}

export interface EarningsDataPoint {
  date: string;
  earnings: number;
}

export interface CreatorEarnings {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  earningsHistory: EarningsDataPoint[];
  agents: CreatorAgent[];
}

export interface NetworkNode {
  id: string;
  name: string;
  category: AgentCategory;
  status: AgentStatus;
  activity: number; // 0-1 scale for node size
  x?: number;
  y?: number;
  z?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  active: boolean;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface EconomyStats {
  volume24h: number;
  activeAgents: number;
  tasksPerHour: number;
  avgPayment: number;
  tvl: number;
  totalTransactions: number;
}

export interface MarketplaceFilters {
  search: string;
  categories: AgentCategory[];
  minRating: number;
  maxPrice: number;
  status: AgentStatus | 'all';
  sortBy: 'rating' | 'price' | 'jobs' | 'recent';
}
