'use client';

import { motion } from 'framer-motion';
import { Settings, BarChart3 } from 'lucide-react';
import { CreatorAgent } from '@/types/economy';
import { AgentAvatar } from '../shared';
import { STATUS_COLORS } from '@/lib/economy/constants';

interface MyAgentsListProps {
  agents: CreatorAgent[];
  onAgentClick?: (agent: CreatorAgent) => void;
  onSettingsClick?: (agent: CreatorAgent) => void;
  onStatsClick?: (agent: CreatorAgent) => void;
}

export function MyAgentsList({ agents, onAgentClick, onSettingsClick, onStatsClick }: MyAgentsListProps) {
  return (
    <div className="space-y-2">
      {agents.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onAgentClick?.(agent)}
          className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-[var(--theme-border)] hover:border-primary/20 hover:bg-black/30 transition-colors cursor-pointer group"
        >
          <AgentAvatar name={agent.name} status={agent.status} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--theme-text)] truncate group-hover:text-primary transition-colors">
                {agent.name}
              </span>
              <span
                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${STATUS_COLORS[agent.status]}20`,
                  color: STATUS_COLORS[agent.status],
                }}
              >
                {agent.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--theme-text-muted)]">
              <span>
                <span className="font-bold text-[var(--theme-text)]">{agent.totalJobs.toLocaleString()}</span> jobs
              </span>
              <span>
                <span className="font-bold text-amber-400">{agent.rating.toFixed(1)}</span> rating
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <div className="text-xs font-mono font-bold text-primary">
                +${agent.todayEarnings.toFixed(2)}
              </div>
              <div className="text-[8px] text-[var(--theme-text-muted)]">today</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatsClick?.(agent);
              }}
              className="p-1.5 rounded-lg bg-black/20 text-[var(--theme-text-muted)] hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
              title="View Stats"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSettingsClick?.(agent);
              }}
              className="p-1.5 rounded-lg bg-black/20 text-[var(--theme-text-muted)] hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
