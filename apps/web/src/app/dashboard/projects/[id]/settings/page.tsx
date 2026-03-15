"use client";

import { ProjectForm } from "@/components/projects/project-form";
import { trpc } from "@/utils/trpc";
import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Label } from "@client-pulse/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@client-pulse/ui/components/select";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, FileText, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("projects");

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const { data: project, isLoading } = useQuery(
    trpc.projects.get.queryOptions({ id }),
  );

  const updateMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: () => {
        toast.success("Project updated");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const archiveMutation = useMutation(
    trpc.projects.archive.mutationOptions({
      onSuccess: () => {
        toast.success("Project archived");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        router.push("/dashboard/projects" as any);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const regenerateMutation = useMutation(
    trpc.projects.regenerateToken.mutationOptions({
      onSuccess: () => {
        toast.success("Portal link regenerated — old link is now invalid");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setConfirmRegenerate(false);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleStatusChange = (status: string | null) => {
    if (!status) return;
    updateMutation.mutate({ id, status: status as any });
  };

  const handlePortalToggle = (enabled: string | null) => {
    if (enabled === null) return;
    updateMutation.mutate({ id, portalEnabled: enabled === "true" });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 flex flex-col items-center py-24 gap-3 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-lg font-medium">{t("notFound")}</p>
        <Button render={<Link href={"/dashboard/projects" as any} />}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          render={<Link href={`/dashboard/projects/${id}` as any} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("settingsTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
        </div>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settingsDetailsTitle")}</CardTitle>
          <CardDescription>{t("settingsDetailsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            mode="edit"
            initialData={{
              id: project.id,
              name: project.name,
              description: project.description,
              clientId: project.client.id,
              deadline: project.deadline,
            }}
          />
        </CardContent>
      </Card>

      {/* Status + portal */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settingsStatusTitle")}</CardTitle>
          <CardDescription>{t("settingsStatusDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settingsProjectStatus")}</Label>
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t("status.ACTIVE")}</SelectItem>
                <SelectItem value="COMPLETED">
                  {t("status.COMPLETED")}
                </SelectItem>
                <SelectItem value="ON_HOLD">{t("status.ON_HOLD")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("settingsPortalLabel")}</Label>
            <Select
              value={project.portalEnabled ? "true" : "false"}
              onValueChange={handlePortalToggle}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">
                  {t("settingsPortalEnabled")}
                </SelectItem>
                <SelectItem value="false">
                  {t("settingsPortalDisabled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Regenerate portal token */}
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">
                {t("settingsRegenerateTitle")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("settingsRegenerateDesc")}
              </p>
            </div>
            {confirmRegenerate ? (
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => regenerateMutation.mutate({ id })}
                  disabled={regenerateMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  {t("settingsConfirmAction")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmRegenerate(false)}
                >
                  {t("settingsCancel")}
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmRegenerate(true)}
                className="shrink-0"
              >
                {t("settingsRegenerate")}
              </Button>
            )}
          </div>

          {/* Archive project */}
          {project.status !== "ARCHIVED" && (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 p-4">
              <div>
                <p className="font-medium text-sm">
                  {t("settingsArchiveTitle")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("settingsArchiveDesc")}
                </p>
              </div>
              {confirmArchive ? (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => archiveMutation.mutate({ id })}
                    disabled={archiveMutation.isPending}
                  >
                    {t("settingsArchiveAction")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmArchive(false)}
                  >
                    {t("settingsCancel")}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmArchive(true)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  {t("settingsArchiveAction")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
