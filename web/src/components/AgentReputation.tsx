/**
 * Agent Reputation Display Component
 * Shows ERC-8004 reputation score and voting interface
 */

'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { useAgentIdentity } from '@/hooks/useAgentIdentity';

interface AgentReputationProps {
  agentId?: bigint;
  compact?: boolean;
  allowVoting?: boolean;
}

export function AgentReputation({ agentId, compact = false, allowVoting = false }: AgentReputationProps) {
  const { identity, submitFeedback, isLoading } = useAgentIdentity();
  const [isVoting, setIsVoting] = useState(false);

  // Use current identity if no specific agentId provided
  const displayAgentId = agentId || identity?.agentId;
  const reputation = identity?.reputation || BigInt(0);
  const reputationNumber = Number(reputation);

  const handleVote = async (isUpvote: boolean) => {
    if (!displayAgentId) return;

    setIsVoting(true);
    try {
      await submitFeedback(displayAgentId, isUpvote ? 1 : -1);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
    }
  };

  if (!displayAgentId) {
    return (
      <div className="text-xs text-green-900">
        No agent registered
      </div>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <Shield className="w-4 h-4 text-green-400" />
        <span className={`text-xs font-mono ${getReputationColor(reputationNumber)}`}>
          {reputationNumber > 0 && '+'}
          {reputationNumber}
        </span>
      </div>
    );
  }

  return (
    <div className="border border-green-800 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-green-400">
            Agent #{displayAgentId.toString()}
          </span>
        </div>
        {identity?.worldIDVerified && (
          <div className="text-[10px] text-green-500 border border-green-700 px-2 py-1">
            WORLD_ID_VERIFIED
          </div>
        )}
      </div>

      {/* Reputation Score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-green-900 uppercase tracking-wider">
            Reputation Score
          </div>
          <div className={`text-3xl font-mono font-bold ${getReputationColor(reputationNumber)}`}>
            {reputationNumber > 0 && '+'}
            {reputationNumber}
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="text-right">
          {reputationNumber > 0 && (
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Trusted</span>
            </div>
          )}
          {reputationNumber < 0 && (
            <div className="flex items-center gap-1 text-red-400">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs">Flagged</span>
            </div>
          )}
          {reputationNumber === 0 && (
            <div className="text-xs text-green-900">New Agent</div>
          )}
        </div>
      </div>

      {/* Voting Interface */}
      {allowVoting && !agentId && (
        <div className="pt-3 border-t border-green-900">
          <div className="text-[10px] text-green-900 mb-2 uppercase tracking-wider">
            Rate This Agent
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting || isLoading}
              className="flex-1 py-2 px-3 border border-green-800 hover:border-green-400 
                       hover:bg-green-900/20 transition-all disabled:opacity-50 
                       flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs">Upvote</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting || isLoading}
              className="flex-1 py-2 px-3 border border-red-800 hover:border-red-400 
                       hover:bg-red-900/20 transition-all disabled:opacity-50 
                       flex items-center justify-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-xs">Downvote</span>
            </button>
          </div>
          {isVoting && (
            <div className="text-[10px] text-green-500 mt-2 text-center">
              Submitting vote on-chain...
            </div>
          )}
        </div>
      )}

      {/* Agent Info */}
      {identity && (
        <div className="pt-3 border-t border-green-900 space-y-1">
          <div className="text-[10px] text-green-900">
            Name: <span className="text-green-400 font-mono">{identity.profile.name}</span>
          </div>
          <div className="text-[10px] text-green-900">
            Controller: <span className="text-green-400 font-mono">
              {identity.profile.controller.slice(0, 6)}...{identity.profile.controller.slice(-4)}
            </span>
          </div>
          {identity.profile.validated && (
            <div className="text-[10px] text-green-500">
              ✓ Validated by Registry
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getReputationColor(score: number): string {
  if (score > 5) return 'text-green-300';
  if (score > 0) return 'text-green-400';
  if (score === 0) return 'text-green-600';
  if (score > -5) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Mini reputation badge for compact display
 */
export function ReputationBadge({ reputation }: { reputation: bigint }) {
  const score = Number(reputation);
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 border text-[10px] font-mono ${
      score > 0 ? 'border-green-700 text-green-400' :
      score < 0 ? 'border-red-700 text-red-400' :
      'border-green-900 text-green-600'
    }`}>
      <Shield className="w-3 h-3" />
      <span>{score > 0 && '+'}{score}</span>
    </div>
  );
}
