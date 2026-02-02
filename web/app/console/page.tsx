'use client';

import { AgentConsole } from '@/components/agent/AgentConsole';
import { motion } from 'framer-motion';

export default function ConsolePage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-[var(--theme-text)] tracking-tighter uppercase"
          >
            Agent Console
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--theme-text-muted)] mt-2 font-medium"
          >
            Interact with the autonomous agent swarm via intent-based natural language.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <AgentConsole />
        </motion.div>
      </div>
    </div>
  );
}
