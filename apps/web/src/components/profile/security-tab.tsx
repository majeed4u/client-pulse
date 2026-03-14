"use client";

import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import { Separator } from "@client-pulse/ui/components/separator";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Key,
  Lock,
} from "lucide-react";

interface SecurityTabProps {
  user: {
    twoFactorEnabled?: boolean | null;
  };
  onEnable2FA: () => void;
  onDisable2FA: () => void;
}

export function SecurityTab({
  user,
  onEnable2FA,
  onDisable2FA,
}: SecurityTabProps) {
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingPassword(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoadingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsLoadingPassword(false);
      return;
    }

    try {
      await authClient.changePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        revokeOtherSessions: true,
      });
      toast.success("Password updated successfully");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <>
      {/* Password Card */}
      <Card className="shadow-lg border-border/50 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-500/60" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Change Password</CardTitle>
              <CardDescription className="mt-1.5">
                Ensure your account is using a strong password
              </CardDescription>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                placeholder="Enter a strong password"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters recommended
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Re-enter your new password"
                className="h-11"
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoadingPassword}
                size="lg"
                className="shadow-md"
              >
                {isLoadingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* 2FA Card */}
      <Card className="shadow-lg border-border/50 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-500/60" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="mt-1.5">
                Add an extra layer of security to your account
              </CardDescription>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.twoFactorEnabled ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
                    2FA is Enabled
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your account has an extra layer of protection. You'll need
                    to enter a verification code from your authenticator app
                    when signing in.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={onDisable2FA}
                size="lg"
                className="shadow-md"
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <ShieldOff className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-amber-700 dark:text-amber-400">
                    2FA is Not Enabled
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enable two-factor authentication to add an extra layer of
                    security to your account. You'll need to enter a
                    verification code from your authenticator app when signing
                    in.
                  </p>
                </div>
              </div>
              <Button onClick={onEnable2FA} size="lg" className="shadow-md">
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
