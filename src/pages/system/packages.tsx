import { useState, useMemo, useEffect } from "react";
import { Search, ArrowUp, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PackageInfo } from "@/types/system";
import { api } from "@/lib/api";

export function PackagesPage() {
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setPackages(await api<PackageInfo[]>("/api/packages"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load packages");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const run = async (path: string, body: unknown, label: string) => {
    setBusy(true);
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(
    () =>
      packages.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, packages],
  );

  const upgradable = filtered.filter((p) => p.status === "upgradable");

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#F87171", color: "#F87171" }}>
          {error}
        </div>
      )}
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
            <Button
              size="sm"
              variant="default"
              disabled={busy}
              onClick={() => run("/api/packages/upgrade", {}, "Upgrade")}
            >
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Upgrade"
                            disabled={busy}
                            onClick={() => run("/api/packages/update", { packages: [pkg.name] }, "Upgrade")}
                          >
                            <ArrowUp size={14} className="text-[#4ADE80]" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Remove"
                          disabled={busy}
                          onClick={() => run("/api/packages/remove", { packages: [pkg.name] }, "Remove")}
                        >
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
