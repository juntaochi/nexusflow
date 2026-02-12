'use client';

import { ArbitragePanel } from '@/components/arbitrage/ArbitragePanel';
import { SceneContainer } from '@/components/three/SceneContainer';
import { SuperchainGlobe } from '@/components/three/SuperchainGlobe';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function ArbitragePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <SceneContainer>
          <SuperchainGlobe />
        </SceneContainer>
      </div>

      <div className="relative z-10 py-20 px-4 max-w-5xl mx-auto">
        <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-3">
          <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Reference Implementation</span>
          <span className="text-indigo-300/40">|</span>
          <span className="text-indigo-300/60 text-[10px] font-medium">For Developer Education Only</span>
        </div>

        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Activity className="w-3 h-3" /> Track A: Autonomous Yield
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-[var(--theme-text)] tracking-tighter uppercase mb-4"
          >
            Cross-Chain Yield Router
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--theme-text-muted)] font-medium max-w-2xl mx-auto text-lg"
          >
            Autonomous agent monitors yield spreads across Base and Optimism,
            executing atomic rebalances via Superchain Interop when profitable.
          </motion.p>
        </header>

        <ArbitragePanel />
      </div>
    </div>
  );
}
