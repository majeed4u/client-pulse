"use client";

import { env } from "@client-pulse/env/web";
import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import { Card, CardContent } from "@client-pulse/ui/components/card";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Calendar, FileText, Settings, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DeliverableRow } from "@/components/projects/deliverable-row";
import { DeliverableUpload } from "@/components/projects/deliverable-upload";
import { PortalLinkCopier } from "@/components/projects/portal-link-copier";
import { trpc } from "@/utils/trpc";
import { useTranslations } from "next-intl";

const STATUS_STYLES = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ON_HOLD:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
} as const;

type ProjectStatus = keyof typeof STATUS_STYLES;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("projects");

  const { data: project, isLoading } = useQuery(
    trpc.projects.get.queryOptions({ id }),
  );

  const portalUrl = project
    ? `${env.NEXT_PUBLIC_WEB_URL}/portal/${project.portalToken}`
    : "";

  type ActivityEntry = {
    id: string;
    type: string;
    actorName: string;
    createdAt: Date | string;
  };
  const activities: ActivityEntry[] = project?.activities ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
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
      <div className="flex flex-col items-center gap-3 p-6 py-24 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-lg">{t("notFound")}</p>
        <Button render={<Link href={"/dashboard/projects" as any} />}>
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bold text-2xl">{project.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${STATUS_STYLES[project.status as ProjectStatus]}`}
              >
                {t(`status.${project.status}` as any)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
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
                    {t("due")}{" "}
                    {format(new Date(project.deadline), "MMM d, yyyy")}
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
          {t("settings")}
        </Button>
      </div>

      {/* Portal link */}
      <PortalLinkCopier
        projectId={project.id}
        portalUrl={portalUrl}
        portalEnabled={project.portalEnabled}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Deliverables */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">{t("deliverables")}</h2>
              <Badge variant="secondary">{project.deliverables.length}</Badge>
            </div>
            <DeliverableUpload projectId={project.id} />
          </div>

          {project.deliverables.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  {t("noDeliverables")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {project.deliverables.map((d) => (
                <DeliverableRow
                  key={d.id}
                  deliverable={d}
                  projectId={project.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">{t("activity")}</h2>
          {project.activities.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {t("noActivity")}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="divide-y py-4">
                {activities.map((a) => (
                  <div key={a.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-medium text-sm">
                      {t(`activityLabels.${a.type}` as any) ?? a.type}
                    </p>
                    <p className="text-muted-foreground text-xs">
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
