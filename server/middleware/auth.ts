import { createMiddleware } from "hono/factory";
import { getDb } from "../db";

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "") ||
    c.req.query("token");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = getDb();
  const row = db.query(`
    SELECT u.id, u.username, u.role
    FROM sessions s JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).get(token) as AuthUser | undefined;

  if (!row) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  c.set("user", row);
  await next();
});

export function requireRole(...roles: string[]) {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  });
}
