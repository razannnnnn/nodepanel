import { useEffect, useState } from "react";
import type { SystemInfo } from "@/types/system";

const MOCK_DATA: SystemInfo = {
  hostname: "nodepanel-dev",
  kernel: "6.1.84-arm64",
  os: "Debian GNU/Linux 12 (bookworm)",
  osVersion: "12",
  architecture: "aarch64",
  board: "Rockchip RK3588",
  cpu: {
    usage: 23.5,
    cores: 8,
    model: "ARM Cortex-A76/A55",
    frequency: 2.4,
    temperature: 52.3,
  },
  memory: {
    total: 7.7 * 1024 ** 3,
    used: 2.3 * 1024 ** 3,
    free: 5.4 * 1024 ** 3,
    percent: 29.9,
  },
  storage: [
    {
      mount: "/",
      total: 58.2 * 1024 ** 3,
      used: 12.8 * 1024 ** 3,
      free: 42.5 * 1024 ** 3,
      percent: 23.1,
      fs: "ext4",
    },
    {
      mount: "/boot",
      total: 512 * 1024 ** 2,
      used: 89 * 1024 ** 2,
      free: 410 * 1024 ** 2,
      percent: 17.4,
      fs: "vfat",
    },
  ],
  network: [
    {
      interface: "eth0",
      rxBytes: 1.5 * 1024 ** 9,
      txBytes: 0.8 * 1024 ** 9,
      rxSpeed: 2.3 * 1024 ** 3,
      txSpeed: 1.1 * 1024 ** 3,
      ip: "192.168.1.100",
      status: "up",
    },
  ],
  uptime: 3600 * 72 + 1800,
  loadAverage: [0.45, 0.62, 0.58],
};

export function useSystemMetrics() {
  const [data, setData] = useState<SystemInfo>(MOCK_DATA);

  useEffect(() => {
    // ponytail: mock polling — replace with real REST/WS when backend exists
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.min(100, Math.max(0, prev.cpu.usage + (Math.random() - 0.5) * 10)),
          temperature: Math.min(80, Math.max(30, prev.cpu.temperature + (Math.random() - 0.5) * 2)),
        },
        memory: {
          ...prev.memory,
          used: prev.memory.total * ((prev.memory.percent + (Math.random() - 0.5) * 2) / 100),
          percent: Math.min(100, Math.max(0, prev.memory.percent + (Math.random() - 0.5) * 2)),
        },
        uptime: prev.uptime + 60,
        loadAverage: prev.loadAverage.map((l) =>
          Math.min(4, Math.max(0, l + (Math.random() - 0.5) * 0.2)),
        ),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
