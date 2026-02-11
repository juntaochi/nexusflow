'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import type { ISuccessResult } from '@worldcoin/idkit';
import { WorldIDVerify } from '@/components/WorldIDVerify';
import { useAgentIdentity } from '@/hooks/useAgentIdentity';
import { use7702 } from '@/hooks/use7702';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { KPIBar } from '@/components/KPIBar';
import { ProofTimeline } from '@/components/ProofTimeline';
import { OnchainProofCard } from '@/components/OnchainProofCard';
import { getChainById } from '@/lib/superchain';


type StepId = 'connect' | 'worldid' | 'registry' | 'permissions';

type TimelineStepId = 'worldid' | 'registry' | 'delegation' | 'payment';

export default function OnboardingPage() {
  const chainId = useChainId();
  const { address } = useAccount();
  const { identity, isLoading, error, registerAgent } = useAgentIdentity();
  const { signDelegation, isSigning, hasDelegated, delegation } = use7702();
  const chain = getChainById(chainId);

  const [proof, setProof] = useState<ISuccessResult | null>(null);
  const [agentName, setAgentName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const worldIdDone = Boolean(proof) || Boolean(identity?.worldIDVerified);
  const registryDone = Boolean(identity);

  const currentStep: StepId = useMemo(() => {
    if (!address) return 'connect';
    if (!worldIdDone) return 'worldid';
    if (!registryDone) return 'registry';
    if (!hasDelegated) return 'permissions';
    return 'permissions';
  }, [address, worldIdDone, registryDone, hasDelegated]);

  const timelineStep: TimelineStepId = useMemo(() => {
    if (currentStep === 'registry') return 'registry';
    if (currentStep === 'permissions') return 'delegation';
    return 'worldid';
  }, [currentStep]);

  const suggestedName = useMemo(() => {
    if (!address) return 'NexusFlow Agent';
    return `NexusFlow Agent ${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const canRegister = Boolean(address) && worldIdDone && !registryDone;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Setup</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Create your agent</h1>
          <p className="mt-1 text-sm text-zinc-400">Verify → Register → Delegate. Setup your agent identity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={chain ? 'ok' : 'warn'}>{chain ? chain.label : `Wrong network (${chainId})`}</Badge>
          <Badge tone={Boolean(address) ? 'ok' : 'neutral'}>Wallet</Badge>
          <Badge tone={worldIdDone ? 'ok' : 'neutral'}>World ID</Badge>
          <Badge tone={registryDone ? 'ok' : 'neutral'}>Registry</Badge>
          <Badge tone={hasDelegated ? 'ok' : 'neutral'}>Permissions</Badge>
        </div>
      </div>

      {localError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{localError}</div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : null}

      <KPIBar />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <ProofTimeline worldIdVerifiedOverride={worldIdDone} activeStep={timelineStep} />
          <Accordion title="Proof details" subtitle="Bytecode + registry reads (for auditors)." defaultOpen={false}>
            <OnchainProofCard />
          </Accordion>
          <Accordion title="Onboarding Status" subtitle="Live infrastructure verification." defaultOpen={true}>
            <div className="space-y-2 text-sm text-zinc-200">
              <div>• Wallet connected (controller address)</div>
              <div>• World ID verified (anti-sybil)</div>
              <div>• Agent registered on-chain (agentId)</div>
              <div>• Permissions granted (delegation signature)</div>
              <div className="pt-2 text-xs text-zinc-500">
                Then open Dashboard: run an intent, show x402 payment tx, keep explorer tabs open.
              </div>
            </div>
          </Accordion>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <Accordion
            title="1) Connect wallet"
            subtitle="This address becomes the controller of your agent identity."
            right={<Badge tone={address ? 'ok' : 'neutral'}>{address ? 'Connected' : 'Pending'}</Badge>}
            defaultOpen={currentStep === 'connect'}
          >
            {address ? (
              <div className="text-sm text-zinc-200">
                Connected as <span className="font-mono">{address}</span>.
              </div>
            ) : (
              <div className="text-sm text-zinc-400">Use the connect button in the header.</div>
            )}
          </Accordion>

          <Accordion
            title="2) World ID"
            subtitle="Sybil resistance for the registry (demo can be bypassed)."
            right={<Badge tone={worldIdDone ? 'ok' : currentStep === 'worldid' ? 'warn' : 'neutral'}>{worldIdDone ? 'Done' : 'Pending'}</Badge>}
            defaultOpen={currentStep === 'worldid'}
          >
            {identity?.worldIDVerified ? (
              <div className="text-sm text-emerald-200">Already verified (from your agent metadata).</div>
            ) : (
              <WorldIDVerify
                disabled={!address}
                onVerified={(p) => {
                  setProof(p);
                }}
              />
            )}
            {proof?.nullifier_hash ? (
              <div className="mt-2 text-xs text-zinc-400">
                Nullifier: <span className="font-mono">{proof.nullifier_hash.slice(0, 16)}…</span>
              </div>
            ) : null}
          </Accordion>

          <Accordion
            title="3) Register on-chain (ERC-8004)"
            subtitle="Creates an auditable agent profile + assigns agentId."
            right={<Badge tone={registryDone ? 'ok' : currentStep === 'registry' ? 'warn' : 'neutral'}>{registryDone ? 'Done' : 'Pending'}</Badge>}
            defaultOpen={currentStep === 'registry'}
          >
            {registryDone && identity ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[11px] text-zinc-400">Agent ID</div>
                  <div className="mt-0.5 text-lg font-semibold text-white">#{identity.agentId.toString()}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[11px] text-zinc-400">Name</div>
                  <div className="mt-0.5 text-sm text-zinc-100">{identity.profile.name}</div>
                </div>
              </div>
            ) : (
              <>
                <label className="block">
                  <div className="text-xs text-zinc-400">Agent name</div>
                  <input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder={suggestedName}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
                    disabled={!canRegister || isLoading}
                  />
                </label>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="primary"
                    disabled={!canRegister || isLoading}
                    onClick={async () => {
                      setLocalError(null);
                      try {
                        const name = (agentName || suggestedName).trim();
                        if (!name) throw new Error('Agent name is required');
                        await registerAgent(name, proof || undefined);
                      } catch (e) {
                        setLocalError(e instanceof Error ? e.message : 'Registration failed');
                      }
                    }}
                  >
                    {isLoading ? 'Registering…' : 'Register agent'}
                  </Button>
                  <Link
                    href="/app/agent"
                    className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    View agent
                  </Link>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  Metadata is stored as JSON inside the registry’s <span className="font-mono">metadataURI</span> field (demo shortcut).
                </div>
              </>
            )}
          </Accordion>

          <Accordion
            title="4) Grant permissions (EIP-7702)"
            subtitle="Signature-based delegation (demo); revocable in wallet."
            right={<Badge tone={hasDelegated ? 'ok' : currentStep === 'permissions' ? 'warn' : 'neutral'}>{hasDelegated ? 'Done' : 'Pending'}</Badge>}
            defaultOpen={currentStep === 'permissions'}
          >
            {hasDelegated && delegation ? (
              <div className="space-y-2 text-sm">
                <div>
                  Target: <span className="font-mono">{delegation.contractAddress}</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Signature: <span className="font-mono">{delegation.signature.slice(0, 18)}…</span>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                disabled={!address || !registryDone || isSigning}
                onClick={async () => {
                  setLocalError(null);
                  try {
                    const delegationContract = process.env.NEXT_PUBLIC_DELEGATION_CONTRACT;
                    if (!delegationContract) throw new Error('Missing NEXT_PUBLIC_DELEGATION_CONTRACT');
                    await signDelegation(delegationContract as `0x${string}`);
                  } catch (e) {
                    setLocalError(e instanceof Error ? e.message : 'Delegation failed');
                  }
                }}
              >
                {isSigning ? 'Requesting signature…' : 'Sign delegation'}
              </Button>
            )}

            <div className="mt-3 text-xs text-zinc-500">
              Current step: <span className="text-zinc-200">{currentStep}</span>
            </div>

            <div className="mt-3">
              <Link
                href="/app/dashboard"
                className={
                  hasDelegated
                    ? 'rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90'
                    : 'rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10'
                }
              >
                Go to dashboard
              </Link>
            </div>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
