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

// ponytail: module-level sampler state. CPU and network are rates, so they need
// two samples with a known interval. WS pushes every 2s, so the deltas are tight.
type CpuSample = { total: number; idle: number };
let prevCpu: CpuSample | null = null;

function readCpuTimes(): CpuSample | null {
  const cpuLine = readProc("/proc/stat")
    .split("\n")
    .find((l) => l.startsWith("cpu "));
  if (!cpuLine) return null;
  const parts = cpuLine.split(/\s+/).slice(1).map(parseInt10);
  // user nice system idle iowait irq softirq steal guest guest_nice
  const idle = (parts[3] || 0) + (parts[4] || 0);
  const total = parts.reduce((a, b) => a + b, 0);
  return { total, idle };
}

function cpuModel(): string {
  const info = readProc("/proc/cpuinfo");
  return info.match(/^model name\s*:\s*(.+)$/m)?.[1]?.trim() || "Unknown CPU";
}

function cpuFrequency(): number {
  const info = readProc("/proc/cpuinfo");
  const mhz = info.match(/^cpu MHz\s*:\s*([\d.]+)$/m)?.[1];
  if (mhz) return Math.round(parseFloat(mhz) / 100) / 10;
  // ARM boards report max frequency in kHz instead of a live MHz clock
  const khz = readProc("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq");
  if (khz) return Math.round(parseInt10(khz) / 10000) / 100;
  return 0;
}

function readTemperature(): number {
  for (let i = 0; i < 8; i++) {
    const raw = readProc(`/sys/class/thermal/thermal_zone${i}/temp`);
    if (raw) {
      const v = parseInt10(raw);
      if (v > 0) return Math.round((v / 1000) * 10) / 10;
    }
  }
  return 0;
}

export function getCpuUsage(): {
  usage: number;
  cores: number;
  model: string;
  frequency: number;
  temperature: number;
} {
  const cores = readProc("/proc/stat").split("\n").filter((l) => /^cpu\d+\s/.test(l)).length;
  const cur = readCpuTimes();

  let usage = 0;
  if (cur) {
    if (prevCpu) {
      const dt = cur.total - prevCpu.total;
      const di = cur.idle - prevCpu.idle;
      usage = dt > 0 ? Math.round(((dt - di) / dt) * 1000) / 10 : 0;
    } else {
      // First sample: report the since-boot average so the UI is not blank
      usage = cur.total > 0 ? Math.round(((cur.total - cur.idle) / cur.total) * 1000) / 10 : 0;
    }
    prevCpu = cur;
  }

  return {
    usage: Math.min(100, Math.max(0, usage)),
    cores: cores || 1,
    model: cpuModel(),
    frequency: cpuFrequency(),
    temperature: readTemperature(),
  };
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
  return {
    total,
    used,
    free: total - used,
    percent: total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
  };
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
      .filter((x): x is NonNullable<typeof x> => x !== null);
  } catch {
    return [];
  }
}

// ponytail: per-interface counter cache. Speeds are byte deltas over wall time,
// so a counter reset (or first sight) reports 0 instead of a nonsense spike.
const prevNet = new Map<string, { rx: number; tx: number; t: number }>();

export function getNetwork() {
  try {
    const base = "/sys/class/net/";
    const ifaces = existsSync(base) ? readdirSync(base).filter((n) => n !== "lo") : [];
    const now = Date.now();

    return ifaces.map((name) => {
      const rxBytes = parseInt10(readProc(`${base}${name}/statistics/rx_bytes`));
      const txBytes = parseInt10(readProc(`${base}${name}/statistics/tx_bytes`));
      const operstate = readProc(`${base}${name}/operstate`);

      const prev = prevNet.get(name);
      let rxSpeed = 0;
      let txSpeed = 0;
      if (prev) {
        const dt = (now - prev.t) / 1000;
        if (dt > 0 && prev.rx <= rxBytes && prev.tx <= txBytes) {
          rxSpeed = Math.round((rxBytes - prev.rx) / dt);
          txSpeed = Math.round((txBytes - prev.tx) / dt);
        }
      }
      prevNet.set(name, { rx: rxBytes, tx: txBytes, t: now });

      let ip = "";
      try {
        ip = execSync(`ip -4 addr show ${name} 2>/dev/null | grep -oP 'inet \\K[\\d.]+'`, {
          encoding: "utf-8",
          timeout: 3000,
        }).trim();
      } catch {
        // interface may be down or lack an IPv4 address
      }

      return {
        interface: name,
        rxBytes,
        txBytes,
        rxSpeed,
        txSpeed,
        ip,
        status: operstate === "up" ? ("up" as const) : ("down" as const),
      };
    });
  } catch {
    return [];
  }
}

export function getSystemInfo() {
  try {
    const osRelease = readProc("/etc/os-release");
    const osName = osRelease.match(/^PRETTY_NAME="?(.+?)"?$/m)?.[1] || "Linux";
    const osVersion = osRelease.match(/^VERSION_ID="?(.+?)"?$/m)?.[1] || "";
    const kernel = `${readProc("/proc/sys/kernel/ostype")} ${readProc("/proc/sys/kernel/osrelease")}`.trim();
    const hostname = readProc("/proc/sys/kernel/hostname");
    const arch = execSync("uname -m", { encoding: "utf-8", timeout: 3000 }).trim();

    let board = "";
    const dtModel = readProc("/proc/device-tree/model");
    if (dtModel) board = dtModel;

    return {
      hostname,
      kernel,
      os: osName,
      osVersion,
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