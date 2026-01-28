import { useState, useCallback } from "react";
import { ParsedIntent } from "@/lib/intents";

interface AgentResult {
  success: boolean;
  intent: ParsedIntent;
  preview: string;
  tokenInfo?: Record<string, string>;
  confidence?: number;
}

export function useAgentStream() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [...prev, message]);
  }, []);

  const sendIntent = useCallback(async (intent: string, llmProvider = "openai") => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    addLog(`> ${intent}`);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, llmProvider }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7);
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            
            if (eventType === "log") {
              addLog(data.message);
            } else if (eventType === "error") {
              setError(data.message);
              addLog(`✗ Error: ${data.message}`);
            } else if (eventType === "result") {
              setResult(data);
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process";
      setError(message);
      addLog(`✗ ${message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setResult(null);
    setError(null);
  }, []);

  return {
    sendIntent,
    logs,
    isProcessing,
    result,
    error,
    clearLogs,
  };
}
