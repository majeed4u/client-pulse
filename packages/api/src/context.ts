import { auth } from "@client-pulse/auth";
import prisma from "@client-pulse/db";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
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
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
