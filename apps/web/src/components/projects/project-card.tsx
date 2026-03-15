"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@client-pulse/ui/components/card";
import { formatDistanceToNow } from "date-fns";
import { Calendar, FileText, Receipt } from "lucide-react";
import Link from "next/link";
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

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    status: ProjectStatus;
    deadline?: Date | string | null;
    createdAt: Date | string;
    client: { id: string; name: string; company?: string | null };
    _count: { deliverables: number; invoices: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("projects");
  return (
    <Link href={`/dashboard/projects/${project.id}` as any}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{project.name}</p>
              <p className="mt-0.5 truncate text-muted-foreground text-xs">
                {project.client.name}
                {project.client.company ? ` · ${project.client.company}` : ""}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-medium text-xs ${STATUS_STYLES[project.status]}`}
            >
              {t(`status.${project.status}` as any)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {project.description && (
            <p className="line-clamp-2 text-muted-foreground text-sm">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {t("deliverableCount", { count: project._count.deliverables })}
            </span>
            <span className="flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" />
              {t("invoiceCount", { count: project._count.invoices })}
            </span>
            {project.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Due{" "}
                {formatDistanceToNow(new Date(project.deadline), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
