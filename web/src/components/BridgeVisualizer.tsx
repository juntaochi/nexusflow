import React, { useEffect, useState } from 'react';
import { ArrowRight, Box, Check, Loader2 } from 'lucide-react';

interface BridgeStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
  txHash?: string;
}

interface BridgeVisualizerProps {
  sourceChain: string;
  targetChain: string;
  token: string;
  amount: string;
  onComplete: () => void;
}

export function BridgeVisualizer({ sourceChain, targetChain, token, amount, onComplete }: BridgeVisualizerProps) {
  const [steps, setSteps] = useState<BridgeStep[]>([
    { id: 'burn', label: `Burn ${amount} ${token} on ${sourceChain}`, status: 'processing' },
    { id: 'relay', label: 'Superchain Message Relay (L2ToL2)', status: 'pending' },
    { id: 'mint', label: `Mint ${amount} ${token} on ${targetChain}`, status: 'pending' },
  ]);

  useEffect(() => {
    // Simulate the bridge process steps for demo visualization
    const timer1 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 'burn' ? { ...s, status: 'completed', txHash: '0x123...abc' } : s));
      setSteps(prev => prev.map(s => s.id === 'relay' ? { ...s, status: 'processing' } : s));
    }, 2000);

    const timer2 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 'relay' ? { ...s, status: 'completed' } : s));
      setSteps(prev => prev.map(s => s.id === 'mint' ? { ...s, status: 'processing' } : s));
    }, 4000);

    const timer3 = setTimeout(() => {
      setSteps(prev => prev.map(s => s.id === 'mint' ? { ...s, status: 'completed', txHash: '0x789...xyz' } : s));
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="w-full border border-green-500/50 bg-black/80 rounded-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-green-400">
        <Box className="w-4 h-4" />
        Superchain Interop Visualizer
      </div>

      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-blue-500 flex items-center justify-center bg-blue-900/20 text-blue-400 font-bold text-xs">
            {sourceChain.substring(0, 4)}
          </div>
          <span className="text-[10px] text-green-700 mt-2 uppercase">Source</span>
        </div>
        
        <div className="flex-1 h-[1px] bg-green-900 mx-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2">
            <ArrowRight className="w-4 h-4 text-green-800" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-red-500 flex items-center justify-center bg-red-900/20 text-red-400 font-bold text-xs">
            {targetChain.substring(0, 4)}
          </div>
          <span className="text-[10px] text-green-700 mt-2 uppercase">Target</span>
        </div>
      </div>

      <div className="space-y-3 font-mono">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded flex items-center justify-center border text-[10px]
              ${step.status === 'completed' ? 'border-green-500 bg-green-500/20 text-green-400' : 
                step.status === 'processing' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 animate-pulse' : 
                'border-green-900 text-green-900'}`}>
              {step.status === 'completed' ? <Check className="w-3 h-3" /> : idx + 1}
            </div>
            <div className="flex-1">
              <p className={`text-xs ${step.status === 'pending' ? 'text-green-900' : 'text-green-500'}`}>
                {step.label}
              </p>
              {step.txHash && (
                <p className="text-[9px] text-green-700 font-mono mt-0.5">TX: {step.txHash}</p>
              )}
            </div>
            {step.status === 'processing' && <Loader2 className="w-3 h-3 text-green-500 animate-spin" />}
          </div>
        ))}
      </div>
    </div>
  );
}
