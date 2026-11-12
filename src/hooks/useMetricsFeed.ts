import { useEffect } from "react";
import { api, wsUrl } from "@/lib/api";
import { useMetricsStore, type MetricsPayload } from "@/stores/metrics";
import { useConnectionStore } from "@/stores/connection";
import type { SystemInfo } from "@/types/system";

const RECONNECT_MAX = 5;

export function useMetricsFeed(enabled: boolean) {
  const setInfo = useMetricsStore((s) => s.setInfo);
  const pushMetrics = useMetricsStore((s) => s.pushMetrics);
  const setStatus = useConnectionStore((s) => s.setStatus);

  useEffect(() => {
    if (!enabled) return;

    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let retries = 0;
    let disposed = false;

    const loadInfo = async () => {
      try {
        const info = await api<SystemInfo>("/api/system/info");
        if (!disposed) setInfo(info);
      } catch {
        // WS will fill in the live fields once connected
      }
    };

    const connect = () => {
      if (disposed) return;
      setStatus("reconnecting");

      ws = new WebSocket(wsUrl());

      ws.onopen = () => {
        retries = 0;
        setStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as { type: string; data: MetricsPayload };
          if (msg.type === "metrics") pushMetrics(msg.data);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = () => {
        if (disposed) return;
        if (retries >= RECONNECT_MAX) {
          setStatus("offline");
          return;
        }
        const delay = Math.min(1000 * 2 ** retries, 30000);
        retries += 1;
        timer = setTimeout(connect, delay);
      };

      ws.onerror = () => ws?.close();
    };

    loadInfo();
    connect();

    return () => {
      disposed = true;
      clearTimeout(timer);
      ws?.close();
      ws = null;
    };
  }, [enabled, setInfo, pushMetrics, setStatus]);
}
