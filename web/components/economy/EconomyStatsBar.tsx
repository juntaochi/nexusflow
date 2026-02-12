'use client';

import { motion } from 'framer-motion';
import { Activity, Users, Zap, DollarSign, TrendingUp } from 'lucide-react';
import { useEconomyStats } from '@/hooks/economy/useEconomyStats';
import { EconomyMetricCard } from './shared/EconomyMetricCard';

export function EconomyStatsBar() {
  const { stats } = useEconomyStats();

  const metrics = [
    {
      label: '24h Volume',
      value: stats.volume24h,
      icon: DollarSign,
      prefix: '$',
      trend: 12.5,
    },
    {
      label: 'Active Agents',
      value: stats.activeAgents,
      icon: Users,
      trend: 5.2,
    },
    {
      label: 'Tasks/Hour',
      value: stats.tasksPerHour,
      icon: Zap,
      trend: 8.1,
    },
    {
      label: 'Avg Payment',
      value: stats.avgPayment.toFixed(4),
      icon: Activity,
      suffix: 'NUSD',
      trend: -2.3,
    },
    {
      label: 'TVL',
      value: stats.tvl,
      icon: TrendingUp,
      prefix: '$',
      trend: 15.7,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-x-auto scrollbar-hide"
    >
      <div className="flex gap-4 pb-2 min-w-max px-1">
        {metrics.map((metric) => (
          <EconomyMetricCard
            key={metric.label}
            {...metric}
          />
        ))}
      </div>
    </motion.div>
  );
}
