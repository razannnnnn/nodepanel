import { Key, FileText, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Security</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Security settings, audit log, and access control
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key size={16} />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">2FA</span>
              <Badge variant="secondary">P1 &mdash; Coming soon</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Session</span>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={16} />
              RBAC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Admin</span>
              <Badge variant="success">1 user</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Viewer</span>
              <Badge variant="secondary">0 users</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={16} />
              Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Total events</span>
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Retention</span>
              <span className="text-sm font-medium">90 days</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
