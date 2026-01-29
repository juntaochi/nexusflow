/**
 * x402 Client for NexusFlow Frontend
 * Uses Coinbase x402 core HTTP client to handle payments.
 */

import { x402Client } from "@x402/core/client";
import { x402HTTPClient } from "@x402/core/http";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { Hex, WalletClient } from "viem";

export interface X402FetchResult {
  response: Response;
  paymentMade: boolean;
  settlement?: unknown;
  paymentRequired?: unknown;
}

type X402Signer = {
  address: Hex;
  signMessage: (args: { message: string | Uint8Array }) => Promise<Hex>;
  signTypedData: (args: {
    domain: Record<string, unknown>;
    types: Record<string, Array<{ name: string; type: string }>>;
    message: Record<string, unknown>;
    primaryType: string;
  }) => Promise<Hex>;
};

const createSigner = (walletClient: WalletClient): X402Signer => {
  const account = walletClient.account;
  if (!account) {
    throw new Error("Wallet account is required for x402 payments.");
  }

  return {
    address: account.address as Hex,
    signMessage: ({ message }) =>
      walletClient.signMessage({ account, message }),
    signTypedData: ({ domain, types, message, primaryType }) =>
      walletClient.signTypedData({
        account,
        domain,
        types,
        message,
        primaryType,
      }),
  };
};

export const createX402HttpClient = (walletClient: WalletClient) => {
  const coreClient = new x402Client();
  registerExactEvmScheme(coreClient, { signer: createSigner(walletClient) });
  return new x402HTTPClient(coreClient);
};

const mergeHeaders = (base?: HeadersInit, extra?: HeadersInit) => {
  const headers = new Headers(base || {});
  if (extra) {
    const extraHeaders = new Headers(extra);
    extraHeaders.forEach((value, key) => headers.set(key, value));
  }
  return headers;
};

/**
 * Fetch with automatic x402 payment handling
 */
export async function fetchWithX402(
  url: string,
  options: RequestInit = {},
  walletClient?: WalletClient
): Promise<X402FetchResult> {
  const response = await fetch(url, options);

  if (response.status !== 402 || !walletClient) {
    return { response, paymentMade: false };
  }

  try {
    const httpClient = createX402HttpClient(walletClient);
    const paymentRequired = httpClient.getPaymentRequiredResponse(
      (name) => response.headers.get(name),
      await response.json()
    );

    const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
    const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

    const paidResponse = await fetch(url, {
      ...options,
      headers: mergeHeaders(options.headers, paymentHeaders),
    });

    const settlement = httpClient.getPaymentSettleResponse((name) =>
      paidResponse.headers.get(name)
    );

    return {
      response: paidResponse,
      paymentMade: true,
      settlement,
      paymentRequired,
    };
  } catch (error) {
    console.error("x402 payment failed:", error);
    return { response, paymentMade: false };
  }
}
