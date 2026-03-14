import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, workspaceProcedure } from "../index";

export const clientsRouter = router({
  list: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.client.findMany({
      where: { workspaceId: ctx.workspace.id },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
        createdAt: true,
        _count: { select: { projects: true, invoices: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  get: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.db.client.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
        include: {
          projects: {
            select: { id: true, name: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true,
              currency: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      if (!client)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found.",
        });
      return client;
    }),

  create: workspaceProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        email: z.email(),
        company: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.client.findUnique({
        where: {
          workspaceId_email: {
            workspaceId: ctx.workspace.id,
            email: input.email,
          },
        },
      });
      if (exists)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A client with this email already exists.",
        });
      return ctx.db.client.create({
        data: { ...input, workspaceId: ctx.workspace.id },
      });
    }),

  update: workspaceProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        email: z.email().optional(),
        company: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const client = await ctx.db.client.findFirst({
        where: { id, workspaceId: ctx.workspace.id },
      });
      if (!client)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found.",
        });
      return ctx.db.client.update({ where: { id }, data });
    }),

  delete: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.db.client.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
        include: { projects: { where: { status: "ACTIVE" } } },
      });
      if (!client)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found.",
        });
      if (client.projects.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete client with active projects.",
        });
      }
      await ctx.db.client.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
