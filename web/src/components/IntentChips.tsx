'use client';

import { Button } from '@/components/ui/Button';

const CHIPS = [
  { label: 'Pay contractor', intent: 'Send 300 USDC to 0x0000000000000000000000000000000000000000 for January work' },
  { label: 'Budget cap', intent: 'Set a monthly budget cap of 200 USDC for AI tools and alert on breach' },
  { label: 'Invoice autopay', intent: 'Pay invoice #124 in USDC on Base when due' },
];

export function IntentChips({ onSelect }: { onSelect: (intent: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => (
        <Button
          key={chip.label}
          variant="ghost"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
          onClick={() => onSelect(chip.intent)}
        >
          {chip.label}
        </Button>
      ))}
    </div>
  );
}
