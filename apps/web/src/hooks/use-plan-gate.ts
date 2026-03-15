import { PLAN_LIMITS, type Plan } from "@/lib/constants";
import { useWorkspace } from "./use-workspace";

/**
 * Returns a `can` helper that checks whether the current workspace plan
 * allows a specific feature gate.
 *
 * Usage:
 *   const { can, plan } = usePlanGate();
 *   if (!can("invoicePayments")) showUpgradeModal();
 */
export function usePlanGate() {
  const { workspace } = useWorkspace();
  const plan: Plan = (workspace?.plan ?? "FREE") as Plan;
  const limits = PLAN_LIMITS[plan];

  function can<K extends keyof (typeof PLAN_LIMITS)[Plan]>(
    feature: K,
  ): boolean {
    const value = limits[feature];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    return false;
  }

  return { can, plan, limits };
}
