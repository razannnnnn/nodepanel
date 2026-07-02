import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

function readProc(path: string): string {
  try {
    return readFileSync(path, "utf-8").trim();
  } catch {
    return "";
  }
}

function parseInt10(s: string): number {
  return parseInt(s, 10) || 0;
}

export function getCpuUsage(): { usage: number; cores: number; temp: number } {
  const stat = readProc("/proc/stat");
  const lines = stat.split("\n");
  const cpuLine = lines.find((l) => l.startsWith("cpu "));
  const cores = lines.filter((l) => l.startsWith("cpu") && /^cpu\d+/.test(l)).length;

  let usage = 0;
  if (cpuLine) {
    const parts = cpuLine.split(/\s+/).slice(1).map(parseInt10);
    const total = parts.reduce((a, b) => a + b, 0);
    const idle = (parts[3] || 0) + (parts[4] || 0);
    usage = total > 0 ? Math.round(((total - idle) / total) * 1000) / 10 : 0;
  }

  let temp = 0;
  const tempFiles = [
    "/sys/class/thermal/thermal_zone0/temp",
    "/sys/class/thermal/thermal_zone1/temp",
  ];
  for (const f of tempFiles) {
    if (existsSync(f)) {
      temp = parseInt10(readProc(f)) / 1000;
      break;
    }
  }

  return { usage, cores: cores || 1, temp };
}

export function getMemory() {
  const mem = readProc("/proc/meminfo");
  const getVal = (key: string): number => {
    const m = mem.match(new RegExp(`${key}:\\s+(\\d+)`));
    return m ? parseInt10(m[1]) * 1024 : 0;
  };
  const total = getVal("MemTotal");
  const free = getVal("MemFree");
  const buffers = getVal("Buffers");
  const cached = getVal("Cached");
  const used = total - free - buffers - cached;
  return { total, used, free: total - used, percent: total > 0 ? Math.round((used / total) * 1000) / 10 : 0 };
}

export function getUptime(): number {
  const up = readProc("/proc/uptime");
  return parseFloat(up.split(" ")[0] || "0");
}

export function getLoadAverage(): number[] {
  const load = readProc("/proc/loadavg");
  return load.split(" ").slice(0, 3).map(parseFloat);
}

export function getStorage() {
  try {
    const out = execSync("df -B1 --exclude-type=tmpfs --exclude-type=devtmpfs 2>/dev/null", {
      encoding: "utf-8",
      timeout: 5000,
    });
    const lines = out.trim().split("\n").slice(1);
    return lines
      .map((line) => {
        const parts = line.split(/\s+/);
        if (parts.length < 6) return null;
        return {
          mount: parts[5] || "",
          total: parseInt10(parts[1]),
          used: parseInt10(parts[2]),
          free: parseInt10(parts[3]),
          percent: parseFloat((parts[4] || "0%").replace("%", "")),
          fs: parts[0] || "",
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function getNetwork() {
  try {
    const base = "/sys/class/net/";
    const ifaces = existsSync(base) ? readdirSync(base).filter((n) => n !== "lo") : [];
    return ifaces.map((name) => {
      const rxBytes = parseInt10(readProc(`${base}${name}/statistics/rx_bytes`));
      const txBytes = parseInt10(readProc(`${base}${name}/statistics/tx_bytes`));
      const operstate = readProc(`${base}${name}/operstate`);
      let ip = "";
      try {
        const addr = execSync(`ip -4 addr show ${name} 2>/dev/null | grep -oP 'inet \\K[\\d.]+'`, {
          encoding: "utf-8",
          timeout: 3000,
        }).trim();
        ip = addr;
      } catch {}
      return {
        interface: name,
        rxBytes,
        txBytes,
        rxSpeed: 0,
        txSpeed: 0,
        ip,
        status: operstate === "up" ? "up" : "down" as const,
      };
    });
  } catch {
    return [];
  }
}

export function getSystemInfo() {
  try {
    const osRelease = readProc("/etc/os-release");
    const osName = osRelease.match(/PRETTY_NAME="(.+)"/)?.[1] || "Linux";
    const kernel = readProc("/proc/sys/kernel/ostype") + " " + readProc("/proc/sys/kernel/osrelease");
    const hostname = readProc("/proc/sys/kernel/hostname");
    const arch = execSync("uname -m", { encoding: "utf-8", timeout: 3000 }).trim();
    let board = "";
    try {
      board = execSync("cat /proc/device-tree/model 2>/dev/null || tr -d '\\0' < /proc/device-tree/model", {
        encoding: "utf-8",
        timeout: 3000,
      }).trim();
    } catch {}

    return {
      hostname,
      kernel: kernel.trim(),
      os: osName,
      architecture: arch,
      board,
      cpu: getCpuUsage(),
      memory: getMemory(),
      storage: getStorage(),
      network: getNetwork(),
      uptime: getUptime(),
      loadAverage: getLoadAverage(),
    };
  } catch {
    return null;
  }
}
