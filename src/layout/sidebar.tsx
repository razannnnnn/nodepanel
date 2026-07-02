import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Monitor,
  Activity,
  Info,
  Server,
  HardDrive,
  Network,
  FileText,
  Package,
  Terminal,
  Puzzle,
  Shield,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar";
import { DockerIcon } from "@/components/ui/docker-icon";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
  {
    label: "System",
    to: "/system",
    icon: <Monitor size={18} />,
    children: [
      { label: "Info", to: "/system/info", icon: <Info size={16} /> },
      { label: "Processes", to: "/system/processes", icon: <Activity size={16} /> },
      { label: "Services", to: "/system/services", icon: <Server size={16} /> },
      { label: "Storage", to: "/system/storage", icon: <HardDrive size={16} /> },
      { label: "Network", to: "/system/network", icon: <Network size={16} /> },
      { label: "Logs", to: "/system/logs", icon: <FileText size={16} /> },
      { label: "Packages", to: "/system/packages", icon: <Package size={16} /> },
    ],
  },
  {
    label: "Plugins",
    to: "/plugins",
    icon: <Puzzle size={18} />,
    children: [
      { label: "Terminal", to: "/plugins/terminal", icon: <Terminal size={16} /> },
      { label: "Docker", to: "/plugins/docker", icon: <DockerIcon width={16} height={16} /> },
    ],
  },
  { label: "Security", to: "/security", icon: <Shield size={18} /> },
];

function NavItemLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === item.to;
  const isChildActive = item.children?.some((c) => location.pathname === c.to);
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(isChildActive);

  function handleParentClick() {
    setIsOpen((prev) => !prev);
  }

  if (!hasChildren) {
    return (
      <NavLink
        to={item.to}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-[#78A9FF]"
            : "hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]",
        )}
        style={
          isActive
            ? { backgroundColor: "var(--color-primary-muted)", color: "#78A9FF" }
            : { color: "var(--text-secondary)" }
        }
        title={collapsed ? item.label : undefined}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={handleParentClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive || isChildActive
            ? "text-[#78A9FF]"
            : "hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]",
        )}
        style={
          isActive || isChildActive
            ? { backgroundColor: "var(--color-primary-muted)", color: "#78A9FF" }
            : { color: "var(--text-secondary)" }
        }
        title={collapsed ? item.label : undefined}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <span className="shrink-0 transition-transform duration-200" style={{ color: "var(--text-muted)" }}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </>
        )}
      </button>
      {!collapsed && isOpen && (
        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l pl-3" style={{ borderColor: "var(--border-default)" }}>
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-all duration-200",
                  isActive ? "text-[#78A9FF]" : "hover:text-[var(--text-secondary)]",
                )
              }
              style={({ isActive }: { isActive: boolean }) =>
                isActive
                  ? { backgroundColor: "var(--color-primary-muted)", color: "#78A9FF" }
                  : { color: "var(--text-muted)" }
              }
            >
              <span className="shrink-0">{child.icon}</span>
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col transition-all duration-300 lg:static lg:z-auto",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ backgroundColor: "var(--bg-sidebar)", borderRightColor: "var(--border-default)", borderRightWidth: "1px" }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center px-4"
          style={{ borderBottomWidth: "1px", borderBottomColor: "var(--border-default)" }}
        >
          {collapsed ? (
            <button
              onClick={toggle}
              className="flex w-full items-center justify-center h-full"
              title="Expand sidebar"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: "var(--color-primary-muted)" }}>
                <span className="text-xs font-bold text-[#78A9FF]">N</span>
              </div>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: "var(--color-primary-muted)" }}>
                  <span className="text-xs font-bold text-[#78A9FF]">N</span>
                </div>
                <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>NodePanel</span>
              </div>
              <button
                onClick={() => (mobileOpen ? setMobileOpen(false) : toggle())}
                className="rounded-md p-1 transition-colors hover:bg-[var(--bg-card)] shrink-0 lg:ml-0"
                style={{ color: "var(--text-muted)" }}
              >
                {mobileOpen ? <X size={16} /> : <ChevronLeft size={16} />}
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" style={{ scrollbarWidth: "thin" }}>
          {navItems.map((item) => (
            <NavItemLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t p-3" style={{ borderColor: "var(--border-default)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>NodePanel v0.1.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
