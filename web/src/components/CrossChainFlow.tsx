import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

interface CrossChainFlowProps {
  status: 'idle' | 'burning' | 'messaging' | 'minting' | 'completed';
  sourceLabel?: string;
  destinationLabel?: string;
}

export const CrossChainFlow: React.FC<CrossChainFlowProps> = ({
  status,
  sourceLabel = 'Base Sepolia',
  destinationLabel = 'OP Sepolia',
}) => {
  return (
    <div className="border border-green-500/30 bg-black p-6 rounded-lg font-mono">
      <h3 className="text-green-500 mb-6 flex items-center gap-2 text-sm">
        <Zap size={16} /> OMNICHAIN FLOW VISUALIZER
      </h3>

      <div className="flex items-center justify-between relative px-4">
        {/* Source Chain */}
        <div className={`flex flex-col items-center gap-2 ${['burning', 'messaging', 'minting', 'completed'].includes(status) ? 'text-green-400' : 'text-green-900'}`}>
          <div className={`w-12 h-12 border border-current flex items-center justify-center rounded ${status === 'burning' ? 'animate-pulse' : ''}`}>
            {sourceLabel.split(' ')[0].toUpperCase()}
          </div>
          <span className="text-[10px] text-green-500/80">{sourceLabel}</span>
          <span className="text-[10px]">BURN</span>
        </div>

        {/* Connector 1 */}
        <div className="flex-1 h-[1px] bg-green-900 mx-4 relative overflow-hidden">
          {['burning', 'messaging'].includes(status) && (
            <div className="absolute inset-0 bg-green-400 w-1/2 animate-slide-right" />
          )}
        </div>

        {/* Superchain Mesh */}
        <div className={`flex flex-col items-center gap-2 ${['messaging', 'minting', 'completed'].includes(status) ? 'text-green-400' : 'text-green-900'}`}>
          <div className={`w-16 h-16 border border-current rounded-full flex items-center justify-center ${status === 'messaging' ? 'animate-pulse' : ''}`}>
            <ShieldCheck size={24} />
          </div>
          <span className="text-[10px]">MESH</span>
        </div>

        {/* Connector 2 */}
        <div className="flex-1 h-[1px] bg-green-900 mx-4 relative overflow-hidden">
          {['minting'].includes(status) && (
            <div className="absolute inset-0 bg-green-400 w-1/2 animate-slide-right" />
          )}
        </div>

        {/* Destination Chain */}
        <div className={`flex flex-col items-center gap-2 ${['minting', 'completed'].includes(status) ? 'text-green-400' : 'text-green-900'}`}>
          <div className={`w-12 h-12 border border-current flex items-center justify-center rounded ${status === 'minting' ? 'animate-pulse' : ''}`}>
            {destinationLabel.split(' ')[0].toUpperCase()}
          </div>
          <span className="text-[10px] text-green-500/80">{destinationLabel}</span>
          <span className="text-[10px]">MINT</span>
        </div>
      </div>

      <div className="mt-8 text-[11px] text-green-500/70 h-4">
        {status === 'idle' && "> Waiting for intent..."}
        {status === 'burning' && "> Executing CrosschainBridge.bridge() burn step..."}
        {status === 'messaging' && "> Routing via L2ToL2CrossDomainMessenger..."}
        {status === 'minting' && "> Executing ICrosschainERC20.crosschainMint()..."}
        {status === 'completed' && "> Cross-chain atomic transfer successful."}
      </div>
    </div>
  );
};
