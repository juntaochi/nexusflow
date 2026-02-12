'use client';

import { AgentCategory } from '@/types/economy';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/economy/constants';

interface CategoryBadgeProps {
  category: AgentCategory;
  size?: 'sm' | 'md';
  onClick?: () => void;
  selected?: boolean;
}

export function CategoryBadge({ category, size = 'md', onClick, selected }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider transition-all
        ${size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]'}
        ${onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        ${selected ? 'ring-2 ring-offset-2 ring-offset-[var(--theme-surface)]' : ''}
      `}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
        borderWidth: 1,
        ...(selected && { ringColor: color }),
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  );
}
