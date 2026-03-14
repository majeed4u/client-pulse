import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router, workspaceProcedure } from "../index";

export const workspaceRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z
          .string()
          .min(2)
          .max(50)
          .regex(
            /^[a-z0-9-]+$/,
            "Slug must be lowercase alphanumeric with hyphens",
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.workspaceMember.findFirst({
        where: { userId: ctx.session.user.id },
      });
      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have a workspace.",
        });
      }
      const slugTaken = await ctx.db.workspace.findUnique({
        where: { slug: input.slug },
      });
      if (slugTaken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Slug is already taken.",
        });
      }
      const workspace = await ctx.db.workspace.create({
        data: {
          name: input.name,
          slug: input.slug,
          members: {
            create: { userId: ctx.session.user.id, role: "OWNER" },
          },
        },
      });
      return workspace;
    }),

  get: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.workspace.findUnique({
      where: { id: ctx.workspace.id },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        plan: true,
        defaultCurrency: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  update: workspaceProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        slug: z
          .string()
          .min(2)
          .max(50)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        logoUrl: z.string().url().nullable().optional(),
        defaultCurrency: z.string().length(3).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.slug) {
        const taken = await ctx.db.workspace.findFirst({
          where: { slug: input.slug, id: { not: ctx.workspace.id } },
        });
        if (taken)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Slug is already taken.",
          });
      }
      return ctx.db.workspace.update({
        where: { id: ctx.workspace.id },
        data: input,
      });
    }),
});
