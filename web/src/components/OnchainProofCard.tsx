'use client';

import { useMemo } from 'react';
import { useChainId } from 'wagmi';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { explorerAddressUrl } from '@/lib/explorer';
import { useOnchainProof } from '@/hooks/useOnchainProof';
import { getChainById } from '@/lib/superchain';

import { type Address } from 'viem';

function AddressRow({ label, address }: { label: string; address: Address }) {
  const chainId = useChainId();
  const href = explorerAddressUrl(chainId, address);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="min-w-0">
        <div className="text-[11px] text-zinc-400">{label}</div>
        <div className="mt-0.5 truncate font-mono text-xs text-zinc-100">{address}</div>
      </div>
      <div className="flex items-center gap-2">
        <CopyButton value={address} />
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
          >
            Explorer
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function OnchainProofCard() {
  const chainId = useChainId();
  const chain = getChainById(chainId);
  const {
    registryAddress,
    delegationAddress,
    registryHasCode,
    delegationHasCode,
    agentCount,
    agentId,
    hasRegistryAddress,
  } = useOnchainProof();

  const deploymentTone = useMemo(() => {
    if (registryHasCode === false || delegationHasCode === false) return 'warn' as const;
    if (registryHasCode === true && delegationHasCode === true) return 'ok' as const;
    return 'neutral' as const;
  }, [registryHasCode, delegationHasCode]);

  return (
    <Card>
      <CardHeader
        title="On-chain proof"
        subtitle="Live bytecode checks + explorer links (not a browser-only animation)."
        right={
          <Badge tone={deploymentTone}>
            {chain ? `${chain.label} (${chain.chainId})` : `Chain ${chainId}`}
          </Badge>
        }
      />
      <CardBody className="space-y-3">
        {!hasRegistryAddress ? (
          <div className="text-sm text-amber-200">
            Missing <code className="font-mono">NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS</code>
          </div>
        ) : (
          <>
            <AddressRow label="AgentRegistry (ERC-8004)" address={registryAddress} />
            <AddressRow label="NexusDelegation (EIP-7702 target)" address={delegationAddress} />
          </>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
            <div className="text-[11px] text-zinc-400">Registry bytecode</div>
            <div className="mt-0.5 text-sm text-zinc-100">
              {registryHasCode === null ? '—' : registryHasCode ? 'Detected' : 'Not found'}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
            <div className="text-[11px] text-zinc-400">Delegation bytecode</div>
            <div className="mt-0.5 text-sm text-zinc-100">
              {delegationHasCode === null ? '—' : delegationHasCode ? 'Detected' : 'Not found'}
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
            <div className="text-[11px] text-zinc-400">Registry agentCount()</div>
            <div className="mt-0.5 text-sm text-zinc-100">
              {agentCount === null ? '—' : agentCount.toString()}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
            <div className="text-[11px] text-zinc-400">Your agentIdByController()</div>
            <div className="mt-0.5 text-sm text-zinc-100">
              {agentId === null ? '—' : agentId.toString()}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
