import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { Server, Cpu, MemoryStick, HardDrive, Network, Monitor } from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-secondary">{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function InfoSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={16} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-default">{children}</CardContent>
    </Card>
  );
}

export function SystemInfoPage() {
  const sys = useSystemMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">System Information</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Detailed system hardware and software information</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoSection icon={Monitor} title="System">
          <InfoRow label="Hostname" value={sys.hostname} />
          <InfoRow label="OS" value={sys.os} />
          <InfoRow label="Kernel" value={sys.kernel} />
          <InfoRow label="Architecture" value={sys.architecture} />
          <InfoRow label="Board" value={sys.board} />
        </InfoSection>

        <InfoSection icon={Cpu} title="Processor">
          <InfoRow label="Model" value={sys.cpu.model} />
          <InfoRow label="Cores" value={String(sys.cpu.cores)} />
          <InfoRow label="Frequency" value={`${sys.cpu.frequency} GHz`} />
          <InfoRow label="Usage" value={`${sys.cpu.usage.toFixed(1)}%`} />
          <InfoRow label="Temperature" value={`${sys.cpu.temperature.toFixed(1)}°C`} />
        </InfoSection>

        <InfoSection icon={MemoryStick} title="Memory">
          <InfoRow label="Total" value={formatBytes(sys.memory.total)} />
          <InfoRow label="Used" value={formatBytes(sys.memory.used)} />
          <InfoRow label="Free" value={formatBytes(sys.memory.free)} />
          <InfoRow label="Usage" value={`${sys.memory.percent.toFixed(1)}%`} />
        </InfoSection>

        <InfoSection icon={HardDrive} title="Storage">
          {sys.storage.map((disk) => (
            <div key={disk.mount}>
              <InfoRow label={`Mount: ${disk.mount}`} value={`${disk.percent.toFixed(1)}% used`} />
            </div>
          ))}
        </InfoSection>

        <InfoSection icon={Network} title="Network">
          {sys.network.map((net) => (
            <div key={net.interface}>
              <InfoRow label="Interface" value={net.interface} />
              <InfoRow label="IP" value={net.ip} />
              <InfoRow label="Status" value={net.status} />
              <InfoRow
                label="RX / TX"
                value={`${formatBytes(net.rxBytes)} / ${formatBytes(net.txBytes)}`}
              />
            </div>
          ))}
        </InfoSection>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server size={16} />
              Load Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {sys.loadAverage.map((load, i) => (
                <div key={i} className="flex flex-col items-center rounded-lg bg-app px-4 py-3">
                  <span className="text-lg font-semibold text-[#78A9FF]">{load.toFixed(2)}</span>
                  <span className="text-xs text-muted">{i === 0 ? "1 min" : i === 1 ? "5 min" : "15 min"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
