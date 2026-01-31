'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-[var(--theme-radius)] border border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-xl ${glow ? 'shadow-[var(--theme-glow)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
