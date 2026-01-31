'use client';

import { WorldIDVerify } from '@/components/identity/WorldIDVerify';
import { motion } from 'framer-motion';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Verify Humanity
          </h1>
          <p className="text-gray-400 mb-8">
            NexusFlow requires Sybil-resistant verification to protect the agentic economy.
            Verify your unique humanity using World ID to unlock agent registration.
          </p>

          <div className="flex justify-center">
            <WorldIDVerify />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-sm text-gray-500">
            <p>Your biometric data never leaves your device.</p>
            <p className="mt-1">Only a zero-knowledge proof of humanity is shared.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
