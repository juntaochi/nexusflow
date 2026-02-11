import React, { useState, useEffect } from 'react';
import { Shield, Lock, Clock, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import { useNexusDelegation } from '@/hooks/useNexusDelegation';
import { formatUnits } from 'viem';
import { useChainId } from 'wagmi';

interface SecuritySandboxProps {
  isActive: boolean;
  expiry?: number; // Timestamp
}

export function SecuritySandbox({ isActive, expiry }: SecuritySandboxProps) {
  const chainId = useChainId();
  
  // Get delegation contract address based on current chain
  const delegationAddress = 
    chainId === 84532 
      ? (process.env.NEXT_PUBLIC_DELEGATION_CONTRACT as `0x${string}` | undefined)
      : chainId === 11155420
        ? (process.env.NEXT_PUBLIC_DELEGATION_CONTRACT_OP as `0x${string}` | undefined)
        : undefined;

  // USDC address for reading token limits (using NexusUSD as example)
  const tokenAddress = 
    chainId === 84532
      ? (process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_BASE_SEPOLIA as `0x${string}` | undefined)
      : chainId === 11155420
        ? (process.env.NEXT_PUBLIC_SUPERCHAIN_ERC20_OP_SEPOLIA as `0x${string}` | undefined)
        : undefined;

  // Read real data from NexusDelegation contract
  const {
    tokenDailyLimit,
    tokenDailySpent,
    whitelist,
  } = useNexusDelegation(delegationAddress, tokenAddress);

  // Format limits for display
  const dailyLimit = tokenDailyLimit ? Number(formatUnits(tokenDailyLimit, 18)) : 1000;
  const spentToday = tokenDailySpent ? Number(formatUnits(tokenDailySpent, 18)) : 0;
  
  const limits = {
    dailyLimit,
    spentToday,
    asset: 'NUSD',
    whitelist: whitelist && whitelist.length > 0 ? whitelist : ['Uniswap V3', 'Aave V3', 'Superchain Messenger'],
    lastAudit: '2 mins ago',
  };

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!expiry) return;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expiry - now;
      
      if (diff <= 0) {
        setTimeRemaining('EXPIRED');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiry]);

  if (!isActive) {
    return (
      <div className="w-full border border-green-900 bg-black/50 p-4 rounded-sm opacity-50">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <Lock className="w-4 h-4" />
          <h3 className="text-xs uppercase tracking-widest font-bold">Security Sandbox</h3>
        </div>
        <p className="text-[10px] text-green-900 uppercase">
          Agent delegation not active.
          <br />
          Sandbox environment dormant.
        </p>
      </div>
    );
  }

  const percentUsed = (limits.spentToday / limits.dailyLimit) * 100;

  return (
    <div className="w-full border border-green-500/30 bg-green-900/5 p-4 rounded-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-900/50 pb-2">
        <div className="flex items-center gap-2 text-green-400">
          <Shield className="w-4 h-4" />
          <h3 className="text-xs uppercase tracking-widest font-bold">Security Sandbox</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-green-600 animate-pulse">
          <Activity className="w-3 h-3" />
          MONITORING
        </div>
      </div>

      {/* Session Timer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-green-700 uppercase tracking-wider">Session Expires</span>
        <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
          <Clock className="w-3 h-3" />
          {timeRemaining || '23:59:59'}
        </div>
      </div>

      {/* Spending Limit Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase text-green-700">
          <span>Daily Limit ({limits.asset})</span>
          <span>{limits.spentToday.toFixed(2)} / {limits.dailyLimit.toFixed(2)}</span>
        </div>
        <div className="w-full h-1.5 bg-green-900/30 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${percentUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Whitelist */}
      <div>
        <span className="text-[10px] text-green-700 uppercase tracking-wider block mb-2">Allowed Protocols</span>
        <div className="flex flex-wrap gap-2">
          {limits.whitelist.map((proto) => (
            <span key={proto} className="px-2 py-0.5 border border-green-800 bg-green-900/10 text-[9px] text-green-600 uppercase rounded flex items-center gap-1">
              <CheckCircle className="w-2 h-2" />
              {proto}
            </span>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="pt-2 border-t border-green-900/50 flex items-center gap-2 text-[9px] text-green-800">
        <RefreshCw className="w-3 h-3" />
        Last On-Chain Audit: {limits.lastAudit}
      </div>
    </div>
  );
}
