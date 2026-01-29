'use client';

import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50';

  const styles: Record<Variant, string> = {
    primary:
      'bg-white text-black hover:bg-white/90',
    secondary:
      'border border-white/10 bg-white/5 text-white hover:bg-white/10',
    ghost:
      'text-zinc-200 hover:bg-white/5',
  };

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
