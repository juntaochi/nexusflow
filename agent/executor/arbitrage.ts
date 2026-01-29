/**
 * Arbitrage Executor
 * Autonomously executes cross-chain yield opportunities
 */

import { ViemWalletProvider } from "@coinbase/agentkit";
import { Address, encodeFunctionData, parseUnits } from "viem";
import { DeFiMonitor } from "../cron/monitor";
import { getSuperchainConfig } from "../superchain.js";

// NexusDelegation contract ABI
const NEXUS_DELEGATION_ABI = [
  {
    name: "sendCrossChainIntent",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_destinationChainId", type: "uint256" },
      { name: "_target", type: "address" },
      { name: "_data", type: "bytes" },
    ],
    outputs: [],
  },
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

const resolveChainConfig = (label: string) => {
  const config = getSuperchainConfig();
  const match = Object.values(config).find(
    (chain) => chain.label.toLowerCase() === label.toLowerCase()
  );

  if (!match) {
    throw new Error(`Unsupported chain label: ${label}`);
  }

  return match;
};

export interface ArbitrageOpportunity {
  type: "ARBITRAGE";
  sourceChain: string;
  targetChain: string;
  token: string;
  sourceProtocol: "Aave V3" | "Compound V3";
  targetProtocol: "Aave V3" | "Compound V3";
  sourceApy: number;
  targetApy: number;
  spread: number;
  description: string;
}

interface ExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  opportunity: ArbitrageOpportunity;
  estimatedProfit?: string;
}

export class ArbitrageExecutor {
  private walletProvider: ViemWalletProvider;
  private userEOA: Address;
  private isExecuting: boolean = false;

  constructor(walletProvider: ViemWalletProvider, userEOA: Address) {
    this.walletProvider = walletProvider;
    this.userEOA = userEOA;
  }

  /**
   * Main execution loop - monitors and executes arbitrage
   */
  async runAutonomous(intervalMs: number = 30000) {
    console.log("🤖 Arbitrage Executor: Starting autonomous mode");
    console.log(`   User EOA: ${this.userEOA}`);
    console.log(`   Interval: ${intervalMs}ms`);

    setInterval(async () => {
      if (this.isExecuting) {
        console.log("⏳ Execution in progress, skipping...");
        return;
      }

      try {
        const opportunities = await DeFiMonitor.getOpportunities();

        if (opportunities.length > 0) {
          console.log(`\n💡 Found ${opportunities.length} opportunities:`);
          opportunities.forEach((opp) => {
            console.log(`   ${opp.description} (Spread: ${(opp.spread * 100).toFixed(2)}%)`);
          });

          // Execute best opportunity
          const result = await this.executeArbitrage(opportunities[0] as ArbitrageOpportunity);
          if (result.success) {
            console.log(`✅ Arbitrage executed: ${result.txHash}`);
          } else {
            console.error(`❌ Execution failed: ${result.error}`);
          }
        } else {
          console.log("📊 No arbitrage opportunities found");
        }
      } catch (error) {
        console.error("Error in autonomous loop:", error);
      }
    }, intervalMs);
  }

