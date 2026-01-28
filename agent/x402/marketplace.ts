/**
 * Strategy Marketplace Registry
 * Agents register and discover premium strategies
 */

export interface StrategyListing {
  id: string;
  name: string;
  description: string;
  agentId: bigint;
  agentController: string;
  category: "yield" | "mev" | "arbitrage" | "portfolio";
  priceUSDC: string;
  endpoint: string;
  successRate: number;
  totalCalls: number;
  averageSavings?: string;
  verified: boolean;
  createdAt: number;
}

export class StrategyMarketplace {
  private strategies: Map<string, StrategyListing> = new Map();

  /**
   * Register a new strategy in the marketplace
   */
  registerStrategy(listing: Omit<StrategyListing, "id" | "successRate" | "totalCalls" | "createdAt">): string {
    const id = `strategy_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const strategy: StrategyListing = {
      ...listing,
      id,
      successRate: 0,
      totalCalls: 0,
      createdAt: Date.now(),
    };

    this.strategies.set(id, strategy);
    console.log(`✅ Strategy registered: ${listing.name} (${id})`);
    
    return id;
  }

  /**
   * Discover strategies by category
   */
  discoverStrategies(params?: {
    category?: StrategyListing["category"];
    maxPrice?: number;
    minSuccessRate?: number;
    verifiedOnly?: boolean;
  }): StrategyListing[] {
    let results = Array.from(this.strategies.values());

    if (params?.category) {
      results = results.filter((s) => s.category === params.category);
    }

    if (params?.maxPrice) {
      results = results.filter((s) => parseFloat(s.priceUSDC) <= params.maxPrice);
    }

    if (params?.minSuccessRate) {
      results = results.filter((s) => s.successRate >= params.minSuccessRate);
    }

    if (params?.verifiedOnly) {
      results = results.filter((s) => s.verified);
    }

    // Sort by success rate and total calls
    return results.sort((a, b) => {
      const scoreA = a.successRate * Math.log10(a.totalCalls + 1);
      const scoreB = b.successRate * Math.log10(b.totalCalls + 1);
      return scoreB - scoreA;
    });
  }

  /**
   * Get strategy by ID
   */
  getStrategy(id: string): StrategyListing | undefined {
    return this.strategies.get(id);
  }

  /**
   * Update strategy metrics after execution
   */
  recordExecution(id: string, success: boolean, savingsPercent?: number) {
    const strategy = this.strategies.get(id);
    if (!strategy) return;

    strategy.totalCalls++;
    
    // Update success rate (exponential moving average)
    const alpha = 0.1; // Weight for new data
    strategy.successRate = 
      strategy.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;

    // Update average savings
    if (savingsPercent && success) {
      const currentAvg = parseFloat(strategy.averageSavings || "0");
      strategy.averageSavings = (
        currentAvg * (1 - alpha) + savingsPercent * alpha
      ).toFixed(2) + "%";
    }

    this.strategies.set(id, strategy);
  }

  /**
   * Get leaderboard (top performing strategies)
   */
  getLeaderboard(limit: number = 10): StrategyListing[] {
    return this.discoverStrategies().slice(0, limit);
  }

  /**
   * Verify strategy (for admin/governance)
   */
  verifyStrategy(id: string, verified: boolean) {
    const strategy = this.strategies.get(id);
    if (!strategy) return false;

    strategy.verified = verified;
    this.strategies.set(id, strategy);
    return true;
  }
}

// Global singleton instance
export const globalMarketplace = new StrategyMarketplace();

// Seed with NexusFlow's own strategies
globalMarketplace.registerStrategy({
  name: "Premium Yield Optimizer",
  description: "AI-curated yield opportunities across Superchain with risk analysis",
  agentId: BigInt(1),
  agentController: "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab00",
  category: "yield",
  priceUSDC: "0.005",
  endpoint: "/api/strategies/yield",
  averageSavings: "2.5%",
  verified: true,
});

globalMarketplace.registerStrategy({
  name: "MEV Protection Suite",
  description: "Protect transactions from MEV with Flashbots and private mempools",
  agentId: BigInt(1),
  agentController: "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab00",
  category: "mev",
  priceUSDC: "0.01",
  endpoint: "/api/strategies/mev",
  averageSavings: "1.8%",
  verified: true,
});

globalMarketplace.registerStrategy({
  name: "Cross-Chain Arbitrage Scanner",
  description: "Real-time arbitrage opportunities across Base and Optimism",
  agentId: BigInt(1),
  agentController: "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab00",
  category: "arbitrage",
  priceUSDC: "0.003",
  endpoint: "/api/strategies/arbitrage",
  averageSavings: "0.8%",
  verified: true,
});
