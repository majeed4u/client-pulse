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

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

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
        <p className="text-lg font-medium">Project not found</p>
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
          <h1 className="text-2xl font-bold">Project settings</h1>
          <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
        </div>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Update the project name, description and deadline
          </CardDescription>
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
          <CardTitle>Status & portal</CardTitle>
          <CardDescription>
            Control project status and client portal visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Project status</Label>
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client portal</Label>
            <Select
              value={project.portalEnabled ? "true" : "false"}
              onValueChange={handlePortalToggle}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">
                  Enabled — clients can view the portal
                </SelectItem>
                <SelectItem value="false">
                  Disabled — portal link shows an error
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
              <p className="font-medium text-sm">Regenerate portal link</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This will invalidate the current client link. Share the new link
                manually.
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
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmRegenerate(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmRegenerate(true)}
                className="shrink-0"
              >
                Regenerate
              </Button>
            )}
          </div>

          {/* Archive project */}
          {project.status !== "ARCHIVED" && (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 p-4">
              <div>
                <p className="font-medium text-sm">Archive project</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The project will be hidden from the active list. This can be
                  undone via the status selector.
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
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmArchive(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmArchive(true)}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  Archive
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
