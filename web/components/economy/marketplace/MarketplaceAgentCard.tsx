'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { MarketplaceAgent } from '@/types/economy';
import { AgentAvatar, RatingStars, CategoryBadge, PaymentBadge } from '../shared';

interface MarketplaceAgentCardProps {
  agent: MarketplaceAgent;
  onClick?: () => void;
  onHire?: (agent: MarketplaceAgent) => void;
}

export function MarketplaceAgentCard({ agent, onClick, onHire }: MarketplaceAgentCardProps) {
  const handleHireClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHire?.(agent);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md cursor-pointer hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <AgentAvatar
          src={agent.avatar}
          name={agent.name}
          status={agent.status}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[var(--theme-text)] truncate group-hover:text-primary transition-colors">
            {agent.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={agent.category} size="sm" />
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2 mb-3">
        {agent.description}
      </p>

      <div className="flex items-center justify-between">
        <RatingStars rating={agent.rating} size="sm" />
        <PaymentBadge amount={agent.pricePerTask} size="sm" />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--theme-border)]">
        <div className="text-[10px] text-[var(--theme-text-muted)]">
          <span className="font-bold text-[var(--theme-text)]">{agent.totalJobs.toLocaleString()}</span> jobs
        </div>
        <div className="text-[10px] text-[var(--theme-text-muted)]">
          <span className="font-bold text-emerald-400">{(agent.successRate * 100).toFixed(1)}%</span> success
        </div>
        <button
          onClick={handleHireClick}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 active:scale-95 transition-all"
        >
          <Zap className="w-3 h-3" />
          Hire
        </button>
      </div>
    </motion.div>
  );
}
