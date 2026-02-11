import { createPublicClient, http, type Address } from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";

export interface Opportunity {
  type: string;
  asset: string;
  sourceChain: string;
  targetChain: string;
  sourceRate: number;
  targetRate: number;
  spread: number;
  sourceProtocol?: "Aave V3" | "Compound V3";
  targetProtocol?: "Aave V3" | "Compound V3";
  description: string;
}

const AAVE_POOL_ABI = [
  {
    name: "getReserveData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        name: "data",
        type: "tuple",
        components: [
          { name: "configuration", type: "uint256" },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
      },
    ],
  },
] as const;

const COMET_ABI = [
  {
    name: "getUtilization",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getSupplyRate",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "utilization", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const RAY = 1e27;
const SECONDS_PER_YEAR = 60 * 60 * 24 * 365;

const readEnv = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
};

const toAaveApy = (liquidityRate: bigint): number =>
  Number(liquidityRate) / RAY;

const toCompoundApy = (supplyRatePerSecond: bigint): number =>
  (Number(supplyRatePerSecond) / 1e18) * SECONDS_PER_YEAR;

const createClient = (rpcUrl: string, chainKey: "base" | "op") =>
  createPublicClient({
    chain: chainKey === "base" ? baseSepolia : optimismSepolia,
    transport: http(rpcUrl),
  });

const getOnchainConfig = () => {
  const baseRpc = readEnv(["BASE_SEPOLIA_RPC", "BASE_SEPOLIA_RPC_URL"]);
  const opRpc = readEnv(["OP_SEPOLIA_RPC", "OP_SEPOLIA_RPC_URL"]);

  const baseAave = readEnv(["AAVE_POOL_BASE_SEPOLIA", "NEXT_PUBLIC_AAVE_POOL_BASE_SEPOLIA"]);
  const opAave = readEnv(["AAVE_POOL_OP_SEPOLIA", "NEXT_PUBLIC_AAVE_POOL_OP_SEPOLIA"]);
  const baseComet = readEnv([
    "COMPOUND_COMET_BASE_SEPOLIA",
    "NEXT_PUBLIC_COMPOUND_COMET_BASE_SEPOLIA",
  ]);
  const opComet = readEnv([
    "COMPOUND_COMET_OP_SEPOLIA",
    "NEXT_PUBLIC_COMPOUND_COMET_OP_SEPOLIA",
  ]);
  const baseToken = readEnv([
    "SUPERCHAIN_ERC20_BASE_SEPOLIA",
    "NEXT_PUBLIC_SUPERCHAIN_ERC20_BASE_SEPOLIA",
  ]);
  const opToken = readEnv([
    "SUPERCHAIN_ERC20_OP_SEPOLIA",
    "NEXT_PUBLIC_SUPERCHAIN_ERC20_OP_SEPOLIA",
  ]);

  if (!baseRpc || !opRpc || !baseAave || !opAave || !baseComet || !opComet || !baseToken || !opToken) {
    return null;
  }

  return {
    base: {
      rpc: baseRpc,
      aavePool: baseAave as Address,
      comet: baseComet as Address,
      token: baseToken as Address,
    },
    op: {
      rpc: opRpc,
      aavePool: opAave as Address,
      comet: opComet as Address,
      token: opToken as Address,
    },
  };
};

const readAaveApy = async (
  client: ReturnType<typeof createClient>,
  pool: Address,
  asset: Address
) => {
  const data = await client.readContract({
    address: pool,
    abi: AAVE_POOL_ABI,
    functionName: "getReserveData",
    args: [asset],
  });
  const liquidityRate = Array.isArray(data)
    ? (data[2] as bigint)
    : ((data as { currentLiquidityRate?: bigint }).currentLiquidityRate ?? 0n);
  return toAaveApy(liquidityRate);
};

const readCompoundApy = async (
  client: ReturnType<typeof createClient>,
  comet: Address
) => {
  const utilization = await client.readContract({
    address: comet,
    abi: COMET_ABI,
    functionName: "getUtilization",
  });
  const supplyRate = await client.readContract({
    address: comet,
    abi: COMET_ABI,
    functionName: "getSupplyRate",
    args: [utilization as bigint],
  });
  return toCompoundApy(supplyRate as bigint);
};

export class DeFiMonitor {
  private static readonly FALLBACK_PROVIDERS = [
    { name: "Aave V3", chain: "Base Sepolia", token: "SuperchainERC20", baseApy: 0.032 },
    { name: "Aave V3", chain: "OP Sepolia", token: "SuperchainERC20", baseApy: 0.034 },
    { name: "Compound V3", chain: "Base Sepolia", token: "SuperchainERC20", baseApy: 0.028 },
    { name: "Compound V3", chain: "OP Sepolia", token: "SuperchainERC20", baseApy: 0.029 },
  ];

  static async getOpportunities(): Promise<Opportunity[]> {
    const config = getOnchainConfig();

    if (!config) {
      return this.getFallbackOpportunities();
    }

    try {
      const baseClient = createClient(config.base.rpc, "base");
      const opClient = createClient(config.op.rpc, "op");

      const [baseAave, opAave, baseCompound, opCompound] = await Promise.all([
        readAaveApy(baseClient, config.base.aavePool, config.base.token),
        readAaveApy(opClient, config.op.aavePool, config.op.token),
        readCompoundApy(baseClient, config.base.comet),
        readCompoundApy(opClient, config.op.comet),
      ]);

      const snapshots = [
        { protocol: "Aave V3" as const, chain: "Base Sepolia", token: "SuperchainERC20", apy: baseAave },
        { protocol: "Aave V3" as const, chain: "OP Sepolia", token: "SuperchainERC20", apy: opAave },
        { protocol: "Compound V3" as const, chain: "Base Sepolia", token: "SuperchainERC20", apy: baseCompound },
        { protocol: "Compound V3" as const, chain: "OP Sepolia", token: "SuperchainERC20", apy: opCompound },
      ];

      return this.buildOpportunities(snapshots);
    } catch (error) {
      console.error("On-chain monitor failed, using fallback:", error);
      return this.getFallbackOpportunities();
    }
  }

  private static buildOpportunities(
    snapshots: Array<{ protocol: "Aave V3" | "Compound V3"; chain: string; token: string; apy: number }>
  ): Opportunity[] {
    const bestBase = snapshots.filter((o) => o.chain === "Base Sepolia").sort((a, b) => b.apy - a.apy)[0];
    const bestOp = snapshots.filter((o) => o.chain === "OP Sepolia").sort((a, b) => b.apy - a.apy)[0];

    if (!bestBase || !bestOp) return [];

    const spread = Math.abs(bestBase.apy - bestOp.apy);
    if (spread <= 0.0005) return [];

    const source = bestBase.apy > bestOp.apy ? bestOp : bestBase;
    const target = bestBase.apy > bestOp.apy ? bestBase : bestOp;

    return [
      {
        type: "ARBITRAGE",
        asset: source.token,
        sourceChain: source.chain,
        targetChain: target.chain,
        sourceRate: source.apy,
        targetRate: target.apy,
        spread,
        sourceProtocol: source.protocol,
        targetProtocol: target.protocol,
        description: `Move ${source.token} from ${source.chain} (${(source.apy * 100).toFixed(2)}%) to ${target.chain} (${(target.apy * 100).toFixed(2)}%)`,
      },
    ];
  }

  private static getFallbackOpportunities(): Opportunity[] {
    const opportunities = this.FALLBACK_PROVIDERS.map((p) => ({
      ...p,
      apy: p.baseApy + Math.random() * 0.05,
      protocol: p.name as "Aave V3" | "Compound V3",
    }));

    return this.buildOpportunities(opportunities);
  }
}

export const getCrossChainOpportunities = async (): Promise<Opportunity[]> =>
  DeFiMonitor.getOpportunities();
