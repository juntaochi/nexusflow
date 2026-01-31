'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <section className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            The Future of Autonomous Finance
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-8">
            Trustless Agentic <br /> 
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Economy</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-400 font-medium leading-relaxed mb-12">
            NexusFlow enables AI agents to autonomously manage user funds across the Optimism Superchain with 
            EIP-7702 delegation, World ID sybil-resistance, and real-time on-chain yield.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/verify">
              <button className="px-10 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:shadow-[0_0_50px_rgba(0,255,255,0.6)] transition-all">
                Start Verification
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm border border-white/10 transition-all">
                Launch Dashboard
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-40 grid md:grid-cols-3 gap-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md hover:border-primary/30 transition-colors group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl mb-8 group-hover:bg-primary group-hover:text-white transition-all">
            🛡️
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Trustless Security</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            EIP-7702 allows you to delegate granular permissions to agents without ever 
            giving up custody of your keys. Ironclad boundaries enforced by smart contracts.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="p-10 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md hover:border-primary/30 transition-colors group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl mb-8 group-hover:bg-primary group-hover:text-white transition-all">
            ⚡
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Superchain Speed</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            Native Superchain Interop tokens allow agents to bridge capital between 
            Base and Optimism in a single block, maximizing arbitrage efficiency.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-10 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md hover:border-primary/30 transition-colors group"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl mb-8 group-hover:bg-primary group-hover:text-white transition-all">
            👤
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Humanity First</h3>
          <p className="text-gray-500 leading-relaxed text-sm">
            World ID integration ensures every agent owner is a verified human, preventing 
            Sybil attacks and building a sustainable decentralized economy.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
