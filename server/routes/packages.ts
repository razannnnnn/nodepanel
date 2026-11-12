import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { runSafe } from "../lib/shell";

const packages = new Hono();
packages.use("*", authMiddleware);

interface Pkg {
  name: string;
  version: string;
  status: string;
  description: string;
}

function parseDpkg(out: string): Pkg[] {
  const rows: Pkg[] = [];
  let current: Pkg | null = null;

  for (const line of out.split("\n")) {
    if (line.includes("\t")) {
      const parts = line.split("\t");
      current = {
        name: parts[0] ?? "",
        version: parts[1] ?? "",
        status: parts[2] ?? "",
        description: (parts[3] ?? "").trim(),
      };
      rows.push(current);
    } else if (current && line.trim()) {
      // dpkg emits one continuation line per package that repeats the synopsis
      // before the long description; only keep the leading paragraph.
      if (current.description.includes(" ")) continue;
      current.description += ` ${line.trim()}`;
    }
  }

  return rows;
}

function parseUpgradable(out: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of out.split("\n")) {
    const m = line.match(/^(\S+)\/\S+\s+(\S+)\s+/);
    if (m) map.set(m[1]!, m[2]!);
  }
  return map;
}

packages.get("/", (c) => {
  const out = runSafe(
    "dpkg-query -W -f '${Package}\\t${Version}\\t${Status}\\t${Description}\\n' 2>/dev/null",
    30000,
  );
  if (!out) return c.json([]);

  const upgradable = parseUpgradable(runSafe("apt list --upgradable 2>/dev/null", 60000));

  const list = parseDpkg(out)
    .slice(0, 1000)
    .map((p) => {
      const candidate = upgradable.get(p.name);
      return {
        name: p.name,
        version: p.version,
        newVersion: candidate,
        status: candidate ? "upgradable" : p.status.includes("installed") ? "installed" : "not-installed",
        description: p.description.replace(/\s+/g, " ").trim().slice(0, 120),
      };
    });

  return c.json(list);
});

packages.post("/update", async (c) => {
  const { packages: pkgList } = await c.req.json<{ packages?: string[] }>();
  if (!Array.isArray(pkgList) || pkgList.length === 0) {
    return c.json({ error: "Package list required" }, 400);
  }
  const names = pkgList.map((n) => n.replace(/[^A-Za-z0-9.+:_-]/g, "")).filter(Boolean);
  if (names.length === 0) return c.json({ error: "No valid package names" }, 400);

  const out = runSafe(`apt-get install -y ${names.join(" ")} 2>&1 | tail -20`, 300000);
  return c.json({ ok: true, output: out });
});

packages.post("/upgrade", async (c) => {
  const out = runSafe("apt-get upgrade -y 2>&1 | tail -20", 600000);
  return c.json({ ok: true, output: out });
});

packages.post("/remove", async (c) => {
  const { packages: pkgList } = await c.req.json<{ packages?: string[] }>();
  if (!Array.isArray(pkgList) || pkgList.length === 0) {
    return c.json({ error: "Package list required" }, 400);
  }
  const names = pkgList.map((n) => n.replace(/[^A-Za-z0-9.+:_-]/g, "")).filter(Boolean);
  if (names.length === 0) return c.json({ error: "No valid package names" }, 400);

  const out = runSafe(`apt-get remove -y ${names.join(" ")} 2>&1 | tail -20`, 300000);
  return c.json({ ok: true, output: out });
});

export { packages as packagesRoutes };
