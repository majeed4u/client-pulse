"use client";

import { trpc } from "@/utils/trpc";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@client-pulse/ui/components/select";
import { Separator } from "@client-pulse/ui/components/separator";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"];

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  AGENCY: "Agency",
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const queryClient = useQueryClient();

  const { data: workspace, isLoading } = useQuery(
    trpc.workspace.get.queryOptions(),
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setSlug(workspace.slug);
      setCurrency(workspace.defaultCurrency);
    }
  }, [workspace]);

  const updateMutation = useMutation(
    trpc.workspace.update.mutationOptions({
      onSuccess: () => {
        toast.success(t("saved"));
        queryClient.invalidateQueries({ queryKey: ["workspace"] });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("description")}
        </p>
      </div>

      {/* Workspace details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("workspaceTitle")}</CardTitle>
          <CardDescription>{t("workspaceDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">{t("nameLabel")}</Label>
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Studio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-slug">{t("slugLabel")}</Label>
            <Input
              id="ws-slug"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="acme-studio"
            />
            <p className="text-xs text-muted-foreground">{t("slugHint")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ws-currency">{t("currencyLabel")}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="ws-currency" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() =>
                updateMutation.mutate({ name, slug, defaultCurrency: currency })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {t("saveChanges")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle>{t("planTitle")}</CardTitle>
          <CardDescription>{t("planDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {PLAN_LABELS[workspace?.plan ?? "FREE"]} {t("plan")}
              </p>
              <p className="text-sm text-muted-foreground">
                {workspace?.plan === "FREE"
                  ? t("freePlanHint")
                  : t("paidPlanHint")}
              </p>
            </div>
            {workspace?.plan === "FREE" && (
              <Button size="sm">{t("upgradePlan")}</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
          <CardDescription>{t("dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <p className="text-sm text-muted-foreground mb-3">
            {t("dangerZoneHint")}
          </p>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/10">
            {t("deleteWorkspace")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
