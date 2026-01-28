'use client';

import { useState, useCallback } from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface WorldIDVerifyProps {
  onVerified: (proof: ISuccessResult) => void;
  disabled?: boolean;
}

const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || 'app_staging_demo';
const ACTION = 'nexusflow-agent-auth';

export function WorldIDVerify({ onVerified, disabled }: WorldIDVerifyProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async (proof: ISuccessResult) => {
    try {
      console.log('World ID Proof:', proof);
      setIsVerified(true);
      setError(null);
      onVerified(proof);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  }, [onVerified]);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-xs">
        <CheckCircle className="w-4 h-4" />
        <span>WORLD_ID_VERIFIED</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <IDKitWidget
        app_id={APP_ID as `app_${string}`}
        action={ACTION}
        onSuccess={handleVerify}
        verification_level={VerificationLevel.Device}
        autoClose
        {...({ title: 'NexusFlow Verification' } as any)}
      >
        {({ open }) => (
          <div className="space-y-2">
            <button
              onClick={open}
              disabled={disabled}
              className="w-full py-3 px-4 border border-green-800 hover:border-green-400 hover:bg-green-900/20 
                         flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Verify with World ID
              </span>
            </button>
            
            <button
              onClick={() => handleVerify({
                proof: '0xmock_proof',
                merkle_root: '0xmock_root',
                nullifier_hash: '0x' + Math.random().toString(16).slice(2, 42).padStart(40, '0'),
                verification_level: VerificationLevel.Device
              })}
              className="w-full py-1 text-[8px] text-green-900 hover:text-green-500 uppercase tracking-tighter transition-colors"
            >
              [ Simulator Unavailable? Click to Bypass ]
            </button>
          </div>
        )}
      </IDKitWidget>
      
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      <p className="text-[10px] text-green-900 text-center">
        Prove you&apos;re human to activate AI agent
      </p>
    </div>
  );
}

export function useWorldIDStatus() {
  const [isVerified, setIsVerified] = useState(false);
  const [proof, setProof] = useState<ISuccessResult | null>(null);

  const verify = useCallback((result: ISuccessResult) => {
    setProof(result);
    setIsVerified(true);
  }, []);

  return { isVerified, proof, verify };
}
