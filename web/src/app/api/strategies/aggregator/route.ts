/**
 * Yield Aggregator Strategy API
 * x402-protected endpoint for intra-chain yield rebalancing intelligence
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
  priceUsd: "0.010", // bash.01 per aggregation strategy query
  description: "NexusFlow Yield Aggregator Strategy",
  mimeType: "application/json",
};

interface AggregatorOpportunity {
  chain: string;
  token: string;
  currentProtocol: string;
  targetProtocol: string;
  currentApy: number;
  targetApy: number;
  apyDelta: number;
  estimatedCost: string;
  minDepositRequired: string;
}

/**
 * GET - Returns payment info
 */
export async function GET() {
  const paymentInfo = createPaymentInfo(STRATEGY_X402_CONFIG);

  return NextResponse.json({
    service: "NexusFlow Yield Aggregator Strategy",
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
      "Get AI-curated intra-chain rebalancing opportunities to maximize yield without cross-chain risks",
  });
}

/**
 * POST - Get aggregator strategies (requires x402 payment)
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
    const { token = "USDC", chain = "Base" } = body;

    const strategies = await getAggregatorStrategies({
      token,
      chain,
    });

    const response = NextResponse.json({
      success: true,
      strategies,
      metadata: {
        timestamp: new Date().toISOString(),
        paymentUsed: STRATEGY_X402_CONFIG.priceUsd,
        dataQuality: "premium",
        strategyType: "intra-chain-rebalance",
      },
    });

    return withPaymentResponseHeader(response, paymentCheck.settlement);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Aggregator fetch failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Aggregator strategy intelligence
 */
async function getAggregatorStrategies(params: {
  token: string;
  chain: string;
}): Promise<AggregatorOpportunity[]> {
  // Simulate AI-curated opportunities
  // In reality, this would query current user positions and market rates
  
  const opportunities: AggregatorOpportunity[] = [];

  if (params.chain === "Base") {
    opportunities.push({
      chain: "Base",
      token: "USDC",
      currentProtocol: "Aave V3",
      targetProtocol: "Moonwell",
      currentApy: 0.058,
      targetApy: 0.082,
      apyDelta: 0.024,
      estimatedCost: "bash.15",
      minDepositRequired: "00",
    });
    opportunities.push({
      chain: "Base",
      token: "ETH",
      currentProtocol: "Compound V3",
      targetProtocol: "Aave V3",
      currentApy: 0.012,
      targetApy: 0.018,
      apyDelta: 0.006,
      estimatedCost: "bash.12",
      minDepositRequired: "00",
    });
  } else if (params.chain === "Optimism") {
    opportunities.push({
      chain: "Optimism",
      token: "USDC",
      currentProtocol: "Aave V3",
      targetProtocol: "Sonne Finance",
      currentApy: 0.062,
      targetApy: 0.095,
      apyDelta: 0.033,
      estimatedCost: "bash.25",
      minDepositRequired: "00",
    });
  }

  return opportunities;
}
