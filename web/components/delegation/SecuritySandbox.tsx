'use client';

import { motion } from 'framer-motion';

interface SecuritySandboxProps {
  limit: string;
  remaining: string;
}

export function SecuritySandbox({ limit, remaining }: SecuritySandboxProps) {
  const percent = Number(limit) > 0 ? (Number(remaining) / Number(limit)) * 100 : 0;

  return (
    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
      </div>

      <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
        🛡️ Security Sandbox
      </h3>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            <span>Daily Spending Limit</span>
            <span className="text-white">{remaining} / {limit} USDC</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Whitelisted Protocols</p>
          <div className="flex flex-wrap gap-2">
            {['Aave V2', 'Compound III', 'Uniswap V3', '0x Protocol'].map(p => (
              <span key={p} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
