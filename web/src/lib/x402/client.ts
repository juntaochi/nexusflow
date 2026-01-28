/**
 * x402 Client for NexusFlow Frontend
 * Handles automatic payment when calling x402-protected endpoints
 */

import { createWalletClient, custom, type Hex } from "viem";
import { base, baseSepolia } from "viem/chains";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// USDC ABI for transfer
const USDC_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export interface X402PaymentOption {
  scheme: string;
  network: string;
  asset: string;
  payTo: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
}

export interface X402ClientConfig {
  autoPayMaxUSDC?: number; // Max amount to auto-pay (default: 0.10)
  preferredNetwork?: "base" | "base-sepolia";
}

/**
 * Parse 402 response and extract payment options
 */
export function parse402Response(response: Response): X402PaymentOption[] | null {
  const paymentHeader = response.headers.get("X-Payment-Options");
  if (paymentHeader) {
    try {
      return JSON.parse(paymentHeader);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Make a payment for x402 request
 */
export async function makeX402Payment(
  option: X402PaymentOption,
  userAddress: Hex
): Promise<{ payload: string; signature: string; txHash: string }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet not available");
  }

  const chain = option.network === "base" ? base : baseSepolia;
  
  // Get USDC contract address
  const usdcAddress = option.network === "base" 
    ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    : "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // Create wallet client
  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });

  // Convert USDC amount (6 decimals)
  const amount = BigInt(Math.floor(parseFloat(option.maxAmountRequired) * 1e6));

  // Execute transfer
  const txHash = await walletClient.writeContract({
    address: usdcAddress as Hex,
    abi: USDC_ABI,
    functionName: "transfer",
    args: [option.payTo as Hex, amount],
    account: userAddress,
  });

  // Create payment payload
  const payload = Buffer.from(
    JSON.stringify({
      payer: userAddress,
      payTo: option.payTo,
      amount: amount.toString(),
      asset: option.asset,
      network: option.network,
      txHash,
      timestamp: Date.now(),
      resource: option.resource,
    })
  ).toString("base64");

  // Sign the payload
  const signature = await walletClient.signMessage({
    account: userAddress,
    message: payload,
  });

  return { payload, signature, txHash };
}

/**
 * Create X-PAYMENT header from payment result
 */
export function createPaymentHeader(payment: {
  payload: string;
  signature: string;
}): string {
  return Buffer.from(
    JSON.stringify({
      payload: payment.payload,
      signature: payment.signature,
    })
  ).toString("base64");
}

/**
 * Fetch with automatic x402 payment handling
 */
export async function fetchWithX402(
  url: string,
  options: RequestInit & {
    userAddress?: Hex;
    autoPayMaxUSDC?: number;
  } = {}
): Promise<{
  response: Response;
  paymentMade: boolean;
  paymentAmount?: string;
  txHash?: string;
}> {
  const { userAddress, autoPayMaxUSDC = 0.10, ...fetchOptions } = options;

  // Make initial request
  let response = await fetch(url, fetchOptions);

  // Check if 402 response
  if (response.status === 402 && userAddress) {
    const paymentOptions = parse402Response(response);
    
    if (paymentOptions && paymentOptions.length > 0) {
      const option = paymentOptions[0];
      const requiredAmount = parseFloat(option.maxAmountRequired);

      // Check if within auto-pay limit
      if (requiredAmount <= autoPayMaxUSDC) {
        try {
          // Make payment
          const payment = await makeX402Payment(option, userAddress);

          // Retry request with payment header
          const paymentHeader = createPaymentHeader(payment);
          response = await fetch(url, {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              "X-PAYMENT": paymentHeader,
            },
          });

          return {
            response,
            paymentMade: true,
            paymentAmount: option.maxAmountRequired,
            txHash: payment.txHash,
          };
        } catch (error) {
          console.error("x402 payment failed:", error);
        }
      }
    }
  }

  return {
    response,
    paymentMade: false,
  };
}

/**
 * React hook for x402 payments
 */
export function useX402Config(userAddress?: Hex) {
  return {
    fetch: (url: string, options?: RequestInit) =>
      fetchWithX402(url, { ...options, userAddress }),
    makePayment: (option: X402PaymentOption) =>
      userAddress ? makeX402Payment(option, userAddress) : Promise.reject("No wallet"),
  };
}
