'use client';

import { useState } from 'react';
import { useDelegation } from '@/hooks/useDelegation';
import { SessionKeyCard } from './SessionKeyCard';
import { SecuritySandbox } from './SecuritySandbox';
import { formatUnits } from 'viem';

export function DelegationPanel() {
  const { dailyLimit, remainingAllowance, authorizeSessionKey } = useDelegation();
  const [newKey, setNewKey] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    try {
      await authorizeSessionKey(newKey, true, Math.floor(Date.now() / 1000) + 86400 * 7);
      setNewKey('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="grid gap-8">
      <SecuritySandbox 
        limit={formatUnits(dailyLimit, 18)} 
        remaining={formatUnits(remainingAllowance, 18)} 
      />

      <div className="space-y-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Active Session Keys
        </h3>

        <div className="space-y-3">
          <SessionKeyCard 
            address="0x7099...79c8" 
            expiry={Math.floor(Date.now() / 1000) + 3600 * 24} 
            onRevoke={() => {}} 
          />
        </div>

        <form onSubmit={handleAuthorize} className="mt-8 pt-8 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest font-bold">Authorize New Agent Key</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isAuthorizing || !newKey}
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold border border-cyan-400/30 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all disabled:opacity-50"
            >
              {isAuthorizing ? '...' : 'Authorize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
