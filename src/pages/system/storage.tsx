import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { HardDrive } from "lucide-react";

export function StoragePage() {
  const sys = useSystemMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Storage</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Disk usage and filesystem information
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sys.storage.map((disk) => (
          <Card key={disk.mount}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive size={16} />
                {disk.mount}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">Filesystem</span>
                <span className="font-mono" style={{ color: "var(--text-primary)" }}>{disk.fs}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Usage</span>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{disk.percent.toFixed(1)}%</span>
                </div>
                <Progress value={disk.percent} indicatorColor={disk.percent > 80 ? "#F87171" : "#78A9FF"} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-app p-3 text-center">
                  <p className="text-xs text-muted">Total</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formatBytes(disk.total)}</p>
                </div>
                <div className="rounded-lg bg-app p-3 text-center">
                  <p className="text-xs text-muted">Used</p>
                  <p className="mt-1 text-sm font-semibold text-[#78A9FF]">{formatBytes(disk.used)}</p>
                </div>
                <div className="rounded-lg bg-app p-3 text-center">
                  <p className="text-xs text-muted">Free</p>
                  <p className="mt-1 text-sm font-semibold text-[#4ADE80]">{formatBytes(disk.free)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
