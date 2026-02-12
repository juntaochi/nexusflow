'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { use7702 } from '@/hooks/useDelegation';
import { Send, Terminal, Loader2, Shield, Zap, DollarSign, Bot, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogMessage {
  type: 'info' | 'success' | 'error' | 'agent';
  content: string;
  timestamp: number;
}

type PaymentStatus = 'idle' | 'pending' | 'paid';

interface ActiveAgent {
  id: string;
  name: string;
  status: 'ready' | 'active';
  type: string;
}

interface AgentSessionState {
  logs: LogMessage[];
  paymentStatus: PaymentStatus;
  sessionLabel: string;
}

const ACTIVE_AGENTS: ActiveAgent[] = [
  { id: '402', name: 'Strategy Hub', status: 'ready', type: 'Yield Optimizer' },
  { id: '801', name: 'Liquidity Node', status: 'active', type: 'Dex Aggregator' },
  { id: 'Nexus', name: 'Identity Oracle', status: 'ready', type: 'ERC-8004 Registry' },
];
const CONSOLE_STORAGE_KEY = 'agent-console-sessions-storage';
const DEFAULT_AGENT_ID =
  ACTIVE_AGENTS.find((agent) => agent.status === 'active')?.id ?? ACTIVE_AGENTS[0]?.id ?? '';

const createDefaultSession = (agentId: string): AgentSessionState => ({
  logs: [],
  paymentStatus: 'idle',
  sessionLabel: `session-${agentId.toLowerCase()}`,
});

const createInitialSessions = () =>
  ACTIVE_AGENTS.reduce<Record<string, AgentSessionState>>((acc, agent) => {
    acc[agent.id] = createDefaultSession(agent.id);
    return acc;
  }, {});

const createInitialDrafts = () =>
  ACTIVE_AGENTS.reduce<Record<string, string>>((acc, agent) => {
    acc[agent.id] = '';
    return acc;
  }, {});

const isValidPaymentStatus = (value: unknown): value is PaymentStatus =>
  value === 'idle' || value === 'pending' || value === 'paid';

const normalizePersistedLogs = (rawLogs: unknown): LogMessage[] => {
  if (!Array.isArray(rawLogs)) return [];

  return rawLogs
    .map((rawLog) => {
      if (!rawLog || typeof rawLog !== 'object') return null;
      const type = (rawLog as { type?: unknown }).type;
      const content = (rawLog as { content?: unknown }).content;
      const timestamp = (rawLog as { timestamp?: unknown }).timestamp;
      const validType =
        type === 'info' || type === 'success' || type === 'error' || type === 'agent';

      if (!validType || typeof content !== 'string') return null;

      return {
        type,
        content,
        timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
      } as LogMessage;
    })
    .filter((log): log is LogMessage => !!log)
    .slice(-200);
};

const normalizePersistedSessions = (rawSessions: unknown): Record<string, AgentSessionState> => {
  const normalized = createInitialSessions();
  if (!rawSessions || typeof rawSessions !== 'object') return normalized;

  for (const agent of ACTIVE_AGENTS) {
    const rawSession = (rawSessions as Record<string, unknown>)[agent.id];
    if (!rawSession || typeof rawSession !== 'object') continue;

    const logs = normalizePersistedLogs((rawSession as { logs?: unknown }).logs);
    const rawStatus = (rawSession as { paymentStatus?: unknown }).paymentStatus;
    const rawLabel = (rawSession as { sessionLabel?: unknown }).sessionLabel;

    normalized[agent.id] = {
      logs,
      paymentStatus: isValidPaymentStatus(rawStatus) ? rawStatus : 'idle',
      sessionLabel:
        typeof rawLabel === 'string' && rawLabel.trim()
          ? rawLabel
          : createDefaultSession(agent.id).sessionLabel,
    };
  }

  return normalized;
};

const normalizePersistedDrafts = (rawDrafts: unknown): Record<string, string> => {
  const normalized = createInitialDrafts();
  if (!rawDrafts || typeof rawDrafts !== 'object') return normalized;

  for (const agent of ACTIVE_AGENTS) {
    const rawDraft = (rawDrafts as Record<string, unknown>)[agent.id];
    if (typeof rawDraft === 'string') {
      normalized[agent.id] = rawDraft.slice(0, 2000);
    }
  }

  return normalized;
};

export function AgentConsole() {
  const [agentSessions, setAgentSessions] = useState<Record<string, AgentSessionState>>(
    createInitialSessions
  );
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>(createInitialDrafts);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAgentId, setProcessingAgentId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT_ID);
  const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { hasAgent, reputation } = useAgentRegistry();
  const { hasDelegated, chainVerified } = use7702();
  const selectedAgent =
    ACTIVE_AGENTS.find((agent) => agent.id === selectedAgentId) ?? ACTIVE_AGENTS[0];
  const selectedSession = selectedAgent
    ? agentSessions[selectedAgent.id] ?? createDefaultSession(selectedAgent.id)
    : createDefaultSession('unknown');
  const input = selectedAgent ? draftInputs[selectedAgent.id] ?? '' : '';
  const processingAgent = processingAgentId
    ? ACTIVE_AGENTS.find((agent) => agent.id === processingAgentId)
    : undefined;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const rawStorage = window.localStorage.getItem(CONSOLE_STORAGE_KEY);
      if (!rawStorage) {
        setHasHydratedFromStorage(true);
        return;
      }

      const parsed = JSON.parse(rawStorage) as {
        selectedAgentId?: unknown;
        agentSessions?: unknown;
        draftInputs?: unknown;
      };

      setAgentSessions(normalizePersistedSessions(parsed.agentSessions));
      setDraftInputs(normalizePersistedDrafts(parsed.draftInputs));

      const persistedSelectedAgentId = parsed.selectedAgentId;
      if (
        typeof persistedSelectedAgentId === 'string' &&
        ACTIVE_AGENTS.some((agent) => agent.id === persistedSelectedAgentId)
      ) {
        setSelectedAgentId(persistedSelectedAgentId);
      }
    } catch (error) {
      console.warn('Failed to hydrate agent console session from storage:', error);
    } finally {
      setHasHydratedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedFromStorage || typeof window === 'undefined') return;

    const payload = {
      selectedAgentId,
      agentSessions,
      draftInputs,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(CONSOLE_STORAGE_KEY, JSON.stringify(payload));
  }, [selectedAgentId, agentSessions, draftInputs, hasHydratedFromStorage]);

  const addLog = (agentId: string, type: LogMessage['type'], content: string) => {
    setAgentSessions((prev) => {
      const current = prev[agentId] ?? createDefaultSession(agentId);
      return {
        ...prev,
        [agentId]: {
          ...current,
          logs: [...current.logs, { type, content, timestamp: Date.now() }],
        },
      };
    });
  };

  const setAgentPaymentStatus = (agentId: string, paymentStatus: PaymentStatus) => {
    setAgentSessions((prev) => {
      const current = prev[agentId] ?? createDefaultSession(agentId);
      return {
        ...prev,
        [agentId]: {
          ...current,
          paymentStatus,
        },
      };
    });
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedAgentId, selectedSession.logs.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !selectedAgent) return;

    const submittingAgent = selectedAgent;
    const userIntent = input.trim();
    setDraftInputs((prev) => ({ ...prev, [submittingAgent.id]: '' }));
    setIsProcessing(true);
    setProcessingAgentId(submittingAgent.id);
    setAgentPaymentStatus(submittingAgent.id, 'pending');
    addLog(submittingAgent.id, 'info', `> ${userIntent}`);

    try {
      addLog(
        submittingAgent.id,
        'agent',
        `Coordinating with ${submittingAgent.name} (#${submittingAgent.id})...`
      );
      addLog(
        submittingAgent.id,
        'agent',
        `${submittingAgent.name} requested x402 payment (0.01 NUSD)...`
      );
      
      const response = await fetch('/api/agent/paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: userIntent,
          agentId: submittingAgent.id,
          agentName: submittingAgent.name,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const dataMatch = line.match(/^data: (.*)$/m);
          if (dataMatch) {
            try {
              const data = JSON.parse(dataMatch[1]);
              
              if (line.includes('event: agent')) {
                addLog(submittingAgent.id, 'agent', data.message);
              } else if (line.includes('event: tool')) {
                addLog(
                  submittingAgent.id,
                  'info',
                  `[Tool Call]: ${data.message.length > 200 ? data.message.slice(0, 200) + "..." : data.message}`
                );
              } else if (line.includes('event: error')) {
                addLog(submittingAgent.id, 'error', data.message);
              } else if (line.includes('event: end')) {
                setAgentPaymentStatus(submittingAgent.id, 'paid');
              }
            } catch {
              continue;
            }
          }
        }
      }
    } catch {
      addLog(submittingAgent.id, 'error', 'Communication error with agent swarm.');
    } finally {
      setIsProcessing(false);
      setProcessingAgentId(null);
      setTimeout(() => {
        setAgentPaymentStatus(submittingAgent.id, 'idle');
      }, 1200);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-1">
        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
          <h3 className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Identity
          </h3>
          {hasAgent ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-text-muted)]">Status</span>
                <span className="text-green-400 font-bold">Verified</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-text-muted)]">Trust Score</span>
                <span className="text-[var(--theme-text)] font-mono">{reputation}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-yellow-500 font-medium">
              Agent ID not registered.
              <a href="/agents" className="block mt-2 underline opacity-80 hover:opacity-100">Register Identity →</a>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
          <h3 className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Agent Swarm
          </h3>
          <div className="space-y-3">
            {ACTIVE_AGENTS.map(agent => {
              const isSelected = agent.id === selectedAgent.id;
              return (
              <button
                type="button"
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                aria-pressed={isSelected}
                className={`w-full flex items-center gap-3 rounded-xl p-2 transition-colors border ${
                  isSelected
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  {isSelected && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-[var(--theme-surface)] animate-pulse" />}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[10px] font-bold text-white truncate flex items-center justify-between gap-2">
                    <span>{agent.name}</span>
                    {isSelected && (
                      <span className="text-[8px] uppercase tracking-wider text-primary">Active</span>
                    )}
                  </div>
                  <div className="text-[8px] text-[var(--theme-text-muted)] uppercase tracking-tighter">{agent.type}</div>
                </div>
              </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
          <h3 className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Permissions
          </h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--theme-text-muted)]">EIP-7702</span>
            <span className={chainVerified ? "text-green-400 font-bold" : hasDelegated ? "text-amber-400 font-bold" : "text-[var(--theme-text-muted)]"}>
              {chainVerified ? "Active (Chain Verified)" : hasDelegated ? "Active (Local)" : "Inactive"}
            </span>
          </div>
          {!hasDelegated && (
            <a href="/delegation" className="text-xs text-[var(--theme-primary)] hover:underline block text-center mt-2">
              Delegate Keys →
            </a>
          )}
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
          <h3 className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> x402 Commerce
          </h3>
          <div className="flex items-center justify-between text-sm">
             <span className="text-[var(--theme-text-muted)]">Status</span>
             <span className={`font-bold ${selectedSession.paymentStatus === 'paid' ? 'text-green-400' : 'text-[var(--theme-text-muted)]'}`}>
                {selectedSession.paymentStatus === 'idle' ? 'Ready' : selectedSession.paymentStatus === 'pending' ? 'Verifying...' : 'Paid'}
             </span>
          </div>
          {isProcessing && processingAgentId && processingAgentId !== selectedAgent.id && (
            <div className="mt-2 text-[10px] text-amber-400">
              Active request in {processingAgent?.name || `Agent #${processingAgentId}`}.
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-3 flex flex-col rounded-2xl border border-[var(--theme-border)] bg-[#0e1015] backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm relative z-20">
          <div className="text-gray-500 mb-4">
            NexusFlow Agent Swarm Runtime v1.0.0-alpha<br/>
            Network: {ACTIVE_AGENTS.length} Active Agents Online<br/>
            Primary Coordinator: {selectedAgent.name} (#{selectedAgent.id})<br/>
            Session: {selectedSession.sessionLabel}<br/>
            Type a command to begin...
          </div>

          {selectedSession.logs.length === 0 && (
            <div className="text-gray-600 mb-4">
              No commands yet for this agent session.
            </div>
          )}

          <AnimatePresence>
            {selectedSession.logs.map((log, i) => (
              <motion.div
                key={`${log.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-3 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'agent' ? 'text-cyan-400' :
                  'text-gray-300'
                }`}
              >
                <span className="text-gray-600 select-none">
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span className="flex items-start gap-2">
                  {log.type === 'agent' && <Bot className="w-3 h-3 mt-1 shrink-0" />}
                  {log.content}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div ref={logsEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 relative z-20">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={input}
                onChange={(e) =>
                  setDraftInputs((prev) => ({
                    ...prev,
                    [selectedAgent.id]: e.target.value,
                  }))
                }
                placeholder={`Ask ${selectedAgent.name} to execute strategy...`}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-700"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="px-6 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Execute</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
