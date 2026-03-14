import { auth } from "@client-pulse/auth";
import prisma from "@client-pulse/db";
import type { Context as HonoContext } from "hono";

export type StorageService = {
	getPresignedUploadUrl: (
		fileKey: string,
		mimeType: string,
		expiresIn?: number,
	) => Promise<string>;
	getPublicUrl: (fileKey: string) => string;
};

export type CreateContextOptions = {
	context: HonoContext;
	storage?: StorageService;
};

export async function createContext({
	context,
	storage,
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
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
