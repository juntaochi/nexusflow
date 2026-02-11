import { NextRequest, NextResponse } from "next/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const routeRateLimitBuckets = new Map<string, RateLimitBucket>();

const proxyRateLimitWindowMs = Number(
  process.env.AGENT_PROXY_RATE_LIMIT_WINDOW_MS ?? 60_000
);
const proxyRateLimitMax = Number(process.env.AGENT_PROXY_RATE_LIMIT_MAX ?? 20);

const requiredProxyApiKey = process.env.AGENT_PROXY_API_KEY?.trim() || "";
const upstreamAgentApiKey = process.env.AGENT_SERVER_API_KEY?.trim() || "";

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
};

const getProvidedProxyKey = (request: NextRequest): string => {
  const fromHeader = request.headers.get("x-proxy-api-key")?.trim();
  if (fromHeader) return fromHeader;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return "";
  return token.trim();
};

const consumeRateLimit = (key: string) => {
  const now = Date.now();

  if (routeRateLimitBuckets.size > 1_000) {
    for (const [bucketKey, bucket] of routeRateLimitBuckets) {
      if (bucket.resetAt <= now) {
        routeRateLimitBuckets.delete(bucketKey);
      }
    }
  }

  const existing = routeRateLimitBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    routeRateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + proxyRateLimitWindowMs,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= proxyRateLimitMax) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1_000)
      ),
    };
  }

  existing.count += 1;
  routeRateLimitBuckets.set(key, existing);
  return { allowed: true, retryAfterSeconds: 0 };
};

export async function POST(request: NextRequest) {
  try {
    if (requiredProxyApiKey) {
      const providedProxyApiKey = getProvidedProxyKey(request);
      if (providedProxyApiKey !== requiredProxyApiKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const ip = getClientIp(request);
    const rateLimit = consumeRateLimit(`agent-paid:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const intent = (body as { intent?: unknown })?.intent;
    if (typeof intent !== "string" || intent.trim().length === 0) {
      return NextResponse.json({ error: "Intent is required" }, { status: 400 });
    }

    const agentServerUrl = process.env.AGENT_SERVER_URL || "http://localhost:8080/execute";
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (upstreamAgentApiKey) {
      headers["x-agent-api-key"] = upstreamAgentApiKey;
    }

    const response = await fetch(agentServerUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ intent }),
    });

    if (!response.ok) {
      const upstreamError = await response.text();
      return NextResponse.json(
        {
          error: "Upstream agent server error",
          status: response.status,
          details: upstreamError || "Unknown upstream error",
        },
        { status: response.status }
      );
    }

    if (!response.body) {
      throw new Error("No response body from agent server");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n\n");

            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(encoder.encode(line + "\n\n"));
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown proxy error";
    console.error("API Proxy Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
