import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, workspaceProcedure } from "../index";

export const teamRouter = router({
  listMembers: workspaceProcedure.query(async ({ ctx }) => {
    return ctx.db.workspaceMember.findMany({
      where: { workspaceId: ctx.workspace.id },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }),

  updateRole: workspaceProcedure
    .input(
      z.object({ memberId: z.string(), role: z.enum(["ADMIN", "MEMBER"]) }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = ctx.workspace.plan;
      if (plan === "FREE") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Upgrade to Agency plan to manage team roles.",
        });
      }
      const member = await ctx.db.workspaceMember.findFirst({
        where: { id: input.memberId, workspaceId: ctx.workspace.id },
      });
      if (!member)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found.",
        });
      if (member.role === "OWNER")
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change owner role.",
        });
      return ctx.db.workspaceMember.update({
        where: { id: input.memberId },
        data: { role: input.role },
      });
    }),

  remove: workspaceProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.workspaceMember.findFirst({
        where: { id: input.memberId, workspaceId: ctx.workspace.id },
      });
      if (!member)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found.",
        });
      if (member.role === "OWNER")
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the workspace owner.",
        });
      if (member.userId === ctx.session.user.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove yourself.",
        });
      await ctx.db.workspaceMember.delete({ where: { id: input.memberId } });
      return { success: true };
    }),
});
