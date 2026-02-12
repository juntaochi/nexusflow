'use client';

import { useState } from 'react';
import { Sparkles, Plus, TrendingUp } from 'lucide-react';
import { useCreatorEarnings } from '@/hooks/economy/useCreatorEarnings';
import { MyAgentsList } from './MyAgentsList';
import { RevenueChart } from './RevenueChart';
import { AgentStatsModal } from './AgentStatsModal';
import { CreatorAgent } from '@/types/economy';

interface CreatorPanelProps {
  onDeployClick?: () => void;
}

export function CreatorPanel({ onDeployClick }: CreatorPanelProps) {
  const { earnings } = useCreatorEarnings();
  const [selectedAgent, setSelectedAgent] = useState<CreatorAgent | null>(null);

  if (!earnings) {
    return (
      <div className="h-full flex items-center justify-center rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl">
        <div className="text-[var(--theme-text-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">
              Creator Economy
            </h2>
            <button
              onClick={onDeployClick}
              className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 active:scale-95 transition-all"
            >
              <Plus className="w-3 h-3" />
              Deploy Agent
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Earnings summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-black/20 border border-[var(--theme-border)] hover:border-primary/20 transition-colors cursor-pointer">
              <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-1">
                Today
              </div>
              <div className="text-lg font-mono font-bold text-primary">
                ${earnings.todayEarnings.toFixed(2)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-[var(--theme-border)] hover:border-primary/20 transition-colors cursor-pointer">
              <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-1">
                This Month
              </div>
              <div className="text-lg font-mono font-bold text-[var(--theme-text)]">
                ${earnings.monthlyEarnings.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="p-3 rounded-xl bg-black/20 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)]">
                30-Day Revenue
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </div>
            </div>
            <RevenueChart data={earnings.earningsHistory} />
          </div>

          {/* My agents */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-2">
              My Agents ({earnings.agents.length})
            </h3>
            <MyAgentsList
              agents={earnings.agents}
              onAgentClick={setSelectedAgent}
              onStatsClick={setSelectedAgent}
            />
          </div>
        </div>
      </div>

      <AgentStatsModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </>
  );
}
