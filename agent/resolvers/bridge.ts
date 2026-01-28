import { encodeFunctionData, type Hex, type Address } from "viem";
import { BridgeIntent, BASE_TOKENS } from "../intents";

// Chain IDs for Superchain
export const CHAIN_IDS = {
  base: 8453,
  optimism: 10,
  baseSepolia: 84532,
  opSepolia: 11155420,
} as const;

// L2ToL2CrossDomainMessenger address (same on all OP Stack chains)
export const L2_TO_L2_MESSENGER = "0x4200000000000000000000000000000000000023" as const;

// SuperchainERC20 bridge interface
const SUPERCHAIN_ERC20_ABI = [
  {
    name: "crosschainBurn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_from", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "crosschainMint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_to", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

// L2ToL2CrossDomainMessenger interface
const L2_MESSENGER_ABI = [
  {
    name: "sendMessage",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_destination", type: "uint256" },
      { name: "_target", type: "address" },
      { name: "_message", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export interface BridgeResult {
  success: boolean;
  burnCalldata?: Hex;
  messageCalldata?: Hex;
  destinationChainId?: number;
  error?: string;
}

/**
 * Get chain ID from name
 */
function getChainId(chainName: string): number {
  const normalized = chainName.toLowerCase().replace(/[^a-z]/g, "");
  const chainId = CHAIN_IDS[normalized as keyof typeof CHAIN_IDS];
  if (!chainId) {
    throw new Error(`Unknown chain: ${chainName}`);
  }
  return chainId;
}

/**
 * Build bridge calldata for SuperchainERC20
 */
export function buildBridgeCalldata(
  intent: BridgeIntent,
  userAddress: Address,
  tokenAddress: Address
): BridgeResult {
  try {
    const destinationChainId = getChainId(intent.toChain);
    const amount = BigInt(parseFloat(intent.amount) * 1e18); // Simplified decimals

    // Step 1: Burn tokens on source chain
    const burnCalldata = encodeFunctionData({
      abi: SUPERCHAIN_ERC20_ABI,
      functionName: "crosschainBurn",
      args: [userAddress, amount],
    });

    // Step 2: Prepare mint message for destination chain
    const mintCalldata = encodeFunctionData({
      abi: SUPERCHAIN_ERC20_ABI,
      functionName: "crosschainMint",
      args: [userAddress, amount],
    });

    // Step 3: Send cross-chain message via L2ToL2CrossDomainMessenger
    const messageCalldata = encodeFunctionData({
      abi: L2_MESSENGER_ABI,
      functionName: "sendMessage",
      args: [BigInt(destinationChainId), tokenAddress, mintCalldata],
    });

    return {
      success: true,
      burnCalldata,
      messageCalldata,
      destinationChainId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format bridge operation for display
 */
export function formatBridgePreview(intent: BridgeIntent): string {
  return `Bridge ${intent.amount} ${intent.token} from ${intent.fromChain} → ${intent.toChain}`;
}

/**
 * Check if bridge is supported between chains
 */
export function isBridgeSupported(fromChain: string, toChain: string): boolean {
  try {
    getChainId(fromChain);
    getChainId(toChain);
    return true;
  } catch {
    return false;
  }
}
