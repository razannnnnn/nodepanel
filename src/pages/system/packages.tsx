import { useState, useMemo } from "react";
import { Search, ArrowUp, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PackageInfo } from "@/types/system";

const MOCK_PACKAGES: PackageInfo[] = [
  { name: "nginx", version: "1.24.0-2", status: "installed", description: "Nginx web server" },
  { name: "docker-ce", version: "24.0.7", newVersion: "25.0.0", status: "upgradable", description: "Docker CE" },
  { name: "nodejs", version: "20.11.0", newVersion: "20.12.0", status: "upgradable", description: "Node.js" },
  { name: "python3", version: "3.11.2", status: "installed", description: "Python interpreter" },
  { name: "openssh-server", version: "9.2p1-2", status: "installed", description: "OpenSSH server" },
  { name: "ufw", version: "0.36.2", status: "installed", description: "Firewall" },
  { name: "curl", version: "7.88.1", status: "installed", description: "URL transfer utility" },
  { name: "git", version: "2.39.2", newVersion: "2.43.0", status: "upgradable", description: "Version control" },
  { name: "htop", version: "3.2.2-1", status: "installed", description: "Process viewer" },
  { name: "fail2ban", version: "1.0.2", status: "installed", description: "Intrusion prevention" },
];

export function PackagesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      MOCK_PACKAGES.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const upgradable = filtered.filter((p) => p.status === "upgradable");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Packages</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Package manager — apt wrapper
        </p>
      </div>

      {/* Upgrade banner */}
      {upgradable.length > 0 && (
        <div className="rounded-xl border border-[#FBBF24]/20 bg-[#FBBF24]/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUp size={16} className="text-[#FBBF24]" />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {upgradable.length} package{upgradable.length > 1 ? "s" : ""} can be upgraded
              </span>
            </div>
            <Button size="sm" variant="default">
              <ArrowUp size={14} />
              Upgrade All
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {upgradable.map((p) => (
              <span key={p.name} className="text-xs text-secondary">
                {p.name} ({p.version} → {p.newVersion})
              </span>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Installed Packages</CardTitle>
            <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search packages..."
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((pkg) => (
                  <tr key={pkg.name} className="bg-card-hover transition-colors">
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{pkg.name}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{pkg.description}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                      {pkg.version}
                      {pkg.newVersion && (
                        <span className="ml-1 text-[#4ADE80]">→ {pkg.newVersion}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={pkg.status === "upgradable" ? "warning" : "secondary"}
                      >
                        {pkg.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {pkg.status === "upgradable" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Upgrade">
                            <ArrowUp size={14} className="text-[#4ADE80]" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Remove">
                          <Trash2 size={14} className="text-[#F87171]" />
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
