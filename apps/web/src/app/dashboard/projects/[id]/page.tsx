"use client";

import { trpc } from "@/utils/trpc";
import { env } from "@client-pulse/env/web";
import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Settings,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const STATUS_STYLES = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ON_HOLD:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
} as const;

const STATUS_LABELS = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  ARCHIVED: "Archived",
} as const;

const DELIVERABLE_STATUS_CONFIG = {
  PENDING_REVIEW: {
    label: "Pending review",
    icon: Clock,
    color: "text-yellow-500",
  },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-500" },
  CHANGES_REQUESTED: {
    label: "Changes requested",
    icon: XCircle,
    color: "text-red-500",
  },
  SUPERSEDED: { label: "Superseded", icon: FileText, color: "text-gray-400" },
} as const;

const ACTIVITY_LABELS: Record<string, string> = {
  PROJECT_CREATED: "Project created",
  DELIVERABLE_UPLOADED: "Deliverable uploaded",
  DELIVERABLE_APPROVED: "Deliverable approved",
  DELIVERABLE_REJECTED: "Changes requested",
  FEEDBACK_LEFT: "Feedback received",
  INVOICE_SENT: "Invoice sent",
  INVOICE_PAID: "Invoice paid",
  CLIENT_VIEWED_PORTAL: "Client viewed portal",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery(
    trpc.projects.get.queryOptions({ id }),
  );

  const portalUrl = project
    ? `${env.NEXT_PUBLIC_WEB_URL}/portal/${project.portalToken}`
    : "";

  type ActivityEntry = { id: string; type: string; actorName: string; createdAt: Date | string };
  const activities: ActivityEntry[] = project?.activities ?? [];

  const copyPortalLink = () => {
    navigator.clipboard.writeText(portalUrl);
    toast.success("Portal link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
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

  const latestVersionStatus = (
    deliverable: (typeof project.deliverables)[number],
  ) => {
    const latest = deliverable.versions[0];
    if (!latest) return deliverable.status;
    if (latest.approvedAt) return "APPROVED" as const;
    if (latest.rejectedAt) return "CHANGES_REQUESTED" as const;
    return "PENDING_REVIEW" as const;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href={"/dashboard/projects" as any} />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
              >
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <Link
                href={`/dashboard/clients/${project.client.id}` as any}
                className="hover:underline"
              >
                {project.client.name}
                {project.client.company ? ` · ${project.client.company}` : ""}
              </Link>
              {project.deadline && (
                <>
                  <span>·</span>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Due {format(new Date(project.deadline), "MMM d, yyyy")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          render={
            <Link href={`/dashboard/projects/${project.id}/settings` as any} />
          }
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Portal link */}
      {project.portalEnabled && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">
                Client portal link
              </p>
              <p className="text-sm font-mono truncate text-muted-foreground">
                {portalUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={copyPortalLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deliverables */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Deliverables</h2>
            <Badge variant="secondary">{project.deliverables.length}</Badge>
          </div>

          {project.deliverables.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12 gap-3 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No deliverables yet. Upload files for client review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {project.deliverables.map((d) => {
                const status = latestVersionStatus(d);
                const config = DELIVERABLE_STATUS_CONFIG[status];
                const Icon = config.icon;
                const latestVersion = d.versions[0];
                return (
                  <Card key={d.id}>
                    <CardContent className="flex items-center gap-3 py-3">
                      <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{d.name}</p>
                        {d.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {d.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium">{config.label}</p>
                        {latestVersion && (
                          <p className="text-xs text-muted-foreground">
                            v{latestVersion.versionNumber} ·{" "}
                            {latestVersion.fileName}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Activity</h2>
          {project.activities.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No activity yet
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-4 divide-y">
                {activities.map((a) => (
                  <div key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">
                      {ACTIVITY_LABELS[a.type] ?? a.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.actorName} ·{" "}
                      {formatDistanceToNow(new Date(a.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
