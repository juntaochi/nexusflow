import express from "express";
import cors from "cors";
import { initializeAgent } from "./index";
import { HumanMessage } from "@langchain/core/messages";

const app = express();
const port = process.env.AGENT_SERVER_PORT || 8080;

app.use(cors());
app.use(express.json());

let agentInstance: any = null;
let agentConfig: any = null;

async function getAgent() {
  if (!agentInstance) {
    const result = await initializeAgent();
    agentInstance = result.agent;
    agentConfig = result.config;
  }
  return { agent: agentInstance, config: agentConfig };
}

app.post("/execute", async (req, res) => {
  const { intent } = req.body;
  if (!intent) {
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
