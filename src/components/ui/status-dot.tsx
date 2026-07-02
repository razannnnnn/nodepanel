import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types/system";

const dotColors: Record<ConnectionStatus, string> = {
  connected: "bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.5)]",
  reconnecting: "bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.5)] animate-pulse",
  offline: "bg-[#F87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]",
};

const labels: Record<ConnectionStatus, string> = {
  connected: "Connected",
  reconnecting: "Reconnecting",
  offline: "Offline",
};

interface StatusDotProps {
  status: ConnectionStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("h-2 w-2 rounded-full", dotColors[status])} />
      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {labels[status]}
      </span>
    </div>
  );
}
