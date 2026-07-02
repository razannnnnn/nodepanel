import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatBytes } from "@/lib/utils";

interface NetworkChartProps {
  rxSpeed: number;
  txSpeed: number;
}

export function NetworkChart({ rxSpeed, txSpeed }: NetworkChartProps) {
  const data = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => {
      const rxBase = rxSpeed + (Math.random() - 0.5) * rxSpeed * 0.5;
      const txBase = txSpeed + (Math.random() - 0.5) * txSpeed * 0.5;
      return {
        time: new Date(now - (29 - i) * 2000).toLocaleTimeString(),
        rx: Math.max(0, rxBase),
        tx: Math.max(0, txBase),
      };
    });
  }, [rxSpeed, txSpeed]);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78A9FF" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#78A9FF" stopOpacity={0} />
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
            formatter={(value: number, name: string) => [
              formatBytes(value),
              name === "rx" ? "Download" : "Upload",
            ]}
          />
          <Area
            type="monotone"
            dataKey="rx"
            stroke="#4ADE80"
            strokeWidth={2}
            fill="url(#rxGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="tx"
            stroke="#78A9FF"
            strokeWidth={2}
            fill="url(#txGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
