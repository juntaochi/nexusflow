'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAgentIdentity } from '@/hooks/useAgentIdentity';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { KPIBar } from '@/components/KPIBar';
import { ProofTimeline } from '@/components/ProofTimeline';
import { OnchainProofCard } from '@/components/OnchainProofCard';

export default function AgentPage() {
  const { identity, voteReputation, isLoading, hasAgent } = useAgentIdentity();
  const [localError, setLocalError] = useState<string | null>(null);

  const metadata = useMemo(() => {
    if (!identity) return null;
    try {
      return JSON.parse(identity.profile.metadataURI);
    } catch {
      return null;
    }
  }, [identity]);

  if (!hasAgent) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Agent</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Your agent identity</h1>
        </div>
        <KPIBar />
        <ProofTimeline />
        <Card>
          <CardHeader title="No agent yet" subtitle="Create an identity first." />
          <CardBody className="text-sm text-zinc-400">
            Go to <Link className="underline" href="/app/onboarding">Setup</Link>.
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!identity) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Agent</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">On-chain profile</h1>
          <p className="mt-1 text-sm text-zinc-400">ERC-8004 registry state, readable by anyone.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={identity.worldIDVerified ? 'ok' : 'neutral'}>{identity.worldIDVerified ? 'World ID verified' : 'World ID: not verified'}</Badge>
          <Link href="/app/dashboard" className="text-sm text-zinc-200 hover:underline">Dashboard</Link>
        </div>
      </div>

      {localError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{localError}</div>
      ) : null}

      <KPIBar />
      <ProofTimeline />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Accordion title="Proof details" subtitle="Bytecode + registry reads (for auditors)." defaultOpen={false}>
            <OnchainProofCard />
          </Accordion>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title="Profile" subtitle="Agent ID + controller." right={<Badge tone={identity.profile.validated ? 'ok' : 'neutral'}>{identity.profile.validated ? 'Validated' : 'Unvalidated'}</Badge>} />
              <CardBody className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[11px] text-zinc-400">Agent ID</div>
                  <div className="mt-0.5 text-lg font-semibold text-white">#{identity.agentId.toString()}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="text-[11px] text-zinc-400">Name</div>
                  <div className="mt-0.5 text-sm text-zinc-100">{identity.profile.name}</div>
                </div>
                <div className="text-xs text-zinc-500">
                  Controller: <span className="font-mono text-zinc-200">{identity.profile.controller}</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Reputation" subtitle="One address can vote once per agent." right={<Badge tone="neutral">Live</Badge>} />
              <CardBody className="space-y-3">
                <div className="text-5xl font-semibold tracking-tight text-white">
                  {identity.reputation > BigInt(0) ? '+' : ''}{identity.reputation.toString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={isLoading}
                    onClick={async () => {
                      setLocalError(null);
                      try {
                        await voteReputation(identity.agentId, true);
                      } catch (e) {
                        setLocalError(e instanceof Error ? e.message : 'Upvote failed');
                      }
                    }}
                  >
                    Upvote
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={isLoading}
                    onClick={async () => {
                      setLocalError(null);
                      try {
                        await voteReputation(identity.agentId, false);
                      } catch (e) {
                        setLocalError(e instanceof Error ? e.message : 'Downvote failed');
                      }
                    }}
                  >
                    Downvote
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <Accordion title="Raw metadata" subtitle="JSON stored inline in metadataURI." defaultOpen={false}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
                <div className="text-zinc-400">Raw</div>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono">{identity.profile.metadataURI}</pre>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-200">
                <div className="text-zinc-400">Parsed</div>
                <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono">{metadata ? JSON.stringify(metadata, null, 2) : 'Not JSON'}</pre>
              </div>
            </div>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
