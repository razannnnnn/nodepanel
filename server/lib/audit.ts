import { getDb } from "../db";

export function audit(opts: {
  userId?: number | null;
  username?: string;
  action: string;
  target?: string;
  status?: string;
  ip?: string;
}) {
  const db = getDb();
  db.query(
    "INSERT INTO audit_logs (user_id, username, action, target, status, ip) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(
    opts.userId ?? null,
    opts.username ?? "system",
    opts.action,
    opts.target ?? null,
    opts.status ?? "success",
    opts.ip ?? null,
  );
}
