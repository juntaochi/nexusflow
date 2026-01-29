'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BadgeCheck, Briefcase, CreditCard, ShieldCheck } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useAgentIdentity } from '@/hooks/useAgentIdentity';
import { use7702 } from '@/hooks/use7702';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useX402 } from '@/hooks/useX402';
import { useOmnichainPerception } from '@/hooks/useOmnichainPerception';
import { IntentType, formatIntentPreview } from '@/lib/intents';
import { getChainById } from '@/lib/superchain';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { KPIBar } from '@/components/KPIBar';
import { ProofTimeline } from '@/components/ProofTimeline';
import { CrossChainFlow } from '@/components/CrossChainFlow';
import { IntentChips } from '@/components/IntentChips';
import { SystemMap } from '@/components/SystemMap';
import { OnchainProofCard } from '@/components/OnchainProofCard';


type BridgeStatus = 'idle' | 'burning' | 'messaging' | 'minting' | 'completed';

function UseCaseTile({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-zinc-200">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-xs text-zinc-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { identity } = useAgentIdentity();
  const { hasDelegated } = use7702();
  const { sendIntent, logs, isProcessing, result, clearLogs } = useAgentStream();
  const { isPaying, sendPaidIntent, isReady: isX402Ready } = useX402();
  const { opportunity } = useOmnichainPerception();

  const [input, setInput] = useState('');
  const [paidMode, setPaidMode] = useState(false);
  const [paidLogs, setPaidLogs] = useState<string[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('idle');
  const [bridgePath, setBridgePath] = useState<{ source: string; target: string } | null>(null);

  const setupOk = Boolean(address) && Boolean(identity) && Boolean(hasDelegated);

  const activity = useMemo(() => {
    const items = [...logs, ...paidLogs];
    return items.slice(-80);
  }, [logs, paidLogs]);

  const activeChain = getChainById(chainId);

  const canSend = Boolean(input.trim()) && !isProcessing && !isPaying;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Dashboard</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Agent-first finance</h1>
            <p className="mt-1 text-sm text-zinc-400">Identity, permissions, paid intent, superchain execution.</p>
          </div>
          <SystemMap />
        </div>

        <div className="space-y-3 lg:col-span-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={activeChain ? 'ok' : 'warn'}>
              {activeChain ? activeChain.label : `Unsupported network (${chainId})`}
            </Badge>
            <Badge tone={setupOk ? 'ok' : 'warn'}>{setupOk ? 'Ready' : 'Setup needed'}</Badge>
            <Link href="/app/onboarding" className="text-xs text-zinc-200 hover:underline">Setup</Link>
            <Link href="/app/marketplace" className="text-xs text-zinc-200 hover:underline">Use cases</Link>
          </div>

          {!setupOk ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              Finish setup to register + authorize.
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
              Setup complete. Show proof live.
            </div>
          )}

          <KPIBar />
        </div>
      </div>

      <ProofTimeline />

      <div className="grid gap-3 md:grid-cols-4">
        <UseCaseTile icon={<Briefcase className="h-5 w-5" />} title="Pay contractors" subtitle="Per intent, with receipts." />
        <UseCaseTile icon={<ShieldCheck className="h-5 w-5" />} title="Policy guardrails" subtitle="Least-privilege spend." />
        <UseCaseTile icon={<CreditCard className="h-5 w-5" />} title="Invoice autopay" subtitle="Only on approval." />
        <UseCaseTile icon={<BadgeCheck className="h-5 w-5" />} title="Auditable identity" subtitle="ERC‑8004 registry." />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card>
            <CardHeader
              title="Run an intent"
              subtitle="Free parse or paid x402 execution."
              right={
                <label className="flex items-center gap-2 text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={paidMode}
                    onChange={(e) => setPaidMode(e.target.checked)}
                  />
                  Paid (x402)
                </label>
              }
            />
            <CardBody className="space-y-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Pay invoice #124 in USDC on Base"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
                disabled={isProcessing || isPaying}
              />

              <IntentChips onSelect={(intent) => setInput(intent)} />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  disabled={!canSend || paidMode}
                  onClick={async () => {
                    const intent = input.trim();
                    setInput('');
                    await sendIntent(intent);
                  }}
                >
                  Send
                </Button>

                <Button
                  variant="secondary"
                  disabled={!canSend || !paidMode || !isX402Ready}
                  onClick={async () => {
                    const intent = input.trim();
                    setInput('');
                    setPaidLogs((p) => [...p, '[x402] paid request started']);
                    await sendPaidIntent(intent, (msg) => setPaidLogs((p) => [...p, msg]));
                  }}
                >
                  Pay & send
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => {
                    clearLogs();
                    setPaidLogs([]);
                  }}
                >
                  Clear
                </Button>
              </div>

              {paidMode && !isX402Ready ? (
                <div className="text-xs text-amber-200">Connect wallet to pay.</div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Treasury routing signal" subtitle="Demo signal for cross-chain cost reduction." />
            <CardBody className="space-y-3">
              {opportunity ? (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                    <div className="text-[11px] text-zinc-400">Signal</div>
                    <div className="mt-0.5 text-sm text-white">
                      {opportunity.asset}: {Math.round(opportunity.sourceRate * 1000) / 10}% → {Math.round(opportunity.targetRate * 1000) / 10}%
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {opportunity.sourceChain} → {opportunity.targetChain} · delta {(opportunity.spread * 100).toFixed(2)}%
                    </div>
                  {opportunity.sourceProtocol && opportunity.targetProtocol ? (
                    <div className="mt-1 text-xs text-zinc-500">
                      {opportunity.sourceProtocol} → {opportunity.targetProtocol}
                    </div>
                  ) : null}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPaidLogs((p) => [...p, `Routing started: ${opportunity.sourceChain} → ${opportunity.targetChain}`]);
                    setBridgePath({ source: opportunity.sourceChain, target: opportunity.targetChain });
                      setBridgeStatus('burning');
                      setTimeout(() => setBridgeStatus('messaging'), 2500);
                      setTimeout(() => setBridgeStatus('minting'), 6000);
                      setTimeout(() => {
                        setBridgeStatus('completed');
                        setPaidLogs((p) => [...p, 'Routing completed (demo)']);
                      }, 9000);
                    }}
                  >
                    Visualize routing
                  </Button>
                </>
              ) : (
                <div className="text-sm text-zinc-400">No signal right now.</div>
              )}
            </CardBody>
          </Card>

          {bridgeStatus !== 'idle' ? (
            <Card>
              <CardHeader
                title="Superchain visualization"
                subtitle="Demo flow to narrate interop (not on-chain proof)."
                right={
                  bridgeStatus === 'completed' ? (
                    <Button variant="secondary" onClick={() => {
                      setBridgeStatus('idle');
                      setBridgePath(null);
                    }}>Close</Button>
                  ) : null
                }
              />
              <CardBody>
                <CrossChainFlow
                  status={bridgeStatus}
                  sourceLabel={bridgePath?.source}
                  destinationLabel={bridgePath?.target}
                />
              </CardBody>
            </Card>
          ) : null}

          {result ? (
            <Card>
              <CardHeader
                title="Intent preview"
                subtitle={result.intent.type === IntentType.UNKNOWN ? 'Parser could not understand the request.' : 'Human-in-the-loop confirmation before execution.'}
                right={
                  result.intent.type !== IntentType.UNKNOWN ? (
                    <Badge tone="ok">{Math.round(result.intent.confidence * 100)}% confidence</Badge>
                  ) : (
                    <Badge tone="warn">Unknown</Badge>
                  )
                }
              />
              <CardBody className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100">
                  {formatIntentPreview(result.intent)}
                </div>

                {result.intent.type !== IntentType.UNKNOWN ? (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setPaidLogs((p) => [...p, 'User cancelled']);
                        clearLogs();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setPaidLogs((p) => [...p, 'User confirmed']);

                        if (result.intent.type === IntentType.BRIDGE) {
                          const source = result.intent.fromChain ?? 'Base Sepolia';
                          const target = result.intent.toChain ?? 'OP Sepolia';
                          setBridgePath({ source, target });
                          setBridgeStatus('burning');
                          setTimeout(() => setBridgeStatus('messaging'), 2500);
                          setTimeout(() => setBridgeStatus('minting'), 6000);
                          setTimeout(() => {
                            setBridgeStatus('completed');
                            setPaidLogs((p) => [...p, 'Bridge completed (demo)']);
                          }, 9000);
                        }

                        clearLogs();
                      }}
                    >
                      Confirm
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400">Make the request more explicit (token, amount, target chain/address).</div>
                )}
              </CardBody>
            </Card>
          ) : null}

          <Accordion
            title="Technical logs"
            subtitle="Raw stream from the API (hidden by default for judge mode)."
            right={<Link href="/app/onboarding" className="text-xs text-zinc-300 hover:underline">Setup</Link>}
            defaultOpen={false}
          >
            {activity.length ? (
              <div className="max-h-[340px] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
                <div className="space-y-1.5">
                  {activity.map((line, idx) => (
                    <div key={idx} className="break-words">{line}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-400">No activity yet.</div>
            )}
          </Accordion>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Accordion title="On-chain proof (details)" subtitle="Bytecode + registry reads." defaultOpen={false}>
            <OnchainProofCard />
          </Accordion>
        </div>
      </div>
    </div>
  );
}
