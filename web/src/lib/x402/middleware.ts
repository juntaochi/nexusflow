/**
 * x402 Server Middleware for NexusFlow
 * Enables pay-per-intent monetization
 */

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, verifyMessage, type Hex } from "viem";
import { base, baseSepolia } from "viem/chains";

// x402 Payment Configuration
export interface X402Config {
  payTo: Hex; // NexusFlow treasury address
  asset: "USDC" | "USDT";
  network: "base" | "base-sepolia";
  priceUSDC: string; // Price per request in USDC (e.g., "0.01")
  facilitator?: string;
}

// x402 Payment Option (returned in 402 response)
export interface X402PaymentOption {
  scheme: "exact";
  network: string;
  asset: string;
  payTo: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  outputSchema: string;
  extra?: {
    name?: string;
    version?: number;
  };
}

// x402 Payment Header (from client)
export interface X402PaymentHeader {
  payload: string;
  signature: string;
}

// USDC contract addresses
const USDC_ADDRESSES = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;

/**
 * Default x402 configuration for NexusFlow
 */
export const DEFAULT_X402_CONFIG: X402Config = {
  payTo: "0x0000000000000000000000000000000000000000" as Hex, // Replace with actual treasury
  asset: "USDC",
  network: "base-sepolia",
  priceUSDC: "0.001", // $0.001 per intent (cheap for testing)
};

/**
 * Create a 402 Payment Required response
 */
export function create402Response(
  config: X402Config,
  resource: string,
  description: string
): NextResponse {
  const paymentOption: X402PaymentOption = {
    scheme: "exact",
    network: config.network,
    asset: config.asset,
    payTo: config.payTo,
    maxAmountRequired: config.priceUSDC,
    resource,
    description,
    mimeType: "application/json",
    outputSchema: "{}",
    extra: {
      name: "NexusFlow Intent Execution",
      version: 1,
    },
  };

  return new NextResponse(
    JSON.stringify({
      error: "Payment Required",
      message: `This endpoint requires ${config.priceUSDC} ${config.asset} payment`,
      x402Version: 1,
      accepts: [paymentOption],
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "X-Payment-Required": "true",
        "X-Payment-Options": JSON.stringify([paymentOption]),
      },
    }
  );
}

/**
 * Parse X-PAYMENT header from request
 */
export function parsePaymentHeader(
  request: NextRequest
): X402PaymentHeader | null {
  const paymentHeader = request.headers.get("X-PAYMENT");
  if (!paymentHeader) return null;

  try {
    // Header format: base64(JSON({payload, signature}))
    const decoded = JSON.parse(Buffer.from(paymentHeader, "base64").toString());
    return {
      payload: decoded.payload,
      signature: decoded.signature,
    };
  } catch {
    // Try direct JSON parse
    try {
      return JSON.parse(paymentHeader);
    } catch {
      return null;
    }
  }
}

/**
 * Verify x402 payment on-chain
 */
export async function verifyPayment(
  payment: X402PaymentHeader,
  config: X402Config
): Promise<{ valid: boolean; payer?: string; txHash?: string; error?: string }> {
  try {
    const chain = config.network === "base" ? base : baseSepolia;
    const client = createPublicClient({
      chain,
      transport: http(),
    });

    // Decode payment payload
    const payloadData = JSON.parse(
      Buffer.from(payment.payload, "base64").toString()
    );

    // Verify signature
    const message = payment.payload;
    const isValidSig = await verifyMessage({
      address: payloadData.payer as Hex,
      message,
      signature: payment.signature as Hex,
    });

    if (!isValidSig) {
      return { valid: false, error: "Invalid signature" };
    }

    // Verify payment amount and recipient
    if (payloadData.payTo.toLowerCase() !== config.payTo.toLowerCase()) {
      return { valid: false, error: "Invalid payment recipient" };
    }

    const requiredAmount = BigInt(
      Math.floor(parseFloat(config.priceUSDC) * 1e6)
    );
    const paidAmount = BigInt(payloadData.amount);

    if (paidAmount < requiredAmount) {
      return { valid: false, error: "Insufficient payment amount" };
    }

    // In production, you would also verify the on-chain transaction
    // For hackathon, we trust the signed payload
    return {
      valid: true,
      payer: payloadData.payer,
      txHash: payloadData.txHash,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * x402 middleware wrapper for Next.js API routes
 */
export function withX402(
  handler: (
    request: NextRequest,
    paymentInfo?: { payer: string; txHash?: string }
  ) => Promise<NextResponse>,
  config: X402Config = DEFAULT_X402_CONFIG
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check for payment header
    const payment = parsePaymentHeader(request);

    if (!payment) {
      // No payment provided - return 402
      const url = new URL(request.url);
      return create402Response(
        config,
        url.pathname,
        "NexusFlow Intent Execution - Pay per intent"
      );
    }

    // Verify payment
    const verification = await verifyPayment(payment, config);

    if (!verification.valid) {
      return new NextResponse(
        JSON.stringify({
          error: "Payment Invalid",
          message: verification.error,
        }),
        {
          status: 402,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Payment valid - proceed with handler
    return handler(request, {
      payer: verification.payer!,
      txHash: verification.txHash,
    });
  };
}

/**
 * Create x402 payment info for client
 */
export function createPaymentInfo(config: X402Config): {
  payTo: string;
  amount: string;
  asset: string;
  network: string;
  chainId: number;
  tokenAddress: string;
} {
  const chain = config.network === "base" ? base : baseSepolia;
  return {
    payTo: config.payTo,
    amount: config.priceUSDC,
    asset: config.asset,
    network: config.network,
    chainId: chain.id,
    tokenAddress: USDC_ADDRESSES[config.network],
  };
}
