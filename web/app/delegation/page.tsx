'use client';

import { use7702 } from '@/hooks/useDelegation';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Clock, AlertCircle, Activity } from 'lucide-react';

export default function DelegationPage() {
  const { signDelegation, isSigning, hasDelegated, delegation, clearDelegation } = use7702();
  const { isBase } = useChainSwitch();
  const [contractAddress, setContractAddress] = useState<string>('');
  const [duration, setDuration] = useState(24); // Default 24 hours

  useEffect(() => {
    const defaultAddress = isBase 
       ? process.env.NEXT_PUBLIC_DELEGATION_CONTRACT 
       : process.env.NEXT_PUBLIC_DELEGATION_CONTRACT_OP;
       
    if (defaultAddress) {
       setContractAddress(defaultAddress);
    }
  }, [isBase]);

  return (
    <div className="min-h-screen py-20 px-4 bg-[var(--theme-bg)] relative z-10">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Shield className="w-3 h-3 fill-primary" /> EIP-7702 Trustless Delegation
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-[var(--theme-text)] tracking-tighter uppercase leading-tight"
          >
            Security Sandbox
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[var(--theme-text-muted)] mt-4 font-medium max-w-2xl mx-auto text-lg"
          >
            Authorize autonomous agents to work for you without ever sharing your private keys. 
            Granular permissions, on-chain limits, and instant revocation.
          </motion.p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="p-8 rounded-[2.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)]/50 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Lock className="w-48 h-48 text-[var(--theme-text)]" />
               </div>

               <div className="relative z-10">
                 <h3 className="text-2xl font-black text-[var(--theme-text)] mb-8 uppercase tracking-tight">Active Permissions</h3>
                 
                 {hasDelegated && delegation ? (
                   <div className="space-y-6">
                     <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-emerald-400 uppercase tracking-widest text-xs">Sandbox Active</span>
                            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">EIP-7702 Verified</span>
                          </div>
                          <p className="text-sm text-white/90 font-medium mb-3">
                            Your EOA has been upgraded to a Smart Account via Delegation.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                               <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Target</div>
                               <div className="text-xs font-mono text-gray-300 truncate">{delegation.contractAddress}</div>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                               <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Expiry</div>
                               <div className="text-xs font-mono text-gray-300">
                                 {(() => {
                                   if (delegation.expiresAt <= Date.now()) return 'Expired';
                                   const diff = delegation.expiresAt - Date.now();
                                   const hours = Math.floor(diff / (1000 * 60 * 60));
                                   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                   return `Expires in ${hours}h ${minutes}m`;
                                 })()}
                               </div>
                            </div>
                          </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Yield Ops', status: 'Allowed', icon: <Zap className="w-3 h-3" /> },
                          { label: 'Swap Ops', status: 'Allowed', icon: <Activity className="w-3 h-3" /> },
                          { label: 'Withdraw', status: 'Blocked', icon: <Lock className="w-3 h-3" /> },
                        ].map((perm) => (
                          <div key={perm.label} className="p-4 rounded-2xl border border-white/5 bg-white/5 text-center">
                             <div className="flex justify-center mb-2">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${perm.status === 'Allowed' ? 'text-emerald-400 bg-emerald-400/10' : 'text-primary bg-primary/10'}`}>
                                  {perm.icon}
                                </div>
                             </div>
                             <div className="text-[10px] font-black uppercase text-gray-400 mb-0.5">{perm.label}</div>
                             <div className={`text-[8px] font-bold uppercase ${perm.status === 'Allowed' ? 'text-emerald-500' : 'text-primary/70'}`}>{perm.status}</div>
                          </div>
                        ))}
                     </div>

                     <button 
                        onClick={clearDelegation}
                        className="w-full py-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-[0.2em] hover:bg-primary/10 transition-colors relative z-30"
                     >
                        Revoke Permissions Instantly
                     </button>
                   </div>
                 ) : (
                   <div className="space-y-8">
                      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-primary/80 text-sm font-medium flex gap-3">
                         <AlertCircle className="w-5 h-5 shrink-0" />
                         Sign a delegation to allow the NexusFlow Agent to optimize your yield spreads across the Superchain.
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)] font-black ml-1">Target Contract Address</label>
                          <input 
                            type="text" 
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[var(--theme-text)] font-mono text-sm focus:border-primary outline-none transition-colors relative z-30"
                            placeholder="0x..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)] font-black ml-1">Daily Limit (NUSD)</label>
                            <input 
                              type="number" 
                              defaultValue={1000}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[var(--theme-text)] font-mono text-sm focus:border-primary outline-none transition-colors relative z-30"
                            />
                          </div>
                           <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-[0.3em] text-[var(--theme-text-muted)] font-black ml-1">Session Duration</label>
                            <select 
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-[var(--theme-text)] font-bold text-sm focus:border-primary outline-none appearance-none transition-colors relative z-30"
                              value={duration}
                              onChange={(e) => setDuration(parseInt(e.target.value))}
                            >
                               <option value="24">24 Hours</option>
                               <option value="168">7 Days</option>
                               <option value="1">1 Hour</option>
                            </select>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => signDelegation(contractAddress as `0x${string}`, duration)}
                          disabled={isSigning || !contractAddress}
                          className="w-full py-6 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-[0_20px_40px_rgba(255,4,32,0.3)] relative z-30"
                        >
                          {isSigning ? 'Authorizing...' : 'Authorize Agent via 7702'}
                        </button>
                      </div>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-[2.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)]/30 backdrop-blur-xl">
              <h3 className="text-lg font-black text-[var(--theme-text)] mb-6 flex items-center gap-3 uppercase tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                   <Clock className="w-4 h-4" />
                </span>
                The Trust Cycle
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-[var(--theme-border)] to-transparent" />
                
                {[
                  { title: 'Define', desc: 'Set granular parameters for what the agent can and cannot do.' },
                  { title: 'Authorize', desc: 'Sign an EIP-7702 authorization list—no private key shared.' },
                  { title: 'Automate', desc: 'The agent executes intents via your upgraded EOA account.' },
                  { title: 'Expire', desc: 'Session automatically terminates after 24 hours.' }
                ].map((step) => (
                  <div key={step.title} className="relative pl-12">
                    <div className="absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--theme-bg)] border-2 border-primary z-10" />
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">{step.title}</h4>
                    <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] border border-primary/20 bg-primary/5 backdrop-blur-md">
               <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                 <Shield className="w-4 h-4" /> EIP-7702 Delegation
               </h4>
               <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-medium">
                 NexusFlow leverages EIP-7702 to temporarily grant smart contract capabilities to your EOA. 
                 This means you get the security of a multi-sig or smart wallet with the convenience of your current setup.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
