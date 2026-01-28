/**
 * x402 Client for NexusFlow Agent
 * Enables AI agent to automatically pay for external API calls
 */

import { x402ActionProvider } from "@coinbase/agentkit";
import { ViemWalletProvider } from "@coinbase/agentkit";

export interface X402PaymentResult {
  success: boolean;
  data?: unknown;
  paymentMade: boolean;
  paymentAmount?: string;
  paymentAsset?: string;
  paymentNetwork?: string;
  txHash?: string;
  error?: string;
}

export interface X402ServiceInfo {
  url: string;
  description: string;
  price: string;
  asset: string;
  network: string;
}

/**
 * NexusX402Client wraps AgentKit's x402 provider for seamless paid API access
 */
export class NexusX402Client {
  private provider: ReturnType<typeof x402ActionProvider>;
  private walletProvider: ViemWalletProvider;
  private maxAutoPayUSDC: number;

  constructor(walletProvider: ViemWalletProvider, maxAutoPayUSDC: number = 1.0) {
    this.provider = x402ActionProvider();
    this.walletProvider = walletProvider;
    this.maxAutoPayUSDC = maxAutoPayUSDC;
  }

  /**
   * Discover available x402-enabled services
   */
  async discoverServices(options: {
    keyword?: string;
    maxPrice?: number;
  } = {}): Promise<X402ServiceInfo[]> {
    const result = await this.provider.discoverX402Services(this.walletProvider, {
      facilitator: "cdp",
      maxUsdcPrice: options.maxPrice || this.maxAutoPayUSDC,
      keyword: options.keyword,
      x402Versions: [1, 2],
    });

    try {
      const parsed = JSON.parse(result);
      return parsed.services || [];
    } catch {
      return [];
    }
  }

  /**
   * Make an HTTP request with automatic x402 payment handling
   * Agent will automatically pay if the service requires payment
   */
  async requestWithAutoPayment(
    url: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      headers?: Record<string, string>;
      body?: unknown;
      queryParams?: Record<string, string>;
    } = {}
  ): Promise<X402PaymentResult> {
    try {
      const result = await this.provider.makeHttpRequestWithX402(
        this.walletProvider,
        {
          url,
          method: options.method || "GET",
          headers: options.headers || null,
          body: options.body || null,
          queryParams: options.queryParams || null,
        }
      );

      const parsed = JSON.parse(result);

      if (parsed.error) {
        return {
          success: false,
          paymentMade: false,
          error: parsed.error,
        };
      }

      return {
        success: true,
        data: parsed.data || parsed.response,
        paymentMade: parsed.paymentMade || false,
        paymentAmount: parsed.paymentAmount,
        paymentAsset: parsed.paymentAsset,
        paymentNetwork: parsed.paymentNetwork,
        txHash: parsed.txHash,
      };
    } catch (error) {
      return {
        success: false,
        paymentMade: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Make a standard HTTP request (no auto-payment)
   */
  async request(
    url: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      headers?: Record<string, string>;
      body?: unknown;
    } = {}
  ): Promise<{ success: boolean; data?: unknown; requiresPayment?: boolean; paymentOptions?: unknown[]; error?: string }> {
    try {
      const result = await this.provider.makeHttpRequest(this.walletProvider, {
        url,
        method: options.method || "GET",
        headers: options.headers || null,
        body: options.body || null,
        queryParams: null,
      });

      const parsed = JSON.parse(result);

      // Check if 402 response
      if (parsed.statusCode === 402) {
        return {
          success: false,
          requiresPayment: true,
          paymentOptions: parsed.paymentOptions,
        };
      }

      return {
        success: true,
        data: parsed.data || parsed.response,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get DEX quote with automatic payment (e.g., paid 0x API)
   */
  async getPaidDexQuote(params: {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    chainId: number;
  }): Promise<X402PaymentResult> {
    // Example: calling a hypothetical x402-enabled DEX aggregator API
    const url = `https://api.x402-dex.example/quote`;
    
    return this.requestWithAutoPayment(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: params,
    });
  }

  /**
   * Get on-chain analytics with automatic payment
   */
  async getPaidAnalytics(params: {
    protocol: string;
    metric: string;
    timeframe: string;
  }): Promise<X402PaymentResult> {
    const url = `https://api.x402-analytics.example/v1/data`;
    
    return this.requestWithAutoPayment(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: params,
    });
  }
}

/**
 * Create a configured x402 client for the agent
 */
export function createX402Client(
  walletProvider: ViemWalletProvider,
  maxAutoPayUSDC: number = 1.0
): NexusX402Client {
  return new NexusX402Client(walletProvider, maxAutoPayUSDC);
}
