/**
 * x402 Server Helpers for NexusFlow
 * Implements Coinbase x402 resource server flows for Next.js routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import type { Hex } from "viem";
import { base, baseSepolia } from "viem/chains";

export type X402NetworkId = "eip155:8453" | "eip155:84532";

export interface X402Config {
  payTo: Hex;
  network: X402NetworkId;
  priceUsd: string; // e.g. "0.001"
  description: string;
  mimeType?: string;
}

export interface X402SubscriptionConfig extends X402Config {
  type: "subscription";
  durationDays: number;
}

export interface X402PaymentRequirement {
  scheme: "exact";
  network: string;
  payTo: string;
  price: string;
}

export interface X402SubscriptionRequirement extends X402PaymentRequirement {
  duration: number; // Duration in seconds
}

const NETWORK_METADATA: Record<X402NetworkId, { name: string; chainId: number; usdc: Hex }> = {
  "eip155:8453": {
    name: "base",
    chainId: base.id,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  "eip155:84532": {
    name: "base-sepolia",
    chainId: baseSepolia.id,
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
};

const facilitatorUrl =
  process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";

const resourceServer = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: facilitatorUrl })
).register("eip155:*", new ExactEvmScheme());

let initializePromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!initializePromise) {
    initializePromise = resourceServer.initialize();
  }
  await initializePromise;
}

export const formatX402Price = (priceUsd: string): string => {
  const trimmed = priceUsd.trim();
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
};

export const buildX402Requirement = (
  config: X402Config
): X402PaymentRequirement => ({
  scheme: "exact",
  network: config.network,
  payTo: config.payTo,
  price: formatX402Price(config.priceUsd),
});

export const buildX402SubscriptionRequirement = (
  config: X402SubscriptionConfig
): X402SubscriptionRequirement => ({
  scheme: "exact",
  network: config.network,
  payTo: config.payTo,
  price: formatX402Price(config.priceUsd),
  duration: config.durationDays * 24 * 60 * 60,
});

export const encodeBase64Json = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString("base64");

export const decodeBase64Json = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, "base64").toString("utf-8")) as T;

const getPaymentHeader = (request: NextRequest): string | null =>
  request.headers.get("payment-signature") ?? request.headers.get("x-payment");

export async function verifyX402Payment(
  request: NextRequest,
  config: X402Config
): Promise<
  | { ok: false; response: NextResponse }
  | {
      ok: true;
      settlement: unknown;
      paymentPayload: unknown;
      requirement: X402PaymentRequirement;
    }
> {
  await ensureInitialized();

  const requirement = buildX402Requirement(config);
  const paymentHeader = getPaymentHeader(request);

  if (!paymentHeader) {
    const paymentRequired = resourceServer.createPaymentRequiredResponse(
      [requirement],
      {
        url: request.url,
        description: config.description,
        mimeType: config.mimeType ?? "application/json",
      }
    );

    return {
      ok: false,
      response: new NextResponse(
        JSON.stringify({
          error: "Payment Required",
          message: "This endpoint requires payment",
        }),
        {
          status: 402,
          headers: {
            "Content-Type": "application/json",
            "PAYMENT-REQUIRED": encodeBase64Json(paymentRequired),
          },
        }
      ),
    };
  }

  let paymentPayload: unknown;
  try {
    paymentPayload = decodeBase64Json(paymentHeader);
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid Payment", reason: "Malformed payment payload" },
        { status: 402 }
      ),
    };
  }

  const verifyResult = await resourceServer.verifyPayment(
    paymentPayload,
    requirement
  );

  if (!verifyResult.isValid) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid Payment", reason: verifyResult.invalidReason },
        { status: 402 }
      ),
    };
  }

  const settlement = await resourceServer.settlePayment(
    paymentPayload,
    requirement
  );

  return { ok: true, settlement, paymentPayload, requirement };
}

export function withPaymentResponseHeader(
  response: Response,
  settlement: unknown
): Response {
  const headers = new Headers(response.headers);
  headers.set("PAYMENT-RESPONSE", encodeBase64Json(settlement));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function createPaymentInfo(config: X402Config): {
  payTo: string;
  asset: "USDC";
  network: string;
  networkId: string;
  chainId: number;
  tokenAddress: string;
  priceUsd: string;
} {
  const network = NETWORK_METADATA[config.network];

  return {
    payTo: config.payTo,
    asset: "USDC",
    network: network.name,
    networkId: config.network,
    chainId: network.chainId,
    tokenAddress: network.usdc,
    priceUsd: config.priceUsd,
  };
}
