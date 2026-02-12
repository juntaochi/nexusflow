'use client';

import { useState, useCallback } from 'react';
import { EconomyFlowHero } from './EconomyFlowHero';
import { EconomyStatsBar } from './EconomyStatsBar';
import { MarketplacePanel } from './marketplace/MarketplacePanel';
import { LiveFlowPanel } from './live-flow/LiveFlowPanel';
import { CollaborationPanel } from './collaboration/CollaborationPanel';
import { CreatorPanel } from './creator/CreatorPanel';
import { AgentDetailModal } from './marketplace/AgentDetailModal';
import { DeployAgentModal } from './creator/DeployAgentModal';
import { ToastContainer, ToastType } from './shared/ToastContainer';
import { MarketplaceAgent } from '@/types/economy';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export function EconomyDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleHireAgent = useCallback((agent: MarketplaceAgent) => {
    const loadingId = addToast('loading', 'Hiring Agent...', `Connecting to ${agent.name}`);

    // Simulate hiring process
    setTimeout(() => {
      removeToast(loadingId);
      addToast('success', 'Agent Hired!', `${agent.name} is now working for you`);
    }, 2000);
  }, [addToast, removeToast]);

  const handleDeploySuccess = useCallback((name: string) => {
    addToast('success', 'Agent Deployed!', `${name} is now live on-chain`);
  }, [addToast]);

  return (
    <div className="min-h-screen py-6 px-4 max-w-7xl mx-auto space-y-6">
      {/* Hero: 3D Network Graph */}
      <EconomyFlowHero />

      {/* Stats Bar */}
      <EconomyStatsBar />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Marketplace */}
          <div className="h-[500px]">
            <MarketplacePanel
              onSelectAgent={setSelectedAgent}
              onHireAgent={handleHireAgent}
            />
          </div>

          {/* Collaboration Network */}
          <div className="h-[400px]">
            <CollaborationPanel />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Flow */}
          <div className="h-[400px]">
            <LiveFlowPanel />
          </div>

          {/* Creator Economy */}
          <div className="h-[500px]">
            <CreatorPanel onDeployClick={() => setIsDeployModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onHire={handleHireAgent}
      />

      <DeployAgentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onSuccess={handleDeploySuccess}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
