import { format, formatDistance } from "date-fns";
export { cn } from "@client-pulse/ui/lib/utils";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
  EGP: "E£",
};

/**
 * Format a cent-based integer into a human-readable currency string.
 * e.g. formatCurrency(150000, "USD") → "$1,500.00"
 */
export function formatCurrency(cents: number, currency = "USD"): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a Date or ISO string to a readable date string.
 * e.g. formatDate(new Date()) → "Jan 1, 2025"
 */
export function formatDate(
  date: Date | string | null | undefined,
  fmt = "MMM d, yyyy",
): string {
  if (!date) return "—";
  try {
    return format(new Date(date), fmt);
  } catch {
    return "—";
  }
}

/**
 * Format a Date or ISO string as a relative time string.
 * e.g. formatRelativeDate(twoHoursAgo) → "about 2 hours ago"
 */
export function formatRelativeDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "—";
  try {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  } catch {
    return "—";
  }
}

/**
 * Convert bytes to a human-readable file size.
 * e.g. formatFileSize(1048576) → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Truncate a string to a max length, appending "…" if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}
