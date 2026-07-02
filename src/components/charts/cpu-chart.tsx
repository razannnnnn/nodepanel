import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useMemo } from "react";

interface CpuChartProps {
  currentUsage: number;
}

export function CpuChart({ currentUsage }: CpuChartProps) {
  const data = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => {
      const base = currentUsage + (Math.random() - 0.5) * 8;
      return {
        time: new Date(now - (29 - i) * 2000).toLocaleTimeString(),
        value: Math.min(100, Math.max(0, base)),
      };
    });
  }, [currentUsage]);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78A9FF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#78A9FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#141D2A",
              border: "1px solid #1E2A3A",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#8B9EB0" }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, "CPU"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#78A9FF"
            strokeWidth={2}
            fill="url(#cpuGrad)"
            dot={false}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
