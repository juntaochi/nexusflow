'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { TaskChain } from '@/types/economy';
import { PaymentBadge } from '../shared';

interface TaskChainVizProps {
  chain: TaskChain;
}

export function TaskChainViz({ chain }: TaskChainVizProps) {
  return (
    <div className="p-3 rounded-xl bg-black/20 border border-[var(--theme-border)]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-[var(--theme-text)] truncate">{chain.name}</h4>
        <span
          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
            chain.status === 'active'
              ? 'bg-primary/20 text-primary'
              : chain.status === 'completed'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {chain.status}
        </span>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-[var(--theme-border)]" />

        <div className="space-y-3">
          {chain.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 relative"
            >
              <div className="relative z-10 shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Circle className="w-6 h-6 text-[var(--theme-text-muted)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--theme-text)] truncate">
                    {step.agentName.split('#')[0]}
                  </span>
                  <PaymentBadge amount={step.cost} size="sm" />
                </div>
                <div className="text-[8px] text-[var(--theme-text-muted)]">
                  {step.action}
                  {step.duration && (
                    <span className="ml-2 text-emerald-400">{step.duration}ms</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[var(--theme-border)] flex items-center justify-between">
        <span className="text-[8px] text-[var(--theme-text-muted)]">Total Cost</span>
        <PaymentBadge amount={chain.totalCost} />
      </div>
    </div>
  );
}
