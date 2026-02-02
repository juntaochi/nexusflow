import {
  ParsedIntent,
  IntentType,
  normalizeToken,
  validateIntentTokens,
} from "./intents";

/**
 * Client-side Intent Parser (Mocked LLM Logic for Frontend)
 * In a production env, this would call a backend API that wraps the real LLM to protect keys.
 * For this demo, we'll simulate the parsing logic with regex/heuristics or call a proxied endpoint if available.
 */
export async function parseIntent(userInput: string): Promise<ParsedIntent> {
  
  // Simple regex heuristics for demo purposes since we can't expose API keys on client
  const lower = userInput.toLowerCase();
  
  // 1. SWAP
  if (lower.includes("swap") || lower.includes("buy") || lower.includes("sell")) {
    // Regex: swap <amount> <tokenIn> for <tokenOut>
    const swapMatch = lower.match(/(?:swap|buy|sell)\s+(\d+(?:\.\d+)?)\s+(\w+)(?:\s+(?:for|to|with)\s+(\w+))?/);
    
    if (swapMatch) {
      const amount = swapMatch[1];
      const token1 = normalizeToken(swapMatch[2]);
      const token2 = swapMatch[3] ? normalizeToken(swapMatch[3]) : "NUSD";
      
      // Infer direction: if buying X with Y, then Y is In, X is Out.
      // "swap 1 ETH for USDC" -> In: ETH, Out: USDC
      // "buy 100 USDC with ETH" -> In: ETH, Out: USDC
      
      let tokenIn = token1;
      let tokenOut = token2;
      let amountIn = amount;

      if (lower.includes("buy") && lower.includes("with")) {
         // buy <amount> <tokenOut> with <tokenIn>
         tokenOut = token1;
         tokenIn = token2;
         amountIn = "0"; 
      }

      const intent: ParsedIntent = {
        type: IntentType.SWAP,
        tokenIn: tokenIn || "ETH",
        tokenOut: tokenOut || "NUSD",
        amountIn: amountIn,
        slippageBps: 50,
        confidence: 0.95,
        rawInput: userInput
      };

      const validation = validateIntentTokens(intent);
      if (validation.valid) return intent;
      return { ...intent, type: IntentType.UNKNOWN, reason: validation.error || "Invalid tokens", confidence: 0 };
    }
  }

  // 2. TRANSFER
  if (lower.includes("send") || lower.includes("transfer")) {
    const transferMatch = lower.match(/(?:send|transfer)\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)/);
    if (transferMatch) {
      const intent: ParsedIntent = {
        type: IntentType.TRANSFER,
        amount: transferMatch[1],
        token: normalizeToken(transferMatch[2]),
        to: transferMatch[3],
        confidence: 0.95,
        rawInput: userInput
      };
      
      const validation = validateIntentTokens(intent);
      if (validation.valid) return intent;
       return { ...intent, type: IntentType.UNKNOWN, reason: validation.error || "Invalid tokens", confidence: 0 };
    }
  }

  // 3. BRIDGE
  if (lower.includes("bridge")) {
    const bridgeMatch = lower.match(/bridge\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:from\s+(\w+)\s+)?to\s+(\w+)/);
    if (bridgeMatch) {
       const intent: ParsedIntent = {
        type: IntentType.BRIDGE,
        amount: bridgeMatch[1],
        token: normalizeToken(bridgeMatch[2]),
        fromChain: bridgeMatch[3] || "base",
        toChain: bridgeMatch[4],
        confidence: 0.95,
        rawInput: userInput
      };
       const validation = validateIntentTokens(intent);
      if (validation.valid) return intent;
       return { ...intent, type: IntentType.UNKNOWN, reason: validation.error || "Invalid tokens", confidence: 0 };
    }
  }

  return {
    type: IntentType.UNKNOWN,
    reason: "Could not understand command. Try 'Swap 1 ETH for NUSD' or 'Transfer 0.5 NUSD to 0x...'",
    confidence: 0,
    rawInput: userInput
  };
}

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
