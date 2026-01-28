import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  ParsedIntent,
  ParsedIntentSchema,
  IntentType,
  normalizeToken,
  validateIntentTokens,
} from "./intents";

const SYSTEM_PROMPT = `You are an intent parser for NexusFlow, a DeFi agent on Base chain.
Your job is to parse natural language into structured intents.

Supported intent types:
1. SWAP - Exchange tokens (e.g., "swap 1 ETH for USDC", "buy 100 USDC with ETH")
2. TRANSFER - Send tokens (e.g., "send 0.5 ETH to vitalik.eth", "transfer 100 USDC to 0x...")
3. BRIDGE - Cross-chain transfer (e.g., "bridge 1 ETH to Arbitrum")

Supported tokens on Base: ETH, WETH, USDC, USDT, DAI, WBTC

Rules:
- Extract amounts as strings (e.g., "1.5", "100")
- Normalize token names (e.g., "ethereum" → "ETH", "usd coin" → "USDC")
- For swaps, identify tokenIn (what user is selling) and tokenOut (what user is buying)
- If intent is ambiguous or unsupported, return type "unknown" with a reason
- Confidence should be 0.9+ for clear intents, lower for ambiguous ones

Respond ONLY with valid JSON matching one of these schemas:

SWAP:
{"type":"swap","tokenIn":"ETH","tokenOut":"USDC","amountIn":"1","slippageBps":50,"confidence":0.95,"rawInput":"..."}

TRANSFER:
{"type":"transfer","token":"ETH","amount":"0.5","to":"0x...or ENS","confidence":0.95,"rawInput":"..."}

BRIDGE:
{"type":"bridge","token":"ETH","amount":"1","fromChain":"base","toChain":"arbitrum","confidence":0.95,"rawInput":"..."}

UNKNOWN:
{"type":"unknown","reason":"Could not determine intent","confidence":0.0,"rawInput":"..."}`;

export interface ParserConfig {
  provider: "openai" | "anthropic";
  apiKey?: string;
  model?: string;
}

/**
 * Create an LLM instance based on config
 */
function createLLM(config: ParserConfig) {
  if (config.provider === "anthropic") {
    return new ChatAnthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      model: config.model || "claude-sonnet-4-20250514",
      temperature: 0,
    });
  }
  return new ChatOpenAI({
    apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    model: config.model || "gpt-4o-mini",
    temperature: 0,
  });
}

/**
 * Parse a user's natural language input into a structured intent
 */
export async function parseIntent(
  userInput: string,
  config: ParserConfig = { provider: "openai" }
): Promise<ParsedIntent> {
  const llm = createLLM(config);

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userInput),
  ];

  try {
    const response = await llm.invoke(messages);
    const content = typeof response.content === "string" 
      ? response.content 
      : JSON.stringify(response.content);

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        type: IntentType.UNKNOWN,
        reason: "Failed to parse LLM response as JSON",
        confidence: 0,
        rawInput: userInput,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Normalize tokens in the parsed result
    if (parsed.tokenIn) parsed.tokenIn = normalizeToken(parsed.tokenIn);
    if (parsed.tokenOut) parsed.tokenOut = normalizeToken(parsed.tokenOut);
    if (parsed.token) parsed.token = normalizeToken(parsed.token);
    
    // Ensure rawInput is set
    parsed.rawInput = userInput;

    // Validate against schema
    const validated = ParsedIntentSchema.parse(parsed);

    // Validate token addresses exist
    const tokenValidation = validateIntentTokens(validated);
    if (!tokenValidation.valid) {
      return {
        type: IntentType.UNKNOWN,
        reason: tokenValidation.error || "Invalid tokens",
        confidence: 0,
        rawInput: userInput,
      };
    }

    return validated;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      type: IntentType.UNKNOWN,
      reason: `Parser error: ${errorMessage}`,
      confidence: 0,
      rawInput: userInput,
    };
  }
}

/**
 * Format a parsed intent for display to the user
 */
export function formatIntentPreview(intent: ParsedIntent): string {
  switch (intent.type) {
    case IntentType.SWAP:
      return `Swap ${intent.amountIn} ${intent.tokenIn} → ${intent.tokenOut} (slippage: ${intent.slippageBps / 100}%)`;
    case IntentType.TRANSFER:
      return `Transfer ${intent.amount} ${intent.token} to ${intent.to}`;
    case IntentType.BRIDGE:
      return `Bridge ${intent.amount} ${intent.token} from ${intent.fromChain} to ${intent.toChain}`;
    case IntentType.UNKNOWN:
      return `Could not parse intent: ${intent.reason}`;
  }
}
