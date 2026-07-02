import { useState, useMemo } from "react";
import { Search, ArrowUpDown, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProcessInfo } from "@/types/system";

const MOCK_PROCESSES: ProcessInfo[] = Array.from({ length: 50 }, (_, i) => ({
  pid: 1000 + i,
  name: ["systemd", "sshd", "nginx", "node", "python3", "bash", "cron", "rsyslogd", "dbus-daemon", "NetworkManager"][i % 10]!,
  cpu: Math.random() * 20,
  memory: Math.random() * 15,
  state: ["running", "sleeping", "running", "running", "stopped"][i % 5]!,
  user: ["root", "www-data", "nobody", "messagebus", "razan"][i % 5]!,
}));

type SortKey = "pid" | "name" | "cpu" | "memory" | "state";

export function ProcessesPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("cpu");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    const list = query
      ? MOCK_PROCESSES.filter(
          (p) =>
            p.name.toLowerCase().includes(query) || String(p.pid).includes(query),
        )
      : MOCK_PROCESSES;

    return [...list].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [search, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const SortHeader = ({ label, sort }: { label: string; sort: SortKey }) => (
    <button
      className="flex items-center gap-1 text-xs font-medium text-muted hover:text-secondary"
      onClick={() => toggleSort(sort)}
    >
      {label}
      {sortKey === sort && (
        <ArrowUpDown size={12} className={sortAsc ? "rotate-180" : ""} />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Processes</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Monitor and manage running processes
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Running Processes</CardTitle>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search processes..."
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
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="PID" sort="pid" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="Name" sort="name" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader label="CPU %" sort="cpu" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader label="MEM %" sort="memory" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortHeader label="State" sort="state" />
                  </th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((proc) => (
                  <tr key={proc.pid} className="bg-card-hover transition-colors">
                    <td className="px-4 py-2.5 font-mono text-sm text-secondary">{proc.pid}</td>
                    <td className="px-4 py-2.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{proc.name}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm" style={{ color: "var(--text-primary)" }}>
                      {proc.cpu.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm" style={{ color: "var(--text-primary)" }}>
                      {proc.memory.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={
                          proc.state === "running"
                            ? "success"
                            : proc.state === "stopped"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {proc.state}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-secondary">{proc.user}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <XCircle size={14} className="text-[#F87171]" />
                      </Button>
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
