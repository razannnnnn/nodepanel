import { execSync } from "node:child_process";

export function run(cmd: string, timeout = 10000): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout }).trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Command failed: ${cmd} — ${msg}`);
  }
}

export function runSafe(cmd: string, timeout = 10000): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout }).trim();
  } catch {
    return "";
  }
}
