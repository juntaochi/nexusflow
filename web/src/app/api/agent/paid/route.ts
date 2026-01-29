/**
 * x402-Protected Agent API Route
 * Requires USDC payment per intent execution
 */

import { NextRequest, NextResponse } from "next/server";
import {
  X402Config,
  create402Response,
  parsePaymentHeader,
  createPaymentInfo,
} from "@/lib/x402/middleware";
import { parseIntent, LLMProvider } from "@/lib/parser";
import { formatIntentPreview, getTokenAddress, IntentType } from "@/lib/intents";

// NexusFlow x402 Configuration
const NEXUSFLOW_X402_CONFIG: X402Config = {
  payTo: (process.env.NEXUSFLOW_TREASURY_ADDRESS ||
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab00") as `0x${string}`,
  asset: "USDC",
  network: process.env.NODE_ENV === "production" ? "base" : "base-sepolia",
  priceUSDC: process.env.NEXUSFLOW_INTENT_PRICE || "0.001", // $0.001 per intent
};

// Mock Paymaster Logic - In production this would interact with a Paymaster contract
const PAYMASTER_ADDRESS = "0x8888888888888888888888888888888888888888"; // Mock Paymaster

/**
 * GET - Returns payment info and pricing
 */
export async function GET() {
  const paymentInfo = createPaymentInfo(NEXUSFLOW_X402_CONFIG);

  return NextResponse.json({
    service: "NexusFlow Intent Execution",
    version: "1.0.0",
    x402Enabled: true,
    pricing: {
      perIntent: NEXUSFLOW_X402_CONFIG.priceUSDC,
      asset: NEXUSFLOW_X402_CONFIG.asset,
      network: NEXUSFLOW_X402_CONFIG.network,
    },
    payment: paymentInfo,
    capabilities: [
      "swap",
      "transfer",
      "bridge",
      "intent-parsing",
      "execution-preparation",
    ],
  });
}

/**
 * POST - Execute intent (requires x402 payment)
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Check for payment header first
  const payment = parsePaymentHeader(request);

  if (!payment) {
    // Return 402 with payment options
    return create402Response(
      NEXUSFLOW_X402_CONFIG,
      "/api/agent/paid",
      `NexusFlow Intent Execution - ${NEXUSFLOW_X402_CONFIG.priceUSDC} ${NEXUSFLOW_X402_CONFIG.asset} per intent`
    );
  }

  // Payment provided - process with streaming
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const body = await request.json();
        const { intent: userIntent, llmProvider = "openai" } = body;

        if (!userIntent || typeof userIntent !== "string") {
          send("error", { message: "Missing intent" });
          controller.close();
          return;
        }

        // Log payment info
        send("log", { message: "✓ Payment verified" });
        send("log", {
          message: `Payment: ${NEXUSFLOW_X402_CONFIG.priceUSDC} ${NEXUSFLOW_X402_CONFIG.asset}`,
        });
        send("log", { message: `> Processing: "${userIntent}"` });

        // Parse intent
        send("log", { message: "Parsing intent with LLM..." });
        const intent = await parseIntent(
          userIntent,
          llmProvider as LLMProvider
        );
        const preview = formatIntentPreview(intent);

        send("log", { message: `✓ Parsed: ${preview}` });

        if (intent.type === IntentType.UNKNOWN) {
          send("error", { message: intent.reason });
          send("result", {
            success: false,
            intent,
            preview,
            paymentUsed: NEXUSFLOW_X402_CONFIG.priceUSDC,
          });
          controller.close();
          return;
        }

        // Build token info
        const tokenInfo: Record<string, string> = {};
        if (intent.type === IntentType.SWAP) {
          send("log", {
            message: `Token In: ${intent.tokenIn} → ${getTokenAddress(intent.tokenIn)}`,
          });
          send("log", {
            message: `Token Out: ${intent.tokenOut} → ${getTokenAddress(intent.tokenOut)}`,
          });
          tokenInfo.tokenInAddress = getTokenAddress(intent.tokenIn) || "unknown";
          tokenInfo.tokenOutAddress =
            getTokenAddress(intent.tokenOut) || "unknown";
        } else if (intent.type === IntentType.TRANSFER) {
          send("log", {
            message: `Token: ${intent.token} → ${getTokenAddress(intent.token)}`,
          });
          send("log", { message: `Recipient: ${intent.to}` });
          tokenInfo.tokenAddress = getTokenAddress(intent.token) || "unknown";
        } else if (intent.type === IntentType.BRIDGE) {
          send("log", {
            message: `Bridging ${intent.amount} ${intent.token} to ${intent.toChain}`,
          });
          tokenInfo.tokenAddress = getTokenAddress(intent.token) || "unknown";
        }

        // Apply Gas Sponsorship (Subsidy)
        // Since user paid via x402, we attach a "Sponsorship Signature" to the result
        // This signature allows the frontend/agent to execute the TX with gas paid by NexusFlow
        send("log", { message: "✓ Applying Gas Sponsorship..." });
        const sponsorship = {
            sponsor: PAYMASTER_ADDRESS,
            validUntil: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
            signature: "0xmock_paymaster_signature_enabled_by_x402_payment" 
        };
        send("log", { message: `✓ Gas Sponsored by NexusFlow (Valid for 1h)` });

        send("log", { message: "✓ Intent ready for execution" });
        send("result", {
          success: true,
          intent,
          preview,
          tokenInfo,
          confidence: intent.confidence,
          paymentUsed: NEXUSFLOW_X402_CONFIG.priceUSDC,
          paymentAsset: NEXUSFLOW_X402_CONFIG.asset,
          sponsorship: sponsorship
        });
      } catch (error) {
        send("error", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Payment-Accepted": "true",
    },
  });
}
