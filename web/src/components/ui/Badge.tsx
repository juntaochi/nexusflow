import * as React from 'react';

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'ok' | 'warn' | 'critical';
  children: React.ReactNode;
}) {
  const cls =
    tone === 'ok'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      : tone === 'warn'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : tone === 'critical'
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
        : 'border-white/10 bg-white/5 text-zinc-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${cls}`}>
      {children}
    </span>
  );
}
