import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "bun";
import type { ServerWebSocket } from "bun";
import { config } from "./config";
import { getDb, seedAdmin } from "./db";
import { authRoutes } from "./routes/auth";
import { systemRoutes } from "./routes/system";
import { processesRoutes } from "./routes/processes";
import { servicesRoutes } from "./routes/services";
import { logsRoutes } from "./routes/logs";
import { packagesRoutes } from "./routes/packages";
import { handleWs } from "./ws";

// Init database + seed admin
getDb();
seedAdmin();

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({ origin: "*", credentials: true }));

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/system", systemRoutes);
app.route("/api/processes", processesRoutes);
app.route("/api/services", servicesRoutes);
app.route("/api/logs", logsRoutes);
app.route("/api/packages", packagesRoutes);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", uptime: process.uptime() }));

// Serve frontend in production
app.get("/*", async (c) => {
  try {
    const file = Bun.file("../dist/index.html");
    return new Response(file, {
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return c.json({ error: "Frontend not built" }, 404);
  }
});

console.log(`[nodepanel] Starting server on ${config.host}:${config.port}`);

const server = serve<{ wsData: Record<string, unknown> }>({
  hostname: config.host,
  port: config.port,
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 400 });
      }
      return;
    }

    // All other requests go through Hono
    return app.fetch(req);
  },
  websocket: {
    open(ws: ServerWebSocket) {
      handleWs(ws);
    },
    message(ws: ServerWebSocket, event: MessageEvent) {
      ws.data?.onmessage?.({ data: event.data });
    },
    close(ws: ServerWebSocket) {
      ws.data?.onclose?.();
    },
  },
});

console.log(`[nodepanel] Server running at http://${config.host}:${config.port}`);
