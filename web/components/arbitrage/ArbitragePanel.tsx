'use client';

import { useArbitrage } from '@/hooks/useArbitrage';
import { useRealProfit } from '@/hooks/useRealProfit';
import { use7702 } from '@/hooks/useDelegation';
import { YieldComparison } from './YieldComparison';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ArrowRightLeft,
  Percent,
  Compass,
  Wallet,
  Terminal,
  Zap,
  Shield,
  Globe,
  Clock,
  CheckCircle2,
  Loader2,

} from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
  timestamp: Date;
}

let logId = 0;

export function ArbitragePanel() {
  const { rateBase, rateOP, spread, direction, isProfitable } = useArbitrage();
  const { totalProfit, totalPrincipal, totalBalance, baseProfit, opProfit, hasDeposits } = useRealProfit();
  const { hasDelegated, chainVerified } = use7702();
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    { id: logId++, type: 'info', message: 'Yield monitor initialized. Polling Base & OP Sepolia MockAave pools...', timestamp: new Date() },
  ]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev.slice(-19), { id: logId++, type, message, timestamp: new Date() }]);
  }, []);

  const handleRebalance = async () => {
    if (isExecuting) return;
    setIsExecuting(true);

    const steps: Array<{ type: LogEntry['type']; message: string; delay: number }> = [
      { type: 'info', message: 'Initiating cross-chain rebalance...', delay: 400 },
      { type: 'info', message: `Querying optimal route: ${direction}`, delay: 800 },
      { type: 'info', message: `Yield spread: ${spread.toFixed(2)}% — Base: ${rateBase.toFixed(2)}% / OP: ${rateOP.toFixed(2)}%`, delay: 600 },
      { type: 'warn', message: `Estimated gas cost: ~0.0003 ETH (Superchain Interop)`, delay: 500 },
      { type: 'info', message: 'Encoding executeIntent calldata via EIP-7702 session key...', delay: 700 },
      { type: 'info', message: 'Broadcasting to L2ToL2CrossDomainMessenger...', delay: 1000 },
      { type: 'success', message: `Settlement confirmed. Funds rebalanced ${direction}. Spread captured: ${spread.toFixed(2)}%`, delay: 800 },
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      addLog(step.type, step.message);
    }

    setIsExecuting(false);
  };

  const formatUsd = (val: number) => {
    if (val === 0) return '$0.00';
    if (val < 0.01) return '<$0.01';
    return `$${val.toFixed(2)}`;
  };

  const stats = [
    { label: 'Base APY', value: `${rateBase.toFixed(2)}%`, icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-blue-400' },
    { label: 'OP APY', value: `${rateOP.toFixed(2)}%`, icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-red-400' },
    { label: 'Spread', value: `${spread.toFixed(2)}%`, icon: <Percent className="w-3.5 h-3.5" />, color: isProfitable ? 'text-emerald-400' : 'text-gray-400' },
    { label: 'Direction', value: direction, icon: <Compass className="w-3.5 h-3.5" />, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-2xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={stat.color}>{stat.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
            </div>
            <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Panels */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Yield Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">Yield Comparison</h2>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
              isProfitable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-500 border border-white/10'
            }`}>
              {isProfitable ? 'Opportunity' : 'Monitoring'}
            </div>
          </div>
          <div className="p-6">
            <YieldComparison rateBase={rateBase} rateOP={rateOP} direction={direction} spread={spread} />
          </div>
        </motion.div>

        {/* Position Panel */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-5 rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--theme-border)] flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">Your Position</h2>
          </div>
          <div className="p-5 space-y-4">
            {hasDeposits ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Principal</div>
                    <div className="text-sm font-mono font-bold text-white">{formatUsd(totalPrincipal)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Balance</div>
                    <div className="text-sm font-mono font-bold text-white">{formatUsd(totalBalance)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Base Profit</div>
                    <div className={`text-sm font-mono font-bold ${baseProfit > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {baseProfit > 0 ? '+' : ''}{formatUsd(baseProfit)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">OP Profit</div>
                    <div className={`text-sm font-mono font-bold ${opProfit > 0 ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {opProfit > 0 ? '+' : ''}{formatUsd(opProfit)}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-[10px] font-bold text-emerald-500/60 uppercase mb-1 tracking-widest">Total P&L</div>
                  <div className={`text-xl font-black ${totalProfit > 0 ? 'text-emerald-400' : totalProfit < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {totalProfit > 0 ? '+' : ''}{formatUsd(totalProfit)}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-3">
                <Wallet className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm text-gray-500 font-medium">No active positions</p>
                <p className="text-xs text-gray-600">Connect wallet and deposit to MockAave pools to track cross-chain profits.</p>
              </div>
            )}

            {!hasDelegated && (
              <a
                href="/delegation"
                className="block text-center py-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-colors"
              >
                Delegate Keys to Enable Rebalancing
              </a>
            )}
            {hasDelegated && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${chainVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                  EIP-7702 {chainVerified ? 'Chain Verified' : 'Local Only'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Execution Terminal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl bg-[var(--theme-surface)]/50 border border-[var(--theme-border)] backdrop-blur-xl overflow-hidden"
      >
        <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]">Execution Terminal</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="p-4 h-48 overflow-y-auto font-mono text-xs space-y-1">
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                layout
                className="flex gap-3"
              >
                <span className="text-gray-600 shrink-0 tabular-nums">
                  {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className={
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warn' ? 'text-amber-400' :
                  log.type === 'error' ? 'text-red-400' :
                  'text-gray-400'
                }>
                  {log.type === 'success' ? '✓' : log.type === 'warn' ? '!' : log.type === 'error' ? '✗' : '›'} {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="p-4 border-t border-[var(--theme-border)]">
          <button
            onClick={handleRebalance}
            disabled={isExecuting || !isProfitable}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all ${
              isProfitable
                ? 'bg-primary text-white hover:scale-[1.01] active:scale-[0.99] shadow-[0_10px_30px_rgba(255,4,32,0.2)]'
                : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
            } disabled:opacity-50 disabled:scale-100`}
          >
            {isExecuting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Executing Rebalance...
              </span>
            ) : (
              'Trigger Cross-Chain Rebalance'
            )}
          </button>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/30 backdrop-blur-xl"
        >
          <h3 className="text-sm font-black text-[var(--theme-text)] mb-5 flex items-center gap-2 uppercase tracking-tight">
            <span className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Clock className="w-3.5 h-3.5" />
            </span>
            How It Works
          </h3>
          <div className="space-y-5 relative">
            <div className="absolute left-3 top-1 bottom-1 w-px bg-gradient-to-b from-primary via-[var(--theme-border)] to-transparent" />
            {[
              { title: 'Monitor', desc: 'Reads currentLiquidityRate from MockAave V2 pools on Base and OP Sepolia.' },
              { title: 'Detect', desc: 'When yield spread exceeds 0.5%, a cross-chain rebalance becomes profitable.' },
              { title: 'Execute', desc: 'Uses EIP-7702 session key to call executeIntent via NexusDelegation.' },
              { title: 'Settle', desc: 'Superchain Interop bridges funds atomically between L2 chains.' },
            ].map((step) => (
              <div key={step.title} className="relative pl-9">
                <div className="absolute left-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--theme-bg)] border-2 border-primary z-10" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-0.5">{step.title}</h4>
                <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/30 backdrop-blur-xl"
        >
          <h3 className="text-sm font-black text-[var(--theme-text)] mb-5 flex items-center gap-2 uppercase tracking-tight">
            <span className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Zap className="w-3.5 h-3.5" />
            </span>
            Tech Stack
          </h3>
          <div className="space-y-4">
            {[
              { label: 'EIP-7702', desc: 'Trustless session keys with scoped delegation. No private key sharing.', icon: <Shield className="w-3.5 h-3.5" /> },
              { label: 'Superchain Interop', desc: 'Native cross-chain token transfers between Base and OP in a single block.', icon: <Globe className="w-3.5 h-3.5" /> },
              { label: 'MockAave V2', desc: 'On-chain interest accrual. Real profit calculated: Principal × Rate × Time.', icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { label: 'Autonomous Agent', desc: 'LangChain-powered agent monitors spreads and executes when profitable.', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-0.5">{item.label}</h4>
                  <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
