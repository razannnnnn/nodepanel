import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/layout/app-layout";
import { DashboardPage } from "@/pages/dashboard/dashboard";
import { SystemInfoPage } from "@/pages/system/system-info";
import { ProcessesPage } from "@/pages/system/processes";
import { ServicesPage } from "@/pages/system/services";
import { StoragePage } from "@/pages/system/storage";
import { NetworkPage } from "@/pages/system/network-page";
import { LogsPage } from "@/pages/system/logs";
import { PackagesPage } from "@/pages/system/packages";
import { TerminalPage } from "@/pages/plugins/terminal";
import { DockerPage } from "@/pages/plugins/docker";
import { SecurityPage } from "@/pages/security/security-page";
import { LoginPage } from "@/pages/login/login";
import { useThemeStore } from "@/stores/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.className = theme;
  }, [theme]);
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="system/info" element={<SystemInfoPage />} />
              <Route path="system/processes" element={<ProcessesPage />} />
              <Route path="system/services" element={<ServicesPage />} />
              <Route path="system/storage" element={<StoragePage />} />
              <Route path="system/network" element={<NetworkPage />} />
              <Route path="system/logs" element={<LogsPage />} />
              <Route path="system/packages" element={<PackagesPage />} />
              <Route path="plugins/terminal" element={<TerminalPage />} />
              <Route path="plugins/docker" element={<DockerPage />} />
              <Route path="security" element={<SecurityPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeInitializer>
    </QueryClientProvider>
  );
}
