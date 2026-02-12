'use client';

import { WorldIDVerify } from '@/components/identity/WorldIDVerify';
import { useWorldID } from '@/hooks/useWorldID';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCircle } from 'lucide-react';

export default function VerifyPage() {
  const { setVerified } = useWorldID();

  const setMockVerification = () => {
    const mockProof = {
      merkle_root: '0xmock',
      nullifier_hash: '0xmock',
      proof: '0xmock',
      verification_level: 'device'
    };
    setVerified(mockProof);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--theme-bg)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-10 rounded-[2.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)]/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 text-primary">
            <UserCircle className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
            Verify Humanity
          </h1>
          
          <p className="text-[var(--theme-text-muted)] mb-10 font-medium leading-relaxed">
            NexusFlow uses World ID to ensure agents are owned by real humans. 
            This Sybil-resistant layer protects the ecosystem from bot-farms.
          </p>

          <div className="flex justify-center mb-8 scale-110">
            <WorldIDVerify />
          </div>
          
          <div className="space-y-4 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-black/20 border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Privacy-first verification flow</span>
             </div>

             <button
                onClick={setMockVerification}
                className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 hover:text-amber-400 transition-colors"
             >
                Dev Mode: Bypass Verification (Testnet Only)
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
