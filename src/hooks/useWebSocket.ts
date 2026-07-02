import { useEffect, useRef, useCallback } from "react";
import { useConnectionStore } from "@/stores/connection";

interface UseWebSocketOptions {
  url: string;
  onMessage: (data: unknown) => void;
  enabled?: boolean;
}

export function useWebSocket({ url, onMessage, enabled = true }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const setStatus = useConnectionStore((s) => s.setStatus);

  const connect = useCallback(() => {
    if (!enabled) return;

    setStatus("reconnecting");
    const ws = new WebSocket(url);

    ws.onopen = () => {
      retriesRef.current = 0;
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      if (retriesRef.current >= 5) {
        setStatus("offline");
        return;
      }
      if (wsRef.current !== ws) return; // stale guard
      const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
      retriesRef.current += 1;
      timerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [url, onMessage, enabled, setStatus]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(timerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return wsRef;
}
