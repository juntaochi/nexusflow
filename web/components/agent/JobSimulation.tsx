'use client';

import { useState } from 'react';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { motion } from 'framer-motion';
import { Play, CheckCircle, FileJson, ThumbsUp, Loader2 } from 'lucide-react';

interface JobReceipt {
  jobHash: string;
  receiptUrl: string;
  timestamp: number;
  params: any;
  result: any;
}

export function JobSimulation({ agentId }: { agentId: string | number }) {
  const [isRunning, setIsRunning] = useState(false);
  const [receipt, setReceipt] = useState<JobReceipt | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  const { submitFeedback } = useAgentRegistry();

  const runSimulation = async () => {
    setIsRunning(true);
    setReceipt(null);
    setFeedbackSent(false);

    try {
      const response = await fetch('/api/agent/paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: "Get a premium swap route for 0.1 ETH to NUSD for analysis" }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const dataMatch = line.match(/^data: (.*)$/m);
          if (dataMatch) {
            try {
              const data = JSON.parse(dataMatch[1]);
              
              if (line.includes('event: tool')) {
                try {
                  const toolResult = JSON.parse(data.message);
                  if (toolResult.success && toolResult.receipt) {
                    const realReceipt: JobReceipt = {
                      jobHash: toolResult.receipt.jobHash,
                      receiptUrl: toolResult.receipt.evidenceURI,
                      timestamp: toolResult.receipt.timestamp,
                      params: { strategy: 'Premium Liquidity Analysis', token: 'NUSD' },
                      result: { 
                          price: toolResult.route?.price,
                          execution: "Superchain Swarm Discovery",
                          fee: `${toolResult.paymentAmount || "0.01"} ${toolResult.paymentAsset || "NUSD"}`
                      }
                    };
                    setReceipt(realReceipt);
                  }
                } catch (e) {}
              }
            } catch (err) {
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFeedback = async () => {
    if (!receipt || !agentId) return;
    
    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(
        BigInt(agentId), 
        1, 
        receipt.jobHash as `0x${string}`, 
        receipt.receiptUrl
      );
      setFeedbackSent(true);
    } catch (error) {
      console.error("Feedback failed:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-4 h-4" />
          Live Execution Demo
        </h3>
        <div className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-gray-500">
          x402 Protocol
        </div>
      </div>

      {!receipt ? (
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="w-full p-8 rounded-xl border border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-all group flex flex-col items-center justify-center gap-3 text-gray-400"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">Executing Strategy...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium group-hover:text-white">Simulate Paid Job</span>
            </>
          )}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-black/40 border border-white/10 overflow-hidden"
        >
          {/* Receipt Header */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-bold">Execution Success</span>
            </div>
            <span className="text-xs font-mono text-gray-500">{new Date(receipt.timestamp).toLocaleTimeString()}</span>
          </div>

          {/* Receipt Body */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Job Hash</div>
                <div className="font-mono text-white truncate text-xs">{receipt.jobHash}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Receipt URL</div>
                <a href="#" className="font-mono text-primary truncate text-xs flex items-center gap-1 hover:underline">
                  View JSON <FileJson className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 font-mono text-xs text-gray-300">
              <div className="opacity-50 mb-2">// Output Result</div>
              {JSON.stringify(receipt.result, null, 2)}
            </div>

            {/* Feedback Action */}
            <div className="pt-2 border-t border-white/10">
              {feedbackSent ? (
                <div className="flex items-center justify-center gap-2 p-3 text-green-400 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-bold">Reputation Signal On-Chain</span>
                </div>
              ) : (
                <button
                  onClick={handleFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full py-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                >
                  {isSubmittingFeedback ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  Write Reputation Signal (+1)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
