/**
 * Verified Agent Badge Component
 * Displays verification status (World ID + Registry)
 */

'use client';

import { Shield, Check, AlertCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  worldIDVerified?: boolean;
  registryValidated?: boolean;
  reputation?: bigint;
  compact?: boolean;
}

export function VerifiedBadge({ 
  worldIDVerified = false, 
  registryValidated = false,
  reputation,
  compact = false 
}: VerifiedBadgeProps) {
  const isFullyVerified = worldIDVerified && registryValidated;
  const reputationScore = reputation ? Number(reputation) : 0;
  const isTrusted = reputationScore > 0;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] border ${
        isFullyVerified 
          ? 'border-green-700 text-green-400 bg-green-950/30' 
          : 'border-yellow-700 text-yellow-400 bg-yellow-950/20'
      }`}>
        {isFullyVerified ? (
          <Check className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        <span className="font-mono">
          {isFullyVerified ? 'VERIFIED' : 'UNVERIFIED'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Verification Status */}
      <div className={`flex items-center gap-3 p-3 border ${
        isFullyVerified 
          ? 'border-green-800 bg-green-950/20' 
          : 'border-yellow-800 bg-yellow-950/10'
      }`}>
        <Shield className={`w-6 h-6 ${
          isFullyVerified ? 'text-green-400' : 'text-yellow-400'
        }`} />
        
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-green-400">
            {isFullyVerified ? 'Verified Agent' : 'Partial Verification'}
          </div>
          <div className="text-[10px] text-green-900 mt-1">
            {isFullyVerified 
              ? 'World ID + Registry Validated' 
              : 'Additional verification required'}
          </div>
        </div>

        {isTrusted && (
          <div className="text-right">
            <div className="text-xs font-mono text-green-400">+{reputationScore}</div>
            <div className="text-[10px] text-green-900">REPUTATION</div>
          </div>
        )}
      </div>

      {/* Detailed Checks */}
      <div className="space-y-2">
        <VerificationItem
          label="World ID Proof"
          verified={worldIDVerified}
          description="Human-backed identity verified via World ID"
        />
        <VerificationItem
          label="Registry Entry"
          verified={registryValidated}
          description="Agent registered in ERC-8004 on-chain registry"
        />
        {reputation !== undefined && (
          <VerificationItem
            label="Community Trust"
            verified={reputationScore > 0}
            description={`Reputation score: ${reputationScore > 0 ? '+' : ''}${reputationScore}`}
            warning={reputationScore < 0}
          />
        )}
      </div>
    </div>
  );
}

function VerificationItem({ 
  label, 
  verified, 
  description, 
  warning = false 
}: { 
  label: string; 
  verified: boolean; 
  description: string;
  warning?: boolean;
}) {
  return (
    <div className={`flex items-start gap-2 p-2 border ${
      verified 
        ? 'border-green-900 bg-green-950/10' 
        : warning
        ? 'border-red-900 bg-red-950/10'
        : 'border-green-900/50'
    }`}>
      {verified ? (
        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
      ) : warning ? (
        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 border border-green-900 rounded-full mt-0.5 flex-shrink-0" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-mono ${
          verified ? 'text-green-400' : warning ? 'text-red-400' : 'text-green-900'
        }`}>
          {label}
        </div>
        <div className="text-[10px] text-green-900 mt-0.5">
          {description}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple inline verified indicator
 */
export function InlineVerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;

  return (
    <span className="inline-flex items-center gap-1 text-green-400">
      <Check className="w-3 h-3" />
      <span className="text-[10px] font-mono">VERIFIED</span>
    </span>
  );
}
