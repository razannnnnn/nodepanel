import { join } from "node:path";

const dataDir = process.env.NODEPANEL_DATA_DIR || "/etc/nodepanel";
const dbPath = join(dataDir, "nodepanel.db");

export const config = {
  port: parseInt(process.env.NODEPANEL_PORT || "3001", 10),
  host: process.env.NODEPANEL_HOST || "0.0.0.0",
  dataDir,
  dbPath,
  sessionSecret: process.env.NODEPANEL_SECRET || "change-me-in-production",
  sessionTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  logDir: join(dataDir, "logs"),
} as const;
