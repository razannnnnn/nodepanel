import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatBytes } from "@/lib/utils";
import { useMetricsStore } from "@/stores/metrics";

export function NetworkChart() {
  const history = useMetricsStore((s) => s.history);
  const data = history.map((h) => ({
    time: new Date(h.t).toLocaleTimeString(),
    rx: h.rxSpeed,
    tx: h.txSpeed,
  }));

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
              `${formatBytes(value)}/s`,
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
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="tx"
            stroke="#78A9FF"
            strokeWidth={2}
            fill="url(#txGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
