import { Hono } from "hono";
import { getDb } from "../db";
import { authMiddleware } from "../middleware/auth";

const auth = new Hono();

auth.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json({ error: "Username and password required" }, 400);
  }

  const db = getDb();
  const user = db.query("SELECT * FROM users WHERE username = ?").get(username) as
    | { id: number; username: string; password_hash: string; role: string }
    | undefined;

  if (!user || !Bun.password.verifySync(password, user.password_hash)) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.query("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)").run(
    user.id,
    token,
    expires,
  );

  return c.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

auth.post("/logout", authMiddleware, async (c) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    getDb().query("DELETE FROM sessions WHERE token = ?").run(token);
  }
  return c.json({ ok: true });
});

auth.get("/me", authMiddleware, (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export { auth as authRoutes };
