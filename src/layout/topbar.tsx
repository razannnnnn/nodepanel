import { Menu, RefreshCw, Bell, Sun, Moon } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar";
import { useConnectionStore } from "@/stores/connection";
import { useThemeStore } from "@/stores/theme";
import { StatusDot } from "@/components/ui/status-dot";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const connectionStatus = useConnectionStore((s) => s.status);
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <header
      className="flex h-14 items-center justify-between border-b px-4 lg:px-6 backdrop-blur-sm"
      style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-topbar)" }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={18} />
        </Button>
        <StatusDot status={connectionStatus} />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button variant="ghost" size="icon">
          <RefreshCw size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#78A9FF]" />
        </Button>
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#78A9FF]/10 text-xs font-medium text-[#78A9FF]">
          A
        </div>
      </div>
    </header>
  );
}
