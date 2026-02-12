'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  loading: Loader2,
};

const colors = {
  success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  error: 'text-red-400 bg-red-400/10 border-red-400/20',
  loading: 'text-primary bg-primary/10 border-primary/20',
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl ${colors[toast.type]}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${toast.type === 'loading' ? 'animate-spin' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[var(--theme-text)]">{toast.title}</div>
                {toast.message && (
                  <div className="text-xs text-[var(--theme-text-muted)] mt-0.5">{toast.message}</div>
                )}
              </div>
              {toast.type !== 'loading' && (
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--theme-text-muted)]" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
