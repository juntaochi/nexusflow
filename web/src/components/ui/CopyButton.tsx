'use client';

import { useState } from 'react';

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 800);
        } catch {
          // ignore
        }
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
