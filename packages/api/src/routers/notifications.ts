import { z } from "zod";
import { router, workspaceProcedure } from "../index";

export const notificationsRouter = router({
  getPreferences: workspaceProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.db.notificationPreference.findUnique({
      where: { workspaceId: ctx.workspace.id },
    });
    if (!prefs) {
      // Return defaults if not yet set
      return {
        workspaceId: ctx.workspace.id,
        onApproval: true,
        onRejection: true,
        onFeedback: true,
        onInvoicePaid: true,
        emailEnabled: true,
      };
    }
    return prefs;
  }),

  update: workspaceProcedure
    .input(
      z.object({
        onApproval: z.boolean().optional(),
        onRejection: z.boolean().optional(),
        onFeedback: z.boolean().optional(),
        onInvoicePaid: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notificationPreference.upsert({
        where: { workspaceId: ctx.workspace.id },
        update: input,
        create: {
          workspaceId: ctx.workspace.id,
          onApproval: input.onApproval ?? true,
          onRejection: input.onRejection ?? true,
          onFeedback: input.onFeedback ?? true,
          onInvoicePaid: input.onInvoicePaid ?? true,
          emailEnabled: input.emailEnabled ?? true,
        },
      });
    }),
});
