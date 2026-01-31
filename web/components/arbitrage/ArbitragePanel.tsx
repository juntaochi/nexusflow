'use client';

import { useArbitrage } from '@/hooks/useArbitrage';
import { YieldComparison } from './YieldComparison';
import { useState } from 'react';

export function ArbitragePanel() {
  const { rateBase, rateOP, spread, direction, isProfitable } = useArbitrage();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRebalance = async () => {
    setIsExecuting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsExecuting(false);
  };

  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl space-y-10">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-tighter">Superchain Arbitrage</h2>
          <p className="text-gray-500 text-sm font-medium">Monitoring cross-chain yield spreads</p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
          isProfitable ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-500'
        }`}>
          {isProfitable ? 'Opportunity Detected' : 'Monitoring'}
        </div>
      </header>

      <YieldComparison rateBase={rateBase} rateOP={rateOP} />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Optimal Direction</p>
          <p className="text-lg font-bold text-white">{direction}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Yield Spread</p>
          <p className="text-lg font-bold text-primary">{spread.toFixed(2)}%</p>
        </div>
      </div>

      <button
        onClick={handleRebalance}
        disabled={isExecuting || !isProfitable}
        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 border ${
          isProfitable 
            ? 'bg-primary text-white border-cyan-400/30 shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]' 
            : 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed'
        }`}
      >
        {isExecuting ? 'Executing Rebalance...' : 'Trigger Cross-chain Rebalance'}
      </button>

      <p className="text-center text-[10px] text-gray-600 uppercase font-medium">
        Powered by Superchain Interop & EIP-7702
      </p>
    </div>
  );
}
