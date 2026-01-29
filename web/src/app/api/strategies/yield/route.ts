/**
 * Premium Yield Strategy API
 * x402-protected endpoint for premium yield optimization intelligence
 */

import { NextRequest, NextResponse } from "next/server";
import {
  X402Config,
  createPaymentInfo,
  verifyX402Payment,
  withPaymentResponseHeader,
} from "@/lib/x402/middleware";

const STRATEGY_X402_CONFIG: X402Config = {
  payTo: (process.env.NEXUSFLOW_TREASURY_ADDRESS ||
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab00") as `0x${string}`,
  network:
    process.env.NODE_ENV === "production" ? "eip155:8453" : "eip155:84532",
  priceUsd: "0.005", // $0.005 per yield strategy query
  description: "NexusFlow Premium Yield Strategy",
  mimeType: "application/json",
};

interface YieldOpportunity {
  protocol: string;
  chain: string;
  token: string;
  apy: number;
  tvl: string;
  risk: "low" | "medium" | "high";
  strategyType: "lending" | "staking" | "liquidity";
  contractAddress: string;
}

/**
 * GET - Returns payment info
 */
export async function GET() {
  const paymentInfo = createPaymentInfo(STRATEGY_X402_CONFIG);

  return NextResponse.json({
    service: "NexusFlow Premium Yield Strategy",
    version: "1.0.0",
    x402Enabled: true,
    pricing: {
      perQuery: STRATEGY_X402_CONFIG.priceUsd,
      asset: "USDC",
      network: paymentInfo.network,
      networkId: paymentInfo.networkId,
    },
    payment: paymentInfo,
    description:
      "Get AI-curated yield opportunities across the Superchain with risk analysis",
  });
}

/**
 * POST - Get premium yield strategies (requires x402 payment)
 */
export async function POST(request: NextRequest) {
  const paymentCheck = await verifyX402Payment(
    request,
    STRATEGY_X402_CONFIG
  );

  if (!paymentCheck.ok) {
    return paymentCheck.response;
  }

  try {
    const body = await request.json();
    const { token = "USDC", minApy = 0, maxRisk = "high", chains = [] } = body;

    // In production, this would query real DeFi protocols
    // For hackathon, return curated premium opportunities
    const strategies = await getPremiumYieldStrategies({
      token,
      minApy,
      maxRisk,
      chains,
    });

    const response = NextResponse.json({
      success: true,
      strategies,
      metadata: {
        timestamp: new Date().toISOString(),
        paymentUsed: STRATEGY_X402_CONFIG.priceUsd,
        dataQuality: "premium",
        sourceChains: ["Base", "Optimism", "Zora", "Mode"],
      },
    });

    return withPaymentResponseHeader(response, paymentCheck.settlement);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Strategy fetch failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Premium yield strategy intelligence
 * In production, this would integrate with:
 * - DeFi Llama API
 * - Aave Subgraph
 * - Compound Analytics
 * - Custom on-chain data aggregators
 */
async function getPremiumYieldStrategies(params: {
  token: string;
  minApy: number;
  maxRisk: string;
  chains: string[];
}): Promise<YieldOpportunity[]> {
  // Simulate AI-curated opportunities with alpha
  const opportunities: YieldOpportunity[] = [
    {
      protocol: "Aave V3",
      chain: "Base",
      token: "USDC",
      apy: 0.058,
      tvl: "$142.3M",
      risk: "low",
      strategyType: "lending",
      contractAddress: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
    },
    {
      protocol: "Compound V3",
      chain: "Optimism",
      token: "USDC",
      apy: 0.062,
      tvl: "$98.7M",
      risk: "low",
      strategyType: "lending",
      contractAddress: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
    },
    {
      protocol: "Velodrome",
      chain: "Optimism",
      token: "USDC-ETH",
      apy: 0.127,
      tvl: "$34.2M",
      risk: "medium",
      strategyType: "liquidity",
      contractAddress: "0x0493Bf8b6DBB159Ce2Db2E0E8403E753Abd1235b",
    },
    {
      protocol: "Aerodrome",
      chain: "Base",
      token: "USDC-ETH",
      apy: 0.145,
      tvl: "$28.5M",
      risk: "medium",
      strategyType: "liquidity",
      contractAddress: "0xcDAC0d6c6C59727a65F871236188350531885C43",
    },
    {
      protocol: "Extra Finance",
      chain: "Base",
      token: "USDC",
      apy: 0.089,
      tvl: "$12.1M",
      risk: "high",
      strategyType: "lending",
      contractAddress: "0x2EE35A3382B55DA3DB7DaEAf3D2df05Ab0BeA06b",
    },
  ];

  // Filter by criteria
  return opportunities
    .filter((opp) => {
      if (params.minApy && opp.apy < params.minApy) return false;
      if (params.maxRisk) {
        const riskLevel = { low: 1, medium: 2, high: 3 };
        if (riskLevel[opp.risk] > riskLevel[params.maxRisk as keyof typeof riskLevel])
          return false;
      }
      if (params.chains.length > 0 && !params.chains.includes(opp.chain))
        return false;
      return true;
    })
    .sort((a, b) => b.apy - a.apy); // Sort by APY descending
}
