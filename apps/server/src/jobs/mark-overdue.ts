import prisma from "@client-pulse/db";
import { schedules } from "@trigger.dev/sdk/v3";

/**
 * Scheduled daily at 00:05 UTC.
 * Finds all SENT/VIEWED invoices whose due date has passed and marks them OVERDUE.
 */
export const markOverdueTask = schedules.task({
	id: "mark-overdue",
	cron: "5 0 * * *",
	run: async () => {
		const now = new Date();

		const overdueInvoices = await prisma.invoice.findMany({
			where: {
				status: { in: ["SENT", "VIEWED"] },
				paidAt: null,
				dueDate: { lt: now },
			},
			select: {
				id: true,
				workspaceId: true,
				projectId: true,
				invoiceNumber: true,
			},
		});

		if (overdueInvoices.length === 0) {
			return { marked: 0 };
		}

		const overdueIds = overdueInvoices.map((inv) => inv.id);

		await prisma.$transaction([
			prisma.invoice.updateMany({
				where: { id: { in: overdueIds } },
				data: { status: "OVERDUE" },
			}),
			...overdueInvoices
				.filter((inv) => inv.projectId !== null)
				.map((inv) =>
					prisma.activity.create({
						data: {
							projectId: inv.projectId as string,
							type: "INVOICE_SENT",
							actorName: "System",
							actorType: "FREELANCER",
							metadata: {
								invoiceId: inv.id,
								invoiceNumber: inv.invoiceNumber,
								event: "invoice_overdue",
							},
						},
					}),
				),
		]);

		return { marked: overdueInvoices.length };
	},
});
