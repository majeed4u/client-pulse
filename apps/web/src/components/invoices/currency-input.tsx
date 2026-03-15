"use client";

import { Input } from "@client-pulse/ui/components/input";
import { useRef } from "react";

interface CurrencyInputProps {
  value: number; // cents
  onChange: (cents: number) => void;
  currency?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0.00",
  disabled,
  id,
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value === 0 ? "" : (value / 100).toFixed(2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(raw);
    if (raw === "" || raw === ".") {
      onChange(0);
    } else if (!isNaN(parsed)) {
      onChange(Math.round(parsed * 100));
    }
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
