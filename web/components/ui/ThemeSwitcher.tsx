'use client';

import { motion } from 'framer-motion';
import { useThemeStore, Theme } from '@/stores/theme-store';

const themes: { id: Theme; label: string; icon: string }[] = [
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '⚡' },
  { id: 'glass', label: 'Glass', icon: '💎' },
  { id: 'minimal', label: 'Minimal', icon: '◻️' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex gap-2 p-2 rounded-lg bg-surface">
      {themes.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            theme === t.id
              ? 'bg-primary text-white'
              : 'hover:bg-surface/80'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid={`theme-${t.id}`}
        >
          <span className="mr-1">{t.icon}</span>
          {t.label}
        </motion.button>
      ))}
    </div>
  );
}
