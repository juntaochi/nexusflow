'use client';

import { motion } from 'framer-motion';

interface SessionKeyCardProps {
  address: string;
  expiry: number;
  isRevoking?: boolean;
  onRevoke: () => void;
}

export function SessionKeyCard({ address, expiry, isRevoking, onRevoke }: SessionKeyCardProps) {
  const isExpired = expiry < Date.now() / 1000;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          🔑
        </div>
        <div>
          <p className="text-sm font-mono text-white truncate max-w-[150px]">{address}</p>
          <p className={`text-[10px] font-bold uppercase ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
            {isExpired ? 'Expired' : `Expires in ${Math.round((expiry - Date.now() / 1000) / 3600)}h`}
          </p>
        </div>
      </div>

      <button 
        onClick={onRevoke}
        disabled={isRevoking}
        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-colors"
      >
        {isRevoking ? 'Revoking...' : 'Revoke'}
      </button>
    </motion.div>
  );
}
