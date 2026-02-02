import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent } = body;

    const agentServerUrl = process.env.AGENT_SERVER_URL || "http://localhost:8080/execute";

    const response = await fetch(agentServerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent }),
    });

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
  } catch (error: any) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
