import React from 'react';
import { IntentType, ParsedIntent } from '@/lib/intents';
import { ArrowRight, Wallet, ArrowLeftRight, Shuffle, AlertTriangle, Check, X, Zap } from 'lucide-react';

interface IntentPreviewProps {
  intent: ParsedIntent;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function IntentPreview({ intent, onConfirm, onCancel, isLoading = false }: IntentPreviewProps) {
  if (intent.type === IntentType.UNKNOWN) return null;

  const renderIcon = () => {
    switch (intent.type) {
      case IntentType.SWAP: return <ArrowLeftRight className="w-5 h-5" />;
      case IntentType.TRANSFER: return <Wallet className="w-5 h-5" />;
      case IntentType.BRIDGE: return <Shuffle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const renderDetails = () => {
    switch (intent.type) {
      case IntentType.SWAP:
        return (
          <div className="flex items-center justify-between w-full px-4 py-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl text-white font-bold">{intent.amountIn}</span>
              <span className="text-xs text-green-700 uppercase tracking-widest mt-1">{intent.tokenIn}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-green-800 animate-pulse" />
            <div className="flex flex-col items-center">
              <span className="text-2xl text-green-400 font-bold">~</span>
              <span className="text-xs text-green-700 uppercase tracking-widest mt-1">{intent.tokenOut}</span>
            </div>
          </div>
        );
      case IntentType.TRANSFER:
        return (
          <div className="flex flex-col gap-4 w-full p-4">
            <div className="flex justify-between border-b border-green-900/50 pb-2">
              <span className="text-xs text-green-800 uppercase">Amount</span>
              <span className="text-white font-bold">{intent.amount} {intent.token}</span>
            </div>
            <div className="flex justify-between border-b border-green-900/50 pb-2">
              <span className="text-xs text-green-800 uppercase">To</span>
              <span className="text-green-400 font-mono text-xs truncate max-w-[150px]">{intent.to}</span>
            </div>
          </div>
        );
      case IntentType.BRIDGE:
        return (
          <div className="flex flex-col gap-4 w-full p-4">
            <div className="flex justify-between border-b border-green-900/50 pb-2">
              <span className="text-xs text-green-800 uppercase">Amount</span>
              <span className="text-white font-bold">{intent.amount} {intent.token}</span>
            </div>
            <div className="flex justify-between items-center border-b border-green-900/50 pb-2">
              <span className="text-xs text-green-800 uppercase">Route</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600">{intent.fromChain}</span>
                <ArrowRight className="w-3 h-3 text-green-800" />
                <span className="text-green-400">{intent.toChain}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full mb-4 border border-green-500 bg-black/80 rounded-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="bg-green-500/10 border-b border-green-500/30 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400">
          {renderIcon()}
          <span className="text-xs font-bold uppercase tracking-widest">
            Confirm {intent.type}
          </span>
        </div>
        <div className="text-[10px] text-green-600 uppercase">
          Confidence: {Math.round(intent.confidence * 100)}%
        </div>
      </div>

      <div className="bg-green-500/5 px-3 py-1.5 flex items-center justify-between border-b border-green-900/30">
        <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold">
          <Zap size={10} className="fill-current" />
          GAS_SPONSORED
        </div>
        <div className="text-[9px] text-green-700 uppercase tracking-tighter">
          NexusFlow Paymaster Enabled
        </div>
      </div>

      <div className="flex flex-col items-center justify-center font-mono">
        {renderDetails()}
        
        {intent.type === IntentType.SWAP && (
          <div className="w-full px-4 pb-4 text-[10px] text-green-800 text-center uppercase tracking-wider">
            Slippage Tolerance: {intent.slippageBps / 100}%
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 border-t border-green-900">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="p-3 text-xs uppercase tracking-widest hover:bg-red-900/20 hover:text-red-400 text-green-800 border-r border-green-900 transition-colors flex items-center justify-center gap-2 group"
        >
          <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="p-3 text-xs uppercase tracking-widest bg-green-900/20 hover:bg-green-500 hover:text-black text-green-500 transition-all flex items-center justify-center gap-2 group font-bold"
        >
          {isLoading ? (
            <span className="animate-pulse">Executing...</span>
          ) : (
            <>
              <Check className="w-3 h-3 group-hover:scale-110 transition-transform" />
              Confirm
            </>
          )}
        </button>
      </div>
    </div>
  );
}
