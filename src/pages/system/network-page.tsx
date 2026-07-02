import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import { Network } from "lucide-react";

export function NetworkPage() {
  const sys = useSystemMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Network</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Network interfaces and traffic information
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sys.network.map((net) => (
          <Card key={net.interface}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network size={16} />
                {net.interface}
                <Badge variant={net.status === "up" ? "success" : "danger"} className="ml-2">
                  {net.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-app p-4">
                  <p className="text-xs text-muted">IP Address</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{net.ip}</p>
                </div>
                <div className="rounded-lg bg-app p-4">
                  <p className="text-xs text-muted">Status</p>
                  <p className="mt-1 text-sm font-semibold text-[#4ADE80] capitalize">{net.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-app p-4">
                  <p className="text-xs text-muted">Downloaded</p>
                  <p className="mt-1 text-sm font-semibold text-[#4ADE80]">{formatBytes(net.rxBytes)}</p>
                  <p className="text-xs text-muted mt-1">
                    {formatBytes(net.rxSpeed)}/s
                  </p>
                </div>
                <div className="rounded-lg bg-app p-4">
                  <p className="text-xs text-muted">Uploaded</p>
                  <p className="mt-1 text-sm font-semibold text-[#78A9FF]">{formatBytes(net.txBytes)}</p>
                  <p className="text-xs text-muted mt-1">
                    {formatBytes(net.txSpeed)}/s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
