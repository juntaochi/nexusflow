import { useState, useEffect, useRef, useCallback } from "react";
import { Opportunity } from "@/lib/perception/monitor";

export function useOmnichainPerception() {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [status, setStatus] = useState<string>("Scanning...");
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/agent/stream");
    eventSourceRef.current = es;

    es.addEventListener("opportunity", (event) => {
      try {
        const data = JSON.parse(event.data);
        setOpportunity(data);
      } catch (e) {
        console.error("Failed to parse opportunity data", e);
      }
    });

    es.addEventListener("heartbeat", (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatus(data.status);
      } catch (e) {
        console.error("Failed to parse heartbeat data", e);
      }
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      
      retryTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [connect]);

  const clearOpportunity = () => setOpportunity(null);

  return { opportunity, status, clearOpportunity };
}
