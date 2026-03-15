"use client";

import { Badge } from "@client-pulse/ui/components/badge";
import { Button } from "@client-pulse/ui/components/button";
import { Separator } from "@client-pulse/ui/components/separator";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface InvoiceViewProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    currency: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    subtotal: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    dueDate: string | null;
    notes: string | null;
    stripePaymentLinkUrl: string | null;
  };
  token: string;
  serverUrl: string;
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SENT: { label: "Sent", variant: "outline" },
  VIEWED: { label: "Viewed", variant: "outline" },
  PAID: { label: "Paid", variant: "default" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
};

export function InvoiceView({ invoice, token, serverUrl }: InvoiceViewProps) {
  const [markingViewed, setMarkingViewed] = useState(false);
  const t = useTranslations("portal");
  const status = STATUS_MAP[invoice.status] ?? {
    label: invoice.status,
    variant: "secondary" as const,
  };

  const handlePayClick = async () => {
    if (!invoice.stripePaymentLinkUrl) return;
    // Mark as viewed before redirecting
    if (invoice.status === "SENT") {
      setMarkingViewed(true);
      try {
        await fetch(`${serverUrl}/portal/${token}/invoice/${invoice.id}/view`, {
          method: "POST",
        });
      } catch {
        // non-critical, proceed anyway
      } finally {
        setMarkingViewed(false);
      }
    }
    window.open(invoice.stripePaymentLinkUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6 rounded-lg border bg-card p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-xl">{invoice.invoiceNumber}</h2>
            {invoice.dueDate && (
              <p className="mt-1 text-muted-foreground text-sm">
                Due {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
              </p>
            )}
          </div>
          <Badge variant={status.variant}>
            {t(`invoiceStatus.${invoice.status}` as any) ?? status.label}
          </Badge>
        </div>

        <Separator />

        {/* Line items */}
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            <span>{t("description")}</span>
            <span className="text-right">{t("qty")}</span>
            <span className="text-right">{t("unitPrice")}</span>
            <span className="text-right">{t("total")}</span>
          </div>
          {invoice.lineItems.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-sm"
            >
              <span>{item.description}</span>
              <span className="text-right text-muted-foreground">
                {item.quantity}
              </span>
              <span className="text-right text-muted-foreground">
                {formatCurrency(item.unitPrice, invoice.currency)}
              </span>
              <span className="text-right font-medium">
                {formatCurrency(
                  item.quantity * item.unitPrice,
                  invoice.currency,
                )}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t("subtotal")}</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.taxPercent > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{t("tax", { percent: invoice.taxPercent })}</span>
              <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 font-semibold text-base">
            <span>{t("total")}</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="rounded-md bg-muted/50 p-3 text-muted-foreground text-sm">
            {invoice.notes}
          </div>
        )}

        {/* Pay button */}
        {invoice.stripePaymentLinkUrl &&
          invoice.status !== "PAID" &&
          invoice.status !== "CANCELLED" && (
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayClick}
              disabled={markingViewed}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("payNow")}
            </Button>
          )}

        {invoice.status === "PAID" && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center font-medium text-green-700 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {t("invoicePaid")}
          </div>
        )}
      </div>
    </div>
  );
}
