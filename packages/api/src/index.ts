import { TRPCError, initTRPC } from "@trpc/server";

import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const workspaceProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.workspace) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No workspace found. Please create a workspace first.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      workspace: ctx.workspace,
    },
  });
});

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 2,
    maxTeamMembers: 1,
    customBranding: false,
    invoicePayments: false,
    maxFileMb: 25,
  },
  PRO: {
    maxProjects: Number.POSITIVE_INFINITY,
    maxTeamMembers: 1,
    customBranding: true,
    invoicePayments: true,
    maxFileMb: 100,
  },
  AGENCY: {
    maxProjects: Number.POSITIVE_INFINITY,
    maxTeamMembers: 10,
    customBranding: true,
    invoicePayments: true,
    maxFileMb: 500,
  },
} as const;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "application/zip",
  "application/x-figma",
] as const;
