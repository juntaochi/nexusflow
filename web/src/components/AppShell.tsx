'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId } from 'wagmi';
import { Badge } from '@/components/ui/Badge';
import { getChainById } from '@/lib/superchain';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/app' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={
        active
          ? 'text-white'
          : 'text-zinc-400 hover:text-zinc-200'
      }
    >
      {children}
    </Link>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const chain = getChainById(chainId);
  return (
    <div className="min-h-screen bg-[#06070A] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.08),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(16,185,129,0.10),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_80%_30%,rgba(99,102,241,0.10),rgba(0,0,0,0))]" />
      </div>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/app/onboarding" className="font-semibold tracking-tight">
              NexusFlow
            </Link>

            <nav className="flex items-center gap-4 text-sm">
              <NavLink href="/app/onboarding">Setup</NavLink>
              <NavLink href="/app/dashboard">Dashboard</NavLink>
              <NavLink href="/app/marketplace">Marketplace</NavLink>
              <NavLink href="/app/agent">Agent</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone={chain ? 'ok' : 'neutral'}>
              {chain ? chain.label : `Chain ${chainId}`}
            </Badge>
            <div className="shrink-0">
              <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
