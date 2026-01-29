'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function Accordion({
  title,
  subtitle,
  right,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="text-sm font-semibold tracking-tight text-white">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-zinc-400">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </div>
  );
}
