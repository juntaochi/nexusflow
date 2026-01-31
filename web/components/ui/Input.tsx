'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--theme-text-muted)]">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-[var(--theme-radius)] bg-black/20 border border-[var(--theme-border)] text-[var(--theme-text)] focus:outline-none focus:border-primary/50 transition-colors placeholder:text-gray-600 text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{error}</p>
      )}
    </div>
  );
}
