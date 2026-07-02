import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DockerIcon } from "@/components/ui/docker-icon";

export function DockerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Docker</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Docker container management — requires Docker plugin
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#78A9FF]/10 mb-4">
            <DockerIcon width={24} height={24} className="text-[#78A9FF]" />
          </div>
          <p className="text-sm mb-4 text-secondary">
            Docker plugin is not installed
          </p>
          <Button>Install Docker Plugin</Button>
        </CardContent>
      </Card>
    </div>
  );
}
