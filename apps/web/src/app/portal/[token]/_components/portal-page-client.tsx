"use client";

import { Badge } from "@client-pulse/ui/components/badge";
import { format } from "date-fns";
import { CreditCard, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DeliverableCard } from "@/components/portal/deliverable-card";
import { FeedbackComposer } from "@/components/portal/feedback-composer";
import { PortalHeader } from "@/components/portal/portal-header";

interface PortalData {
	project: {
		id: string;
		name: string;
		description: string | null;
		status: string;
		deadline: string | null;
		client: { id: string; name: string; email: string; company: string | null };
		workspace: { id: string; name: string; logoUrl: string | null };
	};
	deliverables: Array<{
		id: string;
		name: string;
		description: string | null;
		status: string;
		versions: Array<{
			id: string;
			versionNumber: number;
			fileName: string;
			fileUrl: string;
			fileSize: number;
			mimeType: string;
			approvedAt: string | null;
			rejectedAt: string | null;
			clientNote: string | null;
		}>;
	}>;
	threads: Array<{
		id: string;
		title: string;
		status: string;
		messages: Array<{
			id: string;
			authorName: string;
			authorType: string;
			body: string;
			createdAt: string;
		}>;
	}>;
	invoices: Array<{
		id: string;
		invoiceNumber: string;
		status: string;
		total: number;
		currency: string;
		dueDate: string | null;
		stripePaymentLinkUrl: string | null;
	}>;
}

const INVOICE_STATUS_MAP: Record<
	string,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
	SENT: { label: "Sent", variant: "outline" },
	VIEWED: { label: "Viewed", variant: "outline" },
	PAID: { label: "Paid", variant: "default" },
	OVERDUE: { label: "Overdue", variant: "destructive" },
	CANCELLED: { label: "Cancelled", variant: "secondary" },
};

export function PortalPageClient({
	token,
	serverUrl,
	initialData,
}: {
	token: string;
	serverUrl: string;
	initialData: PortalData;
}) {
	const [data, setData] = useState<PortalData>(initialData);
	const t = useTranslations("portal");

	const refresh = useCallback(async () => {
		try {
			const res = await fetch(`${serverUrl}/portal/${token}`);
			if (res.ok) {
				const json = await res.json();
				setData(json);
			}
		} catch {
			toast.error("Failed to refresh portal data.");
		}
	}, [token, serverUrl]);

	// Log the portal view once on mount
	useEffect(() => {
		fetch(`${serverUrl}/portal/${token}/view`, { method: "POST" }).catch(
			() => {},
		);
	}, [token, serverUrl]);

	const { project, deliverables, threads, invoices } = data;

	const pendingDeliverables = deliverables.filter(
		(d) => d.status === "PENDING_REVIEW",
	);
	const otherDeliverables = deliverables.filter(
		(d) => d.status !== "PENDING_REVIEW",
	);

	const formatCurrency = (cents: number, currency: string) =>
		new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
			cents / 100,
		);

	return (
		<div className="min-h-screen bg-background">
			<PortalHeader
				projectName={project.name}
				workspaceName={project.workspace.name}
				workspaceLogoUrl={project.workspace.logoUrl}
				clientName={project.client.name}
				deadline={project.deadline}
				status={project.status}
			/>

			<main className="mx-auto max-w-4xl space-y-10 px-4 py-8">
				{/* Project description */}
				{project.description && (
					<p className="text-muted-foreground">{project.description}</p>
				)}

				{/* Deliverables */}
				<section>
					<div className="mb-4 flex items-center gap-2">
						<FileText className="h-5 w-5 text-muted-foreground" />
						<h2 className="font-semibold text-lg"{t("deliverables")}</h2>
						{pendingDeliverables.length > 0 && (
							<Badge variant="destructive" className="text-xs">
								{t("awaitingReview", { count: pendingDeliverables.length })}
							</Badge>
						)}
					</div>

					{deliverables.length === 0 ? (
						<p className="py-4 text-muted-foreground text-sm">
						{t("noDeliverables")}
						</p>
					) : (
						<div className="space-y-3">
							{/* Pending review first */}
							{pendingDeliverables.map((d) => (
								<DeliverableCard
									key={d.id}
									deliverable={d}
									token={token}
									serverUrl={serverUrl}
									onAction={refresh}
								/>
							))}
							{otherDeliverables.map((d) => (
								<DeliverableCard
									key={d.id}
									deliverable={d}
									token={token}
									serverUrl={serverUrl}
									onAction={refresh}
								/>
							))}
						</div>
					)}
				</section>

				{/* Feedback */}
				<section>
					<div className="mb-4 flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-muted-foreground" />
				<h2 className="font-semibold text-lg">{t("feedback")}</h2>
					</div>

					{threads.length === 0 ? (
						<p className="py-4 text-muted-foreground text-sm">
							{t("noFeedback")}
						</p>
					) : (
						<div className="space-y-4">
							{threads.map((thread) => (
								<FeedbackComposer
									key={thread.id}
									thread={thread}
									token={token}
									serverUrl={serverUrl}
									onMessageSent={refresh}
								/>
							))}
						</div>
					)}
				</section>

				{/* Invoices */}
				{invoices.length > 0 && (
					<section>
						<div className="mb-4 flex items-center gap-2">
							<CreditCard className="h-5 w-5 text-muted-foreground" />
				<h2 className="font-semibold text-lg">{t("invoices")}</h2>
						</div>

						<div className="space-y-2">
							{invoices.map((inv) => {
								const s = INVOICE_STATUS_MAP[inv.status] ?? {
									label: inv.status,
									variant: "secondary" as const,
								};
								return (
									<Link
										key={inv.id}
										href={`/portal/${token}/invoice/${inv.id}` as any}
										className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
									>
										<div>
											<p className="font-medium text-sm">{inv.invoiceNumber}</p>
											{inv.dueDate && (
												<p className="text-muted-foreground text-xs">
													{t("due")} {format(new Date(inv.dueDate), "MMM d, yyyy")}
												</p>
											)}
										</div>
										<div className="flex items-center gap-3">
											<span className="font-medium text-sm">
												{formatCurrency(inv.total, inv.currency)}
											</span>
											<Badge variant={s.variant}>{t(`invoiceStatus.${inv.status}` as any) ?? s.label}</Badge>
										</div>
									</Link>
								);
							})}
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
