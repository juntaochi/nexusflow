'use client';

import { YieldDashboard } from '@/components/yield/YieldDashboard';
import { SceneContainer } from '@/components/three/SceneContainer';
import { YieldParticles } from '@/components/three/YieldParticles';
import { useYield } from '@/hooks/useYield';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import { useWorldIDStore } from '@/hooks/useWorldID';
import { use7702 } from '@/hooks/useDelegation';
import { TrendingUp, DollarSign, Activity, Zap, Shield, ShieldCheck, UserCheck, Bot, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';

export default function DashboardPage() {
  const { apy, principal, lastUpdateTime, balance } = useYield();
  const { currentChain, switchToBase, switchToOP, isBase } = useChainSwitch();
  const { isVerified } = useWorldIDStore();
  const { hasDelegated } = use7702();
  
  const [liveProfit, setLiveProfit] = useState(0);

  useEffect(() => {
    if (!principal || !lastUpdateTime || !apy) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const timeElapsed = now - lastUpdateTime;
      if (timeElapsed < 0) return;

      const principalNum = parseFloat(formatUnits(principal, 18));
      const annualProfit = principalNum * (apy / 100);
      const currentProfit = annualProfit * (timeElapsed / (365 * 24 * 60 * 60));
      
      setLiveProfit(currentProfit);
    }, 1000);

    return () => clearInterval(interval);
  }, [principal, lastUpdateTime, apy]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SceneContainer>
          <YieldParticles speed={apy > 0 ? apy / 2 : 1} />
        </SceneContainer>
      </div>

      <div className="relative z-10 py-12 px-4 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <section className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-32 h-32 text-primary" />
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-green-400">Live Earnings (On-Chain)</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-primary/60">$</span>
              <div className="text-6xl font-mono font-black text-primary tracking-tighter tabular-nums">
                {liveProfit.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}
              </div>
            </div>
            <p className="text-[var(--theme-text-muted)] text-sm font-medium">
              Real-time yield calculation derived directly from {isBase ? 'Base' : 'Optimism'} RPC.
            </p>
          </section>

          <section className="space-y-4">
            <div className={`p-6 rounded-3xl border ${isVerified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'} backdrop-blur-md transition-colors`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--theme-text-muted)]">Trustless Identity</span>
                {isVerified ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <Shield className="w-5 h-5 text-gray-500" />}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}>
                   <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{isVerified ? 'World ID Verified' : 'Unverified Personhood'}</div>
                  <div className="text-[var(--theme-text-muted)] text-xs">{isVerified ? 'Sybil Resistant' : 'Verification Required'}</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border ${hasDelegated ? 'border-primary/30 bg-primary/5' : 'border-[var(--theme-border)] bg-[var(--theme-surface)]'} backdrop-blur-md transition-colors`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--theme-text-muted)]">Agent Status</span>
                <Bot className={`w-5 h-5 ${hasDelegated ? 'text-primary' : 'text-gray-500'}`} />
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasDelegated ? 'bg-primary/20 text-primary' : 'bg-gray-500/10 text-gray-500'}`}>
                   <Activity className={`w-5 h-5 ${hasDelegated ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <div className="font-bold text-sm">{hasDelegated ? 'Agent Active' : 'Agent Idle'}</div>
                  <div className="text-[var(--theme-text-muted)] text-xs">{hasDelegated ? 'Monitoring Yields' : 'Delegation Required'}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Avg APY</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--theme-text)]">
              {apy.toFixed(2)}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">NUSD Balance</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--theme-text)]">
              {Number(formatUnits(balance, 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Deposited</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--theme-text)]">
              {Number(formatUnits(principal, 6)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Network</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[var(--theme-text)]">{currentChain}</span>
              <div className="flex bg-black/20 p-1 rounded-lg">
                 <button
                  onClick={switchToBase}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-all ${isBase ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Switch to Base"
                >
                  B
                </button>
                <button
                  onClick={switchToOP}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-all ${!isBase ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Switch to Optimism"
                >
                  O
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-[var(--theme-text-muted)] mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Strategies</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[var(--theme-text)]">
              3
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <div className="mb-6 flex items-center justify-between px-2">
                <h2 className="text-xl font-black uppercase tracking-tighter text-[var(--theme-text)]">Yield Performance</h2>
                <div className="text-[var(--theme-text-muted)] text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-2">
                   <Activity className="w-3 h-3" /> System Live
                </div>
             </div>
             <YieldDashboard />
             
             <div className="mt-8 p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/50 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[var(--theme-text)] font-bold mb-1">Privacy Focused History</h3>
                    <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed">
                      All transaction logs and agent activity are stored exclusively in your browser's <span className="text-primary font-mono text-xs">localStorage</span>. 
                      NexusFlow has no backend database—your data never leaves your device.
                    </p>
                  </div>
                </div>
             </div>
          </div>
          
           <aside className="space-y-6">
            <div className="p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-xl relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-[var(--theme-text)] font-bold mb-2 uppercase tracking-tight">Strategy Optimizer</h3>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed mb-6">
                  Automated rebalancing can increase your yield by up to 2.4% annually. 
                  Configure session keys to enable autonomous execution across the Superchain.
                </p>
                <a href="/delegation" className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:underline">
                  Configure Agent <Zap className="w-3 h-3 fill-primary" />
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-md">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-6 flex items-center justify-between">
                Network Swarm
                <span className="text-primary animate-pulse flex items-center gap-1">
                   <Bot className="w-3 h-3" /> Live
                </span>
              </h3>
              <div className="space-y-5">
                {[
                  { agent: '#801', action: 'Route Discovery', cost: '0.01 NUSD', status: 'Settled' },
                  { agent: '#402', action: 'Yield Analysis', cost: '0.05 NUSD', status: 'Settled' },
                  { agent: 'Oracle', action: 'Risk Scoring', cost: 'Free', status: 'Active' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="text-[10px] font-black text-white uppercase">{s.agent}</div>
                      <div className="text-[8px] text-[var(--theme-text-muted)] uppercase">{s.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-primary">{s.cost}</div>
                      <div className="text-[8px] text-emerald-400 font-black uppercase">{s.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-md">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-6">Network Health</h3>
              <div className="space-y-4">
                {[
                  { name: 'Base Sepolia', status: 'Optimal', icon: '🔵' },
                  { name: 'OP Sepolia', status: 'Optimal', icon: '🔴' },
                  { name: 'Superchain Interop', status: 'Active', icon: '⚡' },
                ].map((n) => (
                  <div key={n.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{n.icon}</span>
                      <span className="text-sm font-bold text-[var(--theme-text)]">{n.name}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{n.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
