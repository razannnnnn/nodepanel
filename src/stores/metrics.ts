import { create } from "zustand";
import type { SystemInfo } from "@/types/system";

export interface MetricsSample {
  t: number;
  cpuUsage: number;
  memUsed: number;
  memPercent: number;
  diskUsed: number;
  rxSpeed: number;
  txSpeed: number;
}

export interface MetricsPayload {
  cpu: SystemInfo["cpu"];
  memory: SystemInfo["memory"];
  network: SystemInfo["network"];
  storage: SystemInfo["storage"];
  timestamp: number;
}

const HISTORY_SIZE = 60;

interface MetricsState {
  info: SystemInfo | null;
  history: MetricsSample[];
  lastUpdate: number | null;
  setInfo: (info: SystemInfo) => void;
  pushMetrics: (payload: MetricsPayload) => void;
  reset: () => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  info: null,
  history: [],
  lastUpdate: null,

  setInfo: (info) => set({ info }),

  pushMetrics: (payload) =>
    set((state) => {
      const net = payload.network[0];
      const disk = payload.storage[0];
      const sample: MetricsSample = {
        t: payload.timestamp,
        cpuUsage: payload.cpu.usage,
        memUsed: payload.memory.used,
        memPercent: payload.memory.percent,
        diskUsed: disk?.used ?? 0,
        rxSpeed: net?.rxSpeed ?? 0,
        txSpeed: net?.txSpeed ?? 0,
      };

      const prev = state.info;
      const info: SystemInfo | null = prev
        ? {
            ...prev,
            cpu: { ...prev.cpu, ...payload.cpu },
            memory: payload.memory,
            storage: payload.storage,
            network: payload.network,
          }
        : prev;

      const history = [...state.history, sample];
      if (history.length > HISTORY_SIZE) history.splice(0, history.length - HISTORY_SIZE);

      return { info, history, lastUpdate: payload.timestamp };
    }),

  reset: () => set({ info: null, history: [], lastUpdate: null }),
}));
