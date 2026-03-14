"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { cn } from "@client-pulse/ui/lib/utils";
import { User, Shield, Bell, Settings } from "lucide-react";

export type ProfileTab =
  | "overview"
  | "security"
  | "notifications"
  | "preferences";

const navigation = [
  {
    id: "overview",
    label: "Overview",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: Settings,
  },
] as const;

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileSidebar({
  activeTab,
  onTabChange,
}: ProfileSidebarProps) {
  return (
    <Card className="sticky top-6 shadow-md border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as ProfileTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}
