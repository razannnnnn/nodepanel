import { useState, useMemo } from "react";
import { Play, Square, RefreshCw, ToggleLeft, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceInfo } from "@/types/system";

const MOCK_SERVICES: ServiceInfo[] = [
  { name: "ssh", state: "running", enabled: true, description: "OpenSSH server" },
  { name: "nginx", state: "running", enabled: true, description: "Nginx web server" },
  { name: "docker", state: "running", enabled: true, description: "Docker container engine" },
  { name: "ufw", state: "running", enabled: true, description: "Uncomplicated firewall" },
  { name: "cron", state: "running", enabled: true, description: "Regular background programs" },
  { name: "rsyslog", state: "running", enabled: true, description: "System log daemon" },
  { name: "systemd-journald", state: "running", enabled: true, description: "Journal service" },
  { name: "dbus", state: "running", enabled: true, description: "D-Bus message bus" },
  { name: "bluetooth", state: "stopped", enabled: false, description: "Bluetooth service" },
  { name: "NetworkManager", state: "running", enabled: true, description: "Network manager" },
];

export function ServicesPage() {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState(MOCK_SERVICES);

  const filtered = useMemo(
    () =>
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, services],
  );

  function toggleService(name: string) {
    setServices((prev) =>
      prev.map((s) =>
        s.name === name
          ? { ...s, state: s.state === "running" ? "stopped" : "running" }
          : s,
      ),
    );
  }

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
                          onClick={() => toggleService(svc.name)}
                          title={svc.state === "running" ? "Stop" : "Start"}
                        >
                          {svc.state === "running" ? (
                            <Square size={14} className="text-[#F87171]" />
                          ) : (
                            <Play size={14} className="text-[#4ADE80]" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Restart">
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
