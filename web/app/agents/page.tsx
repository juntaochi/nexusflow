'use client';

import { RegisterAgentForm } from '@/components/agent/RegisterAgentForm';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { motion } from 'framer-motion';
import { User, Shield, CheckCircle, Wallet, Link as LinkIcon, Activity } from 'lucide-react';

export default function AgentsPage() {
  const { hasAgent, agentProfile, reputation, agentId, isLoading } = useAgentRegistry();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Initialize Agent
            </h1>
            <p className="text-gray-400">
              Register your unique identity to begin.
            </p>
          </div>
          <RegisterAgentForm />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-4xl md:text-5xl font-bold shadow-[0_0_30px_rgba(0,255,255,0.3)] border-4 border-black/50 text-white">
                  {agentProfile?.name?.[0] || <User className="w-12 h-12" />}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
                  <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {agentProfile?.name}
                  </h1>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Verified</span>
                  </div>
                </div>
                <p className="text-gray-400 font-mono text-sm flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/50" />
                  Agent ID: #{agentId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-primary transition-colors">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Reputation</span>
                </div>
                <div className="text-3xl font-bold text-white">{reputation}</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-green-400 transition-colors">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Status</span>
                </div>
                <div className="text-3xl font-bold text-green-400">Active</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3 mb-2 text-gray-400 group-hover:text-purple-400 transition-colors">
                  <Wallet className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Strategies</span>
                </div>
                <div className="text-3xl font-bold text-white">0</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Controller Address
                </h3>
                <div className="font-mono text-sm text-gray-300 break-all">
                  {agentProfile?.controller}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-black/20 border border-white/5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Metadata URI
                </h3>
                <div className="font-mono text-sm text-primary break-all hover:underline cursor-pointer">
                  {agentProfile?.metadataURI}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
