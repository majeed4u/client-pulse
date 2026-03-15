import { Link, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, infoBox, mutedText, paragraph, primaryButton } from "./layout";

interface ApprovalReceivedEmailProps {
  freelancerName: string;
  clientName: string;
  projectName: string;
  deliverableName: string;
  dashboardUrl: string;
}

export function ApprovalReceivedEmail({
  freelancerName,
  clientName,
  projectName,
  deliverableName,
  dashboardUrl,
}: ApprovalReceivedEmailProps) {
  return (
    <EmailLayout
      preview={`${clientName} approved "${deliverableName}" ✅`}
      heading="Your deliverable has been approved! ✅"
    >
      <Text style={paragraph}>Hi {freelancerName},</Text>
      <Text style={paragraph}>
        Great news — <strong>{clientName}</strong> has approved your deliverable
        for project <strong>{projectName}</strong>.
      </Text>

      <div style={infoBox}>
        <Text style={mutedText}>
          <strong>Deliverable:</strong> {deliverableName}
        </Text>
        <Text style={mutedText}>
          <strong>Approved by:</strong> {clientName}
        </Text>
      </div>

      <Link href={dashboardUrl} style={primaryButton}>
        View project
      </Link>
    </EmailLayout>
  );
}

ApprovalReceivedEmail.PreviewProps = {
  freelancerName: "Alex",
  clientName: "Sarah",
  projectName: "Brand Identity Redesign",
  deliverableName: "Logo concepts v2.pdf",
  dashboardUrl: "https://app.clientpulse.io/dashboard/projects/proj_123",
} satisfies ApprovalReceivedEmailProps;
