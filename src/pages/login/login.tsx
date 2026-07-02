import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/theme";
import { Sun, Moon } from "lucide-react";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // ponytail: mock login — replace with real auth when backend exists
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-app)" }}
    >
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div
        className="w-full max-w-sm rounded-xl border p-8 shadow-lg"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-default)" }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--color-primary-muted)" }}>
            <span className="text-lg font-bold text-[#78A9FF]">N</span>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            NodePanel
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Sign in to your server dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:border-[#78A9FF]/50"
              style={{
                backgroundColor: "var(--bg-input)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-10 w-full rounded-lg border px-3 pr-10 text-sm outline-none transition-colors focus:border-[#78A9FF]/50"
                style={{
                  backgroundColor: "var(--bg-input)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} />
                Sign In
              </span>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          NodePanel v0.1.0 &middot; Modern Linux Server Dashboard
        </p>
      </div>
    </div>
  );
}
