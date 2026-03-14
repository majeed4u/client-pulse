import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, workspaceProcedure } from "../index";

export const feedbackRouter = router({
  listThreads: workspaceProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspaceId: ctx.workspace.id },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });

      return ctx.db.feedbackThread.findMany({
        where: { projectId: input.projectId },
        include: {
          _count: { select: { messages: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  getThread: workspaceProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ ctx, input }) => {
      const thread = await ctx.db.feedbackThread.findFirst({
        where: {
          id: input.threadId,
          project: { workspaceId: ctx.workspace.id },
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (!thread)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found.",
        });
      return thread;
    }),

  createThread: workspaceProcedure
    .input(
      z.object({ projectId: z.string(), title: z.string().min(1).max(200) }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspaceId: ctx.workspace.id },
      });
      if (!project)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      return ctx.db.feedbackThread.create({
        data: { projectId: input.projectId, title: input.title },
      });
    }),

  postMessage: workspaceProcedure
    .input(
      z.object({
        threadId: z.string(),
        body: z.string().min(1),
        attachments: z.array(z.url()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.feedbackThread.findFirst({
        where: {
          id: input.threadId,
          project: { workspaceId: ctx.workspace.id },
        },
      });
      if (!thread)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found.",
        });

      return ctx.db.feedbackMessage.create({
        data: {
          threadId: input.threadId,
          authorName: ctx.session.user.name,
          authorType: "FREELANCER",
          body: input.body,
          attachments: input.attachments ?? [],
        },
      });
    }),

  resolveThread: workspaceProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const thread = await ctx.db.feedbackThread.findFirst({
        where: {
          id: input.threadId,
          project: { workspaceId: ctx.workspace.id },
        },
      });
      if (!thread)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Thread not found.",
        });
      return ctx.db.feedbackThread.update({
        where: { id: input.threadId },
        data: { status: "RESOLVED" },
      });
    }),
});
