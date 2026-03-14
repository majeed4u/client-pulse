"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Settings } from "lucide-react";

export function PreferencesTab() {
  return (
    <Card className="shadow-lg border-border/50">
      <div className="h-2 bg-gradient-to-r from-cyan-500 to-cyan-500/60" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Preferences</CardTitle>
            <CardDescription className="mt-1.5">
              Customize your app experience
            </CardDescription>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
            <Settings className="h-6 w-6 text-cyan-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            App preferences and customization options will be available soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
