'use client';

import { YieldDashboard } from '@/components/yield/YieldDashboard';
import { SceneContainer } from '@/components/three/SceneContainer';
import { YieldParticles } from '@/components/three/YieldParticles';
import { useYield } from '@/hooks/useYield';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { apy } = useYield();
  const { currentChain, switchToBase, switchToOP, isBase } = useChainSwitch();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SceneContainer>
          <YieldParticles speed={apy > 0 ? apy / 2 : 1} />
        </SceneContainer>
      </div>

      <div className="relative z-10 py-12 px-4 max-w-5xl mx-auto">
        <section className="mb-12 p-8 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-400">Live Earnings</span>
          </div>
          <div className="text-5xl font-mono font-bold text-primary mb-2">
            +$1,234.56
          </div>
          <p className="text-gray-400">Accruing every second from on-chain contracts</p>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Current APY</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              {apy.toFixed(2)}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Deposited</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              $12,450
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Network</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">{currentChain}</span>
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

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Strategies</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              3
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <YieldDashboard />
          </div>
          
           <aside className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-white font-bold mb-2">Strategy Optimizer</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Automated rebalancing can increase your yield by up to 2.4% annually. 
                Configure session keys to enable autonomous execution.
              </p>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">
                Configure Agents →
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
