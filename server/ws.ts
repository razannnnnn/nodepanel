import type { ServerWebSocket } from "bun";
import { getCpuUsage, getMemory, getNetwork, getStorage } from "./lib/metrics";

type WSData = { interval?: ReturnType<typeof setInterval> };

export function handleWs(ws: ServerWebSocket<WSData>) {
  // ponytail: `ws.data` is already set by the upgrade handler in index.ts.
  // Do NOT reassign it here or the interval handle is lost on close and the
  // timer keeps running forever, leaking a /proc read every 2s per dead socket.
  if (!ws.data) ws.data = {};

  const push = () => {
    if (ws.readyState !== 1) return; // WebSocket.OPEN
    try {
      ws.send(
        JSON.stringify({
          type: "metrics",
          data: {
            cpu: getCpuUsage(),
            memory: getMemory(),
            network: getNetwork(),
            storage: getStorage(),
            timestamp: Date.now(),
          },
        }),
      );
    } catch {
      // socket died between the readyState check and send
      if (ws.data.interval) clearInterval(ws.data.interval);
    }
  };

  push(); // initial
  ws.data.interval = setInterval(push, 2000);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(String(event));
      if (msg.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch {
      // ignore malformed frames
    }
  };

  const stop = () => {
    if (ws.data?.interval) clearInterval(ws.data.interval);
    ws.data = {};
  };

  ws.onclose = stop;
}