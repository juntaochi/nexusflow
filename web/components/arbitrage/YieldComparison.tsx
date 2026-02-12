'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface YieldComparisonProps {
  rateBase: number;
  rateOP: number;
  direction: string;
  spread: number;
}

export function YieldComparison({ rateBase, rateOP, direction, spread }: YieldComparisonProps) {
  const maxRate = Math.max(rateBase, rateOP, 0.1);
  const baseIsHigher = rateBase >= rateOP;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-center gap-12 h-52 px-8">
        {/* Base Bar */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black text-white tabular-nums"
          >
            {rateBase.toFixed(2)}%
          </motion.div>
          <div className="relative w-full h-36 bg-white/5 rounded-xl overflow-hidden border border-white/5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((rateBase / maxRate) * 100, 4)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute bottom-0 w-full rounded-t-lg"
              style={{
                background: baseIsHigher
                  ? 'linear-gradient(to top, rgba(59,130,246,0.6), rgba(59,130,246,0.2))'
                  : 'linear-gradient(to top, rgba(59,130,246,0.3), rgba(59,130,246,0.1))',
                boxShadow: baseIsHigher ? '0 0 30px rgba(59,130,246,0.3)' : 'none',
              }}
            />
            {baseIsHigher && (
              <div className="absolute inset-0 rounded-xl border border-blue-500/30" />
            )}
          </div>
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Base Sepolia</div>
            <div className="text-[9px] text-gray-500 font-medium mt-0.5">MockAave V2</div>
          </div>
        </div>

        {/* Direction Arrow */}
        <div className="flex flex-col items-center gap-2 pb-16 shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">
              {spread.toFixed(2)}%
            </span>
          </motion.div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowRight className={`w-5 h-5 ${baseIsHigher ? 'text-blue-400 rotate-180' : 'text-red-400'}`} />
          </motion.div>
          <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{direction}</div>
        </div>

        {/* OP Bar */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black text-white tabular-nums"
          >
            {rateOP.toFixed(2)}%
          </motion.div>
          <div className="relative w-full h-36 bg-white/5 rounded-xl overflow-hidden border border-white/5">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((rateOP / maxRate) * 100, 4)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute bottom-0 w-full rounded-t-lg"
              style={{
                background: !baseIsHigher
                  ? 'linear-gradient(to top, rgba(255,4,32,0.6), rgba(255,4,32,0.2))'
                  : 'linear-gradient(to top, rgba(255,4,32,0.3), rgba(255,4,32,0.1))',
                boxShadow: !baseIsHigher ? '0 0 30px rgba(255,4,32,0.3)' : 'none',
              }}
            />
            {!baseIsHigher && (
              <div className="absolute inset-0 rounded-xl border border-red-500/30" />
            )}
          </div>
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">OP Sepolia</div>
            <div className="text-[9px] text-gray-500 font-medium mt-0.5">MockAave V2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