  /**
   * Execute a single arbitrage opportunity
   */
  async executeArbitrage(
    opportunity: ArbitrageOpportunity
  ): Promise<ExecutionResult> {
    this.isExecuting = true;

    try {
      console.log(`\n🎯 Executing arbitrage:`);
      console.log(`   From: ${opportunity.sourceChain} (${(opportunity.sourceApy * 100).toFixed(2)}%)`);
      console.log(`   To: ${opportunity.targetChain} (${(opportunity.targetApy * 100).toFixed(2)}%)`);

      // Step 1: Withdraw from source protocol
      const withdrawResult = await this.withdrawFromProtocol(
        opportunity.sourceChain,
        opportunity.sourceProtocol,
        "0.1" // Demo amount
      );

      if (!withdrawResult.success) {
        return {
          success: false,
          error: `Withdraw failed: ${withdrawResult.error}`,
          opportunity,
        };
      }

      console.log(`   ✓ Withdrew from ${opportunity.sourceChain}`);

      // Step 2: Cross-chain transfer
      const bridgeResult = await this.bridgeTokens(
        opportunity.sourceChain,
        opportunity.targetChain,
        "0.1"
      );

      if (!bridgeResult.success) {
        return {
          success: false,
          error: `Bridge failed: ${bridgeResult.error}`,
          opportunity,
        };
      }

      console.log(`   ✓ Bridged to ${opportunity.targetChain}`);

      // Step 3: Deposit to target protocol
      const depositResult = await this.depositToProtocol(
        opportunity.targetChain,
        opportunity.targetProtocol,
        "0.1"
      );

      if (!depositResult.success) {
        return {
          success: false,
          error: `Deposit failed: ${depositResult.error}`,
          opportunity,
        };
      }

      console.log(`   ✓ Deposited to ${opportunity.targetChain}`);

      return {
        success: true,
        txHash: depositResult.txHash,
        opportunity,
        estimatedProfit: `${(opportunity.spread * 100).toFixed(2)}% APY gain`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        opportunity,
      };
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Withdraw from lending protocol
   */
  private async withdrawFromProtocol(
    chain: string,
    protocol: "Aave V3" | "Compound V3",
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const chainConfig = resolveChainConfig(chain);
      const { contracts } = chainConfig;
      const parsedAmount = parseUnits(amount, contracts.tokenDecimals);

      const targetContract =
        protocol === "Aave V3" ? contracts.aavePool : contracts.compoundComet;
      const withdrawData =
        protocol === "Aave V3"
          ? encodeFunctionData({
              abi: [
                {
                  name: "withdraw",
                  type: "function",
                  inputs: [
                    { name: "asset", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "to", type: "address" },
                  ],
                  outputs: [{ type: "uint256" }],
                },
              ],
              functionName: "withdraw",
              args: [contracts.superchainErc20, parsedAmount, this.userEOA],
            })
          : encodeFunctionData({
              abi: [
                {
                  name: "withdraw",
                  type: "function",
                  inputs: [
                    { name: "asset", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                  outputs: [],
                },
              ],
              functionName: "withdraw",
              args: [contracts.superchainErc20, parsedAmount],
            });

      // Execute via NexusDelegation
      const data = encodeFunctionData({
        abi: NEXUS_DELEGATION_ABI,
        functionName: "executeIntent",
        args: [targetContract, withdrawData],
      });

      const hash = await this.walletProvider.sendTransaction({
        to: this.userEOA,
        data,
        value: 0n,
      });

      return { success: true, txHash: hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Withdraw failed",
      };
    }
  }

  /**
   * Bridge tokens via Superchain Interop
   */
  private async bridgeTokens(
    sourceChain: string,
    targetChain: string,
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const source = resolveChainConfig(sourceChain);
      const destination = resolveChainConfig(targetChain);

      const parsedAmount = parseUnits(amount, source.contracts.tokenDecimals);

      const bridgeData = encodeFunctionData({
        abi: [
          {
            name: "bridge",
            type: "function",
            inputs: [
              { name: "_token", type: "address" },
              { name: "_to", type: "address" },
              { name: "_amount", type: "uint256" },
              { name: "_destinationChainId", type: "uint256" },
            ],
            outputs: [],
          },
        ],
        functionName: "bridge",
        args: [
          source.contracts.superchainErc20,
          this.userEOA,
          parsedAmount,
          BigInt(destination.chainId),
        ],
      });

      const data = encodeFunctionData({
        abi: NEXUS_DELEGATION_ABI,
        functionName: "executeIntent",
        args: [source.contracts.crosschainBridge, bridgeData],
      });

      const hash = await this.walletProvider.sendTransaction({
        to: this.userEOA,
        data,
        value: 0n,
      });

      return { success: true, txHash: hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Bridge failed",
      };
    }
  }

  /**
   * Deposit to lending protocol
   */
  private async depositToProtocol(
    chain: string,
    protocol: "Aave V3" | "Compound V3",
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const chainConfig = resolveChainConfig(chain);
      const { contracts } = chainConfig;
      const parsedAmount = parseUnits(amount, contracts.tokenDecimals);

      const targetContract =
        protocol === "Aave V3" ? contracts.aavePool : contracts.compoundComet;

      const depositData =
        protocol === "Aave V3"
          ? encodeFunctionData({
              abi: [
                {
                  name: "supply",
                  type: "function",
                  inputs: [
                    { name: "asset", type: "address" },
                    { name: "amount", type: "uint256" },
                    { name: "onBehalfOf", type: "address" },
                    { name: "referralCode", type: "uint16" },
                  ],
                  outputs: [],
                },
              ],
              functionName: "supply",
              args: [contracts.superchainErc20, parsedAmount, this.userEOA, 0],
            })
          : encodeFunctionData({
              abi: [
                {
                  name: "supply",
                  type: "function",
                  inputs: [
                    { name: "asset", type: "address" },
                    { name: "amount", type: "uint256" },
                  ],
                  outputs: [],
                },
              ],
              functionName: "supply",
              args: [contracts.superchainErc20, parsedAmount],
            });

      // Execute via NexusDelegation
      const data = encodeFunctionData({
        abi: NEXUS_DELEGATION_ABI,
        functionName: "executeIntent",
        args: [targetContract, depositData],
      });

      const hash = await this.walletProvider.sendTransaction({
        to: this.userEOA,
        data,
        value: 0n,
      });

      return { success: true, txHash: hash };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Deposit failed",
      };
    }
  }

  /**
   * Get current execution status
   */
  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}
