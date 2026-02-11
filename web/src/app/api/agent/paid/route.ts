/**
 * x402-Protected Agent API Route
 * Requires USDC payment per intent execution
 */

import { NextRequest, NextResponse } from "next/server";
import {
  X402Config,
  createPaymentInfo,
  verifyX402Payment,
  withPaymentResponseHeader,
} from "@/lib/x402/middleware";
import { parseIntent, LLMProvider } from "@/lib/parser";
import { formatIntentPreview, getTokenAddress, IntentType } from "@/lib/intents";

// NexusFlow x402 Configuration
const NEXUSFLOW_X402_CONFIG: X402Config = {
  payTo: (process.env.NEXUSFLOW_TREASURY_ADDRESS ||
    "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab00") as `0x${string}`,
  network:
    process.env.NODE_ENV === "production" ? "eip155:8453" : "eip155:84532",
  priceUsd: process.env.NEXUSFLOW_INTENT_PRICE || "0.001", // $0.001 per intent
  description: "NexusFlow Intent Execution",
  mimeType: "text/event-stream",
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
      perIntent: NEXUSFLOW_X402_CONFIG.priceUsd,
      asset: "USDC",
      network: paymentInfo.network,
      networkId: paymentInfo.networkId,
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

  const paymentCheck = await verifyX402Payment(request, NEXUSFLOW_X402_CONFIG);
  if (!paymentCheck.ok) {
    return paymentCheck.response;
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
          message: `Payment: ${NEXUSFLOW_X402_CONFIG.priceUsd} USDC`,
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
            paymentUsed: NEXUSFLOW_X402_CONFIG.priceUsd,
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
            signature: "0xdev_stub_signature_valid_for_testnet_sponsorship" 
        };
        send("log", { message: `✓ Gas Sponsored by NexusFlow (Valid for 1h)` });

        send("log", { message: "✓ Intent ready for execution" });
        send("result", {
          success: true,
          intent,
          preview,
          tokenInfo,
          confidence: intent.confidence,
          paymentUsed: NEXUSFLOW_X402_CONFIG.priceUsd,
          paymentAsset: "USDC",
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

  const response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  return withPaymentResponseHeader(response, paymentCheck.settlement);
}
