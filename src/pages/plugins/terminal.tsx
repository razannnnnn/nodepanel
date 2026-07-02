import { Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TerminalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Terminal</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Web terminal — requires Terminal plugin
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#78A9FF]/10 mb-4">
            <Terminal size={24} className="text-[#78A9FF]" />
          </div>
          <p className="text-sm mb-4 text-secondary">
            Terminal plugin is not installed
          </p>
          <Button>Install Terminal Plugin</Button>
        </CardContent>
      </Card>
    </div>
  );
}
