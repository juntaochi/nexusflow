import React from 'react';
import { TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { Opportunity } from '@/lib/perception/monitor';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onExecute: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onExecute }) => {
  return (
    <div className="border border-green-500/50 bg-green-500/5 p-4 rounded-lg font-mono">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-green-400">
          <TrendingUp size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Arbitrage Opportunity Detected</span>
        </div>
        <div className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded">
          {(opportunity.spread * 100).toFixed(2)}% SPREAD
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-[10px] text-green-500/50 mb-1">{opportunity.sourceChain.toUpperCase()}</div>
          <div className="text-lg text-white">{(opportunity.sourceRate * 100).toFixed(1)}%</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[10px] text-green-500/50 mb-1">{opportunity.asset}</div>
          <ArrowRight className="text-green-500" size={20} />
        </div>
        <div className="text-center">
          <div className="text-[10px] text-green-500/50 mb-1">{opportunity.targetChain.toUpperCase()}</div>
          <div className="text-lg text-green-400 font-bold">{(opportunity.targetRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <button
        onClick={onExecute}
        className="w-full py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors group"
      >
        <Zap size={14} className="fill-current" />
        EXECUTE CROSS-CHAIN REBALANCE
      </button>
      
      <div className="mt-2 text-[10px] text-center text-green-500/30">
        Gas: Sponsored (Free) | Atomic via Superchain Interop
      </div>
    </div>
  );
};
