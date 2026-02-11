import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { initializeAgent } from "./index";
import { HumanMessage } from "@langchain/core/messages";

const app = express();
const port = process.env.AGENT_SERVER_PORT || 8080;
const requiredApiKey = process.env.AGENT_SERVER_API_KEY?.trim() || "";
const rateLimitWindowMs = Number(process.env.AGENT_RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMax = Number(process.env.AGENT_RATE_LIMIT_MAX ?? 30);

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

app.use(cors());
app.use(express.json());
app.set("trust proxy", true);

let agentInstance: any = null;
let agentConfig: any = null;
let hasWarnedMissingApiKey = false;

const getClientIp = (req: Request): string => {
  const forwardedFor = req.header("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.header("x-real-ip")?.trim();
  if (realIp) return realIp;
  if (req.ip) return req.ip;
  return "unknown";
};

const getProvidedApiKey = (req: Request): string => {
  const headerApiKey = req.header("x-agent-api-key")?.trim();
  if (headerApiKey) return headerApiKey;

  const authHeader = req.header("authorization");
  if (!authHeader) return "";

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return "";
  return token.trim();
};

const sweepRateLimitBuckets = (now: number) => {
  if (rateLimitBuckets.size < 1_000) return;
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
};

const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!requiredApiKey) {
    if (process.env.NODE_ENV === "production" && !hasWarnedMissingApiKey) {
      hasWarnedMissingApiKey = true;
      console.warn(
        "[Server] AGENT_SERVER_API_KEY is missing in production; /execute is currently unauthenticated."
      );
    }
  } else {
    const providedApiKey = getProvidedApiKey(req);
    if (providedApiKey !== requiredApiKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const now = Date.now();
  sweepRateLimitBuckets(now);

  const rateLimitKey = `${getClientIp(req)}:${req.path}`;
  const existing = rateLimitBuckets.get(rateLimitKey);

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(rateLimitKey, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return next();
  }

  if (existing.count >= rateLimitMax) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1_000)
    );
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  existing.count += 1;
  rateLimitBuckets.set(rateLimitKey, existing);
  next();
};

async function getAgent() {
  if (!agentInstance) {
    const result = await initializeAgent();
    agentInstance = result.agent;
    agentConfig = result.config;
  }
  return { agent: agentInstance, config: agentConfig };
}

app.post("/execute", securityMiddleware, async (req, res) => {
  const { intent } = req.body;
  if (typeof intent !== "string" || intent.trim().length === 0) {
    return res.status(400).json({ error: "Intent is required" });
  }

  console.log(`[Server] Received intent: ${intent}`);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { agent, config } = await getAgent();
    
    const stream = await agent.stream(
      { messages: [new HumanMessage(intent)] },
      config
    );

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        const messages = chunk.agent.messages;
        const lastMsg = Array.isArray(messages) ? messages[messages.length - 1] : messages;
        if (lastMsg?.content) {
          res.write(`event: agent\ndata: ${JSON.stringify({ message: lastMsg.content })}\n\n`);
        }
      } else if ("tools" in chunk) {
        const messages = chunk.tools.messages;
        const lastMsg = Array.isArray(messages) ? messages[messages.length - 1] : messages;
        if (lastMsg?.content) {
            res.write(`event: tool\ndata: ${JSON.stringify({ message: lastMsg.content })}\n\n`);
        }
      }
    }
    
    res.write(`event: end\ndata: ${JSON.stringify({ success: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("[Server] Agent Error:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`🚀 NexusFlow Agent Server running at http://localhost:${port}`);
});
