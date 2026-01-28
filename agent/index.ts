import "reflect-metadata";
import { AgentKit, ViemWalletProvider } from "@coinbase/agentkit";
import { nexusActionProvider } from "./actions";
import { x402NexusActionProvider } from "./x402/actions";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph";
import * as readline from "readline";

/**
 * Initializes the NexusFlow Agent with 2026 Standards.
 */
export async function initializeAgent() {
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY environment variable is required.");
  }

  const account = privateKeyToAccount(privateKey);

  const client = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  // Type cast to bypass Viem version mismatch between AgentKit and local project
  const walletProvider = new ViemWalletProvider(client as any);

  const agentKit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      nexusActionProvider(),
      x402NexusActionProvider(0.50),
    ],
  });

  const tools = agentKit.getTools();
  const memory = new MemorySaver();
  const llm = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
  });

  console.log("NexusFlow Agent initialized with ERC-8004 Identity + x402 Payment Capabilities.");
  return { agent, config: { configurable: { thread_id: "NexusFlow CLI" } } };
}

/**
 * Run a simple CLI loop for the agent
 */
async function runCLI() {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("WARNING: OPENAI_API_KEY is not set. Intent parsing will fail.");
  }

  const { agent, config } = await initializeAgent();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n--- NexusFlow Agent CLI ---");
  console.log("Type your intent (e.g., 'Swap 0.1 ETH for USDC') or 'exit' to quit.\n");

  const ask = () => {
    rl.question("> ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      try {
        const stream = await agent.stream(
          { messages: [{ role: "user", content: input }] },
          config
        );

        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log("\n[Agent]:", chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log("\n[Tool Call]:", chunk.tools.messages[0].content);
          }
        }
      } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
      }
      ask();
    });
  };

  ask();
}

// Run CLI if script is executed directly
if (require.main === module) {
  runCLI().catch(console.error);
}
