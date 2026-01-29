"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { fetchWithX402 } from "@/lib/x402/client";

interface X402ServiceInfo {
  pricePerIntent: string;
  asset: string;
  network: string;
  networkId?: string;
  payTo: string;
}

interface X402Settlement {
  transaction?: string;
  network?: string;
  payer?: string;
}

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
          networkId: data.pricing.networkId ?? data.payment.networkId,
          payTo: data.payment.payTo,
        });
      } catch (error) {
        console.error('Failed to fetch x402 service info:', error);
      }
    }
    fetchServiceInfo();
  }, []);

  // Send intent with x402 payment
  const sendPaidIntent = useCallback(async (
    intent: string,
    onLog: (message: string) => void
  ): Promise<{ success: boolean; result?: unknown; error?: string }> => {
    if (!serviceInfo) {
      return { success: false, error: 'Service info not loaded' };
    }

    if (!walletClient || !address) {
      return { success: false, error: "Wallet not connected" };
    }

    onLog(`> ${intent}`);
    onLog(`Payment required: ${serviceInfo.pricePerIntent} ${serviceInfo.asset}`);

    onLog("Processing payment...");
    setIsPaying(true);
    
    try {
      const { response, paymentMade, settlement } = await fetchWithX402(
        "/api/agent/paid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ intent }),
        },
        walletClient
      );

      if (response.status === 402) {
        onLog("✗ Payment required but not satisfied.");
        return { success: false, error: "Payment required" };
      }

      if (paymentMade) {
        const settlementInfo = settlement as X402Settlement | undefined;
        if (settlementInfo?.transaction) {
          setLastPayment({
            txHash: settlementInfo.transaction,
            amount: serviceInfo.pricePerIntent,
          });
          onLog(`✓ Payment settled: ${settlementInfo.transaction.slice(0, 18)}...`);
        } else {
          onLog("✓ Payment settled.");
        }
      }

      onLog("Sending intent to agent...");

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
    } finally {
      setIsPaying(false);
    }
  }, [serviceInfo, walletClient, address]);

  return {
    serviceInfo,
    isPaying,
    lastPayment,
    sendPaidIntent,
    isReady: !!serviceInfo && !!address && !!walletClient,
  };
}
