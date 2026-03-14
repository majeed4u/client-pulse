import prisma from "@client-pulse/db";
import { Hono } from "hono";

export const portalRoutes = new Hono();

// Validate token helper
async function getProjectByToken(token: string) {
  return prisma.project.findUnique({
    where: { portalToken: token },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      workspace: {
        select: { id: true, name: true, logoUrl: true, plan: true },
      },
    },
  });
}

// GET /portal/:token — full portal payload
portalRoutes.get("/:token", async (c) => {
  const token = c.req.param("token");
  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const [deliverables, threads, invoices] = await Promise.all([
    prisma.deliverable.findMany({
      where: { projectId: project.id },
      include: { versions: { orderBy: { versionNumber: "desc" } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.feedbackThread.findMany({
      where: { projectId: project.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { projectId: project.id, status: { not: "DRAFT" } },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        currency: true,
        dueDate: true,
        stripePaymentLinkUrl: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return c.json({ project, deliverables, threads, invoices });
});

// POST /portal/:token/view — log CLIENT_VIEWED_PORTAL
portalRoutes.post("/:token/view", async (c) => {
  const token = c.req.param("token");
  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: "CLIENT_VIEWED_PORTAL",
      actorName: project.client.name,
      actorType: "CLIENT",
    },
  });

  return c.json({ success: true });
});

// POST /portal/:token/deliverables/:versionId/approve
portalRoutes.post("/:token/deliverables/:versionId/approve", async (c) => {
  const token = c.req.param("token");
  const versionId = c.req.param("versionId");

  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const version = await prisma.deliverableVersion.findFirst({
    where: { id: versionId, deliverable: { projectId: project.id } },
    include: { deliverable: true },
  });
  if (!version)
    return c.json(
      {
        error: { code: "NOT_FOUND", message: "Deliverable version not found." },
      },
      404,
    );

  await prisma.$transaction([
    prisma.deliverableVersion.update({
      where: { id: versionId },
      data: { approvedAt: new Date() },
    }),
    prisma.deliverable.update({
      where: { id: version.deliverableId },
      data: { status: "APPROVED" },
    }),
    prisma.activity.create({
      data: {
        projectId: project.id,
        type: "DELIVERABLE_APPROVED",
        actorName: project.client.name,
        actorType: "CLIENT",
        metadata: { deliverableName: version.deliverable.name },
      },
    }),
  ]);

  return c.json({ success: true });
});

// POST /portal/:token/deliverables/:versionId/reject
portalRoutes.post("/:token/deliverables/:versionId/reject", async (c) => {
  const token = c.req.param("token");
  const versionId = c.req.param("versionId");

  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const body = await c.req.json<{ note?: string }>();
  const version = await prisma.deliverableVersion.findFirst({
    where: { id: versionId, deliverable: { projectId: project.id } },
    include: { deliverable: true },
  });
  if (!version)
    return c.json(
      {
        error: { code: "NOT_FOUND", message: "Deliverable version not found." },
      },
      404,
    );

  await prisma.$transaction([
    prisma.deliverableVersion.update({
      where: { id: versionId },
      data: { rejectedAt: new Date(), clientNote: body.note ?? null },
    }),
    prisma.deliverable.update({
      where: { id: version.deliverableId },
      data: { status: "CHANGES_REQUESTED" },
    }),
    prisma.activity.create({
      data: {
        projectId: project.id,
        type: "DELIVERABLE_REJECTED",
        actorName: project.client.name,
        actorType: "CLIENT",
        metadata: {
          deliverableName: version.deliverable.name,
          note: body.note,
        },
      },
    }),
  ]);

  return c.json({ success: true });
});

// GET /portal/:token/feedback
portalRoutes.get("/:token/feedback", async (c) => {
  const token = c.req.param("token");
  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const threads = await prisma.feedbackThread.findMany({
    where: { projectId: project.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return c.json({ threads });
});

// POST /portal/:token/feedback/:threadId/messages
portalRoutes.post("/:token/feedback/:threadId/messages", async (c) => {
  const token = c.req.param("token");
  const threadId = c.req.param("threadId");

  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const thread = await prisma.feedbackThread.findFirst({
    where: { id: threadId, projectId: project.id },
  });
  if (!thread)
    return c.json(
      { error: { code: "NOT_FOUND", message: "Thread not found." } },
      404,
    );

  const body = await c.req.json<{ body: string }>();
  if (!body.body?.trim())
    return c.json(
      { error: { code: "BAD_REQUEST", message: "Message body is required." } },
      400,
    );

  const message = await prisma.feedbackMessage.create({
    data: {
      threadId,
      authorName: project.client.name,
      authorType: "CLIENT",
      body: body.body,
      attachments: [],
    },
  });

  await prisma.feedbackThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });
  await prisma.activity.create({
    data: {
      projectId: project.id,
      type: "FEEDBACK_LEFT",
      actorName: project.client.name,
      actorType: "CLIENT",
      metadata: { threadTitle: thread.title },
    },
  });

  return c.json({ message });
});

// GET /portal/:token/invoice/:invoiceId
portalRoutes.get("/:token/invoice/:invoiceId", async (c) => {
  const token = c.req.param("token");
  const invoiceId = c.req.param("invoiceId");

  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, projectId: project.id },
  });
  if (!invoice)
    return c.json(
      { error: { code: "NOT_FOUND", message: "Invoice not found." } },
      404,
    );

  return c.json({ invoice });
});

// POST /portal/:token/invoice/:invoiceId/view — mark VIEWED
portalRoutes.post("/:token/invoice/:invoiceId/view", async (c) => {
  const token = c.req.param("token");
  const invoiceId = c.req.param("invoiceId");

  const project = await getProjectByToken(token);
  if (!project || !project.portalEnabled) {
    return c.json(
      {
        error: {
          code: "TOKEN_INVALID",
          message: "Portal link is invalid or expired.",
        },
      },
      401,
    );
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, projectId: project.id },
  });
  if (!invoice)
    return c.json(
      { error: { code: "NOT_FOUND", message: "Invoice not found." } },
      404,
    );

  if (invoice.status === "SENT") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "VIEWED" },
    });
  }

  return c.json({ success: true });
});
