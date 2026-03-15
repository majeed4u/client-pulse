import prisma from "@client-pulse/db";
import { ApprovalRequestEmail } from "@client-pulse/email-templates";
import { render } from "@react-email/components";
import { task } from "@trigger.dev/sdk/v3";
import { sendEmail } from "../services/email";

interface SendApprovalRequestPayload {
	projectId: string;
	deliverableId: string;
	versionId: string;
}

/**
 * On-demand task triggered after a freelancer confirms a deliverable upload.
 * Sends an approval-request email to the project's client.
 */
export const sendApprovalRequestTask = task({
	id: "send-approval-request",
	run: async (payload: SendApprovalRequestPayload) => {
		const { projectId, deliverableId, versionId } = payload;

		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				client: { select: { name: true, email: true } },
				workspace: { select: { name: true } },
				deliverables: {
					where: { id: deliverableId },
					include: {
						versions: {
							where: { id: versionId },
							select: { fileName: true },
						},
					},
				},
			},
		});

		if (!project || !project.client || !project.deliverables[0]) {
			return { sent: false, reason: "project_or_deliverable_not_found" };
		}

		const deliverable = project.deliverables[0];
		const webUrl =
			process.env["NEXT_PUBLIC_WEB_URL"] ?? "http://localhost:3001";
		const portalUrl = `${webUrl}/portal/${project.portalToken}`;

		const html = await render(
			ApprovalRequestEmail({
				clientName: project.client.name,
				freelancerName: project.workspace.name,
				projectName: project.name,
				deliverableName: deliverable.name,
				portalUrl,
			}),
		);

		await sendEmail({
			to: project.client.email,
			subject: `New deliverable ready for review: ${deliverable.name}`,
			html,
		});

		return { sent: true };
	},
});
