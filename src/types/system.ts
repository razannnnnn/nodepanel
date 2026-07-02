export interface CpuInfo {
  usage: number;
  cores: number;
  model: string;
  frequency: number;
  temperature: number;
}

export interface MemoryInfo {
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface StorageInfo {
  mount: string;
  total: number;
  used: number;
  free: number;
  percent: number;
  fs: string;
}

export interface NetworkInfo {
  interface: string;
  rxBytes: number;
  txBytes: number;
  rxSpeed: number;
  txSpeed: number;
  ip: string;
  status: "up" | "down";
}

export interface SystemInfo {
  hostname: string;
  kernel: string;
  os: string;
  osVersion: string;
  architecture: string;
  board: string;
  cpu: CpuInfo;
  memory: MemoryInfo;
  storage: StorageInfo[];
  network: NetworkInfo[];
  uptime: number;
  loadAverage: number[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  state: string;
  user: string;
}

export interface ServiceInfo {
  name: string;
  state: "running" | "stopped" | "failed";
  enabled: boolean;
  description: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  priority: number;
  facility: string;
}

export interface PackageInfo {
  name: string;
  version: string;
  newVersion?: string;
  status: "installed" | "upgradable" | "not-installed";
  description: string;
}

export type ConnectionStatus = "connected" | "reconnecting" | "offline";
