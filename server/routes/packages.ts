import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { runSafe } from "../lib/shell";

const packages = new Hono();
packages.use("*", authMiddleware);

packages.get("/", (c) => {
  const out = runSafe("dpkg-query -W -f '${Package}\\t${Version}\\t${Status}\\t${Description}\\n' 2>/dev/null");
  if (!out) return c.json([]);

  const upgradableRaw = runSafe("apt list --upgradable 2>/dev/null | grep -v '^Listing'");
  const upgradable = new Set<string>();
  for (const line of upgradableRaw.split("\n")) {
    const m = line.match(/^(\S+)/);
    if (m) upgradable.add(m[1]);
  }

  const list = out.split("\n").filter(Boolean).slice(0, 500).map((line) => {
    const parts = line.split("\t");
    const name = parts[0] || "";
    const version = parts[1] || "";
    const status = parts[2] || "";
    const description = (parts.slice(3).join(" ") || "").slice(0, 120);
    const installed = status.includes("installed");
    return {
      name,
      version,
      newVersion: upgradable.has(name) ? name : undefined,
      status: upgradable.has(name) ? "upgradable" : installed ? "installed" : "not-installed",
      description,
    };
  });

  return c.json(list);
});

packages.post("/update", async (c) => {
  const { packages: pkgList } = await c.req.json();
  if (!Array.isArray(pkgList) || pkgList.length === 0) {
    return c.json({ error: "Package list required" }, 400);
  }
  const names = pkgList.join(" ");
  const out = runSafe(`apt-get install -y ${names} 2>&1 | tail -20`, 120000);
  return c.json({ ok: true, output: out });
});

packages.post("/upgrade", async (c) => {
  const out = runSafe("apt-get upgrade -y 2>&1 | tail -20", 300000);
  return c.json({ ok: true, output: out });
});

packages.post("/remove", async (c) => {
  const { packages: pkgList } = await c.req.json();
  if (!Array.isArray(pkgList) || pkgList.length === 0) {
    return c.json({ error: "Package list required" }, 400);
  }
  const names = pkgList.join(" ");
  const out = runSafe(`apt-get remove -y ${names} 2>&1 | tail -20`, 120000);
  return c.json({ ok: true, output: out });
});

export { packages as packagesRoutes };
