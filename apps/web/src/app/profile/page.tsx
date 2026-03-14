"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Loader2, User, UserCircle } from "lucide-react";
import {
  ProfileSidebar,
  type ProfileTab,
} from "@/components/profile/profile-sidebar";
import { OverviewTab } from "@/components/profile/overview-tab";
import { SecurityTab } from "@/components/profile/security-tab";
import { NotificationsTab } from "@/components/profile/notifications-tab";
import { PreferencesTab } from "@/components/profile/preferences-tab";
import { useTwoFactorDialogs } from "@/components/profile/two-factor-dialogs";

function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const twoFactor = useTwoFactorDialogs();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <UserCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>
              Please sign in to view your profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <a href="/sign-in">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "overview" && <OverviewTab user={user} />}
            {activeTab === "security" && (
              <SecurityTab
                user={user}
                onEnable2FA={twoFactor.handleEnable2FA}
                onDisable2FA={twoFactor.handleDisable2FA}
              />
            )}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "preferences" && <PreferencesTab />}
          </div>
        </div>

        {twoFactor.dialogs}
      </div>
    </div>
  );
}

export default ProfilePage;
