import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  progressColor?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

export function WidgetCard({
  icon: Icon,
  label,
  value,
  subtitle,
  progress,
  progressColor,
  trend,
  trendValue,
  className,
}: WidgetCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border glow-primary transition-all duration-200 p-5",
        className,
      )}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
          style={{ backgroundColor: "var(--color-primary-muted)" }}
        >
          <Icon className="text-[#78A9FF]" size={18} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-[#4ADE80]",
              trend === "down" && "text-[#F87171]",
              trend === "stable" && "text-[#FBBF24]",
            )}
          >
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--border-default)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: progressColor ?? "#78A9FF",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
