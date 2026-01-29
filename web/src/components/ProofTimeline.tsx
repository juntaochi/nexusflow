'use client';

import { useMemo } from 'react';
import { Fingerprint, BadgeCheck, KeyRound, CreditCard } from 'lucide-react';
import { useAgentIdentity } from '@/hooks/useAgentIdentity';
import { use7702 } from '@/hooks/use7702';
import { useX402 } from '@/hooks/useX402';
import { useOnchainProof } from '@/hooks/useOnchainProof';
import { Badge } from '@/components/ui/Badge';
import { Accordion } from '@/components/ui/Accordion';
import { CopyButton } from '@/components/ui/CopyButton';
import { explorerAddressUrl, explorerTxUrl } from '@/lib/explorer';
import { useChainId } from 'wagmi';

type StepStatus = 'done' | 'active' | 'pending';
type StepId = 'worldid' | 'registry' | 'delegation' | 'payment';

function shortHash(value: string, head = 10, tail = 6) {
  if (!value) return '';
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function StepCard({
  icon,
  title,
  description,
  status,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: StepStatus;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const tone = status === 'done' ? 'ok' : status === 'active' ? 'warn' : 'neutral';
  const ring = status === 'active' ? 'ring-1 ring-white/20' : 'ring-0';
  const glow = status === 'active' ? 'shadow-[0_0_24px_rgba(255,255,255,0.08)]' : '';

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${ring} ${glow}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30 ${status === 'active' ? 'motion-safe:animate-pulse' : ''}`}>
            {icon}
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{title}</div>
            <div className="mt-1 text-sm text-zinc-200">{description}</div>
          </div>
        </div>
        {badge ?? <Badge tone={tone}>{status === 'done' ? 'Done' : status === 'active' ? 'Now' : 'Pending'}</Badge>}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

export function ProofTimeline({
  worldIdVerifiedOverride,
  activeStep,
}: {
  worldIdVerifiedOverride?: boolean;
  activeStep?: StepId;
}) {
  const chainId = useChainId();
  const { identity } = useAgentIdentity();
  const { hasDelegated, delegation } = use7702();
  const { lastPayment } = useX402();
  const {
    registryAddress,
    delegationAddress,
    registryHasCode,
    delegationHasCode,
    agentId,
  } = useOnchainProof();

  const worldIdDone = worldIdVerifiedOverride ?? Boolean(identity?.worldIDVerified);
  const registryDone = Boolean(agentId && agentId > BigInt(0));
  const delegationDone = hasDelegated;
  const paymentDone = Boolean(lastPayment?.txHash);

  const computedActive: StepId = useMemo(() => {
    if (activeStep) return activeStep;
    if (!worldIdDone) return 'worldid';
    if (!registryDone) return 'registry';
    if (!delegationDone) return 'delegation';
    return 'payment';
  }, [activeStep, worldIdDone, registryDone, delegationDone]);

  const stepStatus = (id: StepId): StepStatus => {
    const doneMap: Record<StepId, boolean> = {
      worldid: worldIdDone,
      registry: registryDone,
      delegation: delegationDone,
      payment: paymentDone,
    };

    if (doneMap[id]) return 'done';
    if (computedActive === id) return 'active';
    return 'pending';
  };

  const registryExplorer = explorerAddressUrl(chainId, registryAddress);
  const delegationExplorer = explorerAddressUrl(chainId, delegationAddress);
  const paymentExplorer = lastPayment ? explorerTxUrl(chainId, lastPayment.txHash) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Proof timeline</div>
          <div className="mt-1 text-sm text-zinc-300">Verify → Register → Delegate → Pay</div>
        </div>
        <Badge tone={registryHasCode && delegationHasCode ? 'ok' : 'neutral'}>
          {registryHasCode && delegationHasCode ? 'On-chain verified' : 'Awaiting proof'}
        </Badge>
      </div>

      <div className="relative mt-4">
        <div className="pointer-events-none absolute left-6 right-6 top-6 hidden h-px bg-white/10 lg:block" />
        <div className="grid gap-3 lg:grid-cols-4">
          <StepCard
            icon={<Fingerprint className="h-5 w-5 text-zinc-200" />}
            title="World ID"
            description={worldIdDone ? 'Verified' : 'Verify human'}
            status={stepStatus('worldid')}
          />

          <StepCard
            icon={<BadgeCheck className="h-5 w-5 text-zinc-200" />}
            title="Registry"
            description={registryDone ? `Agent #${agentId?.toString()}` : 'Create identity'}
            status={stepStatus('registry')}
          >
            <Accordion
              title="Details"
              subtitle="Registry bytecode + address"
            >
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-200">
                <div className="min-w-0">
                  <div className="text-zinc-500">AgentRegistry</div>
                  <div className="mt-1 truncate font-mono">{registryAddress}</div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={registryAddress} />
                  {registryExplorer ? (
                    <a href={registryExplorer} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10">
                      Explorer
                    </a>
                  ) : null}
                </div>
              </div>
            </Accordion>
          </StepCard>

          <StepCard
            icon={<KeyRound className="h-5 w-5 text-zinc-200" />}
            title="Delegation"
            description={delegationDone ? 'Permissions active' : 'Sign delegation'}
            status={stepStatus('delegation')}
          >
            <Accordion title="Details" subtitle="Delegation target">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-200">
                <div className="min-w-0">
                  <div className="text-zinc-500">NexusDelegation</div>
                  <div className="mt-1 truncate font-mono">{delegationAddress}</div>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={delegationAddress} />
                  {delegationExplorer ? (
                    <a href={delegationExplorer} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10">
                      Explorer
                    </a>
                  ) : null}
                </div>
              </div>
              {delegation?.signature ? (
                <div className="mt-2 text-[11px] text-zinc-500">
                  Signature: <span className="font-mono text-zinc-300">{shortHash(delegation.signature, 12, 8)}</span>
                </div>
              ) : null}
            </Accordion>
          </StepCard>

          <StepCard
            icon={<CreditCard className="h-5 w-5 text-zinc-200" />}
            title="Payment"
            description={paymentDone ? 'Receipt on-chain' : 'Send paid request'}
            status={stepStatus('payment')}
          >
            <Accordion title="Details" subtitle="Payment receipt">
              {lastPayment ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-200">
                  <div>
                    <div className="text-zinc-500">Last payment</div>
                    <div className="mt-1 font-mono">{shortHash(lastPayment.txHash)}</div>
                  </div>
                  {paymentExplorer ? (
                    <a href={paymentExplorer} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10">
                      Explorer
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="text-xs text-zinc-500">No payment yet.</div>
              )}
            </Accordion>
          </StepCard>
        </div>
      </div>
    </div>
  );
}
