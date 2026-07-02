import { create } from "zustand";
import type { ConnectionStatus } from "@/types/system";

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (s: ConnectionStatus) => void;
  lastUpdate: number | null;
  setLastUpdate: (t: number) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: "offline",
  setStatus: (status) => set({ status }),
  lastUpdate: null,
  setLastUpdate: (t) => set({ lastUpdate: t }),
}));
