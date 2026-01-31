'use client';

import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { useWorldIDStore } from '@/hooks/useWorldID';
import { motion } from 'framer-motion';

export function WorldIDVerify() {
  const { setVerified, isVerified } = useWorldIDStore();

  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID || 'app_staging_f0d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8';
  const action = process.env.NEXT_PUBLIC_WORLD_ACTION || 'verify-human';

  const handleVerify = (result: ISuccessResult) => {
    console.log('World ID Verified:', result);
    setVerified(result);
  };

  if (isVerified) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-green-500/50 bg-green-500/10 backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl">
          ✓
        </div>
        <p className="text-green-400 font-medium">Humanity Verified</p>
      </div>
    );
  }

  return (
    <IDKitWidget
      app_id={appId as `app_${string}`}
      action={action}
      onSuccess={handleVerify}
      verification_level={VerificationLevel.Device}
    >
      {({ open }) => (
        <motion.button
          onClick={open}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 border border-cyan-400/30"
        >
          Verify with World ID
        </motion.button>
      )}
    </IDKitWidget>
  );
}
