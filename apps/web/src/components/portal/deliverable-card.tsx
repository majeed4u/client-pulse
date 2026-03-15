"use client";

import { Button } from "@client-pulse/ui/components/button";
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
import { Label } from "@client-pulse/ui/components/label";
import { Textarea } from "@client-pulse/ui/components/textarea";
import {
	CheckCircle2,
	Clock,
	Download,
	ExternalLink,
	FileText,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DeliverableCardProps {
	deliverable: {
		id: string;
		name: string;
		description?: string | null;
		status: string;
		versions: Array<{
			id: string;
			versionNumber: number;
			fileName: string;
			fileUrl: string;
			fileSize: number;
			mimeType: string;
			approvedAt?: string | null;
			rejectedAt?: string | null;
			clientNote?: string | null;
		}>;
	};
	token: string;
	serverUrl: string;
	onAction: () => void;
}

const STATUS_CONFIG = {
	PENDING_REVIEW: {
		label: "Pending your review",
		icon: Clock,
		color: "text-yellow-500",
		bg: "bg-yellow-50 dark:bg-yellow-950/30",
	},
	APPROVED: {
		label: "Approved",
		icon: CheckCircle2,
		color: "text-green-500",
		bg: "bg-green-50 dark:bg-green-950/30",
	},
	CHANGES_REQUESTED: {
		label: "Changes requested",
		icon: XCircle,
		color: "text-red-500",
		bg: "bg-red-50 dark:bg-red-950/30",
	},
	SUPERSEDED: {
		label: "Superseded",
		icon: FileText,
		color: "text-gray-400",
		bg: "bg-muted/50",
	},
} as const;

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DeliverableCard({
	deliverable,
	token,
	serverUrl,
	onAction,
}: DeliverableCardProps) {
	const [rejectNote, setRejectNote] = useState("");
	const [loading, setLoading] = useState(false);
	const t = useTranslations("portal");

	const latestVersion = deliverable.versions[0];
	const status = deliverable.status as keyof typeof STATUS_CONFIG;
	const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING_REVIEW;
	const Icon = config.icon;

	const canReview =
		status === "PENDING_REVIEW" &&
		latestVersion &&
		!latestVersion.approvedAt &&
		!latestVersion.rejectedAt;

	const handleApprove = async () => {
		if (!latestVersion) return;
		setLoading(true);
		try {
			const res = await fetch(
				`${serverUrl}/portal/${token}/deliverables/${latestVersion.id}/approve`,
				{ method: "POST" },
			);
			if (!res.ok) throw new Error("Failed to approve");
			toast.success(`"${deliverable.name}" approved!`);
			onAction();
		} catch {
			toast.error("Failed to approve. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async () => {
		if (!latestVersion) return;
		setLoading(true);
		try {
			const res = await fetch(
				`${serverUrl}/portal/${token}/deliverables/${latestVersion.id}/reject`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ note: rejectNote.trim() || undefined }),
				},
			);
			if (!res.ok) throw new Error("Failed to reject");
			toast.success("Feedback sent to the team.");
			setRejectNote("");
			onAction();
		} catch {
			toast.error("Failed to send feedback. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`rounded-lg border p-4 ${config.bg}`}>
			<div className="flex items-start gap-3">
				<Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="truncate font-medium">{deliverable.name}</p>
							{deliverable.description && (
								<p className="mt-0.5 text-muted-foreground text-sm">
									{deliverable.description}
								</p>
							)}
						</div>
						<span className={`shrink-0 font-medium text-xs ${config.color}`}>
							{t(`deliverableStatus.${status}` as any)}
						</span>
					</div>

					{latestVersion && (
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<span className="text-muted-foreground text-xs">
								v{latestVersion.versionNumber} · {latestVersion.fileName} ·{" "}
								{formatBytes(latestVersion.fileSize)}
							</span>
							<div className="flex gap-1.5">
								<a
									href={latestVersion.fileUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="View file"
									className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
								>
									<ExternalLink className="h-3 w-3" />
									View
								</a>
								<a
									href={latestVersion.fileUrl}
									download={latestVersion.fileName}
									aria-label="Download file"
									className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
								>
									<Download className="h-3 w-3" />
									Download
								</a>
							</div>
						</div>
					)}

					{latestVersion?.clientNote && (
						<p className="mt-2 text-muted-foreground text-sm italic">
							{t("yourNote")}: {latestVersion.clientNote}
						</p>
					)}

					{canReview && (
						<div className="mt-4 flex items-center gap-2">
							<Button
								size="sm"
								onClick={handleApprove}
								disabled={loading}
								className="bg-green-600 text-white hover:bg-green-700"
							>
								<CheckCircle2 className="mr-1.5 h-4 w-4" />
							{t("approve")}
										{t("requestChanges")}
										</Button>
									}
								/>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>{t("requestChangesTitle")}</DialogTitle>
										<DialogDescription>
											{t("requestChangesDesc", { name: deliverable.name })}
										</DialogDescription>
									</DialogHeader>
									<div className="space-y-1.5">
											<Label htmlFor="reject-note">{t("yourFeedback")}</Label>
										<Textarea
											id="reject-note"
											value={rejectNote}
											onChange={(e) => setRejectNote(e.target.value)}
												placeholder={t("feedbackPlaceholder")}
											rows={4}
										/>
									</div>
									<DialogFooter>
										<DialogClose render={<Button variant="outline" />}>
											{t("cancel")}
										</DialogClose>
										<Button onClick={handleReject} disabled={loading}>
											{loading ? t("sending") : t("sendFeedback")}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
