import {
  MarketplaceAgent,
  EconomyTransaction,
  TaskChain,
  CreatorEarnings,
  NetworkGraphData,
  EconomyStats,
  AgentCategory,
  AgentStatus,
} from '@/types/economy';

const AGENT_NAMES = [
  'YieldHunter', 'DataOracle', 'RiskGuard', 'SwapMaster', 'PriceBot',
  'LiquiditySeeker', 'ArbitrageX', 'GasOptimizer', 'BridgeRunner', 'PoolScanner',
  'MEVProtector', 'FlashLoan', 'StakeManager', 'RebalanceBot', 'FeeCollector',
];

const CATEGORIES: AgentCategory[] = [
  'defi', 'data', 'compute', 'oracle', 'security', 'analytics', 'trading', 'infrastructure'
];

const TASK_TYPES = [
  'Yield Analysis', 'Price Feed', 'Risk Assessment', 'Route Discovery',
  'Liquidity Check', 'Gas Estimation', 'Bridge Quote', 'Pool Analysis',
  'Arbitrage Scan', 'Rebalance Calc', 'Fee Optimization', 'MEV Protection',
];

const CAPABILITIES_MAP: Record<AgentCategory, string[]> = {
  defi: ['Yield Farming', 'Liquidity Provision', 'Staking', 'Lending'],
  data: ['Price Feeds', 'Historical Data', 'Market Analysis', 'Indexing'],
  compute: ['ML Inference', 'Data Processing', 'Simulation', 'Optimization'],
  oracle: ['Price Oracle', 'VRF', 'Cross-chain Data', 'Event Monitoring'],
  security: ['Audit', 'MEV Protection', 'Risk Scoring', 'Anomaly Detection'],
  analytics: ['Portfolio Analysis', 'Performance Tracking', 'Reporting', 'Forecasting'],
  trading: ['Order Execution', 'Arbitrage', 'Market Making', 'Swap Routing'],
  infrastructure: ['Bridge', 'Relay', 'Sequencing', 'Gas Management'],
};

function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateMockAgent(index?: number): MarketplaceAgent {
  const category = randomChoice(CATEGORIES);
  const name = index !== undefined
    ? AGENT_NAMES[index % AGENT_NAMES.length]
    : randomChoice(AGENT_NAMES);

  return {
    id: randomId(),
    name: `${name}#${Math.floor(Math.random() * 9000) + 1000}`,
    description: `Specialized ${category} agent providing automated services for the Superchain ecosystem.`,
    category,
    status: randomChoice<AgentStatus>(['online', 'online', 'online', 'busy', 'offline']),
    rating: randomRange(3.5, 5),
    totalJobs: Math.floor(randomRange(10, 5000)),
    successRate: randomRange(0.92, 0.999),
    pricePerTask: randomRange(0.001, 0.1),
    currency: 'NUSD',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomId()}`,
    owner: `0x${randomId()}${randomId()}`,
    createdAt: Date.now() - Math.floor(randomRange(86400000, 86400000 * 365)),
    tags: [category, 'superchain', randomChoice(['fast', 'reliable', 'cheap', 'premium'])],
    capabilities: CAPABILITIES_MAP[category].slice(0, Math.floor(randomRange(2, 4))),
  };
}

export function generateMockAgents(count: number): MarketplaceAgent[] {
  return Array.from({ length: count }, (_, i) => generateMockAgent(i));
}

export function generateMockTransaction(): EconomyTransaction {
  const fromName = randomChoice(AGENT_NAMES);
  const toName = randomChoice(AGENT_NAMES.filter(n => n !== fromName));

  return {
    id: randomId(),
    fromAgent: randomId(),
    fromAgentName: `${fromName}#${Math.floor(Math.random() * 9000) + 1000}`,
    toAgent: randomId(),
    toAgentName: `${toName}#${Math.floor(Math.random() * 9000) + 1000}`,
    amount: randomRange(0.001, 0.5),
    currency: 'NUSD',
    taskType: randomChoice(TASK_TYPES),
    timestamp: Date.now() - Math.floor(randomRange(0, 3600000)),
    status: randomChoice(['completed', 'completed', 'completed', 'pending']),
    txHash: `0x${randomId()}${randomId()}${randomId()}${randomId()}`,
  };
}

