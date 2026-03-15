/** @jsxImportSource react */
import { Link, Text } from "@react-email/components";
import {
	EmailLayout,
	infoBox,
	mutedText,
	paragraph,
	primaryButton,
} from "./layout";

interface PortalInviteEmailProps {
	clientName: string;
	freelancerName: string;
	projectName: string;
	portalUrl: string;
}

export function PortalInviteEmail({
	clientName,
	freelancerName,
	projectName,
	portalUrl,
}: PortalInviteEmailProps) {
	return (
		<EmailLayout
			preview={`${freelancerName} shared "${projectName}" with you on ClientPulse`}
			heading={`You've been invited to review "${projectName}"`}
		>
			<Text style={paragraph}>Hi {clientName},</Text>
			<Text style={paragraph}>
				<strong>{freelancerName}</strong> has set up a dedicated portal for your
				project <strong>{projectName}</strong>. You can review deliverables,
				leave feedback, and track invoices — all in one place.
			</Text>

			<div style={infoBox}>
				<Text style={mutedText}>
					No account needed. Just open the link below to access your portal.
				</Text>
			</div>

			<Link href={portalUrl} style={primaryButton}>
				Open your project portal
			</Link>

			<Text style={mutedText}>
				Bookmark this link — it's your permanent access to the project.
			</Text>
		</EmailLayout>
	);
}

PortalInviteEmail.PreviewProps = {
	clientName: "Sarah",
	freelancerName: "Alex",
	projectName: "Brand Identity Redesign",
	portalUrl: "https://app.clientpulse.io/portal/abc123",
} satisfies PortalInviteEmailProps;
