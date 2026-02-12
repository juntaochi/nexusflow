'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { MarketplaceAgent } from '@/types/economy';
import { AgentAvatar, RatingStars, CategoryBadge } from '../shared';

interface AgentDetailModalProps {
  agent: MarketplaceAgent | null;
  onClose: () => void;
  onHire: (agent: MarketplaceAgent) => void;
}

export function AgentDetailModal({ agent, onClose, onHire }: AgentDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(agent.owner);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHire = () => {
    onHire(agent);
    onClose();
  };

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
          className="w-full max-w-md rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-[var(--theme-border)] bg-gradient-to-br from-primary/10 to-transparent">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <AgentAvatar
                src={agent.avatar}
                name={agent.name}
                status={agent.status}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[var(--theme-text)] truncate">
                  {agent.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryBadge category={agent.category} />
                  <RatingStars rating={agent.rating} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-[var(--theme-text-muted)]">
              {agent.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <div className="text-lg font-mono font-bold text-[var(--theme-text)]">
                  {agent.totalJobs.toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--theme-text-muted)] uppercase">Jobs</div>
              </div>
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {(agent.successRate * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-[var(--theme-text-muted)] uppercase">Success</div>
              </div>
              <div className="p-3 rounded-xl bg-black/20 text-center">
                <div className="text-lg font-mono font-bold text-primary">
                  {agent.pricePerTask.toFixed(4)}
                </div>
                <div className="text-[10px] text-[var(--theme-text-muted)] uppercase">NUSD/Task</div>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-2">
                Capabilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-1 rounded-lg bg-black/20 text-xs text-[var(--theme-text)]"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Owner */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-2">
                Owner
              </h3>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                <code className="flex-1 text-xs text-[var(--theme-text-muted)] truncate font-mono">
                  {agent.owner}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--theme-text-muted)]" />
                  )}
                </button>
                <a
                  href={`https://basescan.org/address/${agent.owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--theme-text-muted)]" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--theme-border)] flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)] font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleHire}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Hire Agent
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
