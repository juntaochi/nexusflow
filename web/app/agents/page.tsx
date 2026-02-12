'use client';

import { RegisterAgentForm } from '@/components/agent/RegisterAgentForm';
import { useAgentRegistry, useAgentDetails } from '@/hooks/useAgentRegistry';
import { AgentDetailCard } from '@/components/agent/AgentDetailCard';
import { motion } from 'framer-motion';
import { Plus, Bot, Star, Activity, CheckCircle } from 'lucide-react';
import { ServiceDiscovery } from '@/components/agent/ServiceDiscovery';
import { JobSimulation } from '@/components/agent/JobSimulation';
import { ValidatorConsole } from '@/components/agent/ValidatorConsole';
import { useState } from 'react';

function AgentSelectorCard({
  agentId,
  isSelected,
  onSelect,
}: {
  agentId: bigint;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { profile, reputation, isTrusted, isLoading } = useAgentDetails(agentId);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="flex-1">
            <div className="h-4 w-20 bg-white/10 rounded mb-2" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const reputationColor =
    reputation >= 80 ? 'text-green-400' : reputation >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all text-left w-full group ${
        isSelected
          ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(0,255,255,0.1)]'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`relative w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
            isSelected ? 'bg-primary text-black' : 'bg-white/10 text-white group-hover:bg-white/20'
          }`}
        >
          {profile?.name?.[0] || <Bot className="w-5 h-5" />}
          {isTrusted && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white truncate text-sm">
            {profile?.name || `Agent #${agentId}`}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Star className={`w-3 h-3 ${reputationColor}`} />
              <span className={`text-xs font-medium ${reputationColor}`}>{reputation}</span>
            </div>
            <span className="text-gray-600">•</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AgentsPage() {
  const { hasAgent, myAgentIds, myAgentCount, isLoading } = useAgentRegistry();
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const selectedAgentId = myAgentIds[selectedAgentIndex];
  const { profile: selectedProfile, reputation: selectedReputation, isTrusted } = useAgentDetails(selectedAgentId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show register form if no agents or user wants to create new one
  if (!hasAgent || showRegisterForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {hasAgent ? 'Deploy New Agent' : 'Register Agent Infrastructure'}
            </h1>
            <p className="text-gray-400">
              {hasAgent
                ? `You have ${myAgentCount} agent${myAgentCount > 1 ? 's' : ''}. Deploy another with a different specialization.`
                : 'Establish your permanent on-chain identity (ERC-8004) to begin.'}
            </p>
            {!hasAgent && (
              <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-left">
                <h4 className="text-blue-400 text-xs font-bold uppercase mb-1">Why do I need this?</h4>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  NexusFlow uses ERC-8004 to bind your agent&apos;s reputation to a non-transferable NFT.
                  This ensures that trust scores are permanent and cannot be bought or sold.
                </p>
              </div>
            )}
          </div>
          <RegisterAgentForm onSuccess={() => setShowRegisterForm(false)} />
          {hasAgent && (
            <button
              onClick={() => setShowRegisterForm(false)}
              className="w-full mt-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Agent Selector */}
        {myAgentCount > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                My Agents ({myAgentCount})
              </h2>
              <button
                onClick={() => setShowRegisterForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Deploy New Agent
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {myAgentIds.map((agentId, index) => (
                <AgentSelectorCard
                  key={agentId.toString()}
                  agentId={agentId}
                  isSelected={index === selectedAgentIndex}
                  onSelect={() => setSelectedAgentIndex(index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Agent Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
        >
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-10">
            {selectedProfile && (
              <AgentDetailCard
                agentId={selectedAgentId}
                profile={selectedProfile}
                reputation={selectedReputation}
                isTrusted={isTrusted}
                feedbackCount={0}
                validationCount={0}
              />
            )}

            {/* Additional Sections */}
            <div className="mt-8 space-y-6">
              {/* Validator Console */}
              <div className="flex justify-end">
                <ValidatorConsole agentId={Number(selectedAgentId)} />
              </div>

              {/* Service Discovery Section */}
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5">
                <ServiceDiscovery metadataURI={selectedProfile?.metadataURI || ''} />
              </div>

              {/* Job Execution Simulator */}
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5">
                <JobSimulation agentId={Number(selectedAgentId)} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
