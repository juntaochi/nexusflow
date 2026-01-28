'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type Hex } from 'viem';

interface X402PaymentOption {
  scheme: string;
  network: string;
  asset: string;
  payTo: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
}

interface X402PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

interface X402ServiceInfo {
  pricePerIntent: string;
  asset: string;
  network: string;
  payTo: string;
  chainId: number;
  tokenAddress: string;
}

const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export function useX402() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [serviceInfo, setServiceInfo] = useState<X402ServiceInfo | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [lastPayment, setLastPayment] = useState<{ txHash: string; amount: string } | null>(null);

  // Fetch service pricing info
  useEffect(() => {
    async function fetchServiceInfo() {
      try {
        const response = await fetch('/api/agent/paid');
        const data = await response.json();
        setServiceInfo({
          pricePerIntent: data.pricing.perIntent,
          asset: data.pricing.asset,
          network: data.pricing.network,
          payTo: data.payment.payTo,
          chainId: data.payment.chainId,
          tokenAddress: data.payment.tokenAddress,
        });
      } catch (error) {
        console.error('Failed to fetch x402 service info:', error);
      }
    }
    fetchServiceInfo();
  }, []);

  // Make payment for x402 request
  const makePayment = useCallback(async (
    option: X402PaymentOption
  ): Promise<X402PaymentResult> => {
    if (!walletClient || !address) {
      return { success: false, error: 'Wallet not connected' };
    }

    setIsPaying(true);
    try {
      // Get USDC contract address based on network
      const usdcAddress = option.network === 'base'
        ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
        : '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

      // Convert USDC amount (6 decimals)
      const amount = BigInt(Math.floor(parseFloat(option.maxAmountRequired) * 1e6));

      // Execute transfer
      const txHash = await walletClient.writeContract({
        address: usdcAddress as Hex,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [option.payTo as Hex, amount],
        account: address,
      });

      setLastPayment({ txHash, amount: option.maxAmountRequired });
      return { success: true, txHash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    } finally {
      setIsPaying(false);
    }
  }, [walletClient, address]);

  // Create payment header for x402 request
  const createPaymentHeader = useCallback(async (
    option: X402PaymentOption,
    txHash: string
  ): Promise<string | null> => {
    if (!walletClient || !address) return null;

    try {
      const amount = BigInt(Math.floor(parseFloat(option.maxAmountRequired) * 1e6));

      // Create payload
      const payload = Buffer.from(
        JSON.stringify({
          payer: address,
          payTo: option.payTo,
          amount: amount.toString(),
          asset: option.asset,
          network: option.network,
          txHash,
          timestamp: Date.now(),
          resource: option.resource,
        })
      ).toString('base64');

      // Sign payload
      const signature = await walletClient.signMessage({
        account: address,
        message: payload,
      });

      // Create header
      return Buffer.from(
        JSON.stringify({ payload, signature })
      ).toString('base64');
    } catch {
      return null;
    }
  }, [walletClient, address]);

  // Send intent with x402 payment
  const sendPaidIntent = useCallback(async (
    intent: string,
    onLog: (message: string) => void
  ): Promise<{ success: boolean; result?: unknown; error?: string }> => {
    if (!serviceInfo) {
      return { success: false, error: 'Service info not loaded' };
    }

    onLog(`> ${intent}`);
    onLog(`Payment required: ${serviceInfo.pricePerIntent} ${serviceInfo.asset}`);

    // First, make the payment
    const paymentOption: X402PaymentOption = {
      scheme: 'exact',
      network: serviceInfo.network,
      asset: serviceInfo.asset,
      payTo: serviceInfo.payTo,
      maxAmountRequired: serviceInfo.pricePerIntent,
      resource: '/api/agent/paid',
      description: 'NexusFlow Intent Execution',
    };

    onLog('Processing payment...');
    const paymentResult = await makePayment(paymentOption);

    if (!paymentResult.success) {
      onLog(`✗ Payment failed: ${paymentResult.error}`);
      return { success: false, error: paymentResult.error };
    }

    onLog(`✓ Payment sent: ${paymentResult.txHash?.slice(0, 18)}...`);

    // Create payment header
    const paymentHeader = await createPaymentHeader(paymentOption, paymentResult.txHash!);
    if (!paymentHeader) {
      return { success: false, error: 'Failed to create payment header' };
    }

    // Make API request with payment
    onLog('Sending intent to agent...');
    
    try {
      const response = await fetch('/api/agent/paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': paymentHeader,
        },
        body: JSON.stringify({ intent }),
      });

      if (!response.ok && response.status !== 402) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: unknown = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (eventType === 'log') {
              onLog(data.message);
            } else if (eventType === 'error') {
              onLog(`✗ Error: ${data.message}`);
            } else if (eventType === 'result') {
              finalResult = data;
            }
          }
        }
      }

      return { success: true, result: finalResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }, [serviceInfo, makePayment, createPaymentHeader]);

  return {
    serviceInfo,
    isPaying,
    lastPayment,
    makePayment,
    sendPaidIntent,
    isReady: !!serviceInfo && !!address,
  };
}
