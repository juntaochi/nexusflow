/**
 * Arbitrage Executor
 * Autonomously executes cross-chain yield opportunities
 */

import { ViemWalletProvider } from "@coinbase/agentkit";
import { Address, encodeFunctionData, parseEther } from "viem";
import { DeFiMonitor } from "../cron/monitor";

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

// Chain IDs
const CHAIN_IDS: Record<string, number> = {
  Base: 8453,
  Optimism: 10,
  "base-sepolia": 84532,
  "optimism-sepolia": 11155420,
};

// Protocol addresses (update with actual addresses)
const PROTOCOL_ADDRESSES: Record<string, Record<string, Address>> = {
  Base: {
    aave: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5" as Address,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  },
  Optimism: {
    aave: "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as Address,
    usdc: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607" as Address,
  },
  "base-sepolia": {
    aave: "0x0000000000000000000000000000000000000001" as Address,
    usdc: "0x0000000000000000000000000000000000000002" as Address,
  },
  "optimism-sepolia": {
    aave: "0x0000000000000000000000000000000000000003" as Address,
    usdc: "0x0000000000000000000000000000000000000004" as Address,
  },
};

interface ArbitrageOpportunity {
  type: "ARBITRAGE";
  sourceChain: string;
  targetChain: string;
  token: string;
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
          const result = await this.executeArbitrage(opportunities[0]);
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
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const addresses = PROTOCOL_ADDRESSES[chain];
      if (!addresses) {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      // Build withdraw calldata (Aave withdraw)
      const withdrawData = encodeFunctionData({
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
        args: [addresses.usdc, parseEther(amount), this.userEOA],
      });

      // Execute via NexusDelegation
      const client = this.walletProvider.getWalletClient();
      const hash = await client.writeContract({
        address: this.userEOA,
        abi: NEXUS_DELEGATION_ABI,
        functionName: "executeIntent",
        args: [addresses.aave, withdrawData],
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
      const sourceAddresses = PROTOCOL_ADDRESSES[sourceChain];
      const targetChainId = CHAIN_IDS[targetChain];

      if (!sourceAddresses || !targetChainId) {
        throw new Error(`Invalid chain config: ${sourceChain} -> ${targetChain}`);
      }

      // Build cross-chain bridge calldata
      const bridgeData = encodeFunctionData({
        abi: [
          {
            name: "crosschainBurn",
            type: "function",
            inputs: [
              { name: "amount", type: "uint256" },
              { name: "toChainId", type: "uint256" },
              { name: "recipient", type: "address" },
            ],
            outputs: [],
          },
        ],
        functionName: "crosschainBurn",
        args: [parseEther(amount), BigInt(targetChainId), this.userEOA],
      });

      // Execute via NexusDelegation.sendCrossChainIntent
      const client = this.walletProvider.getWalletClient();
      const hash = await client.writeContract({
        address: this.userEOA,
        abi: NEXUS_DELEGATION_ABI,
        functionName: "sendCrossChainIntent",
        args: [BigInt(targetChainId), sourceAddresses.usdc, bridgeData],
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
    amount: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const addresses = PROTOCOL_ADDRESSES[chain];
      if (!addresses) {
        throw new Error(`Unsupported chain: ${chain}`);
      }

      // Build deposit calldata (Aave supply)
      const depositData = encodeFunctionData({
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
        args: [addresses.usdc, parseEther(amount), this.userEOA, 0],
      });

      // Execute via NexusDelegation
      const client = this.walletProvider.getWalletClient();
      const hash = await client.writeContract({
        address: this.userEOA,
        abi: NEXUS_DELEGATION_ABI,
        functionName: "executeIntent",
        args: [addresses.aave, depositData],
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
