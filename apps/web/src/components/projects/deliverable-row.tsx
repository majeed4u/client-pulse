"use client";

import { Button } from "@client-pulse/ui/components/button";
import { Card, CardContent } from "@client-pulse/ui/components/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@client-pulse/ui/components/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
	CheckCircle2,
	Clock,
	Download,
	ExternalLink,
	FileText,
	Trash2,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

const STATUS_CONFIG = {
	PENDING_REVIEW: {
		label: "Pending review",
		icon: Clock,
		color: "text-yellow-500",
	},
	APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-500" },
	CHANGES_REQUESTED: {
		label: "Changes requested",
		icon: XCircle,
		color: "text-red-500",
	},
	SUPERSEDED: { label: "Superseded", icon: FileText, color: "text-gray-400" },
} as const;

type DeliverableStatus = keyof typeof STATUS_CONFIG;

interface DeliverableRowProps {
	deliverable: {
		id: string;
		name: string;
		description?: string | null;
		status: DeliverableStatus;
		versions: Array<{
			id: string;
			versionNumber: number;
			fileName: string;
			fileUrl: string;
			fileSize: number;
			mimeType: string;
			approvedAt?: Date | string | null;
			rejectedAt?: Date | string | null;
		}>;
	};
	projectId: string;
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getEffectiveStatus(
	deliverable: DeliverableRowProps["deliverable"],
): DeliverableStatus {
	const latest = deliverable.versions[0];
	if (!latest) return deliverable.status;
	if (latest.approvedAt) return "APPROVED";
	if (latest.rejectedAt) return "CHANGES_REQUESTED";
	return "PENDING_REVIEW";
}

export function DeliverableRow({
	deliverable,
	projectId,
}: DeliverableRowProps) {
	const queryClient = useQueryClient();
	const status = getEffectiveStatus(deliverable);
	const config = STATUS_CONFIG[status];
	const Icon = config.icon;
	const latestVersion = deliverable.versions[0];

	const deleteDeliverable = trpc.deliverables.delete.useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.projects.get.queryKey({ id: projectId }),
			});
			toast.success(`"${deliverable.name}" deleted`);
		},
		onError: (err) => {
			toast.error(err.message ?? "Failed to delete deliverable");
		},
	});

	return (
		<Card>
			<CardContent className="flex items-center gap-3 py-3">
				<Icon className={`h-5 w-5 shrink-0 ${config.color}`} />

				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">{deliverable.name}</p>
					{deliverable.description && (
						<p className="truncate text-muted-foreground text-xs">
							{deliverable.description}
						</p>
					)}
					{latestVersion && (
						<p className="mt-0.5 text-muted-foreground text-xs">
							v{latestVersion.versionNumber} · {latestVersion.fileName} ·{" "}
							{formatBytes(latestVersion.fileSize)}
						</p>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<span className="hidden font-medium text-muted-foreground text-xs sm:block">
						{config.label}
					</span>

					{latestVersion && (
						<>
							<a
								href={latestVersion.fileUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="View file"
								className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<ExternalLink className="h-4 w-4" />
							</a>
							<a
								href={latestVersion.fileUrl}
								download={latestVersion.fileName}
								aria-label="Download file"
								className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
							>
								<Download className="h-4 w-4" />
							</a>
						</>
					)}

					<Dialog>
						<DialogTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									title="Delete deliverable"
									className="text-destructive hover:text-destructive"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							}
						/>
						<DialogContent showCloseButton={false}>
							<DialogHeader>
								<DialogTitle>Delete deliverable?</DialogTitle>
								<DialogDescription>
									This will permanently delete &ldquo;{deliverable.name}&rdquo;
									and all its uploaded versions. This cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose render={<Button variant="outline" />}>
									Cancel
								</DialogClose>
								<Button
									variant="destructive"
									onClick={() =>
										deleteDeliverable.mutate({ id: deliverable.id })
									}
									disabled={deleteDeliverable.isPending}
								>
									{deleteDeliverable.isPending ? "Deleting…" : "Delete"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	);
}
