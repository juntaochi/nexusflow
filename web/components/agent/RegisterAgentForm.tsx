'use client';

import { useState } from 'react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useWorldIDStore } from '@/hooks/useWorldID';
import { motion, AnimatePresence } from 'framer-motion';

export function RegisterAgentForm() {
  const [name, setName] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerAgent } = useAgentRegistry();
  const { isVerified } = useWorldIDStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      setError('You must verify your humanity via World ID first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await registerAgent(name, metadataURI);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl"
    >
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter agent name..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Metadata URI (IPFS/URL)</label>
        <input
          type="text"
          value={metadataURI}
          onChange={(e) => setMetadataURI(e.target.value)}
          required
          placeholder="ipfs://..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting || !isVerified}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 border ${
          isVerified 
            ? 'bg-primary text-white border-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]' 
            : 'bg-gray-800 text-gray-500 border-white/5 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Registering...' : 'Register Agent'}
      </button>

      {!isVerified && (
        <p className="text-center text-xs text-amber-500/80">
          ⚠️ World ID verification required to register an agent.
        </p>
      )}
    </motion.form>
  );
}
