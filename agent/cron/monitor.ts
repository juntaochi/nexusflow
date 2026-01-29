import {
  createPublicClient,
  http,
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
} from "viem";
import { baseSepolia, optimismSepolia } from "viem/chains";
import type { ArbitrageOpportunity } from "../executor/arbitrage.js";
import { getSuperchainConfig } from "../superchain.js";

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

const toAaveApy = (liquidityRate: bigint): number =>
  Number(liquidityRate) / RAY;

const toCompoundApy = (supplyRatePerSecond: bigint): number =>
  (Number(supplyRatePerSecond) / 1e18) * SECONDS_PER_YEAR;

type AnyPublicClient = PublicClient<Transport, Chain>;

const createClient = (rpcUrl: string, chainKey: "base" | "op") =>
  createPublicClient({
    chain: chainKey === "base" ? baseSepolia : optimismSepolia,
    transport: http(rpcUrl),
  }) as AnyPublicClient;

export class DeFiMonitor {
  static async getOpportunities(): Promise<ArbitrageOpportunity[]> {
    try {
      const config = getSuperchainConfig();
      const base = config["base-sepolia"];
      const op = config["op-sepolia"];

      const baseClient = createClient(base.rpcUrl, "base");
      const opClient = createClient(op.rpcUrl, "op");

      const [
        baseAave,
        opAave,
        baseCompound,
        opCompound,
      ] = await Promise.all([
        this.getAaveApy(baseClient, base.contracts.aavePool, base.contracts.superchainErc20),
        this.getAaveApy(opClient, op.contracts.aavePool, op.contracts.superchainErc20),
        this.getCompoundApy(baseClient, base.contracts.compoundComet),
        this.getCompoundApy(opClient, op.contracts.compoundComet),
      ]);

      const snapshots = [
        {
          name: "Aave V3",
          protocol: "Aave V3" as const,
          chain: base.label,
          token: "SuperchainERC20",
          apy: baseAave,
        },
        {
          name: "Aave V3",
          protocol: "Aave V3" as const,
          chain: op.label,
          token: "SuperchainERC20",
          apy: opAave,
        },
        {
          name: "Compound V3",
          protocol: "Compound V3" as const,
          chain: base.label,
          token: "SuperchainERC20",
          apy: baseCompound,
        },
        {
          name: "Compound V3",
          protocol: "Compound V3" as const,
          chain: op.label,
          token: "SuperchainERC20",
          apy: opCompound,
        },
      ];

      const bestBase = snapshots
        .filter((item) => item.chain === base.label)
        .sort((a, b) => b.apy - a.apy)[0];
      const bestOp = snapshots
        .filter((item) => item.chain === op.label)
        .sort((a, b) => b.apy - a.apy)[0];

      if (!bestBase || !bestOp) return [];

      const spread = Math.abs(bestBase.apy - bestOp.apy);
      if (spread <= 0.0005) return [];

      const source = bestBase.apy > bestOp.apy ? bestOp : bestBase;
      const target = bestBase.apy > bestOp.apy ? bestBase : bestOp;

      return [
        {
          type: "ARBITRAGE" as const,
          sourceChain: source.chain,
          targetChain: target.chain,
          token: source.token,
          sourceProtocol: source.protocol,
          targetProtocol: target.protocol,
          sourceApy: source.apy,
          targetApy: target.apy,
          spread,
          description: `Move ${source.token} from ${source.chain} (${(source.apy * 100).toFixed(2)}%) to ${target.chain} (${(target.apy * 100).toFixed(2)}%)`,
        },
      ];
    } catch (error) {
      console.error("DeFiMonitor error:", error);
      return [];
    }
  }

  private static async getAaveApy(
    client: AnyPublicClient,
    pool: Address,
    asset: Address
  ): Promise<number> {
    try {
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
    } catch (error) {
      console.warn("Aave rate read failed", error);
      return 0;
    }
  }

  private static async getCompoundApy(
    client: AnyPublicClient,
    comet: Address
  ): Promise<number> {
    try {
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
    } catch (error) {
      console.warn("Compound rate read failed", error);
      return 0;
    }
  }
}
