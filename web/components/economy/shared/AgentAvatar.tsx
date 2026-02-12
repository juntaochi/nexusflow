'use client';

import { AgentStatus } from '@/types/economy';
import { STATUS_COLORS } from '@/lib/economy/constants';

interface AgentAvatarProps {
  src?: string;
  name: string;
  status?: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

const indicatorSizes = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function AgentAvatar({ src, name, status, size = 'md' }: AgentAvatarProps) {
  const initials = name
    .split(/[#\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center overflow-hidden border border-primary/20`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-primary">{initials}</span>
        )}
      </div>
      {status && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${indicatorSizes[size]} rounded-full border-2 border-[var(--theme-surface)]`}
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
      )}
    </div>
  );
}
