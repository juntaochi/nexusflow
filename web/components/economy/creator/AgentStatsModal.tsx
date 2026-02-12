'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Users, Zap, DollarSign } from 'lucide-react';
import { CreatorAgent } from '@/types/economy';
import { AgentAvatar } from '../shared';
import { STATUS_COLORS } from '@/lib/economy/constants';

interface AgentStatsModalProps {
  agent: CreatorAgent | null;
  onClose: () => void;
}

export function AgentStatsModal({ agent, onClose }: AgentStatsModalProps) {
  if (!agent) return null;

  // Generate mock performance data
  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    jobs: Math.floor(Math.random() * 100) + 20,
    earnings: Math.random() * 5 + 1,
  }));

  const maxJobs = Math.max(...weeklyData.map(d => d.jobs));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-[var(--theme-border)] bg-gradient-to-br from-primary/10 to-transparent">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <AgentAvatar name={agent.name} status={agent.status} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-[var(--theme-text)]">{agent.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${STATUS_COLORS[agent.status]}20`,
                      color: STATUS_COLORS[agent.status],
                    }}
                  >
                    {agent.status}
                  </span>
                  <span className="text-xs text-[var(--theme-text-muted)]">
                    Created {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-lg font-mono font-bold text-primary">
                  ${agent.totalEarnings.toFixed(0)}
                </div>
                <div className="text-[8px] text-[var(--theme-text-muted)] uppercase">Total</div>
              </div>
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-mono font-bold text-emerald-400">
                  ${agent.todayEarnings.toFixed(2)}
                </div>
                <div className="text-[8px] text-[var(--theme-text-muted)] uppercase">Today</div>
              </div>
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-mono font-bold text-[var(--theme-text)]">
                  {agent.totalJobs.toLocaleString()}
                </div>
                <div className="text-[8px] text-[var(--theme-text-muted)] uppercase">Jobs</div>
              </div>
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-mono font-bold text-amber-400">
                  {agent.rating.toFixed(1)}
                </div>
                <div className="text-[8px] text-[var(--theme-text-muted)] uppercase">Rating</div>
              </div>
            </div>

            {/* Weekly Chart */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-3">
                Weekly Performance
              </h3>
              <div className="flex items-end gap-2 h-24">
                {weeklyData.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/30 rounded-t transition-all hover:bg-primary/50"
                      style={{ height: `${(day.jobs / maxJobs) * 100}%` }}
                    />
                    <span className="text-[8px] text-[var(--theme-text-muted)]">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-3">
                Recent Activity
              </h3>
              <div className="space-y-2">
                {[
                  { action: 'Completed yield analysis', time: '2m ago', earnings: 0.05 },
                  { action: 'Route optimization task', time: '15m ago', earnings: 0.12 },
                  { action: 'Risk assessment query', time: '1h ago', earnings: 0.08 },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                    <div>
                      <div className="text-xs text-[var(--theme-text)]">{activity.action}</div>
                      <div className="text-[8px] text-[var(--theme-text-muted)]">{activity.time}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary">
                      +${activity.earnings.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--theme-border)]">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
