"use client";

import { trpc } from "@/utils/trpc";
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
import { format } from "date-fns";
import { DollarSign, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";

type StatusFilter =
  | "ALL"
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-gray-200 text-gray-500",
  SENT: "bg-blue-500/10 text-blue-700 border-blue-200",
  VIEWED: "bg-purple-500/10 text-purple-700 border-purple-200",
  PAID: "bg-green-500/10 text-green-700 border-green-200",
  OVERDUE: "bg-red-500/10 text-red-700 border-red-200",
  CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-200",
};

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const t = useTranslations("invoices");

  const { data: invoices, isLoading } = useQuery(
    trpc.invoices.list.queryOptions(
      statusFilter === "ALL" ? {} : { status: statusFilter },
    ),
  );

  const fmt = (cents: number, currency: string) =>
    (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    });

  const FILTERS: StatusFilter[] = [
    "ALL",
    "DRAFT",
    "SENT",
    "OVERDUE",
    "PAID",
    "CANCELLED",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Link href={"/dashboard/invoices/new" as any}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("createInvoice")}
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "ALL" ? t("all") : t(`status.${s}` as any)}
          </Button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !invoices?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <DollarSign className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-lg font-medium">{t("noInvoices")}</p>
          <p className="text-sm text-muted-foreground">
            {t("noInvoicesDescription")}
          </p>
          <Link href={"/dashboard/invoices/new" as any} className="mt-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("createInvoice")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/dashboard/invoices/${inv.id}` as any}
              className="block"
            >
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {inv.client.name}
                        {inv.project ? ` · ${inv.project.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {inv.dueDate && (
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {t("due")} {format(new Date(inv.dueDate), "MMM d, yyyy")}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_STYLES[inv.status] ?? ""}`}
                    >
                      {t(`status.${inv.status}` as any)}
                    </Badge>
                    <p className="text-sm font-semibold tabular-nums">
                      {fmt(inv.total, inv.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
