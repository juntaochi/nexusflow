import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  ParsedIntent,
  ParsedIntentSchema,
  IntentType,
  normalizeToken,
} from "./intents";

const SYSTEM_PROMPT = `You are an intent parser for NexusFlow, a DeFi agent on Base chain.
Parse natural language into structured intents.

Supported intents:
1. SWAP - Exchange tokens (e.g., "swap 1 ETH for USDC")
2. TRANSFER - Send tokens (e.g., "send 0.5 ETH to vitalik.eth")
3. BRIDGE - Cross-chain (e.g., "bridge 1 ETH to Arbitrum")

Supported tokens: ETH, WETH, USDC, USDT, DAI

Respond ONLY with JSON:

SWAP: {"type":"swap","tokenIn":"ETH","tokenOut":"USDC","amountIn":"1","slippageBps":50,"confidence":0.95,"rawInput":"..."}
TRANSFER: {"type":"transfer","token":"ETH","amount":"0.5","to":"0x...","confidence":0.95,"rawInput":"..."}
BRIDGE: {"type":"bridge","token":"ETH","amount":"1","fromChain":"base","toChain":"arbitrum","confidence":0.95,"rawInput":"..."}
UNKNOWN: {"type":"unknown","reason":"...","confidence":0.0,"rawInput":"..."}`;

export type LLMProvider = "openai" | "anthropic";

function createLLM(provider: LLMProvider) {
  if (provider === "anthropic") {
    return new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: "claude-sonnet-4-20250514",
      temperature: 0,
    });
  }
  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0,
  });
}

export async function parseIntent(
  userInput: string,
  provider: LLMProvider = "openai"
): Promise<ParsedIntent> {
  const llm = createLLM(provider);

  try {
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(userInput),
    ]);

    const content = typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        type: IntentType.UNKNOWN,
        reason: "Failed to parse response",
        confidence: 0,
        rawInput: userInput,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.tokenIn) parsed.tokenIn = normalizeToken(parsed.tokenIn);
    if (parsed.tokenOut) parsed.tokenOut = normalizeToken(parsed.tokenOut);
    if (parsed.token) parsed.token = normalizeToken(parsed.token);
    parsed.rawInput = userInput;

    return ParsedIntentSchema.parse(parsed);
  } catch (error) {
    return {
      type: IntentType.UNKNOWN,
      reason: error instanceof Error ? error.message : "Parse error",
      confidence: 0,
      rawInput: userInput,
    };
  }
}
