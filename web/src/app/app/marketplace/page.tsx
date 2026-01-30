'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useX402 } from '@/hooks/useX402';
import { Briefcase, FileText, ShieldCheck } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { KPIBar } from '@/components/KPIBar';
import { ProofTimeline } from '@/components/ProofTimeline';
import { OnchainProofCard } from '@/components/OnchainProofCard';
import { BarChart3, Layers, LineChart } from 'lucide-react';

function StrategyCard({
  title,
  description,
  intent,
  icon,
  badges,
  onRun,
  disabled,
}: {
  title: string;
  description: string;
  intent: string;
  icon: React.ReactNode;
  badges?: React.ReactNode;
  onRun: () => void;
  disabled: boolean;
}) {
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={description}
        right={
          <div className="flex items-center gap-2">
            {badges}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-zinc-200">
              {icon}
            </div>
          </div>
        }
      />
      <CardBody className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
          <div className="text-zinc-400">Intent</div>
          <div className="mt-1 font-mono">{intent}</div>
        </div>
        <Button variant="secondary" onClick={onRun} disabled={disabled}>
          Run (paid)
        </Button>
      </CardBody>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const tones = {
    low: 'ok',
    medium: 'warn',
    high: 'critical',
  } as const;
  return <Badge tone={tones[risk]}>Risk: {risk.toUpperCase()}</Badge>;
}

function APYBadge({ apy }: { apy: number }) {
  return <Badge tone="neutral">Avg APY: {(apy * 100).toFixed(1)}%</Badge>;
}

export default function MarketplacePage() {
  const { serviceInfo, isPaying, sendPaidIntent, isReady } = useX402();
  const [logs, setLogs] = useState<string[]>([]);

  const disabled = isPaying || !isReady;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Marketplace</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Paid intents</h1>
          <p className="mt-1 text-sm text-zinc-400">Pay per action. Every receipt is on-chain.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={isReady ? 'ok' : 'warn'}>{isReady ? 'Wallet ready' : 'Connect wallet'}</Badge>
          <Link href="/app/dashboard" className="text-sm text-zinc-200 hover:underline">Dashboard</Link>
        </div>
      </div>

      <KPIBar />
      <ProofTimeline />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardHeader title="Pricing" subtitle="Real cost per paid request." />
            <CardBody>
              {!serviceInfo ? (
                <div className="text-sm text-zinc-400">Loading pricing…</div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="text-zinc-200">
                    <span className="text-white font-semibold">{serviceInfo.pricePerIntent} {serviceInfo.asset}</span> / request
                  </div>
                  <div className="text-xs text-zinc-500">
                    Recipient: <span className="font-mono text-zinc-200">{serviceInfo.payTo}</span>
                  </div>
                </div>
              )}

              {!isReady ? (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100">
                  Connect your wallet to run paid strategies. If setup isn’t finished, go to{' '}
                  <Link className="underline" href="/app/onboarding">Setup</Link>.
                </div>
              ) : null}
            </CardBody>
          </Card>

      <div className="grid gap-4 lg:grid-cols-3">
          {/* Week 2: Aggregator Strategy */}
          <StrategyCard
              title="Intra-Chain Rebalance"
              description="Optimize yield within a single chain to save on bridge fees."
              intent="Rebalance USDC on Base from Aave to Moonwell if APY delta > 2%"
              icon={<Layers className="h-4 w-4" />}
              badges={<><RiskBadge risk="low" /><APYBadge apy={0.082} /></>}
              disabled={disabled}
              onRun={async () => {
                  setLogs([]);
                  await sendPaidIntent('Rebalance USDC on Base from Aave to Moonwell if APY delta > 2%', (m) => {
                      setLogs((p) => [...p, m]);
                  });
              }}
          />

          {/* Week 1: Cross-Chain Yield */}
          <StrategyCard
              title="Cross-Chain Arbitrage"
              description="Move assets to the highest yielding Superchain protocol."
              intent="Move USDC from Base Aave to OP Compound if spread > 0.5%"
              icon={<BarChart3 className="h-4 w-4" />}
              badges={<><RiskBadge risk="medium" /><APYBadge apy={0.125} /></>}
              disabled={disabled}
              onRun={async () => {
                  setLogs([]);
                  await sendPaidIntent('Move USDC from Base Aave to OP Compound if spread > 0.5%', (m) => {
                      setLogs((p) => [...p, m]);
                  });
              }}
          />

          <StrategyCard
              title="Degen Liquidity"
              description="High-risk LP farming on new DEXs."
              intent="Provide USDC/ETH liquidity on Aerodrome Base"
              icon={<LineChart className="h-4 w-4" />}
              badges={<><RiskBadge risk="high" /><APYBadge apy={0.452} /></>}
              disabled={disabled}
              onRun={async () => {
                  setLogs([]);
                  await sendPaidIntent('Provide USDC/ETH liquidity on Aerodrome Base', (m) => {
                      setLogs((p) => [...p, m]);
                  });
              }}
          />

            <StrategyCard
          title="Pay contractors"
          description="Pay people by intent, not by app permissions."
          intent="Send 300 USDC to 0x0000000000000000000000000000000000000000 for January work"
          icon={<Briefcase className="h-4 w-4" />}
          badges={<RiskBadge risk="low" />}
              disabled={disabled}
              onRun={async () => {
                setLogs([]);
            await sendPaidIntent('Send 300 USDC to 0x0000000000000000000000000000000000000000 for January work', (m) => {
                  setLogs((p) => [...p, m]);
                });
              }}
            />

            <StrategyCard
          title="Invoice autopay"
          description="Automatic settlement once a condition is met."
          intent="Pay invoice #124 in USDC on Base when due"
          icon={<FileText className="h-4 w-4" />}
          badges={<RiskBadge risk="low" />}
              disabled={disabled}
              onRun={async () => {
                setLogs([]);
            await sendPaidIntent('Pay invoice #124 in USDC on Base when due', (m) => {
                  setLogs((p) => [...p, m]);
                });
              }}
            />

        <StrategyCard
          title="Policy guardrails"
          description="Least-privilege spending with caps + alerts."
          intent="Set a monthly spend cap of 200 USDC for AI tools and alert on breach"
          icon={<ShieldCheck className="h-4 w-4" />}
          badges={<RiskBadge risk="low" />}
          disabled={disabled}
          onRun={async () => {
            setLogs([]);
            await sendPaidIntent('Set a monthly spend cap of 200 USDC for AI tools and alert on breach', (m) => {
              setLogs((p) => [...p, m]);
            });
          }}
        />
          </div>

          <Accordion title="Technical logs" subtitle="Raw logs from paid execution (hidden by default)." defaultOpen={false}>
            {logs.length ? (
              <div className="max-h-[340px] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
                <div className="space-y-1.5">
                  {logs.map((l, idx) => (
                    <div key={idx} className="break-words">{l}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-400">Run a strategy to see logs.</div>
            )}
          </Accordion>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Accordion title="Proof details" subtitle="Bytecode + registry reads (for auditors)." defaultOpen={false}>
            <OnchainProofCard />
          </Accordion>
        </div>
      </div>
    </div>
  );
}
