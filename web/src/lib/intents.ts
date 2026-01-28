import { z } from "zod";

export enum IntentType {
  SWAP = "swap",
  TRANSFER = "transfer",
  BRIDGE = "bridge",
  UNKNOWN = "unknown",
}

const BaseIntentSchema = z.object({
  type: z.nativeEnum(IntentType),
  confidence: z.number().min(0).max(1),
  rawInput: z.string(),
});

export const SwapIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.SWAP),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amountIn: z.string(),
  slippageBps: z.number().default(50),
});

export const TransferIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.TRANSFER),
  token: z.string(),
  amount: z.string(),
  to: z.string(),
});

export const BridgeIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.BRIDGE),
  token: z.string(),
  amount: z.string(),
  fromChain: z.string().default("base"),
  toChain: z.string(),
});

export const UnknownIntentSchema = BaseIntentSchema.extend({
  type: z.literal(IntentType.UNKNOWN),
  reason: z.string(),
});

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

export const BASE_TOKENS: Record<string, `0x${string}`> = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  WETH: "0x4200000000000000000000000000000000000006",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
};

export function normalizeToken(token: string): string {
  const upper = token.toUpperCase().trim();
  if (upper === "ETHEREUM" || upper === "ETHER") return "ETH";
  if (upper === "USD COIN") return "USDC";
  return upper;
}

export function getTokenAddress(symbol: string): `0x${string}` | undefined {
  return BASE_TOKENS[normalizeToken(symbol)];
}

export function formatIntentPreview(intent: ParsedIntent): string {
  switch (intent.type) {
    case IntentType.SWAP:
      return `Swap ${intent.amountIn} ${intent.tokenIn} → ${intent.tokenOut}`;
    case IntentType.TRANSFER:
      return `Transfer ${intent.amount} ${intent.token} to ${intent.to}`;
    case IntentType.BRIDGE:
      return `Bridge ${intent.amount} ${intent.token} to ${intent.toChain}`;
    case IntentType.UNKNOWN:
      return `Unknown: ${intent.reason}`;
  }
}
