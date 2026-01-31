'use client';

import { ArbitragePanel } from '@/components/arbitrage/ArbitragePanel';
import { SceneContainer } from '@/components/three/SceneContainer';
import { SuperchainGlobe } from '@/components/three/SuperchainGlobe';
import { motion } from 'framer-motion';

export default function ArbitragePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SceneContainer>
          <SuperchainGlobe />
        </SceneContainer>
      </div>

      <div className="relative z-10 py-20 px-4 max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white tracking-tighter uppercase mb-4"
          >
            Arbitrage Terminal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-medium max-w-xl mx-auto"
          >
            Leverage the speed of the Superchain. Automatically detect and exploit 
            yield discrepancies between Base and Optimism in a single transaction.
          </motion.p>
        </header>

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <ArbitragePanel />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
              <h3 className="text-white font-bold mb-2">How it works</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                The terminal monitors the \`currentLiquidityRate\` on both Base and OP Sepolia 
                MockAave pools. When a spread exceeds 0.5%, a cross-chain rebalance 
                becomes profitable after gas costs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-md">
              <h3 className="text-primary font-bold mb-2">Atomic Execution</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Uses Superchain Interop tokens to bridge assets instantly, ensuring 
                your funds are always working where yield is highest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
