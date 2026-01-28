/**
 * Cron Job Entry Point
 * Wires arbitrage monitor to executor
 */

import { DeFiMonitor } from "./monitor";
import { ArbitrageExecutor } from "../executor/arbitrage";
import { AgentKit, ViemWalletProvider } from "@coinbase/agentkit";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { Address } from "viem";

const MONITOR_INTERVAL = 30000; // 30 seconds
const USER_EOA_ADDRESS = (process.env.USER_EOA_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;

/**
 * Start autonomous arbitrage monitoring and execution
 */
export async function startArbitrageService() {
  console.log("🚀 NexusFlow Arbitrage Service Starting...");
  console.log(`   Monitor Interval: ${MONITOR_INTERVAL}ms`);
  console.log(`   Target EOA: ${USER_EOA_ADDRESS}`);

  // Initialize agent wallet
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY not set");
  }

  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  const walletProvider = new ViemWalletProvider(client as any);

  // Initialize executor
  const executor = new ArbitrageExecutor(walletProvider, USER_EOA_ADDRESS);

  // Run monitoring loop
  await executor.runAutonomous(MONITOR_INTERVAL);

  console.log("✅ Arbitrage service is now running");
}

/**
 * One-time arbitrage check (for testing)
 */
export async function checkArbitrageOnce() {
  console.log("🔍 Checking for arbitrage opportunities...\n");

  const opportunities = await DeFiMonitor.getOpportunities();

  if (opportunities.length === 0) {
    console.log("📊 No arbitrage opportunities found");
    return;
  }

  console.log(`💡 Found ${opportunities.length} opportunities:\n`);
  opportunities.forEach((opp, index) => {
    console.log(`${index + 1}. ${opp.description}`);
    console.log(`   Source: ${opp.sourceChain} @ ${(opp.sourceApy * 100).toFixed(2)}%`);
    console.log(`   Target: ${opp.targetChain} @ ${(opp.targetApy * 100).toFixed(2)}%`);
    console.log(`   Spread: ${(opp.spread * 100).toFixed(2)}%`);
    console.log(`   Token: ${opp.token}\n`);
  });
}

// CLI mode
if (require.main === module) {
  const mode = process.argv[2];

  if (mode === "start") {
    startArbitrageService().catch(console.error);
  } else if (mode === "check") {
    checkArbitrageOnce().catch(console.error);
  } else {
    console.log("Usage:");
    console.log("  npm run cron:start  - Start continuous monitoring");
    console.log("  npm run cron:check  - One-time check");
  }
}
