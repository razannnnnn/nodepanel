import { useState, useMemo, useEffect } from "react";
import { Play, Square, RefreshCw, ToggleLeft, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceInfo } from "@/types/system";
import { api } from "@/lib/api";

export function ServicesPage() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setServices(await api<ServiceInfo[]>("/api/services"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load services");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (name: string, action: "start" | "stop" | "restart") => {
    try {
      await api(`/api/services/${encodeURIComponent(name)}/${action}`, { method: "POST" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to ${action} ${name}`);
    }
  };

  const filtered = useMemo(
    () =>
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, services],
  );

  const stateBadge = (state: ServiceInfo["state"]) => {
    const map: Record<string, "success" | "danger" | "warning"> = {
      running: "success",
      stopped: "danger",
      failed: "warning",
    };
    return <Badge variant={map[state]}>{state}</Badge>;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#F87171", color: "#F87171" }}>
          {error}
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold">Services</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage systemd services
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>System Services</CardTitle>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-60 rounded-lg border border-default bg-app pl-9 pr-3 text-sm focus:border-[#78A9FF]/50 focus:outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">State</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Enabled</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((svc) => (
                  <tr key={svc.name} className="bg-card-hover transition-colors">
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{svc.name}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{svc.description}</td>
                    <td className="px-4 py-3">{stateBadge(svc.state)}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{svc.enabled ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => act(svc.name, svc.state === "running" ? "stop" : "start")}
                          title={svc.state === "running" ? "Stop" : "Start"}
                        >
                          {svc.state === "running" ? (
                            <Square size={14} className="text-[#F87171]" />
                          ) : (
                            <Play size={14} className="text-[#4ADE80]" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Restart"
                          onClick={() => act(svc.name, "restart")}
                        >
                          <RefreshCw size={14} className="text-[#78A9FF]" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Toggle enable">
                          <ToggleLeft size={14} className="text-secondary" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
