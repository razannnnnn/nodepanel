import { Hono } from "hono";
import { readdirSync, readFileSync } from "node:fs";
import { authMiddleware } from "../middleware/auth";
import { runSafe } from "../lib/shell";

const processes = new Hono();
processes.use("*", authMiddleware);

const HZ = 100; // Linux USER_HZ on every mainstream config

interface ProcSample {
  ticks: number;
  at: number;
}

// ponytail: /proc/<pid>/stat utime+stime is cumulative CPU time since the
// process started, not a percentage. Keep the previous sample and divide the
// delta by elapsed wall time, otherwise a long-running process reports
// thousands of percent.
const prevTicks = new Map<number, ProcSample>();

function readCpuPercent(pid: number, ticks: number, now: number): number {
  const prev = prevTicks.get(pid);
  prevTicks.set(pid, { ticks, at: now });
  if (!prev) return 0;

  const elapsed = (now - prev.at) / 1000;
  if (elapsed <= 0 || ticks < prev.ticks) return 0;

  const usedSeconds = (ticks - prev.ticks) / HZ;
  const cores = parseInt(readFileSync("/proc/stat", "utf-8").split("\n").filter((l) => /^cpu\d+\s/.test(l)).length.toString(), 10) || 1;
  const percent = (usedSeconds / elapsed) * 100;
  return Math.round(Math.min(percent, 100 * cores) * 10) / 10;
}

processes.get("/", (c) => {
  const list: Record<string, unknown>[] = [];
  const now = Date.now();
  const seen = new Set<number>();

  try {
    const memTotalKb = parseInt(
      readFileSync("/proc/meminfo", "utf-8").match(/MemTotal:\s+(\d+)/)?.[1] ?? "0",
      10,
    );
    const uidCache = new Map<string, string>();
    const pids = readdirSync("/proc").filter((d) => /^\d+$/.test(d));

    for (const pidStr of pids) {
      const pid = parseInt(pidStr, 10);
      try {
        const stat = readFileSync(`/proc/${pidStr}/stat`, "utf-8");
        const close = stat.lastIndexOf(")");
        const name = stat.slice(stat.indexOf("(") + 1, close);
        const fields = stat.slice(close + 2).split(" ");
        const state = fields[0] ?? "?";
        const utime = parseInt(fields[11] ?? "0", 10);
        const stime = parseInt(fields[12] ?? "0", 10);

        const status = readFileSync(`/proc/${pidStr}/status`, "utf-8");
        const vmRss = parseInt(status.match(/VmRSS:\s+(\d+)/)?.[1] ?? "0", 10);
        const uid = status.match(/Uid:\s+(\d+)/)?.[1] ?? "0";

        if (!uidCache.has(uid)) {
          uidCache.set(uid, runSafe(`id -nu ${uid} 2>/dev/null`) || "root");
        }

        const cmdline = readFileSync(`/proc/${pidStr}/cmdline`, "utf-8")
          .replace(/\0/g, " ")
          .trim();

        seen.add(pid);

        list.push({
          pid,
          name,
          cpu: readCpuPercent(pid, utime + stime, now),
          memory: memTotalKb > 0 ? Math.round((vmRss / memTotalKb) * 1000) / 10 : 0,
          state:
            state === "R"
              ? "running"
              : state === "S"
                ? "sleeping"
                : state === "Z"
                  ? "zombie"
                  : state === "T"
                    ? "stopped"
                    : state,
          user: uidCache.get(uid),
          cmdline: (cmdline || `[${name}]`).slice(0, 200),
        });
      } catch {
        // process exited between readdir and read
      }
    }
  } catch {
    // /proc unreadable
  }

  for (const pid of prevTicks.keys()) {
    if (!seen.has(pid)) prevTicks.delete(pid);
  }

  return c.json(list);
});

processes.post("/kill", async (c) => {
  const { pid, signal = "SIGTERM" } = await c.req.json<{ pid?: number; signal?: string }>();
  if (!pid || typeof pid !== "number") {
    return c.json({ error: "PID required" }, 400);
  }
  if (pid < 2) {
    return c.json({ error: "Refusing to signal PID 0/1" }, 400);
  }
  try {
    process.kill(pid, signal as NodeJS.Signals);
    prevTicks.delete(pid);
    return c.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return c.json({ error: msg }, 500);
  }
});

export { processes as processesRoutes };