export function generateMockTransactions(count: number): EconomyTransaction[] {
  return Array.from({ length: count }, () => generateMockTransaction())
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function generateMockTaskChain(): TaskChain {
  const stepCount = Math.floor(randomRange(2, 5));
  const steps = Array.from({ length: stepCount }, (_, i) => ({
    agentId: randomId(),
    agentName: `${randomChoice(AGENT_NAMES)}#${Math.floor(Math.random() * 9000) + 1000}`,
    action: randomChoice(TASK_TYPES),
    status: i === stepCount - 1
      ? randomChoice(['running', 'pending'] as const)
      : 'completed' as const,
    cost: randomRange(0.001, 0.05),
    duration: i < stepCount - 1 ? Math.floor(randomRange(500, 3000)) : undefined,
  }));

  return {
    id: randomId(),
    name: `${randomChoice(['Yield Optimization', 'Cross-chain Swap', 'Arbitrage Execution', 'Risk Assessment', 'Portfolio Rebalance'])}`,
    initiator: `0x${randomId()}${randomId()}`,
    steps,
    totalCost: steps.reduce((sum, s) => sum + s.cost, 0),
    startTime: Date.now() - Math.floor(randomRange(60000, 600000)),
    status: 'active',
  };
}

export function generateMockTaskChains(count: number): TaskChain[] {
  return Array.from({ length: count }, () => generateMockTaskChain());
}

export function generateMockCreatorEarnings(): CreatorEarnings {
  const agents = Array.from({ length: Math.floor(randomRange(2, 5)) }, () => ({
    id: randomId(),
    name: `${randomChoice(AGENT_NAMES)}#${Math.floor(Math.random() * 9000) + 1000}`,
    status: randomChoice<AgentStatus>(['online', 'online', 'busy', 'offline']),
    totalEarnings: randomRange(10, 500),
    todayEarnings: randomRange(0.1, 10),
    totalJobs: Math.floor(randomRange(100, 5000)),
    rating: randomRange(4, 5),
    createdAt: Date.now() - Math.floor(randomRange(86400000 * 7, 86400000 * 180)),
  }));

  // Generate cumulative earnings (monotonically increasing)
  let cumulative = 0;
  const earningsHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    // Daily earnings increase with some variance, always positive
    const dailyEarning = randomRange(5, 50);
    cumulative += dailyEarning;
    return {
      date: date.toISOString().split('T')[0],
      earnings: cumulative,
    };
  });

  const totalEarnings = agents.reduce((sum, a) => sum + a.totalEarnings, 0);
  const todayEarnings = agents.reduce((sum, a) => sum + a.todayEarnings, 0);

  return {
    totalEarnings,
    todayEarnings,
    weeklyEarnings: earningsHistory[earningsHistory.length - 1].earnings - earningsHistory[earningsHistory.length - 8].earnings,
    monthlyEarnings: earningsHistory[earningsHistory.length - 1].earnings,
    earningsHistory,
    agents,
  };
}

export function generateMockNetworkData(nodeCount: number = 20): NetworkGraphData {
  const nodes = Array.from({ length: nodeCount }, () => ({
    id: randomId(),
    name: `${randomChoice(AGENT_NAMES)}#${Math.floor(Math.random() * 9000) + 1000}`,
    category: randomChoice(CATEGORIES),
    status: randomChoice<AgentStatus>(['online', 'online', 'online', 'busy', 'offline']),
    activity: randomRange(0.2, 1),
  }));

  const edges: NetworkGraphData['edges'] = [];
  const edgeCount = Math.floor(nodeCount * 1.5);

  for (let i = 0; i < edgeCount; i++) {
    const source = randomChoice(nodes).id;
    const target = randomChoice(nodes.filter(n => n.id !== source)).id;

    if (!edges.some(e => (e.source === source && e.target === target) || (e.source === target && e.target === source))) {
      edges.push({
        source,
        target,
        weight: randomRange(0.1, 1),
        active: Math.random() > 0.3,
      });
    }
  }

  return { nodes, edges };
}

export function generateMockStats(): EconomyStats {
  return {
    volume24h: randomRange(50000, 500000),
    activeAgents: Math.floor(randomRange(150, 500)),
    tasksPerHour: Math.floor(randomRange(500, 2000)),
    avgPayment: randomRange(0.01, 0.1),
    tvl: randomRange(1000000, 10000000),
    totalTransactions: Math.floor(randomRange(100000, 1000000)),
  };
}
