import { Link, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, infoBox, mutedText, paragraph, primaryButton } from "./layout";

interface ChangesRequestedEmailProps {
  freelancerName: string;
  clientName: string;
  projectName: string;
  deliverableName: string;
  clientNote: string | null;
  dashboardUrl: string;
}

export function ChangesRequestedEmail({
  freelancerName,
  clientName,
  projectName,
  deliverableName,
  clientNote,
  dashboardUrl,
}: ChangesRequestedEmailProps) {
  return (
    <EmailLayout
      preview={`${clientName} requested changes on "${deliverableName}"`}
      heading="Changes requested on your deliverable"
    >
      <Text style={paragraph}>Hi {freelancerName},</Text>
      <Text style={paragraph}>
        <strong>{clientName}</strong> has reviewed your deliverable for project{" "}
        <strong>{projectName}</strong> and requested some changes.
      </Text>

      <div style={infoBox}>
        <Text style={mutedText}>
          <strong>Deliverable:</strong> {deliverableName}
        </Text>
        {clientNote && (
          <Text style={mutedText}>
            <strong>Client feedback:</strong> {clientNote}
          </Text>
        )}
      </div>

      <Text style={paragraph}>
        Review their feedback and upload a revised version when ready.
      </Text>

      <Link href={dashboardUrl} style={primaryButton}>
        View project
      </Link>
    </EmailLayout>
  );
}

ChangesRequestedEmail.PreviewProps = {
  freelancerName: "Alex",
  clientName: "Sarah",
  projectName: "Brand Identity Redesign",
  deliverableName: "Logo concepts v2.pdf",
  clientNote: "The colors are too dark, can you brighten them up a bit?",
  dashboardUrl: "https://app.clientpulse.io/dashboard/projects/proj_123",
} satisfies ChangesRequestedEmailProps;
