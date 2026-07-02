import type { ServerWebSocket } from "bun";
import { getCpuUsage, getMemory, getNetwork, getStorage } from "./lib/metrics";

type WSData = { interval?: ReturnType<typeof setInterval> };

export function handleWs(ws: ServerWebSocket<WSData>) {
  ws.data = {};

  const push = () => {
    if (ws.readyState !== 1) return; // WebSocket.OPEN
    ws.send(JSON.stringify({
      type: "metrics",
      data: {
        cpu: getCpuUsage(),
        memory: getMemory(),
        network: getNetwork(),
        storage: getStorage(),
        timestamp: Date.now(),
      },
    }));
  };

  // Push every 2 seconds
  ws.data.interval = setInterval(push, 2000);
  push(); // initial

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data.toString());
      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch {}
  };

  ws.onclose = () => {
    if (ws.data.interval) clearInterval(ws.data.interval);
  };
}
