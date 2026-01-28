import { encodeFunctionData, parseUnits, type Hex } from "viem";
import { BASE_TOKENS, SwapIntent } from "../intents";

const ZERO_X_API_BASE = "https://base.api.0x.org";

export interface SwapQuote {
  price: string;
  guaranteedPrice: string;
  to: Hex;
  data: Hex;
  value: string;
  gas: string;
  gasPrice: string;
  buyAmount: string;
  sellAmount: string;
  sources: Array<{ name: string; proportion: string }>;
}

export interface SwapResult {
  success: boolean;
  quote?: SwapQuote;
  calldata?: Hex;
  error?: string;
}

/**
 * Get token address from symbol
 */
function getTokenAddress(symbol: string): Hex {
  const normalized = symbol.toUpperCase();
  const address = BASE_TOKENS[normalized];
  if (!address) {
    throw new Error(`Unknown token: ${symbol}`);
  }
  return address;
}

/**
 * Get token decimals (simplified - real impl should query contract)
 */
function getTokenDecimals(symbol: string): number {
  const normalized = symbol.toUpperCase();
  if (normalized === "USDC" || normalized === "USDT") return 6;
  if (normalized === "WBTC") return 8;
  return 18; // ETH, WETH, DAI
}

/**
 * Fetch swap quote from 0x API
 */
export async function getSwapQuote(intent: SwapIntent): Promise<SwapResult> {
  const apiKey = process.env.ZERO_X_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Missing ZERO_X_API_KEY" };
  }

  try {
    const sellToken = getTokenAddress(intent.tokenIn);
    const buyToken = getTokenAddress(intent.tokenOut);
    const decimals = getTokenDecimals(intent.tokenIn);
    const sellAmount = parseUnits(intent.amountIn, decimals).toString();

    const params = new URLSearchParams({
      sellToken,
      buyToken,
      sellAmount,
      slippageBps: intent.slippageBps.toString(),
    });

    const response = await fetch(`${ZERO_X_API_BASE}/swap/v1/quote?${params}`, {
      headers: {
        "0x-api-key": apiKey,
        "0x-version": "v2",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `0x API error: ${error}` };
    }

    const quote: SwapQuote = await response.json();

    return {
      success: true,
      quote,
      calldata: quote.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build executeIntent calldata for a swap
 */
export function buildSwapExecuteCalldata(
  quote: SwapQuote,
  nexusDelegationAbi: readonly object[]
): Hex {
  return encodeFunctionData({
    abi: nexusDelegationAbi,
    functionName: "executeIntent",
    args: [quote.to, quote.data],
  });
}

/**
 * Format swap quote for display
 */
export function formatSwapQuote(quote: SwapQuote, intent: SwapIntent): string {
  const buyDecimals = getTokenDecimals(intent.tokenOut);
  const buyAmount = (BigInt(quote.buyAmount) / BigInt(10 ** buyDecimals)).toString();
  
  const sources = quote.sources
    .filter(s => parseFloat(s.proportion) > 0)
    .map(s => `${s.name} (${(parseFloat(s.proportion) * 100).toFixed(0)}%)`)
    .join(", ");

  return `Swap ${intent.amountIn} ${intent.tokenIn} → ~${buyAmount} ${intent.tokenOut} via ${sources || "direct"}`;
}
