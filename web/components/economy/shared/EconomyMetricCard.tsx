'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EconomyMetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: number;
  prefix?: string;
  suffix?: string;
  animate?: boolean;
}

export function EconomyMetricCard({
  label,
  value,
  icon: Icon,
  trend,
  prefix,
  suffix,
  animate = true,
}: EconomyMetricCardProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 px-6 py-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md min-w-[160px]"
    >
      <div className="flex items-center gap-2 text-[var(--theme-text-muted)] mb-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg text-primary/60">{prefix}</span>}
        <span className="text-2xl font-mono font-bold text-[var(--theme-text)] tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm text-[var(--theme-text-muted)]">{suffix}</span>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-bold mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
        </div>
      )}
    </motion.div>
  );
}
