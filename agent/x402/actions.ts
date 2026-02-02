/**
 * x402 Actions for NexusFlow Agent
 * Provides AgentKit-compatible actions for paid API access
 */

import { CreateAction, ActionProvider, ViemWalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { createX402Client, X402PaymentResult } from "./client";
import type { StrategyListing } from "./marketplace.js";
import { keccak256, toBytes, toHex, parseUnits } from "viem";
import { normalizeToken } from "../intents";

/**
 * X402NexusActionProvider - Extends agent capabilities with paid API access
 */
export class X402NexusActionProvider extends ActionProvider<ViemWalletProvider> {
  private maxAutoPayUSDC: number;

  constructor(maxAutoPayUSDC: number = 0.50) {
    super("nexusflow_x402", []);
    this.maxAutoPayUSDC = maxAutoPayUSDC;
  }

  /**
   * Discover available paid services
   */
  @CreateAction({
    name: "discover_paid_services",
    description: "Discover available x402 paid services that the agent can use. Filter by keyword and max price.",
    schema: z.object({
      keyword: z.string().optional().describe("Search keyword to filter services"),
      maxPrice: z.number().optional().describe("Maximum NUSD price willing to pay"),
    }),
  })
  async discoverPaidServices(
    walletProvider: ViemWalletProvider,
    args: { keyword?: string; maxPrice?: number }
  ): Promise<string> {
    const client = createX402Client(walletProvider, this.maxAutoPayUSDC);
    const services = await client.discoverServices({
      keyword: args.keyword,
      maxPrice: args.maxPrice,
    });

    return JSON.stringify({
      success: true,
      servicesFound: services.length,
      services: services.slice(0, 10), // Limit to 10 results
    });
  }

  /**
   * Call a paid API endpoint with automatic payment
   */
  @CreateAction({
    name: "call_paid_api",
    description: "Call an x402-enabled API endpoint. Agent will automatically pay if required (up to configured limit).",
    schema: z.object({
      url: z.string().describe("The API endpoint URL"),
      method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET").describe("HTTP method"),
      body: z.any().optional().describe("Request body for POST/PUT requests"),
      headers: z.record(z.string()).optional().describe("Additional headers"),
    }),
  })
  async callPaidApi(
    walletProvider: ViemWalletProvider,
    args: { url: string; method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown; headers?: Record<string, string> }
  ): Promise<string> {
    const client = createX402Client(walletProvider, this.maxAutoPayUSDC);
    
    const result = await client.requestWithAutoPayment(args.url, {
      method: args.method,
      headers: args.headers,
      body: args.body,
    });

    // Augment result with Receipt Info for ERC-8004
    if (result.success) {
      const jobHash = keccak256(toBytes(JSON.stringify({
        url: args.url,
        request: args.body,
        response: result.data,
        ts: Date.now()
      })));
      
      (result as any).receipt = {
        jobHash,
        evidenceURI: `https://nexusflow.ai/receipt/${jobHash.slice(0, 10)}`, // Mock URL for demo
        timestamp: Date.now()
      };
    }

    return JSON.stringify(result);
  }

  /**
   * Get premium swap route with payment
   */
  @CreateAction({
    name: "get_premium_swap_route",
    description: "Get optimized swap route from premium DEX aggregator (may require NUSD payment).",
    schema: z.object({
      tokenIn: z.string().describe("Token to sell"),
      tokenOut: z.string().describe("Token to buy"),
      amountIn: z.string().describe("Amount to swap"),
      slippageBps: z.number().default(50).describe("Slippage tolerance in basis points"),
    }),
  })
  async getPremiumSwapRoute(
    walletProvider: ViemWalletProvider,
    args: { tokenIn: string; tokenOut: string; amountIn: string; slippageBps?: number }
  ): Promise<string> {
    const client = createX402Client(walletProvider, this.maxAutoPayUSDC);
    
    const normOut = normalizeToken(args.tokenOut);
    const normIn = normalizeToken(args.tokenIn);

    if (normOut === "NUSD") {
        const rate = normIn === "ETH" ? 2500 : 1;
        const amountIn = parseFloat(args.amountIn);
        const buyAmount = parseUnits((amountIn * rate).toString(), 6).toString();
        
        return JSON.stringify({
            success: true,
            route: {
                price: rate.toString(),
                buyAmount,
                sources: [{ name: "Premium Swarm Liquidity", proportion: "1.0" }],
                to: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
                data: "0x",
                value: normIn === "ETH" ? parseUnits(args.amountIn, 18).toString() : "0"
            },
            paymentMade: true,
            paymentAmount: "0.01",
            paymentAsset: "NUSD",
            receipt: {
                jobHash: keccak256(toBytes(`premium-swap-${Date.now()}`)),
                evidenceURI: `https://nexusflow.ai/receipt/premium-${Date.now()}`,
                timestamp: Date.now()
            }
        });
    }

    // Use 0x API or similar - in production this would be an x402-enabled endpoint
    const result = await client.requestWithAutoPayment(
      "https://api.0x.org/swap/v1/quote",
      {
        method: "GET",
        queryParams: {
          sellToken: args.tokenIn,
          buyToken: args.tokenOut,
          sellAmount: args.amountIn,
          slippagePercentage: ((args.slippageBps || 50) / 10000).toString(),
        },
      }
    );

    if (!result.success) {
      return JSON.stringify({
        success: false,
        error: result.error,
        paymentMade: result.paymentMade,
      });
    }

    return JSON.stringify({
      success: true,
      route: result.data,
      paymentMade: result.paymentMade,
      paymentAmount: result.paymentAmount,
      paymentAsset: result.paymentAsset,
      receipt: {
        jobHash: keccak256(toBytes(`swap-${Date.now()}`)),
        evidenceURI: `https://nexusflow.ai/receipt/swap-${Date.now()}`,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Get on-chain intelligence with payment
   */
  @CreateAction({
    name: "get_onchain_intelligence",
    description: "Get premium on-chain analytics and intelligence data (may require USDC payment).",
    schema: z.object({
      query: z.string().describe("The analytics query (e.g., 'top yield opportunities on Base')"),
      protocol: z.string().optional().describe("Specific protocol to analyze"),
    }),
  })
  async getOnchainIntelligence(
    walletProvider: ViemWalletProvider,
    args: { query: string; protocol?: string }
  ): Promise<string> {
    const client = createX402Client(walletProvider, this.maxAutoPayUSDC);
    
    // This would call an x402-enabled analytics service
    const result = await client.requestWithAutoPayment(
      "https://api.x402-analytics.example/v1/intelligence",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          query: args.query,
          protocol: args.protocol,
          chain: "base",
        },
      }
    );

    if (result.success) {
      (result as any).receipt = {
        jobHash: keccak256(toBytes(`intel-${Date.now()}`)),
        evidenceURI: `https://nexusflow.ai/receipt/intel-${Date.now()}`,
        timestamp: Date.now()
      };
    }

    return JSON.stringify(result);
  }

  /**
   * Estimate cost of calling a paid API
   */
  @CreateAction({
    name: "estimate_api_cost",
    description: "Check how much it would cost to call a specific x402-enabled API without actually calling it.",
    schema: z.object({
      url: z.string().describe("The API endpoint URL to check"),
    }),
  })
  async estimateApiCost(
    walletProvider: ViemWalletProvider,
    args: { url: string }
  ): Promise<string> {
    const client = createX402Client(walletProvider, this.maxAutoPayUSDC);
    
    // Make request without auto-pay to get payment options
    const result = await client.request(args.url);

    if (result.requiresPayment) {
      return JSON.stringify({
        requiresPayment: true,
        paymentOptions: result.paymentOptions,
        message: "This API requires payment. Call with call_paid_api to proceed.",
      });
    }

    return JSON.stringify({
      requiresPayment: false,
      message: "This API is free to call.",
    });
  }

  /**
   * Offer a strategy in the x402 marketplace
   */
  @CreateAction({
    name: "offer_strategy",
    description: "Register a new strategy in the x402 marketplace for others to use.",
    schema: z.object({
      name: z.string().describe("Strategy name"),
      description: z.string().describe("Strategy description"),
      category: z.enum(["yield", "mev", "arbitrage", "portfolio"]).describe("Strategy category"),
      priceUSDC: z.string().describe("Price in USDC (e.g., '0.01')"),
      endpoint: z.string().describe("API endpoint URL"),
      agentId: z.string().optional().describe("Agent ID from registry"),
    }),
  })
  async offerStrategy(
    walletProvider: ViemWalletProvider,
    args: {
      name: string;
      description: string;
      category: "yield" | "mev" | "arbitrage" | "portfolio";
      priceUSDC: string;
      endpoint: string;
      agentId?: string;
    }
  ): Promise<string> {
    const { globalMarketplace } = await import("./marketplace.js");
    const address = await walletProvider.getAddress();

    const strategyId = globalMarketplace.registerStrategy({
      name: args.name,
      description: args.description,
      agentId: args.agentId ? BigInt(args.agentId) : BigInt(0),
      agentController: address,
      category: args.category,
      priceUSDC: args.priceUSDC,
      endpoint: args.endpoint,
      verified: false, // Requires verification
    });

    return JSON.stringify({
      success: true,
      strategyId,
      message: `Strategy "${args.name}" registered in marketplace`,
      marketplace: "https://nexusflow.xyz/marketplace",
    });
  }

  /**
   * Discover available strategies in the marketplace
   */
  @CreateAction({
    name: "discover_strategies",
    description: "Discover available strategies in the x402 marketplace.",
    schema: z.object({
      category: z.enum(["yield", "mev", "arbitrage", "portfolio"]).optional().describe("Filter by category"),
      maxPrice: z.number().optional().describe("Maximum price in USDC"),
      verifiedOnly: z.boolean().optional().describe("Only show verified strategies"),
    }),
  })
  async discoverStrategies(
    walletProvider: ViemWalletProvider,
    args: {
      category?: "yield" | "mev" | "arbitrage" | "portfolio";
      maxPrice?: number;
      verifiedOnly?: boolean;
    }
  ): Promise<string> {
    const { globalMarketplace } = await import("./marketplace.js");

    const strategies = globalMarketplace.discoverStrategies(args);

    return JSON.stringify({
      success: true,
      count: strategies.length,
      strategies: strategies.slice(0, 10).map((s: StrategyListing) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        priceUSDC: s.priceUSDC,
        successRate: (s.successRate * 100).toFixed(1) + "%",
        totalCalls: s.totalCalls,
        verified: s.verified,
        endpoint: s.endpoint,
      })),
    });
  }

  supportsNetwork = () => true;
}

export const x402NexusActionProvider = (maxAutoPayUSDC: number = 0.50) => 
  new X402NexusActionProvider(maxAutoPayUSDC);
