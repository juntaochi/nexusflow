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

export function AgentConsole() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'paid'>('idle');
  const [activeAgents] = useState([
    { id: '402', name: 'Strategy Hub', status: 'ready', type: 'Yield Optimizer' },
    { id: '801', name: 'Liquidity Node', status: 'active', type: 'Dex Aggregator' },
    { id: 'Nexus', name: 'Identity Oracle', status: 'ready', type: 'ERC-8004 Registry' }
  ]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { hasAgent, reputation } = useAgentRegistry();
  const { hasDelegated } = use7702();

  const addLog = (type: LogMessage['type'], content: string) => {
    setLogs(prev => [...prev, { type, content, timestamp: Date.now() }]);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userIntent = input;
    setInput('');
    setIsProcessing(true);
    setPaymentStatus('pending');
    addLog('info', `> ${userIntent}`);

    try {
      addLog('agent', 'Coordinating with Agent #801 (Liquidity Node)...');
      addLog('agent', 'Agent #801 requested x402 payment (0.01 NUSD)...');
      
      const response = await fetch('/api/agent/paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: userIntent }),
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
                addLog('agent', data.message);
              } else if (line.includes('event: tool')) {
                addLog('info', `[Tool Call]: ${data.message.length > 200 ? data.message.slice(0, 200) + "..." : data.message}`);
              } else if (line.includes('event: error')) {
                addLog('error', data.message);
              } else if (line.includes('event: end')) {
                setPaymentStatus('paid');
              }
            } catch (err) {
              continue;
            }
          }
        }
      }
    } catch (error) {
      addLog('error', 'Communication error with agent swarm.');
    } finally {
      setIsProcessing(false);
      setPaymentStatus('idle');
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
            {activeAgents.map(agent => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-500'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  {agent.status === 'active' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-[var(--theme-surface)] animate-pulse" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{agent.name}</div>
                  <div className="text-[8px] text-[var(--theme-text-muted)] uppercase tracking-tighter">{agent.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] backdrop-blur-md">
          <h3 className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Permissions
          </h3>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--theme-text-muted)]">EIP-7702</span>
            <span className={hasDelegated ? "text-green-400 font-bold" : "text-[var(--theme-text-muted)]"}>
              {hasDelegated ? "Active" : "Inactive"}
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
             <span className={`font-bold ${paymentStatus === 'paid' ? 'text-green-400' : 'text-[var(--theme-text-muted)]'}`}>
                {paymentStatus === 'idle' ? 'Ready' : paymentStatus === 'pending' ? 'Verifying...' : 'Paid'}
             </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 flex flex-col rounded-2xl border border-[var(--theme-border)] bg-[#0e1015] backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm relative z-20">
          <div className="text-gray-500 mb-4">
            NexusFlow Agent Swarm Runtime v1.0.0-alpha<br/>
            Network: 3 Active Agents Online<br/>
            Type a command to begin...
          </div>
          
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div
                key={i}
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
                onChange={(e) => setInput(e.target.value)}
                placeholder="Swap 1 ETH for NUSD..."
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
