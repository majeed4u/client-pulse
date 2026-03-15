"use client";

import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-700 border-green-200",
  COMPLETED: "bg-blue-500/10 text-blue-700 border-blue-200",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  ARCHIVED: "bg-gray-500/10 text-gray-500 border-gray-200",
};

const activityLabels: Record<string, string> = {
  PROJECT_CREATED: "Project created",
  DELIVERABLE_UPLOADED: "Deliverable uploaded",
  DELIVERABLE_APPROVED: "Deliverable approved",
  DELIVERABLE_REJECTED: "Changes requested",
  FEEDBACK_LEFT: "Feedback left",
  INVOICE_SENT: "Invoice sent",
  INVOICE_PAID: "Invoice paid",
  CLIENT_VIEWED_PORTAL: "Client viewed portal",
};

export default function DashboardPage() {
  const projectsQuery = useQuery(trpc.projects.list.queryOptions({ limit: 5 }));
  const clientsQuery = useQuery(trpc.clients.list.queryOptions({}));
  const invoicesQuery = useQuery(trpc.invoices.list.queryOptions({}));
  const t = useTranslations("dashboard");
  const tProjects = useTranslations("projects");

  const projects = projectsQuery.data?.projects ?? [];
  const clients = clientsQuery.data?.clients ?? [];
  const invoices = invoicesQuery.data?.invoices ?? [];

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const totalClients = clients.length;
  const pendingInvoices = invoices.filter((i) =>
    ["SENT", "OVERDUE"].includes(i.status),
  );
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0);
  const paidAmount = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.total, 0);

  const loading =
    projectsQuery.isLoading ||
    clientsQuery.isLoading ||
    invoicesQuery.isLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back — here's what's happening
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("newProject")}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("activeProjects")}
          value={activeProjects}
          icon={FolderKanban}
          description={`${projects.length} total`}
          loading={loading}
        />
        <StatCard
          title={t("totalClients")}
          value={totalClients}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title={t("pendingRevenue")}
          value={`$${(pendingAmount / 100).toLocaleString()}`}
          icon={Clock}
          description={`${pendingInvoices.length} unpaid invoices`}
          loading={loading}
        />
        <StatCard
          title={t("paidRevenue")}
          value={`$${(paidAmount / 100).toLocaleString()}`}
          icon={DollarSign}
          description="All time paid"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              {t("recentProjects")}
            </CardTitle>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                {t("viewAll")} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("noProjects")}
                </p>
                <Link href="/dashboard/projects/new" className="mt-2">
                  <Button variant="outline" size="sm">
                    Create your first project
                  </Button>
                </Link>
              </div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.client.name}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-3 shrink-0 text-[10px] ${statusColors[project.status] ?? ""}`}
                  >
                    {project.status
                      .split("_")
                      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                      .join(" ")}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              {t("recentInvoices")}
            </CardTitle>
            <Link href="/dashboard/invoices">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                {t("viewAll")} <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoicesQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <DollarSign className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("noInvoices")}
                </p>
                <Link href="/dashboard/invoices/new" className="mt-2">
                  <Button variant="outline" size="sm">
                    Create your first invoice
                  </Button>
                </Link>
              </div>
            ) : (
              invoices.slice(0, 5).map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/dashboard/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.client.name}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      ${(invoice.total / 100).toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        invoice.status === "PAID"
                          ? "bg-green-500/10 text-green-700 border-green-200"
                          : invoice.status === "OVERDUE"
                            ? "bg-red-500/10 text-red-700 border-red-200"
                            : invoice.status === "SENT"
                              ? "bg-blue-500/10 text-blue-700 border-blue-200"
                              : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {t(`invoiceStatus.${invoice.status}` as any)}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/projects/new">
            <Button variant="outline" size="sm" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              New Project
            </Button>
          </Link>
          <Link href="/dashboard/clients/new">
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
          <Link href="/dashboard/invoices/new">
            <Button variant="outline" size="sm" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Workspace Settings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
