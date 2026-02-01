'use client';

import { useState, FormEvent } from 'react';
import { useDelegation } from '@/hooks/useDelegation';
import { DataTable } from '@/components/ui/DataTable';
import { formatUnits } from 'viem';
import { Shield, Key, Clock, Trash2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface SessionKey {
  address: string;
  scope: string;
  expiry: number;
}

export function DelegationPanel() {
  const { dailyLimit, remainingAllowance, authorizeSessionKey } = useDelegation();
  const [newKey, setNewKey] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const limitVal = Number(formatUnits(dailyLimit, 18));
  const remainingVal = Number(formatUnits(remainingAllowance, 18));
  const usedVal = limitVal - remainingVal;
  const percentUsed = limitVal > 0 ? (usedVal / limitVal) * 100 : 0;

  let gaugeColor = "bg-emerald-500";
  let gaugeShadow = "shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  if (percentUsed > 50) {
    gaugeColor = "bg-amber-500";
    gaugeShadow = "shadow-[0_0_10px_rgba(245,158,11,0.5)]";
  }
  if (percentUsed > 80) {
    gaugeColor = "bg-red-500";
    gaugeShadow = "shadow-[0_0_10px_rgba(239,68,68,0.5)]";
  }

  const handleAuthorize = async (e: FormEvent) => {
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

  // Mock data for the table since the hook doesn't provide a list yet
  const sessionKeys: SessionKey[] = [
    { 
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79c8', 
      scope: 'Aave V3, Uniswap', 
      expiry: Math.floor(Date.now() / 1000) + 3600 * 24 * 2 
    }
  ];

  const columns = [
    { 
      key: 'address', 
      header: 'Session Key', 
      render: (item: SessionKey) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono text-sm text-white/90">
            {item.address.slice(0, 6)}...{item.address.slice(-4)}
          </span>
        </div>
      )
    },
    { 
      key: 'scope', 
      header: 'Scope',
      render: (item: SessionKey) => (
        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300">
          {item.scope}
        </span>
      )
    },
    { 
      key: 'expiry', 
      header: 'Expires', 
      render: (item: SessionKey) => (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-3 h-3" />
          {new Date(item.expiry * 1000).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="grid gap-8">
      <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              Security Sandbox
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Active Protection</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Daily Limit</p>
              <p className="text-xl font-mono text-white">{limitVal} USDC</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Remaining</p>
              <p className="text-xl font-mono text-white">{remainingVal} USDC</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Used</p>
              <p className={`text-xl font-mono ${percentUsed > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                {percentUsed.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-gray-400">
              <span>Allowance Usage</span>
              <span>{usedVal.toFixed(2)} / {limitVal} USDC</span>
            </div>
            <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentUsed}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${gaugeColor} ${gaugeShadow}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2 text-lg px-1">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
          Active Session Keys
        </h3>

        <DataTable 
          columns={columns}
          data={sessionKeys}
          actionRenderer={(item) => (
            <button 
              onClick={() => console.log('Revoke', item.address)}
              className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all group"
              title="Revoke Session"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        />
      </div>

      <form onSubmit={handleAuthorize} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded bg-primary/10">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-white uppercase tracking-wider">Authorize New Agent Key</p>
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 focus:bg-black/40 transition-all font-mono placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={isAuthorizing || !newKey}
            className="px-6 py-3 rounded-xl bg-primary text-black text-sm font-bold border border-primary hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAuthorizing ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Authorize
                <Shield className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
