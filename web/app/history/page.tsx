'use client';

import { TransactionList } from '@/components/history/TransactionList';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-[var(--theme-text)] tracking-tighter uppercase"
          >
            Transaction History
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--theme-text-muted)] mt-2 font-medium"
          >
            Your private, client-side activity record stored in localStorage.
          </motion.p>
        </header>

        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <TransactionList />
          </div>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed max-w-sm mx-auto">
            This history is only stored on your device. Clearing your browser cache 
            or using a different device will reset this list.
          </p>
        </footer>
      </div>
    </div>
  );
}
