import prisma from "@client-pulse/db";
import { InvoiceReminderEmail } from "@client-pulse/email-templates";
import { render } from "@react-email/components";
import { schedules } from "@trigger.dev/sdk/v3";
import { sendEmail } from "../services/email";

/**
 * Scheduled daily at 09:00 UTC.
 * Finds all SENT invoices due in exactly 3 days and emails the client a reminder.
 */
export const invoiceReminderTask = schedules.task({
	id: "invoice-reminder",
	cron: "0 9 * * *",
	run: async () => {
		const threeDaysFromNow = new Date();
		threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
		threeDaysFromNow.setHours(0, 0, 0, 0);

		const dayAfter = new Date(threeDaysFromNow);
		dayAfter.setDate(dayAfter.getDate() + 1);

		const invoices = await prisma.invoice.findMany({
			where: {
				status: "SENT",
				paidAt: null,
				dueDate: {
					gte: threeDaysFromNow,
					lt: dayAfter,
				},
			},
			include: {
				client: { select: { name: true, email: true } },
				workspace: { select: { name: true } },
				project: { select: { portalToken: true } },
			},
		});

		const webUrl =
			process.env["NEXT_PUBLIC_WEB_URL"] ?? "http://localhost:3001";

		for (const invoice of invoices) {
			if (!invoice.dueDate) continue;

			const portalUrl = invoice.project?.portalToken
				? `${webUrl}/portal/${invoice.project.portalToken}`
				: webUrl;

			const html = await render(
				InvoiceReminderEmail({
					clientName: invoice.client.name,
					freelancerName: invoice.workspace.name,
					invoiceNumber: invoice.invoiceNumber,
					amount: formatCurrency(invoice.total, invoice.currency),
					dueDate: invoice.dueDate.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					daysUntilDue: 3,
					portalUrl,
				}),
			);

			await sendEmail({
				to: invoice.client.email,
				subject: `Reminder: Invoice ${invoice.invoiceNumber} is due in 3 days`,
				html,
			});
		}

		return { processed: invoices.length };
	},
});

function formatCurrency(cents: number, currency: string): string {
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
		}).format(cents / 100);
	} catch {
		return `${currency} ${(cents / 100).toFixed(2)}`;
	}
}
