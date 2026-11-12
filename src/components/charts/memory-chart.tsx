import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { formatBytes } from "@/lib/utils";
import { useMetricsStore } from "@/stores/metrics";

export function MemoryChart() {
  const history = useMetricsStore((s) => s.history);
  const data = history.map((h) => ({
    time: new Date(h.t).toLocaleTimeString(),
    used: h.memUsed,
  }));

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
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
