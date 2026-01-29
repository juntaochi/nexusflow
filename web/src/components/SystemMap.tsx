'use client';

import type { ReactNode } from 'react';
import { BadgeCheck, CreditCard, KeyRound, Network, User } from 'lucide-react';
import { useAgentIdentity } from '@/hooks/useAgentIdentity';
import { use7702 } from '@/hooks/use7702';
import { useX402 } from '@/hooks/useX402';
import { useOnchainProof } from '@/hooks/useOnchainProof';

type Tone = 'neutral' | 'ok' | 'warn';

function Node({
  title,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone: Tone;
}) {
  const toneClass =
    tone === 'ok'
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : tone === 'warn'
        ? 'border-amber-500/30 bg-amber-500/10'
        : 'border-white/10 bg-white/[0.03]';

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${toneClass}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">{subtitle}</div>
      </div>
    </div>
  );
}

export function SystemMap() {
  const { identity } = useAgentIdentity();
  const { hasDelegated } = use7702();
  const { lastPayment } = useX402();
  const { agentId } = useOnchainProof();

  const worldIdDone = Boolean(identity?.worldIDVerified);
  const registryDone = Boolean(agentId && agentId > BigInt(0));

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">System map</div>
          <div className="mt-1 text-sm text-zinc-300">Human → Identity → Permissions → Paid intent → Superchain execution</div>
        </div>
      </div>

      <div className="mt-4 hidden items-center gap-3 lg:flex">
        <Node title="Human" subtitle="World ID" icon={<User className="h-5 w-5 text-zinc-200" />} tone={worldIdDone ? 'ok' : 'neutral'} />
        <div className="h-px flex-1 bg-white/10" />
        <Node title="Identity" subtitle="ERC-8004" icon={<BadgeCheck className="h-5 w-5 text-zinc-200" />} tone={registryDone ? 'ok' : 'neutral'} />
        <div className="h-px flex-1 bg-white/10" />
        <Node title="Permissions" subtitle="EIP-7702" icon={<KeyRound className="h-5 w-5 text-zinc-200" />} tone={hasDelegated ? 'ok' : 'warn'} />
        <div className="h-px flex-1 bg-white/10" />
        <Node title="Paid intent" subtitle="x402" icon={<CreditCard className="h-5 w-5 text-zinc-200" />} tone={lastPayment ? 'ok' : 'neutral'} />
        <div className="h-px flex-1 bg-white/10" />
        <Node title="Execution" subtitle="Superchain" icon={<Network className="h-5 w-5 text-zinc-200" />} tone="neutral" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:hidden">
        <Node title="Human" subtitle="World ID" icon={<User className="h-5 w-5 text-zinc-200" />} tone={worldIdDone ? 'ok' : 'neutral'} />
        <Node title="Identity" subtitle="ERC-8004" icon={<BadgeCheck className="h-5 w-5 text-zinc-200" />} tone={registryDone ? 'ok' : 'neutral'} />
        <Node title="Permissions" subtitle="EIP-7702" icon={<KeyRound className="h-5 w-5 text-zinc-200" />} tone={hasDelegated ? 'ok' : 'warn'} />
        <Node title="Paid intent" subtitle="x402" icon={<CreditCard className="h-5 w-5 text-zinc-200" />} tone={lastPayment ? 'ok' : 'neutral'} />
        <Node title="Execution" subtitle="Superchain" icon={<Network className="h-5 w-5 text-zinc-200" />} tone="neutral" />
      </div>
    </div>
  );
}
