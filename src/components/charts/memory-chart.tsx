import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatBytes } from "@/lib/utils";

interface MemoryChartProps {
  total: number;
  used: number;
  percent: number;
}

export function MemoryChart({ total, used }: MemoryChartProps) {
  const data = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => {
      const base = used + (Math.random() - 0.5) * total * 0.02;
      return {
        time: new Date(now - (29 - i) * 2000).toLocaleTimeString(),
        used: Math.min(total, Math.max(0, base)),
        total,
      };
    });
  }, [used, total]);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={false} axisLine={false} />
          <YAxis
            tick={{ fill: "#5A6F82", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatBytes(v)}
          />
          <Tooltip
            contentStyle={{
              background: "#141D2A",
              border: "1px solid #1E2A3A",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#8B9EB0" }}
            formatter={(value: number) => [formatBytes(value), "Used"]}
          />
          <Area
            type="monotone"
            dataKey="used"
            stroke="#A78BFA"
            strokeWidth={2}
            fill="url(#memGrad)"
            dot={false}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
