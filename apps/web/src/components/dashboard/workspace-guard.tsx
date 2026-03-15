"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";

export function WorkspaceGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const workspaceQuery = useQuery({
		...trpc.workspace.get.queryOptions(),
		retry: false,
	});

	useEffect(() => {
		if (workspaceQuery.isError) {
			const err = workspaceQuery.error as { data?: { code?: string } };
			if (err?.data?.code === "FORBIDDEN") {
				router.replace("/onboarding");
			}
		}
	}, [workspaceQuery.isError, workspaceQuery.error, router]);

	if (workspaceQuery.isLoading) {
		return (
			<div className="flex h-full items-center justify-center py-20">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (workspaceQuery.isError) {
		return null;
	}

	return <>{children}</>;
}
