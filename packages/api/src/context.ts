import { auth } from "@client-pulse/auth";
import prisma from "@client-pulse/db";
import type { Context as HonoContext } from "hono";

export type StorageService = {
	getPresignedUploadUrl: (
		fileKey: string,
		mimeType: string,
		expiresIn?: number,
	) => Promise<string>;
};

export type PdfService = {
	generateAndUploadInvoicePdf: (
		invoiceId: string,
		data: {
			invoiceNumber: string;
			workspaceName: string;
			clientName: string;
			clientEmail: string;
			clientCompany?: string | null;
			currency: string;
			lineItems: Array<{
				description: string;
				quantity: number;
				unitPrice: number;
			}>;
			subtotal: number;
			taxPercent: number;
			taxAmount: number;
			total: number;
			dueDate?: Date | null;
			issuedDate: Date;
			notes?: string | null;
		},
	) => Promise<{ pdfKey: string; pdfUrl: string }>;
};

export type CreateContextOptions = {
	context: HonoContext;
	storage?: StorageService;
	pdf?: PdfService;
};

export async function createContext({
	context,
	storage,
	pdf,
}: CreateContextOptions) {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});

	let workspace = null;
	if (session?.user?.id) {
		const member = await prisma.workspaceMember.findFirst({
			where: { userId: session.user.id },
			include: { workspace: true },
			orderBy: { createdAt: "asc" },
		});
		workspace = member?.workspace ?? null;
	}

	return {
		session,
		db: prisma,
		workspace,
		storage: storage ?? null,
		pdf: pdf ?? null,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
