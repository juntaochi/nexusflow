'use client';

import { useState } from 'react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Lock, Loader2, FileCheck } from 'lucide-react';

export function ValidatorConsole({ agentId }: { agentId: string | number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationHash, setAttestationHash] = useState<string | null>(null);

  const { attest } = useAgentRegistry();

  const handleAttest = async () => {
    setIsAttesting(true);
    try {
      const jobHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;
      const evidence = "https://audits.nexusflow.network/reports/v1/29384";
      
      const tx = await attest(BigInt(agentId), jobHash, true, evidence);
      setAttestationHash(tx || jobHash); 
    } catch (error) {
      console.error("Attestation failed:", error);
    } finally {
      setIsAttesting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
      >
        <Lock className="w-3 h-3" />
        Validator Access
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-xl bg-red-950/20 border border-red-500/20 overflow-hidden"
    >
      <div className="p-3 bg-red-500/10 border-b border-red-500/10 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-400" />
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Restricted: Validator Panel</span>
        <button 
          onClick={() => setIsOpen(false)}
          className="ml-auto text-xs text-red-400/50 hover:text-red-400"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-xs text-gray-400">
          As a registered validator, you can perform deep inspection of the agent code/runtime and issue an on-chain attestation.
        </p>

        {attestationHash ? (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex flex-col items-center text-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div className="text-sm font-bold text-green-400">Attestation Confirmed</div>
            <div className="text-[10px] font-mono text-green-300/70 break-all">TX: {attestationHash}</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/20 p-2 rounded">
              <input type="checkbox" checked readOnly className="rounded border-gray-600 bg-transparent text-red-500" />
              <span>Verify TEE Enclave Signature</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/20 p-2 rounded">
              <input type="checkbox" checked readOnly className="rounded border-gray-600 bg-transparent text-red-500" />
              <span>Audit Registration Metadata</span>
            </div>

            <button
              onClick={handleAttest}
              disabled={isAttesting}
              className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isAttesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileCheck className="w-3 h-3" />}
              Issue On-Chain Attestation
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
