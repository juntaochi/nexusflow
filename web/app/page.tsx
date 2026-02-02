'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Code2, Shield, Zap, Lock } from 'lucide-react';

export default function Home() {
  const partners = [
    { name: 'Optimism', logo: '🔴' },
    { name: 'Base', logo: '🔵' },
    { name: 'World ID', logo: '🌍' },
    { name: 'EigenLayer', logo: '♾️' },
    { name: 'Safe', logo: '🔐' },
    { name: 'Uniswap', logo: '🦄' },
  ];

  const features = [
    {
      title: "Track A: Autonomous Arbitrage",
      description: "Serverless Yield Optimization. AI monitors on-chain rates and rebalances via Superchain Interop. No APIs, pure smart contract logic.",
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20",
      delay: 0
    },
    {
      title: "Track B: x402 Strategy Marketplace",
      description: "Payment for Intelligence. Monetize premium strategies via x402 protocol. Pay NUSD per execution with ironclad security.",
      icon: <Lock className="w-6 h-6 text-amber-400" />,
      color: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/20",
      delay: 0.1
    },
    {
      title: "Track C: Trustless Identity",
      description: "Sybil-Resistant Agents. Verify human ownership via World ID. On-chain reputation registry tracks agent reliability (ERC-8004).",
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      color: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/20",
      delay: 0.2
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--theme-bg)]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-black to-transparent opacity-40" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer group">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest group-hover:text-white transition-colors">NexusFlow Mainnet Alpha is Live</span>
              <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors ml-1" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-[var(--theme-text)] tracking-tighter uppercase leading-[0.9] mb-8">
              The Infrastructure for <br />
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent font-black">
                Trustless Agentic Economy
              </span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl text-[var(--theme-text-muted)] font-medium leading-relaxed mb-10">
              Empowering AI agents to manage assets across the Optimism Superchain with EIP-7702 security and World ID verification.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <button className="px-8 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-sm hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(255,4,32,0.4)] transition-all flex items-center gap-2">
                  Launch App <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/agents">
                 <button className="px-8 py-4 rounded-xl bg-[var(--theme-surface)] text-[var(--theme-text)] font-black uppercase tracking-widest text-sm border border-[var(--theme-border)] hover:bg-[var(--theme-sidebar-hover)] transition-all flex items-center gap-2">
                  <Code2 className="w-4 h-4" /> Read Docs
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Trusted By */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 pt-10 border-t border-[var(--theme-border)]"
          >
            <p className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em] mb-8">Powering Infrastructure For</p>
            <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {partners.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-xl font-bold text-gray-400 select-none">
                  <span className="text-2xl">{p.logo}</span> {p.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 relative bg-[var(--theme-bg)]">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--theme-border)] to-transparent" />
         
         <div className="max-w-7xl mx-auto px-6">
           <div className="mb-20">
             <h2 className="text-4xl md:text-5xl font-black text-[var(--theme-text)] tracking-tighter uppercase mb-6">
               The NexusFlow Stack
             </h2>
             <p className="text-xl text-[var(--theme-text-muted)] max-w-2xl">
               Modular primitives designed for high-velocity agentic applications. 
               Drop-in replacements for legacy Web2 infrastructure.
             </p>
           </div>

            <div className="grid md:grid-cols-3 gap-6">
             {features.map((feature) => (
               <motion.div
                 key={feature.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: feature.delay }}
                 className={`p-8 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-sm group hover:scale-[1.02] transition-transform duration-300`}
               >
                 <div className="w-12 h-12 rounded-2xl bg-[var(--theme-bg)] border border-[var(--theme-border)] flex items-center justify-center mb-6 group-hover:bg-[var(--theme-surface)] transition-colors">
                   {feature.icon}
                 </div>
                 <h3 className="text-xl font-bold text-[var(--theme-text)] mb-3">{feature.title}</h3>
                 <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed font-medium">
                   {feature.description}
                 </p>
               </motion.div>
             ))}
           </div>
         </div>
      </section>

      {/* Code / Developer Section */}
      <section className="py-20 border-y border-[var(--theme-border)] bg-[var(--theme-bg)]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              Developer First
            </div>
            <h2 className="text-4xl font-black text-[var(--theme-text)] tracking-tighter uppercase mb-6">
              From Script to <br />
              <span className="text-primary">Autonomous Agent</span>
            </h2>
            <p className="text-[var(--theme-text-muted)] text-lg mb-8 leading-relaxed">
              Integrate NexusFlow SDKs directly into your existing LangChain or AutoGPT workflows. 
              Turn any Python script into an economic actor in minutes.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Zero-setup EIP-7702 Delegation",
                "Automated Yield Optimization",
                "Built-in Sybil Resistance",
                "Cross-chain Atomic Swaps"
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-300 font-medium">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/delegation">
              <button className="text-white font-bold border-b border-primary pb-1 hover:text-primary transition-colors">
                Explore Documentation →
              </button>
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative rounded-2xl bg-[#0e1015] border border-white/10 p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <span className="ml-2 text-xs text-gray-500 font-mono">eip7702_delegation.ts</span>
              </div>
              <pre className="font-mono text-xs md:text-sm text-gray-300 overflow-x-auto">
                <code>
{`// EIP-7702 Authorization List
const authorization = await walletClient.signAuthorization({
  contractAddress: NEXUS_DELEGATION_ADDRESS,
  delegate: AGENT_SESSION_KEY
});

// Execute trustless intent via session key
await agent.execute({
  authorization,
  intent: "rebalance_yield",
  params: { maxSlippage: 50 }
});

console.log("Delegation active: Permissioned to earn.");`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-black text-[var(--theme-text)] tracking-tighter uppercase mb-8">
            Build Fast. Scale Instantly.
          </h2>
          <p className="text-xl text-[var(--theme-text-muted)] mb-12 max-w-2xl mx-auto">
            Join the hundreds of developers building the autonomous economy on NexusFlow.
            Your agents are waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/dashboard">
                <button className="px-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl">
                  Launch App
                </button>
             </Link>
             <Link href="/verify">
                <button className="px-10 py-5 rounded-2xl bg-[var(--theme-text)] text-[var(--theme-bg)] border border-[var(--theme-border)] font-black uppercase tracking-widest text-sm hover:bg-[var(--theme-text)]/90 transition-colors">
                  Get Verified
                </button>
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
