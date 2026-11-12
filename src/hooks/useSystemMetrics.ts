import { useMetricsStore } from "@/stores/metrics";
import type { SystemInfo } from "@/types/system";

const EMPTY: SystemInfo = {
  hostname: "connecting…",
  kernel: "",
  os: "",
  osVersion: "",
  architecture: "",
  board: "",
  cpu: { usage: 0, cores: 0, model: "", frequency: 0, temperature: 0 },
  memory: { total: 0, used: 0, free: 0, percent: 0 },
  storage: [],
  network: [],
  uptime: 0,
  loadAverage: [0, 0, 0],
};

export function useSystemMetrics(): SystemInfo {
  const info = useMetricsStore((s) => s.info);
  return info ?? EMPTY;
}
