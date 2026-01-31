'use client';

import { DelegationPanel } from '@/components/delegation/DelegationPanel';
import { motion } from 'framer-motion';

export default function DelegationPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white tracking-tighter uppercase"
          >
            Delegation Manager
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 mt-2 font-medium"
          >
            Grant granular, temporary permissions to AI agents via EIP-7702.
          </motion.p>
        </header>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-3">
            <DelegationPanel />
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                How it works
              </h3>
              <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                <p>
                  <strong className="text-gray-300">1. Authorize</strong>: Grant a specific agent key permission to 
                  act on your behalf within strict limits.
                </p>
                <p>
                  <strong className="text-gray-300">2. Define Limits</strong>: The Security Sandbox ensures the agent 
                  cannot spend more than your daily allowance.
                </p>
                <p>
                  <strong className="text-gray-300">3. Execute</strong>: Your agent monitors yield spreads and 
                  rebalances automatically using the authorized session key.
                </p>
                <p>
                  <strong className="text-gray-300">4. Revoke</strong>: Permissions can be revoked at any time, 
                  and they automatically expire after the set duration.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl group cursor-help">
              <h3 className="text-primary font-bold mb-2">EIP-7702 Delegation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                NexusFlow leverages the latest EIP-7702 standard to turn your EOA into a smart account 
                temporarily, enabling trustless delegation without migrating funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
