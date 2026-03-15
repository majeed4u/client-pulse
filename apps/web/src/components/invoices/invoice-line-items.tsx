"use client";

import { Button } from "@client-pulse/ui/components/button";
import { Input } from "@client-pulse/ui/components/input";
import { CurrencyInput } from "./currency-input";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number; // cents
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency: string;
  disabled?: boolean;
}

export function InvoiceLineItems({
  items,
  onChange,
  currency,
  disabled,
}: InvoiceLineItemsProps) {
  const t = useTranslations("invoices");

  const addRow = () =>
    onChange([...items, { description: "", quantity: 1, unitPrice: 0 }]);

  const removeRow = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const update = (i: number, patch: Partial<LineItem>) => {
    const next = items.map((item, idx) =>
      idx === i ? { ...item, ...patch } : item,
    );
    onChange(next);
  };

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    });

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_100px_36px] gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>{t("lineDescription")}</span>
        <span className="text-center">{t("lineQty")}</span>
        <span className="text-center">{t("lineUnitPrice")}</span>
        <span className="text-end">{t("lineTotal")}</span>
        <span />
      </div>

      {items.map((item, i) => {
        const rowTotal = item.quantity * item.unitPrice;
        return (
          <div
            key={i}
            className="grid grid-cols-[1fr_80px_120px_100px_36px] gap-2 items-center"
          >
            <Input
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder={t("lineDescriptionPlaceholder")}
              disabled={disabled}
            />
            <Input
              type="number"
              min={1}
              step={1}
              value={item.quantity}
              onChange={(e) =>
                update(i, { quantity: Math.max(1, Number(e.target.value)) })
              }
              disabled={disabled}
              className="text-center"
            />
            <CurrencyInput
              value={item.unitPrice}
              onChange={(v) => update(i, { unitPrice: v })}
              currency={currency}
              disabled={disabled}
            />
            <div className="text-sm font-medium text-end tabular-nums">
              {fmt(rowTotal)}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeRow(i)}
              disabled={disabled || items.length === 1}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        disabled={disabled}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        {t("addLine")}
      </Button>
    </div>
  );
}
