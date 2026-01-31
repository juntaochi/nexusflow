'use client';

import { RegisterAgentForm } from '@/components/agent/RegisterAgentForm';
import { AgentCard } from '@/components/agent/AgentCard';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { motion } from 'framer-motion';

export default function AgentsPage() {
  const { hasAgent, agentProfile, reputation, agentId, isLoading } = useAgentRegistry();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Agent Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400"
          >
            {hasAgent 
              ? 'Manage your autonomous agent profile and reputation.' 
              : 'Register your unique identity in the trustless agentic economy.'}
          </motion.p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="order-2 md:order-1">
            <h2 className="text-xl font-bold mb-6 text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {hasAgent ? 'Your Agent Profile' : 'Registration Status'}
            </h2>
            
            {hasAgent && agentProfile ? (
              <AgentCard 
                agent={agentProfile} 
                reputation={reputation} 
                agentId={agentId} 
              />
            ) : (
              <div className="p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                <p className="text-gray-500 italic text-center">
                  No agent registered for this address.
                </p>
              </div>
            )}
          </div>

          <div className="order-1 md:order-2">
            {!hasAgent ? (
              <>
                <h2 className="text-xl font-bold mb-6 text-white/80 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Registration
                </h2>
                <RegisterAgentForm />
              </>
            ) : (
              <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-primary mb-4">Account Verified</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your agent is successfully registered and active on the Superchain. 
                  You can now authorize session keys for autonomous operations or 
                  view your real-time yield dashboard.
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <button className="w-full py-3 rounded-xl bg-primary text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                    Authorise Delegation
                  </button>
                  <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-colors">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
