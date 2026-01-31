'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Agents', href: '/agents' },
  { name: 'Arbitrage', href: '/arbitrage' },
  { name: 'Delegation', href: '/delegation' },
  { name: 'History', href: '/history' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-8 pl-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary group-hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all" />
            <span className="font-black text-xl tracking-tighter uppercase text-white">NexusFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  pathname === link.href 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
