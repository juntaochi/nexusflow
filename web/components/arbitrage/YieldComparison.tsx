'use client';

import { motion } from 'framer-motion';

interface YieldComparisonProps {
  rateBase: number;
  rateOP: number;
}

export function YieldComparison({ rateBase, rateOP }: YieldComparisonProps) {
  const maxRate = Math.max(rateBase, rateOP, 1);

  return (
    <div className="grid grid-cols-2 gap-8 items-end h-40">
      <div className="space-y-4">
        <div className="relative w-full bg-white/5 rounded-t-lg overflow-hidden flex items-end justify-center" style={{ height: '100%' }}>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(rateBase / maxRate) * 100}%` }}
            className="w-full bg-blue-500/40 border-t border-blue-400"
          />
          <span className="absolute bottom-2 text-white font-black text-lg">{rateBase.toFixed(2)}%</span>
        </div>
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">Base</p>
      </div>

      <div className="space-y-4">
        <div className="relative w-full bg-white/5 rounded-t-lg overflow-hidden flex items-end justify-center" style={{ height: '100%' }}>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(rateOP / maxRate) * 100}%` }}
            className="w-full bg-red-500/40 border-t border-red-400"
          />
          <span className="absolute bottom-2 text-white font-black text-lg">{rateOP.toFixed(2)}%</span>
        </div>
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">Optimism</p>
      </div>
    </div>
  );
}
