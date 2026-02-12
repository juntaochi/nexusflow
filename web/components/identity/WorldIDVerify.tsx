'use client';

import { IDKitWidget, VerificationLevel, ISuccessResult, IErrorState } from '@worldcoin/idkit';
import { useEffect, useId, useState } from 'react';
import { useWorldID } from '@/hooks/useWorldID';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function WorldIDVerify() {
  const { setVerified, isVerified, isBypassed } = useWorldID();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const rawContainerId = useId();
  const containerId = `world-id-widget-${rawContainerId.replace(/:/g, '')}`;

  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID || 'app_staging_f0d8d8d8d8d8d8d8d8d8d8d8d8d8d8d8';
  const action = process.env.NEXT_PUBLIC_WORLD_ACTION || 'verify-human';

  const handleVerify = (result: ISuccessResult) => {
    console.log('World ID Verified:', result);
    setErrorMessage(null);
    setVerified(result);
    setIsPopupOpen(false);
  };

  const handleError = (error: IErrorState) => {
    console.error('World ID verification error:', error);
    if (error?.code) {
      setErrorMessage(`World ID error: ${error.code}`);
      return;
    }
    setErrorMessage('World ID verification failed. Please try again.');
  };

  const openPopup = () => {
    setErrorMessage(null);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  useEffect(() => {
    if (!isPopupOpen) {
      setIsContainerReady(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsContainerReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isPopupOpen]);

  return (
    <div className="flex flex-col items-center gap-4">
      {isVerified && (
        <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-green-500/50 bg-green-500/10 backdrop-blur-md w-full">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
            ✓
          </div>
          <p className="text-green-400 font-medium">Humanity Verified</p>
        </div>
      )}

      <motion.button
        onClick={openPopup}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 border border-cyan-400/30"
      >
        {isVerified ? 'Re-verify with World ID' : 'Verify with World ID'}
      </motion.button>

      {isBypassed && (
        <p className="text-[10px] uppercase tracking-[0.14em] text-amber-400/80">
          Bypass mode is active, but live verification is still available.
        </p>
      )}

      {errorMessage && (
        <p className="text-xs text-red-400">{errorMessage}</p>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closePopup}
            aria-label="Close World ID verification popup"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="world-id-dialog-title"
            className="relative w-full max-w-md rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 id="world-id-dialog-title" className="text-lg font-bold text-[var(--theme-text)]">
                Verify with World ID
              </h2>
              <button
                type="button"
                onClick={closePopup}
                aria-label="Close"
                className="p-2 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--theme-text-muted)] mb-4">
              Scan the QR code with World App to complete verification.
            </p>

            <div id={containerId} className="rounded-xl overflow-hidden bg-white min-h-[320px]" />

            {isContainerReady && (
              <IDKitWidget
                app_id={appId as `app_${string}`}
                action={action}
                onSuccess={handleVerify}
                onError={handleError}
                autoClose
                show_modal={false}
                container_id={containerId}
                verification_level={VerificationLevel.Device}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
