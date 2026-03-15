"use client";

import { trpc } from "@/utils/trpc";
import { Button } from "@client-pulse/ui/components/button";
import { Input } from "@client-pulse/ui/components/input";
import { Label } from "@client-pulse/ui/components/label";
import { Separator } from "@client-pulse/ui/components/separator";
import { Textarea } from "@client-pulse/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@client-pulse/ui/components/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  InvoiceLineItems,
  type LineItem,
} from "./invoice-line-items";

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "EGP"];

interface InvoiceBuilderProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    clientId: string;
    projectId?: string | null;
    currency: string;
    lineItems: LineItem[];
    taxPercent: number;
    dueDate?: Date | null;
    notes?: string | null;
  };
  onSuccess?: (id: string) => void;
}

export function InvoiceBuilder({
  mode,
  initialData,
  onSuccess,
}: InvoiceBuilderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("invoices");

  const { data: clientsData } = useQuery(trpc.clients.list.queryOptions());
  const clients = clientsData ?? [];

  const [clientId, setClientId] = useState(initialData?.clientId ?? "");
  const [currency, setCurrency] = useState(initialData?.currency ?? "USD");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems ?? [{ description: "", quantity: 1, unitPrice: 0 }],
  );
  const [taxPercent, setTaxPercent] = useState(
    initialData?.taxPercent ?? 0,
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const total = subtotal + taxAmount;

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    });

  const createMutation = useMutation(
    trpc.invoices.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("created"));
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        if (onSuccess) onSuccess(data.id);
        else router.push(`/dashboard/invoices/${data.id}` as any);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateMutation = useMutation(
    trpc.invoices.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(t("updated"));
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        if (onSuccess) onSuccess(data.id);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    const payload = {
      clientId,
      currency,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      taxPercent,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes: notes || undefined,
    };
    if (mode === "create") {
      createMutation.mutate(payload);
    } else if (initialData) {
      updateMutation.mutate({
        id: initialData.id,
        lineItems: payload.lineItems,
        taxPercent: payload.taxPercent,
        dueDate: payload.dueDate ?? null,
        notes: payload.notes ?? null,
        currency: payload.currency,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client selection */}
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="client">{t("client")} *</Label>
          <Select value={clientId} onValueChange={setClientId} required>
            <SelectTrigger id="client">
              <SelectValue placeholder={t("selectClient")} />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` — ${c.company}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">{t("currency")}</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due date */}
        <div className="space-y-2">
          <Label htmlFor="dueDate">{t("dueDate")}</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-2">
        <Label>{t("lineItems")}</Label>
        <InvoiceLineItems
          items={lineItems}
          onChange={setLineItems}
          currency={currency}
          disabled={isPending}
        />
      </div>

      {/* Totals */}
      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span className="tabular-nums">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{t("taxPercent")}</span>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              className="w-20 h-7 text-sm text-end"
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>{t("total")}</span>
          <span className="tabular-nums">{fmt(total)}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">{t("notes")}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isPending || !clientId}>
          {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? t("createInvoice") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
