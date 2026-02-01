'use client';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex items-center gap-4 ml-auto">
          <ThemeSwitcher />
          <div className="h-6 w-[1px] bg-white/10" />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
