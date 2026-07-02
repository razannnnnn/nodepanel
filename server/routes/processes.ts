import { Hono } from "hono";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { authMiddleware } from "../middleware/auth";
import { runSafe } from "../lib/shell";

const processes = new Hono();
processes.use("*", authMiddleware);

processes.get("/", (c) => {
  const list: Record<string, unknown>[] = [];
  try {
    const pids = readdirSync("/proc").filter((d) => /^\d+$/.test(d));
    for (const pid of pids.slice(0, 500)) {
      try {
        const status = readFileSync(`/proc/${pid}/status`, "utf-8");
        const cmdline = readFileSync(`/proc/${pid}/cmdline`, "utf-8").replace(/\0/g, " ") || `[${pid}]`;
        const stat = readFileSync(`/proc/${pid}/stat`, "utf-8");
        const parts = stat.match(/\(.*\)|\S+/g) || [];

        const name = (parts[1] || "").replace(/[()]/g, "");
        const state = (parts[2] || "?").slice(0, 1);
        const utime = parseInt(parts[13] || "0");
        const stime = parseInt(parts[14] || "0");
        const totalTime = (utime + stime) / 100; // approximate

        const vmRSS = parseInt(status.match(/VmRSS:\s+(\d+)/)?.[1] || "0");
        const uidLine = status.match(/Uid:\s+(\d+)/);

        const memTotal = parseInt(readFileSync("/proc/meminfo", "utf-8").match(/MemTotal:\s+(\d+)/)?.[1] || "0");

        list.push({
          pid: parseInt(pid),
          name,
          cpu: Math.round(totalTime * 10) / 10,
          memory: memTotal > 0 ? Math.round((vmRSS / memTotal) * 1000) / 10 : 0,
          state: state === "R" ? "running" : state === "S" ? "sleeping" : state === "Z" ? "zombie" : state,
          user: uidLine ? runSafe(`id -nu ${uidLine[1]} 2>/dev/null`) || "root" : "root",
          cmdline: cmdline.slice(0, 200),
        });
      } catch {
        // process vanished between readdir and read
      }
    }
  } catch {}
  return c.json(list);
});

processes.post("/kill", async (c) => {
  const { pid, signal = "SIGTERM" } = await c.req.json();
  if (!pid || typeof pid !== "number") {
    return c.json({ error: "PID required" }, 400);
  }
  try {
    process.kill(pid, signal);
    return c.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

export { processes as processesRoutes };
