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
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Shield,
  ShieldCheck,
  User,
  Globe,
  UserCircle,
  Calendar,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface OverviewTabProps {
  user: {
    name: string;
    email: string;
    twoFactorEnabled?: boolean | null;
    createdAt?: Date;
  };
}

export function OverviewTab({ user }: OverviewTabProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleProfileUpdate = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { error } = await authClient.updateUser({
        name: editName.trim(),
      });

      if (error) {
        toast.error(error.message || "Failed to update profile");
      } else {
        toast.success("Profile updated successfully");
        setIsEditingProfile(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <>
      {/* Profile Info Card */}
      <Card className="shadow-lg border-border/50 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              <CardDescription className="mt-1.5">
                View and manage your personal information
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isEditingProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditName(user.name);
                    setIsEditingProfile(true);
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleProfileUpdate}
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditName("");
                    }}
                    disabled={isUpdatingProfile}
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </Label>
                {isEditingProfile ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11"
                    disabled={isUpdatingProfile}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleProfileUpdate();
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium text-base">{user.name}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <p className="font-medium text-base">{user.email}</p>
                </div>
              </div>
            </div>

            {user.twoFactorEnabled && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Two-factor authentication is enabled
                  </p>
                  <p className="text-sm text-green-600/70 dark:text-green-400/70">
                    Your account has an extra layer of security
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Account Status</CardDescription>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Active</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Security Level</CardDescription>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {user.twoFactorEnabled ? (
                <span className="text-green-600">High</span>
              ) : (
                <span className="text-amber-600">Medium</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardDescription>Member Since</CardDescription>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
