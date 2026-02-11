import { describe, it, expect } from "vitest";
import {
  buildX402PaymentOption,
  decodeBase64Json,
  encodeBase64Json,
  formatX402Price,
  type X402Config,
} from "./middleware";

describe("x402 middleware helpers", () => {
  it("formats price with a leading dollar sign", () => {
    expect(formatX402Price("0.01")).toBe("$0.01");
    expect(formatX402Price("$0.10")).toBe("$0.10");
  });

  it("builds x402 payment option from config", () => {
    const config: X402Config = {
      payTo: "0x0000000000000000000000000000000000000001",
      network: "eip155:84532",
      priceUsd: "0.005",
      description: "Test route",
    };

    expect(buildX402PaymentOption(config)).toEqual({
      scheme: "exact",
      network: "eip155:84532",
      payTo: "0x0000000000000000000000000000000000000001",
      price: "$0.005",
    });
  });

  it("round-trips base64 encoded JSON", () => {
    const payload = { hello: "x402", value: 42 };
    const encoded = encodeBase64Json(payload);
    expect(decodeBase64Json<typeof payload>(encoded)).toEqual(payload);
  });
});
