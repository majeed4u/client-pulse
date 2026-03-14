import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  ALLOWED_MIME_TYPES,
  PLAN_LIMITS,
  router,
  workspaceProcedure,
} from "../index";

export const deliverablesRouter = router({
  list: workspaceProcedure
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

      return ctx.db.deliverable.findMany({
        where: { projectId: input.projectId },
        include: { versions: { orderBy: { versionNumber: "desc" } } },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: workspaceProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1).max(200),
        description: z.string().optional(),
      }),
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
      return ctx.db.deliverable.create({
        data: {
          projectId: input.projectId,
          name: input.name,
          description: input.description,
        },
      });
    }),

  presignUpload: workspaceProcedure
    .input(
      z.object({
        deliverableId: z.string(),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        fileSize: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deliverable = await ctx.db.deliverable.findFirst({
        where: {
          id: input.deliverableId,
          project: { workspaceId: ctx.workspace.id },
        },
      });
      if (!deliverable)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found.",
        });

      if (
        !ALLOWED_MIME_TYPES.includes(
          input.mimeType as (typeof ALLOWED_MIME_TYPES)[number],
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File type not allowed.",
        });
      }

      const plan = ctx.workspace.plan;
      const maxBytes = PLAN_LIMITS[plan].maxFileMb * 1024 * 1024;
      if (input.fileSize > maxBytes) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File too large. Your plan allows up to ${PLAN_LIMITS[plan].maxFileMb}MB.`,
        });
      }

      const ext = input.fileName.split(".").pop() ?? "bin";
      const fileKey = `deliverables/${input.deliverableId}/${Date.now()}.${ext}`;

      // Return the fileKey — actual presigned URL generation happens in the server service layer
      // The frontend will call a REST endpoint or we return a mock here for now
      return { fileKey, fileName: input.fileName, mimeType: input.mimeType };
    }),

  confirmUpload: workspaceProcedure
    .input(
      z.object({
        deliverableId: z.string(),
        fileKey: z.string().min(1),
        fileUrl: z.string().url(),
        fileName: z.string().min(1),
        fileSize: z.number().positive(),
        mimeType: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deliverable = await ctx.db.deliverable.findFirst({
        where: {
          id: input.deliverableId,
          project: { workspaceId: ctx.workspace.id },
        },
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      });
      if (!deliverable)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found.",
        });

      const nextVersion = (deliverable.versions[0]?.versionNumber ?? 0) + 1;

      const [version] = await ctx.db.$transaction([
        ctx.db.deliverableVersion.create({
          data: {
            deliverableId: input.deliverableId,
            versionNumber: nextVersion,
            fileUrl: input.fileUrl,
            fileKey: input.fileKey,
            fileName: input.fileName,
            fileSize: input.fileSize,
            mimeType: input.mimeType,
          },
        }),
        ctx.db.deliverable.update({
          where: { id: input.deliverableId },
          data: { status: "PENDING_REVIEW" },
        }),
        ctx.db.activity.create({
          data: {
            projectId: deliverable.projectId,
            type: "DELIVERABLE_UPLOADED",
            actorName: ctx.session.user.name,
            actorType: "FREELANCER",
            metadata: {
              deliverableName: deliverable.name,
              version: nextVersion,
            },
          },
        }),
      ]);

      return version;
    }),

  delete: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deliverable = await ctx.db.deliverable.findFirst({
        where: { id: input.id, project: { workspaceId: ctx.workspace.id } },
      });
      if (!deliverable)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Deliverable not found.",
        });
      await ctx.db.deliverable.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
