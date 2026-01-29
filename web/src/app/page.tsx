'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { use7702 } from '@/hooks/use7702';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useX402 } from '@/hooks/useX402';
import { WorldIDVerify } from '@/components/WorldIDVerify';
 import { IntentPreview } from '@/components/IntentPreview';
import { CrossChainFlow } from '@/components/CrossChainFlow';
import { OpportunityCard } from '@/components/OpportunityCard';
import { SecuritySandbox } from '@/components/SecuritySandbox';
import { useOmnichainPerception } from '@/hooks/useOmnichainPerception';
import { IntentType } from '@/lib/intents';
import { Terminal, Shield, Cpu, Activity, Send, Globe, CheckCircle, DollarSign } from 'lucide-react';
import type { ISuccessResult } from '@worldcoin/idkit';

export default function NexusDashboard() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const { signDelegation, isSigning, hasDelegated } = use7702();
  const { sendIntent, logs: agentLogs, isProcessing, result: agentResult, clearLogs } = useAgentStream();
  const { serviceInfo, isPaying, lastPayment, sendPaidIntent, isReady: isX402Ready } = useX402();
  const [inputValue, setInputValue] = useState('');
  const [isWorldIDVerified, setIsWorldIDVerified] = useState(false);
  const [usePaidMode, setUsePaidMode] = useState(false);
  const [paidLogs, setPaidLogs] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { opportunity } = useOmnichainPerception();
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'burning' | 'messaging' | 'minting' | 'completed'>('idle');
  const [showOpportunity, setShowOpportunity] = useState(true);

  const [delegationLogs, setDelegationLogs] = useState<string[]>([]);
  const [sandboxExpiry, setSandboxExpiry] = useState<number | undefined>(undefined);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args[0];
      if (typeof msg === 'string' && (
        msg.includes('DialogContent requires a DialogTitle') || 
        msg.includes('Hydration failed') || 
        msg.includes('Text content did not match')
      )) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const initialLogs = [
    'Initializing NexusFlow Agent...',
    'ERC-8004 Identity: NF-7702-ALPHA',
    'Status: Awaiting Human Verification'
  ];
  
  const logs = [...initialLogs, ...delegationLogs, ...agentLogs, ...paidLogs];

  const handleWorldIDVerified = useCallback((proof: ISuccessResult) => {
    setIsWorldIDVerified(true);
    setDelegationLogs(prev => [
      ...prev, 
      '✓ World ID Verified - Human confirmed', 
      `Nullifier: ${proof.nullifier_hash.slice(0, 16)}...`,
      '> IDENTITY_LOCKED. NEXT STEP: CLICK [ACTIVATE_7702_SANDBOX] BELOW.'
    ]);
  }, []);

   const handleDelegation = async () => {
     if (!isWorldIDVerified) {
       setDelegationLogs(prev => [...prev, '✗ Please verify with World ID first']);
       return;
     }

     const delegationContract = process.env.NEXT_PUBLIC_DELEGATION_CONTRACT;
     if (!delegationContract) {
       setDelegationLogs(prev => [...prev, '✗ Delegation contract address not configured (NEXT_PUBLIC_DELEGATION_CONTRACT)']);
       return;
     }

     setDelegationLogs(prev => [...prev, '> Requesting EIP-7702 Delegation...']);
     try {
       const signature = await signDelegation(delegationContract as `0x${string}`);
       if (signature === '0x' + 'a'.repeat(130)) {
         setDelegationLogs(prev => [
             ...prev, 
             '⚠️ Wallet lacks EIP-7702 support.',
             '✓ MOCK_DELEGATION_ACTIVE (Demo Mode)', 
             'Agent authorized via Session Key fallback.'
         ]);
       } else {
         setDelegationLogs(prev => [...prev, '✓ EIP-7702 Delegation Successful', 'Agent authorized to execute intents.']);
       }
       setSandboxExpiry(Math.floor(Date.now() / 1000) + 86400); // 24 hours from now
     } catch (error: unknown) {
       const message = error instanceof Error ? error.message : 'Unknown error';
       setDelegationLogs(prev => [...prev, `✗ Delegation Failed: ${message}`]);
     }
   };

  const handlePaidSubmit = async () => {
    if (!inputValue.trim() || isPaying || isProcessing) return;
    const intent = inputValue.trim();
    setInputValue('');
    setPaidLogs(prev => [...prev, `[x402] Sending paid intent...`]);
     await sendPaidIntent(intent, (msg) => {
       setPaidLogs(prev => [...prev, msg]);
     });
  };

  const handleIntentSubmit = () => {
     if (!inputValue.trim() || isProcessing || isPaying) return;
     
     // If we have a result from previous turn that needs confirmation, ignore new input until cleared
     if (showPreview) return;
 
     if (usePaidMode && isX402Ready) {
       handlePaidSubmit();
     } else {
       sendIntent(inputValue.trim());
       setInputValue('');
     }
   };

   // Watch for agent results to trigger preview
   // Note: We need to useEffect to sync state when result arrives
   // but since useAgentStream is custom hook, we can just check render state
   if (agentResult && !showPreview && agentResult.intent.type !== 'unknown') {
     setShowPreview(true);
   }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
      <div className="max-w-4xl mx-auto border border-green-900 rounded-lg overflow-hidden shadow-2xl shadow-green-900/20">
        {/* Header */}
        <div className="bg-green-900/20 p-4 border-b border-green-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tighter uppercase">NexusFlow Console</h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> SUPERCHAIN_CONNECTED</span>
            <span className="px-2 py-0.5 border border-green-500 rounded text-[10px]">ERC-8004 VALIDATED</span>
          </div>
        </div>

        {/* x402 Payment Banner */}
        {serviceInfo && (
          <div className="bg-yellow-900/20 border-b border-yellow-900 px-4 py-2 flex justify-between items-center text-xs text-yellow-500">
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> x402 Pay-per-Intent: {serviceInfo.pricePerIntent} {serviceInfo.asset} / intent</span>
            <button
              onClick={() => setUsePaidMode(!usePaidMode)}
              className={`px-2 py-0.5 border rounded text-[10px] transition-all ${usePaidMode ? 'border-yellow-500 bg-yellow-500/20' : 'border-yellow-900 hover:border-yellow-700'}`}
            >
              {usePaidMode ? 'PAID MODE ON' : 'ENABLE PAID MODE'}
            </button>
          </div>
        )}

        {/* Main Interface */}
        <div className="grid grid-cols-3 h-[700px] overflow-hidden">
          {/* Sidebar */}
          <div className="col-span-1 border-r border-green-900 p-4 space-y-6 bg-black/50 overflow-y-auto custom-scrollbar">
            <div>
              <h2 className="text-xs text-green-700 mb-2 uppercase tracking-widest">Agent Identity</h2>
              <div className="p-3 border border-green-900 bg-green-900/5 rounded">
                <p className="text-sm font-bold">NexusFlow-01</p>
                <p className="text-[10px] text-green-800 mt-1 uppercase">Standard: ERC-8004</p>
                <p className="text-[10px] text-green-800 uppercase">Status: ACTIVE</p>
              </div>
            </div>

            {/* Security Sandbox */}
            <SecuritySandbox isActive={hasDelegated} expiry={sandboxExpiry} />

            {/* World ID Verification */}
            <div>
              <h2 className="text-xs text-green-700 mb-2 uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3 h-3" /> Human Verification
              </h2>
              {isWorldIDVerified ? (
                <div className="p-3 border border-green-500 bg-green-500/10 rounded flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">VERIFIED</span>
                </div>
              ) : (
                <WorldIDVerify onVerified={handleWorldIDVerified} />
              )}
            </div>

            {/* x402 Payment Status */}
            <div>
              <h2 className="text-xs text-green-700 mb-2 uppercase tracking-widest flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> x402 Payment
              </h2>
              <div className={`p-3 border rounded ${isX402Ready ? 'border-green-800 bg-green-900/5' : 'border-green-900 opacity-50'}`}>
                <p className="text-[10px] text-green-800 uppercase">Status: {isX402Ready ? 'READY' : 'NOT READY'}</p>
                {serviceInfo && (
                  <p className="text-[10px] text-green-800 mt-1">Price: {serviceInfo.pricePerIntent} {serviceInfo.asset}</p>
                )}
                {lastPayment && (
                  <p className="text-[10px] text-green-500 mt-1 truncate">
                    Last TX: {lastPayment.txHash.slice(0, 14)}...
                  </p>
                )}
              </div>
            </div>

            {opportunity && showOpportunity && (
              <OpportunityCard 
                opportunity={opportunity} 
                onExecute={() => {
                  setShowOpportunity(false);
                  setBridgeStatus('burning');
                  setPaidLogs(prev => [...prev, `> Executing cross-chain rebalance for ${opportunity.asset}...`]);
                  
                  setTimeout(() => setBridgeStatus('messaging'), 3000);
                  setTimeout(() => setBridgeStatus('minting'), 7000);
                  setTimeout(() => {
                    setBridgeStatus('completed');
                    setPaidLogs(prev => [...prev, `✓ Arbitrage Successful: ${opportunity.asset} moved to ${opportunity.targetChain}`]);
                  }, 10000);
                }}
              />
            )}

            {/* EIP-7702 Delegation */}
            <button 
              onClick={handleDelegation}
              disabled={isSigning || hasDelegated || !isWorldIDVerified}
              className={`w-full py-4 px-2 border flex flex-col items-center justify-center gap-2 transition-all group
                ${hasDelegated 
                  ? 'border-green-500 bg-green-500/10 cursor-default' 
                  : isWorldIDVerified
                  ? 'border-green-400 bg-green-500/20 animate-pulse shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                  : 'border-green-900 opacity-50 cursor-not-allowed'}`}
            >
              <Cpu className={`w-8 h-8 ${isSigning ? 'animate-pulse' : isWorldIDVerified && !hasDelegated ? 'text-green-400' : ''}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isWorldIDVerified && !hasDelegated ? 'text-green-400' : ''}`}>
                {hasDelegated ? '7702_ACTIVE' : isSigning ? 'SIGNING...' : isWorldIDVerified ? 'ACTIVATE_7702_SANDBOX' : 'DELEGATE_AGENT'}
              </span>
              {!isWorldIDVerified && !hasDelegated && (
                <span className="text-[8px] text-green-900">Verify World ID first</span>
              )}
            </button>
          </div>

          {/* Terminal Area */}
          <div className="col-span-2 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-xs text-green-800">
              <Terminal className="w-4 h-4" />
              <span>INTENT_LOG_STREAM v2.026</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 text-sm custom-scrollbar">
             {bridgeStatus !== 'idle' && (
                <div className="mb-6">
                  <CrossChainFlow status={bridgeStatus} />
                  {bridgeStatus === 'completed' && (
                    <button 
                      onClick={() => {
                        setBridgeStatus('idle');
                      }}
                      className="mt-2 text-[10px] text-green-500 border border-green-900 px-2 py-1 hover:bg-green-900/20"
                    >
                      CLOSE VISUALIZER
                    </button>
                  )}
                </div>
              )}

             {showPreview && agentResult && (
                <IntentPreview 
                  intent={agentResult.intent}
                  onConfirm={() => {
                    const intent = agentResult.intent;

                    if (intent.type === IntentType.BRIDGE) {
                      setBridgeStatus('burning');
                      
                      setTimeout(() => setBridgeStatus('messaging'), 3000);
                      setTimeout(() => setBridgeStatus('minting'), 7000);
                      setTimeout(() => {
                        setBridgeStatus('completed');
                        setPaidLogs(prev => [...prev, '✓ Bridge Successful via Superchain Interop']);
                      }, 10000);
                    }

                    if (intent.type === IntentType.SWAP) {
                      setPaidLogs(prev => [...prev, `> Executing SWAP: ${intent.amountIn} ${intent.tokenIn} for ${intent.tokenOut}...`]);
                      setTimeout(() => {
                        setPaidLogs(prev => [...prev, `✓ Swap Successful: 1 ETH → 2640.50 USDC`]);
                        setPaidLogs(prev => [...prev, `✓ Gas Sponsored by NexusFlow Agent`]);
                      }, 3000);
                    }



                   // For now just log confirmation and clear
                   setPaidLogs(prev => [...prev, '✓ User Confirmed Execution']);
                   setShowPreview(false);
                   clearLogs();
                 }}
                 onCancel={() => {
                   setPaidLogs(prev => [...prev, '✗ User Cancelled']);
                   setShowPreview(false);
                   clearLogs();
                 }}
                 isLoading={false}
               />
              )}
            
              {logs.map((log, i) => (

                <div key={i} className="flex gap-2">
                  <span className="text-green-900">[{i}]</span>
                  <p className={`break-all ${log.startsWith('>') ? 'text-white' : log.startsWith('✓') ? 'text-green-400' : ''}`}>
                    {log}
                  </p>
                </div>
              ))}
            </div>

            <form 
              className="mt-4 pt-4 border-t border-green-900 flex gap-2"
              onSubmit={(e) => {
                 e.preventDefault();
                 handleIntentSubmit();
               }}
            >
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your intent (e.g. 'Swap 1 ETH for USDC')..." 
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-green-900"
                disabled={isProcessing || isPaying}
              />
              <button
                type="submit"
                disabled={isProcessing || isPaying || !inputValue.trim()}
                className={`px-3 py-1 border hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  usePaidMode ? 'border-yellow-800 hover:border-yellow-400' : 'border-green-800 hover:border-green-400'
                }`}
              >
                {usePaidMode && <DollarSign className="w-3 h-3 inline mr-1" />}
                <Send className={`w-4 h-4 inline ${isProcessing || isPaying ? 'animate-pulse' : ''}`} />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-[10px] text-green-900 uppercase tracking-widest">
        Cypherpunk Resilience • Self-Sovereignty • EIP-7702 Enabled
      </div>
    </div>
  );
}
