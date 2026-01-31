'use client';

import { motion } from 'framer-motion';

interface AgentCardProps {
  agent: {
    name: string;
    metadataURI: string;
    controller: string;
  };
  reputation: number;
  agentId: number;
}

export function AgentCard({ agent, reputation, agentId }: AgentCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4">
        <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-mono">
          ID: #{agentId}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(0,255,255,0.2)]">
          {agent.name[0]}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{agent.name}</h2>
          <p className="text-gray-400 text-sm font-mono truncate max-w-[200px]">
            {agent.controller}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Reputation</p>
          <p className="text-2xl font-bold text-primary">{reputation}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Status</p>
          <p className="text-2xl font-bold text-green-400">Active</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Metadata URI</p>
          <div className="px-4 py-2 rounded-lg bg-black/20 border border-white/5 text-xs text-gray-400 font-mono truncate">
            {agent.metadataURI}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors border border-white/10">
          Edit Profile
        </button>
        <button className="flex-1 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-colors border border-primary/20">
          View Stats
        </button>
      </div>
    </motion.div>
  );
}
