import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { runSafe } from "../lib/shell";

const logs = new Hono();
logs.use("*", authMiddleware);

logs.get("/", (c) => {
  const lines = parseInt(c.req.query("lines") || "100", 10);
  const filter = c.req.query("filter") || "";
  const priority = c.req.query("priority") || "";

  let cmd = `journalctl --no-pager -n ${Math.min(lines, 500)} -o short-iso 2>/dev/null`;
  if (priority) {
    const prioMap: Record<string, string> = { "0": "emerg", "1": "alert", "2": "crit", "3": "err", "4": "warning" };
    cmd += ` -p ${prioMap[priority] || priority}`;
  }
  const out = runSafe(cmd);
  let entries = out.split("\n").filter(Boolean).map((line) => {
    // journalctl short-iso format: 2024-01-01T12:00:00+0000 host program[pid]: message
    const match = line.match(/^(\S+T\S+)\s+\S+\s+(\S+)(?:\[(\d+)\])?:\s+(.+)/);
    if (!match) {
      return { timestamp: new Date().toISOString(), message: line, priority: 6, facility: "system" };
    }
    return {
      timestamp: match[1] || new Date().toISOString(),
      message: match[4] || line,
      priority: 6,
      facility: match[2] || "system",
    };
  });

  if (filter) {
    const q = filter.toLowerCase();
    entries = entries.filter((e) => e.message.toLowerCase().includes(q));
  }

  return c.json(entries);
});

export { logs as logsRoutes };
