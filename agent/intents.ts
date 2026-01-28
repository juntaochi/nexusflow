import { z } from "zod";

/**
 * Intent Types for NexusFlow Agent
 */
export enum IntentType {
  SWAP = "swap",
  TRANSFER = "transfer",
  BRIDGE = "bridge",
  UNKNOWN = "unknown",
}

/**
 * Base intent schema with common fields
 */
const BaseIntentSchema = z.object({
  type: z.nativeEnum(IntentType),
  confidence: z.number().min(0).max(1).describe("Confidence score from 0-1"),
  rawInput: z.string().describe("Original user input"),
});

/**
 * Swap Intent - Exchange one token for another
 */
export const SwapIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.SWAP),
  tokenIn: z.string().describe("Token to sell (e.g., 'ETH', 'USDC')"),
  tokenOut: z.string().describe("Token to buy (e.g., 'USDC', 'WETH')"),
  amountIn: z.string().describe("Amount of tokenIn to swap"),
  slippageBps: z.number().default(50).describe("Slippage tolerance in basis points (50 = 0.5%)"),
});

/**
 * Transfer Intent - Send tokens to an address
 */
export const TransferIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.TRANSFER),
  token: z.string().describe("Token to transfer (e.g., 'ETH', 'USDC')"),
  amount: z.string().describe("Amount to transfer"),
  to: z.string().describe("Recipient address or ENS name"),
});

/**
 * Bridge Intent - Cross-chain token transfer
 */
export const BridgeIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.BRIDGE),
  token: z.string().describe("Token to bridge"),
  amount: z.string().describe("Amount to bridge"),
  fromChain: z.string().default("base").describe("Source chain"),
  toChain: z.string().describe("Destination chain (e.g., 'ethereum', 'arbitrum')"),
});

/**
 * Unknown Intent - When parser cannot determine intent
 */
export const UnknownIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.UNKNOWN),
  reason: z.string().describe("Why the intent could not be parsed"),
});

/**
 * Union of all intent types
 */
export const ParsedIntentSchema = z.discriminatedUnion("type", [
  SwapIntentSchema,
  TransferIntentSchema,
  BridgeIntentSchema,
  UnknownIntentSchema,
]);

export type SwapIntent = z.infer<typeof SwapIntentSchema>;
export type TransferIntent = z.infer<typeof TransferIntentSchema>;
export type BridgeIntent = z.infer<typeof BridgeIntentSchema>;
export type UnknownIntent = z.infer<typeof UnknownIntentSchema>;
export type ParsedIntent = z.infer<typeof ParsedIntentSchema>;

/**
 * Token address mapping for Base chain
 */
export const BASE_TOKENS: Record<string, `0x${string}`> = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  WETH: "0x4200000000000000000000000000000000000006",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  WBTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
};

/**
 * Normalize token symbol to uppercase
 */
export function normalizeToken(token: string): string {
  const upper = token.toUpperCase().trim();
  if (upper === "ETHEREUM" || upper === "ETHER") return "ETH";
  if (upper === "WRAPPED ETH" || upper === "WRAPPED ETHER") return "WETH";
  if (upper === "USD COIN") return "USDC";
  if (upper === "TETHER") return "USDT";
  if (upper === "BITCOIN" || upper === "WRAPPED BITCOIN") return "WBTC";
  return upper;
}

/**
 * Get token address from symbol
 */
export function getTokenAddress(symbol: string): `0x${string}` | undefined {
  return BASE_TOKENS[normalizeToken(symbol)];
}

/**
 * Validate that a parsed intent has required token addresses
 */
export function validateIntentTokens(intent: ParsedIntent): { valid: boolean; error?: string } {
  if (intent.type === IntentType.SWAP) {
    const tokenInAddr = getTokenAddress(intent.tokenIn);
    const tokenOutAddr = getTokenAddress(intent.tokenOut);
    if (!tokenInAddr) return { valid: false, error: `Unknown token: ${intent.tokenIn}` };
    if (!tokenOutAddr) return { valid: false, error: `Unknown token: ${intent.tokenOut}` };
  } else if (intent.type === IntentType.TRANSFER || intent.type === IntentType.BRIDGE) {
    const tokenAddr = getTokenAddress(intent.token);
    if (!tokenAddr) return { valid: false, error: `Unknown token: ${intent.token}` };
  }
  return { valid: true };
}
