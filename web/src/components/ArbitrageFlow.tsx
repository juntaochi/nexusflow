/**
 * Arbitrage Flow Visualization
 * Live display of cross-chain asset movements
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, ArrowRight, Zap, DollarSign } from 'lucide-react';

interface ArbitrageOpportunity {
  type: 'ARBITRAGE';
  sourceChain: string;
  targetChain: string;
  token: string;
  sourceApy: number;
  targetApy: number;
  spread: number;
  description: string;
}

interface ExecutionStep {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  txHash?: string;
  timestamp?: number;
}

interface ArbitrageExecution {
  opportunity: ArbitrageOpportunity;
  steps: ExecutionStep[];
  startTime: number;
  endTime?: number;
  estimatedProfit?: string;
}

export function ArbitrageFlow() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [currentExecution, setCurrentExecution] = useState<ArbitrageExecution | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Fetch opportunities from backend
  const fetchOpportunities = useCallback(async () => {
    try {
      // In production, this would call your agent backend
      // For demo, simulate opportunities
      const mockOpp: ArbitrageOpportunity = {
        type: 'ARBITRAGE',
        sourceChain: 'Base',
        targetChain: 'Optimism',
        token: 'USDC',
        sourceApy: 0.032,
        targetApy: 0.058,
        spread: 0.026,
        description: 'Move USDC from Base (3.2%) to Optimism (5.8%)',
      };

      setOpportunities([mockOpp]);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  }, []);

  // Simulate arbitrage execution
  const executeArbitrage = useCallback(async (opp: ArbitrageOpportunity) => {
    const execution: ArbitrageExecution = {
      opportunity: opp,
      steps: [
        { label: 'Withdraw from Aave (Base)', status: 'pending' },
        { label: 'Cross-chain transfer via Superchain', status: 'pending' },
        { label: 'Deposit to Aave (Optimism)', status: 'pending' },
      ],
      startTime: Date.now(),
    };

    setCurrentExecution(execution);

    // Simulate step-by-step execution
    for (let i = 0; i < execution.steps.length; i++) {
      execution.steps[i].status = 'in_progress';
      setCurrentExecution({ ...execution });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      execution.steps[i].status = 'completed';
      execution.steps[i].txHash = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
      execution.steps[i].timestamp = Date.now();
      setCurrentExecution({ ...execution });
    }

    execution.endTime = Date.now();
    execution.estimatedProfit = `${(opp.spread * 100).toFixed(2)}% APY gain`;
    setCurrentExecution({ ...execution });

    // Clear after 5 seconds
    setTimeout(() => {
      setCurrentExecution(null);
    }, 5000);
  }, []);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring((prev) => {
      const next = !prev;
      if (!prev) {
        void fetchOpportunities();
      }
      return next;
    });
  }, [fetchOpportunities]);

  // Monitor for opportunities
  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(() => {
      void fetchOpportunities();
    }, 30000);
    return () => clearInterval(interval);
  }, [isMonitoring, fetchOpportunities]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-green-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-green-400">
            Autonomous Arbitrage
          </span>
        </div>
        <button
          onClick={toggleMonitoring}
          className={`text-xs px-3 py-1 border transition-all ${
            isMonitoring
              ? 'border-red-800 text-red-400 hover:bg-red-900/20'
              : 'border-green-800 text-green-400 hover:bg-green-900/20'
          }`}
        >
          {isMonitoring ? 'STOP MONITORING' : 'START MONITORING'}
        </button>
      </div>

      {/* Opportunities Section */}
      {isMonitoring && opportunities.length > 0 && !currentExecution && (
        <div className="space-y-2">
          <div className="text-[10px] text-green-900 uppercase tracking-wider">
            Detected Opportunities
          </div>
          {opportunities.map((opp, index) => (
            <OpportunityCard
              key={index}
              opportunity={opp}
              onExecute={() => executeArbitrage(opp)}
            />
          ))}
        </div>
      )}

      {/* Execution Visualization */}
      {currentExecution && (
        <ExecutionVisualization execution={currentExecution} />
      )}

      {/* Status Message */}
      {isMonitoring && opportunities.length === 0 && !currentExecution && (
        <div className="text-center py-8 border border-green-900 border-dashed">
          <div className="text-xs text-green-900">
            Monitoring APY rates across Base and Optimism...
          </div>
          <div className="text-[10px] text-green-900/60 mt-1">
            Will automatically execute when spread {'>'} 1.5%
          </div>
        </div>
      )}

      {!isMonitoring && (
        <div className="text-center py-8 border border-green-900">
          <div className="text-xs text-green-900">
            Click &quot;START MONITORING&quot; to enable autonomous arbitrage
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity,
  onExecute,
}: {
  opportunity: ArbitrageOpportunity;
  onExecute: () => void;
}) {
  return (
    <div className="border border-green-800 p-3 hover:border-green-400 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-xs font-mono text-green-400">
            {(opportunity.spread * 100).toFixed(2)}% Spread
          </span>
        </div>
        <button
          onClick={onExecute}
          className="text-[10px] px-2 py-1 border border-green-700 hover:border-green-400 
                   hover:bg-green-900/20 transition-all uppercase tracking-wider"
        >
          Execute
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-900">Source:</span>
          <span className="text-green-400 font-mono">
            {opportunity.sourceChain} @ {(opportunity.sourceApy * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-900">Target:</span>
          <span className="text-green-400 font-mono">
            {opportunity.targetChain} @ {(opportunity.targetApy * 100).toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-green-900">Token:</span>
          <span className="text-green-400 font-mono">{opportunity.token}</span>
        </div>
      </div>
    </div>
  );
}

function ExecutionVisualization({ execution }: { execution: ArbitrageExecution }) {
  const { opportunity, steps, startTime, endTime, estimatedProfit } = execution;

  return (
    <div className="border border-green-800 p-4 space-y-4 bg-green-950/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-green-400">
            Executing Arbitrage
          </div>
          <div className="text-[10px] text-green-900 mt-1">
            {opportunity.sourceChain} → {opportunity.targetChain}
          </div>
        </div>
        {endTime && (
          <div className="text-right">
            <div className="text-xs font-mono text-green-400">
              {estimatedProfit}
            </div>
            <div className="text-[10px] text-green-900">
              Completed in {((endTime - startTime) / 1000).toFixed(1)}s
            </div>
          </div>
        )}
      </div>

      {/* Flow Visualization */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index}>
            <ExecutionStep step={step} index={index} />
            {index < steps.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowRight className={`w-4 h-4 ${
                  step.status === 'completed' ? 'text-green-400' : 'text-green-900'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profit Display */}
      {endTime && estimatedProfit && (
        <div className="pt-4 border-t border-green-900 flex items-center justify-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-sm font-mono text-green-400">
            {estimatedProfit}
          </span>
        </div>
      )}
    </div>
  );
}

function ExecutionStep({ step, index }: { step: ExecutionStep; index: number }) {
  return (
    <div className={`flex items-center gap-3 p-3 border transition-all ${
      step.status === 'completed'
        ? 'border-green-800 bg-green-950/20'
        : step.status === 'in_progress'
        ? 'border-green-400 bg-green-900/30 animate-pulse'
        : step.status === 'failed'
        ? 'border-red-800 bg-red-950/20'
        : 'border-green-900'
    }`}>
      {/* Step Number */}
      <div className={`flex items-center justify-center w-6 h-6 border font-mono text-xs ${
        step.status === 'completed'
          ? 'border-green-700 text-green-400'
          : step.status === 'in_progress'
          ? 'border-green-400 text-green-300'
          : 'border-green-900 text-green-900'
      }`}>
        {index + 1}
      </div>

      {/* Step Label */}
      <div className="flex-1">
        <div className={`text-xs ${
          step.status === 'completed' || step.status === 'in_progress'
            ? 'text-green-400'
            : 'text-green-900'
        }`}>
          {step.label}
        </div>
        {step.txHash && (
          <div className="text-[10px] text-green-900 mt-1 font-mono">
            TX: {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-[10px] uppercase tracking-wider">
        {step.status === 'completed' && (
          <span className="text-green-400">✓ DONE</span>
        )}
        {step.status === 'in_progress' && (
          <span className="text-green-300 animate-pulse">⟳ IN PROGRESS</span>
        )}
        {step.status === 'failed' && (
          <span className="text-red-400">✗ FAILED</span>
        )}
        {step.status === 'pending' && (
          <span className="text-green-900">PENDING</span>
        )}
      </div>
    </div>
  );
}
