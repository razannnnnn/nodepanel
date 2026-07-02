import {
  Cpu,
  MemoryStick,
  HardDrive,
  Thermometer,
  Network,
  Clock,
  RefreshCw,
  Power,
  Terminal,
} from "lucide-react";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { WidgetCard } from "@/components/ui/widget-card";
import { CpuChart } from "@/components/charts/cpu-chart";
import { MemoryChart } from "@/components/charts/memory-chart";
import { NetworkChart } from "@/components/charts/network-chart";
import { DiskChart } from "@/components/charts/disk-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatUptime } from "@/lib/utils";

export function DashboardPage() {
  const sys = useSystemMetrics();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {sys.hostname} &middot; {sys.os}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Clock size={12} />
            {formatUptime(sys.uptime)}
          </Badge>
          <Button variant="secondary" size="sm">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <WidgetCard
          icon={Cpu}
          label="CPU Usage"
          value={`${sys.cpu.usage.toFixed(1)}%`}
          subtitle={`${sys.cpu.cores} Cores @ ${sys.cpu.frequency}GHz`}
          progress={sys.cpu.usage}
          progressColor="#78A9FF"
        />
        <WidgetCard
          icon={MemoryStick}
          label="Memory"
          value={`${sys.memory.percent.toFixed(1)}%`}
          subtitle={`${formatBytes(sys.memory.used)} / ${formatBytes(sys.memory.total)}`}
          progress={sys.memory.percent}
          progressColor="#A78BFA"
        />
        <WidgetCard
          icon={HardDrive}
          label="Storage"
          value={
            sys.storage[0]
              ? `${sys.storage[0].percent.toFixed(1)}%`
              : "N/A"
          }
          subtitle={sys.storage[0] ? `/${sys.storage[0].fs}` : undefined}
          progress={sys.storage[0]?.percent}
          progressColor="#FBBF24"
        />
        <WidgetCard
          icon={Thermometer}
          label="Temperature"
          value={`${sys.cpu.temperature.toFixed(1)}°C`}
          trend={sys.cpu.temperature > 70 ? "up" : "stable"}
          progress={sys.cpu.temperature}
          progressColor="#F87171"
        />
        <WidgetCard
          icon={Network}
          label="Network"
          value={sys.network[0]?.ip ?? "—"}
          subtitle={
            sys.network[0]
              ? `↓ ${formatBytes(sys.network[0].rxSpeed)}/s`
              : undefined
          }
        />
        <WidgetCard
          icon={Clock}
          label="Uptime"
          value={formatUptime(sys.uptime)}
          subtitle={`Load: ${sys.loadAverage[0]?.toFixed(2)}`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <CpuChart currentUsage={sys.cpu.usage} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoryChart
              total={sys.memory.total}
              used={sys.memory.used}
              percent={sys.memory.percent}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Network I/O</CardTitle>
          </CardHeader>
          <CardContent>
            <NetworkChart
              rxSpeed={sys.network[0]?.rxSpeed ?? 0}
              txSpeed={sys.network[0]?.txSpeed ?? 0}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disk I/O</CardTitle>
          </CardHeader>
          <CardContent>
            <DiskChart
              total={sys.storage[0]?.total ?? 0}
              used={sys.storage[0]?.used ?? 0}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm">
              <Power size={14} />
              Reboot
            </Button>
            <Button variant="destructive" size="sm">
              <Power size={14} />
              Shutdown
            </Button>
            <Button variant="secondary" size="sm">
              <RefreshCw size={14} />
              Restart Service
            </Button>
            <Button variant="default" size="sm">
              <Terminal size={14} />
              System Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
