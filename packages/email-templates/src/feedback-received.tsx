/** @jsxImportSource react */
import { Link, Text } from "@react-email/components";
import {
	EmailLayout,
	infoBox,
	mutedText,
	paragraph,
	primaryButton,
} from "./layout";

interface FeedbackReceivedEmailProps {
	freelancerName: string;
	clientName: string;
	projectName: string;
	threadTitle: string;
	dashboardUrl: string;
}

export function FeedbackReceivedEmail({
	freelancerName,
	clientName,
	projectName,
	threadTitle,
	dashboardUrl,
}: FeedbackReceivedEmailProps) {
	return (
		<EmailLayout
			preview={`${clientName} left feedback on "${projectName}"`}
			heading="New feedback from your client"
		>
			<Text style={paragraph}>Hi {freelancerName},</Text>
			<Text style={paragraph}>
				<strong>{clientName}</strong> left a message in the feedback thread for
				project <strong>{projectName}</strong>.
			</Text>

			<div style={infoBox}>
				<Text style={mutedText}>
					<strong>Thread:</strong> {threadTitle}
				</Text>
				<Text style={mutedText}>
					<strong>From:</strong> {clientName}
				</Text>
			</div>

			<Link href={dashboardUrl} style={primaryButton}>
				View feedback
			</Link>
		</EmailLayout>
	);
}

FeedbackReceivedEmail.PreviewProps = {
	freelancerName: "Alex",
	clientName: "Sarah",
	projectName: "Brand Identity Redesign",
	threadTitle: "Homepage layout feedback",
	dashboardUrl: "https://app.clientpulse.io/dashboard/projects/proj_123",
} satisfies FeedbackReceivedEmailProps;
