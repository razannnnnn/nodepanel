import { execSync } from "node:child_process";

// ponytail: 8 MiB maxBuffer. dpkg-query -W with a Description field emits a
// multi-line paragraph per package and blows past the 1 MiB default, which
// execSync reports as "ENOBUFS" and silently yields "" in runSafe.
const MAX_BUFFER = 8 * 1024 * 1024;

export function run(cmd: string, timeout = 10000): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout, maxBuffer: MAX_BUFFER }).trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Command failed: ${cmd} — ${msg}`);
  }
}

export function runSafe(cmd: string, timeout = 10000): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout, maxBuffer: MAX_BUFFER }).trim();
  } catch {
    return "";
  }
}
