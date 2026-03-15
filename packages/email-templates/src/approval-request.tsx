import { Link, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, infoBox, mutedText, paragraph, primaryButton } from "./layout";

interface ApprovalRequestEmailProps {
  clientName: string;
  freelancerName: string;
  projectName: string;
  deliverableName: string;
  portalUrl: string;
}

export function ApprovalRequestEmail({
  clientName,
  freelancerName,
  projectName,
  deliverableName,
  portalUrl,
}: ApprovalRequestEmailProps) {
  return (
    <EmailLayout
      preview={`New deliverable ready for your review: ${deliverableName}`}
      heading="A new deliverable is ready for review"
    >
      <Text style={paragraph}>Hi {clientName},</Text>
      <Text style={paragraph}>
        <strong>{freelancerName}</strong> has uploaded a new deliverable for
        your project <strong>{projectName}</strong> and it's waiting for your
        review.
      </Text>

      <div style={infoBox}>
        <Text style={mutedText}>
          <strong>Deliverable:</strong> {deliverableName}
        </Text>
        <Text style={mutedText}>
          <strong>Project:</strong> {projectName}
        </Text>
      </div>

      <Text style={paragraph}>
        Open your portal to review the file and either approve it or request
        changes.
      </Text>

      <Link href={portalUrl} style={primaryButton}>
        Review deliverable
      </Link>

      <Text style={mutedText}>
        This link takes you directly to your project portal.
      </Text>
    </EmailLayout>
  );
}

ApprovalRequestEmail.PreviewProps = {
  clientName: "Sarah",
  freelancerName: "Alex",
  projectName: "Brand Identity Redesign",
  deliverableName: "Logo concepts v2.pdf",
  portalUrl: "https://app.clientpulse.io/portal/abc123",
} satisfies ApprovalRequestEmailProps;
