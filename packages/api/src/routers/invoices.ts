import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PLAN_LIMITS, router, workspaceProcedure } from "../index";

const lineItemSchema = z.object({
	description: z.string().min(1),
	quantity: z.number().positive(),
	unitPrice: z.number().nonnegative(),
});

function computeTotals(
	lineItems: Array<{ quantity: number; unitPrice: number }>,
	taxPercent: number,
) {
	const subtotal = Math.round(
		lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
	);
	const taxAmount = Math.round(subtotal * (taxPercent / 100));
	const total = subtotal + taxAmount;
	return { subtotal, taxAmount, total };
}

export const invoicesRouter = router({
	list: workspaceProcedure
		.input(
			z
				.object({
					status: z
						.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"])
						.optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			return ctx.db.invoice.findMany({
				where: {
					workspaceId: ctx.workspace.id,
					...(input?.status ? { status: input.status } : {}),
				},
				select: {
					id: true,
					invoiceNumber: true,
					status: true,
					currency: true,
					total: true,
					dueDate: true,
					paidAt: true,
					createdAt: true,
					client: { select: { id: true, name: true, email: true } },
					project: { select: { id: true, name: true } },
				},
				orderBy: { createdAt: "desc" },
			});
		}),

	get: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const invoice = await ctx.db.invoice.findFirst({
				where: { id: input.id, workspaceId: ctx.workspace.id },
				include: {
					client: {
						select: { id: true, name: true, email: true, company: true },
					},
					project: { select: { id: true, name: true } },
				},
			});
			if (!invoice)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found.",
				});
			return invoice;
		}),

	create: workspaceProcedure
		.input(
			z.object({
				clientId: z.string(),
				projectId: z.string().optional(),
				currency: z.string().length(3).default("USD"),
				lineItems: z.array(lineItemSchema).min(1),
				taxPercent: z.number().min(0).max(100).default(0),
				dueDate: z.coerce.date().optional(),
				notes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const client = await ctx.db.client.findFirst({
				where: { id: input.clientId, workspaceId: ctx.workspace.id },
			});
			if (!client)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Client not found.",
				});

			const count = await ctx.db.invoice.count({
				where: { workspaceId: ctx.workspace.id },
			});
			const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;

			const { subtotal, taxAmount, total } = computeTotals(
				input.lineItems,
				input.taxPercent,
			);

			return ctx.db.invoice.create({
				data: {
					workspaceId: ctx.workspace.id,
					clientId: input.clientId,
					projectId: input.projectId,
					invoiceNumber,
					currency: input.currency,
					lineItems: input.lineItems,
					subtotal,
					taxPercent: input.taxPercent,
					taxAmount,
					total,
					dueDate: input.dueDate,
					notes: input.notes,
				},
			});
		}),

	update: workspaceProcedure
		.input(
			z.object({
				id: z.string(),
				lineItems: z.array(lineItemSchema).min(1).optional(),
				taxPercent: z.number().min(0).max(100).optional(),
				dueDate: z.coerce.date().nullable().optional(),
				notes: z.string().nullable().optional(),
				currency: z.string().length(3).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, lineItems, taxPercent, ...rest } = input;
			const invoice = await ctx.db.invoice.findFirst({
				where: { id, workspaceId: ctx.workspace.id },
			});
			if (!invoice)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found.",
				});
			if (invoice.status !== "DRAFT")
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Only draft invoices can be edited.",
				});

			const items =
				lineItems ??
				(invoice.lineItems as Array<{ quantity: number; unitPrice: number }>);
			const percent = taxPercent ?? invoice.taxPercent;
			const { subtotal, taxAmount, total } = computeTotals(items, percent);

			return ctx.db.invoice.update({
				where: { id },
				data: {
					...rest,
					lineItems: items,
					taxPercent: percent,
					subtotal,
					taxAmount,
					total,
				},
			});
		}),

	send: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const plan = ctx.workspace.plan;
			if (!PLAN_LIMITS[plan].invoicePayments) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Upgrade to Pro to enable invoice payments.",
				});
			}
			const invoice = await ctx.db.invoice.findFirst({
				where: { id: input.id, workspaceId: ctx.workspace.id },
			});
			if (!invoice)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found.",
				});
			if (invoice.status !== "DRAFT")
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invoice is not a draft.",
				});

			// Stripe Payment Link creation is handled in the server service layer
			return ctx.db.invoice.update({
				where: { id: input.id },
				data: { status: "SENT" },
			});
		}),

	markPaid: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const invoice = await ctx.db.invoice.findFirst({
				where: { id: input.id, workspaceId: ctx.workspace.id },
			});
			if (!invoice)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found.",
				});
			if (invoice.status === "PAID")
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invoice is already paid.",
				});

			return ctx.db.$transaction([
				ctx.db.invoice.update({
					where: { id: input.id },
					data: { status: "PAID", paidAt: new Date() },
				}),
				...(invoice.projectId
					? [
							ctx.db.activity.create({
								data: {
									projectId: invoice.projectId,
									type: "INVOICE_PAID",
									actorName: ctx.session.user.name,
									actorType: "FREELANCER",
									metadata: { invoiceNumber: invoice.invoiceNumber },
								},
							}),
						]
					: []),
			]);
		}),

	cancel: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const invoice = await ctx.db.invoice.findFirst({
				where: { id: input.id, workspaceId: ctx.workspace.id },
			});
			if (!invoice)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found.",
				});
			if (invoice.status === "PAID")
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot cancel a paid invoice.",
				});
			return ctx.db.invoice.update({
				where: { id: input.id },
				data: { status: "CANCELLED" },
			});
		}),

	generatePdf: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.pdf) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "PDF service is not available.",
				});
			}
			const invoice = await ctx.db.invoice.findFirst({
				where: { id: input.id, workspaceId: ctx.workspace.id },
				include: {
					client: { select: { name: true, email: true, company: true } },
					workspace: { select: { name: true } },
				},
			});
			if (!invoice)
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found.",
				});

			const lineItems = invoice.lineItems as Array<{
				description: string;
				quantity: number;
				unitPrice: number;
			}>;

			const { pdfKey, pdfUrl } = await ctx.pdf.generateAndUploadInvoicePdf(
				invoice.id,
				{
					invoiceNumber: invoice.invoiceNumber,
					workspaceName: invoice.workspace.name,
					clientName: invoice.client.name,
					clientEmail: invoice.client.email,
					clientCompany: invoice.client.company,
					currency: invoice.currency,
					lineItems,
					subtotal: invoice.subtotal,
					taxPercent: invoice.taxPercent,
					taxAmount: invoice.taxAmount,
					total: invoice.total,
					dueDate: invoice.dueDate,
					issuedDate: invoice.createdAt,
					notes: invoice.notes,
				},
			);

			await ctx.db.invoice.update({
				where: { id: invoice.id },
				data: { pdfKey },
			});

			return { pdfUrl };
		}),
});
