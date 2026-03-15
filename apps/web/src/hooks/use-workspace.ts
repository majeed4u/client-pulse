import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

/**
 * Returns the current user's workspace data.
 * Wraps `trpc.workspace.get` for convenient reuse across components.
 */
export function useWorkspace() {
  const query = useQuery(trpc.workspace.get.queryOptions());
  return {
    workspace: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
