import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getSystemInfo, getCpuUsage, getMemory, getStorage, getNetwork, getUptime, getLoadAverage } from "../lib/metrics";

const system = new Hono();
system.use("*", authMiddleware);

system.get("/info", (c) => {
  const info = getSystemInfo();
  if (!info) return c.json({ error: "Failed to read system info" }, 500);
  return c.json(info);
});

system.get("/cpu", (c) => c.json(getCpuUsage()));

system.get("/memory", (c) => c.json(getMemory()));

system.get("/storage", (c) => c.json(getStorage()));

system.get("/network", (c) => c.json(getNetwork()));

system.get("/uptime", (c) => c.json({ uptime: getUptime(), loadAverage: getLoadAverage() }));

export { system as systemRoutes };
