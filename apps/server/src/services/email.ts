import { env } from "@client-pulse/env/server";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  await resend.emails.send({
    from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}

export function portalInviteHtml(opts: {
  clientName: string;
  projectName: string;
  portalUrl: string;
  freelancerName: string;
}): string {
  return `
    <h2>Hi ${opts.clientName},</h2>
    <p>${opts.freelancerName} has shared a project portal with you: <strong>${opts.projectName}</strong>.</p>
    <p><a href="${opts.portalUrl}">View your project portal →</a></p>
  `;
}

export function approvalRequestHtml(opts: {
  clientName: string;
  projectName: string;
  deliverableName: string;
  portalUrl: string;
}): string {
  return `
    <h2>Hi ${opts.clientName},</h2>
    <p>A new deliverable is ready for your review: <strong>${opts.deliverableName}</strong> on project <strong>${opts.projectName}</strong>.</p>
    <p><a href="${opts.portalUrl}">Review and approve →</a></p>
  `;
}

export function invoiceSentHtml(opts: {
  clientName: string;
  invoiceNumber: string;
  total: string;
  portalUrl: string;
}): string {
  return `
    <h2>Hi ${opts.clientName},</h2>
    <p>You have a new invoice: <strong>${opts.invoiceNumber}</strong> for <strong>${opts.total}</strong>.</p>
    <p><a href="${opts.portalUrl}">View and pay invoice →</a></p>
  `;
}
