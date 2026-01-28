import { NextRequest } from "next/server";
import { parseIntent, LLMProvider } from "@/lib/parser";
import { formatIntentPreview, getTokenAddress, IntentType } from "@/lib/intents";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = await request.json();
        const { intent: userIntent, llmProvider = "openai" } = body;

        if (!userIntent || typeof userIntent !== "string") {
          send("error", { message: "Missing intent" });
          controller.close();
          return;
        }

        send("log", { message: `> Received: "${userIntent}"` });
        send("log", { message: "Parsing intent with LLM..." });

        const intent = await parseIntent(userIntent, llmProvider as LLMProvider);
        const preview = formatIntentPreview(intent);

        send("log", { message: `✓ Parsed: ${preview}` });

        if (intent.type === IntentType.UNKNOWN) {
          send("error", { message: intent.reason });
          send("result", { success: false, intent, preview });
          controller.close();
          return;
        }

        // Build token info
        const tokenInfo: Record<string, string> = {};
        if (intent.type === IntentType.SWAP) {
          send("log", { message: `Token In: ${intent.tokenIn} → ${getTokenAddress(intent.tokenIn)}` });
          send("log", { message: `Token Out: ${intent.tokenOut} → ${getTokenAddress(intent.tokenOut)}` });
          tokenInfo.tokenInAddress = getTokenAddress(intent.tokenIn) || "unknown";
          tokenInfo.tokenOutAddress = getTokenAddress(intent.tokenOut) || "unknown";
        } else if (intent.type === IntentType.TRANSFER) {
          send("log", { message: `Token: ${intent.token} → ${getTokenAddress(intent.token)}` });
          send("log", { message: `Recipient: ${intent.to}` });
          tokenInfo.tokenAddress = getTokenAddress(intent.token) || "unknown";
        } else if (intent.type === IntentType.BRIDGE) {
          send("log", { message: `Bridging ${intent.amount} ${intent.token} to ${intent.toChain}` });
          tokenInfo.tokenAddress = getTokenAddress(intent.token) || "unknown";
        }

        send("log", { message: "✓ Intent ready for execution" });
        send("result", {
          success: true,
          intent,
          preview,
          tokenInfo,
          confidence: intent.confidence,
        });

      } catch (error) {
        send("error", { message: error instanceof Error ? error.message : "Unknown error" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
