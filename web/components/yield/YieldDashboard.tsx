'use client';

import { useYield } from '@/hooks/useYield';
import { YieldTicker } from './YieldTicker';
import { motion } from 'framer-motion';

export function YieldDashboard() {
  const { balance, principal, apy, isLoading } = useYield();
  const profit = balance > principal ? balance - principal : 0n;

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] animate-pulse h-64 flex items-center justify-center">
        <div className="text-[var(--theme-text-muted)]">Loading real-time yield data...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className="px-2 py-1 rounded bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-tighter animate-pulse">
            Live Accrual
          </div>
        </div>

        <p className="text-sm text-[var(--theme-text-muted)] mb-1 uppercase tracking-widest font-medium">Total Balance (NUSD)</p>
        <h2 className="text-5xl font-black text-[var(--theme-text)] mb-6 tracking-tighter">
          <YieldTicker value={balance} />
        </h2>

        <div className="grid grid-cols-2 gap-8 border-t border-[var(--theme-border)] pt-6">
          <div>
            <p className="text-xs text-[var(--theme-text-muted)] mb-1 uppercase tracking-wider">Accrued Profit</p>
            <p className="text-xl font-bold text-green-400">
              +<YieldTicker value={profit} />
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--theme-text-muted)] mb-1 uppercase tracking-wider">Current APY</p>
            <p className="text-xl font-bold text-primary">
              {apy.toFixed(2)}%
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <button className="py-4 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-sidebar-hover)] text-[var(--theme-text)] font-bold border border-[var(--theme-border)] transition-all flex items-center justify-center gap-2">
          Deposit
        </button>
        <button className="py-4 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-sidebar-hover)] text-[var(--theme-text)] font-bold border border-[var(--theme-border)] transition-all flex items-center justify-center gap-2">
          Withdraw
        </button>
      </div>
    </div>
  );
}
