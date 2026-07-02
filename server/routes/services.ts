import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { runSafe } from "../lib/shell";

const services = new Hono();
services.use("*", authMiddleware);

services.get("/", (c) => {
  const out = runSafe("systemctl list-units --type=service --no-pager --no-legend 2>/dev/null");
  const list = out.split("\n").filter(Boolean).map((line) => {
    const parts = line.split(/\s+/);
    const name = (parts[0] || "").replace(".service", "");
    const load = parts[1] || "";
    const state = parts[2] || "";
    const enabled = runSafe(`systemctl is-enabled ${name}.service 2>/dev/null`);
    let description = "";
    try {
      const descOutput = runSafe(
        `systemctl show ${name}.service --property=Description --no-pager 2>/dev/null`,
      );
      description = descOutput.replace("Description=", "");
    } catch {}
    return {
      name,
      state: state === "active" ? "running" : state === "inactive" ? "stopped" : state || "unknown",
      enabled: enabled === "enabled",
      description,
    };
  });
  return c.json(list);
});

services.post("/:name/start", (c) => {
  const name = c.req.param("name");
  const out = runSafe(`systemctl start ${name}.service 2>&1`);
  if (out && !out.includes("Failed")) return c.json({ ok: false, error: out }, 500);
  return c.json({ ok: true });
});

services.post("/:name/stop", (c) => {
  const name = c.req.param("name");
  const out = runSafe(`systemctl stop ${name}.service 2>&1`);
  if (out && !out.includes("Failed")) return c.json({ ok: false, error: out }, 500);
  return c.json({ ok: true });
});

services.post("/:name/restart", (c) => {
  const name = c.req.param("name");
  const out = runSafe(`systemctl restart ${name}.service 2>&1`);
  if (out && !out.includes("Failed")) return c.json({ ok: false, error: out }, 500);
  return c.json({ ok: true });
});

export { services as servicesRoutes };
