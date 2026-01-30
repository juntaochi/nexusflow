/**
 * Yield Aggregator Executor
 * Executes intra-chain rebalancing strategies
 */

import { ViemWalletProvider } from "@coinbase/agentkit";
import { Address, encodeFunctionData, parseUnits } from "viem";
import { getSuperchainConfig } from "../superchain.js";

// NexusDelegation contract ABI (subset)
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
] as const;

export interface AggregatorOpportunity {
  chain: string;
  token: string;
  sourceProtocol: "Aave V3" | "Compound V3" | "Moonwell";
  targetProtocol: "Aave V3" | "Compound V3" | "Moonwell";
  amount: string;
  minApyDelta: number;
}

export class AggregatorExecutor {
  private walletProvider: ViemWalletProvider;
  private userEOA: Address;

  constructor(walletProvider: ViemWalletProvider, userEOA: Address) {
    this.walletProvider = walletProvider;
    this.userEOA = userEOA;
  }

  /**
   * Execute an intra-chain rebalance
   */
  async executeRebalance(
    opportunity: AggregatorOpportunity
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log(`\n🔄 Executing Rebalance on ${opportunity.chain}:`);
      console.log(`   Protocol: ${opportunity.sourceProtocol} -> ${opportunity.targetProtocol}`);
      console.log(`   Amount: ${opportunity.amount} ${opportunity.token}`);

      const config = getSuperchainConfig();
      // Simple lookup for demo; in prod use robust config map
      const chainConfig = Object.values(config).find(
        (c) => c.label.toLowerCase() === opportunity.chain.toLowerCase()
      );

      if (!chainConfig) throw new Error(`Unsupported chain: ${opportunity.chain}`);

      const decimals = chainConfig.contracts.tokenDecimals;
      const parsedAmount = parseUnits(opportunity.amount, decimals);
      const tokenAddress = chainConfig.contracts.superchainErc20;

      // 1. Withdraw from Source
      // NOTE: In a real system, we'd need protocol-specific adapters.
      // For this MVP, we assume they all share a similar interface or we use the mock interface.
      const withdrawData = this.encodeWithdraw(
        opportunity.sourceProtocol,
        tokenAddress,
        parsedAmount
      );
      
      const sourceAddress = this.getProtocolAddress(chainConfig, opportunity.sourceProtocol);
      if (!sourceAddress) throw new Error(`Unknown address for ${opportunity.sourceProtocol}`);

      // 2. Deposit to Target
      const depositData = this.encodeDeposit(
        opportunity.targetProtocol,
        tokenAddress,
        parsedAmount
      );
      
      const targetAddress = this.getProtocolAddress(chainConfig, opportunity.targetProtocol);
      if (!targetAddress) throw new Error(`Unknown address for ${opportunity.targetProtocol}`);

      // 3. Batch Transaction via NexusDelegation
      // We can use executeBatch if available, or just chain executeIntent call via a multicall.
      // For MVP, we'll do two separate intents or assume NexusDelegation has batch support.
      // Let's assume we do 2 separate calls for simplicity in this demo class, 
      // OR update NexusDelegation to support batching (which we did in Week 1!).

      // Let's assume we use executeBatch from NexusDelegation
      const BATCH_ABI = [
        {
          name: "executeBatch",
          type: "function",
          inputs: [
            { name: "_targets", type: "address[]" },
            { name: "_datas", type: "bytes[]" },
            { name: "_values", type: "uint256[]" }
          ],
          outputs: []
        }
      ] as const;

      const data = encodeFunctionData({
        abi: BATCH_ABI,
        functionName: "executeBatch",
        args: [
          [sourceAddress, targetAddress],
          [withdrawData, depositData],
          [0n, 0n]
        ]
      });

      const hash = await this.walletProvider.sendTransaction({
        to: this.userEOA,
        data,
        value: 0n,
      });

      console.log(`   ✅ Rebalance TX: ${hash}`);
      return { success: true, txHash: hash };

    } catch (error) {
      console.error("Rebalance failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private getProtocolAddress(config: any, protocol: string): Address | undefined {
    // Mapping purely for the demo environment using the mocks/real addresses in config
    if (protocol === "Aave V3") return config.contracts.aavePool;
    if (protocol === "Compound V3") return config.contracts.compoundComet;
    // For Moonwell, we'd add it to config, but for now fallback to Comet for demo
    if (protocol === "Moonwell") return config.contracts.compoundComet; 
    return undefined;
  }

  private encodeWithdraw(protocol: string, asset: Address, amount: bigint): `0x${string}` {
    if (protocol === "Aave V3") {
      return encodeFunctionData({
        abi: [{
          name: "withdraw",
          type: "function",
          inputs: [
            { name: "asset", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "to", type: "address" },
          ],
          outputs: [{ type: "uint256" }],
        }],
        functionName: "withdraw",
        args: [asset, amount, this.userEOA],
      });
    } else {
      // Compound / Moonwell style
      return encodeFunctionData({
        abi: [{
          name: "withdraw",
          type: "function",
          inputs: [
            { name: "asset", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [],
        }],
        functionName: "withdraw",
        args: [asset, amount],
      });
    }
  }

  private encodeDeposit(protocol: string, asset: Address, amount: bigint): `0x${string}` {
    if (protocol === "Aave V3") {
      return encodeFunctionData({
        abi: [{
          name: "supply",
          type: "function",
          inputs: [
            { name: "asset", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "onBehalfOf", type: "address" },
            { name: "referralCode", type: "uint16" },
          ],
          outputs: [],
        }],
        functionName: "supply",
        args: [asset, amount, this.userEOA, 0],
      });
    } else {
      // Compound / Moonwell style
      return encodeFunctionData({
        abi: [{
          name: "supply",
          type: "function",
          inputs: [
            { name: "asset", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [],
        }],
        functionName: "supply",
        args: [asset, amount],
      });
    }
  }
}
