import { encodeFunctionData, type Hex, type Address } from "viem";
import { BridgeIntent, BASE_TOKENS } from "../intents";

export const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  optimism: 10,
  "base-sepolia": 84532,
  "op-sepolia": 11155420,
  basesepolia: 84532,
  opsepolia: 11155420,
  optimismsepolia: 11155420,
} as const;

export const L2_TO_L2_MESSENGER = "0x4200000000000000000000000000000000000023" as const;

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
  sourceTokenAddress?: Address;
  destTokenAddress?: Address;
  error?: string;
}

function getChainId(chainName: string): number {
  const normalized = chainName.toLowerCase().trim();
  if (CHAIN_IDS[normalized]) return CHAIN_IDS[normalized];
  const alphanumeric = normalized.replace(/[^a-z0-9]/g, "");
  if (CHAIN_IDS[alphanumeric]) return CHAIN_IDS[alphanumeric];
  if (normalized.includes("base") && normalized.includes("sepolia")) return 84532;
  if ((normalized.includes("op") || normalized.includes("optimism")) && normalized.includes("sepolia")) return 11155420;
  throw new Error(`Unknown chain: ${chainName}`);
}

export function buildBridgeCalldata(
  intent: BridgeIntent,
  userAddress: Address,
  sourceTokenAddress: Address,
  destTokenAddress: Address
): BridgeResult {
  try {
    const destinationChainId = getChainId(intent.toChain);
    const amount = BigInt(parseFloat(intent.amount) * 1e18);

    const burnCalldata = encodeFunctionData({
      abi: SUPERCHAIN_ERC20_ABI,
      functionName: "crosschainBurn",
      args: [userAddress, amount],
    });

    const mintCalldata = encodeFunctionData({
      abi: SUPERCHAIN_ERC20_ABI,
      functionName: "crosschainMint",
      args: [userAddress, amount],
    });

    const messageCalldata = encodeFunctionData({
      abi: L2_MESSENGER_ABI,
      functionName: "sendMessage",
      args: [BigInt(destinationChainId), destTokenAddress, mintCalldata],
    });

    return {
      success: true,
      burnCalldata,
      messageCalldata,
      destinationChainId,
      sourceTokenAddress,
      destTokenAddress,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function formatBridgePreview(intent: BridgeIntent): string {
  return `Bridge ${intent.amount} ${intent.token} from ${intent.fromChain} → ${intent.toChain}`;
}

export function isBridgeSupported(fromChain: string, toChain: string): boolean {
  try {
    getChainId(fromChain);
    getChainId(toChain);
    return true;
  } catch {
    return false;
  }
}
