import { Badge } from "@client-pulse/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@client-pulse/ui/components/card";
import { formatDistanceToNow } from "date-fns";
import { Calendar, FileText, Receipt } from "lucide-react";
import Link from "next/link";

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

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    status: keyof typeof STATUS_LABELS;
    deadline?: Date | string | null;
    createdAt: Date | string;
    client: { id: string; name: string; company?: string | null };
    _count: { deliverables: number; invoices: number };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/dashboard/projects/${project.id}` as any}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold truncate">{project.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {project.client.name}
                {project.client.company ? ` · ${project.client.company}` : ""}
              </p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}
            >
              {STATUS_LABELS[project.status]}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {project._count.deliverables} deliverable
              {project._count.deliverables !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" />
              {project._count.invoices} invoice
              {project._count.invoices !== 1 ? "s" : ""}
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
