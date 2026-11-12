import { useState, useMemo, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry } from "@/types/system";
import { api } from "@/lib/api";

const priorityLabel: Record<number, string> = {
  0: "emerg",
  1: "alert",
  2: "crit",
  3: "err",
  4: "warning",
  5: "notice",
  6: "info",
  7: "debug",
};

const priorityColor: Record<number, "danger" | "warning" | "default" | "secondary"> = {
  0: "danger",
  1: "danger",
  2: "danger",
  3: "danger",
  4: "warning",
  5: "default",
  6: "default",
  7: "secondary",
};

export function LogsPage() {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLogs(await api<LogEntry[]>("/api/logs?lines=500"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load logs");
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPriority !== null && log.priority !== filterPriority) return false;
        return true;
      }),
    [search, filterPriority, logs],
  );

  const exportLogs = () => {
    const text = filtered
      .map((l) => `${l.timestamp} [${priorityLabel[l.priority] ?? l.priority}] ${l.message}`)
      .join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `nodepanel-logs-${new Date().toISOString().slice(0, 19)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "#F87171", color: "#F87171" }}>
          {error}
        </div>
      )}
      <div>
        <h1 className="text-xl font-semibold">Logs</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          System logs viewer (journalctl & syslog)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CardTitle>System Logs</CardTitle>
              <div className="flex gap-1">
                {[6, 5, 4, 3].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                      filterPriority === p
                        ? "text-[#78A9FF]"
                        : "text-muted hover:text-secondary"
                    }`}
                    style={filterPriority === p ? { backgroundColor: "var(--color-primary-muted)" } : {}}
                  >
                    {priorityLabel[p]?.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-60 rounded-lg border border-default bg-app pl-9 pr-3 text-sm focus:border-[#78A9FF]/50 focus:outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
              <Button variant="secondary" size="sm" onClick={exportLogs}>
                <Download size={14} />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-[var(--border-light)]">
              {filtered.map((log, i) => (
                <div key={i} className="flex gap-3 px-4 py-2.5 bg-card-hover font-mono text-xs">
                  <span className="w-16 shrink-0 text-muted">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="w-16 shrink-0">
                    <Badge variant={priorityColor[log.priority] ?? "secondary"}>
                      {priorityLabel[log.priority] ?? "?"}
                    </Badge>
                  </span>
                  <span className="w-14 shrink-0 text-secondary">{log.facility}</span>
                  <span style={{ color: "var(--text-primary)" }}>{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
