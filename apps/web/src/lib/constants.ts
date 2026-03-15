export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 2,
    maxTeamMembers: 1,
    customBranding: false,
    invoicePayments: false,
    maxFileMb: 25,
    versionHistory: false,
    activityLog: false,
    pdfExport: false,
  },
  PRO: {
    maxProjects: Infinity,
    maxTeamMembers: 1,
    customBranding: true,
    invoicePayments: true,
    maxFileMb: 100,
    versionHistory: true,
    activityLog: true,
    pdfExport: true,
  },
  AGENCY: {
    maxProjects: Infinity,
    maxTeamMembers: 10,
    customBranding: true,
    invoicePayments: true,
    maxFileMb: 500,
    versionHistory: true,
    activityLog: true,
    pdfExport: true,
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "application/zip",
  "application/x-figma",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "EGP", symbol: "E£", label: "Egyptian Pound" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const PROJECT_STATUSES = [
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
  "ON_HOLD",
] as const;

export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export const DELIVERABLE_STATUSES = [
  "PENDING_REVIEW",
  "APPROVED",
  "CHANGES_REQUESTED",
  "SUPERSEDED",
] as const;
