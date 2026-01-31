'use client';

import { YieldDashboard } from '@/components/yield/YieldDashboard';
import { SceneContainer } from '@/components/three/SceneContainer';
import { YieldParticles } from '@/components/three/YieldParticles';
import { useYield } from '@/hooks/useYield';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import { motion } from 'framer-motion';

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

      <div className="relative z-10 py-20 px-4 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-white tracking-tighter uppercase"
            >
              Yield Dashboard
            </motion.h1>
            <p className="text-gray-400 mt-1 font-medium">Real-time profit accrual on {currentChain}</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={switchToBase}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                isBase ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Base
            </button>
            <button
              onClick={switchToOP}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                !isBase ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Optimism
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <YieldDashboard />
          </div>

          <aside className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Network Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Utilization</span>
                  <span className="text-white font-mono">84.2%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Global TVL</span>
                  <span className="text-white font-mono">$12.4M</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Active Agents</span>
                  <span className="text-white font-mono">1,204</span>
                </div>
              </div>
            </div>

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
