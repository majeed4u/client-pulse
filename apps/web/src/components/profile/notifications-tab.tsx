"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Bell } from "lucide-react";

export function NotificationsTab() {
  return (
    <Card className="shadow-lg border-border/50">
      <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-500/60" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Notifications</CardTitle>
            <CardDescription className="mt-1.5">
              Manage how you receive notifications
            </CardDescription>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
            <Bell className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Notification settings will be available soon. You'll be able to
            manage email and push notifications here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
