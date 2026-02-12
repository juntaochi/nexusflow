'use client';

import { motion } from 'framer-motion';

interface PaymentBadgeProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md';
  animate?: boolean;
}

export function PaymentBadge({ amount, currency = 'NUSD', size = 'md', animate = false }: PaymentBadgeProps) {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
      }
    : {};

  return (
    <Component
      {...animationProps}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 ${
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      }`}
    >
      <span className="font-mono font-bold text-primary">
        {amount < 0.001 ? amount.toExponential(2) : amount.toFixed(4)}
      </span>
      <span className="text-primary/60 font-medium">{currency}</span>
    </Component>
  );
}
