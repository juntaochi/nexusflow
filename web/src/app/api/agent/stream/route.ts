import { NextRequest } from "next/server";
import { getCrossChainOpportunities } from "@/lib/perception/monitor";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("connected", { message: "Connected to NexusFlow Omnichain Brain" });

      const interval = setInterval(async () => {
        try {
          const opportunities = await getCrossChainOpportunities();

          if (opportunities.length > 0) {
            send("opportunity", opportunities[0]);
          } else {
             send("heartbeat", { status: "Scanning Superchain..." });
          }
        } catch (error) {
          console.error("Monitor Error:", error);
        }
      }, 5000);

      const cleanup = () => {
        clearInterval(interval);
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
