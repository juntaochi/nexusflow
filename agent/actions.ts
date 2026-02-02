import { ActionProvider, CreateAction, ViemWalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { encodeFunctionData, Hex, Address } from "viem";
import { parseIntent, formatIntentPreview, ParserConfig } from "./parser";
import { IntentType, getTokenAddress, SwapIntent, BridgeIntent, BASE_TOKENS, normalizeToken } from "./intents";
import type { ArbitrageOpportunity } from "./executor/arbitrage.js";
import { getSwapQuote, formatSwapQuote } from "./resolvers/swap";
import { buildBridgeCalldata, formatBridgePreview, isBridgeSupported } from "./resolvers/bridge";

/**
 * NexusActionProvider provides actions for NexusFlow's EIP-7702 and ERC-8004 logic.
 */
export class NexusActionProvider extends ActionProvider<ViemWalletProvider> {
  constructor() {
    super("nexusflow", []);
  }

  /**
   * Explains the EIP-7702 delegation process to the user.
   */
  @CreateAction({
    name: "explain_delegation",
    description: "Explains how EIP-7702 delegation works for NexusFlow.",
    schema: z.object({}),
  })
  async explainDelegation() {
    return "EIP-7702 allows your wallet to temporarily act as a Smart Contract. By signing a delegation to the NexusFlow contract, you allow me (your Agent) to execute specific intents like private transfers or complex swaps using a Session Key, without you ever sharing your private key.";
  }

  /**
   * Prepares the calldata for executing an intent via the NexusDelegation contract.
   */
  @CreateAction({
    name: "prepare_intent_execution",
    description: "Prepares the transaction data for executing an intent via NexusDelegation.",
    schema: z.object({
      target: z.string().describe("The target contract address for the intent"),
      data: z.string().describe("The hex-encoded calldata for the intent"),
      value: z.string().optional().describe("Amount of ETH to send in wei"),
    }),
  })
  async prepareIntentExecution(args: { target: string; data: string; value?: string }) {
    const NEXUS_DELEGATION_ABI = [
      {
        name: "executeIntent",
        type: "function",
        stateMutability: "payable",
        inputs: [
          { name: "_target", type: "address" },
          { name: "_data", type: "bytes" },
        ],
        outputs: [],
      },
    ];

    const calldata = encodeFunctionData({
      abi: NEXUS_DELEGATION_ABI,
      functionName: "executeIntent",
      args: [args.target as Hex, args.data as Hex],
    });

    const userAddress = process.env.USER_EOA_ADDRESS || "0x5D26552Fe617460250e68e737F2A60eA6402eEA9";

    return JSON.stringify({
      to: userAddress,
      data: calldata,
      value: args.value || "0",
      description: `Executing intent at ${args.target} via NexusFlow delegation.`,
    });
  }

  @CreateAction({
    name: "broadcast_prepared_intent",
    description: "Actually broadcasts a prepared intent to the network using the agent's authorized Session Key.",
    schema: z.object({
      target: z.string().describe("The target contract address for the intent"),
      data: z.string().describe("The hex-encoded calldata for the intent"),
      value: z.string().optional().describe("Amount of ETH to send in wei"),
      userAddress: z.string().describe("The user's EOA address that has delegated to this agent"),
    }),
  })
  async broadcastPreparedIntent(
    walletProvider: ViemWalletProvider,
    args: { target: string; data: string; userAddress: string; value?: string }
  ) {
    const NEXUS_DELEGATION_ABI = [
      {
        name: "executeIntent",
        type: "function",
        stateMutability: "payable",
        inputs: [
          { name: "_target", type: "address" },
          { name: "_data", type: "bytes" },
        ],
        outputs: [],
      },
    ];

    const calldata = encodeFunctionData({
      abi: NEXUS_DELEGATION_ABI,
      functionName: "executeIntent",
      args: [args.target as Hex, args.data as Hex],
    });

    try {
      const hash = await walletProvider.sendTransaction({
        to: args.userAddress as Address,
        data: calldata,
        value: args.value ? BigInt(args.value) : 0n,
      });

      return JSON.stringify({
        success: true,
        txHash: hash,
        message: `Successfully broadcasted intent execution to ${args.userAddress}.`,
      });
    } catch (error: any) {
      return JSON.stringify({
        success: false,
        error: error.message || "Failed to broadcast transaction",
      });
    }
  }

  /**
   * Parse a natural language intent into a structured format.
   */
  @CreateAction({
    name: "parse_user_intent",
    description: "Parses natural language input into a structured DeFi intent (swap, transfer, bridge).",
    schema: z.object({
      userInput: z.string().describe("The user's natural language intent"),
      llmProvider: z.enum(["openai", "anthropic"]).optional().describe("LLM provider to use"),
    }),
  })
  async parseUserIntent(args: { userInput: string; llmProvider?: "openai" | "anthropic" }) {
    const config: ParserConfig = {
      provider: args.llmProvider || "openai",
    };

    const intent = await parseIntent(args.userInput, config);
    const preview = formatIntentPreview(intent);

    if (intent.type === IntentType.UNKNOWN) {
      return JSON.stringify({
        success: false,
        error: intent.reason,
        preview,
        intent,
      });
    }

    // Build token info for valid intents
    const tokenInfo: Record<string, string> = {};
    if (intent.type === IntentType.SWAP) {
      tokenInfo.tokenInAddress = getTokenAddress(intent.tokenIn) || "unknown";
      tokenInfo.tokenOutAddress = getTokenAddress(intent.tokenOut) || "unknown";
    } else if (intent.type === IntentType.TRANSFER || intent.type === IntentType.BRIDGE) {
      tokenInfo.tokenAddress = getTokenAddress(intent.token) || "unknown";
    }

    return JSON.stringify({
      success: true,
      preview,
      intent,
      tokenInfo,
      confidence: intent.confidence,
    });
  }

  /**
   * Execute a swap intent via 0x API
   */
  @CreateAction({
    name: "execute_swap",
    description: "Gets a swap quote from 0x and prepares execution calldata for NexusDelegation.",
    schema: z.object({
      tokenIn: z.string().describe("Token to sell (e.g., 'ETH', 'USDC')"),
      tokenOut: z.string().describe("Token to buy (e.g., 'USDC', 'WETH')"),
      amountIn: z.string().describe("Amount of tokenIn to swap"),
      slippageBps: z.number().default(50).describe("Slippage in basis points"),
    }),
  })
  async executeSwap(args: { tokenIn: string; tokenOut: string; amountIn: string; slippageBps?: number }) {
    const swapIntent: SwapIntent = {
      type: IntentType.SWAP,
      tokenIn: args.tokenIn.toUpperCase(),
      tokenOut: args.tokenOut.toUpperCase(),
      amountIn: args.amountIn,
      slippageBps: args.slippageBps || 50,
      confidence: 1.0,
      rawInput: `swap ${args.amountIn} ${args.tokenIn} for ${args.tokenOut}`,
    };

    const result = await getSwapQuote(swapIntent);

    if (!result.success || !result.quote) {
      return JSON.stringify({
        success: false,
        error: result.error || "Failed to get quote",
      });
    }

    const preview = formatSwapQuote(result.quote, swapIntent);

    return JSON.stringify({
      success: true,
      preview,
      quote: {
        buyAmount: result.quote.buyAmount,
        sellAmount: result.quote.sellAmount,
        price: result.quote.price,
        gas: result.quote.gas,
      },
      execution: {
        to: result.quote.to,
        data: result.quote.data,
        value: result.quote.value,
      },
    });
  }

  /**
   * Prepare a cross-chain bridge operation
   */
  @CreateAction({
    name: "prepare_bridge",
    description: "Prepares calldata for bridging tokens across Superchain (Base <-> OP Mainnet).",
    schema: z.object({
      token: z.string().describe("Token to bridge (e.g., 'ETH', 'USDC')"),
      amount: z.string().describe("Amount to bridge"),
      fromChain: z.string().default("base").describe("Source chain"),
      toChain: z.string().describe("Destination chain (e.g., 'optimism')"),
      userAddress: z.string().describe("User's address to receive tokens"),
    }),
  })
  async prepareBridge(args: {
    token: string;
    amount: string;
    fromChain?: string;
    toChain: string;
    userAddress: string;
  }) {
    const bridgeIntent: BridgeIntent = {
      type: IntentType.BRIDGE,
      token: args.token.toUpperCase(),
      amount: args.amount,
      fromChain: args.fromChain || "base",
      toChain: args.toChain,
      confidence: 1.0,
      rawInput: `bridge ${args.amount} ${args.token} to ${args.toChain}`,
    };

    if (!isBridgeSupported(bridgeIntent.fromChain, bridgeIntent.toChain)) {
      return JSON.stringify({
        success: false,
        error: `Bridge not supported: ${bridgeIntent.fromChain} -> ${bridgeIntent.toChain}`,
      });
    }

    const sourceTokenAddress = getTokenAddress(bridgeIntent.token, bridgeIntent.fromChain);
    const destTokenAddress = getTokenAddress(bridgeIntent.token, bridgeIntent.toChain);

    if (!sourceTokenAddress || !destTokenAddress) {
      return JSON.stringify({
        success: false,
        error: `Token ${bridgeIntent.token} address not found for ${!sourceTokenAddress ? bridgeIntent.fromChain : bridgeIntent.toChain}`,
      });
    }

    const result = buildBridgeCalldata(
      bridgeIntent,
      args.userAddress as Address,
      sourceTokenAddress,
      destTokenAddress
    );

    if (!result.success) {
      return JSON.stringify({
        success: false,
        error: result.error,
      });
    }

    const preview = formatBridgePreview(bridgeIntent);

    return JSON.stringify({
      success: true,
      preview,
      steps: [
        {
          name: "Burn on source chain",
          target: sourceTokenAddress,
          data: result.burnCalldata,
        },
        {
          name: "Send cross-chain message",
          target: "0x4200000000000000000000000000000000000023",
          data: result.messageCalldata,
        },
      ],
      destinationChainId: result.destinationChainId,
    });
  }

  /**
   * Execute cross-chain arbitrage automatically
   */
  @CreateAction({
    name: "execute_arbitrage",
    description: "Automatically execute a cross-chain yield arbitrage opportunity via NexusDelegation.",
    schema: z.object({
      sourceChain: z.string().describe("Source chain (e.g., 'base', 'optimism')"),
      targetChain: z.string().describe("Target chain"),
      amount: z.string().describe("Amount to arbitrage in ETH/token"),
      userEOA: z.string().describe("User's EOA address (upgraded via EIP-7702)"),
    }),
  })
  async executeArbitrage(
    walletProvider: ViemWalletProvider,
    args: {
      sourceChain: string;
      targetChain: string;
      amount: string;
      userEOA: string;
    }
  ) {
    const { ArbitrageExecutor } = await import("./executor/arbitrage.js");
    const { DeFiMonitor } = await import("./cron/monitor.js");

    // Get current opportunities
    const opportunities = await DeFiMonitor.getOpportunities();
    const matchesChain = (candidate: string, input: string) => {
      const normCandidate = candidate.toLowerCase();
      const normInput = input.toLowerCase();
      return normCandidate.includes(normInput) || normInput.includes(normCandidate);
    };
    const matchingOpp = opportunities.find(
      (opp: ArbitrageOpportunity) =>
        matchesChain(opp.sourceChain, args.sourceChain) &&
        matchesChain(opp.targetChain, args.targetChain)
    );

    if (!matchingOpp) {
      return JSON.stringify({
        success: false,
        error: `No arbitrage opportunity found between ${args.sourceChain} and ${args.targetChain}`,
      });
    }

    // Execute the arbitrage (cast matchingOpp to proper type)
    const executor = new ArbitrageExecutor(walletProvider, args.userEOA as Address);

    const result = await executor.executeArbitrage(matchingOpp as ArbitrageOpportunity);

    return JSON.stringify({
      success: result.success,
      txHash: result.txHash,
      error: result.error,
      opportunity: matchingOpp,
      estimatedProfit: result.estimatedProfit,
    });
  }

  supportsNetwork = () => true;
}

export const nexusActionProvider = () => new NexusActionProvider();
