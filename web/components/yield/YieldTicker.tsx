'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { formatUnits } from 'viem';

interface YieldTickerProps {
  value: bigint;
}

export function YieldTicker({ value }: YieldTickerProps) {
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const numValue = parseFloat(formatUnits(value, 18));
    springValue.set(numValue);
  }, [value, springValue]);

  const formatted = useTransform(springValue, (latest) => latest.toFixed(8));

  return (
    <motion.span className="font-mono tabular-nums">
      {formatted}
    </motion.span>
  );
}
