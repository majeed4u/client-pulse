import { Badge } from "@client-pulse/ui/components/badge";
import { cn } from "@client-pulse/ui/lib/utils";

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD";
type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
type DeliverableStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "SUPERSEDED";

type AnyStatus = ProjectStatus | InvoiceStatus | DeliverableStatus;

const STATUS_STYLES: Record<string, string> = {
  // Project
  ACTIVE: "bg-green-500/10 text-green-700 border-green-200",
  COMPLETED: "bg-blue-500/10 text-blue-700 border-blue-200",
  ARCHIVED: "border-gray-200 text-gray-500",
  ON_HOLD: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  // Invoice
  DRAFT: "border-gray-200 text-gray-500",
  SENT: "bg-blue-500/10 text-blue-700 border-blue-200",
  VIEWED: "bg-purple-500/10 text-purple-700 border-purple-200",
  PAID: "bg-green-500/10 text-green-700 border-green-200",
  OVERDUE: "bg-red-500/10 text-red-700 border-red-200",
  CANCELLED: "border-gray-200 text-gray-400 line-through",
  // Deliverable
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-500/10 text-green-700 border-green-200",
  CHANGES_REQUESTED: "bg-orange-500/10 text-orange-700 border-orange-200",
  SUPERSEDED: "border-gray-200 text-gray-400",
};

interface StatusBadgeProps {
  status: AnyStatus;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-normal", STATUS_STYLES[status], className)}
    >
      {label}
    </Badge>
  );
}
