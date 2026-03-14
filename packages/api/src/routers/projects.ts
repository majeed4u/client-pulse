import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PLAN_LIMITS, router, workspaceProcedure } from "../index";

export const projectsRouter = router({
  list: workspaceProcedure
    .input(
      z
        .object({
          status: z
            .enum(["ACTIVE", "COMPLETED", "ARCHIVED", "ON_HOLD"])
            .optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findMany({
        where: {
          workspaceId: ctx.workspace.id,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.search
            ? { name: { contains: input.search, mode: "insensitive" } }
            : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          portalToken: true,
          portalEnabled: true,
          deadline: true,
          createdAt: true,
          client: {
            select: { id: true, name: true, email: true, company: true },
          },
          _count: { select: { deliverables: true, invoices: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
        include: {
          client: {
            select: { id: true, name: true, email: true, company: true },
          },
          deliverables: {
            include: { versions: { orderBy: { versionNumber: "desc" } } },
            orderBy: { createdAt: "asc" },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: { select: { invoices: true } },
        },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      return project;
    }),

  create: workspaceProcedure
    .input(
      z.object({
        clientId: z.string(),
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        deadline: z.coerce.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = ctx.workspace.plan;
      const limit = PLAN_LIMITS[plan].maxProjects;
      if (limit !== Number.POSITIVE_INFINITY) {
        const count = await ctx.db.project.count({
          where: { workspaceId: ctx.workspace.id, status: { not: "ARCHIVED" } },
        });
        if (count >= limit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Your ${plan} plan allows a maximum of ${limit} active projects. Upgrade to Pro for unlimited projects.`,
          });
        }
      }
      const client = await ctx.db.client.findFirst({
        where: { id: input.clientId, workspaceId: ctx.workspace.id },
      });
      if (!client)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found.",
        });

      return ctx.db.project.create({
        data: {
          workspaceId: ctx.workspace.id,
          clientId: input.clientId,
          name: input.name,
          description: input.description,
          deadline: input.deadline,
          activities: {
            create: {
              type: "PROJECT_CREATED",
              actorName: ctx.session.user.name,
              actorType: "FREELANCER",
            },
          },
        },
      });
    }),

  update: workspaceProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().nullable().optional(),
        status: z
          .enum(["ACTIVE", "COMPLETED", "ARCHIVED", "ON_HOLD"])
          .optional(),
        deadline: z.coerce.date().nullable().optional(),
        portalEnabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const project = await ctx.db.project.findFirst({
        where: { id, workspaceId: ctx.workspace.id },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      return ctx.db.project.update({ where: { id }, data });
    }),

  archive: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      return ctx.db.project.update({
        where: { id: input.id },
        data: { status: "ARCHIVED" },
      });
    }),

  regenerateToken: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, workspaceId: ctx.workspace.id },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      const { randomBytes } = await import("node:crypto");
      const newToken = randomBytes(16).toString("hex");
      return ctx.db.project.update({
        where: { id: input.id },
        data: { portalToken: newToken },
      });
    }),
});
