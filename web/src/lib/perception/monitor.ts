export interface Opportunity {
  type: string;
  asset: string;
  sourceChain: string;
  targetChain: string;
  sourceRate: number;
  targetRate: number;
  spread: number;
  description: string;
}

export class DeFiMonitor {
  private static readonly PROVIDERS = [
    { name: 'Aave V3', chain: 'Base', token: 'USDC', baseApy: 0.032 },
    { name: 'Aave V3', chain: 'Optimism', token: 'USDC', baseApy: 0.034 },
    { name: 'Compound V3', chain: 'Base', token: 'USDC', baseApy: 0.028 },
    { name: 'Compound V3', chain: 'Optimism', token: 'USDC', baseApy: 0.029 },
  ];

  static async getOpportunities(): Promise<Opportunity[]> {
    const opportunities = this.PROVIDERS.map(p => ({
      ...p,
      apy: p.baseApy + (Math.random() * 0.05)
    }));

    const bestBase = opportunities.filter(o => o.chain === 'Base').sort((a, b) => b.apy - a.apy)[0];
    const bestOp = opportunities.filter(o => o.chain === 'Optimism').sort((a, b) => b.apy - a.apy)[0];

    if (!bestBase || !bestOp) return [];

    const spread = Math.abs(bestBase.apy - bestOp.apy);
    if (spread > 0.015) {
        const source = bestBase.apy > bestOp.apy ? bestOp : bestBase;
        const target = bestBase.apy > bestOp.apy ? bestBase : bestOp;
        
        return [{
            type: 'ARBITRAGE',
            asset: source.token,
            sourceChain: source.chain,
            targetChain: target.chain,
            sourceRate: source.apy,
            targetRate: target.apy,
            spread: spread,
            description: `Move ${source.token} from ${source.chain} (${(source.apy * 100).toFixed(2)}%) to ${target.chain} (${(target.apy * 100).toFixed(2)}%)`
        }];
    }
    
    return [];
  }
}

export const getCrossChainOpportunities = async (): Promise<Opportunity[]> => {
  return DeFiMonitor.getOpportunities();
};
