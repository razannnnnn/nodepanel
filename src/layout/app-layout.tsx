import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuthStore } from "@/stores/auth";
import { useMetricsFeed } from "@/hooks/useMetricsFeed";

export function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const restore = useAuthStore((s) => s.restore);
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    restore().then(() => setChecked(true));
  }, [token, restore, navigate]);

  useMetricsFeed(Boolean(token) && checked);

  if (!token || !checked) {
    return (
      <div
        className="flex h-screen items-center justify-center text-sm"
        style={{ backgroundColor: "var(--bg-app)", color: "var(--text-secondary)" }}
      >
        Connecting…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-app)" }}>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
