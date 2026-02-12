'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Bot, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useWorldID } from '@/hooks/useWorldID';
import { AgentCategory } from '@/types/economy';
import { CategoryBadge } from '../shared';

interface DeployAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (name: string) => void;
}

const ALL_CATEGORIES: AgentCategory[] = [
  'defi', 'data', 'compute', 'oracle', 'security', 'analytics', 'trading', 'infrastructure'
];

export function DeployAgentModal({ isOpen, onClose, onSuccess }: DeployAgentModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AgentCategory>('defi');
  const [metadataURI, setMetadataURI] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerAgent, myAgentCount } = useAgentRegistry();
  const { isVerified } = useWorldID();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isVerified) {
      setError('World ID verification required. Please verify your humanity first.');
      return;
    }

    if (!name.trim()) {
      setError('Agent name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate metadata URI if not provided
      const finalMetadataURI = metadataURI.trim() || `ipfs://nexusflow/${category}/${name.toLowerCase().replace(/\s+/g, '-')}`;

      await registerAgent(name.trim(), finalMetadataURI);

      onSuccess?.(name.trim());
      setName('');
      setMetadataURI('');
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register agent on-chain');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--theme-text)]">Deploy New Agent</h2>
                <p className="text-sm text-[var(--theme-text-muted)]">Register on-chain via ERC-8004</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Verification Warning */}
            {!isVerified && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-400 mb-1">World ID Required</div>
                  <p className="text-xs text-amber-300/80">
                    You must verify your humanity before deploying an agent.
                  </p>
                  <a
                    href="/verify"
                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline mt-2"
                  >
                    Verify Now <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Agent Count Info */}
            {myAgentCount > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-blue-400 mb-1">You have {myAgentCount} agent{myAgentCount > 1 ? 's' : ''}</div>
                  <p className="text-xs text-blue-300/80">
                    You can deploy multiple agents with different specializations.
                  </p>
                  <a
                    href="/agents"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-2"
                  >
                    Manage My Agents <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., YieldHunter"
                disabled={!isVerified}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <CategoryBadge
                    key={cat}
                    category={cat}
                    size="sm"
                    selected={category === cat}
                    onClick={!isVerified ? undefined : () => setCategory(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Metadata URI (Optional) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)] mb-2">
                Metadata URI <span className="text-[var(--theme-text-muted)]/50">(Optional)</span>
              </label>
              <input
                type="text"
                value={metadataURI}
                onChange={(e) => setMetadataURI(e.target.value)}
                placeholder="ipfs://... or https://..."
                disabled={!isVerified}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
              />
              <p className="text-[8px] text-[var(--theme-text-muted)] mt-1">
                Leave empty to auto-generate based on name and category
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--theme-text-muted)]">
                Your agent will be registered on-chain as an ERC-8004 non-transferable NFT.
                This creates a permanent, reputation-bound identity in the Agent Economy.
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text)] font-bold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isVerified || !name.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy On-Chain
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
