"use client";

import { InvoiceBuilder } from "@/components/invoices/invoice-builder";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@client-pulse/ui/components/card";
import { useTranslations } from "next-intl";

export default function NewInvoicePage() {
  const t = useTranslations("invoices");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("newInvoice")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("newInvoiceDescription")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("invoiceDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceBuilder mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
