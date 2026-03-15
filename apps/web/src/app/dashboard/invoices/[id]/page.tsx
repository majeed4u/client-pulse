"use client";

import { InvoiceBuilder } from "@/components/invoices/invoice-builder";
import { trpc } from "@/utils/trpc";
import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@client-pulse/ui/components/dialog";
import { Separator } from "@client-pulse/ui/components/separator";
import { Skeleton } from "@client-pulse/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-gray-200 text-gray-500",
  SENT: "bg-blue-500/10 text-blue-700 border-blue-200",
  VIEWED: "bg-purple-500/10 text-purple-700 border-purple-200",
  PAID: "bg-green-500/10 text-green-700 border-green-200",
  OVERDUE: "bg-red-500/10 text-red-700 border-red-200",
  CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-200",
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("invoices");
  const [editOpen, setEditOpen] = useState(false);

  const { data: invoice, isLoading } = useQuery(
    trpc.invoices.get.queryOptions({ id }),
  );

  const sendMutation = useMutation(
    trpc.invoices.send.mutationOptions({
      onSuccess: () => {
        toast.success(t("sent"));
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const markPaidMutation = useMutation(
    trpc.invoices.markPaid.mutationOptions({
      onSuccess: () => {
        toast.success(t("markedPaid"));
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const cancelMutation = useMutation(
    trpc.invoices.cancel.mutationOptions({
      onSuccess: () => {
        toast.success(t("cancelled"));
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        router.push("/dashboard/invoices" as any);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t("notFound")}
      </div>
    );
  }

  const lineItems = invoice.lineItems as Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency: invoice.currency,
      minimumFractionDigits: 2,
    });

  const isDraft = invoice.status === "DRAFT";
  const canMarkPaid = ["SENT", "VIEWED", "OVERDUE"].includes(invoice.status);
  const canCancel = !["PAID", "CANCELLED"].includes(invoice.status);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={"/dashboard/invoices" as any}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backToInvoices")}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <Badge
              variant="outline"
              className={STATUS_STYLES[invoice.status] ?? ""}
            >
              {t(`status.${invoice.status}` as any)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {invoice.client.name}
            {invoice.project ? ` · ${invoice.project.name}` : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="h-4 w-4" />
                {t("edit")}
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => sendMutation.mutate({ id })}
                disabled={sendMutation.isPending}
              >
                <Send className="h-4 w-4" />
                {t("send")}
              </Button>
            </>
          )}
          {canMarkPaid && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => markPaidMutation.mutate({ id })}
              disabled={markPaidMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("markPaid")}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => cancelMutation.mutate({ id })}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="h-4 w-4" />
              {t("cancel")}
            </Button>
          )}
        </div>
      </div>

      {/* Invoice card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {t("createdAt")}{" "}
              {format(new Date(invoice.createdAt), "MMM d, yyyy")}
            </span>
            {invoice.dueDate && (
              <span>
                {t("due")} {format(new Date(invoice.dueDate), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client info */}
          <div className="text-sm space-y-1">
            <p className="font-medium">{invoice.client.name}</p>
            <p className="text-muted-foreground">{invoice.client.email}</p>
            {invoice.client.company && (
              <p className="text-muted-foreground">{invoice.client.company}</p>
            )}
          </div>

          <Separator />

          {/* Line items */}
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_60px_100px_100px] gap-2 text-xs font-medium text-muted-foreground">
              <span>{t("lineDescription")}</span>
              <span className="text-center">{t("lineQty")}</span>
              <span className="text-end">{t("lineUnitPrice")}</span>
              <span className="text-end">{t("lineTotal")}</span>
            </div>
            {lineItems.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_60px_100px_100px] gap-2 text-sm"
              >
                <span>{item.description}</span>
                <span className="text-center tabular-nums">
                  {item.quantity}
                </span>
                <span className="text-end tabular-nums">
                  {fmt(item.unitPrice)}
                </span>
                <span className="text-end tabular-nums">
                  {fmt(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="tabular-nums">{fmt(invoice.subtotal)}</span>
            </div>
            {invoice.taxPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("tax")} ({invoice.taxPercent}%)
                </span>
                <span className="tabular-nums">{fmt(invoice.taxAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>{t("total")}</span>
              <span className="tabular-nums">{fmt(invoice.total)}</span>
            </div>
            {invoice.paidAt && (
              <p className="text-xs text-green-600">
                {t("paidOn")} {format(new Date(invoice.paidAt), "MMM d, yyyy")}
              </p>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="font-medium mb-1">{t("notes")}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            </>
          )}

          {/* Stripe payment link */}
          {invoice.stripePaymentLinkUrl && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="font-medium mb-1">{t("paymentLink")}</p>
                <a
                  href={invoice.stripePaymentLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline break-all"
                >
                  {invoice.stripePaymentLinkUrl}
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("editInvoice")}</DialogTitle>
          </DialogHeader>
          <InvoiceBuilder
            mode="edit"
            initialData={{
              id: invoice.id,
              clientId: invoice.clientId,
              projectId: invoice.projectId,
              currency: invoice.currency,
              lineItems: lineItems,
              taxPercent: invoice.taxPercent,
              dueDate: invoice.dueDate,
              notes: invoice.notes,
            }}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
