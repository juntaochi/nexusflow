'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Shield, 
  History, 
  Bot,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Console', href: '/console', icon: Terminal },
  { name: 'Strategies', href: '/arbitrage', icon: ArrowLeftRight },
  { name: 'Delegation', href: '/delegation', icon: Shield },
  { name: 'History', href: '/history', icon: History },
  { name: 'Agents', href: '/agents', icon: Bot },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className = '', isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          flex flex-col w-64 h-screen fixed left-0 top-0 z-50 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${className}
        `}
        style={{
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderRight: '1px solid var(--theme-sidebar-border)',
        }}
      >
        <div 
          className="p-6"
          style={{ borderBottom: '1px solid var(--theme-sidebar-border)' }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div 
                className="absolute inset-0 rounded-lg opacity-80 group-hover:opacity-100 transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--theme-primary)',
                  boxShadow: '0 0 20px var(--theme-primary)',
                }}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center font-bold text-sm"
                style={{ color: 'var(--theme-bg)' }}
              >
                <Zap size={18} />
              </div>
            </div>
            <div className="flex flex-col">
              <span 
                className="font-display font-bold text-lg tracking-tight leading-none"
                style={{ color: 'var(--theme-sidebar-text)' }}
              >
                Nexus
              </span>
              <span 
                className="text-[10px] font-medium tracking-widest uppercase"
                style={{ color: 'var(--theme-sidebar-text-muted)' }}
              >
                Flow
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative block group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ 
                      backgroundColor: 'var(--theme-sidebar-active-bg)',
                      borderLeft: '3px solid var(--theme-sidebar-active)',
                    }}
                  />
                )}
                
                <div 
                  className={`
                    relative flex items-center gap-3 px-4 py-3 rounded-xl 
                    transition-all duration-200
                    ${isActive ? 'font-semibold' : 'font-medium'}
                  `}
                  style={{
                    color: isActive 
                      ? 'var(--theme-sidebar-active)' 
                      : 'var(--theme-sidebar-text-muted)',
                    backgroundColor: isActive 
                      ? 'transparent' 
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)';
                      e.currentTarget.style.color = 'var(--theme-sidebar-text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--theme-sidebar-text-muted)';
                    }
                  }}
                >
                  <Icon 
                    size={20} 
                    className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} 
                    style={{ 
                      color: isActive ? 'var(--theme-sidebar-active)' : 'inherit'
                    }}
                  />
                  <span className="text-sm tracking-wide">{item.name}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--theme-sidebar-active)' }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div 
          className="p-4 mx-4 mb-4 rounded-2xl"
          style={{ 
            borderTop: '1px solid var(--theme-sidebar-border)',
            backgroundColor: 'var(--theme-sidebar-hover)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 blur-[3px] animate-pulse opacity-60" />
            </div>
            <div className="flex flex-col min-w-0">
              <span 
                className="text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--theme-sidebar-text-muted)' }}
              >
                System Status
              </span>
              <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                <span className="truncate">Online</span>
              </span>
            </div>
            <Activity 
              size={16} 
              className="ml-auto flex-shrink-0 text-green-500/70" 
            />
          </div>
        </div>
      </aside>
    </>
  );
}
